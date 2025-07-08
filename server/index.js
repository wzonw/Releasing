const express = require("express");
const PORT = 3001;
const app = express();

app.use(express.json());

app.listen(PORT, () => {
console.log(`Server listening on ${PORT}`);
});

app.get("/server/message", (req, res) => {
res.json({ message: "It Works!" });
});

app.post('/server/login', (req, res) => {
  const { username, password } = req.body;
  // authentication logic here
  res.json({ success: true, message: 'Login successful!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});