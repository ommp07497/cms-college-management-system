const courseTableBody = document.getElementById("courseTableBody");

// Fetch courses from Netlify function
async function fetchCourses() {
  try {
    const res = await fetch("/.netlify/functions/getCourses");
    if (!res.ok) throw new Error("Failed to fetch courses");

    const courses = await res.json();
    courseTableBody.innerHTML = "";

    courses.forEach(course => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${course.id}</td>
        <td class="border p-2">${course.stream}</td>
        <td class="border p-2">${course.honors || '-'}</td>
      `;
      courseTableBody.appendChild(tr);
    });

  } catch (err) {
    console.error("fetchCourses error:", err);
    alert("Failed to fetch courses. See console for details.");
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", fetchCourses);
