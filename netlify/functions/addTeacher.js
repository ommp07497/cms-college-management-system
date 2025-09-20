// addTeacher.js
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const { fullName, email, employeeId, department, designation, qualification, joiningDate, phone, address, password } = JSON.parse(event.body);

    // Required fields check
    if (!fullName || !email || !employeeId || !department || !designation || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: "All required fields must be provided" }) };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.connect();

    // Insert user
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, 'teacher') RETURNING id`,
      [fullName, email, hashedPassword]
    );
    const userId = userRes.rows[0].id;

    // Insert teacher details
    await client.query(
      `INSERT INTO teacher_details
      (user_id, employee_id, department, designation, qualification, joining_date, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        employeeId,
        department,
        designation,
        qualification || null,
        joiningDate ? joiningDate : null,  // ensure proper date format YYYY-MM-DD
        phone || null,
        address || null
      ]
    );

    await client.end();
    return { statusCode: 200, body: JSON.stringify({ message: "Teacher added successfully" }) };

  } catch (err) {
    await client.end();

    // Detailed error for debugging
    console.error("addTeacher error:", err);
    
    // Check for unique constraint violation
    if (err.code === "23505") {
      return { statusCode: 400, body: JSON.stringify({ message: "Email or Employee ID already exists" }) };
    }

    return { statusCode: 500, body: JSON.stringify({ message: "Failed to add teacher", error: err.message }) };
  }
};
