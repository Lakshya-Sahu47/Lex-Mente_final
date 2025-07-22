// Load environment variables in non-production environments
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Verify path-to-regexp is working
try {
  const { pathToRegexp } = require('path-to-regexp');
  console.log('path-to-regexp loaded successfully');
} catch (err) {
  console.error('Error loading path-to-regexp:', err);
}

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Multer configuration (memory storage since we'll store in DB)
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as Buffer
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

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

    // Validate date
    const parsedDate = new Date(publishDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    // Convert the file buffer to a hex string for PostgreSQL bytea
    const fileData = req.file.buffer;

    const result = await pool.query(
      `INSERT INTO journal_entries 
       (title, author, category, volume, issue, publish_date, file_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, author, category, volume, issue, parsedDate, fileData]
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

// API Endpoint to Initialize Sample Data
app.post('/api/initialize-sample', async (req, res) => {
  try {
    const samplePdfPath = path.join(__dirname, 'sample.pdf');
    const fileData = fs.readFileSync(samplePdfPath);

    await pool.query(
      `INSERT INTO journal_entries 
       (id, title, author, category, volume, issue, publish_date, file_data) 
       VALUES (1, $1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          author = EXCLUDED.author,
          category = EXCLUDED.category,
          volume = EXCLUDED.volume,
          issue = EXCLUDED.issue,
          publish_date = EXCLUDED.publish_date,
          file_data = EXCLUDED.file_data`,
      [
        'Sample Article: The Evolution of Digital Privacy Laws',
        'Jane Doe',
        'Technology Law',
        '1',
        '1',
        new Date('2025-06-15'),
        fileData
      ]
    );

    res.json({ message: 'Sample data initialized successfully' });
  } catch (error) {
    console.error('Error initializing sample data:', error);
    res.status(500).json({ 
      message: 'Failed to initialize sample data', 
      error: error.message 
    });
  }
});

// API Endpoint to Get All Journal Entries (updated to include more fields)
app.get('/api/journals', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, author, category, 
             volume, issue, 
             publish_date as "publishDate",
             CONCAT('journal_', id, '.pdf') as filename
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

// API Endpoint to Get All Journal Entries (with all fields including file_data)
app.get('/api/journal-entries', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, author, category, 
             volume, issue, 
             publish_date as "publishDate",
             file_data
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

// API Endpoint to Delete a Journal Entry
app.delete('/api/journals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First verify the journal exists
    const checkResult = await pool.query(
      'SELECT id FROM journal_entries WHERE id = $1', 
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    // Delete the journal
    await pool.query(
      'DELETE FROM journal_entries WHERE id = $1',
      [id]
    );

    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting journal:', error);
    res.status(500).json({
      message: 'Server error during deletion.',
      error: error.message
    });
  }
});

// API Endpoint to Get PDF File
app.get('/api/journal-entries/:id/pdf', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT file_data FROM journal_entries WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0 || !result.rows[0].file_data) {
      return res.status(404).json({ message: 'File not found' });
    }

    const pdfBuffer = result.rows[0].file_data;
    res.set('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).json({
      message: 'Server error fetching PDF.',
      error: error.message
    });
  }
});

// Client-side routing fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: err.message
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});