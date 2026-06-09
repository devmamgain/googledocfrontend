import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    getDocument,
    updateDocumentTitle,
    updateDocumentContent,
} from "../api/documents";
import DocumentEditor from "../components/DocumentEditor";
import FileUploadButton from "../components/FileUploadButton";
import ShareModal from "../components/ShareModal";
import Loader from "../components/Loader";

export default function DocumentEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getDocument(id)
            .then((d) => {
                if (!active) return;
                setDoc(d);
                setTitle(d.title || "Untitled Document");
                setContent(d.content || "");
            })
            .catch(() => toast.error("Document not found"))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [id]);

    async function handleTitleBlur() {
        if (!doc || title === doc.title) return;
        try {
            await updateDocumentTitle(id, title);
            setDoc({ ...doc, title });
        } catch {
            toast.error("Failed to update title");
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await updateDocumentContent(id, content);
            toast.success("Saved successfully");
        } catch {
            toast.error("Error saving document");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <Loader fullScreen label="Loading document..." />;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
                <div className="flex flex-1 items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        title="Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-lg font-semibold text-slate-900 hover:border-slate-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setShareOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m9.032 4.026A2.5 2.5 0 1019 16.5m-9.684-3.158a2.5 2.5 0 100-4.684m9.368-1.526A2.5 2.5 0 1116.5 4.5" /></svg>
                        Share
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
                <div className="mb-4 flex justify-end">
                    <FileUploadButton onImported={(html) => setContent(html)} />
                </div>
                <DocumentEditor content={content} onChange={setContent} />
            </main>

            <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} documentId={id} />
        </div>
    );
}
