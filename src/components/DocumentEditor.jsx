import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import EditorToolbar from "./EditorToolbar";

export default function DocumentEditor({ content, onChange }) {
    const editor = useEditor({
        extensions: [StarterKit, Underline],
        content: content || "<p></p>",
        shouldRerenderOnTransaction: true, 

        editorProps: {
            attributes: {
                class:
                    "prose prose-slate max-w-none min-h-[60vh] p-8 focus:outline-none",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Sync external content updates (e.g., file upload)
    useEffect(() => {
        if (editor && content !== undefined && content !== editor.getHTML()) {
            editor.commands.setContent(content || "<p></p>", { emitUpdate: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, editor]);

    return (
        <div className="flex flex-col gap-3">
            <EditorToolbar editor={editor} />
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
