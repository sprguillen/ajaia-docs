"use client";

import { useEffect, useState } from "react";
import {
  getDocumentShares,
  shareDocument,
  unshareDocument,
} from "@/lib/supabase";
import type { DocumentId, User, UserId } from "@/lib/types";

interface ShareDialogProps {
  documentId: DocumentId;
  ownerId: UserId;
  users: User[];
  onClose: () => void;
}

export default function ShareDialog({
  documentId,
  ownerId,
  users,
  onClose,
}: ShareDialogProps) {
  const [sharedUserIds, setSharedUserIds] = useState<Set<UserId> | null>(
    null
  );
  const [pendingUserId, setPendingUserId] = useState<UserId | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDocumentShares(documentId).then((sharedUsers) => {
      if (!isMounted) return;
      setSharedUserIds(new Set(sharedUsers.map((user) => user.id)));
    });

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleToggle = async (userId: UserId, hasAccess: boolean) => {
    setPendingUserId(userId);
    try {
      if (hasAccess) {
        await unshareDocument(documentId, userId);
        setSharedUserIds((prev) => {
          const next = new Set(prev ?? []);
          next.delete(userId);
          return next;
        });
      } else {
        await shareDocument(documentId, userId);
        setSharedUserIds((prev) => new Set(prev ?? []).add(userId));
      }
    } finally {
      setPendingUserId(null);
    }
  };

  const otherUsers = users.filter((user) => user.id !== ownerId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share document"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-black/8 bg-white p-5 shadow-lg dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Share document
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            ✕
          </button>
        </div>

        {sharedUserIds === null ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading…
          </p>
        ) : otherUsers.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No other users to share with.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {otherUsers.map((user) => {
              const hasAccess = sharedUserIds.has(user.id);
              const isPending = pendingUserId === user.id;

              return (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-black/8 px-3 py-2 dark:border-white/10"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                      {user.name}
                    </span>
                    {hasAccess && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Has access
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggle(user.id, hasAccess)}
                    className={
                      hasAccess
                        ? "shrink-0 rounded-full border border-black/8 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        : "shrink-0 rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    }
                  >
                    {isPending ? "…" : hasAccess ? "Remove" : "Share"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
