const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { teacher_id, fullName, email, password, employeeId, department, designation, qualification, joiningDate, phone, address } = JSON.parse(event.body);

    if (!teacher_id || !fullName || !email || !employeeId || !department || !designation) {
      return { statusCode: 400, body: JSON.stringify({ message: "Required fields missing" }) };
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();

    // Update users table
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await client.query(
        `UPDATE users SET full_name=$1, email=$2, password=$3 WHERE id=$4`,
        [fullName, email, hashedPassword, teacher_id]
      );
    } else {
      await client.query(
        `UPDATE users SET full_name=$1, email=$2 WHERE id=$3`,
        [fullName, email, teacher_id]
      );
    }

    // Update teacher_details table
    await client.query(
      `UPDATE teacher_details 
       SET employee_id=$1, department=$2, designation=$3, qualification=$4, joining_date=$5, phone=$6, address=$7
       WHERE user_id=$8`,
      [employeeId, department, designation, qualification || null, joiningDate || null, phone || null, address || null, teacher_id]
    );

    await client.end();
    return { statusCode: 200, body: JSON.stringify({ message: "Teacher updated successfully" }) };

  } catch (err) {
    console.error("updateTeacher error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to update teacher", error: err.message }) };
  }
};
