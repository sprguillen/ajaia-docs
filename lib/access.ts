import type { UserId } from "./types";

// Pure access-control rule, kept separate from lib/supabase.ts so it can be
// tested without touching the network or importing the Supabase client.
export function canAccessDocument(
  ownerId: UserId,
  requestingUserId: UserId,
  isSharedWithUser: boolean
): boolean {
  return requestingUserId === ownerId || isSharedWithUser;
}
