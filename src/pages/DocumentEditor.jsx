import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    getDocument,
    updateDocumentTitle,
    updateDocumentContent,
    updateDocumentRole,
} from "../api/documents";
import DocumentEditor from "../components/DocumentEditor";
import FileUploadButton from "../components/FileUploadButton";
import ShareModal from "../components/ShareModal";
import Loader from "../components/Loader";
import { socket } from "../socket/socket";
import { useAuth } from "../contexts/AuthContext";

export default function DocumentEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [userJoined, setUserJoined] = useState([])
    const { user } = useAuth();
    const [mouseUsers, setMouseUsers] = useState({});
    const [role, setRole] = useState("")
    const [showCollaborators, setShowCollaborators] = useState(false);
    // const [updateRole, setUpdateRole] = useState()
    useEffect(() => {
        socket.connect();
        socket.emit("join-document", id, user);
        socket.on("active-users", (activeusers) => { setUserJoined(activeusers) })

        return () => {
            socket.emit("leave-document");
            // socket.disconnect()
        }
    }, [id])
    useEffect(() => {
        let rafId = null;
        let latestEvent = null;

        const handleMouseMove = (e) => {
            latestEvent = e;

            if (rafId) return;

            rafId = requestAnimationFrame(() => {
                if (!latestEvent) return;

                socket.emit("mouse-move", {
                    documentId: id,
                    userId: user._id,
                    name: user.name,
                    x: latestEvent.clientX / window.innerWidth,
                    y: latestEvent.clientY / window.innerHeight,
                });

                rafId = null;
            });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [id, user]);
    useEffect(() => {
        const handleUserLeft = ({ userId }) => {
            setMouseUsers(prev => {
                const copy = { ...prev };
                delete copy[userId];
                return copy;
            });
        };

        socket.on("user-left", handleUserLeft);

        return () => {
            socket.off("user-left", handleUserLeft);
        };
    }, []);
    useEffect(() => {
        const handleMouseUpdate = (data) => {
            setMouseUsers(prev => ({
                ...prev,
                [data.userId]: data,
            }));
        };

        socket.on("mouse-update", handleMouseUpdate);

        return () => {
            socket.off("mouse-update", handleMouseUpdate);
        };
    }, []);
    useEffect(() => {
        let active = true;
        let role = "viewer";

        setLoading(true);
        getDocument(id)
            .then((d) => {
                if (!active) return;
                setDoc(d);
                setTitle(d.title || "Untitled Document");
                setContent(d.content || "");
                if (d.owner._id === user._id) {
                    role = "owner";
                } else {
                    const access = d.sharedWith.find(
                        (data) => data.user._id === user._id
                    );

                    role = access?.role || "viewer";
                }
                setRole(role)
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

    const changeRole = async (sharedUserId, valueRole) => {

        if (role !== "owner") return;

        try {
            await updateDocumentRole(
                id,
                sharedUserId,
                valueRole
            );

            setDoc((prev) => ({
                ...prev,
                sharedWith: prev.sharedWith.map((share) =>
                    share.user._id === sharedUserId
                        ? {
                            ...share,
                            role: valueRole,
                        }
                        : share
                ),
            }));

            toast.success("Role updated successfully");
        } catch {
            toast.error("Error updating role");
        }
    };




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
            {Object.values(mouseUsers)
                .filter(u => u.userId !== user._id)
                .map(u => (
                    <div
                        key={u.userId}
                        className="fixed pointer-events-none z-50"
                        style={{
                            left: `${u.x * window.innerWidth}px`,
                            top: `${u.y * window.innerHeight}px`,
                            transform: "translate(0px, 0px)",
                        }}
                    >
                        <div className="relative">
                            <svg width="16" height="20" viewBox="0 0 16 20">
                                <path
                                    d="M0 0L0 18L5 13L9 20L12 18L8 11L15 11Z"
                                    fill="#6366f1"
                                />
                            </svg>

                            <div className="absolute left-4 top-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                                {u.name}
                            </div>
                        </div>
                    </div>
                ))}
            <main className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
                <div className="flex justify-between">

                    {/* Compact Collaborators */}
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => setShowCollaborators(true)}
                    >
                        {[
                            doc.owner,
                            ...(doc.sharedWith || []).map((share) => share.user),
                        ]
                            .filter(Boolean)
                            .slice(0, 5)
                            .map((user) => {
                                const isOnline = (userJoined || []).some(
                                    (u) => u._id === user._id
                                );

                                return (
                                    <div
                                        key={user._id}
                                        className="relative -ml-2 first:ml-0"
                                    >
                                        {/* Profile */}
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 ring-2 ring-white">
                                            {user.name
                                                ? user.name.charAt(0).toUpperCase()
                                                : "?"}
                                        </div>

                                        {/* Online status */}
                                        <span
                                            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${isOnline
                                                ? "bg-green-500"
                                                : "bg-gray-400"
                                                }`}
                                        />
                                    </div>
                                );
                            })}

                        {/* Remaining users */}
                        {(doc.sharedWith?.length || 0) + 1 > 5 && (
                            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 ring-2 ring-white">
                                +{(doc.sharedWith?.length || 0) + 1 - 5}
                            </div>
                        )}
                    </div>
                    {showCollaborators && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                            onClick={() => setShowCollaborators(false)}
                        >
                            <div
                                className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            Collaborators
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            People with access to this document
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setShowCollaborators(false)}
                                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Owner */}
                                <div className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                                            {doc.owner.name?.charAt(0).toUpperCase()}

                                            <span
                                                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${userJoined.some(
                                                    (u) => u._id === doc.owner._id
                                                )
                                                        ? "bg-green-500"
                                                        : "bg-gray-400"
                                                    }`}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {doc.owner.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Owner
                                            </p>
                                        </div>
                                    </div>

                                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">
                                        Owner
                                    </span>
                                </div>

                                {/* Shared Users */}
                                {doc.sharedWith.map((share) => {
                                    const isOnline = userJoined.some(
                                        (u) => u._id === share.user._id
                                    );

                                    return (
                                        <div
                                            key={share.user._id}
                                            className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                                                    {share.user.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}

                                                    <span
                                                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${isOnline
                                                                ? "bg-green-500"
                                                                : "bg-gray-400"
                                                            }`}
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {share.user.name}
                                                    </p>

                                                    <p
                                                        className={`text-xs ${isOnline
                                                                ? "text-green-600"
                                                                : "text-gray-400"
                                                            }`}
                                                    >
                                                        {isOnline
                                                            ? "Online"
                                                            : "Offline"}
                                                    </p>
                                                </div>
                                            </div>

                                            {role === "owner" ? (
                                                <select
                                                    value={share.role}
                                                    onChange={(e) =>
                                                        changeRole(
                                                            share.user._id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                                                >
                                                    <option value="editor">
                                                        Editor
                                                    </option>
                                                    <option value="viewer">
                                                        Viewer
                                                    </option>
                                                </select>
                                            ) : (
                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
                                                    {share.role}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {/* <div className="flex gap-2">
                        {userJoined.map((joinedUser) => {
                            let roleInside;

                            if (doc.owner._id === joinedUser._id) {
                                roleInside = "owner";
                            } else {
                                const access = doc.sharedWith.find(
                                    (share) => share.user._id === joinedUser._id
                                );

                                roleInside = access?.role || "viewer";
                            }
                            return (
                                <div key={joinedUser._id}>
                                    <span>•</span> {joinedUser.name}  {roleInside === "owner" ? roleInside : <div> {role === "owner" ? <select value={updateRole || roleInside} onChange={(e) => changeRole(e.target.value, joinedUser._id)}><option value="editor" >Editor</option><option value="viewer">Viewer</option></select> : roleInside}</div>}
                                </div>
                            );
                        })}
                    </div> */}
                    <div className="mb-4 flex justify-end">
                        <FileUploadButton documentId={id} onImported={(html) => setContent(html)} />
                    </div>
                </div>
                <DocumentEditor content={content} onChange={setContent} documentId={id} user={user} role={role} />
            </main>

            <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} documentId={id} />
        </div>
    );
}
