import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthLogin( { onLogin } ) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false)
  // const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    pin: "",
    role_id: parseInt()
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
    //untuk ngecek secara live
    console.log(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    axios.post("http://103.247.10.115:3050/api/auth/login", form)
      .then((res) => {
        localStorage.setItem("x_token", res.data.token);
        localStorage.setItem("user_role", res.data.user.role_id);
        setForm({
          username: "",
          pin: "",
          role_id: parseInt()
        });
        // // PANGGIL INI agar state di App.jsx terupdate
        onLogin(res.data.token, res.data.user.role_id);
        alert("LOGIN BERHASIL!");
        if (res.data.user.role_id === 1) {
          navigate("/admin");
        } else {
          navigate("/user");
        }
        console.log(res);
      })
      .catch(err => {
        alert("Login Gagal: " + err.response?.data?.message);
      })
      .finally(() => setIsLoading(false));
  }

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
                name="username"
                className="form-control"
                placeholder="Masukkan nama lengkap"
                value={form.username}
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

          {/* {error && (
            <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          )} */}

          <button
            type="submit"
            className="btn btn-primary w-100 btn-login"
            disabled={isLoading}
          >
            {isLoading ? (
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
