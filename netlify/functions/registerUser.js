const { Client } = require("pg");

exports.handler = async (event) => {
  try {
    const { full_name, roll_number, email, password } = JSON.parse(event.body);

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    const query = `
      INSERT INTO students (full_name, roll_number, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const values = [full_name, roll_number, email, password];

    const result = await client.query(query, values);
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User registered!",
        userId: result.rows[0].id,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to register",
        error: err.message,   // <-- send actual error
      }),
    };
  }
};
