"use client";

import React, { useState, useEffect, useRef } from "react";
import DictionaryEntry from "./components/DictionaryEntry";
import Pagination from "./components/Pagination";
import Toolbar from "./components/Toolbar";
import { Anybody } from "next/font/google";

const PER_PAGE = 10;

export default function DictionaryViewer() {
  // Data State
  const [currentSlice, setCurrentSlice] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- STATE UNTUK TOOLBAR ---
  const [fontStyle, setFontStyle] = useState("serif");
  const [showRomaji, setShowRomaji] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showExamples, setShowExamples] = useState(true);
  const [theme, setTheme] = useState("sepia");
  const [jlptFilter, setJlptFilter] = useState(""); // STATE BARU

  const containerRef = useRef<HTMLDivElement>(null);

  // 🚀 ROLLING CACHE ENGINE (Penyimpan Memori Gak Bikin Lemot)
  // Bentuknya: { 1: [data...], 2: [data...], dst }
  const cacheRef = useRef<Record<number, any[]>>({});

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
  }, [theme]);

  // Load awal saat web dibuka
  useEffect(() => {
    fetchPage(1, "");
  }, []);

  // Ubah dependensi load awal supaya men-trigger saat JLPT berubah
  useEffect(() => {
    cacheRef.current = {}; // Kosongkan cache
    fetchPage(1, searchQuery, jlptFilter);
  }, [jlptFilter]); // 👈

  // FUNGSI INTI: Narik Data & Manajemen Cache
  const fetchPage = async (page: number, query: string, jlpt = "") => {
    setLoading(true);

    // 1. ALGORITMA ROLLING CACHE (Buang Nyampah)
    // Sesuai rumus: Kalau di page 11, buang page 1-5. Kita bikin rentang aman (window) -5 sampai +5.
    Object.keys(cacheRef.current).forEach(key => {
      const p = parseInt(key);
      // Jika selisih halaman lebih dari 5 (terlalu jauh di belakang atau depan), DELETE dari RAM!
      if (p < page - 5 || p > page + 5) {
        delete cacheRef.current[p];
      }
    });

    // 2. CEK CACHE: Kalau halaman yang dituju sudah ada di memori, pakai langsung!
    if (cacheRef.current[page]) {
      setCurrentSlice(cacheRef.current[page]);
      setCurrentPage(page);
      setLoading(false);
      return; // Selesai, super ngebut!
    }

    // 3. KALAU TIDAK ADA DI CACHE: Tarik dari Observer API
    try {
      const res = await fetch(`/api/kosakata?page=${page}&limit=${PER_PAGE}&q=${encodeURIComponent(query)}&jlpt=${jlpt}`);
      const data = await res.json();

      // Masukkan data baru ke Rolling Cache
      cacheRef.current[page] = data.data;

      // Update tampilan
      setCurrentSlice(data.data);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error("Gagal load data:", err);
    }
    setLoading(false);
  };

  // KETIKA USER NGETIK DI SEARCH BAR
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);

    // Wajib: Kosongkan semua cache lama karena filternya berubah total
    cacheRef.current = {};
    fetchPage(1, q);
  };

  const handlePageChange = (page: number) => {
    fetchPage(page, searchQuery);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className={`app-container font-${fontStyle} ${!showRomaji ? 'hide-romaji' : ''} ${!showMeaning ? 'hide-meaning' : ''} ${!showExamples ? 'hide-examples' : ''}`}>
      <div className="topbar">
        <div className="topbar-title"><span>漢</span>字辞典 · Jittendex Viewer</div>
        <div className="search-wrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="検索… 語 / reading / meaning"
            value={searchQuery || ""}
            onChange={handleSearch}
          />
        </div>
        <div className="page-num">
          {loading ? 'Memuat...' : (totalItems > 0 ? `— ${totalItems} 語 · p.${currentPage}/${totalPages} —` : '— 0 語 —')}
        </div>
      </div>

      <Toolbar
        jlptFilter={jlptFilter} setJlptFilter={setJlptFilter}
        fontStyle={fontStyle} setFontStyle={setFontStyle}
        showRomaji={showRomaji} setShowRomaji={setShowRomaji}
        showMeaning={showMeaning} setShowMeaning={setShowMeaning}
        showExamples={showExamples} setShowExamples={setShowExamples}
        theme={theme} setTheme={setTheme}
      />

      <div className="book" ref={containerRef}>
        <div id="bookBody" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          {totalItems === 0 && !loading ? (
            <div className="empty-state">
              <span className="big-char">空</span>
              <p>Belum ada data. Taruh file JSON di folder <strong>data/kosakata/</strong></p>
            </div>
          ) : (
            <div>
              {currentSlice.map((entry, idx) => (
                <DictionaryEntry key={`${entry.term || entry.lemma}-${idx}`} entry={entry} />
              ))}
            </div>
          )}
        </div>
        <div className="book-footer">
          <span>Jittendex Viewer v4 (Auto-Observer & Rolling Cache)</span>
          <span>
            {totalItems > 0 ? `${(currentPage - 1) * PER_PAGE + 1}–${Math.min(currentPage * PER_PAGE, totalItems)} / ${totalItems} 語` : '—'}
          </span>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}