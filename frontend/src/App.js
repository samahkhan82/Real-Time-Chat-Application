import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";
import { setAuthToken } from "./services/api";
import "./App.css";
// import "./index.css";


function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Protected route wrapper
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Chat token={token} />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login onLogin={setToken} />} />
        <Route path="/register" element={<Register onRegister={setToken} />} />
      </Routes>
    </Router>
  );
}

export default App;
