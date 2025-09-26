const { Client } = require("pg");
const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
  const {
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
  } = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING id`,
      [`${firstName} ${lastName}`, email, hashedPassword]
    );

    const userId = userRes.rows[0].id;

    // Construct DOB in YYYY-MM-DD format
    const dob = dobYear && dobMonth && dobDay ? `${dobYear}-${dobMonth}-${dobDay}` : null;

    // Insert into student_details
    await client.query(
      `INSERT INTO student_details (
         user_id, first_name, last_name, gender, date_of_birth,
         roll_number, stream, honors, department, year_of_study,
         phone, address, guardian_name, guardian_contact
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [userId, firstName, lastName, gender, dob, rollNumber, stream, honors || null, department, yearOfStudy, phone, address, guardianName, guardianContact]
    );

    await client.end();
    return { statusCode: 200, body: JSON.stringify({ message: "Student added successfully!" }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to add student", error: err.message }) };
  }
};
