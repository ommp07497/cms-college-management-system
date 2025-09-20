const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: "Email and password required" }) };
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    // Fetch user by email
    const result = await client.query(
      `SELECT id, full_name, role, password FROM users WHERE email=$1`,
      [email]
    );

    await client.end();

    if (result.rows.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ message: "Invalid email or password" }) };
    }

    const user = result.rows[0];

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { statusCode: 401, body: JSON.stringify({ message: "Invalid email or password" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful",
        userId: user.id,
        fullName: user.full_name,
        role: user.role
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to login", error: err.message }) };
  }
};
