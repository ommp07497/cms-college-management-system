// deleteTeacher.js
const { Client } = require("pg");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
  }

  try {
    const { teacher_id } = JSON.parse(event.body);
    if (!teacher_id) return { statusCode: 400, body: JSON.stringify({ message: "teacher_id required" }) };

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    // Delete teacher details first (foreign key)
    await client.query(`DELETE FROM teacher_details WHERE user_id=$1`, [teacher_id]);

    // Delete user
    await client.query(`DELETE FROM users WHERE id=$1`, [teacher_id]);

    await client.end();

    return { statusCode: 200, body: JSON.stringify({ message: "Teacher deleted successfully" }) };
  } catch (err) {
    console.error("deleteTeacher error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to delete teacher", error: err.message }) };
  }
};
