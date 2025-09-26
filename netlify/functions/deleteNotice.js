const { Client } = require("pg");

exports.handler = async (event) => {
  const { id } = JSON.parse(event.body);

  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ message: "ID required" }) };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query(`DELETE FROM notices WHERE id=$1`, [id]);
    await client.end();

    return { statusCode: 200, body: JSON.stringify({ message: "Notice deleted successfully!" }) };
  } catch (err) {
    console.error("deleteNotice error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to delete notice", error: err.message }) };
  }
};
