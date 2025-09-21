const { Client } = require("pg");

exports.handler = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT u.id AS teacher_id, u.full_name, u.email,
             t.employee_id, t.department, t.designation,
             t.qualification, t.joining_date, t.phone, t.address
      FROM users u
      JOIN teacher_details t ON t.user_id = u.id
      ORDER BY u.id
    `);
    await client.end();
    return { statusCode: 200, body: JSON.stringify(res.rows) };
  } catch (err) {
    console.error("getTeachers error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to fetch teachers" }) };
  }
};
