import { useState, useEffect } from "react";
import "./HistoryApp.css";

const TABS = [
  { id: "chat", label: "💬 Chat", endpoint: "/history/chat" },
  { id: "documents", label: "📄 Documents", endpoint: "/history/documents" },
  { id: "workflows", label: "⚙️ Workflows", endpoint: "/history/workflows" },
];

function HistoryApp() {
  const [activeTab, setActiveTab] = useState("chat");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = (tab) => {
    const endpoint = TABS.find((t) => t.id === tab).endpoint;
    setLoading(true);
    fetch(`http://127.0.0.1:8000${endpoint}`)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const renderItem = (item) => {
    if (activeTab === "chat") {
      return (
        <div key={item.id} className="history-app__item">
          <div className="history-app__item-row">
            <span className="history-app__label">Q:</span>
            <span className="history-app__question">{item.question}</span>
          </div>
          <div className="history-app__item-row">
            <span className="history-app__label">A:</span>
            <span className="history-app__answer">{item.answer}</span>
          </div>
          <span className="history-app__date">{new Date(item.created_at).toLocaleString()}</span>
        </div>
      );
    }
    if (activeTab === "documents") {
      return (
        <div key={item.id} className="history-app__item">
          <div className="history-app__item-row">
            <span className="history-app__doc-icon">📄</span>
            <span className="history-app__question">{item.filename}</span>
          </div>
          <span className="history-app__date">{new Date(item.created_at).toLocaleString()}</span>
        </div>
      );
    }
    if (activeTab === "workflows") {
      return (
        <div key={item.id} className="history-app__item">
          <div className="history-app__item-row">
            <span className="history-app__badge">{item.workflow}</span>
            <span className="history-app__question">{item.query}</span>
          </div>
          <span className="history-app__answer">{item.result}</span>
          <span className="history-app__date">{new Date(item.created_at).toLocaleString()}</span>
        </div>
      );
    }
  };

  return (
    <div className="history-app">
      <div className="history-app__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`history-app__tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="history-app__content">
        {loading && <p className="history-app__loading">Loading...</p>}
        {!loading && data.length === 0 && (
          <p className="history-app__empty">No records found.</p>
        )}
        {!loading && data.map((item) => renderItem(item))}
      </div>
    </div>
  );
}

export default HistoryApp;
