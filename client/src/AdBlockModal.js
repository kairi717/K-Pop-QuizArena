// src/AdBlockModal.js
import React from "react";

export default function AdBlockModal() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "#e63946" }}>
          We noticed you’re using an ad blocker.
        </h2>
        <p style={{ marginBottom: "1.5rem", lineHeight: "1.5" }}>
Ads help us keep this service free and running smoothly.
If you enjoy using our site, please consider disabling your ad blocker or adding us to your whitelist.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "#e63946",
            color: "#fff",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
