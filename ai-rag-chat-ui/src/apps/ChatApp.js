import { useState, useEffect, useRef } from "react";
import { useToast } from "../components/ToastContext";
import "./ChatApp.css";

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/history/chat")
      .then((res) => res.json())
      .then((data) => {
        const history = data.reverse().map((item) => ([
          { role: "user", text: item.question },
          { role: "agent", text: item.answer },
        ])).flat();
        setMessages(history);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/chat?q=${encodeURIComponent(question)}`);
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "agent", text: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "agent", text: "Error connecting to server." }]);
      addToast("❌ Failed to connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-app">
      <div className="chat-app__messages">
        {messages.length === 0 && (
          <div className="chat-app__empty">No messages yet. Ask something!</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-app__message chat-app__message--${msg.role}`}>
            <span className="chat-app__bubble">{msg.text}</span>
          </div>
        ))}
        {loading && (
          <div className="chat-app__message chat-app__message--agent">
            <span className="chat-app__bubble thinking">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-app__input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question..."
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  );
}

export default ChatApp;
