// netlify/functions/deleteStudent.js
const { Client } = require("pg");

exports.handler = async (event) => {
  try {
    const { student_id } = JSON.parse(event.body);
    if (!student_id) {
      return { statusCode: 400, body: JSON.stringify({ message: "student_id required" }) };
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    // Get user_id for logging/cleanup
    const userRes = await client.query(
      `SELECT user_id FROM student_details WHERE student_id=$1`,
      [student_id]
    );
    if (userRes.rowCount === 0) {
      await client.end();
      return { statusCode: 404, body: JSON.stringify({ message: "No student found with this ID" }) };
    }
    const userId = userRes.rows[0].user_id;

    // Delete student_details
    const delDetails = await client.query(
      `DELETE FROM student_details WHERE student_id=$1`,
      [student_id]
    );

    // Optionally delete user record as well
    const delUser = await client.query(
      `DELETE FROM users WHERE id=$1`,
      [userId]
    );

    await client.end();

    console.log("delete counts:", { delDetails: delDetails.rowCount, delUser: delUser.rowCount });

    if (delDetails.rowCount === 0) {
      return { statusCode: 500, body: JSON.stringify({ message: "Failed to delete student details" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: "Student deleted successfully" }) };
  } catch (err) {
    console.error("deleteStudent error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to delete student", error: err.message }) };
  }
};
