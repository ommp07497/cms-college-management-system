const { Client } = require("pg");

exports.handler = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL, // set this in Netlify env vars
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT 
        u.id, u.full_name, u.email, 
        s.roll_number, s.department, s.year_of_study
      FROM users u
      JOIN student_details s ON u.id = s.user_id
      WHERE u.role = 'student'
      ORDER BY u.id ASC
    `);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };

  } catch (error) {
    console.error("Error fetching students:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch students", error: error.message }),
    };
  }
};
