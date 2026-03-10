"use client";

import React from "react";
import Link from "next/link"; // Import Link dari Next.js

interface ToolbarProps {
    fontStyle: string; setFontStyle: (val: string) => void;
    showRomaji: boolean; setShowRomaji: (val: boolean) => void;
    showMeaning: boolean; setShowMeaning: (val: boolean) => void;
    showExamples: boolean; setShowExamples: (val: boolean) => void;
    theme: string; setTheme: (val: string) => void;
    jlptFilter: string; setJlptFilter: (val: string) => void; // Filter baru
}

export default function Toolbar({
    fontStyle, setFontStyle,
    showRomaji, setShowRomaji,
    showMeaning, setShowMeaning,
    showExamples, setShowExamples,
    theme, setTheme,
    jlptFilter, setJlptFilter
}: ToolbarProps) {
    return (
        <div className="toolbar">
            {/* Tombol JLPT */}
            <div className="tool-group">
                <span>JLPT:</span>
                <button className={`tool-btn ${jlptFilter === '' ? 'active' : ''}`} onClick={() => setJlptFilter('')}>All</button>
                <button className={`tool-btn ${jlptFilter === '5' ? 'active' : ''}`} onClick={() => setJlptFilter('5')}>N5</button>
                <button className={`tool-btn ${jlptFilter === '4' ? 'active' : ''}`} onClick={() => setJlptFilter('4')}>N4</button>
                <button className={`tool-btn ${jlptFilter === '3' ? 'active' : ''}`} onClick={() => setJlptFilter('3')}>N3</button>
                <button className={`tool-btn ${jlptFilter === '2' ? 'active' : ''}`} onClick={() => setJlptFilter('2')}>N2</button>
                <button className={`tool-btn ${jlptFilter === '1' ? 'active' : ''}`} onClick={() => setJlptFilter('1')}>N1</button>
            </div>

            <div className="tool-group">
                <span>Display:</span>
                <button className={`tool-btn ${!showRomaji ? 'active' : ''}`} onClick={() => setShowRomaji(!showRomaji)}>Romaji</button>
                <button className={`tool-btn ${!showMeaning ? 'active' : ''}`} onClick={() => setShowMeaning(!showMeaning)}>Arti</button>
                <button className={`tool-btn ${!showExamples ? 'active' : ''}`} onClick={() => setShowExamples(!showExamples)}>Contoh</button>
            </div>

            <div className="tool-group" style={{ marginLeft: "auto" }}>
                <span>Theme:</span>
                <button className={`tool-btn ${theme === 'sepia' ? 'active' : ''}`} onClick={() => setTheme('sepia')}>📜</button>
                <button className={`tool-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>🌙</button>
            </div>

            {/* Tombol ke Halaman Statistik */}
            <Link href="/stats" className="tool-btn" style={{ background: 'var(--green)', color: 'white', borderColor: 'var(--green)' }}>
                📊 Statistik
            </Link>
        </div>
    );
}