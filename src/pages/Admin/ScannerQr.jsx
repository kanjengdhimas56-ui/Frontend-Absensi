import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom"
import axios from "axios"
import { QrReader } from "react-qr-reader"

export default function ScannerQr({ token }) {
    const [scanResult, setScanResult] = useState("")
    const [message, setMessage] = useState("")
    const [status, setStatus] = useState("")
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [isExiting, setIsExiting] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const qrRef = useRef(null)
    const navigate = useNavigate()

    const handleBack = () => {
        setIsCameraActive(false)
        setIsExiting(true)
        window.location.href = "/admin"
    }

    const handleRefresh = () => {
        setIsRefreshing(true)
        setScanResult("")
        setMessage("")
        setStatus("")
        setIsExiting(false)
        window.location.reload();
    };

    const kirimQR = async (qrValue) => {
        try {
            setStatus("loading")
            setIsLoading(true)
            setMessage("")

            const response = await axios.post("https://api.zexdv.cloud/api/scanner/scan",
                { qr: qrValue },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setMessage(response.data.message)
            setStatus("success")
        } catch (err) {
            setMessage(err.response?.data?.message || "Terjadi kesalahan")
            setStatus("error")
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        setIsCameraActive(true)
        return () => {
            setIsCameraActive(false)
        }
    }, [])

    useEffect(() => {
        if (scanResult && status !== "loading") kirimQR(scanResult)
    }, [scanResult])
    return (
        <div className="login-wrapper position-relative">
            <div style={{ width: "100%", maxWidth: 420 }}>
                <div
                    style={{
                        marginBottom: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        position: "relative",
                        zIndex: 100
                    }}
                >
                    <button
                        // className="col-4"
                        onClick={handleBack}
                        style={{
                            position: "relative",
                            zIndex: 101,
                            display: "inline-flex",
                            width: "fit-content",
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 10,
                            padding: "8px 14px",
                            color: "rgba(255,255,255,0.85)",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "background 0.2s, border-color 0.2s",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.18)"
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.1)"
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
                        }}
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div
                        style={{
                            position: "relative",
                            zIndex: 101,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 56,
                            height: 56,
                            background: "rgba(255,255,255,0.12)",
                            border: "1.5px solid rgba(255,255,255,0.25)",
                            borderRadius: 16,
                            marginBottom: "0",
                        }}
                    >
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.8">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="3" height="3" />
                            <rect x="18" y="14" width="3" height="3" />
                            <rect x="14" y="18" width="3" height="3" />
                            <rect x="18" y="18" width="3" height="3" />
                        </svg>
                    </div>

                    <button
                        onClick={handleRefresh}
                        style={{
                            display: "inline-flex",
                            width: "fit-content",
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 10,
                            padding: "8px 14px",
                            color: "rgba(255,255,255,0.85)",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "background 0.2s, border-color 0.2s",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.18)"
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.1)"
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
                        }}
                        disabled={isLoading}
                        title="Scan QR"
                    >
                        <i className={`bi bi-arrow-clockwise ${isRefreshing ? "spin" : ""}`}></i>
                    </button>
                </div>

                <div className="text-center mb-4">

                    <h4 style={{ color: "#fff", fontWeight: 500, marginBottom: 4 }}>
                        Scanner QR Absensi
                    </h4>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: 0 }}>
                        Arahkan kamera ke kode QR peserta
                    </p>
                </div>

                <div
                    className={`${isExiting ? "page-fade-out" : "page-fade-in"}`}
                    style={{
                        background: "rgba(255,255,255,0.97)",
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                        // animation: "fadeIn 0.6s ease-in-out",
                        // animationFillMode: "forwards",
                        // animationTimingFunction: "ease-in-out",
                        // animationDelay: "0s",
                    }}
                >
                    <div style={{ position: "relative", background: "#0a0f1e" }}>
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 10,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                pointerEvents: "none",
                            }}
                        >
                            <div style={{ position: "relative", width: 200, height: 200 }}>
                                {[
                                    { top: 0, left: 0, borderTop: "3px solid #4f9cf9", borderLeft: "3px solid #4f9cf9", borderRadius: "4px 0 0 0" },
                                    { top: 0, right: 0, borderTop: "3px solid #4f9cf9", borderRight: "3px solid #4f9cf9", borderRadius: "0 4px 0 0" },
                                    { bottom: 0, left: 0, borderBottom: "3px solid #4f9cf9", borderLeft: "3px solid #4f9cf9", borderRadius: "0 0 0 4px" },
                                    { bottom: 0, right: 0, borderBottom: "3px solid #4f9cf9", borderRight: "3px solid #4f9cf9", borderRadius: "0 0 4px 0" },
                                ].map((s, i) => (
                                    <div key={i} style={{ position: "absolute", width: 32, height: 32, ...s }} />
                                ))}
                                <div style={{ position: "absolute", left: 4, right: 4, height: 2, background: "linear-gradient(90deg, transparent, #4f9cf9, #7bb8ff, #4f9cf9, transparent)", borderRadius: 2, animation: "scanLine 2.2s ease-in-out infinite" }} />
                            </div>
                        </div>

                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 5,
                                background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)",
                                pointerEvents: "none",
                            }}
                        />

                        {isCameraActive ? (
                            <QrReader
                                key="qr-reader"
                                ref={qrRef}
                                delay={300}
                                onError={err => console.error(err)}
                                constraints={{ facingMode: "environment" }}
                                onResult={(result, error) => {
                                    if (result) {
                                        const text = result?.text
                                        if (text && text !== scanResult) setScanResult(text)
                                    }
                                }}
                                style={{ width: "100%", display: "block" }}
                                videoStyle={{ width: "100%", display: "block" }}
                            />) : (
                            <div style={{ width: "100%", paddingTop: "75%", background: "#000" }} />
                        )}

                        <div
                            style={{
                                position: "absolute",
                                bottom: 14,
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "rgba(79,156,249,0.2)",
                                border: "1px solid rgba(79,156,249,0.45)",
                                borderRadius: 20,
                                padding: "5px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                zIndex: 20,
                                whiteSpace: "nowrap",
                            }}
                        >
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    background: "#4f9cf9",
                                    borderRadius: "50%",
                                    display: "inline-block",
                                    animation: "pulseDot 1.4s ease-in-out infinite",
                                }}
                            />
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                                Kamera aktif
                            </span>
                        </div>
                    </div>

                    <div style={{ padding: "1.25rem" }}>

                        <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                            Hasil Scan
                        </p>
                        <div
                            style={{
                                background: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                                borderRadius: 10,
                                padding: "10px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                minHeight: 42,
                                marginBottom: "1rem",
                            }}
                        >
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="1.8" style={{ flexShrink: 0 }}>
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="3" height="3" />
                                <rect x="18" y="14" width="3" height="3" />
                                <rect x="14" y="18" width="3" height="3" />
                                <rect x="18" y="18" width="3" height="3" />
                            </svg>
                            <span style={{ fontSize: 13, color: scanResult ? "#1e293b" : "#94a3b8", fontFamily: "monospace", wordBreak: "break-all" }}>
                                {scanResult || "Belum ada QR terdeteksi…"}
                            </span>
                        </div>

                        {status === "loading" && (
                            <div
                                style={{
                                    background: "#fffbeb",
                                    border: "1px solid #fde68a",
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: "1rem",
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ animation: "spinIcon 1s linear infinite", flexShrink: 0 }}>
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 500, color: "#92400e", margin: 0 }}>Memproses</p>
                                    <p style={{ fontSize: 12, color: "#b45309", margin: 0 }}>Mengirim data absensi…</p>
                                </div>
                            </div>
                        )}

                        {status === "success" && message && (
                            <div
                                style={{
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: "1rem",
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M8 12l3 3 5-5" />
                                </svg>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 500, color: "#14532d", margin: 0 }}>Berhasil</p>
                                    <p style={{ fontSize: 12, color: "#15803d", margin: 0 }}>{message}</p>
                                </div>
                            </div>
                        )}

                        {status === "error" && message && (
                            <div
                                style={{
                                    background: "#fff1f2",
                                    border: "1px solid #fecdd3",
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: "1rem",
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 8v4M12 16h.01" />
                                </svg>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 500, color: "#7f1d1d", margin: 0 }}>Gagal</p>
                                    <p style={{ fontSize: 12, color: "#b91c1c", margin: 0 }}>{message}</p>
                                </div>
                            </div>
                        )}

                        <div style={{ height: 1, background: "#e2e8f0", margin: "0 -1.25rem 1rem" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                Terenkripsi &amp; aman
                            </span>
                            <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" /></svg>
                                Terhubung ke server
                            </span>
                        </div>
                    </div>
                </div>

                <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: "1.25rem" }}>
                    Setiap QR hanya akan diproses sekali
                </p>
            </div>

            <style>{`
        @keyframes scanLine {
          0%   { top: 10px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: calc(100% - 12px); opacity: 0; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes spinIcon {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}