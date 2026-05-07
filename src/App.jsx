import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Added Navigate back
// import { Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LogAbsensi from "./pages/LogAbsensi";
import HalamanUser from "./pages/HalamanUser";
// import UserHistoryAbsensi from "./pages/UserHistoryAbsensi";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("x_token") || null);
  const [role, setRole] = useState(localStorage.getItem("user_role") || null);
  // const navigate = useNavigate();

  const handleLogin = (newToken, userRole) => {
    localStorage.setItem("x_token", newToken);
    localStorage.setItem("user_role", userRole);
    setToken(newToken);
    setRole(userRole);
  };

  // const handleLogout = () => {
  //   localStorage.removeItem("x_token");
  //   localStorage.removeItem("user_role");
  //   setToken(null);
  //   setRole(null);
  // };

  return (
    <div>
      {/* {token ? (
            <LogAbsensi token={token} onLogout={handleLogout} />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )} */}
      <Routes>
        <Route path="/"
          element={!token ? (
            <LoginPage onLogin={handleLogin} />
          ) : role === 1 ? (
            <Navigate to="/admin" />
          ) : (
            <Navigate to="/user" />
          )}
        />
        <Route path="/admin" element={<LogAbsensi token={token} />} />
        <Route path="/user" element={<HalamanUser token={token} />} />
        {/* <Route path="/user/history" element={<UserHistoryAbsensi token={token} />} /> */}
      </Routes>
    </div>
  );
}