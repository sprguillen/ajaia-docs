"use client";

import type { ReactNode } from "react";
import type { Editor, JSONContent } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import type { TipTapDocument } from "@/lib/types";

interface RichTextEditorProps {
  content: TipTapDocument;
  onChange: (content: TipTapDocument) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] } }),
      Underline,
    ],
    content: content as unknown as JSONContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TipTapDocument);
    },
    editorProps: {
      attributes: {
        // The ProseMirror contenteditable div is a separate DOM node from
        // the wrapper we style below, so its own default focus outline and
        // sizing need to be set here, not on the wrapper.
        class: "outline-none min-h-96",
        // Grammarly (and similar extensions) inject their own overlay/border
        // into contenteditable elements and can hijack the selection, which
        // breaks toolbar commands. Opt this editor out explicitly.
        "data-gramm": "false",
        "data-gramm_editor": "false",
        "data-enable-grammarly": "false",
      },
    },
  });

  if (!editor) {
    return (
      <div className="h-96 animate-pulse rounded-lg border border-black/8 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900" />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="tiptap rounded-lg border border-black/8 bg-white p-4 text-zinc-950 focus-within:ring-2 focus-within:ring-zinc-950/10 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus-within:ring-white/10"
      />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-black/8 bg-white p-1.5 dark:border-white/10 dark:bg-zinc-900">
      <ToolbarButton
        label="Bold"
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        isActive={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Heading 1"
        isActive={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        H2
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bullet List"
        isActive={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        label="Numbered List"
        isActive={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-black/8 dark:bg-white/10" />;
}

function ToolbarButton({
  label,
  isActive,
  onClick,
  children,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      onClick={onClick}
      className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-zinc-950 text-white dark:bg-white dark:text-black"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}
