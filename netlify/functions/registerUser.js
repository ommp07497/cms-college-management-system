const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // from Netlify environment
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, password } = data;

    const client = await pool.connect();

    // Create table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // Insert student
    const result = await client.query(
      'INSERT INTO students (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, password]
    );

    client.release();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Student registered!', id: result.rows[0].id })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
