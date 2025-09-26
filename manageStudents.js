const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEdit");
const passwordField = document.getElementById("passwordField");
const submitBtn = document.getElementById("submitBtn");

const yearInput = studentForm.yearOfStudy;

yearInput.addEventListener("input", () => {
  // Remove non-digit characters
  yearInput.value = yearInput.value.replace(/\D/g, "");

  // Limit to a single digit
  if (yearInput.value.length > 1) {
    yearInput.value = yearInput.value.slice(0, 1);
  }

  // Only allow 1-3
  if (yearInput.value < 1) yearInput.value = "";
  if (yearInput.value > 3) yearInput.value = "3";
});
// -------------------------
// Populate DOB Day & Year
// -------------------------
const dobDay = studentForm.dobDay;
const dobYear = studentForm.dobYear;

for (let i = 1; i <= 31; i++) {
  const option = document.createElement("option");
  option.value = i.toString().padStart(2, "0");
  option.textContent = i;
  dobDay.appendChild(option);
}

const currentYear = new Date().getFullYear();
for (let y = currentYear; y >= currentYear - 50; y--) {
  const option = document.createElement("option");
  option.value = y;
  option.textContent = y;
  dobYear.appendChild(option);
}

// -------------------------
// MODE FUNCTIONS
// -------------------------
function setAddMode() {
  passwordField.required = true;
  studentForm.reset();
  document.getElementById("studentId").value = "";
  formTitle.textContent = "Add New Student";
  submitBtn.textContent = "Add Student";
  cancelEditBtn.classList.add("hidden");
}

function setEditMode(student) {
  passwordField.required = false;
  formTitle.textContent = "Edit Student";
  submitBtn.textContent = "Update";
  cancelEditBtn.classList.remove("hidden");

  document.getElementById("studentId").value = student.student_id;
  studentForm.firstName.value = student.first_name;
  studentForm.lastName.value = student.last_name;
  studentForm.gender.value = student.gender || "";
  
  if (student.date_of_birth) {
    const dob = new Date(student.date_of_birth);
    studentForm.dobDay.value = dob.getDate().toString().padStart(2,"0");
    studentForm.dobMonth.value = (dob.getMonth()+1).toString().padStart(2,"0");
    studentForm.dobYear.value = dob.getFullYear();
  }

  studentForm.rollNumber.value = student.roll_number;
  studentForm.stream.value = student.stream || "";
  studentForm.honors.value = student.honors || "";
  studentForm.department.value = student.department || "";
  studentForm.yearOfStudy.value = student.year_of_study || "";
  studentForm.email.value = student.email || "";
  studentForm.phone.value = student.phone || "";
  studentForm.address.value = student.address || "";
  studentForm.guardianName.value = student.guardian_name || "";
  studentForm.guardianContact.value = student.guardian_contact || "";
  passwordField.value = "";
}

// -------------------------
// FETCH STUDENTS
// -------------------------
async function fetchStudents() {
  try {
    const res = await fetch("/.netlify/functions/getStudents");
    if (!res.ok) throw new Error("Failed to fetch students");
    const students = await res.json();

    studentTableBody.innerHTML = "";
    students.forEach(student => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${student.student_id}</td>
        <td class="border p-2">${student.first_name} ${student.last_name}</td>
        <td class="border p-2">${student.email || ''}</td>
        <td class="border p-2">${student.roll_number}</td>
        <td class="border p-2">${student.department || ''}</td>
        <td class="border p-2">${student.year_of_study || ''}</td>
        <td class="border p-2 flex gap-2">
          <button class="bg-yellow-400 px-2 py-1 rounded editBtn">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded deleteBtn">Delete</button>
        </td>
      `;
      studentTableBody.appendChild(tr);

      tr.querySelector(".editBtn").addEventListener("click", () => setEditMode(student));
      tr.querySelector(".deleteBtn").addEventListener("click", () => deleteStudent(student.student_id));
    });
  } catch (err) {
    console.error("fetchStudents error:", err);
    alert("Failed to fetch students. See console for details.");
  }
}

// -------------------------
// FORM SUBMIT (ADD/UPDATE)
// -------------------------
studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(studentForm);
  
  // Combine DOB
  const dob = `${formData.get("dobYear")}-${formData.get("dobMonth")}-${formData.get("dobDay")}`;

  const data = {
    id: formData.get("id"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    gender: formData.get("gender"),
    dateOfBirth: dob,
    rollNumber: formData.get("rollNumber"),
    stream: formData.get("stream"),
    honors: formData.get("honors"),
    department: formData.get("department"),
   yearOfStudy: parseInt(formData.get("yearOfStudy")), 
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    guardianName: formData.get("guardianName"),
    guardianContact: formData.get("guardianContact"),
    password: formData.get("password")
  };

  if (!data.password) delete data.password;

  const url = data.id
    ? "/.netlify/functions/updateStudent"
    : "/.netlify/functions/addStudent";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Success!");
      setAddMode();
      fetchStudents();
    } else {
      alert(result.message || "Failed!");
    }
  } catch (err) {
    console.error("submit error:", err);
    alert("Failed to save student. See console for details.");
  }
});

// -------------------------
// DELETE STUDENT
// -------------------------
async function deleteStudent(studentId) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    const res = await fetch("/.netlify/functions/deleteStudent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: studentId }),
    });

    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Deleted successfully!");
      fetchStudents();
    } else {
      alert(result.message || "Failed to delete.");
    }
  } catch (err) {
    console.error("delete error:", err);
    alert("Failed to delete student. See console for details.");
  }
}

// -------------------------
// CANCEL BUTTON
// -------------------------
cancelEditBtn.addEventListener("click", setAddMode);

// -------------------------
// INITIAL LOAD
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  setAddMode();
  fetchStudents();
});
