// getTeachers.js
const { Client } = require("pg");

exports.handler = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const res = await client.query(`
      SELECT 
        t.teacher_id,
        u.id AS user_id,
        u.full_name,
        u.email,
        t.employee_id,
        t.department,
        t.designation,
        t.qualification,
        t.joining_date,
        t.phone,
        t.address
      FROM teacher_details t
      JOIN users u ON t.user_id = u.id
      WHERE u.role = 'teacher'
      ORDER BY t.teacher_id
    `);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(res.rows),
    };
  } catch (err) {
    console.error("getTeachers error:", err);
    await client.end();  // ensure client closes even on error
    return { 
      statusCode: 500, 
      body: JSON.stringify({ message: "Failed to fetch teachers", error: err.message }) 
    };
  }
};
