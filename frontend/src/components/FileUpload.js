import React, { useState } from "react";
import { api } from "../services/api";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

const FileUpload = ({ token, room, socket }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      socket.emit("chatMessage", {
        content: "",
        room,
        type: file.type.startsWith("image") ? "image" : "file",
        fileUrl: res.data.fileUrl,
      });
      setFile(null);
    } catch (error) {
      console.error("File upload error:", error);
    }
  };

  return (
    <form onSubmit={handleUpload} style={{ marginTop: "1rem" }}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit">Upload & Send</button>
    </form>
  );
};

export default FileUpload;
