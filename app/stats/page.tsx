"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../globals.css"; // Pastikan CSS-nya ngelink

export default function StatsPage() {
    const [statsData, setStatsData] = useState<any>(null);

    useEffect(() => {
        // Tarik data statistik dari API
        fetch('/api/kosakata?action=stats')
            .then(res => res.json())
            .then(data => setStatsData(data));
    }, []);

    if (!statsData) {
        return <div className="app-container" style={{ padding: '50px', textAlign: 'center' }}>Memuat Statistik...</div>;
    }

    const { total, stats } = statsData;

    return (
        <div className="app-container font-sans">
            <div className="topbar">
                <div className="topbar-title"><span>漢</span>字辞典 · Statistik Kosakata</div>
                <Link href="/" className="tool-btn" style={{ marginLeft: "auto", background: "var(--red)", color: "white" }}>
                    🔙 Kembali ke Kamus
                </Link>
            </div>

            <div className="book" style={{ padding: "30px", maxWidth: "800px" }}>
                <h2 style={{ fontFamily: "'Noto Serif JP', serif", color: "var(--ink)", borderBottom: "2px solid var(--line)", paddingBottom: "10px", marginBottom: "20px" }}>
                    Total Kosakata: {total} 語
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                    {/* Box 1: JLPT Distribution */}
                    <div style={{ background: "var(--tan)", padding: "20px", borderRadius: "8px", border: "1px solid var(--tan-dark)" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "15px", color: "var(--ink2)" }}>📈 Distribusi JLPT</h3>
                        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                            <li><strong>N5 (Pemula):</strong> {stats.n5} kata</li>
                            <li><strong>N4 (Dasar):</strong> {stats.n4} kata</li>
                            <li><strong>N3 (Menengah):</strong> {stats.n3} kata</li>
                            <li><strong>N2 (Lanjut):</strong> {stats.n2} kata</li>
                            <li><strong>N1 (Mahir):</strong> {stats.n1} kata</li>
                            <li style={{ color: "var(--ink3)" }}><em>Tidak diketahui: {stats.unknown} kata</em></li>
                        </ul>
                    </div>

                    {/* Box 2: Complexity/Difficulty */}
                    <div style={{ background: "var(--tan)", padding: "20px", borderRadius: "8px", border: "1px solid var(--tan-dark)" }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "15px", color: "var(--ink2)" }}>🧠 Tingkat Kerumitan</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--ink3)", marginBottom: "15px" }}>Berdasarkan difficulty_score JSON</p>
                        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                            <li>🟢 <strong>Mudah (0-35):</strong> {stats.diff.easy} kata</li>
                            <li>🟡 <strong>Sedang (36-65):</strong> {stats.diff.medium} kata</li>
                            <li>🔴 <strong>Sulit (&gt;65):</strong> {stats.diff.hard} kata</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}