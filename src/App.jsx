import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import LogAbsensi from "./pages/LogAbsensi";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || null);

  const handleLogin = (newToken) => {
    localStorage.setItem("admin_token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  return token ? (
    <LogAbsensi token={token} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}
