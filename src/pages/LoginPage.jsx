import { useState } from "react";

const BASE_URL = "https://your-api-url.com";

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ name: "", pin: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, pin: parseInt(form.pin) }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal. Cek nama & PIN kamu.");
        return;
      }

      if (data.role !== "admin") {
        setError("Akses ditolak.");
        return;
      }

      onLogin(data.token);
    } catch (err) {
      setError("Tidak bisa menghubungi server. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <h1 className="login-title">ABSENSI OJT BBPVP BEKASI</h1>
          <p className="login-subtitle">PT. GEO MANDIRI KREASI</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="mb-4">
            <label className="form-label fw-semibold">Nama</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person-fill"></i>
              </span>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Masukkan nama lengkap"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">PIN</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-key-fill"></i>
              </span>
              <input
                type="password"
                name="pin"
                className="form-control"
                placeholder="Masukkan PIN"
                value={form.pin}
                onChange={handleChange}
                required
                maxLength={10}
                inputMode="numeric"
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Masuk...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Masuk
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
