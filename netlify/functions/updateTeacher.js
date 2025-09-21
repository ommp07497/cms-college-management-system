// netlify/functions/updateTeacher.js
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
  }

  try {
    const payload = JSON.parse(event.body);
    console.log("updateTeacher payload:", payload);

    const {
      id,          // teacher_id
      fullName,
      email,
      employeeId,
      department,
      designation,
      qualification,
      joiningDate,
      phone,
      address,
      password     // optional
    } = payload;

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ message: "teacher_id (id) is required" }) };
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    // Update users table using teacher_id lookup
    let resUser;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      resUser = await client.query(
        `UPDATE users
         SET full_name=$1, email=$2, password=$3
         WHERE id = (SELECT user_id FROM teacher_details WHERE teacher_id=$4)`,
        [fullName, email, hashed, id]
      );
    } else {
      resUser = await client.query(
        `UPDATE users
         SET full_name=$1, email=$2
         WHERE id = (SELECT user_id FROM teacher_details WHERE teacher_id=$3)`,
        [fullName, email, id]
      );
    }

    // Update teacher_details
    const resDetails = await client.query(
      `UPDATE teacher_details
       SET employee_id=$1, department=$2, designation=$3, qualification=$4, joining_date=$5, phone=$6, address=$7
       WHERE teacher_id=$8`,
      [employeeId, department, designation || null, qualification || null, joiningDate || null, phone || null, address || null, id]
    );

    await client.end();

    console.log("update rowCounts:", { user: resUser.rowCount, details: resDetails.rowCount });

    if (resUser.rowCount === 0 && resDetails.rowCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ message: "No teacher found with this ID" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: "Teacher updated successfully!" }) };
  } catch (err) {
    console.error("updateTeacher error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to update teacher", error: err.message }) };
  }
};
