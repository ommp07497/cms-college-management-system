const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  const { fullName, email, password, rollNumber, department, yearOfStudy } = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING id`,
      [fullName, email, hashedPassword]
    );

    const userId = userRes.rows[0].id;

    // Insert into student_details
    await client.query(
      `INSERT INTO student_details (user_id, roll_number, department, year_of_study)
       VALUES ($1, $2, $3, $4)`,
      [userId, rollNumber, department, yearOfStudy]
    );

    await client.end();
    return { statusCode: 200, body: JSON.stringify({ message: "Student added successfully!" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to add student" }) };
  }
};
