const { Client } = require("pg");

exports.handler = async (event) => {
  const { id, title, description, target_role } = JSON.parse(event.body);

  if (!id || !title || !description) {
    return { statusCode: 400, body: JSON.stringify({ message: "ID, title and description required" }) };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query(
      `UPDATE notices SET title=$1, description=$2, target_role=$3 WHERE id=$4`,
      [title, description, target_role || 'all', id]
    );
    await client.end();

    return { statusCode: 200, body: JSON.stringify({ message: "Notice updated successfully!" }) };
  } catch (err) {
    console.error("updateNotice error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to update notice", error: err.message }) };
  }
};
