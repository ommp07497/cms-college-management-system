const { Client } = require("pg");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
  }

  try {
    const { fullName, rollNumber, email, password, department, yearOfStudy } = JSON.parse(event.body);

    if (!fullName || !rollNumber || !email || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: "All fields are required" }) };
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    const insertUser = `
      INSERT INTO users (full_name, email, password, role)
      VALUES ($1, $2, $3, 'student')
      RETURNING id;
    `;
    const userRes = await client.query(insertUser, [fullName, email, password]);
    const userId = userRes.rows[0].id;

    const insertDetails = `
      INSERT INTO student_details (user_id, roll_number, department, year_of_study)
      VALUES ($1, $2, $3, $4);
    `;
    await client.query(insertDetails, [userId, rollNumber, department || null, yearOfStudy || null]);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Registered successfully", userId }),
    };
  } catch (err) {
    console.error("Register error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to register", error: err.message }),
    };
  }
};
