const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
require('dotenv').config();
const app = express();
const host = '0.0.0.0';
const port = 3001;
const UPLOADS_DIR = path.join(__dirname, 'public', 'annex');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve uploaded annex files
app.use('/annex', express.static(path.join(__dirname, 'public/annex')));

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/annex'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// File listing
app.get('/files', (req, res) => {
  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read files.' });
    }
    const fileUrls = files.map(file => `http://localhost:3001/public/annex/${file}`);
    res.json(fileUrls);
  });
});

// File deletion
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(UPLOADS_DIR, filename);

  fs.unlink(filepath, (err) => {
    if (err) {
      console.error('Error Deleting File:', err);
      return res.status(500).json({ error: 'Failed to delete file' });
    }
    res.json({ message: 'File Deleted Successfully' });
  });
});

// Test DB connection
app.get('/server/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Fetch requests with filters
app.get('/api/requests', async (req, res) => {
  try {
    const { lastname, firstname, datesubmitted, degreeprogram, documenttype, status } = req.query;

    let baseQuery = `
      SELECT * FROM (
        SELECT 
          r.id,
          r.formrequestid,
          r.studentnumber,
          r.firstname,
          r.lastname,
          r.middlename,
          r.degreeprogram,
          r.ayadmitted,
          r.documenttype,
          r.quantity,
          r.attachmentfile,
          r.totalamount,
          r.ornumber,
          r.phonenumber,
          r.emailaddress,
          TO_CHAR(r.datesubmitted, 'YYYY-MM-DD') AS datesubmitted,
          TO_CHAR(r.daterequested, 'YYYY-MM-DD') AS daterequested,
          TO_CHAR(r.graduationdate, 'YYYY-MM-DD') AS graduationdate,
          r.selectedcollege,
          r.originalreceipt,
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
      conditions.push(`subquery.lastname ILIKE $${values.length + 1}`);
      values.push(`%${lastname}%`);
    }
    if (firstname && firstname.trim() !== '') {
      conditions.push(`subquery.firstname ILIKE $${values.length + 1}`);
      values.push(`%${firstname}%`);
    }
    if (datesubmitted && datesubmitted.trim() !== '') {
      conditions.push(`subquery.datesubmitted = $${values.length + 1}`);
      values.push(datesubmitted);
    }
    if (degreeprogram && degreeprogram.trim() !== '') {
      conditions.push(`subquery.degreeprogram ILIKE $${values.length + 1}`);
      values.push(`%${degreeprogram}%`);
    }
    if (documenttype && documenttype.trim() !== '') {
      conditions.push(`subquery.documenttype ILIKE $${values.length + 1}`);
      values.push(`%${documenttype}%`);
    }
    if (status && status.trim() !== '') {
      conditions.push(`subquery.status ILIKE $${values.length + 1}`);
      values.push(`%${status}%`);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ' ORDER BY subquery.datesubmitted DESC';

    const result = await pool.query(baseQuery, values);
    res.json(result.rows); 
  } catch (err) {
    console.error('Error fetching requests:', err.message);
    res.status(500).send('Server error');
  }
});

// Bulk verification and update
app.post('/verify-data', async (req, res) => {
  const { data } = req.body;
  const updatedby = 'System';

  try {
    const verificationResults = [];

    // Step 1: Count duplicates in Excel
    const requestCounts = {};

    for (const row of data) {
      const keys = Object.keys(row).reduce((acc, key) => {
        acc[key.trim().toLowerCase()] = row[key];
        return acc;
      }, {});

      const key = `${keys["first name"]?.trim().toLowerCase()}|${keys["last name"]?.trim().toLowerCase()}|${keys["documents"]?.trim().toLowerCase()}`;
      if (!requestCounts[key]) requestCounts[key] = 0;
      requestCounts[key]++;
    }

    // Step 2: For each unique entry, update oldest matching rows
    for (const combo in requestCounts) {
      const [firstName, lastName, documents] = combo.split("|");
      const count = requestCounts[combo];

      const result = await pool.query(
        `SELECT id, datesubmitted FROM outgoing.requests
         WHERE firstname ILIKE $1 AND lastname ILIKE $2 AND documenttype ILIKE $3
         ORDER BY datesubmitted ASC`,
        [firstName, lastName, documents]
      );

      const matchingRequests = result.rows.slice(0, count); // Get only N oldest

      if (matchingRequests.length === 0) {
        verificationResults.push({
          name: `${firstName} ${lastName}`,
          document: documents,
          updated: false,
          error: 'Request not found'
        });
        continue;
      }

      for (const request of matchingRequests) {
        await pool.query(
          `INSERT INTO outgoing.shelfstatus (request_id, shelfstatus, updatedby, updatedat)
           VALUES ($1, 'READY', $2, NOW())
           ON CONFLICT (request_id) DO UPDATE SET
             shelfstatus = EXCLUDED.shelfstatus,
             updatedby = EXCLUDED.updatedby,
             updatedat = NOW()`,
          [request.id, updatedby]
        );

        verificationResults.push({
          name: `${firstName} ${lastName}`,
          document: documents,
          updated: true
        });
      }
    }

    res.json(verificationResults);
  } catch (err) {
    console.error('Verification and update error:', err);
    res.status(500).json({ error: 'Verification/update failed' });
  }
});



// Manual status update
app.put('/api/update-status', async (req, res) => {
  try {
    const { request_id, shelfstatus, updatedby } = req.body;

    if (!request_id || !shelfstatus || !updatedby) {
      return res.status(400).send('Missing required fields');
    }

    await pool.query(
      `INSERT INTO outgoing.shelfstatus (request_id, shelfstatus, updatedby, updatedat)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (request_id) DO UPDATE SET
        shelfstatus = EXCLUDED.shelfstatus,
        updatedby = EXCLUDED.updatedby,
        updatedat = NOW()`,
      [request_id, shelfstatus, updatedby]
    );

    res.status(200).send('Status updated successfully');
  } catch (error) {
    console.error('Error in /api/update-status:', error);
    res.status(500).send('Server error while updating status');
  }
});

// Dashboard data
app.get('/api/dashboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.selectedcollege,
        r.degreeprogram,
        r.graduationdate,
        ss.shelfstatus AS status
      FROM outgoing.requests r
      LEFT JOIN outgoing.shelfstatus ss ON r.id = ss.request_id
    `);

    const statusCounts = {
      pending: 0,
      processing: 0,
      shelf: 0,
    };

    const graduateCounts = {};

    result.rows.forEach(row => {
      const { selectedcollege, graduationdate, status } = row;
      const isGraduate = graduationdate !== null;

      if (status === 'Pending') statusCounts.pending++;
      else if (status === 'Processing') statusCounts.processing++;
      else if (status === 'Shelf') statusCounts.shelf++;

      if (!graduateCounts[selectedcollege]) {
        graduateCounts[selectedcollege] = {
          selectedcollege,
          undergraduate: 0,
          graduate: 0,
          total: 0
        };
      }

      if (isGraduate) {
        graduateCounts[selectedcollege].graduate += 1;
      } else {
        graduateCounts[selectedcollege].undergraduate += 1;
      }

      graduateCounts[selectedcollege].total += 1;
    });

    const graduateCountsArray = Object.values(graduateCounts);

    res.json({
      statusCounts,
      graduateCounts: graduateCountsArray
    });

  } catch (error) {
    console.error('Dashboard query error:', error.message);
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

// File upload
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully', filePath: `/annex/${req.file.filename}` });
});

// Server test and login dummy routes
app.get("/server/message", (req, res) => {
  res.json({ message: "It Works!" });
});

app.post('/server/login', (req, res) => {
  const { username, password } = req.body;
  res.json({ success: true, message: 'Login successful!' });
});

// Server start
app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});
