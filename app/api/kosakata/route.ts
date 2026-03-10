import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let globalVocabCache: any[] = [];
let lastReadTime = 0;

// 🚀 ENGINE 1: Adapter untuk Struktur Baru (Fleksibilitas tanpa merusak UI)
function normalizeNewFormat(entry: any, parentRow: any) {
    return {
        term: entry.word || entry.term,
        lemma: entry.word || entry.lemma || '',
        reading_hira: entry.reading || entry.reading_hira || '',
        reading: entry.reading || entry.reading_hira || '',
        romaji: entry.romaji || '',
        part_of_speech: entry.pos || entry.part_of_speech || 'Unknown',
        pos_detail: null, // Dikosongkan jika format baru tidak menyediakan detail pos
        definitions: [
            {
                pos: entry.pos ? [entry.pos] : [],
                gloss: entry.meanings || [], // Mengambil array meanings dari format baru
                field: entry.field || [],
                misc: entry.misc || []
            }
        ],
        alt_forms: entry.alt_forms || [],
        // Sambungkan contoh kalimat dari parent/row utamanya
        example_sentences: parentRow && parentRow.sentence
            ? [{ sentence: parentRow.sentence, reading: parentRow.sentence_hira || "" }]
            : [],
        is_kanji: true
    };
}

// 🚀 ENGINE 2: Observer & Deduplicator
function getMergedVocabulary() {
    const dataDir = path.join(process.cwd(), 'data', 'kosakata');

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        return [];
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    let latestMtime = fs.statSync(dataDir).mtimeMs;

    files.forEach(f => {
        const fileStat = fs.statSync(path.join(dataDir, f));
        if (fileStat.mtimeMs > latestMtime) latestMtime = fileStat.mtimeMs;
    });

    if (globalVocabCache.length > 0 && latestMtime <= lastReadTime) {
        return globalVocabCache;
    }

    console.log("🔄 Observer mendeteksi file JSON... Menjalankan Adapter Engine!");

    const mergedMap = new Map();

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(fileContent);

            if (parsed.data && Array.isArray(parsed.data)) {
                parsed.data.forEach((row: any) => {

                    // 📌 PENGECEKAN 1: Apakah ini STRUKTUR LAMA? (menggunakan 'dictionary')
                    if (row.dictionary && Array.isArray(row.dictionary)) {
                        row.dictionary.forEach((item: any) => {
                            // Pastikan ada contoh kalimat
                            if (!item.example_sentences || item.example_sentences.length === 0) {
                                item.example_sentences = [{ sentence: row.sentence, reading: "" }];
                            }
                            const key = item.lemma || item.term;
                            if (key && !mergedMap.has(key)) mergedMap.set(key, item);
                        });
                    }

                    // 📌 PENGECEKAN 2: Apakah ini STRUKTUR BARU? (menggunakan 'compounds')
                    if (row.compounds && Array.isArray(row.compounds)) {
                        row.compounds.forEach((item: any) => {
                            // Lempar ke Engine Adapter untuk ditranslasikan
                            const normalizedItem = normalizeNewFormat(item, row);
                            const key = normalizedItem.lemma || normalizedItem.term;

                            // Masukkan ke cache jika belum ada (Deduplikasi)
                            if (key && !mergedMap.has(key)) mergedMap.set(key, normalizedItem);
                        });
                    }

                });
            } else if (Array.isArray(parsed)) {
                // Fallback darurat jika ada JSON yang isinya cuma array
                const raw = parsed[0]?.dictionary ? parsed.flatMap((r: any) => r.dictionary || []) : parsed;
                raw.forEach(item => {
                    const key = item.lemma || item.term;
                    if (key && !mergedMap.has(key)) mergedMap.set(key, item);
                });
            }
        } catch (e) {
            console.error(`Gagal membaca ${file}:`, e);
        }
    }

    globalVocabCache = Array.from(mergedMap.values());
    lastReadTime = latestMtime;
    return globalVocabCache;
}

// // 🚀 API ROUTER UTAMA
// export async function GET(request: Request) {
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const query = (searchParams.get('q') || '').trim().toLowerCase();

//     const allData = getMergedVocabulary();

//     let filtered = allData;
//     if (query) {
//         filtered = allData.filter(e => {
//             if ((e.term || '').includes(query)) return true;
//             if ((e.lemma || '').includes(query)) return true;
//             if ((e.reading_hira || '').includes(query)) return true;
//             if ((e.romaji || '').toLowerCase().includes(query)) return true;
//             for (const d of (e.definitions || []))
//                 if ((d.gloss || []).some((g: string) => g.toLowerCase().includes(query))) return true;
//             return false;
//         });
//     }

//     const total = filtered.length;
//     const start = (page - 1) * limit;
//     const sliced = filtered.slice(start, start + limit);

//     return NextResponse.json({
//         data: sliced,
//         total,
//         page,
//         totalPages: Math.ceil(total / limit)
//     });
// }

// 🚀 API ROUTER UTAMA (Update: Tambah Filter JLPT & Mode Statistik)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // Cek apakah UI meminta data statistik
    const allData = getMergedVocabulary();

    // JIKA MEMINTA STATISTIK
    if (action === 'stats') {
        const stats = { n1: 0, n2: 0, n3: 0, n4: 0, n5: 0, unknown: 0, diff: { easy: 0, medium: 0, hard: 0 } };

        allData.forEach(item => {
            const jlpt = item.kanji_info?.jlpt;
            if (jlpt === '1') stats.n1++;
            else if (jlpt === '2') stats.n2++;
            else if (jlpt === '3') stats.n3++;
            else if (jlpt === '4') stats.n4++;
            else if (jlpt === '5') stats.n5++;
            else stats.unknown++;

            const diffScore = item.kanji_info?.difficulty_score || 0;
            if (diffScore > 0 && diffScore <= 35) stats.diff.easy++;
            else if (diffScore > 35 && diffScore <= 65) stats.diff.medium++;
            else if (diffScore > 65) stats.diff.hard++;
        });

        return NextResponse.json({ total: allData.length, stats });
    }

    // JIKA MEMINTA DATA KAMUS BIASA
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const jlptFilter = searchParams.get('jlpt') || ''; // Tangkap filter JLPT

    let filtered = allData;

    // Terapkan Filter Pencarian Teks
    if (query) {
        filtered = filtered.filter(e => {
            if ((e.term || '').includes(query)) return true;
            if ((e.lemma || '').includes(query)) return true;
            if ((e.reading_hira || '').includes(query)) return true;
            if ((e.romaji || '').toLowerCase().includes(query)) return true;
            for (const d of (e.definitions || []))
                if ((d.gloss || []).some((g: string) => g.toLowerCase().includes(query))) return true;
            return false;
        });
    }

    // Terapkan Filter JLPT (N5-N1)
    if (jlptFilter) {
        filtered = filtered.filter((e: any) => e.kanji_info?.jlpt === jlptFilter);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const sliced = filtered.slice(start, start + limit);

    return NextResponse.json({
        data: sliced,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    });
}