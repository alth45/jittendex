export function posInfo(pos: string) {
    if (!pos) return { cls: 'pill-other', short: '—' };
    const p = pos.toLowerCase();
    if (p.includes('noun')) return { cls: 'pill-noun', short: 'Noun' };
    if (p.includes('verb')) return { cls: 'pill-verb', short: 'Verb' };
    if (p.includes('adjective (i)')) return { cls: 'pill-adj-i', short: 'Adj-i' };
    if (p.includes('adjective')) return { cls: 'pill-adj-na', short: 'Adj-na' };
    if (p.includes('adverb')) return { cls: 'pill-adv', short: 'Adv' };
    return { cls: 'pill-other', short: pos.split(' ')[0] };
}

// export function extractSentences(rawText: string, term: string, max = 5) {
//     if (!rawText || !term) return [];
//     const frags = rawText.split(/[。！？]+|\n+/);
//     const result: string[] = [];
//     const seen = new Set();

//     for (const f of frags) {
//         const clean = f
//             .replace(/[\s\u3000\t]+/g, ' ')
//             .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '')
//             .trim();
//         if (clean.length < 5) continue;
//         if (!clean.includes(term)) continue;
//         if (seen.has(clean)) continue;

//         seen.add(clean);
//         result.push(clean.length > 80 ? clean.slice(0, 80) + '…' : clean);
//         if (result.length >= max) break;
//     }
//     return result;
// }

export function extractSentences(rawText: string, term: string, max = 5) {
    if (!rawText || !term) return [];

    // Bersihkan spasi berlebih
    let clean = rawText.replace(/[\n\t\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    const result: { ui: string, audio: string }[] = [];
    const seen = new Set();

    const WINDOW_UI = 45; // Jarak potong untuk tampilan layar
    const WINDOW_AUDIO = 150; // Jarak aman untuk Voicevox (kalau gak ada tanda baca)

    let searchIndex = 0;
    while (result.length < max) {
        const foundIndex = clean.indexOf(term, searchIndex);
        if (foundIndex === -1) break;

        // ─── 1. POTONGAN UNTUK UI LENGKAP (Tampilan Layar) ───
        let startUi = Math.max(0, foundIndex - WINDOW_UI);
        let endUi = Math.min(clean.length, foundIndex + term.length + WINDOW_UI);

        if (startUi > 0) {
            const spaceIndex = clean.indexOf(' ', startUi);
            if (spaceIndex !== -1 && spaceIndex < foundIndex) startUi = spaceIndex + 1;
        }
        if (endUi < clean.length) {
            const spaceIndex = clean.lastIndexOf(' ', endUi);
            if (spaceIndex !== -1 && spaceIndex > foundIndex) endUi = spaceIndex;
        }

        let uiSnippet = clean.slice(startUi, endUi).trim();
        if (startUi > 0) uiSnippet = '…' + uiSnippet;
        if (endUi < clean.length) uiSnippet = uiSnippet + '…';

        // ─── 2. POTONGAN UNTUK VOICEVOX (1 Kalimat Utuh) ───
        let audioStart = startUi;
        let audioEnd = endUi;

        // Cari batas Awal (Titik sebelumnya)
        let prevPunct = Math.max(
            clean.lastIndexOf('。', foundIndex),
            clean.lastIndexOf('！', foundIndex),
            clean.lastIndexOf('？', foundIndex)
        );

        if (prevPunct !== -1) {
            audioStart = prevPunct + 1; // Mulai setelah titik sebelumnya
        } else {
            // Kalau transkrip panjang tanpa titik, ambil 150 karakter ke belakang
            audioStart = Math.max(0, foundIndex - WINDOW_AUDIO);
            const sIdx = clean.indexOf(' ', audioStart);
            if (sIdx !== -1 && sIdx < foundIndex) audioStart = sIdx + 1;
        }

        // Cari batas Akhir (Titik setelahnya)
        const p1 = clean.indexOf('。', foundIndex);
        const p2 = clean.indexOf('！', foundIndex);
        const p3 = clean.indexOf('？', foundIndex);
        const puncts = [p1, p2, p3].filter(p => p !== -1);

        if (puncts.length > 0) {
            audioEnd = Math.min(...puncts) + 1; // Berhenti tepat di titik
        } else {
            // Kalau transkrip panjang tanpa titik, ambil 150 karakter ke depan
            audioEnd = Math.min(clean.length, foundIndex + term.length + WINDOW_AUDIO);
            const sIdx = clean.lastIndexOf(' ', audioEnd);
            if (sIdx !== -1 && sIdx > foundIndex) audioEnd = sIdx;
        }

        // Teks siap kirim ke Voicevox
        let audioText = clean.slice(audioStart, audioEnd).trim();

        if (!seen.has(uiSnippet)) {
            seen.add(uiSnippet);
            // Kita kembalikan Object berisi versi Layar dan versi Suara
            result.push({ ui: uiSnippet, audio: audioText });
        }

        searchIndex = foundIndex + term.length;
    }

    return result;
}

export function pageRange(current: number, total: number) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const delta = 2;
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);
    const range: (number | string)[] = [1];

    if (left > 2) range.push('…');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push('…');
    range.push(total);

    return range;
}