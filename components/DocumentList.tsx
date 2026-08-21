import Link from "next/link";
import type { DocumentSummary, User } from "@/lib/types";

interface DocumentListProps {
  documents: DocumentSummary[];
  users: User[];
  isLoading?: boolean;
  emptyMessage: string;
}

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DocumentList({
  documents,
  users,
  isLoading,
  emptyMessage,
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="h-28 animate-pulse rounded-xl border border-black/6 bg-zinc-100 dark:border-white/8 dark:bg-zinc-900"
          />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/10 px-4 py-8 text-center text-sm text-zinc-500 dark:border-white/12 dark:text-zinc-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => {
        const owner = users.find((user) => user.id === document.ownerId);

        return (
          <Link
            key={document.id}
            href={`/documents/${document.id}`}
            className="flex flex-col gap-2 rounded-xl border border-black/8 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
          >
            <h3 className="truncate text-base font-medium text-zinc-950 dark:text-zinc-50">
              {document.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Updated {formatUpdatedAt(document.updatedAt)}
            </p>
            {document.access === "shared" && owner ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Owned by {owner.name}
              </p>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
