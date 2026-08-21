import { createClient } from "@supabase/supabase-js";
import type {
  Document,
  DocumentId,
  DocumentSummary,
  TipTapDocument,
  User,
  UserId,
} from "./types";

// No generated Database types — the schema is small enough that manually
// typing each function's return value is simpler than wiring up the Supabase
// CLI codegen for a 4-hour take-home.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Raw row shapes, snake_case, matching the SQL schema exactly. These never
// leave this file — every exported function returns the camelCase types
// from lib/types.ts instead.
interface UserRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface DocumentRow {
  id: string;
  title: string;
  content: TipTapDocument;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  };
}

function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const EMPTY_DOCUMENT: TipTapDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("users").select("*").order("name");

  if (error) throw error;
  return (data as UserRow[]).map(toUser);
}

export async function getDocumentsForUser(
  userId: UserId
): Promise<DocumentSummary[]> {
  const [ownedResult, sharedResult] = await Promise.all([
    supabase.from("documents").select("*").eq("owner_id", userId),
    supabase
      .from("document_shares")
      .select("documents(*)")
      .eq("user_id", userId),
  ]);

  if (ownedResult.error) throw ownedResult.error;
  if (sharedResult.error) throw sharedResult.error;

  const owned = (ownedResult.data as DocumentRow[]).map(toDocument);
  const shared = (
    sharedResult.data as unknown as { documents: DocumentRow | null }[]
  )
    .map((row) => row.documents)
    .filter((row): row is DocumentRow => row !== null)
    .map(toDocument);

  return [
    ...owned.map((document) => ({ ...document, access: "owner" as const })),
    ...shared.map((document) => ({ ...document, access: "shared" as const })),
  ];
}

export async function createDocument(ownerId: UserId): Promise<Document> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      title: "Untitled Document",
      content: EMPTY_DOCUMENT,
      owner_id: ownerId,
    })
    .select()
    .single();

  if (error) throw error;
  return toDocument(data as DocumentRow);
}

// Returns null if the document doesn't exist OR the user has no access to
// it — callers can't distinguish "not found" from "not allowed", which is
// the point: it keeps access control from leaking document existence.
export async function getDocumentById(
  documentId: DocumentId,
  userId: UserId
): Promise<Document | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const document = toDocument(data as DocumentRow);
  if (document.ownerId === userId) return document;

  const { data: share, error: shareError } = await supabase
    .from("document_shares")
    .select("id")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (shareError) throw shareError;

  return share ? document : null;
}

export interface DocumentUpdate {
  title: string;
  content: TipTapDocument;
}

export async function updateDocument(
  documentId: DocumentId,
  updates: DocumentUpdate
): Promise<Document> {
  const { data, error } = await supabase
    .from("documents")
    .update({
      title: updates.title,
      content: updates.content,
    })
    .eq("id", documentId)
    .select()
    .single();

  if (error) throw error;
  return toDocument(data as DocumentRow);
}
