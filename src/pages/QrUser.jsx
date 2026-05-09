import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "react-qr-code";
import SweetAlert2 from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function QrUser() {
  const BASE_URL = "http://103.247.10.115:3050/api/kode-qr/qr";
  const USER_URL = "http://103.247.10.115:3050/api/auth/get-profile";
  const IZIN_URL = "http://103.247.10.115:3050/api/user-akses/izin";
  const MySwal = withReactContent(SweetAlert2);
  const token = localStorage.getItem("x_token");
  const [form, setForm] = useState({ username: "" });
  const [qrData, setQrData] = useState("");
  const navigate = useNavigate();

  // GET PROFILE + QR
  useEffect(() => {
    if (!token) {
      setForm({ username: "-" });
      return;
    }

    // GET PROFILE
    axios.get(USER_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.data && res.data.user) {
          setForm(res.data.user);
        }
      })
      .catch((err) => {
        console.log("PROFILE ERROR:", err);
      });

    // GET QR
    axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("QR RESPONSE:", res.data);

        if (res.data && res.data.qr) {
          setQrData(res.data.qr);
        }
      })
      .catch((err) => {
        console.log("QR ERROR:", err);
      });
  }, [token]);

  // HANDLE IZIN / SAKIT
  const handleIzin = () => {
    if (!token) return;

    MySwal.fire({
      title: "Pilih Keterangan Absensi",
      text: "Pilih alasan ketidakhadiran Anda",
      icon: "question",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Izin",
      denyButtonText: "Sakit",
      cancelButtonText: "Batal",
      confirmButtonColor: "#f39c12",
      denyButtonColor: "#f39c12",
    }).then((result) => {
      let status = "";

      if (result.isConfirmed) {
        status = "izin";
      } else if (result.isDenied) {
        status = "sakit";
      } else {
        return;
      }

      axios
        .post(
          IZIN_URL,
          {
            status: status,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          MySwal.fire(
            "Berhasil!",
            `Status ${status} telah dikirim.`,
            "success"
          );
        })
        .catch((err) => {
          console.log(err);

          MySwal.fire(
            "Gagal",
            err?.response?.data?.message || "Terjadi kesalahan",
            "error"
          );
        });
    });
  };

  return (
    <div
      className="login-wrapper position-relative"
      style={{ paddingTop: "80px" }}
    >
      <div
        className="login-card"
        style={{ maxWidth: "400px", margin: "0 auto" }}
      >
        <div className="login-header">
          <div className="login-icon">
            <i className="bi bi-qr-code-scan"></i>
          </div>

          <h1 className="login-title">
            DATA KEHADIRAN OJT BBPVP BEKASI
          </h1>

          <p className="login-subtitle">
            PT. GEO MANDIRI KREASI
          </p>
        </div>

        <div className="qr-card">
          <p className="qr-instruction">
            QR Code Absensi{" "}
            <strong>{form.username || "..."}</strong>
          </p>

          <div className="qr-code">
            {qrData ? (
              <QRCode
                value={qrData}
                size={180}
              />
            ) : (
              <p>Loading QR...</p>
            )}
          </div>

          <p className="qr-instruction">
            Tunjukkan QR ini ke admin untuk absen
          </p>
        </div>

        <button
          className="btn btn-outline-warning w-100"
          onClick={handleIzin}
        >
          Keterangan Izin / Sakit
          <i className="bi bi-calendar-x ms-2"></i>{" "}
        </button>

        <button
          className="btn btn-outline-primary w-100 mt-3"
          onClick={() => navigate("/user")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Kembali
        </button>
      </div>
    </div>
  );
}