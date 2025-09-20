const { Client } = require("pg");
const bcrypt = require("bcrypt");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };

  try {
    const { fullName, email, employeeId, department, designation, password } = JSON.parse(event.body);

    if (!fullName || !email || !employeeId || !department || !designation || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: "All fields are required" }) };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    // Insert into users
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, 'teacher') RETURNING id`,
      [fullName, email, hashedPassword]
    );
    const userId = userRes.rows[0].id;

    // Insert into teacher_details
    await client.query(
      `INSERT INTO teacher_details (user_id, employee_id, department, designation) VALUES ($1, $2, $3, $4)`,
      [userId, employeeId, department, designation]
    );

    await client.end();

    return { statusCode: 200, body: JSON.stringify({ message: "Teacher added successfully" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to add teacher", error: err.message }) };
  }
};
