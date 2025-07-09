const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Outgoing',
  password: 'P4ssword',
  port: 5432, // default PostgreSQL port
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Database connection failed:', err));

module.exports = pool;