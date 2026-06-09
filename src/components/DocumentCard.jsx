import { Link } from "react-router-dom";

function formatDate(d) {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function DocumentCard({ doc, shared = false }) {
    return (
        <Link
            to={`/documents/${doc._id}`}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
        >
            <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-slate-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                {doc.title || "Untitled Document"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
                Updated {formatDate(doc.updatedAt || doc.createdAt)}
            </p>
            <div className="mt-3 flex gap-2">
                {shared ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        Shared with you
                    </span>
                ) : (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Owner
                    </span>
                )}
                {!shared && doc.sharedWith && doc.sharedWith.length > 0 && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                        Shared
                    </span>
                )}
            </div>
        </Link>
    );
}