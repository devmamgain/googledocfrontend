import { axios, authHeaders } from "./client";


const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const GET_DOCUMENTS_API = `${BACKEND_URL}/api/documents`;
const CREATE_DOCUMENT_API = `${BACKEND_URL}/api/documents`;
const GET_SINGLE_DOCUMENT_API = `${BACKEND_URL}/api/documents`;
const UPDATE_DOCUMENT_TITLE_API = `${BACKEND_URL}/api/documents`;
const UPDATE_DOCUMENT_CONTENT_API = `${BACKEND_URL}/api/documents`;
const UPLOAD_FILE_API = `${BACKEND_URL}/api/upload`;
const SHARE_DOCUMENT_API = `${BACKEND_URL}/api/documents`;

export async function getDocuments() {
    const res = await axios.get(GET_DOCUMENTS_API, { headers: authHeaders() });
    return res.data;
}

export async function createDocument(title = "Untitled Document") {
    const res = await axios.post(
        CREATE_DOCUMENT_API,
        { title },
        { headers: authHeaders() }
    );
    return res.data;
}

export async function getDocument(id) {
    const res = await axios.get(`${GET_SINGLE_DOCUMENT_API}/${id}`, {
        headers: authHeaders(),
    });
    return res.data;
}

export async function updateDocumentTitle(id, title) {
    const res = await axios.put(
        `${UPDATE_DOCUMENT_TITLE_API}/${id}`,
        { title },
        { headers: authHeaders() }
    );
    return res.data;
}

export async function updateDocumentContent(id, content) {
    const res = await axios.put(
        `${UPDATE_DOCUMENT_CONTENT_API}/${id}`,
        { content },
        { headers: authHeaders() }
    );
    return res.data;
}
export async function updateDocumentRole(
    documentId,
    userId,
    role
) {
    const res = await axios.put(
        `${UPDATE_DOCUMENT_CONTENT_API}/${documentId}/role`,
        {
            userId,
            role,
        },
        {
            headers: authHeaders(),
        }
    );

    return res.data;
}
export async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(UPLOAD_FILE_API, formData, {
        headers: {
            ...authHeaders(),
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
}

export async function shareDocument(id, email, role) {
    const res = await axios.post(
        `${SHARE_DOCUMENT_API}/${id}/share`,
        { email, role },
        { headers: authHeaders() }
    );
    return res.data;
}
