import type { TipTapDocument } from "./types";

export const SUPPORTED_IMPORT_EXTENSIONS = [".txt", ".md"];

export function getFileExtension(filename: string): string {
  const match = /\.[^.]+$/.exec(filename);
  return match ? match[0].toLowerCase() : "";
}

// .md is intentionally treated as plain text, not parsed as Markdown —
// this app has no Markdown parser installed, and the editor's own toolbar
// is the only supported way to apply rich formatting.
export function textToTipTapDocument(text: string): TipTapDocument {
  return {
    type: "doc",
    content: text.split(/\r?\n/).map((line) =>
      line.length > 0
        ? { type: "paragraph", content: [{ type: "text", text: line }] }
        : { type: "paragraph" }
    ),
  };
}
