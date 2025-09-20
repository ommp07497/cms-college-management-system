// ---------- DOM ELEMENTS ----------
const loginBtn = document.getElementById("loginBtn");
const loginMenu = document.getElementById("loginMenu");

const loginModal = document.getElementById("loginModal");
const closeLoginModal = document.getElementById("closeLoginModal");
const loginLinks = document.querySelectorAll("#loginMenu .roleBtn");
const loginTitle = document.getElementById("loginTitle");
const loginForm = document.getElementById("loginForm");

// ---------- LOGIN DROPDOWN ----------
loginBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  loginMenu.classList.toggle("hidden");
});

// ---------- OPEN LOGIN MODAL BASED ON ROLE ----------
loginLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const role = link.dataset.role.toLowerCase();
    loginTitle.textContent = `${link.dataset.role} Login`;
    loginModal.classList.remove("hidden");
    loginMenu.classList.add("hidden");
    loginForm.reset();

    // store role in hidden input
    let roleInput = loginForm.querySelector('input[name="role"]');
    if (!roleInput) {
      roleInput = document.createElement("input");
      roleInput.type = "hidden";
      roleInput.name = "role";
      loginForm.appendChild(roleInput);
    }
    roleInput.value = role;
  });
});

// ---------- CLOSE LOGIN MODAL ----------
closeLoginModal.addEventListener("click", () => {
  loginModal.classList.add("hidden");
});

// Close dropdown & modal when clicking outside
window.addEventListener("click", (e) => {
  if (!loginBtn.contains(e.target) && !loginMenu.contains(e.target)) {
    loginMenu.classList.add("hidden");
  }
  if (e.target === loginModal) {
    loginModal.classList.add("hidden");
  }
});

// ---------- LOGIN SUBMIT ----------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(loginForm);
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  try {
    const res = await fetch("/.netlify/functions/loginUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      alert(`✅ Welcome, ${result.fullName || "User"}!`);

      loginForm.reset();
      loginModal.classList.add("hidden");

      // Redirect based on role
      if (result.role === "student") {
        window.location.href = "/studentDashboard.html";
      } else if (result.role === "teacher") {
        window.location.href = "/teacherDashboard.html";
      } else if (result.role === "admin") {
        window.location.href = "/adminDashboard.html";
      }
    } else {
      alert(`❌ ${result.message}`);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to login.");
  }
});
