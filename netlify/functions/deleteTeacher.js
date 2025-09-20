const { Client } = require("pg");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };

  try {
    const { teacher_id } = JSON.parse(event.body);
    if (!teacher_id) return { statusCode: 400, body: JSON.stringify({ message: "Teacher ID required" }) };

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    // Get user_id first
    const res = await client.query(`SELECT user_id FROM teacher_details WHERE teacher_id=$1`, [teacher_id]);
    if (res.rows.length === 0) return { statusCode: 404, body: JSON.stringify({ message: "Teacher not found" }) };
    const userId = res.rows[0].user_id;

    // Delete user (will cascade delete teacher_details)
    await client.query(`DELETE FROM users WHERE id=$1`, [userId]);

    await client.end();

    return { statusCode: 200, body: JSON.stringify({ message: "Teacher deleted successfully" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to delete teacher", error: err.message }) };
  }
};
