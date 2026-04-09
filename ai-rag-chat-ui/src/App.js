import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadedFile(file.name);
      setMessages((prev) => [
        ...prev,
        { role: "system", text: `✅ "${file.name}" uploaded and ingested.` },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "system", text: `❌ Failed to upload "${file.name}".` },
      ]);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/agent?q=${encodeURIComponent(input)}`
      );
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: data.answer, source: uploadedFile },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "Error connecting to the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="chat-title">AI Knowledge Base</h1>
        <div className="upload-area">
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".txt,.pdf,.docx"
            style={{ display: "none" }}
          />
          {uploadedFile && (
            <span className="uploaded-label">📄 {uploadedFile}</span>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div>
              <span className="bubble">{msg.text}</span>
              {msg.source && (
                <div className="source-label">Source: {msg.source}</div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message agent">
            <span className="bubble">Thinking...</span>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
