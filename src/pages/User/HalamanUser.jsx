import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";

function HalamanUser({ token, onLogout }) {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // toggle edit pin
    const [newPin, setNewPin] = useState(""); // nampung input pin baru
    const [showNotif, setShowNotif] = useState(false); // notif yg muncul cmn 3 detik
    const [error, setError] = useState(""); // nampung error dri api
    const navigate = useNavigate();
    const MySwal = withReactContent(Swal);
    const [oldPin, setOldPin] = useState("");

    // GET DATA USER
    useEffect(() => {
        if (!token) {
            setUser({
                username: "",
                nama_jurusan: "",
                no_hp: ""
            });
            return;
        }

        axios
            .get("https://api.zexdv.cloud/api/auth/get-profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                setTimeout(() => {
                    setUser(res.data.user);
                    setShowNotif(true); // tampil notif saat data berhasil
                }, 500);
            })
            .catch((err) => {
                console.log(err);
                setError("API belum tersedia / gagal mengambil data");
            });
    }, [token]);

    // notif auto hilang 3 detik
    useEffect(() => {
        if (showNotif) {
            const timer = setTimeout(() => setShowNotif(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showNotif]);

    // UPDATE PIN
    const handleSave = () => {
        if (!newPin) return;
        setError(""); // reset error biar clean
        axios
            .put(
                "https://api.zexdv.cloud/api/auth/update-pin",
                {
                    oldPin: oldPin,
                    newPin: newPin,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then(() => {
                setUser({ ...user, pin: newPin });
                setIsEditing(false);
                MySwal.fire({
                    title: "Berhasil Update PIN",
                    text: "PIN berhasil diperbarui!",
                    icon: "success",
                    width: "300px",
                    confirmButtonColor: "#10b981",
                    customClass: {
                        icon: 'swal2-small-icon',
                        title: 'swal2-small-title',
                        content: 'swal2-small-text'
                    }
                });
                setOldPin("");
                setNewPin("");
            })
            .catch((err) => {
                console.log(err);
                MySwal.fire({
                    title: "Gagal Update PIN",
                    text: err?.response?.data?.message || "PIN Lama salah atau server bermasalah",
                    icon: "error",
                    width: "300px",
                    confirmButtonColor: "#ef4444",
                    customClass: {
                        icon: 'swal2-small-icon',
                        title: 'swal2-small-title',
                        content: 'swal2-small-text'
                    }
                });
                setOldPin("");
            });
    };

    return (
        <div className="login-wrapper position-relative" style={{ paddingTop: "80px" }}>
            {!user ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        border: "3px solid rgba(37,99,235,0.2)",
                        borderTopColor: "#2563eb",
                        margin: "0 auto 16px",
                        animation: "spin 0.8s linear infinite",
                    }} />
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>Sedang memuat data...</div>
                </div>
            ) : (
                <>
                    {/* NOTIF */}
                    {showNotif && (
                        <div className="alert alert-success text-center position-absolute top-0 start-50 translate-middle-x mt-2 shadow">
                            Data Berhasil dimuat!
                        </div>
                    )}

                    {/* ERROR kecil (tidak nutup UI) */}
                    {error && (
                        <div className="alert alert-warning text-center mx-auto mt-2" style={{ maxWidth: "500px" }}>
                            {error}
                        </div>
                    )}

                    <div className="login-card">

                        {/* HEADER */}
                        <div className="login-header">
                            <div className="login-icon">
                                <i className="bi bi-person-check-fill"></i>
                            </div>
                            <h1 className="login-title">DATA KEHADIRAN OJT BBPVP BEKASI</h1>
                            <p className="login-subtitle">PT.GEO MANDIRI KREASI</p>
                        </div>

                        {/* DATA USER */}
                        <div className="login-form">

                            <div className="mb-2">
                                <label className="form-label fw-semibold">Nama</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bi bi-person-fill"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={user.username || ""}
                                        disabled
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="form-label fw-semibold">Jurusan</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bi bi-mortarboard-fill"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={user.nama_jurusan || ""}
                                        disabled
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="form-label fw-semibold">No HP</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bi bi-telephone-fill"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={user.no_hp || ""}
                                        disabled
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* BUTTON EDIT */}
                            <button
                                className={`btn w-100 mt-3 mb-2 ${isEditing ? "btn-danger" : "btn-primary"}`}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <i className="bi bi-pencil-fill me-2"></i>
                                {isEditing ? "Batal" : "Edit PIN"}
                            </button>

                            {/* FORM PIN BARU */}
                            <div className={`edit-pin-container ${isEditing ? "show mb-2" : ""}`}>
                                <div className="mb-2 px-3 border rounded" style={{ backgroundColor: "#f8f9fa" }}>
                                    <label className="form-label fw-semibold">PIN Lama</label>
                                    <div className="input-group mb-1">
                                        <span className="input-group-text">
                                            <i className="bi bi-key-fill"></i>
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control text-on-small"
                                            placeholder="Masukkan PIN lama"
                                            value={oldPin}
                                            onChange={(e) => setOldPin(e.target.value)}
                                        />
                                    </div>

                                    <label className="form-label fw-semibold">PIN Baru</label>
                                    <div className="input-group mb-2">
                                        <span className="input-group-text">
                                            <i className="bi bi-key-fill"></i>
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control text-on-small"
                                            placeholder="Masukkan PIN baru"
                                            value={newPin}
                                            onChange={(e) => setNewPin(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn btn-success w-100 mb-3"
                                    onClick={handleSave}
                                >
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    Simpan PIN
                                </button>
                            </div>

                            <button className="btn btn-outline-primary w-100 mb-2" onClick={() => navigate("/user/history")}>
                                <i className="bi bi-clock-history me-2"></i>
                                Lihat Riwayat Absen
                            </button>

                            <button className="btn btn-outline-primary w-100 mb-2" onClick={() => navigate("/user/qr")}>
                                <i className="bi bi-qr-code-scan me-2"></i>
                                Tampilkan QR Code
                            </button>

                            <button className="btn btn-outline-danger w-100 mt-3" onClick={onLogout}>
                                <i className="bi bi-box-arrow-right me-2"></i>
                                Logout
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default HalamanUser;