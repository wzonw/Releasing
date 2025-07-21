const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
require('dotenv').config();
const app = express();
const PORT = 3001;
const UPLOADS_DIR = path.join(__dirname, 'public', 'annex');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/files', (req, res) => {
  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read files.' });
    }
    const fileUrls = files.map(file => `http://localhost:3001/public/annex/${file}`);
    res.json(fileUrls);
  });
});

app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'public', 'annex', filename);

  fs.unlink(filepath, (err) => {
    if (err) {
      console.error('Error Deleting File:', err);
      return res.status(500).json({ error: 'Failed to delete file' });
    }
    res.json({ message: 'File Deleted Successfully' });
  });
});

app.use('/annex', express.static(path.join(__dirname, 'public/annex')));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/annex'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Test connection
app.get('/server/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// fetch from request table with filter support
app.get('/api/requests', async (req, res) => {
  try {
    const { lastname, firstname, datesubmitted, degreeprogram, documenttype, status } = req.query;

    let baseQuery = `
      SELECT * FROM (
        SELECT 
          r.*,
          CASE 
            WHEN r.ornumber IS NULL OR TRIM(r.ornumber) = '' THEN 'UNPAID'
            WHEN s.shelfstatus IS NULL THEN 'PROCESSING'
            ELSE s.shelfstatus
          END AS status
        FROM outgoing.requests r
        LEFT JOIN outgoing.shelfstatus s ON r.id = s.request_id
      ) AS subquery
    `;

    const conditions = [];
    const values = [];

    if (lastname && lastname.trim() !== '') {
      conditions.push(`lastname ILIKE $${values.length + 1}`);
      values.push(`%${lastname}%`);
    }
    if (firstname && firstname.trim() !== '') {
      conditions.push(`firstname ILIKE $${values.length + 1}`);
      values.push(`%${firstname}%`);
    }
    if (datesubmitted && datesubmitted.trim() !== '') {
      conditions.push(`datesubmitted = $${values.length + 1}`);
      values.push(datesubmitted);
    }
    if (degreeprogram && degreeprogram.trim() !== '') {
      conditions.push(`degreeprogram ILIKE $${values.length + 1}`);
      values.push(`%${degreeprogram}%`);
    }
    if (documenttype && documenttype.trim() !== '') {
      conditions.push(`documenttype ILIKE $${values.length + 1}`);
      values.push(`%${documenttype}%`);
    }
    if (status && status.trim() !== '') {
      conditions.push(`status ILIKE $${values.length + 1}`);
      values.push(`%${status}%`);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ' ORDER BY datesubmitted DESC';

    const result = await pool.query(baseQuery, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching requests:', err.message);
    res.status(500).send('Server error');
  }
});

//Not in use 
// app.get('/api/shelfstatus', async (req, res) => {
//   try {
//     const result1 = await pool.query('SELECT request_id, shelfstatus, status FROM outgoing.shelfstatus AND outgoing.');
//     res.json(result1.rows);
//   } catch (err) {
//     console.error('Error fetching shelfstatus:', err.message);
//     res.status(500).send('Server error');
//   }
// });

app.post('/verify-data', async (req, res) => {
  const { data } = req.body;

  try {
    const verificationResults = [];

    for (const row of data) {
      const lastName = row["Last Name "];
      const firstName = row["First name "];
      const documents = row["Documents"];

      const result = await pool.query(
        `SELECT * FROM outgoing.requests
         WHERE lastname ILIKE $1 AND firstname ILIKE $2 AND documenttype ILIKE $3`,
        [lastName, firstName, documents]
      );

      verificationResults.push({
        name: `${firstName} ${lastName}`,
        document: documents,
        exists: result.rows.length > 0
      });
    }

    res.json(verificationResults);
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});


const upload = multer({ storage });

//UPDATE BY WHO
app.put('/api/update-status', async (req, res) => {
  try {
    const { request_id, shelfstatus, updatedby } = req.body;

    if (!request_id || !shelfstatus || !updatedby) {
      return res.status(400).send('Missing required fields');
    }

    console.log('Incoming update request:', req.body);
    const result = await pool.query(
      `INSERT INTO shelfstatus (request_id, shelfstatus, updatedby, updatedat)
       VALUES ($1, $2, $3, NOW())`,
      [request_id, shelfstatus, updatedby]
    );

    res.status(200).send('Status updated successfully');
  } catch (error) {
    console.error('Error in /api/update-status:', error);
    res.status(500).send('Server error while updating status');
  }
});




app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully', filePath: `/annex/${req.file.filename}` });
});

app.get("/server/message", (req, res) => {
  res.json({ message: "It Works!" });
});

app.post('/server/login', (req, res) => {
  const { username, password } = req.body;
  res.json({ success: true, message: 'Login successful!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
