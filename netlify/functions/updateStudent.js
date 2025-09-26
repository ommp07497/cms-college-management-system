const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);
    console.log("updateStudent payload:", payload);

    const {
      id,
      firstName,
      lastName,
      email,
      password,
      rollNumber,
      department,
      yearOfStudy,
      gender,
      dobDay,
      dobMonth,
      dobYear,
      stream,
      honors,
      phone,
      address,
      guardianName,
      guardianContact
    } = payload;

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ message: "student_id (id) is required" }) };
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    // Update users table
    const fullName = `${firstName} ${lastName}`;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await client.query(
        `UPDATE users
         SET full_name=$1, email=$2, password=$3
         WHERE id = (SELECT user_id FROM student_details WHERE student_id=$4)`,
        [fullName, email, hashed, id]
      );
    } else {
      await client.query(
        `UPDATE users
         SET full_name=$1, email=$2
         WHERE id = (SELECT user_id FROM student_details WHERE student_id=$3)`,
        [fullName, email, id]
      );
    }

    // Construct DOB in YYYY-MM-DD format
    const dob = dobYear && dobMonth && dobDay ? `${dobYear}-${dobMonth}-${dobDay}` : null;

    // Update student_details table
    await client.query(
      `UPDATE student_details
       SET first_name=$1,
           last_name=$2,
           gender=$3,
           date_of_birth=$4,
           roll_number=$5,
           stream=$6,
           honors=$7,
           department=$8,
           year_of_study=$9,
           phone=$10,
           address=$11,
           guardian_name=$12,
           guardian_contact=$13
       WHERE student_id=$14`,
      [firstName, lastName, gender, dob, rollNumber, stream, honors || null, department, yearOfStudy, phone, address, guardianName, guardianContact, id]
    );

    await client.end();

    return { statusCode: 200, body: JSON.stringify({ message: "Student updated successfully!" }) };
  } catch (err) {
    console.error("updateStudent error:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to update student", error: err.message }) };
  }
};
