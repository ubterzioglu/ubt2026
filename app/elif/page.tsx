"use client";

import { useState, useEffect } from "react";

export default function ElifPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("elif_auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === "elif123") {
      sessionStorage.setItem("elif_auth", "true");
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  }

  if (!mounted) return null;

  if (authenticated) {
    return (
      <iframe
        src="/zelifs/zelifs.html"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
        title="ZELIFS"
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4ff" }}>
      <div style={{ background: "#fff", borderRadius: "1.5rem", boxShadow: "0 8px 32px rgba(20,31,80,0.12)", padding: "2.5rem 2rem", width: "100%", maxWidth: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#3b5bdb", color: "#fff", fontSize: "1.75rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>Z</div>
          <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#1a1a2e" }}>ZELIFS</h1>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "#888" }}>Sade, hızlı, net...</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Şifre"
            autoFocus
            style={{
              padding: "0.65rem 1rem",
              borderRadius: "0.85rem",
              border: error ? "1.5px solid #e03131" : "1.5px solid #d0d7f0",
              fontSize: "1rem",
              outline: "none",
              background: "#f8f9ff"
            }}
          />
          {error && (
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#e03131", textAlign: "center" }}>
              Yanlış şifre, tekrar dene.
            </p>
          )}
          <button
            type="submit"
            style={{
              padding: "0.7rem",
              borderRadius: "0.85rem",
              background: "#3b5bdb",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: "pointer"
            }}
          >
            Giriş
          </button>
        </form>
      </div>
    </div>
  );
}
