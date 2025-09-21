// netlify/functions/deleteTeacher.js
const { Client } = require("pg");

exports.handler = async (event) => {
  try {
    const { teacher_id } = JSON.parse(event.body);
    if (!teacher_id) {
      return { statusCode: 400, body: JSON.stringify({ message: "teacher_id required" }) };
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    // Get user_id for this teacher_id
    const userRes = await client.query(
      `SELECT user_id FROM teacher_details WHERE user_id=$1`,
      [teacher_id]
    );

    if (userRes.rowCount === 0) {
      await client.end();
      return { statusCode: 404, body: JSON.stringify({ message: "No teacher found with this ID" }) };
    }

    const userId = userRes.rows[0].user_id;

    // Delete from teacher_details first (foreign key constraint)
    const delDetails = await client.query(
      `DELETE FROM teacher_details WHERE user_id=$1`,
      [userId]
    );

    // Delete from users table
    const delUser = await client.query(
      `DELETE FROM users WHERE id=$1`,
      [userId]
    );

    await client.end();

    if (delDetails.rowCount === 0) {
      return { statusCode: 500, body: JSON.stringify({ message: "Failed to delete teacher details" }) };
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: "Teacher deleted successfully" }) 
    };

  } catch (err) {
    console.error("deleteTeacher error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to delete teacher", error: err.message }) };
  }
};
