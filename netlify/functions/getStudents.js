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
        s.student_id,
        u.id AS user_id,
        s.first_name,
        s.last_name,
        CONCAT(s.first_name, ' ', s.last_name) AS full_name,
        u.email,
        s.gender,
        s.date_of_birth,
        s.roll_number,
        s.stream,
        s.honors,
        s.department,
        s.year_of_study,
        s.phone,
        s.address,
        s.guardian_name,
        s.guardian_contact
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
