const { Client } = require("pg");

exports.handler = async (event) => {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const { fullName, rollNumber, email, password } = JSON.parse(event.body);

    if (!fullName || !rollNumber || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "All fields are required" }),
      };
    }

    // ✅ Connect to Neon
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    // Check if email already exists
    const checkEmail = await client.query(
      "SELECT id FROM students WHERE email = $1",
      [email]
    );

    if (checkEmail.rows.length > 0) {
      await client.end();
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "Email already registered" }),
      };
    }

    // Insert new student
    const insertQuery = `
      INSERT INTO students (full_name, roll_number, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const values = [fullName, rollNumber, email, password];

    const result = await client.query(insertQuery, values);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User registered successfully!",
        userId: result.rows[0].id,
      }),
    };
  } catch (err) {
    console.error("Registration Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to register",
        error: err.message,
      }),
    };
  }
};
