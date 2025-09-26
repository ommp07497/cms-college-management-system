const noticeForm = document.getElementById("noticeForm");
const noticeTableBody = document.getElementById("noticeTableBody");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEdit");
const submitBtn = document.getElementById("submitBtn");

// -------------------------
// MODE FUNCTIONS
// -------------------------
function setAddMode() {
  noticeForm.reset();
  document.getElementById("noticeId").value = "";
  formTitle.textContent = "Add New Notice";
  submitBtn.textContent = "Add Notice";
  cancelEditBtn.classList.add("hidden");
}

function setEditMode(notice) {
  formTitle.textContent = "Edit Notice";
  submitBtn.textContent = "Update Notice";
  cancelEditBtn.classList.remove("hidden");

  document.getElementById("noticeId").value = notice.id;
  noticeForm.title.value = notice.title;
  noticeForm.description.value = notice.description;
  noticeForm.targetRole.value = notice.target_role;
}

// -------------------------
// FETCH NOTICES
// -------------------------
async function fetchNotices() {
  try {
    const res = await fetch("/.netlify/functions/getNotices");
    if (!res.ok) throw new Error("Failed to fetch notices");

    const notices = await res.json();
    noticeTableBody.innerHTML = "";

    notices.forEach(notice => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${notice.id}</td>
        <td class="border p-2">${notice.title}</td>
        <td class="border p-2">${notice.description}</td>
        <td class="border p-2">${notice.target_role}</td>
        <td class="border p-2">${new Date(notice.created_at).toLocaleString()}</td>
        <td class="border p-2 flex gap-2">
          <button class="bg-yellow-400 px-2 py-1 rounded editBtn">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded deleteBtn">Delete</button>
        </td>
      `;
      noticeTableBody.appendChild(tr);

      tr.querySelector(".editBtn").addEventListener("click", () => setEditMode(notice));
      tr.querySelector(".deleteBtn").addEventListener("click", () => deleteNotice(notice.id));
    });

  } catch (err) {
    console.error("fetchNotices error:", err);
    alert("Failed to fetch notices.");
  }
}

// -------------------------
// FORM SUBMIT (ADD/UPDATE)
// -------------------------
noticeForm.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = new FormData(noticeForm);
  const data = {
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    target_role: formData.get("targetRole")
  };

  const url = data.id ? "/.netlify/functions/updateNotice" : "/.netlify/functions/addNotice";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message || "Success!");
      setAddMode();
      fetchNotices();
    } else {
      alert(result.message || "Failed!");
    }
  } catch (err) {
    console.error("submit error:", err);
    alert("Failed to save notice.");
  }
});

// -------------------------
// DELETE NOTICE
// -------------------------
async function deleteNotice(id) {
  if (!confirm("Are you sure you want to delete this notice?")) return;

  try {
    const res = await fetch("/.netlify/functions/deleteNotice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Deleted successfully!");
      fetchNotices();
    } else {
      alert(result.message || "Failed to delete.");
    }
  } catch (err) {
    console.error("delete error:", err);
    alert("Failed to delete notice.");
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
  fetchNotices();
});
