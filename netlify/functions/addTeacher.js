// addTeacher.js
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
  }

  try {
    const { fullName, email, employeeId, department, designation, qualification, joiningDate, phone, address, password } = JSON.parse(event.body);

    // Validate required fields
    if (!fullName || !email || !employeeId || !department || !designation || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: "All required fields must be provided" }) };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    // Insert into users table
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, 'teacher') RETURNING id`,
      [fullName, email, hashedPassword]
    );
    const userId = userRes.rows[0].id;

    // Insert into teacher_details table
    await client.query(
      `INSERT INTO teacher_details 
      (user_id, employee_id, department, designation, qualification, joining_date, phone, address) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, employeeId, department, designation, qualification || null, joiningDate || null, phone || null, address || null]
    );

    await client.end();

    return { statusCode: 200, body: JSON.stringify({ message: "Teacher added successfully" }) };

  } catch (err) {
    console.error("addTeacher error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to add teacher", error: err.message }) };
  }
};
