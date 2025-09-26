const { Client } = require("pg");

exports.handler = async (event) => {
  const { title, description, target_role } = JSON.parse(event.body);

  if (!title || !description) {
    return { statusCode: 400, body: JSON.stringify({ message: "Title and description required" }) };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query(
      `INSERT INTO notices(title, description, target_role) VALUES($1, $2, $3)`,
      [title, description, target_role || 'all']
    );
    await client.end();

    return { statusCode: 200, body: JSON.stringify({ message: "Notice added successfully!" }) };
  } catch (err) {
    console.error("addNotice error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to add notice", error: err.message }) };
  }
};
