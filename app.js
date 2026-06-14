const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Jalankan middleware global
app.use(cors());
app.use(express.json());

// Sambungkan rute utama API ke endpoint /api
app.use('/api', apiRoutes);

// Rute dasar untuk cek status server
app.get('/', (req, res) => {
    res.json({ message: "Kratonika API sedang berjalan lancar!" });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server [kratonika-backend] aktif di port: ${PORT}`);
});