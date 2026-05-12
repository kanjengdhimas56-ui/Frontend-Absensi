import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LogAbsensi from "./pages/Admin/LogAbsensi";
import HalamanUser from "./pages/User/HalamanUser";
import UserHistoryAbsensi from "./pages/User/UserHistoryAbsensi";
import QrUser from "./pages/User/QrUser";
import ScannerQr from "./pages/Admin/ScannerQr";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";


export default function App() {
  const [token, setToken] = useState(localStorage.getItem("x_token") || null);
  const [role, setRole] = useState(Number(localStorage.getItem("user_role") || null));
  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();
  // console.log("STATUS SAAT INI - Token:", token, "Role:", role);

  const handleLogin = (newToken, userRole) => {
    localStorage.setItem("x_token", newToken);
    localStorage.setItem("user_role", userRole);
    setToken(newToken);
    setRole(Number(userRole));
  };

  const handleLogout = () => {
    MySwal.fire({
      title: "Yakin ingin keluar?",
      text: "Anda akan kembali ke halaman login",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#28a745",
      width: "350px",
      customClass: {
        icon: 'swal2-small-icon',
        title: 'swal2-small-title',
        content: 'swal2-small-text'
      }
    }) .then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("x_token");
        localStorage.removeItem("user_role");
        setToken(null);
        setRole(null);
        navigate("/");
      }
    });
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