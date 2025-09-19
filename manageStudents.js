const studentForm = document.getElementById("studentForm");
const studentTableBody = document.getElementById("studentTableBody");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEdit");

// Fetch all students
async function fetchStudents() {
  try {
    const res = await fetch("/.netlify/functions/getStudents"); // backend API
    const students = await res.json();

    studentTableBody.innerHTML = "";
    students.forEach(student => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${student.id}</td>
        <td class="border p-2">${student.full_name}</td>
        <td class="border p-2">${student.email}</td>
        <td class="border p-2">${student.roll_number}</td>
        <td class="border p-2">${student.department}</td>
        <td class="border p-2">${student.year_of_study}</td>
        <td class="border p-2 flex gap-2">
          <button class="bg-yellow-400 px-2 py-1 rounded editBtn">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded deleteBtn">Delete</button>
        </td>
      `;
      studentTableBody.appendChild(tr);

      // Edit button
      tr.querySelector(".editBtn").addEventListener("click", () => populateForm(student));

      // Delete button
      tr.querySelector(".deleteBtn").addEventListener("click", () => deleteStudent(student.id));
    });
  } catch (err) {
    console.error(err);
    alert("Failed to fetch students.");
  }
}

// Populate form for editing
function populateForm(student) {
  document.getElementById("studentId").value = student.id;
  studentForm.fullName.value = student.full_name;
  studentForm.email.value = student.email;
  studentForm.rollNumber.value = student.roll_number;
  studentForm.department.value = student.department;
  studentForm.yearOfStudy.value = student.year_of_study;
  studentForm.password.value = student.password || "";

  formTitle.textContent = "Edit Student";
  cancelEditBtn.classList.remove("hidden");
}

// Cancel edit
cancelEditBtn.addEventListener("click", () => {
  studentForm.reset();
  document.getElementById("studentId").value = "";
  formTitle.textContent = "Add New Student";
  cancelEditBtn.classList.add("hidden");
});

// Add or update student
studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(studentForm);
  const data = {
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    rollNumber: formData.get("rollNumber"),
    department: formData.get("department"),
    yearOfStudy: formData.get("yearOfStudy"),
    password: formData.get("password"),
  };

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
      studentForm.reset();
      document.getElementById("studentId").value = "";
      formTitle.textContent = "Add New Student";
      cancelEditBtn.classList.add("hidden");
      fetchStudents();
    } else {
      alert(result.message || "Failed!");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to save student.");
  }
});

// Delete student
async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    const res = await fetch("/.netlify/functions/deleteStudent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Deleted successfully!");
      fetchStudents();
    } else {
      alert(result.message || "Failed to delete.");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to delete student.");
  }
}

// Initial fetch
fetchStudents();
