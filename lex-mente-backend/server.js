const express = require('express');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Connection Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lexmente_db',
    password: 'lakshya',
    port: 5432,
});

// Ensure the uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from LexMente directory
app.use(express.static(path.join('C:', 'Users', 'Nehal Sahu', 'Desktop', 'LexMente')));

// Serve uploaded PDFs with proper headers
app.use('/uploads', express.static(UPLOADS_DIR, {
    setHeaders: (res, path) => {
        if (path.endsWith('.pdf')) {
            res.set('Content-Type', 'application/pdf');
            res.set('Content-Disposition', 'inline; filename=' + path.basename(path));
        }
    }
}));

// API Endpoint for PDF Upload
app.post('/upload-journal', upload.single('journalPdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No PDF file uploaded.' });
        }

        const { title, author, category, volume, issue, publishDate } = req.body;
        
        // Validate required fields
        if (!title || !author || !volume || !issue || !publishDate) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Parse the date to ensure it's valid
        const parsedDate = new Date(publishDate);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format.' });
        }

        const filePath = '/uploads/' + req.file.filename;

        const result = await pool.query(
            `INSERT INTO journal_entries 
             (title, author, category, volume, issue, publish_date, file_path) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, author, category, volume, issue, parsedDate, filePath]
        );

        res.status(201).json({ 
            message: 'Journal entry uploaded successfully!', 
            entry: result.rows[0] 
        });
    } catch (error) {
        console.error('Error uploading journal entry:', error);
        res.status(500).json({ 
            message: 'Server error during upload.',
            error: error.message 
        });
    }
});

// API Endpoint to Get All Journal Entries
app.get('/api/journal-entries', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, author, category, volume, issue, 
                   publish_date as "publishDate", file_path as "filePath"
            FROM journal_entries 
            ORDER BY publish_date DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ 
            message: 'Server error fetching entries.',
            error: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'An unexpected error occurred',
        error: err.message 
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Upload directory: ${UPLOADS_DIR}`);
    console.log(`Serving static files from: ${path.join('C:', 'Users', 'Nehal Sahu', 'Desktop', 'LexMente')}`);
});