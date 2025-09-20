async function deleteTeacher(teacherId) {
  if (!confirm("Are you sure you want to delete this teacher?")) return;

  if (!teacherId) {
    alert("Teacher ID is missing");
    return;
  }

  try {
    const res = await fetch("/.netlify/functions/deleteTeacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_id: teacherId }), // ✅ key matches backend
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
