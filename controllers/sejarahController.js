const supabase = require('../config/db');

exports.getAllSejarah = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sejarah_peristiwa')
            .select('*')
            .order('urutan_scroll', { ascending: true });

        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createSejarah = async (req, res) => {
    try {
        const { nama_peristiwa, tanggal_masehi, tanggal_jawa, narasi, urutan_scroll, koordinat_lat, koordinat_lng } = req.body;
        
        const { data, error } = await supabase
            .from('sejarah_peristiwa')
            .insert([{ nama_peristiwa, tanggal_masehi, tanggal_jawa, narasi, urutan_scroll, koordinat_lat, koordinat_lng }])
            .select();

        if (error) throw error;
        res.status(201).json({ success: true, message: "Data sejarah berhasil ditambahkan!", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getSejarahById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('sejarah_peristiwa').select('*').eq('id', id).single();
        
        if (error) return res.status(404).json({ success: false, message: "Data sejarah tidak ditemukan" });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateSejarah = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_peristiwa, tanggal_masehi, tanggal_jawa, narasi, urutan_scroll, koordinat_lat, koordinat_lng } = req.body;

        const { data, error } = await supabase
            .from('sejarah_peristiwa')
            .update({ nama_peristiwa, tanggal_masehi, tanggal_jawa, narasi, urutan_scroll, koordinat_lat, koordinat_lng })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ success: true, message: "Data sejarah berhasil diperbarui!", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteSejarah = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('sejarah_peristiwa').delete().eq('id', id);

        if (error) throw error;
        res.status(200).json({ success: true, message: "Data sejarah berhasil dihapus!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};