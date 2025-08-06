const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  // 🌐 For Render / production
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // 🖥️ For local development
  pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Outgoing',
    password: 'P4ssword',
    port: 5432,
  });
}

pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Database connection failed:', err));

module.exports = pool;
