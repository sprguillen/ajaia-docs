"use client";

import type { User, UserId } from "@/lib/types";

interface UserSwitcherProps {
  users: User[];
  currentUserId: UserId | null;
  onChange: (userId: UserId) => void;
  isLoading?: boolean;
}

export default function UserSwitcher({
  users,
  currentUserId,
  onChange,
  isLoading,
}: UserSwitcherProps) {
  if (isLoading) {
    return (
      <div className="h-9 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <span className="hidden sm:inline">Viewing as</span>
      <select
        value={currentUserId ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm font-medium text-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </label>
  );
}
