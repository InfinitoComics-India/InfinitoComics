import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

// ── Toolbar button helper ──────────────────────────────────────────
const ToolBtn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`px-2 py-1 rounded text-sm border transition ${
      active
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

// ── Convert pasted image file → base64 data URL ───────────────────
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ── Main component ────────────────────────────────────────────────
const RichEditor = ({ value, onChange, placeholder = "Start typing…" }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),

    // ── Clipboard paste handler ────────────────────────────────
    editorProps: {
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            fileToBase64(file).then((base64) => {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: base64 })
                )
              );
            });
            return true;
          }
        }
        return false;
      },

      // ── Drag-and-drop image ────────────────────────────────
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;

        for (const file of files) {
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            fileToBase64(file).then((base64) => {
              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });
              if (!coordinates) return;
              const node = schema.nodes.image.create({ src: base64 });
              const transaction = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(transaction);
            });
            return true;
          }
        }
        return false;
      },
    },
  });

  // Insert image from file picker
  const insertImageFromFile = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files[0];
      if (!file || !editor) return;
      const base64 = await fileToBase64(file);
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <em>I</em>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <u>U</u>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <s>S</s>
        </ToolBtn>

        <span className="w-px bg-gray-300 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">H1</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolBtn>

        <span className="w-px bg-gray-300 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">• List</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">1. List</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">" "</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">{`< >`}</ToolBtn>

        <span className="w-px bg-gray-300 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">≡L</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">≡C</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">≡R</ToolBtn>

        <span className="w-px bg-gray-300 mx-1" />

        <ToolBtn onClick={insertImageFromFile} active={false} title="Insert image from file">🖼 Image</ToolBtn>

        <span className="w-px bg-gray-300 mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪</ToolBtn>
      </div>

      {/* ── Editor area ── */}
      <EditorContent
        editor={editor}
        className="min-h-[160px] px-4 py-3 prose prose-sm max-w-none focus:outline-none text-gray-800"
      />

      {/* Paste hint */}
      <p className="text-[11px] text-gray-400 px-3 pb-2">
        💡 Tip: Copy an image anywhere and press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs border">Ctrl+V</kbd> to paste it inline. You can also drag &amp; drop images.
      </p>
    </div>
  );
};

export default RichEditor;
