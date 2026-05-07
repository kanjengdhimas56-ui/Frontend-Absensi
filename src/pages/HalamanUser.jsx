import { useEffect, useState } from "react";
import axios from "axios";

// Ganti BASE_URL ini setelah BE siap
const BASE_URL = "http://103.247.10.115:3050";

function HalamanUser({ token }) {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // toggle edit pin
    const [newPin, setNewPin] = useState(""); // nampung input pin baru
    const [showNotif, setShowNotif] = useState(false); // notif yg muncul cmn 3 detik
    const [error, setError] = useState(""); // nampung error dri api

    // GET DATA USER
    useEffect(() => {
        if (!token) {
            setUser({
                nama: "-",
                jurusan: "-",
                noHp: "-",
                pin: "-"
            });
            return;
        }

        axios
            .get(`${BASE_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                setUser(res.data);
                setShowNotif(true); // tampil notif saat data berhasil
            })
            .catch((err) => {
                console.log(err);
                setError("API belum tersedia / gagal mengambil data");
            });
    }, [token]);

    // notif auto hilang 3 detik
    useEffect(() => {
        if (showNotif) {
            const timer = setTimeout(() => setShowNotif(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showNotif]);

    // UPDATE PIN
    const handleSave = () => {
        if (!newPin) return;

        setError(""); // reset error biar clean

        axios
            .put(
                `${BASE_URL}/update-pin`,
                {
                    pin: newPin,
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
                setNewPin("");
                setShowNotif(true);
            })
            .catch((err) => {
                console.log(err);
                setError("Gagal update PIN");
            });
    };

    // loading state (FIX biar gak blank)
    if (!user) {
        return <p className="text-center mt-5">Loading...</p>;
    }

    return (
        <div className="login-wrapper position-relative" style={{ paddingTop: "80px" }}>

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

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Nama</label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="bi bi-person-fill"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                value={user?.nama || ""}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Jurusan</label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="bi bi-mortarboard-fill"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                value={user?.jurusan || ""}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">No HP</label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="bi bi-telephone-fill"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                value={user?.noHp || ""}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* PIN */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">PIN</label>

                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="bi bi-key-fill"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                value={user?.pin || ""}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* BUTTON EDIT */}
                    <button
                        className="btn btn-primary w-100 mb-2"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        <i className="bi bi-pencil-fill me-2"></i>
                        {isEditing ? "Batal" : "Edit PIN"}
                    </button>

                    {/* FORM PIN BARU */}
                    {isEditing && (
                        <div className="mt-3">
                            <label className="form-label fw-semibold">PIN Baru</label>

                            <div className="input-group mb-2">
                                <span className="input-group-text">
                                    <i className="bi bi-key-fill"></i>
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Masukkan PIN baru"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn btn-success w-100"
                                onClick={handleSave}
                            >
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Simpan PIN
                            </button>
                        </div>
                    )}

                    <button className="btn btn-outline-primary w-100">
                        <i className="bi bi-clock-history me-2"></i>
                        Lihat Riwayat Absen
                    </button>

                </div>
            </div>
        </div>
    );
}

export default HalamanUser;