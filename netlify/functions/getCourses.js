const { Client } = require("pg");

exports.handler = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT * FROM courses ORDER BY id ASC`);
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(res.rows)
    };
  } catch (err) {
    console.error("getCourses error:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ message: "Failed to fetch courses", error: err.message }) 
    };
  }
};
