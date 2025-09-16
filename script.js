

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
