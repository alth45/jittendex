"use client";

import React, { useState } from "react";
import { posInfo, extractSentences } from "../utils/helpers";

const HighlightText = ({ sentence, term }: { sentence: string, term: string }) => {
    if (!term) return <>{sentence}</>;
    const parts = sentence.split(term);
    return (
        <>
            {parts.map((part, i) => (
                <React.Fragment key={i}>
                    {part}
                    {i !== parts.length - 1 && <span className="focus">{term}</span>}
                </React.Fragment>
            ))}
        </>
    );
};

export default function DictionaryEntry({ entry }: { entry: any }) {
    const [defsCollapsed, setDefsCollapsed] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null); // State untuk efek visual tombol

    const { term, lemma, reading, reading_hira, romaji, part_of_speech, pos_detail, definitions, alt_forms, example_sentences, kanji_info, grammar_patterns } = entry;

    const pi = posInfo(part_of_speech);
    const firstChar = (term || '')[0] || '';
    const strokeBoxes = Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="stroke-box">{i === 0 ? firstChar : ''}</div>
    ));

    const showReading = reading && reading !== term && reading !== reading_hira;
    const showHira = reading_hira && reading_hira !== term;
    const showLemma = lemma && lemma !== term;
    const defs = definitions || [];
    const needCollapse = defs.length > 3;

    const frags: { ui: string, audio: string }[] = [];
    for (const exObj of (example_sentences || [])) {
        const extracted = extractSentences(exObj.sentence || '', term, 5);
        for (const f of extracted) {
            if (!frags.find(x => x.ui === f.ui)) frags.push(f);
            if (frags.length >= 5) break;
        }
        if (frags.length >= 5) break;
    }
    const bullets = ['◉', '◎', '●', '◈', '◇'];
    const strokeSvgUrl = kanji_info?.stroke_order_svg_url;

    // 🚀 ENGINE VOICEVOX LOCALHOST
    const playVoicevox = async (textToRead: string) => {
        if (!textToRead || playingText) return; // Cegah spam klik
        setPlayingText(textToRead);

        try {
            const speakerId = 3; // ID 3 = Zundamon (Normal). Bisa ganti ke 2 (Shikoku Metan) dll.

            // Tahap 1: Minta query audio ke Voicevox
            const queryRes = await fetch(`http://localhost:50021/audio_query?text=${encodeURIComponent(textToRead)}&speaker=${speakerId}`, {
                method: 'POST'
            });
            if (!queryRes.ok) throw new Error("Gagal audio_query");
            const queryJson = await queryRes.json();

            // Tahap 2: Sintesis suara dari query tadi
            const synthRes = await fetch(`http://localhost:50021/synthesis?speaker=${speakerId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(queryJson)
            });
            if (!synthRes.ok) throw new Error("Gagal synthesis");

            // Tahap 3: Putar audionya
            const blob = await synthRes.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);

            audio.onended = () => {
                setPlayingText(null);
                URL.revokeObjectURL(audioUrl); // Bersihkan memori
            };

            audio.play();

        } catch (err) {
            console.error(err);
            alert("❌ Gagal konek ke Voicevox! Pastikan aplikasi Voicevox sedang terbuka di laptopmu (localhost:50021).");
            setPlayingText(null);
        }
    };

    return (
        <div className="entry">
            <div className="kanji-col">
                <div className="kanji-big">{term}</div>
                <div className="stroke-seq">{strokeBoxes}</div>
                <div className="badge-row">
                    <div className="badge"><span className="badge-lbl">読み</span><span className="badge-val" style={{ fontFamily: "'Noto Serif JP',serif", fontSize: "10px" }}>{reading_hira || '—'}</span></div>
                    <div className="badge"><span className="badge-lbl">品詞</span><span className="badge-val" style={{ fontSize: "10px" }}>{(part_of_speech || '').slice(0, 6)}</span></div>
                </div>

                {kanji_info && (
                    <div className="badge-row" style={{ marginTop: '4px' }}>
                        {kanji_info.jlpt && <div className="badge"><span className="badge-lbl">JLPT</span><span className="badge-val">N{kanji_info.jlpt}</span></div>}
                        {kanji_info.grade && <div className="badge"><span className="badge-lbl">Grade</span><span className="badge-val">{kanji_info.grade}</span></div>}
                    </div>
                )}

                <span className={`pos-pill ${pi.cls}`} style={{ marginTop: '4px' }}>{pi.short}</span>
            </div>

            <div className="content-col">
                {(showReading || showHira || (!showReading && !showHira && romaji) || showLemma) && (
                    <div className="yomi-row">
                        {showReading && (
                            <div className="yomi-block">
                                <span className="y-label on">字音</span>
                                <span className="y-val">
                                    {reading}<span className="rom">{romaji || ''}</span>
                                </span>
                            </div>
                        )}
                        {showHira && (
                            <div className="yomi-block">
                                <span className="y-label kun">訓読</span>
                                <span className="y-val">{reading_hira}</span>
                            </div>
                        )}
                        {!showReading && !showHira && romaji && (
                            <div className="yomi-block">
                                <span className="y-label hira">読み</span>
                                <span className="y-val">{reading_hira || reading || term}<span className="rom">{romaji}</span></span>
                            </div>
                        )}

                        {/* TOMBOL SUARA UNTUK KOSAKATA */}
                        <button
                            className={`voice-btn ${playingText === term ? 'playing' : ''}`}
                            onClick={() => playVoicevox(term)}
                            title="Dengarkan pengucapan"
                        >
                            🔊
                        </button>

                        {showLemma && <span className="lemma-tag">← {lemma}</span>}
                    </div>
                )}

                {pos_detail && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '7px' }}>
                        {[pos_detail.pos2, pos_detail.pos3, pos_detail.conj_type, pos_detail.conj_form]
                            .filter(v => v && v !== '*')
                            .map((v, i) => <span key={i} className="sense-pos-chip">{v}</span>)}
                    </div>
                )}

                {defs.length > 0 && (
                    <div className="imi-row">
                        <span className="imi-label">意味</span>
                        <div className="imi-body">
                            <div className={defsCollapsed && needCollapse ? "defs-collapsed" : ""}>
                                {defs.map((s: any, i: number) => (
                                    <div key={i} className="sense-line">
                                        <span className="sense-n">{i + 1}</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                            {s.pos && s.pos.length > 0 && (
                                                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                                                    {s.pos.slice(0, 2).filter(Boolean).map((p: string, idx: number) => (
                                                        <span key={idx} className="sense-pos-chip">{p}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <span className="sense-text">
                                                {(s.gloss || []).join(', ')}
                                                {s.misc?.length > 0 && <span className="sense-misc"> — {s.misc.join('; ')}</span>}
                                                {s.field?.length > 0 && <span className="sense-misc" style={{ color: 'var(--blue)' }}> [{s.field.join(', ')}]</span>}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {needCollapse && (
                                <button className="expand-btn" onClick={() => setDefsCollapsed(!defsCollapsed)}>
                                    {defsCollapsed ? `▼ +${defs.length - 3} more` : '▲ collapse'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {alt_forms && alt_forms.length > 0 && (
                    <div className="alt-row">
                        <span className="alt-lbl">別形：</span>
                        {alt_forms.slice(0, 8).map((f: string, i: number) => <span key={i} className="alt-chip">{f}</span>)}
                    </div>
                )}

                <div className="ex-section">
                    {frags.length > 0 ? (
                        <>
                            <div className="ex-section-title">用例 · Examples</div>
                            <div className="ex-list">
                                {frags.map((f, i) => {
                                    return (
                                        <div key={i} className="ex-item">
                                            <span className="ex-bullet">{bullets[i] || '●'}</span>
                                            {/* Render teks untuk tampilan (UI) */}
                                            <span className="ex-jp"><HighlightText sentence={f.ui} term={term} /></span>

                                            {/* Kirim teks panjang utuh ke Voicevox (Audio) */}
                                            <button
                                                className={`voice-btn ${playingText === f.audio ? 'playing' : ''}`}
                                                onClick={() => playVoicevox(f.audio)}
                                                title="Dengarkan kalimat penuh"
                                            >
                                                🔊
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="ex-none">— 用例なし —</div>
                    )}
                </div>

                {grammar_patterns && grammar_patterns.length > 0 && (
                    <div className="grammar-section">
                        <div className="ex-section-title">文法 · Grammar Patterns</div>
                        {grammar_patterns.map((gp: any, idx: number) => (
                            <div key={idx} className="grammar-item">
                                <span className="grammar-form">{gp.form}</span>
                                {gp.level && <span className="grammar-level">{gp.level}</span>}
                                <div style={{ color: "var(--ink2)", marginTop: "3px" }}>{gp.meaning_en || gp.meaning_id}</div>
                            </div>
                        ))}
                    </div>
                )}

                {strokeSvgUrl && (
                    <div className="source-link-wrap">
                        <button className="source-link-btn" onClick={() => setIsModalOpen(true)}>
                            ✍️ Lihat Urutan Coretan
                        </button>
                    </div>
                )}

            </div>

            {isModalOpen && strokeSvgUrl && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <span>✍️ Urutan Coretan (Stroke Order)</span>
                            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <img src={strokeSvgUrl} alt={`Stroke order for ${term}`} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}