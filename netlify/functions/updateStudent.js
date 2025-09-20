// netlify/functions/updateStudent.js
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);
    console.log("updateStudent payload:", payload);
    const { id, fullName, email, rollNumber, department, yearOfStudy, password } = payload;

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ message: "student_id (id) is required" }) };
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    // Update users table (user_id is looked up from student_details)
    let resUser;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      resUser = await client.query(
        `UPDATE users
         SET full_name=$1, email=$2, password=$3
         WHERE id = (SELECT user_id FROM student_details WHERE student_id=$4)`,
        [fullName, email, hashed, id]
      );
    } else {
      resUser = await client.query(
        `UPDATE users
         SET full_name=$1, email=$2
         WHERE id = (SELECT user_id FROM student_details WHERE student_id=$3)`,
        [fullName, email, id]
      );
    }

    // Update student_details
    const resDetails = await client.query(
      `UPDATE student_details
       SET roll_number=$1, department=$2, year_of_study=$3
       WHERE student_id=$4`,
      [rollNumber, department, yearOfStudy, id]
    );

    await client.end();

    console.log("update rowCounts:", { user: resUser.rowCount, details: resDetails.rowCount });

    if (resUser.rowCount === 0 && resDetails.rowCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "No student found with this ID" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: "Student updated successfully!" }) };
  } catch (err) {
    console.error("updateStudent error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to update student", error: err.message }) };
  }
};
