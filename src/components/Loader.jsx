
export default function Loader({ fullScreen = false, label = "Loading..." }) {
    const wrapper = fullScreen
        ? "min-h-screen flex items-center justify-center bg-slate-50"
        : "flex items-center justify-center py-10";
    return (
        <div className={wrapper}>
            <div className="flex items-center gap-3 text-slate-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                <span className="text-sm font-medium">{label}</span>
            </div>
        </div>
    );
}
