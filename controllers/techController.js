const supabase = require('../config/db');
const { cloudinary } = require('../middlewares/upload');

exports.getAllTech = async (req, res) => {
    try {
        const { data, error } = await supabase.from('tech_ecosystem').select('*');
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createTech = async (req, res) => {
    try {
        let logoUrl = null;

        if (req.file) {
            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'kratonika/tech' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            logoUrl = await uploadPromise;
        }

        const { nama_entitas, kategori, deskripsi, alamat, link_website } = req.body;

        const { data, error } = await supabase
            .from('tech_ecosystem')
            .insert([{ nama_entitas, kategori, deskripsi, alamat, logo_url: logoUrl, link_website }])
            .select();

        if (error) throw error;
        res.status(201).json({ success: true, message: "Entitas ekosistem tech berhasil ditambahkan!", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Detail Tech by ID
exports.getTechById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('tech_ecosystem').select('*').eq('id', id).single();
        
        if (error) return res.status(404).json({ success: false, message: "Entitas tech tidak ditemukan" });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update Tech
exports.updateTech = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_entitas, kategori, deskripsi, alamat, link_website } = req.body;

        const { data: oldData } = await supabase.from('tech_ecosystem').select('logo_url').eq('id', id).single();
        let logoUrl = oldData?.logo_url;

        if (req.file) {
            const oldPublicId = getPublicIdFromUrl(oldData?.logo_url);
            if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);

            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'kratonika/tech' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            logoUrl = await uploadPromise;
        }

        const { data, error } = await supabase
            .from('tech_ecosystem')
            .update({ nama_entitas, kategori, deskripsi, alamat, logo_url: logoUrl, link_website })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ success: true, message: "Data ekosistem tech berhasil diperbarui!", data: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete Tech
exports.deleteTech = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: tech } = await supabase.from('tech_ecosystem').select('logo_url').eq('id', id).single();

        const publicId = getPublicIdFromUrl(tech?.logo_url);
        if (publicId) await cloudinary.uploader.destroy(publicId);

        const { error } = await supabase.from('tech_ecosystem').delete().eq('id', id);
        if (error) throw error;

        res.status(200).json({ success: true, message: "Entitas tech berhasil dihapus!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};