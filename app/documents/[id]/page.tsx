"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import { getStoredUserId } from "@/lib/current-user";
import { getDocumentById, updateDocument } from "@/lib/supabase";
import type { TipTapDocument } from "@/lib/types";

type LoadResult =
  | { status: "denied" }
  | { status: "ready"; content: TipTapDocument };
type SaveStatus = "idle" | "saving" | "saved";

const AUTOSAVE_DELAY_MS = 750;

export default function DocumentPage({
  params,
}: PageProps<"/documents/[id]">) {
  const { id: documentId } = use(params);

  const [loadResult, setLoadResult] = useState<LoadResult | null>(null);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Holds the latest edited content for autosave. Only ever written from
  // event handlers/callbacks and read from event handlers/timeouts — never
  // during render, since the initial editor content comes from `loadResult`
  // (state) instead.
  const latestContentRef = useRef<TipTapDocument | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    const userId = getStoredUserId();
    const load = userId
      ? getDocumentById(documentId, userId)
      : Promise.resolve(null);

    load.then((document) => {
      if (!isMounted) return;

      if (!document) {
        setLoadResult({ status: "denied" });
        return;
      }

      setTitle(document.title);
      latestContentRef.current = document.content;
      setLoadResult({ status: "ready", content: document.content });
    });

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const scheduleSave = useCallback(
    (nextTitle: string, nextContent: TipTapDocument) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      setSaveStatus("saving");
      saveTimeoutRef.current = setTimeout(() => {
        updateDocument(documentId, {
          title: nextTitle,
          content: nextContent,
        }).then(() => setSaveStatus("saved"));
      }, AUTOSAVE_DELAY_MS);
    },
    [documentId]
  );

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTitle(value);
    if (latestContentRef.current) scheduleSave(value, latestContentRef.current);
  };

  const handleContentChange = (json: TipTapDocument) => {
    latestContentRef.current = json;
    scheduleSave(title, json);
  };

  if (!loadResult) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading…
      </div>
    );
  }

  if (loadResult.status === "denied") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Document not found
        </h1>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          This document doesn&apos;t exist, or you don&apos;t have access to
          it.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-zinc-950 underline dark:text-zinc-50"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-black/8 dark:border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Dashboard
          </Link>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && "Saved ✓"}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Document"
          className="w-full border-b border-black/8 bg-transparent pb-2 text-3xl font-semibold text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-black/20 dark:border-white/10 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white/25"
        />
        <RichTextEditor
          content={loadResult.content}
          onChange={handleContentChange}
        />
      </main>
    </div>
  );
}
