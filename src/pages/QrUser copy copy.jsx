import { useState } from "react";
import QRCode from "react-qr-code";



export default function QrUser() {
  const BASE_URL = " http://103.247.10.115:3050/api/kode-qr/qr";
  const token = localStorage.getItem("x_token");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a3a5c",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "40px",
        textAlign: "center",
        width: "350px"
      }}>

        <div style={{
          background: "#3b6fd4",
          borderRadius: "12px",
          width: "60px",
          height: "60px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto 16px auto"
        }}>
          <span style={{ fontSize: "28px" }}>🛡️</span>
        </div>

        <h2 style={{ color: "#1a3a5c", fontWeight: "bold", marginBottom: "4px" }}>
          ABSENSI OJT BBPVP BEKASI
        </h2>
        <p style={{ color: "gray", fontSize: "13px", marginBottom: "24px" }}>
          PT. GEO MANDIRI KREASI
        </p>

        <p style={{ color: "#555", marginBottom: "12px" }}>
          QR Code Absensi Kamu
        </p>

        <div style={{ display: "inline-block", padding: "12px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <QRCode value={token} size={180} />
        </div>

        <p style={{ color: "gray", fontSize: "12px", marginTop: "16px" }}>
          Tunjukkan QR ini ke admin untuk absen
        </p>

        <button style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#3b6fd4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold"
        }} onClick={() => window.location.href = "/user"}>
          Kembali
        </button>

      </div>
    </div>
  );
}