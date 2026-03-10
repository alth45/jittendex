import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const passcode = formData.get('passcode') as string;

        // 🔒 KEAMANAN SEDERHANA: Ganti password ini sesuai keinginanmu
        const SECRET_PASSCODE = "jittendex2026";

        if (passcode !== SECRET_PASSCODE) {
            return NextResponse.json({ error: 'Password Salah! Akses Ditolak.' }, { status: 401 });
        }

        if (!file) {
            return NextResponse.json({ error: 'Tidak ada file yang diunggah.' }, { status: 400 });
        }

        if (!file.name.endsWith('.json')) {
            return NextResponse.json({ error: 'Hanya file .json yang diperbolehkan!' }, { status: 400 });
        }

        // Ubah file menjadi buffer agar bisa disimpan oleh Node.js
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Pastikan folder tujuan ada
        const dataDir = path.join(process.cwd(), 'data', 'kosakata');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Tulis/Simpan file ke dalam folder
        const filePath = path.join(dataDir, file.name);
        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({
            success: true,
            message: `Mantap! File ${file.name} berhasil ditambahkan ke kamus.`
        });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}