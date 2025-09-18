const { Client } = require("pg");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { fullName, rollNumber, email, password, department, yearOfStudy } = JSON.parse(event.body);

    if (!email || !password || !fullName || !rollNumber) {
      return { statusCode: 400, body: JSON.stringify({ message: "Required fields missing" }) };
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Step 1: insert into users
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING id`,
      [fullName, email, password]
    );

    const userId = userRes.rows[0].id;

    // Step 2: insert into student_details
    await client.query(
      `INSERT INTO student_details (user_id, roll_number, department, year_of_study)
       VALUES ($1, $2, $3, $4)`,
      [userId, rollNumber, department || null, yearOfStudy || null]
    );

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Student registered successfully", userId }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
