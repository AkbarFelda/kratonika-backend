const supabase = require('../config/db');
const { cloudinary } = require('../middlewares/upload');

// Mendapatkan semua data kuliner
exports.getAllKuliner = async (req, res) => {
    try {
        let query = supabase.from('kuliner_warung').select('*');
        const { search, sort } = req.query;

        if (search) {
            query = query.ilike('nama_warung', `%${search}%`);
        }

        if (sort) {
            if (sort === 'harga_asc') {
                query = query.order('estimasi_harga_min', { ascending: true });
            } else if (sort === 'harga_desc') {
                query = query.order('estimasi_harga_max', { ascending: false });
            } else if (sort === 'antrean_asc') {
                query = query.order('waktu_antrean_menit', { ascending: true }); 
            }
        }

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json({ success: true, total_data: data.length, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Menambah data kuliner baru + Upload foto
exports.createKuliner = async (req, res) => {
    try {
        let fotoUrl = null;

        if (req.file) {
            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'kratonika/kuliner' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            fotoUrl = await uploadPromise;
        }

        const { 
            nama_warung, deskripsi, fitur_unik, 
            estimasi_harga_min, estimasi_harga_max, 
            waktu_antrean_menit, jam_buka, jam_tutup 
        } = req.body;

        const { data, error } = await supabase
            .from('kuliner_warung')
            .insert([
                { 
                    nama_warung, deskripsi, fitur_unik, foto_url: fotoUrl,
                    estimasi_harga_min: parseInt(estimasi_harga_min), 
                    estimasi_harga_max: parseInt(estimasi_harga_max), 
                    waktu_antrean_menit: parseInt(waktu_antrean_menit) || 0, 
                    jam_buka, jam_tutup 
                }
            ])
            .select();

        if (error) throw error;
        res.status(201).json({ success: true, message: "Kuliner berhasil ditambahkan!", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Helper untuk mengambil Public ID Cloudinary dari URL gambar
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const folderIndex = parts.indexOf('kratonika');
    if (folderIndex === -1) return null;
    const fileWithExtension = parts.slice(folderIndex).join('/');
    return fileWithExtension.split('.')[0]; // Menghapus ekstensi file seperti .jpg/.png
};

// Get Detail Wisata by ID
exports.getWisataById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('wisata_destinasi').select('*').eq('id', id).single();
        
        if (error) return res.status(404).json({ success: false, message: "Destinasi wisata tidak ditemukan" });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Detail Kuliner by ID
exports.getKulinerById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('kuliner_warung').select('*').eq('id', id).single();
        
        if (error) return res.status(404).json({ success: false, message: "Data kuliner tidak ditemukan" });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update Kuliner
exports.updateKuliner = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_warung, deskripsi, fitur_unik, estimasi_harga_min, estimasi_harga_max, waktu_antrean_menit, jam_buka, jam_tutup } = req.body;

        const { data: oldData } = await supabase.from('kuliner_warung').select('foto_url').eq('id', id).single();
        let fotoUrl = oldData?.foto_url;

        if (req.file) {
            const oldPublicId = getPublicIdFromUrl(oldData?.foto_url);
            if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);

            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'kratonika/kuliner' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            fotoUrl = await uploadPromise;
        }

        const { data, error } = await supabase
            .from('kuliner_warung')
            .update({ 
                nama_warung, deskripsi, fitur_unik, foto_url: fotoUrl,
                estimasi_harga_min: estimasi_harga_min ? parseInt(estimasi_harga_min) : undefined, 
                estimasi_harga_max: estimasi_harga_max ? parseInt(estimasi_harga_max) : undefined, 
                waktu_antrean_menit: waktu_antrean_menit ? parseInt(waktu_antrean_menit) : undefined, 
                jam_buka, jam_tutup 
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ success: true, message: "Data kuliner berhasil diperbarui!", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Kuliner
exports.deleteKuliner = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: kuliner } = await supabase.from('kuliner_warung').select('foto_url').eq('id', id).single();

        const publicId = getPublicIdFromUrl(kuliner?.foto_url);
        if (publicId) await cloudinary.uploader.destroy(publicId);

        const { error } = await supabase.from('kuliner_warung').delete().eq('id', id);
        if (error) throw error;

        res.status(200).json({ success: true, message: "Data kuliner dan fotonya berhasil dihapus!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};