// manageTeachers.js
const teacherForm = document.getElementById("teacherForm");
const teacherTableBody = document.getElementById("teacherTableBody");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEdit");
const passwordField = document.getElementById("passwordField");
const submitBtn = document.getElementById("submitBtn");

// -------------------------
// MODE FUNCTIONS
// -------------------------
function setAddMode() {
  passwordField.required = true;
  teacherForm.reset();
  document.getElementById("teacherId").value = "";
  formTitle.textContent = "Add New Teacher";
  submitBtn.textContent = "Add Teacher";
  cancelEditBtn.classList.add("hidden");
}

function setEditMode(teacher) {
  passwordField.required = false;
  formTitle.textContent = "Edit Teacher";
  submitBtn.textContent = "Update Teacher";
  cancelEditBtn.classList.remove("hidden");

  document.getElementById("teacherId").value = teacher.teacher_id || "";
  teacherForm.fullName.value = teacher.full_name || "";
  teacherForm.email.value = teacher.email || "";
  teacherForm.employeeId.value = teacher.employee_id || "";
  teacherForm.department.value = teacher.department || "";
  teacherForm.designation.value = teacher.designation || "";
  teacherForm.qualification.value = teacher.qualification || "";
  teacherForm.joiningDate.value = teacher.joining_date || "";
  teacherForm.phone.value = teacher.phone || "";
  teacherForm.address.value = teacher.address || "";
  passwordField.value = "";
}

// -------------------------
// FETCH TEACHERS
// -------------------------
async function fetchTeachers() {
  try {
    const res = await fetch("/.netlify/functions/getTeachers");
    if (!res.ok) throw new Error("Failed to fetch teachers");
    const teachers = await res.json();

    teacherTableBody.innerHTML = "";
    teachers.forEach(teacher => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${teacher.teacher_id}</td>
        <td class="border p-2">${teacher.full_name}</td>
        <td class="border p-2">${teacher.email}</td>
        <td class="border p-2">${teacher.employee_id}</td>
        <td class="border p-2">${teacher.department}</td>
        <td class="border p-2">${teacher.designation || ""}</td>
        <td class="border p-2">${teacher.phone || ""}</td>
        <td class="border p-2 flex gap-2">
          <button class="bg-yellow-400 px-2 py-1 rounded editBtn">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded deleteBtn">Delete</button>
        </td>
      `;
      teacherTableBody.appendChild(tr);

      tr.querySelector(".editBtn").addEventListener("click", () => setEditMode(teacher));
      tr.querySelector(".deleteBtn").addEventListener("click", () => deleteTeacher(teacher.teacher_id));
    });
  } catch (err) {
    console.error("fetchTeachers error:", err);
    alert("Failed to fetch teachers. See console for details.");
  }
}

// -------------------------
// ADD / UPDATE TEACHER
// -------------------------
teacherForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(teacherForm);
  const data = {
    id: formData.get("teacher_id"), // used in update
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    employeeId: formData.get("employeeId"),
    department: formData.get("department"),
    designation: formData.get("designation"),
    qualification: formData.get("qualification"),
    joiningDate: formData.get("joiningDate"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    password: formData.get("password")
  };

  // If password is empty, remove it (optional for update)
  if (!data.password) delete data.password;

  // Determine whether to add or update
  const url = data.id
    ? "/.netlify/functions/updateTeacher"
    : "/.netlify/functions/addTeacher";

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
      fetchTeachers();
    } else {
      alert(result.message || "Failed!");
    }
  } catch (err) {
    console.error("submit error:", err);
    alert("Failed to save teacher. See console for details.");
  }
});

// -------------------------
// DELETE TEACHER
// -------------------------
async function deleteTeacher(teacherId) {
  if (!confirm("Are you sure you want to delete this teacher?")) return;

  try {
    const res = await fetch("/.netlify/functions/deleteTeacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_id: teacherId }),
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message || "Deleted successfully!");
      fetchTeachers();
    } else {
      alert(result.message || "Failed to delete.");
    }
  } catch (err) {
    console.error("delete error:", err);
    alert("Failed to delete teacher. See console for details.");
  }
}

cancelEditBtn.addEventListener("click", setAddMode);

// -------------------------
// INIT
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  setAddMode();
  fetchTeachers();
});
