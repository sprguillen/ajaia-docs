"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import DocumentList from "@/components/DocumentList";
import UserSwitcher from "@/components/UserSwitcher";
import { getStoredUserId, setStoredUserId } from "@/lib/current-user";
import {
  getFileExtension,
  getImportValidationError,
  textToTipTapDocument,
} from "@/lib/import";
import { createDocument, getDocumentsForUser, getUsers } from "@/lib/supabase";
import type { DocumentSummary, User, UserId } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<UserId | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [documentsUserId, setDocumentsUserId] = useState<UserId | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    getUsers().then((fetchedUsers) => {
      if (!isMounted) return;

      const storedUserId = getStoredUserId();
      const initialUserId =
        fetchedUsers.find((user) => user.id === storedUserId)?.id ??
        fetchedUsers[0]?.id ??
        null;

      setUsers(fetchedUsers);
      setCurrentUserId(initialUserId);
      setIsLoadingUsers(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    let isMounted = true;

    getDocumentsForUser(currentUserId).then((fetchedDocuments) => {
      if (!isMounted) return;
      setDocuments(fetchedDocuments);
      setDocumentsUserId(currentUserId);
    });

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  const isLoadingDocuments =
    currentUserId !== null && documentsUserId !== currentUserId;

  const handleUserChange = useCallback((userId: UserId) => {
    setCurrentUserId(userId);
    setStoredUserId(userId);
  }, []);

  const handleNewDocument = useCallback(async () => {
    if (!currentUserId) return;

    setIsCreating(true);
    try {
      const document = await createDocument(currentUserId);
      router.push(`/documents/${document.id}`);
    } finally {
      setIsCreating(false);
    }
  }, [currentUserId, router]);

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !currentUserId) return;

    const validationError = getImportValidationError(file);
    if (validationError) {
      setImportError(validationError);
      return;
    }

    setImportError(null);
    setIsImporting(true);
    try {
      const text = await file.text();
      const extension = getFileExtension(file.name);
      const title = file.name.slice(0, -extension.length) || "Untitled Document";
      const document = await createDocument(currentUserId, {
        title,
        content: textToTipTapDocument(text),
      });
      router.push(`/documents/${document.id}`);
    } catch {
      setImportError("Something went wrong importing that file.");
    } finally {
      setIsImporting(false);
    }
  };

  const myDocuments = documents.filter((document) => document.access === "owner");
  const sharedDocuments = documents.filter(
    (document) => document.access === "shared"
  );

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-black/8 dark:border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Ajaia Docs
          </h1>
          <UserSwitcher
            users={users}
            currentUserId={currentUserId}
            onChange={handleUserChange}
            isLoading={isLoadingUsers}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            My Documents
          </h2>
          <div className="flex shrink-0 items-start gap-2">
            <div className="flex flex-col items-start gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!currentUserId || isImporting}
                className="rounded-full border border-black/10 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                {isImporting ? "Importing…" : "Import File"}
              </button>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Supported formats: .txt, .md
              </span>
            </div>
            <button
              type="button"
              onClick={handleNewDocument}
              disabled={!currentUserId || isCreating}
              className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {isCreating ? "Creating…" : "+ New Document"}
            </button>
          </div>
        </div>
        {importError && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">
            {importError}
          </p>
        )}
        <DocumentList
          documents={myDocuments}
          users={users}
          isLoading={isLoadingDocuments}
          emptyMessage="You haven't created any documents yet."
        />

        <h2 className="mb-6 mt-12 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Shared With Me
        </h2>
        <DocumentList
          documents={sharedDocuments}
          users={users}
          isLoading={isLoadingDocuments}
          emptyMessage="No documents have been shared with you yet."
        />
      </main>
    </div>
  );
}
