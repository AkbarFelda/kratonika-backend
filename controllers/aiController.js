const { GoogleGenAI } = require('@google/genai');
const supabase = require('../config/db');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.handleChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Pesan tidak boleh kosong" });
        }

        const { data: kuliner } = await supabase.from('kuliner_warung').select('nama_warung, deskripsi, fitur_unik, estimasi_harga_min, estimasi_harga_max, waktu_antrean_menit');
        const { data: wisata } = await supabase.from('wisata_destinasi').select('nama_destinasi, rumpun, deskripsi, harga_tiket_domestik, jam_operasional');

        const konteksDatabase = `
        DATA INTERNAL KRATONIKA (Gunakan data ini untuk rekomendasi kuliner/wisata utama):
        KULINER JOGJA: ${JSON.stringify(kuliner)}
        WISATA JOGJA: ${JSON.stringify(wisata)}
        `;

        const systemInstruction = `
        Kamu adalah Kratonika AI, asisten perjalanan pintar khusus untuk Daerah Istimewa Yogyakarta.
        
        ATURAN KETAT:
        1. Kamu HANYA boleh menjawab pertanyaan yang berkaitan dengan pariwisata, sejarah, budaya, kuliner, akomodasi/hotel, event, dan informasi seputar YOGYAKARTA.
        2. Jika user menanyakan tentang hotel, penginapan, transportasi, rute, atau cuaca di Yogyakarta, kamu DILEGALKAN menggunakan alat bantu Google Search Grounding untuk memberikan informasi real-time terbaru yang akurat di area Yogyakarta.
        3. Jika user bertanya tentang kota lain ke luar Yogyakarta (misal: hotel di Jakarta/Bandung), sains umum, politik, matematika, coding, atau hal umum lainnya, kamu WAJIB menolak dengan sopan menggunakan Bahasa Indonesia atau bahasa Jawa halus.
        4. Prioritaskan data dari "DATA INTERNAL KRATONIKA" jika user meminta rekomendasi tempat wisata atau kuliner legendaris yang sesuai.
        
        ${konteksDatabase}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-8b',
            contents: message,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
                tools: [{ googleSearch: {} }] 
            }
        });

        res.status(200).json({
            success: true,
            reply: response.text
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};