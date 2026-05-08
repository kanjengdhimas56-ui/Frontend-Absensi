import { useState, useEffect, useMemo } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BASE_URL = "https://your-api-url.com"; // ← Ganti dengan URL BE

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

function getWeekRange(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Minggu
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
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
        7
    )
  );
}

// ─── DECODE JWT (no library needed) ──────────────────────────────────────────
function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

// ─── STATUS CONFIG ───────────────────────────────────────────────────────────
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
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.35)",
    icon: "✗",
  },
};

// ─── MOCK DATA (hapus jika BE sudah siap) ────────────────────────────────────
function generateMockData(userName) {
  const today = new Date();
  const logs = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // skip weekend
    const rand = Math.random();
    let status = rand < 0.7 ? "hadir" : rand < 0.85 ? "izin" : "absen";
    const timeStr = status === "hadir"
      ? `0${7 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 59)).padStart(2, "0")}`
      : null;
    logs.push({
      id: i,
      timestamp: timeStr
        ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), ...timeStr.split(":")).toISOString()
        : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).toISOString(),
      status,
      keterangan: status === "izin" ? "Izin keperluan pribadi" : null,
      nama: userName || "Pengguna",
    });
  }
  return logs;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

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

function StatCard({ label, count, status, isActive, onClick }) {
  const cfg = STATUS[status];
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 100,
        padding: "18px 16px",
        borderRadius: 14,
        border: isActive ? `2px solid ${cfg.color}` : "2px solid rgb(252, 248, 248)",
        background: isActive ? cfg.bg : "rgb(255, 255, 255)",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ color: cfg.color, fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>
        {count}
      </div>
      <div style={{ color: "rgb(15, 15, 15)", fontSize: 12, marginTop: 3, letterSpacing: "0.04em" }}>
        {cfg.label}
      </div>
    </button>
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
      <div style={{ fontSize: 10, color: "rgb(12, 12, 12)", fontWeight: 600, letterSpacing: "0.06em" }}>
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
            ? "#2563eb"
            : cfg
            ? cfg.bg
            : "rgba(255,255,255,0.06)",
          border: isToday
            ? "2px solid #60a5fa"
            : cfg
            ? `2px solid ${cfg.border}`
            : "2px solid rgba(56, 54, 54, 0.66)",
          color: isToday ? "#0c0c0c" : cfg ? cfg.color : isWeekend ? "rgb(5, 5, 5)" : "rgba(14, 13, 13, 0.7)",
        }}
      >
        {dayNum}
      </div>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg ? cfg.color : "transparent" }} />
    </div>
  );
}

