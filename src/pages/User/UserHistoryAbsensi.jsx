import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const BASE_URL = "https://103.247.10.115:3050";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getWeekRange(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { start: mon, end: sun };
}

function formatDate(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function isoToDate(iso) {
  return new Date(iso);
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
      7,
    )
  );
}

function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

const STATUS = {
  hadir: {
    label: "Hadir",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.35)",
    icon: "✓",
  },
  izin: {
    label: "Izin",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.35)",
    icon: "⚠",
  },
  absen: {
    label: "Tidak Hadir",
    color: "#ef4444",
    bg: "rgba(250, 0, 0, 0.12)",
    border: "rgba(239,68,68,0.35)",
    icon: "✗",
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS[status] || STATUS.absen;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.03em",
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span style={{ fontSize: 11 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function DayDot({ date, logEntry, isToday }) {
  const dayName = HARI[date.getDay()];
  const dayNum = date.getDate();
  const status = logEntry ? logEntry.status : null;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const cfg = status ? STATUS[status] : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "rgb(0, 0, 0)",
          fontWeight: 600,
          letterSpacing: "0.06em",
        }}
      >
        {dayName.slice(0, 3).toUpperCase()}
      </div>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          background: isToday
            ? "#0284c7"
            : cfg
              ? cfg.bg
              : "rgba(219, 216, 216, 0.18)",
          border: isToday
            ? "2px solid #38bdf8"
            : cfg
              ? `2px solid ${cfg.border}`
              : "2px solid rgba(150, 148, 148, 0.92)",
          color: isToday
            ? "#000000"
            : cfg
              ? cfg.color
              : isWeekend
                ? "rgb(167, 163, 163)"
                : "rgb(0, 0, 0)",
        }}
      >
        {dayNum}
      </div>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg ? cfg.color : "transparent",
        }}
      />
    </div>
  );
}

