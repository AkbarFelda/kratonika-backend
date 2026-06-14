const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Kratonika API sedang berjalan lancar!" });
});

app.listen(PORT, () => {
    console.log(`Server [kratonika-backend] aktif di port: ${PORT}`);
});

module.exports = app;