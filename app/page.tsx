"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DocumentList from "@/components/DocumentList";
import UserSwitcher from "@/components/UserSwitcher";
import { getStoredUserId, setStoredUserId } from "@/lib/current-user";
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            My Documents
          </h2>
          <button
            type="button"
            onClick={handleNewDocument}
            disabled={!currentUserId || isCreating}
            className="shrink-0 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {isCreating ? "Creating…" : "+ New Document"}
          </button>
        </div>
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
