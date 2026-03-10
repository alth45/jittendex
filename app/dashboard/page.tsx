"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../globals.css";

export default function AdminDashboard() {
    // ─── STATE UNTUK GATEKEEPER (PENJAGA) ───
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [gatePasscode, setGatePasscode] = useState("");
    const [gateError, setGateError] = useState("");

    // ─── STATE UNTUK UPLOAD ───
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState({ loading: false, message: "", type: "" });

    // 🔒 Ganti ini sesuai dengan password API kamu di route.ts
    const SECRET_PASSCODE = "jittendex2026";

    // Cek apakah sebelumnya sudah login (di tab ini)
    useEffect(() => {
        const session = sessionStorage.getItem("jittendex_admin_unlocked");
        if (session === "true") {
            setIsUnlocked(true);
        }
    }, []);

    // Fungsi untuk membuka gembok
    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (gatePasscode === SECRET_PASSCODE) {
            setIsUnlocked(true);
            sessionStorage.setItem("jittendex_admin_unlocked", "true");
            setGateError("");
        } else {
            setGateError("❌ Password salah bro!");
            setGatePasscode("");
        }
    };

    // Fungsi untuk keluar (Lock ulang)
    const handleLock = () => {
        setIsUnlocked(false);
        setGatePasscode("");
        sessionStorage.removeItem("jittendex_admin_unlocked");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setStatus({ loading: false, message: "Pilih file JSON dulu bro!", type: "error" });
            return;
        }

        setStatus({ loading: true, message: "Mengunggah file...", type: "info" });

        const formData = new FormData();
        formData.append("file", file);
        // Kita otomatis kirimkan passcode yang benar ke API, jadi gak usah ngetik 2x
        formData.append("passcode", SECRET_PASSCODE);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ loading: false, message: data.message, type: "success" });
                setFile(null);
                (document.getElementById("fileInput") as HTMLInputElement).value = "";
            } else {
                setStatus({ loading: false, message: data.error || "Gagal upload", type: "error" });
            }
        } catch (err) {
            setStatus({ loading: false, message: "Terjadi kesalahan server.", type: "error" });
        }
    };

    // 🛑 JIKA BELUM UNLOCK, TAMPILKAN LAYAR KUNCI (GATEKEEPER)
    if (!isUnlocked) {
        return (
            <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ background: 'var(--page)', padding: '40px', borderRadius: '8px', border: '1px solid var(--tan-dark)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '350px', width: '90%' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔐</div>
                    <h2 style={{ fontFamily: "'Noto Serif JP', serif", color: 'var(--ink)', marginBottom: '5px' }}>Area Terbatas</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--ink3)', marginBottom: '20px' }}>Masukkan akses untuk masuk ke Dashboard.</p>

                    <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            type="password"
                            placeholder="Passcode..."
                            value={gatePasscode}
                            onChange={(e) => setGatePasscode(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1.5px solid var(--tan-dark)', textAlign: 'center', letterSpacing: '2px', fontFamily: 'monospace' }}
                            autoFocus
                        />
                        {gateError && <span style={{ color: 'var(--red)', fontSize: '0.8rem', fontWeight: 'bold' }}>{gateError}</span>}
                        <button type="submit" style={{ background: 'var(--ink)', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Buka Akses
                        </button>
                    </form>

                    <div style={{ marginTop: '20px' }}>
                        <Link href="/" style={{ fontSize: '0.8rem', color: 'var(--blue)', textDecoration: 'none' }}>← Kembali ke Kamus</Link>
                    </div>
                </div>
            </div>
        );
    }

    // 🟢 JIKA SUDAH UNLOCK, TAMPILKAN DASHBOARD UPLOAD
    return (
        <div className="app-container font-sans">
            <div className="topbar">
                <div className="topbar-title"><span>漢</span>字辞典 · Admin Dashboard</div>

                <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
                    <button onClick={handleLock} className="tool-btn" style={{ background: "var(--red-soft)", color: "var(--red)", borderColor: "var(--red-border)" }}>
                        🔒 Kunci Dashboard
                    </button>
                    <Link href="/" className="tool-btn" style={{ background: "var(--tan)", color: "var(--ink)" }}>
                        🔙 Ke Kamus
                    </Link>
                </div>
            </div>

            <div className="book" style={{ padding: "40px 30px", maxWidth: "600px", marginTop: "40px", textAlign: "center" }}>
                <h2 style={{ color: "var(--ink)", marginBottom: "10px" }}>📤 Upload Kosakata Baru</h2>
                <p style={{ color: "var(--ink3)", fontSize: "0.9rem", marginBottom: "30px" }}>
                    File JSON yang diupload ke sini akan otomatis masuk ke folder <code style={{ background: "var(--tan-mid)", padding: "2px 5px", borderRadius: "4px" }}>data/kosakata</code>.
                </p>

                <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>

                    {/* Box Upload File */}
                    <div style={{ width: "100%", padding: "30px", border: "2px dashed var(--tan-dark)", borderRadius: "8px", background: "var(--tan)" }}>
                        <input
                            type="file"
                            id="fileInput"
                            accept=".json"
                            onChange={handleFileChange}
                            style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9rem" }}
                        />
                    </div>

                    {/* Pesan Status */}
                    {status.message && (
                        <div style={{
                            padding: "10px", width: "100%", borderRadius: "6px", fontSize: "0.9rem", fontWeight: "bold",
                            background: status.type === 'error' ? 'var(--red-soft)' : status.type === 'success' ? 'var(--green-soft)' : 'var(--blue-soft)',
                            color: status.type === 'error' ? 'var(--red)' : status.type === 'success' ? 'var(--green)' : 'var(--blue)'
                        }}>
                            {status.message}
                        </div>
                    )}

                    {/* Tombol Submit (Password input sudah dihilangkan karena otomatis pakai passcode gatekeeper) */}
                    <button
                        type="submit"
                        disabled={status.loading}
                        style={{
                            width: "100%", padding: "12px", background: "var(--red)", color: "white",
                            border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer",
                            opacity: status.loading ? 0.7 : 1
                        }}
                    >
                        {status.loading ? "Mengunggah..." : "🚀 Upload JSON ke Server"}
                    </button>
                </form>
            </div>
        </div>
    );
}