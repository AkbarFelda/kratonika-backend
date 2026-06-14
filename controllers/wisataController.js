const supabase = require('../config/db');
const { cloudinary } = require('../middlewares/upload');

exports.getAllWisata = async (req, res) => {
    try {
        let query = supabase.from('wisata_destinasi').select('*');
        const { search, category, sort } = req.query;
        if (search) {
            query = query.ilike('nama_destinasi', `%${search}%`);
        }

        if (category) {
            query = query.eq('rumpun', category);
        }

        if (sort) {
            if (sort === 'harga_asc') {
                query = query.order('harga_tiket_domestik', { ascending: true });
            } else if (sort === 'harga_desc') {
                query = query.order('harga_tiket_domestik', { ascending: false });
            } else if (sort === 'nama_asc') {
                query = query.order('nama_destinasi', { ascending: true });
            } else if (sort === 'nama_desc') {
                query = query.order('nama_destinasi', { ascending: false });
            }
        } else {
            query = query.order('created_at', { ascending: false });
        }
        const { data, error } = await query;

        if (error) throw error;

        res.status(200).json({
            success: true,
            total_data: data.length,
            data: data
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createWisata = async (req, res) => {
    try {
        let fotoUrl = null;

        if (req.file) {
            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'kratonika/wisata' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            fotoUrl = await uploadPromise;
        }

        const { nama_destinasi, rumpun, deskripsi, harga_tiket_domestik, jam_operasional } = req.body;

        const { data, error } = await supabase
            .from('wisata_destinasi')
            .insert([{ nama_destinasi, rumpun, deskripsi, harga_tiket_domestik: parseInt(harga_tiket_domestik), foto_url: fotoUrl, jam_operasional }])
            .select();

        if (error) throw error;
        res.status(201).json({ success: true, message: "Destinasi wisata berhasil ditambahkan!", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const folderIndex = parts.indexOf('kratonika');
    if (folderIndex === -1) return null;
    const fileWithExtension = parts.slice(folderIndex).join('/');
    return fileWithExtension.split('.')[0];
};


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

exports.updateWisata = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_destinasi, rumpun, deskripsi, harga_tiket_domestik, jam_operasional } = req.body;
        const { data: oldData } = await supabase.from('wisata_destinasi').select('foto_url').eq('id', id).single();

        let fotoUrl = oldData?.foto_url;

        if (req.file) {
            const oldPublicId = getPublicIdFromUrl(oldData?.foto_url);
            if (oldPublicId) {
                await cloudinary.uploader.destroy(oldPublicId);
            }

            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'kratonika/wisata' },
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
            .from('wisata_destinasi')
            .update({ 
                nama_destinasi, rumpun, deskripsi, 
                harga_tiket_domestik: harga_tiket_domestik ? parseInt(harga_tiket_domestik) : undefined, 
                foto_url: fotoUrl, jam_operasional 
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ success: true, message: "Destinasi wisata berhasil diperbarui!", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteWisata = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: wisata } = await supabase.from('wisata_destinasi').select('foto_url').eq('id', id).single();

        const publicId = getPublicIdFromUrl(wisata?.foto_url);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        const { error } = await supabase.from('wisata_destinasi').delete().eq('id', id);

        if (error) throw error;
        res.status(200).json({ success: true, message: "Destinasi wisata dan aset fotonya berhasil dihapus!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};