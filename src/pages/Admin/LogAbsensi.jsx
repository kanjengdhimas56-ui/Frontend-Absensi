import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LogAbsensi({ token, onLogout }) {

  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJurusan, setfilterJurusan] = useState("");

  const [lastFetch, setLastFetch] = useState(null);

  const navigate = useNavigate();

  const fetchLogs = useCallback(async () => {

    setLoading(true);
    setError("");

    try {

      const res = await axios.get(
        "https://api.zexdv.cloud/api/admin-only/log",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  const getStatusColor = (status) => {

    switch (status) {
      case "hadir":
        return "success";

      case "izin":
        return "warning";

      case "sakit":
        return "warning";

      case "alpha":
        return "danger";

      default:
        return "secondary";
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {

    let result = [...logs];

    if (filterDate) {

      result = result.filter((log) => {

        if (!log.absen) return false;

        const logDate = String(log.absen)
          .split("T")[0]
          .split(" ")[0];

        return logDate === filterDate;
      });
    }

    if (filterStatus) {

      result = result.filter(
        (log) =>
          String(log.status).toLowerCase() ===
          filterStatus.toLowerCase()
      );
    }

    if (filterJurusan) {
      result = result.filter(
        (log) =>
          String(log.nama_jurusan).toLocaleLowerCase() ===
        filterJurusan.toLocaleLowerCase()
      )
    }

    setFiltered(result);

  }, [filterDate, filterStatus, filterJurusan, logs]);

  const clearFilter = () => {
    setFilterDate("");
    setFilterStatus("");
    setFilterJurusan("");
  };

  const formatTimestamp = (ts) => {

    if (!ts) return "-";

    const date = new Date(ts);

    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="dashboard-wrapper">

      <nav className="navbar navbar-expand navbar-dark top-navbar px-4">

        <span className="navbar-brand d-flex align-items-center gap-2">
          <i className="bi bi-clipboard2-check-fill"></i>

          <span className="brand-text">
            Daftar Absen
          </span>

          <span className="badge bg-warning text-dark ms-2 hide-on-small badge-admin">
            Admin
          </span>
        </span>

        <div className="ms-auto d-flex align-items-center gap-3">

          {lastFetch && (
            <span
              className="small d-none d-md-block"
              style={{
                color: "rgba(255,255,255,0.4)"
              }}
            >
              Update: {lastFetch.toLocaleTimeString("id-ID")}
            </span>
          )}

          <button
            className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1"
            onClick={() => navigate("/scanner")}
            title="Buka Scanner QR"
          >
            <i className="bi bi-qr-code-scan"></i>

            <span className="d-none d-md-inline">
              Scanner
            </span>
          </button>

          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
            onClick={fetchLogs}
            disabled={loading}
            title="Refresh data"
          >
            <i
              className={`bi bi-arrow-clockwise ${
                loading ? "spin" : ""
              }`}
            ></i>

            <span className="d-none d-md-inline">
              Refresh
            </span>
          </button>

          <button
            className="btn btn-danger btn-sm d-flex align-items-center gap-1"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-right"></i>

            <span className="d-none d-md-inline">
              Logout
            </span>
          </button>
        </div>
      </nav>

      <div className="dashboard-content container-fluid px-4 py-4">

        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">

          <div>
            <h2 className="page-title mb-1">
              Log Absensi
            </h2>

            <p className="page-subtitle mb-0 small">
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

              <span
                style={{
                  color: "rgba(255, 255, 255, 0.85)"
                }}
              >
                {filtered.length} User
              </span>

              {(filterDate || filterStatus || filterJurusan) && (
                <span style={{ color: "#fbbf24" }}>
                  {" "}
                  (difilter)
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="filter-card mb-4">

          <div className="d-flex flex-wrap align-items-end gap-3">
            <div
              className="flex-grow-1"
              style={{ maxWidth: 280 }}
            >
              <label className="form-label fw-semibold mb-1">
                <i className="bi bi-calendar3 me-1"></i>
                Filter Tanggal
              </label>

              <input
                type="date"
                className="form-control"
                value={filterDate}
                onChange={(e) =>
                  setFilterDate(e.target.value)
                }
              />
            </div>

            <div style={{ minWidth: 200 }}>

              <label className="form-label fw-semibold mb-1">
                <i className="bi bi-funnel me-1"></i>
                Filter Keterangan
              </label>

              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value)
                }
              >
                <option value="">
                  Semua
                </option>

                <option value="hadir">
                  Hadir
                </option>

                <option value="izin">
                  Izin
                </option>

                <option value="sakit">
                  Sakit
                </option>

                <option value="alpha">
                  Alpha
                </option>
              </select>
            </div>
              
            <div style={{ minWidth: 200 }}>
              <label className="form-label fw-semibold mb-1">
                <i className="bi bi-funnel me-1"></i>
                Filter Jurusan
              </label>

              <select className="form-select"
                value={filterJurusan}
                onChange={(e) =>
                  setfilterJurusan(e.target.value)
                }
              >
                <option value="">
                  Semua
                </option>
                <option value="Pengembangan web dengan node JS dan react">
                  Pengembangan Web...
                </option>
                <option value="Pengelolaan Logistik Melalui Teknologi Monitoring Tracking Digital">
                  Pengelolaan Logistik...
                </option>
                <option value="Pemasangan Sistem Integrasi Bangunan Cerdas">
                  Sistem Integrasi Bangunan Cerdas
                </option>
              </select>
            </div>
            {(filterDate || filterStatus || filterJurusan) && (
              <button
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                style={{
                  borderColor: "rgba(0, 0, 0, 0.085)",
                  color: "rgba(0, 0, 0, 0.5)",
                }}
                onClick={clearFilter}
              >
                <i className="bi bi-x-circle"></i>
                Hapus Filter
              </button>
            )}
          </div>

          {filterDate && (
            <div className="mt-2 small">

              Menampilkan absensi tanggal{" "}

              <strong
                style={{
                  color: "#60a5fad7"
                }}
              >
                {new Date(filterDate).toLocaleDateString(
                  "id-ID",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </strong>
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2">

            <i className="bi bi-exclamation-triangle-fill"></i>

            <span>{error}</span>

            <button
              className="btn btn-sm btn-outline-danger ms-auto"
              onClick={fetchLogs}
            >
              Coba Lagi
            </button>
          </div>
        )}
        <div className="table-card">

          {loading ? (

            <div className="loading-state">

              <div
                className="spinner-border text-light"
                role="status"
              ></div>

              <p
                className="mt-3"
                style={{
                  color: "rgba(0, 0, 0, 0.4)"
                }}
              >
                Memuat data...
              </p>
            </div>

          ) : filtered.length === 0 ? (

            <div className="empty-state">

              <i
                className="bi bi-inbox display-4"
                style={{
                  color: "rgba(0, 0, 0, 0.3)"
                }}
              ></i>

              <p
                className="mt-3"
                style={{
                  color: "rgba(0, 0, 0, 0.4)"
                }}
              >
                {(filterDate || filterStatus || filterJurusan)
                  ? "Tidak ada data sesuai filter."
                  : "Belum ada data absensi."}
              </p>

              {(filterDate || filterStatus || filterJurusan) && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={clearFilter}
                >
                  Tampilkan Semua
                </button>
              )}
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>

                    <th
                      className="text-center"
                      style={{ width: 50 }}
                    >
                      #
                    </th>

                    <th>
                      <i
                        className="bi bi-clock me-1"
                        style={{ color: "#60a5fa" }}
                      ></i>

                      Timestamp
                    </th>

                    <th>
                      <i
                        className="bi bi-person me-1"
                        style={{ color: "#60a5fa" }}
                      ></i>

                      Nama
                    </th>

                    <th>
                      <i
                        className="bi bi-telephone me-1"
                        style={{ color: "#60a5fa" }}
                      ></i>

                      No. Telepon
                    </th>

                    <th>
                      <i
                        className="bi bi-mortarboard me-1"
                        style={{ color: "#60a5fa" }}
                      ></i>

                      Jurusan
                    </th>

                    <th>
                      <i
                        className="bi bi-info-circle me-1"
                        style={{ color: "#60a5fa" }}
                      ></i>

                      Keterangan
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filtered.map((log, index) => (

                    <tr key={log.id || index}>

                      <td
                        className="text-center small"
                        style={{
                          color: "rgba(0, 0, 0, 0.85)"
                        }}
                      >
                        {index + 1}
                      </td>

                      <td>
                        <span className="timestamp-badge">
                          {formatTimestamp(log.absen)}
                        </span>
                      </td>

                      <td
                        style={{
                          color: "rgba(0, 0, 0, 1)"
                        }}
                      >
                        {log.username || "-"}
                      </td>

                      <td
                        style={{
                          color: "rgba(0, 0, 0, 0.75)"
                        }}
                      >
                        {log.no_hp || "-"}
                      </td>

                      <td
                        style={{
                          color: "rgba(0, 0, 0, 0.75)"
                        }}
                      >
                        {log.nama_jurusan || "-"}
                      </td>

                      <td>
                        <span
                          className={`badge bg-${getStatusColor(
                            log.status
                          )}`}
                        >
                          {log.status || "-"}
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
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow =
            "0 6px 20px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 4px 16px rgba(0,0,0,0.25)";
        }}
      >
        <i
          className="bi bi-qr-code-scan"
          style={{
            fontSize: 24,
            color: "#212529",
          }}
        ></i>
      </button>
    </div>
  );
}