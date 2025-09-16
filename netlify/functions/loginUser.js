const { Client } = require("pg");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
  }

  try {
    const { email, password, role } = JSON.parse(event.body);

    if (!email || !password || !role) {
      return { statusCode: 400, body: JSON.stringify({ message: "All fields are required" }) };
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    let tableName = "";
    if (role === "Student") tableName = "students";
    else if (role === "Teacher") tableName = "teachers";
    else if (role === "Admin") tableName = "admins";
    else throw new Error("Invalid role");

    const query = `SELECT id, full_name, password FROM ${tableName} WHERE email=$1`;
    const result = await client.query(query, [email]);

    await client.end();

    if (result.rows.length === 0 || result.rows[0].password !== password) {
      return { statusCode: 401, body: JSON.stringify({ message: "Invalid email or password" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful",
        role,
        userId: result.rows[0].id,
        fullName: result.rows[0].full_name,
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to login", error: err.message }) };
  }
};