function WarningBanner({ absenDays }) {
  if (!absenDays.length) return null;
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid rgb(248, 245, 245)",
        background: "rgb(250, 249, 249)",
        padding: "14px 18px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 1 }}>🚨</span>
      <div>
        <div style={{ color: "#131212", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
          Peringatan Ketidakhadiran
        </div>
        <div style={{ color: "rgb(7, 7, 7)", fontSize: 12, lineHeight: 1.6 }}>
          Kamu tidak hadir pada:{" "}
          <span style={{ color: "#0c0c0c", fontWeight: 600 }}>
            {absenDays.map((d) => `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]}`).join(" • ")}
          </span>
          . Segera konfirmasi ke pembimbing jika ada keterangan.
        </div>
      </div>
    </div>
  );
}

function RecordRow({ log, index }) {
  const d = isoToDate(log.timestamp);
  const isAbsen = log.status === "absen";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 18px",
        borderRadius: 12,
        background: isAbsen ? "rgb(247, 243, 243)" : "rgb(255, 255, 255)",
        border: isAbsen ? "1px solid rgb(17, 17, 17)" : "1px solid rgb(15, 15, 15)",
        gap: 14,
        animation: `fadeUp 0.3s ease ${index * 0.04}s both`,
      }}
    >
      {/* Day indicator */}
      <div style={{ minWidth: 44, textAlign: "center" }}>
        <div style={{ fontSize: 10, color: "rgb(17, 17, 17)", fontWeight: 600, letterSpacing: "0.06em" }}>
          {HARI[d.getDay()].slice(0, 3).toUpperCase()}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#121313", lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>
          {String(d.getDate()).padStart(2, "0")}
        </div>
        <div style={{ fontSize: 10, color: "rgb(14, 13, 13)" }}>
          {BULAN[d.getMonth()].slice(0, 3)}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 40, background: "rgb(255, 255, 255)" }} />

      {/* Time */}
      <div style={{ minWidth: 68 }}>
        {log.status === "hadir" ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1b1b1b", fontFamily: "'Syne', sans-serif" }}>
              {new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ fontSize: 10, color: "rgb(12, 12, 12)", letterSpacing: "0.05em" }}>SCAN QR</div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: "rgb(10, 10, 10)", fontStyle: "italic" }}>—</div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Keterangan */}
      {log.keterangan && (
        <div style={{ fontSize: 11, color: "rgb(8, 8, 8)", maxWidth: 140, textAlign: "right" }}>
          {log.keterangan}
        </div>
      )}

      {/* Badge */}
      <StatusBadge status={log.status} />

      {/* Warning icon for absen */}
      {isAbsen && <span style={{ fontSize: 16 }}>⚠️</span>}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function UserHistoryAbsensi() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  // Week navigation: offset from current week (0 = this week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Status filter (null = all)
  const [filterStatus, setFilterStatus] = useState(null);

  // ── Fetch attendance log ──────────────────────────────────────────────────
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

    // ── Ganti bagian ini dengan API call BE yang sebenarnya ──────────────
    // Contoh endpoint yang diharapkan dari BE:
    // GET /user/log-absensi
    // Response: [{ id, timestamp, status: "hadir"|"izin"|"absen", keterangan?, nama }]
    //
    // fetch(`${BASE_URL}/user/log-absensi`, {
    //   headers: { Authorization: `Bearer ${token}` },
    // })
    //   .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    //   .then((data) => { setLogs(data); setLoading(false); })
    //   .catch((e) => { setError("Gagal memuat data absensi."); setLoading(false); });

    // MOCK — hapus setelah BE siap
    setTimeout(() => {
      const name = decoded?.name || "Demo User";
      setLogs(generateMockData(name));
      setLoading(false);
    }, 900);
  }, []);

  // ── Compute week range ────────────────────────────────────────────────────
  const { start: weekStart, end: weekEnd } = useMemo(() => {
    const pivot = new Date();
    pivot.setDate(pivot.getDate() + weekOffset * 7);
    return getWeekRange(pivot);
  }, [weekOffset]);

  // ── Filter logs for current week ─────────────────────────────────────────
  const weekLogs = useMemo(() => {
    return logs.filter((l) => {
      const d = isoToDate(l.timestamp);
      return d >= weekStart && d <= weekEnd;
    });
  }, [logs, weekStart, weekEnd]);

  // ── Build full week days (Mon–Fri for work) ───────────────────────────────
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  // ── Absen warning days (Absen on workdays in current week) ───────────────
  const absenDays = useMemo(() => {
    return weekDays
      .filter((d) => d.getDay() !== 0 && d.getDay() !== 6) // only weekdays
      .filter((d) => {
        const entry = weekLogs.find((l) => sameDay(isoToDate(l.timestamp), d));
        return entry && entry.status === "absen";
      });
  }, [weekDays, weekLogs]);

  // ── Stats (all-time) ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const counts = { hadir: 0, izin: 0, absen: 0 };
    weekLogs.forEach((l) => {
      if (counts[l.status] !== undefined) counts[l.status]++;
    });
    return counts;
  }, [weekLogs]);

  // ── Filtered display list ────────────────────────────────────────────────
  const displayLogs = useMemo(() => {
    const filtered = filterStatus ? weekLogs.filter((l) => l.status === filterStatus) : weekLogs;
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [weekLogs, filterStatus]);

  const today = new Date();
  const weekNum = getWeekNumber(weekStart);
  const isCurrentWeek = weekOffset === 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #060d1f;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .week-btn:hover {
          background: rgba(37,99,235,0.3) !important;
          border-color: rgba(37,99,235,0.6) !important;
        }
        .back-btn:hover {
          background: rgba(253, 249, 249, 0.1) !important;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(145deg, #060d1f 0%, #0d1b35 50%, #0a1628 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Background orbs ── */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        }}>
          <div className="login-wrapper" />
          <div />
        </div>

        {/* ── Content ── */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: 680, margin: "0 auto",
          padding: "24px 16px 60px",
        }}>

          {/* ── Header bar ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
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
    borderRadius: "12px", // Sedikit lebih bulat agar modern
    width: 42, // Sedikit lebih besar agar mudah diklik (Fitts's Law)
    height: 42,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#ffffff",
    fontSize: "18px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Transisi lebih smooth
    backdropFilter: "blur(10px)", // Efek kaca (Glassmorphism)
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    outline: "none",
  }}
>
  <span style={{ marginTop: "-2px" }}>←</span>
</button>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 10, color: "rgb(255, 255, 255)",
                letterSpacing: "0.1em", fontWeight: 600, textTransform: "uppercase",
              }}>
                ABSENSI OJT BBPVP BEKASI
              </div>
              <div style={{
                fontSize: 18, fontWeight: 800, color: "#f1f5f9",
                fontFamily: "'Syne', sans-serif",
              }}>
                Riwayat Kehadiran
              </div>
            </div>
            {/* Logo badge */}
            {/* <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
              fontSize: 18,
            }}>
              🛡️
            </div> */}
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "3px solid rgba(37,99,235,0.2)",
                borderTopColor: "#2563eb",
                margin: "0 auto 16px",
                animation: "spin 0.8s linear infinite",
              }} />
              <div style={{ color: "rgb(255, 255, 255)", fontSize: 14 }}>Memuat data absensi...</div>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div style={{
              padding: 24, borderRadius: 14,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(248, 8, 8, 0.3)",
              textAlign: "center", color: "#fca5a5",
            }}>
              {error}
            </div>
          )}

          {/* ── Main content ── */}
          {!loading && !error && (
            <>
              {/* ── User profile card ── */}
              <div style={{
                borderRadius: 18,
                background: "linear-gradient(135deg, rgb(241, 244, 245) 0%, rgb(240, 245, 247) 100%)",
                border: "1px solid rgba(37,99,235,0.3)",
                padding: "20px 22px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 16,
                backdropFilter: "blur(12px)",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 700, color: "#0c0c0c",
                  fontFamily: "'Syne', sans-serif",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.45)",
                }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 18, fontWeight: 800, color: "#050505",
                    fontFamily: "'Syne', sans-serif",
                  }}>
                    {userName}
                  </div>
                  <div style={{ fontSize: 12, color: "rgb(8, 8, 8)", marginTop: 2 }}>
                    Peserta OJT · {userInfo?.jurusan || "PT. Geo Mandiri Kreasi"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "rgb(15, 15, 15)", letterSpacing: "0.08em" }}>
                    HARI INI
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#080808", marginTop: 2 }}>
                    {HARI[today.getDay()]}, {today.getDate()} {BULAN[today.getMonth()]}
                  </div>
                </div>
              </div>

              {/* ── Week Navigator ── */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}>
                <button
                  className="week-btn"
                  onClick={() => setWeekOffset((o) => o - 1)}
                  style={{
                    background: "rgb(255, 255, 255)",
                    border: "1px solid rgba(3, 3, 3, 0.1)",
                    borderRadius: 10,
                    width: 36, height: 36,
                    cursor: "pointer",
                    color: "#0c0c0c", fontSize: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  ‹
                </button>

                <div style={{
                  flex: 1,
                  textAlign: "center",
                  background: "rgb(255, 255, 255)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "8px 16px",
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: "#0f0f0f",
                    fontFamily: "'Syne', sans-serif",
                  }}>
                    {isCurrentWeek ? "🗓 Minggu Ini" : `Minggu ke-${weekNum}`}
                  </div>
                  <div style={{ fontSize: 11, color: "rgb(8, 8, 8)", marginTop: 1 }}>
                    {formatDate(weekStart)} – {formatDate(weekEnd)}
                  </div>
                </div>

                <button
                  className="week-btn"
                  onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}
                  disabled={isCurrentWeek}
                  style={{
                    background: isCurrentWeek ? "rgb(255, 255, 255)" : "rgb(255, 252, 252)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    width: 36, height: 36,
                    cursor: isCurrentWeek ? "not-allowed" : "pointer",
                    color: isCurrentWeek ? "rgb(250, 247, 247)" : "#0f0f0f",
                    fontSize: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                >
                  ›
                </button>
              </div>

              {/* ── Mini calendar strip ── */}
              <div style={{
                borderRadius: 16,
                background: "rgb(255, 255, 255)",
                border: "1px solid rgba(255,255,255,0.07)",
                padding: "16px 12px",
                display: "flex",
                justifyContent: "space-around",
                marginBottom: 20,
                backdropFilter: "blur(8px)",
              }}>
                {weekDays.map((d, i) => {
                  const entry = weekLogs.find((l) => sameDay(isoToDate(l.timestamp), d));
                  return (
                    <DayDot key={i} date={d} logEntry={entry} isToday={sameDay(d, today)} />
                  );
                })}
              </div>

              {/* ── Warning banner ── */}
              {absenDays.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <WarningBanner absenDays={absenDays} />
                </div>
              )}

              {/* ── Stats cards ── */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {["hadir", "izin", "absen"].map((s) => (
                  <StatCard
                    key={s}
                    status={s}
                    label={STATUS[s].label}
                    count={stats[s]}
                    isActive={filterStatus === s}
                    onClick={() => setFilterStatus(filterStatus === s ? null : s)}
                  />
                ))}
              </div>

              {/* ── Filter label ── */}
              {filterStatus && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}>
                  <div style={{ fontSize: 12, color: "rgb(255, 255, 255)" }}>
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
                      color: "rgb(255, 255, 255)",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Hapus filter ✕
                  </button>
                </div>
              )}

              {/* ── Records list ── */}
              <div style={{
                borderRadius: 16,
                background: "rgb(255, 255, 255)",
                border: "1px solid rgb(8, 8, 8)",
                overflow: "hidden",
              }}>
                <div style={{
                  padding: "14px 18px 12px",
                  borderBottom: "1px solid rgb(7, 7, 7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0c0c0c",
                    fontFamily: "'Syne', sans-serif",
                  }}>
                    Log Kehadiran
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: "rgb(8, 8, 8)",
                  }}>
                    {displayLogs.length} catatan
                  </div>
                </div>

                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {displayLogs.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "rgb(255, 255, 255)",
                      fontSize: 13,
                    }}>
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

              {/* ── Legend ── */}
              <div style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                marginTop: 24,
                flexWrap: "wrap",
              }}>
                {Object.entries(STATUS).map(([key, cfg]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: cfg.color,
                    }} />
                    <span style={{ fontSize: 11, color: "rgb(255, 255, 255)" }}>
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
