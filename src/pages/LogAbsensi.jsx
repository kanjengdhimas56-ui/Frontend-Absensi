import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function LogAbsensi({ token, onLogout }) {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [lastFetch, setLastFetch] = useState(null);

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
          <span className="brand-text">Daftar Absen</span>
          <span className="badge bg-warning text-dark ms-2 badge-admin">Admin</span>
        </span>
        <div className="ms-auto d-flex align-items-center gap-3">
          {lastFetch && (
            <span className="small d-none d-md-block" style={{ color: "rgba(255,255,255,0.4)" }}>
              Update: {lastFetch.toLocaleTimeString("id-ID")}
            </span>
          )}
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

      {/* Main Content */}
      <div className="dashboard-content container-fluid px-4 py-4">
        {/* Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
          <div>
            <h2 className="page-title mb-1">Log Absensi</h2>
            <p className="page-subtitle mb-0 small">
              Menampilkan seluruh data kehadiran
            </p>
          </div>
          <div className="d-flex gap-2">
            <div className="stat-badge">
              <i className="bi bi-people-fill me-1"></i>
              <span>{filtered.length} Anomaly😂</span>
              {filterDate && <span style={{ color: "#fbbf24" }}> (difilter)</span>}
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
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                onClick={clearFilter}
              >
                <i className="bi bi-x-circle"></i>
                Hapus Filter
              </button>
            )}
          </div>
          {filterDate && (
            <div className="mt-2 small" style={{ color: "rgba(255,255,255,0.5)" }}>
              Menampilkan absensi tanggal{" "}
              <strong style={{ color: "rgba(255,255,255,0.85)" }}>
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
              <div className="spinner-border text-light" role="status"></div>
              <p className="mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>Memuat data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox display-4" style={{ color: "rgba(255,255,255,0.3)" }}></i>
              <p className="mt-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                {filterDate
                  ? "Tidak ada data absensi pada tanggal ini."
                  : "Belum ada data absensi."}
              </p>
              {filterDate && (
                <button className="btn btn-sm btn-outline-light" onClick={clearFilter}>
                  Tampilkan Semua
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: 50 }}>#</th>
                    <th><i className="bi bi-clock me-1" style={{ color: "#60a5fa" }}></i>Timestamp</th>
                    <th><i className="bi bi-person me-1" style={{ color: "#60a5fa" }}></i>Nama</th>
                    <th><i className="bi bi-telephone me-1" style={{ color: "#60a5fa" }}></i>No. Telepon</th>
                    <th><i className="bi bi-mortarboard me-1" style={{ color: "#60a5fa" }}></i>Jurusan</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, index) => (
                    <tr key={log.id || index}>
                      <td className="text-center small" style={{ color: "rgba(255,255,255,0.35)" }}>{index + 1}</td>
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
    </div>
  );
}
