const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const deletePath = path.join(__dirname, 'public/annex');

const app = express();
const PORT = 3001;
const UPLOADS_DIR = path.join(__dirname, 'public', 'annex');

app.use(cors());
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

//Delete file function
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

// Set folder for accessing uploaded files
app.use('/annex', express.static(path.join(__dirname, 'public/annex')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/annex'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Or use a timestamped name
  }
});
const upload = multer({ storage });

// upload route
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully', filePath: `/annex/${req.file.filename}` });
});

//server side connection to fronteddn
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/server/message", (req, res) => {
res.json({ message: "It Works!" });
});

app.post('/server/login', (req, res) => {
  const { username, password } = req.body;
  // authentication logic here
  res.json({ success: true, message: 'Login successful!' });
});