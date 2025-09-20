const { Client } = require("pg");
const bcrypt = require("bcrypt");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };

  try {
    const { id, fullName, email, employeeId, department, designation, password } = JSON.parse(event.body);

    if (!id || !fullName || !email || !employeeId || !department || !designation) {
      return { statusCode: 400, body: JSON.stringify({ message: "Required fields missing" }) };
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    // Update users table
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await client.query(
        `UPDATE users SET full_name=$1, email=$2, password=$3 WHERE id=$4`,
        [fullName, email, hashedPassword, id]
      );
    } else {
      await client.query(
        `UPDATE users SET full_name=$1, email=$2 WHERE id=$3`,
        [fullName, email, id]
      );
    }

    // Update teacher_details
    await client.query(
      `UPDATE teacher_details SET employee_id=$1, department=$2, designation=$3 WHERE user_id=$4`,
      [employeeId, department, designation, id]
    );

    await client.end();

    return { statusCode: 200, body: JSON.stringify({ message: "Teacher updated successfully" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to update teacher", error: err.message }) };
  }
};
