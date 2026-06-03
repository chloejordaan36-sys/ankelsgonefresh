import { useEffect, useRef, useState } from "react";

export default function ChatBox() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "🏀 Yo. I’m your ANKLES GONE coach. What are we fixing today?"
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageText = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: messageText }
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/ask-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: "test123",
            message: messageText
          })
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Error connecting to backend"
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>🏀 ANKLES GONE AI COACH</div>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.role === "user" ? "#2563eb" : "#1f2937"
            }}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.message, backgroundColor: "#111827" }}>
            🧠 Coach is thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask your coach..."
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0b0f19",
    color: "white"
  },
  header: {
    padding: 15,
    fontSize: 20,
    fontWeight: "bold",
    borderBottom: "1px solid #222"
  },
  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 15,
    overflowY: "auto",
    gap: 10
  },
  message: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 10,
    color: "white"
  },
  inputArea: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #222"
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    border: "none",
    outline: "none"
  },
  button: {
    marginLeft: 10,
    padding: "12px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6
  }
};