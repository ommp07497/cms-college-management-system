const { Client } = require("pg");

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

    const result = await client.query(
      `SELECT id, full_name, role, password FROM users WHERE email=$1`,
      [email]
    );

    await client.end();

    if (result.rows.length === 0 || result.rows[0].password !== password) {
      return { statusCode: 401, body: JSON.stringify({ message: "Invalid email or password" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful",
        userId: result.rows[0].id,
        fullName: result.rows[0].full_name,
        role: result.rows[0].role
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to login", error: err.message }) };
  }
};
