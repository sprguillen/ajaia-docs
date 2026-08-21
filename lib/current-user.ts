// The one place the "current user" localStorage key lives, so the
// dashboard (which writes it) and the document page (which reads it)
// can't drift apart.

import type { UserId } from "./types";

const CURRENT_USER_STORAGE_KEY = "ajaia-docs:current-user-id";

export function getStoredUserId(): UserId | null {
  return window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
}

export function setStoredUserId(userId: UserId): void {
  window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, userId);
}
