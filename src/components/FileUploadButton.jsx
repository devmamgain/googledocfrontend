import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { uploadFile } from "../api/documents";

export default function FileUploadButton({ onImported }) {
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    async function handleChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const name = file.name.toLowerCase();
        if (!name.endsWith(".txt") && !name.endsWith(".md")) {
            toast.error("Only TXT and Markdown files are supported.");
            e.target.value = "";
            return;
        }
        setLoading(true);
        try {
            const data = await uploadFile(file);
            // Wrap plain text in <p> so editor renders it
            const html = data.content
                ?.split(/\n{2,}/)
                .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
                .join("");
            onImported(html || `<p>${data.content || ""}</p>`);
            toast.success("File imported");
        } catch {
            toast.error("Failed to import file");
        } finally {
            setLoading(false);
            e.target.value = "";
        }
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5 5 5M12 5v12" /></svg>
                {loading ? "Importing..." : "Import File"}
            </button>
            <p className="text-[11px] text-slate-400">Only TXT and Markdown files are supported.</p>
            <input
                ref={inputRef}
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}
