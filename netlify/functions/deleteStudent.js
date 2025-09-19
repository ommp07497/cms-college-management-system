const { Client } = require("pg");

exports.handler = async (event) => {
  const { id } = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Delete student (cascade will remove user too)
    await client.query(`DELETE FROM student_details WHERE student_id=$1`, [id]);

    await client.end();
    return { statusCode: 200, body: JSON.stringify({ message: "Student deleted successfully!" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to delete student" }) };
  }
};
