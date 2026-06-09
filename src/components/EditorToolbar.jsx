function Btn({ active, onClick, children, title }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition ${active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
        >
            {children}
        </button>
    );
}

export default function EditorToolbar({ editor }) {
    if (!editor) return null;
    return (
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <Btn
                title="Bold"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <span className="font-bold">B</span>
            </Btn>
            <Btn
                title="Italic"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <span className="italic">I</span>
            </Btn>
            <Btn
                title="Underline"
                active={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <span className="underline">U</span>
            </Btn>
            <div className="mx-1 h-5 w-px bg-slate-200" />
            <Btn
                title="Heading 1"
                active={editor.isActive("heading", { level: 1 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                H1
            </Btn>
            <Btn
                title="Heading 2"
                active={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                H2
            </Btn>
            <div className="mx-1 h-5 w-px bg-slate-200" />
            <Btn
                title="Bullet list"
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                • List
            </Btn>
            <Btn
                title="Numbered list"
                active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                1. List
            </Btn>
        </div>
    );
}
