import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LogAbsensi from "./pages/AdminPage/LogAbsensi";
import HalamanUser from "./pages/UserPage/HalamanUser";
import UserHistoryAbsensi from "./pages/UserPage/UserHistoryAbsensi";
import QrUser from "./pages/UserPage/QrUser";
import ScannerQr from "./pages/AdminPage/ScannerQr";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("x_token") || null);
  const [role, setRole] = useState(Number(localStorage.getItem("user_role") || null));
  const navigate = useNavigate();
  // console.log("STATUS SAAT INI - Token:", token, "Role:", role);

  const handleLogin = (newToken, userRole) => {
    localStorage.setItem("x_token", newToken);
    localStorage.setItem("user_role", userRole);
    setToken(newToken);
    setRole(Number(userRole));
  };

  const handleLogout = () => {
    localStorage.removeItem("x_token");
    localStorage.removeItem("user_role");
    setToken(null);
    setRole(null);
    navigate("/");
  };

  return (
    <div>
      <Routes>
        <Route path="/" element={!token || role === null ? <LoginPage token={token} onLogin={handleLogin} /> : <Navigate to={role === 1 ? "/admin" : "/user"} />} />
        <Route path="/admin" element={!token || role !== 1 ? <Navigate to="/" /> : <LogAbsensi token={token} onLogout={handleLogout} />} />
        <Route path="/user" element={!token || role !== 2 ? <Navigate to="/" /> : <HalamanUser token={token} onLogout={handleLogout} />} />
        <Route path="/user/history" element={!token || role !== 2 ? <Navigate to="/" /> : <UserHistoryAbsensi token={token} />} />
        <Route path="/user/qr" element={!token || role !== 2 ? <Navigate to="/" /> : <QrUser token={token} />} />
        <Route path="/scanner" element={!token || role !== 1 ? <Navigate to="/" /> : <ScannerQr token={token} />} />
      </Routes>
    </div>
  );
}