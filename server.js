
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder static
app.use(express.static(path.join(__dirname, 'public')));

// Halaman utama
app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public/html/index.html')
    );
});

// ROUTE TEMPLATE MODERN
app.get('/templates/modern', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'templates/templates_modern/index.html')
    );
});

// ROUTE TEMPLATE PROFESIONAL
app.get('/templates/professional', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'templates/templates_professional/index.html')
    );
});

// ROUTE TEMPLATE MINIMALIST
app.get('/templates/minimalist', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'templates/templates_minimalist/index.html')
    );
});

app.use('/templates', express.static(path.join(__dirname, 'templates')));
// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
