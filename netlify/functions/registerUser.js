const { Client } = require("pg");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { fullName, rollNumber, email, password } = JSON.parse(event.body);

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    await client.query(
      "INSERT INTO students (full_name, roll_number, email, password) VALUES ($1, $2, $3, $4)",
      [fullName, rollNumber, email, password]
    );
    await client.end();

    return { statusCode: 200, body: "Student registered successfully" };
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
};
