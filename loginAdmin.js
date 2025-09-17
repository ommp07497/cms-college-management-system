const { Client } = require("pg");

exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    const res = await client.query(
      "SELECT * FROM admins WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (res.rows.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, user: res.rows[0] }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: "Invalid credentials" }),
      };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    await client.end();
  }
};