function WarningBanner({ absenDays }) {
  if (!absenDays.length) return null;
  return (
    <div
      style={{
        background: "rgba(255, 251, 251, 0.81)",
        padding: "0",
        borderRadius: 14,
        width: "100%",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          marginTop: 0,
          marginBottom: 0,
          borderRadius: 14,
          border: "1px solid rgba(247, 12, 12, 0.69)",
          background: "rgb(255, 255, 255)",
          padding: "14px 18px",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          boxShadow: "0 2px 2px -2px rgba(0, 0, 0, 0.3), 0 4px 5px -6px rgb(175, 79, 79)",
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>🚨</span>
        <div>
          <div
            style={{
              color: "#f50808",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 7,
            }}
          >
            Peringatan Ketidakhadiran
          </div>
          <div style={{ color: "#333", fontSize: 12, lineHeight: 1.6 }}>
            Kamu tidak hadir pada:{" "}
            <span style={{ color: "#f83131", fontWeight: 700 }}>
              {absenDays
                .map(
                  (d) =>
                    `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]}`,
                )
                .join(" - ")}
            </span>
            . Segera konfirmasi ke pembimbing jika ada keterangan.
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordRow({ log, index }) {
  const d = isoToDate(log.absen);
  const isAbsen = log.status === "absen";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 18px",
        borderRadius: 12,
        background: isAbsen
          ? "rgba(255, 235, 235, 0.97)"
          : "rgba(255, 255, 255, 0.98)",
        border: "1px solid rgba(185, 181, 181, 0.92)",
        gap: 14,
        boxShadow:
          "0 4px 7px -5px rgba(247, 14, 14, 0.3), 0 3px 6px -6px rgba(0, 0, 0, 0.3)",
        animation: `fadeUp 0.3s ease ${index * 0.04}s both`,
      }}
    >
      <div style={{ minWidth: 44, textAlign: "center" }}>
        <div
          style={{
            fontSize: 10,
            color: "rgb(0, 0, 0)",
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          {HARI[d.getDay()].slice(0, 3).toUpperCase()}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#000000",
            lineHeight: 1,
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {String(d.getDate()).padStart(2, "0")}
        </div>
        <div style={{ fontSize: 10, color: "rgb(0, 0, 0)" }}>
          {BULAN[d.getMonth()].slice(0, 3)}
        </div>
      </div>

      <div style={{ width: 1, height: 40, background: "rgba(200, 200, 200, 0.4)" }} />

      <div style={{ minWidth: 68 }}>
        {log.status === "hadir" ? (
          <>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "rgb(20, 20, 20)",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              {d.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgb(20, 20, 20)",
                letterSpacing: "0.05em",
              }}
            >
              SCAN QR
            </div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: "rgb(20, 20, 20)", fontStyle: "italic" }}>
            —
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {log.keterangan && (
        <div
          style={{
            fontSize: 11,
            color: "rgba(100,100,100,0.8)",
            maxWidth: 140,
            textAlign: "right",
          }}
        >
          {log.keterangan}
        </div>
      )}

      <StatusBadge status={log.status} />

      {isAbsen && <span style={{ fontSize: 16 }}>⚠️</span>}
    </div>
  );
}
export default function UserHistoryAbsensi() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const [weekOffset, setWeekOffset] = useState(0);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("x_token");

    if (!token) {
      setError("Sesi habis. Silakan login kembali.");
      setLoading(false);
      return;
    }

    const decoded = decodeJWT(token);
    if (decoded) {
      setUserName(decoded.name || decoded.username || "Pengguna");
      setUserInfo(decoded);
    }

    axios
      .get(`${BASE_URL}/api/user-akses/histori`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const rawData = res.data?.data ?? [];
        setLogs(rawData);
        setLoading(false);
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          setError("Sesi tidak valid. Silakan login kembali.");
        } else if (status === 404) {
          setError("Data absensi tidak ditemukan.");
        } else {
          setError("Gagal memuat data absensi. Periksa koneksi jaringan.");
        }
        setLoading(false);
      });
  }, []);

  const { start: weekStart, end: weekEnd } = useMemo(() => {
    const pivot = new Date();
    pivot.setDate(pivot.getDate() + weekOffset * 7);
    return getWeekRange(pivot);
  }, [weekOffset]);

  const weekLogs = useMemo(() => {
    return logs.filter((l) => {
      const d = isoToDate(l.absen);
      return d >= weekStart && d <= weekEnd;
    });
  }, [logs, weekStart, weekEnd]);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const absenDays = useMemo(() => {
    return weekDays
      .filter((d) => d.getDay() !== 0 && d.getDay() !== 6)
      .filter((d) => {
        const entry = weekLogs.find((l) => sameDay(isoToDate(l.absen), d));
        return entry && entry.status === "absen";
      });
  }, [weekDays, weekLogs]);
  const totalStats = useMemo(() => {
    const counts = { hadir: 0, izin: 0, absen: 0 };
    logs.forEach((l) => {
      if (counts[l.status] !== undefined) counts[l.status]++;
    });
    return counts;
  }, [logs]);

  const displayLogs = useMemo(() => {
    const filtered = filterStatus
      ? weekLogs.filter((l) => l.status === filterStatus)
      : weekLogs;
    return filtered.sort(
      (a, b) => new Date(b.absen) - new Date(a.absen),
    );
  }, [weekLogs, filterStatus]);

  const today = new Date();
  const weekNum = getWeekNumber(weekStart);
  const isCurrentWeek = weekOffset === 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          /* ── BACKGROUND BARU: biru-navy gelap ── */
          background: linear-gradient(160deg, #0a1628 0%, #0d1f3c 50%, #071018 100%);
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .week-btn:hover {
          background: rgba(2,132,199,0.3) !important;
          border-color: rgba(2,132,199,0.6) !important;
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.12) !important;
        }

        .stat-pill {
          flex: 1;
          padding: 10px 8px;
          border-radius: 12px;
          border: 1px solid rgba(238,238,238,0.96);
          background: rgba(255,251,251,0.81);
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
        }
        .stat-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0,0,0,0.1);
        }
      `}</style>

      <div>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 680,
            margin: "0 auto",
            padding: "24px 16px 60px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <button
              className="back-btn"
              onClick={() => window.history.back()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.transform = "translateX(-3px)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#ffffff",
                fontSize: "18px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                outline: "none",
              }}
            >
              <span style={{ marginTop: "-2px" }}>←</span>
            </button>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "rgb(255, 255, 255)",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                ABSENSI OJT BBPVP BEKASI
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#f1f5f9",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                Riwayat Kehadiran
              </div>
            </div>
          </div>
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "3px solid rgba(2,132,199,0.2)",
                  borderTopColor: "#0284c7",
                  margin: "0 auto 16px",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
                Memuat data absensi...
              </div>
            </div>
          )}
          {!loading && error && (
            <div
              style={{
                padding: 24,
                borderRadius: 14,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                textAlign: "center",
                color: "#fca5a5",
                fontSize: 14,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
              {error}
            </div>
          )}
          {!loading && !error && (
            <>
              <div
                style={{
                  borderRadius: 18,
                  background:
                    "linear-gradient(135deg, rgb(220, 240, 247) 0%, rgb(220, 240, 247) 100%)",
                  border: "1px solid rgba(12, 88, 253, 0.3)",
                  padding: "20px 22px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: "'Syne', sans-serif",
                    boxShadow: "0 4px 14px rgba(2,132,199,0.45)",
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#050505",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {userName}
                  </div>
                  <div style={{ fontSize: 12, color: "rgb(8, 8, 8)", marginTop: 2 }}>
                    Peserta OJT · {userInfo?.jurusan || "PT. Geo Mandiri Kreasi"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgb(15, 15, 15)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    HARI INI
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#080808",
                      marginTop: 2,
                    }}
                  >
                    {HARI[today.getDay()]}, {today.getDate()}{" "}
                    {BULAN[today.getMonth()]}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 6, padding: "0 2px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 8 }}>
                  TOTAL KESELURUHAN
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                {["hadir", "izin", "absen"].map((s) => {
                  const cfg = STATUS[s];
                  const isActive = filterStatus === s;
                  return (
                    <button
                      key={s}
                      className="stat-pill"
                      onClick={() => setFilterStatus(filterStatus === s ? null : s)}
                      style={{
                        position: "relative",
                        overflow: "hidden",

                        flex: 1,
                        padding: "10px 8px",
                        borderRadius: 12,

                        border: isActive
                          ? `1.5px solid ${cfg.border}`
                          : "1px solid rgba(238, 238, 238, 0.96)",

                        background: "rgba(255, 251, 251, 0.81)",

                        boxShadow: isActive
                          ? `0 0 18px -8px ${cfg.color}`
                          : "0 2px 6px rgba(0,0,0,0.04)",

                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.25s ease",

                        transform: isActive
                          ? "translateY(-2px)"
                          : "translateY(0)",
                      }}
                    >
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: cfg.color,
                            opacity: 0.18,
                            zIndex: 0,
                          }}
                        />
                      )}
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div
                          style={{
                            color: cfg.color,
                            fontSize: 19,
                            fontWeight: 800,
                            fontFamily: "'Syne', sans-serif",
                          }}
                        >
                          {totalStats[s]}
                        </div>

                        <div
                          style={{
                            color: "#000",
                            fontSize: 11,
                            marginTop: 3,
                            fontWeight: isActive ? 700 : 400,
                          }}
                        >
                          {cfg.label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <button
                  className="week-btn"
                  onClick={() => setWeekOffset((o) => o - 1)}
                  style={{
                    background: "rgba(255, 251, 251, 0.81)",
                    border: "1px solid rgba(238, 238, 238, 0.96)",
                    borderRadius: 10,
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                    color: "#000000",
                    fontSize: 17,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  ‹
                </button>

                <div
                  style={{
                    flex: 1,
                    textAlign: "center",
                    background: "rgba(255, 251, 251, 0.81)",
                    border: "1px solid rgba(238, 238, 238, 0.96)",
                    borderRadius: 10,
                    padding: "8px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#000000",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {isCurrentWeek ? "🗓 Minggu Ini" : `Minggu ke-${weekNum}`}
                  </div>
                  <div style={{ fontSize: 11, color: "rgb(0, 0, 0)", marginTop: 1 }}>
                    {formatDate(weekStart)} – {formatDate(weekEnd)}
                  </div>
                </div>

                <button
                  className="week-btn"
                  onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}
                  disabled={isCurrentWeek}
                  style={{
                    background: "rgba(255, 251, 251, 0.81)",
                    border: "1px solid rgba(238, 238, 238, 0.96)",
                    borderRadius: 10,
                    width: 36,
                    height: 36,
                    cursor: isCurrentWeek ? "not-allowed" : "pointer",
                    color: isCurrentWeek ? "rgba(0,0,0,0.3)" : "#000000",
                    fontSize: 17,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  ›
                </button>
              </div>
              <div
                style={{
                  borderRadius: 16,
                  background: "rgba(255, 251, 251, 0.81)",
                  border: "1px solid rgba(238, 238, 238, 0.96)",
                  padding: "16px 12px",
                  display: "flex",
                  justifyContent: "space-around",
                  marginBottom: 12,
                  backdropFilter: "blur(8px)",
                }}
              >
                {weekDays.map((d, i) => {
                  const entry = weekLogs.find((l) =>
                    sameDay(isoToDate(l.absen), d),
                  );
                  return (
                    <DayDot
                      key={i}
                      date={d}
                      logEntry={entry}
                      isToday={sameDay(d, today)}
                    />
                  );
                })}
              </div>
              {filterStatus && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    padding: "0 4px",
                  }}
                >
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                    Filter aktif:{" "}
                    <span style={{ color: STATUS[filterStatus].color, fontWeight: 600 }}>
                      {STATUS[filterStatus].label}
                    </span>
                  </div>
                  <button
                    onClick={() => setFilterStatus(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,150,150,0.85)",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Hapus filter ✕
                  </button>
                </div>
              )}
              <div
                style={{
                  borderRadius: 16,
                  background: "rgba(255, 251, 251, 0.81)",
                  border: "1px solid rgba(32, 32, 32, 0.92)",
                  overflow: "hidden",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div
                  style={{
                    padding: "14px 18px 12px",
                    borderBottom: "1px solid rgba(238, 238, 238, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#000000",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    Log Kehadiran
                  </div>
                  <div style={{ fontSize: 11, color: "rgb(0, 0, 0)" }}>
                    {displayLogs.length} catatan minggu ini
                  </div>
                </div>

                {absenDays.length > 0 && (
                  <div style={{ padding: "12px 12px 0" }}>
                    <WarningBanner absenDays={absenDays} />
                  </div>
                )}

                <div
                  style={{
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {displayLogs.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "rgb(0, 0, 0)",
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                      Tidak ada data untuk minggu ini.
                    </div>
                  ) : (
                    displayLogs.map((log, i) => (
                      <RecordRow key={log.id} log={log} index={i} />
                    ))
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  justifyContent: "center",
                  marginTop: 24,
                  flexWrap: "wrap",
                }}
              >
                {Object.entries(STATUS).map(([key, cfg]) => (
                  <div
                    key={key}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: cfg.color,
                      }}
                    />
                    <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.83)" }}>
                      {cfg.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}