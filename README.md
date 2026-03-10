# 漢字辞典 · Jittendex (Next.js Edition) 🇯🇵

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat&logo=typescript)
![Voicevox](https://img.shields.io/badge/Voicevox-Localhost-green?style=flat)

**Jittendex** adalah kamus Kanji dan kosakata bahasa Jepang modern berbasis web yang dirancang khusus untuk pembelajar JLPT (N5 - N1). Dibangun dengan arsitektur canggih untuk menangani ribuan data JSON secara instan tanpa mengorbankan performa *browser*.

## ✨ Fitur Utama (OP Features)

* 🚀 **Auto-Observer & Rolling Cache Engine**
  Sistem *backend* pintar yang otomatis membaca, memfilter duplikat, dan mengadaptasi berbagai struktur file JSON secara *real-time*. *Rolling Cache* menjaga RAM tetap lega meski menelusuri puluhan ribu kata.
* 🗣️ **Native Voicevox Integration**
  Bukan suara robot browser biasa! Tersambung langsung ke API Voicevox (localhost) untuk membacakan kosakata dan *1 kalimat utuh* secara natural dengan logat *native* Jepang.
* 🧠 **Smart Sliding Window Engine**
  Sistem pemotong kalimat cerdas. Mampu mengekstrak konteks yang pas secara presisi meskipun sumber datanya berasal dari transkrip panjang (seperti *subtitle* YouTube) yang tidak memiliki tanda baca.
* 🛡️ **Secret Admin Dashboard & Gatekeeper**
  Ruang admin rahasia (`/dashboard`) dengan sistem *Client-Side Gatekeeper*. Memungkinkan penambahan *database* kosakata (upload JSON) dengan mudah tanpa harus menyentuh folder *server*.
* 📊 **Live Analytics & JLPT Filter**
  Halaman statistik khusus (`/stats`) untuk melacak distribusi data kosakata berdasarkan level JLPT (N5-N1) dan memantaunya berdasarkan tingkat kerumitan huruf (*difficulty score*).
* ✍️ **Stroke Order SVG Viewer**
  Modal *popup* interaktif untuk mempelajari urutan coretan (stroke order) Kanji langsung dari *database* KanjiVG.
* 🌙 **Drill Mode & Tema Dinamis**
  Ubah tema (Sepia / Dark Mode) sesuai *mood*. Sembunyikan Romaji, Arti, atau Contoh Kalimat hanya dengan 1 klik untuk melatih daya ingat (Mode Hafalan/Flashcard).

## 📂 Struktur Project

```text
jittendex/
├── app/
│   ├── api/
│   │   ├── kosakata/route.ts  # Observer & Universal Adapter API
│   │   └── upload/route.ts    # API Penerima Upload JSON
│   ├── dashboard/page.tsx     # Admin Gatekeeper & Upload UI
│   ├── stats/page.tsx         # Dashboard Statistik JLPT
│   ├── globals.css            # Desain UI, Modal, Tema Dinamis
│   └── page.tsx               # Halaman Kamus Utama (Rolling Cache)
├── components/
│   ├── DictionaryEntry.tsx    # Komponen Kartu Kosakata + Voicevox TTS
│   ├── Pagination.tsx         # Navigasi Halaman
│   └── Toolbar.tsx            # Kontrol Tema, Filter & Drill Mode
├── data/
│   └── kosakata/              # (Otomatis terbuat) Tempat penyimpanan file JSON
└── utils/
    └── helpers.ts             # Slidding Window Engine & Utility