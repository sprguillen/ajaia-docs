import type { TipTapDocument } from "./types";

export const SUPPORTED_IMPORT_EXTENSIONS = [".txt", ".md"];
export const MAX_IMPORT_FILE_SIZE_BYTES = 1_000_000;

export function getFileExtension(filename: string): string {
  const match = /\.[^.]+$/.exec(filename);
  return match ? match[0].toLowerCase() : "";
}

// Checked before reading the file, so a wrong extension or an oversized
// file (most likely a binary file misnamed as .txt/.md) gets a friendly
// message instead of a raw error later.
export function getImportValidationError(file: File): string | null {
  if (!SUPPORTED_IMPORT_EXTENSIONS.includes(getFileExtension(file.name))) {
    return "Only .txt and .md files can be imported.";
  }

  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    return "That file is too large to import (max 1MB).";
  }

  return null;
}

// Null bytes and other control characters are rejected outright by
// Postgres's text/jsonb columns, so a binary file misnamed as .txt would
// otherwise fail the save with a raw database error instead of the
// friendly message above. Normal whitespace (tab, newline, carriage
// return) is intentionally excluded from this pattern and kept as-is.
const UNSAFE_CONTROL_CHARACTERS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]",
  "g"
);

function stripControlCharacters(text: string): string {
  return text.replace(UNSAFE_CONTROL_CHARACTERS, "");
}

// .md is intentionally treated as plain text, not parsed as Markdown -
// this app has no Markdown parser installed, and the editor's own toolbar
// is the only supported way to apply rich formatting.
export function textToTipTapDocument(text: string): TipTapDocument {
  const sanitized = stripControlCharacters(text);

  return {
    type: "doc",
    content: sanitized.split(/\r?\n/).map((line) =>
      line.length > 0
        ? { type: "paragraph", content: [{ type: "text", text: line }] }
        : { type: "paragraph" }
    ),
  };
}
