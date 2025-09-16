

const loginBtn = document.getElementById('loginBtn');
const loginMenu = document.getElementById('loginMenu');

const registerBtn = document.getElementById('registerBtn');
const registerModal = document.getElementById('registerModal');
const closeModal = document.getElementById('closeModal');

const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const loginLinks = document.querySelectorAll('#loginMenu a');
const loginTitle = document.getElementById('loginTitle');
const loginForm = document.getElementById('loginForm');

// 🔹 Toggle login dropdown
loginBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  loginMenu.classList.toggle('hidden');
  registerModal.classList.add('hidden'); // ✅ close register if open
});

// 🔹 Open register modal
registerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  registerModal.classList.remove('hidden');
  loginMenu.classList.add('hidden'); // ✅ close login if open
});

// 🔹 Close register modal
closeModal.addEventListener('click', () => {
  registerModal.classList.add('hidden');
});

// 🔹 Open login modal from dropdown links
loginLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const role = link.textContent.replace(/^[^\w]+/, '').split(' ')[0];
    loginTitle.textContent = `${role} Login`;
    loginModal.classList.remove('hidden');
    loginMenu.classList.add('hidden'); // ✅ hide dropdown
    loginForm.reset();
  });
});

// 🔹 Close login modal
closeLoginModal.addEventListener('click', () => {
  loginModal.classList.add('hidden');
});

// 🔹 Close when clicking outside
window.addEventListener('click', (e) => {
  if (!loginBtn.contains(e.target) && !loginMenu.contains(e.target)) {
    loginMenu.classList.add('hidden');
  }
  if (e.target === registerModal) {
    registerModal.classList.add('hidden');
  }
  if (e.target === loginModal) {
    loginModal.classList.add('hidden');
  }
});
loginLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const role = link.textContent.replace(/^[^\w]+/, '').split(' ')[0]; 
    loginTitle.textContent = `${role} Login`;
    loginModal.classList.remove('hidden');
    loginMenu.classList.add('hidden'); 
    loginForm.reset();

    // store role in a hidden input
    let roleInput = loginForm.querySelector('input[name="role"]');
    if (!roleInput) {
      roleInput = document.createElement('input');
      roleInput.type = 'hidden';
      roleInput.name = 'role';
      loginForm.appendChild(roleInput);
    }
    roleInput.value = role;
  });
});
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
      alert(`✅ Welcome, ${result.fullName}!`);

      loginForm.reset();
      loginModal.classList.add("hidden");

      // Redirect based on role
      if (result.role === "Student") window.location.href = "/Student_dashboard.html";
      else if (result.role === "Teacher") window.location.href = "/teacherDashboard.html";
      else if (result.role === "Admin") window.location.href = "/adminDashboard.html";
    } else {
      alert(`❌ ${result.message}`);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to login");
  }
});

const studentRegisterForm = document.getElementById('studentRegisterForm');

studentRegisterForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(studentRegisterForm);
  const data = {
    fullName: formData.get('fullName'),
    rollNumber: formData.get('rollNumber'),
    email: formData.get('email'),
    password: formData.get('password')
  };

  try {
    const res = await fetch('/.netlify/functions/registerUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
      alert("✅ Registered successfully! User ID: " + result.userId);
      studentRegisterForm.reset();
      registerModal.classList.add('hidden');
    } else {
      alert("❌ Failed to register: " + result.error);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to register.');
  }
});
