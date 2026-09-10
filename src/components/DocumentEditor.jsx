import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef, useState } from "react";
import EditorToolbar from "./EditorToolbar";
import { socket } from "../socket/socket";
import { updateDocumentContent } from "../api/documents";

export default function DocumentEditor({ content, onChange, user, documentId, role }) {
    const [cursors, setCursors] = useState({});
    const saveTimeout = useRef();
    const isEditable = role === "editor" || role === "owner";
    const editor = useEditor({
        extensions: [StarterKit, Underline],
        content: content || "<p></p>",
        shouldRerenderOnTransaction: true,
        editable: isEditable,

        editorProps: {
            attributes: {
                class:
                    "prose prose-slate max-w-none min-h-[60vh] p-8 focus:outline-none",
            },
        },
        onSelectionUpdate: ({ editor }) => {
            const { from, to } = editor.state.selection;

            socket.emit("cursor-move", {
                documentId,
                userId: user._id,
                name: user.name,
                from,
                to,
            });
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();

            onChange(html);

            socket.emit("send-changes", {
                documentId,
                content: html,
            });


            clearTimeout(saveTimeout.current);

            saveTimeout.current = setTimeout(async () => {
                try {
                    await updateDocumentContent(documentId, html);
                } catch (err) {
                    console.error("Failed to save document", err);
                }
            }, 2000);
        },
    });
    useEffect(() => {
        if (!editor) return;

        const handleReceiveChanges = (content) => {
            if (content !== editor.getHTML()) {
                editor.commands.setContent(content, {
                    emitUpdate: false,
                });
            }
        };

        socket.on("receive-changes", handleReceiveChanges);

        return () => {
            socket.off("receive-changes", handleReceiveChanges);
        };
    }, [editor]);
    useEffect(() => {
        const handleCursorUpdate = (data) => {
            setCursors(prev => ({
                ...prev,
                [data.userId]: data,
            }));
        };

        socket.on("cursor-update", handleCursorUpdate);

        return () => {
            socket.off("cursor-update", handleCursorUpdate);
        };
    }, []);
    // Sync external content updates (e.g., file upload)
    useEffect(() => {
        if (editor && content !== undefined && content !== editor.getHTML()) {
            editor.commands.setContent(content || "<p></p>", { emitUpdate: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, editor]);

    return (
        <div className="flex flex-col gap-3">
            {!isEditable ? <div>  </div> : <EditorToolbar editor={editor} />}
            <div className="flex gap-2 flex-wrap">
                {Object.values(cursors)
                    .filter(cursor => cursor.userId !== user._id)
                    .map((cursor) => (
                        <div
                            key={cursor.userId}
                            className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded"
                        >
                            {cursor.from === cursor.to
                                ? `${cursor.name} cursor at ${cursor.from}`
                                : `${cursor.name} selecting ${cursor.from}-${cursor.to}`}
                        </div>
                    ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
