import { useState, useEffect } from "react";
import { useToast } from "../components/ToastContext";
import "./FileManagerApp.css";

function FileManagerApp() {
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState([]);
  const { addToast } = useToast();

  const fetchDocs = () => {
    fetch("http://127.0.0.1:8000/history/documents")
      .then((res) => res.json())
      .then(setDocs)
      .catch(() => {});
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "txt", "docx"].includes(ext)) {
      setStatus({ type: "error", text: `❌ Unsupported file type: .${ext}` });
      return;
    }

    setUploading(true);
    setStatus({ type: "info", text: `Uploading "${file.name}"...` });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", text: `✅ "${file.name}" uploaded and ingested.` });
        addToast(`✅ "${file.name}" ingested successfully`, "success");
        fetchDocs();
      } else {
        setStatus({ type: "error", text: `❌ ${data.error}` });
        addToast(`❌ ${data.error}`, "error");
      }
    } catch {
      setStatus({ type: "error", text: "❌ Failed to connect to server." });
      addToast("❌ Failed to connect to server.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-manager">
      <h2 className="file-manager__title">📂 File Manager</h2>
      <p className="file-manager__desc">Upload documents to your AI knowledge base.</p>
      <p className="file-manager__supported">Supported: PDF, TXT, DOCX</p>

      <label className={`file-manager__upload-btn ${uploading ? "disabled" : ""}`}>
        {uploading ? "Uploading..." : "Choose File to Upload"}
        <input
          type="file"
          accept=".pdf,.txt,.docx"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {status && (
        <div className={`file-manager__status file-manager__status--${status.type}`}>
          {status.text}
        </div>
      )}

      <div className="file-manager__docs">
        <h3 className="file-manager__docs-title">Ingested Documents</h3>
        {docs.length === 0 ? (
          <p className="file-manager__empty">No documents uploaded yet.</p>
        ) : (
          <ul className="file-manager__doc-list">
            {docs.map((doc) => (
              <li key={doc.id} className="file-manager__doc-item">
                <span className="file-manager__doc-icon">📄</span>
                <div className="file-manager__doc-info">
                  <span className="file-manager__doc-name">{doc.filename}</span>
                  <span className="file-manager__doc-date">
                    {new Date(doc.created_at).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FileManagerApp;
