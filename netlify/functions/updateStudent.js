const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  const { id, fullName, email, rollNumber, department, yearOfStudy, password } = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Update users table
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await client.query(
        `UPDATE users SET full_name=$1, email=$2, password=$3 WHERE id=(SELECT user_id FROM student_details WHERE student_id=$4)`,
        [fullName, email, hashedPassword, id]
      );
    } else {
      await client.query(
        `UPDATE users SET full_name=$1, email=$2 WHERE id=(SELECT user_id FROM student_details WHERE student_id=$3)`,
        [fullName, email, id]
      );
    }

    // Update student_details table
    await client.query(
      `UPDATE student_details SET roll_number=$1, department=$2, year_of_study=$3 WHERE student_id=$4`,
      [rollNumber, department, yearOfStudy, id]
    );

    await client.end();
    return { statusCode: 200, body: JSON.stringify({ message: "Student updated successfully!" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to update student" }) };
  }
};
