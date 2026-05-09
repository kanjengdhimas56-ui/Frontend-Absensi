import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LogAbsensi({ token, onLogout }) {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [lastFetch, setLastFetch] = useState(null);

  const navigate = useNavigate();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://103.247.10.115:3050/api/admin-only/log", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLogs(res.data.data || []);
      setFiltered(res.data.data || []);
      setLastFetch(new Date());
    } catch (err) {
      if (err.response && err.response.status === 401) {
        onLogout();
      } else {
        setError("Gagal mengambil data.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!filterDate) {
      setFiltered(logs);
      return;
    }
    const result = logs.filter((log) => {
      if (!log.absen) return false;
      const logDate = new Date(log.absen).toISOString().split("T")[0];
      return logDate === filterDate;
    });
    setFiltered(result);
  }, [filterDate, logs]);

  const clearFilter = () => setFilterDate("");

  const formatTimestamp = (ts) => {
    if (!ts) return "-";
    return new Date(ts).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="dashboard-wrapper">
      {/* Navbar */}
      <nav className="navbar navbar-expand navbar-dark top-navbar px-4">
        <span className="navbar-brand d-flex align-items-center gap-2">
          <i className="bi bi-clipboard2-check-fill"></i>
          <span className="brand-text">AbsensiApp</span>
          <span className="badge bg-warning text-dark ms-2 badge-admin">Admin</span>
        </span>
        <div className="ms-auto d-flex align-items-center gap-3">
          {lastFetch && (
            <span className="text-muted small d-none d-md-block">
              Update: {lastFetch.toLocaleTimeString("id-ID")}
            </span>
          )}

          <button
            className="btn btn-warning btn-sm d-flex align-items-center gap-1"
            onClick={() => navigate("/scanner")}
            title="Buka Scanner QR"
          >
            <i className="bi bi-qr-code-scan"></i>
            <span className="d-none d-md-inline">Scanner</span>
          </button>

          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
            onClick={fetchLogs}
            disabled={loading}
            title="Refresh data"
          >
            <i className={`bi bi-arrow-clockwise ${loading ? "spin" : ""}`}></i>
            <span className="d-none d-md-inline">Refresh</span>
          </button>
          <button
            className="btn btn-danger btn-sm d-flex align-items-center gap-1"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span className="d-none d-md-inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="dashboard-content container-fluid px-4 py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
          <div>
            <h2 className="page-title mb-1">Log Absensi</h2>
            <p className="text-muted mb-0 small">
              Menampilkan seluruh data kehadiran
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-warning d-flex align-items-center gap-2"
              onClick={() => navigate("/scanner")}
            >
              <i className="bi bi-qr-code-scan"></i>
              Buka Scanner
            </button>

            <div className="stat-badge">
              <i className="bi bi-people-fill me-1"></i>
              <span>{filtered.length} entri</span>
              {filterDate && <span className="text-warning"> (difilter)</span>}
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="filter-card mb-4">
          <div className="d-flex flex-wrap align-items-end gap-3">
            <div className="flex-grow-1" style={{ maxWidth: 280 }}>
              <label className="form-label fw-semibold mb-1">
                <i className="bi bi-calendar3 me-1"></i>Filter Tanggal
              </label>
              <input
                type="date"
                className="form-control"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            {filterDate && (
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-1"
                onClick={clearFilter}
              >
                <i className="bi bi-x-circle"></i>
                Hapus Filter
              </button>
            )}
          </div>
          {filterDate && (
            <div className="mt-2 text-muted small">
              Menampilkan absensi tanggal{" "}
              <strong>
                {new Date(filterDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
            <button className="btn btn-sm btn-outline-danger ms-auto" onClick={fetchLogs}>
              Coba Lagi
            </button>
          </div>
        )}

        {/* Table */}
        <div className="table-card">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Memuat data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox display-4 text-muted"></i>
              <p className="mt-3 text-muted">
                {filterDate
                  ? "Tidak ada data absensi pada tanggal ini."
                  : "Belum ada data absensi."}
              </p>
              <div className="d-flex gap-2 justify-content-center mt-2">
                {filterDate && (
                  <button className="btn btn-sm btn-outline-primary" onClick={clearFilter}>
                    Tampilkan Semua
                  </button>
                )}
                <button
                  className="btn btn-sm btn-warning d-flex align-items-center gap-1"
                  onClick={() => navigate("/scanner")}
                >
                  <i className="bi bi-qr-code-scan"></i>
                  Mulai Scan
                </button>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: 50 }}>#</th>
                    <th>
                      <i className="bi bi-clock me-1 text-primary"></i>Timestamp
                    </th>
                    <th>
                      <i className="bi bi-person me-1 text-primary"></i>Nama
                    </th>
                    <th>
                      <i className="bi bi-telephone me-1 text-primary"></i>No. Telepon
                    </th>
                    <th>
                      <i className="bi bi-mortarboard me-1 text-primary"></i>Jurusan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, index) => (
                    <tr key={log.id || index} className="table-row-anim">
                      <td className="text-center text-muted small">{index + 1}</td>
                      <td>
                        <span className="timestamp-badge">
                          {formatTimestamp(log.absen)}
                        </span>
                      </td>
                      <td className="fw-semibold">{log.username || "-"}</td>
                      <td>{log.no_hp || "-"}</td>
                      <td>
                        <span className="jurusan-badge">
                          {log.nama_jurusan || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => navigate("/scanner")}
        title="Buka Scanner QR"
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#ffc107",
          border: "none",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1050,
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
        }}
      >
        <i className="bi bi-qr-code-scan" style={{ fontSize: 24, color: "#212529" }}></i>
      </button>
    </div>
  );
}