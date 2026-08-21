import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document",
};

// TODO: load the document by id, enforce access control, and render RichTextEditor.
export default async function DocumentPage({
  params,
}: PageProps<"/documents/[id]">) {
  const { id } = await params;

  return <div>Document {id}</div>;
}
