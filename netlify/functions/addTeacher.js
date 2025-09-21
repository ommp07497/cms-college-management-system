const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { fullName, email, password, employeeId, department, designation, qualification, joiningDate, phone, address } = JSON.parse(event.body);

    if (!fullName || !email || !password || !employeeId || !department || !designation) {
      return { statusCode: 400, body: JSON.stringify({ message: "Required fields missing" }) };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();

    const userRes = await client.query(
      `INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id`,
      [fullName, email, hashedPassword]
    );

    const userId = userRes.rows[0].id;

    await client.query(
      `INSERT INTO teacher_details (user_id, employee_id, department, designation, qualification, joining_date, phone, address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [userId, employeeId, department, designation, qualification || null, joiningDate || null, phone || null, address || null]
    );

    await client.end();
    return { statusCode: 200, body: JSON.stringify({ message: "Teacher added successfully" }) };

  } catch (err) {
    console.error("addTeacher error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to add teacher", error: err.message }) };
  }
};
