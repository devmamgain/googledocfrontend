import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { getDocuments, createDocument } from "../api/documents";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import DocumentCard from "../components/DocumentCard";
import EmptyState from "../components/EmptyState";

function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 h-28 rounded-xl bg-slate-100" />
            <div className="h-3 w-2/3 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [owned, setOwned] = useState([]);
    const [shared, setShared] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let active = true;
        setLoading(true);
        getDocuments()
            .then((data) => {
                if (!active) return;
                setOwned(data.ownedDocuments || []);
                setShared(data.sharedDocuments || []);
            })
            .catch(() => toast.error("Failed to load documents"))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, []);

    async function handleCreate() {
        setCreating(true);
        try {
            const doc = await createDocument("Untitled Document");
            navigate(`/documents/${doc._id}`);
        } catch {
            toast.error("Failed to create document");
        } finally {
            setCreating(false);
        }
    }

    function scrollTo(id) {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }

    const filter = (list) =>
        list.filter((d) =>
            (d.title || "").toLowerCase().includes(search.toLowerCase())
        );

    const filteredOwned = filter(owned);
    const filteredShared = filter(shared);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar onCreate={handleCreate} onScrollTo={scrollTo} />
            <div className="flex flex-1 flex-col">
                <Navbar>
                    <h1 className="text-base font-semibold text-slate-900 lg:hidden">Dashboard</h1>
                </Navbar>

                <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Welcome back, {user?.name || "there"} 👋
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Pick up where you left off or start something new.
                            </p>
                        </div>
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            {creating ? "Creating..." : "New Document"}
                        </button>
                    </div>

                    <div className="mb-8">
                        <SearchBar value={search} onChange={setSearch} />
                    </div>

                    <section id="owned" className="mb-10">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                            My Documents
                        </h2>
                        {loading ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : filteredOwned.length === 0 ? (
                            <EmptyState
                                title="No documents yet"
                                description="Create your first document to get started."
                                action={
                                    <button
                                        onClick={handleCreate}
                                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        Create Document
                                    </button>
                                }
                            />
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredOwned.map((doc) => (
                                    <DocumentCard key={doc._id} doc={doc} />
                                ))}
                            </div>
                        )}
                    </section>

                    <section id="shared">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Shared With Me
                        </h2>
                        {loading ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : filteredShared.length === 0 ? (
                            <EmptyState
                                title="Nothing shared yet"
                                description="Documents others share with you will appear here."
                            />
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredShared.map((doc) => (
                                    <DocumentCard key={doc._id} doc={doc} shared />
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}