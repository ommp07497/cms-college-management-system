// netlify/functions/getStudents.js
const { Client } = require("pg");

exports.handler = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        s.student_id AS student_id,
        u.id AS user_id,
        u.full_name,
        u.email,
        s.roll_number,
        s.department,
        s.year_of_study
      FROM student_details s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.student_id ASC
    `);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    console.error("getStudents error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch students", error: err.message }),
    };
  }
};
