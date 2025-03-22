import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import FileUpload from "./FileUpload";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

const Chat = ({ token }) => {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState("global");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (token) {
      const newSocket = io(SERVER_URL, {
        auth: { token },
      });
      setSocket(newSocket);
      newSocket.emit("joinRoom", room);

      newSocket.on("message", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      // Load chat history
      axios
        .get(`${SERVER_URL}/api/messages?room=${room}`, {
          headers: { Authorization: token },
        })
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("History error:", err));

      return () => newSocket.disconnect();
    }
  }, [token, room]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (socket && chatInput.trim()) {
      socket.emit("chatMessage", {
        content: chatInput,
        room,
        type: "text",
      });
      setChatInput("");
    }
  };

  // Inline style objects
  const containerStyle = {
    maxWidth: "800px",
    margin: "2rem auto",
    padding: "2rem",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  };

  const headerStyle = {
    textAlign: "center",
    color: "#4a90e2",
    marginBottom: "1.5rem",
  };

  const chatHistoryStyle = {
    border: "1px solid #ddd",
    padding: "1rem",
    background: "#fafafa",
    borderRadius: "4px",
    height: "600px",
    overflowY: "auto",
    marginBottom: "1rem",
  };

  const messageStyle = {
    padding: "0.75rem",
    marginBottom: "1rem",
    background: "#fff",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
    transition: "background 0.3s ease",
  };

  const messageHoverStyle = {
    background: "#f9f9f9",
  };

  const chatInputWrapperStyle = {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  };

  const chatInputStyle = {
    flex: 1,
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    transition: "border 0.3s ease",
  };

  const sendButtonStyle = {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "4px",
    background: "#4a90e2",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.3s ease",
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Chat Room: {room}</h2>
      <div style={chatHistoryStyle}>
        {messages.map((msg) => (
          <div
            key={msg._id}
            style={messageStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = messageHoverStyle.background)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = messageStyle.background)
            }
          >
            <strong style={{ color: "#4a90e2" }}>{msg.sender.username}</strong>:{" "}
            {msg.content}
            {msg.fileUrl && (
              <div>
                {msg.type === "image" ? (
                  <img
                    src={`${SERVER_URL}${msg.fileUrl}`}
                    alt="attachment"
                    style={{
                      maxWidth: "200px",
                      borderRadius: "4px",
                      marginTop: "0.5rem",
                    }}
                  />
                ) : (
                  <a
                    href={`${SERVER_URL}${msg.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#4a90e2" }}
                  >
                    Download file
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} style={chatInputWrapperStyle}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type a message..."
          style={chatInputStyle}
        />
        <button type="submit" style={sendButtonStyle}>
          Send
        </button>
      </form>
      <FileUpload token={token} room={room} socket={socket} />
    </div>
  );
};

export default Chat;
