// Application-layer domain types — camelCase. The database uses snake_case;
// lib/supabase.ts maps between the two at the query boundary.

export type UserId = string;
export type DocumentId = string;

export interface User {
  id: UserId;
  name: string;
  email: string;
  createdAt: string;
}

// Intentionally loose — the full TipTap node schema isn't needed until the editor is built.
export interface TipTapDocument {
  type: "doc";
  content: unknown[];
}

export interface Document {
  id: DocumentId;
  title: string;
  content: TipTapDocument;
  ownerId: UserId;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentShare {
  id: string;
  documentId: DocumentId;
  userId: UserId;
  createdAt: string;
}

export type DocumentAccess = "owner" | "shared";

// What the dashboard needs to render "My Documents" vs "Shared With Me".
export interface DocumentSummary extends Document {
  access: DocumentAccess;
}
