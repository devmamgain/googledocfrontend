import { useAuth } from "../contexts/AuthContext";

export default function Sidebar({ onCreate, onScrollTo }) {
    const { user, logout } = useAuth();
    return (
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:flex lg:flex-col">
            <div className="mb-8 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                    D
                </div>
                <span className="text-lg font-semibold text-slate-900">Docly</span>
            </div>

            <button
                onClick={onCreate}
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Document
            </button>

            <nav className="flex-1 space-y-1 text-sm">
                {/* <button
                    onClick={() => onScrollTo("owned")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg>
                    My Documents
                </button>
                <button
                    onClick={() => onScrollTo("shared")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    Shared With Me
                </button> */}
            </nav>

            <div className="mt-6 rounded-xl border border-slate-200 p-3">
                <p className="truncate text-sm font-medium text-slate-900">
                    {user?.name || "User"}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
                <button
                    onClick={logout}
                    className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                    Log out
                </button>
            </div>
        </aside>
    );
}
