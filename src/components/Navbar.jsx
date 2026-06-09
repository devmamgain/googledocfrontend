import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar({ children }) {
    const { user, logout } = useAuth();
    return (
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">D</div>
                    <span className="text-base font-semibold text-slate-900">Docly</span>
                </Link>
                {children}
            </div>
            <div className="flex items-center gap-3">
                <span className="hidden text-sm text-slate-600 sm:inline">
                    {user?.name}
                </span>
                <button
                    onClick={logout}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 lg:hidden"
                >
                    Log out
                </button>
            </div>
        </header>
    );
}
