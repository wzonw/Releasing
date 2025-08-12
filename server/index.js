const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {Pool} = require('pg');
const pool = new Pool ({
  connectionString: process.env.DATABASE_URL,
  ssl:{
    rejectUnauthorized: false,

  }
});


require('dotenv').config();
const app = express();
const host = '0.0.0.0';
const port = 3001;
const UPLOADS_DIR = path.join(__dirname, 'public', 'annex');


app.use(cors({
  origin: "https://docrequest-b5e22.web.app/", // exact domain of your frontend
}));

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
    const fileUrls = files.map(file => `/public/annex/${file}`);
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

// Fetch monitoring data with filters
app.get('/api/monitoring', async (req, res) => {
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
    console.error('Error fetching monitoring data:', err.message);
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

//STATUS SUMMARY SA DASHBOARDno dein
app.get('/api/status-summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT shelfstatus, COUNT(*) AS count
      FROM outgoing.shelfstatus
      GROUP BY shelfstatus
    `);

    const summary = {
      Pending: 0,
      Processing: 0,
      Ready: 0,
      Claimed: 0,
      Total: 0
    };

    let total = 0;

    result.rows.forEach(row => {
      const raw = row.shelfstatus?.trim().toLowerCase();
      const count = parseInt(row.count);

      // Convert to frontend-expected key format
      let formatted = '';
      if (raw === 'pending') formatted = 'Pending';
      else if (raw === 'processing') formatted = 'Processing';
      else if (raw === 'ready') formatted = 'Ready';
      else if (raw === 'claimed') formatted = 'Claimed';

      if (formatted) {
        summary[formatted] += count;
        total += count;
      }
    });

    summary.Total = total;
    res.json(summary);
  } catch (err) {
    console.error('Error in /api/status-summary:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/status-by-college', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.selectedcollege, COUNT(*) AS total
      FROM outgoing.requests r
      GROUP BY r.selectedcollege
      ORDER BY r.selectedcollege
    `);

    // Convert to an object: { "College A": { Total: X }, ... }
    const summary = {};
    result.rows.forEach(row => {
      summary[row.selectedcollege] = {
        Total: parseInt(row.total)
      };
    });

    res.json(summary);
  } catch (err) {
    console.error('Error in /api/status-by-college:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/status-by-college-detailed', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.selectedcollege,
        COALESCE(s.shelfstatus, 'Processing') AS shelfstatus,
        COUNT(*) AS count
      FROM outgoing.requests r
      LEFT JOIN outgoing.shelfstatus s ON r.id = s.request_id
      GROUP BY r.selectedcollege, s.shelfstatus
      ORDER BY r.selectedcollege
    `);

    const summary = {};

    result.rows.forEach(row => {
      const college = row.selectedcollege || 'Unspecified';
      const status = row.shelfstatus?.trim().toLowerCase();
      const count = parseInt(row.count);

      if (!summary[college]) {
        summary[college] = { Processing: 0, Ready: 0, Claimed: 0, Total: 0 };
      }

      if (status === 'processing') summary[college].Processing += count;
      else if (status === 'ready') summary[college].Ready += count;
      else if (status === 'claimed') summary[college].Claimed += count;

      summary[college].Total += count;
    });

    res.json(summary);
  } catch (err) {
    console.error('Error in /api/status-by-college-detailed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// File upload
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully', filePath: `/annex/${req.file.filename}` });
});

// Server test
app.get("/server/message", (req, res) => {
  res.json({ message: "It Works!" });
});

app.post('/server/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM outgoing.role_access WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//login dummy users 
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT username, fullname FROM outgoing.role_access');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Server start
app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});

//Delete pool when shuhtdown
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('PostgreSQL pool has ended');
    process.exit(0);
  });
});