import { useState } from "react";
import "./WorkflowApp.css";

const WORKFLOWS = [
  { id: "ask", label: "Ask Knowledge Base", icon: "🧠", endpoint: "/ask", method: "GET" },
  { id: "agent", label: "Run AI Agent", icon: "🤖", endpoint: "/agent", method: "GET" },
];

function WorkflowApp() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState("agent");

  const runWorkflow = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    const workflow = WORKFLOWS.find((w) => w.id === active);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000${workflow.endpoint}?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResult(data.answer);
    } catch {
      setResult("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workflow-app">
      <h2 className="workflow-app__title">⚙️ Workflows</h2>

      <div className="workflow-app__tabs">
        {WORKFLOWS.map((w) => (
          <button
            key={w.id}
            className={`workflow-app__tab ${active === w.id ? "active" : ""}`}
            onClick={() => setActive(w.id)}
          >
            {w.icon} {w.label}
          </button>
        ))}
      </div>

      <div className="workflow-app__body">
        <input
          className="workflow-app__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runWorkflow()}
          placeholder="Enter your question..."
        />
        <button className="workflow-app__run" onClick={runWorkflow} disabled={loading}>
          {loading ? "Running..." : "▶ Run"}
        </button>

        {result && (
          <div className="workflow-app__result">
            <strong>Result:</strong>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowApp;
