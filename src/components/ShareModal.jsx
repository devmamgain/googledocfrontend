import { useState } from "react";
import toast from "react-hot-toast";
import { shareDocument } from "../api/documents";

export default function ShareModal({ open, onClose, documentId }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    async function handleShare(e) {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            await shareDocument(documentId, email);
            toast.success("Document shared successfully.");
            setEmail("");
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message;
            toast.error(msg || "User not found.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Share document</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Enter the email of the user you want to share with.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        ✕
                    </button>
                </div>
                <form onSubmit={handleShare} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            User Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {loading ? "Sharing..." : "Grant Access"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
