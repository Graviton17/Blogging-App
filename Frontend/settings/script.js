// API Configuration
const API_BASE_URL = "http://localhost/blogging-app/Backend/api";

// DOM Elements
const loadingContainer = document.getElementById("loadingContainer");
const notLoggedIn = document.getElementById("notLoggedIn");
const mainContent = document.getElementById("mainContent");
const navUser = document.getElementById("navUser");
const userName = document.getElementById("userName");
const userBtn = document.getElementById("userBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const logoutBtn = document.getElementById("logoutBtn");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

// Account Form Elements
const accountForm = document.getElementById("accountForm");
const accountAlertContainer = document.getElementById("accountAlertContainer");
const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const username = document.getElementById("username");
const email = document.getElementById("email");
const bio = document.getElementById("bio");
const bioCharCount = document.getElementById("bioCharCount");

// Password Form Elements
const passwordForm = document.getElementById("passwordForm");
const passwordAlertContainer = document.getElementById("passwordAlertContainer");
const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

// Notification Form Elements
const notificationForm = document.getElementById("notificationForm");
const notificationAlertContainer = document.getElementById("notificationAlertContainer");
const emailNotifications = document.getElementById("emailNotifications");
const commentNotifications = document.getElementById("commentNotifications");
const likeNotifications = document.getElementById("likeNotifications");
const marketingEmails = document.getElementById("marketingEmails");

// Privacy Form Elements
const privacyForm = document.getElementById("privacyForm");
const privacyAlertContainer = document.getElementById("privacyAlertContainer");
const profileVisibility = document.getElementById("profileVisibility");
const showEmail = document.getElementById("showEmail");
const allowComments = document.getElementById("allowComments");

// Delete Account Elements
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const deleteModal = document.getElementById("deleteModal");
const deleteModalOverlay = document.getElementById("deleteModalOverlay");
const closeDeleteModal = document.getElementById("closeDeleteModal");
const cancelDelete = document.getElementById("cancelDelete");
const deleteAccountForm = document.getElementById("deleteAccountForm");
const deletePassword = document.getElementById("deletePassword");
const confirmDelete = document.getElementById("confirmDelete");

// Global State
let currentUser = null;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  setupEventListeners();
});

// Check Authentication Status
async function checkAuthStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/status.php`, {
      credentials: "include",
    });

    const data = await response.json();

    if (data.authenticated && data.user) {
      currentUser = data.user;
      showUserNav();
      loadSettings();
    } else {
      showNotLoggedIn();
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    showNotLoggedIn();
  }
}

// Show User Navigation
function showUserNav() {
  navUser.classList.remove("hidden");
  userName.textContent = currentUser.username;
}

// Show Not Logged In State
function showNotLoggedIn() {
  loadingContainer.classList.add("hidden");
  notLoggedIn.classList.remove("hidden");
  mainContent.classList.add("hidden");
}

// Load Settings
function loadSettings() {
  // Load account settings
  firstName.value = currentUser.first_name || "";
  lastName.value = currentUser.last_name || "";
  username.value = currentUser.username || "";
  email.value = currentUser.email || "";
  bio.value = currentUser.bio || "";
  bioCharCount.textContent = (currentUser.bio || "").length;

  // Load notification preferences (from localStorage for demo)
  const notificationPrefs = JSON.parse(
    localStorage.getItem("notificationPrefs") || "{}"
  );
  emailNotifications.checked = notificationPrefs.email !== false;
  commentNotifications.checked = notificationPrefs.comments !== false;
  likeNotifications.checked = notificationPrefs.likes !== false;
  marketingEmails.checked = notificationPrefs.marketing === true;

  // Load privacy settings (from localStorage for demo)
  const privacySettings = JSON.parse(
    localStorage.getItem("privacySettings") || "{}"
  );
  profileVisibility.checked = privacySettings.profileVisible !== false;
  showEmail.checked = privacySettings.showEmail === true;
  allowComments.checked = privacySettings.allowComments !== false;

  // Show main content
  loadingContainer.classList.add("hidden");
  mainContent.classList.remove("hidden");
}

// Setup Event Listeners
function setupEventListeners() {
  // User dropdown
  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userBtn.parentElement.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!userBtn.parentElement.contains(e.target)) {
      userBtn.parentElement.classList.remove("active");
    }
  });

  // Logout
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await logout();
  });

  // Mobile nav toggle
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  // Bio character counter
  bio.addEventListener("input", () => {
    bioCharCount.textContent = bio.value.length;
  });

  // Form submissions
  accountForm.addEventListener("submit", handleAccountUpdate);
  passwordForm.addEventListener("submit", handlePasswordUpdate);
  notificationForm.addEventListener("submit", handleNotificationUpdate);
  privacyForm.addEventListener("submit", handlePrivacyUpdate);

  // Delete account modal
  deleteAccountBtn.addEventListener("click", openDeleteModal);
  closeDeleteModal.addEventListener("click", closeDeleteModalFn);
  deleteModalOverlay.addEventListener("click", closeDeleteModalFn);
  cancelDelete.addEventListener("click", closeDeleteModalFn);
  deleteAccountForm.addEventListener("submit", handleAccountDelete);
}

// Handle Account Update
async function handleAccountUpdate(e) {
  e.preventDefault();

  // Clear previous alerts
  accountAlertContainer.innerHTML = "";

  // Get form values
  const formData = {
    first_name: firstName.value.trim(),
    last_name: lastName.value.trim(),
    email: email.value.trim(),
    bio: bio.value.trim(),
  };

  // Validate email
  if (formData.email && !isValidEmail(formData.email)) {
    showAlert(accountAlertContainer, "Please enter a valid email address", "error");
    return;
  }

  // Show loading state
  const submitBtn = accountForm.querySelector('button[type="submit"]');
  toggleButtonLoading(submitBtn, true);

  try {
    // Simulate API call - replace with actual backend call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update current user data
    currentUser.first_name = formData.first_name;
    currentUser.last_name = formData.last_name;
    currentUser.email = formData.email;
    currentUser.bio = formData.bio;

    showAlert(accountAlertContainer, "Account settings updated successfully!", "success");
  } catch (error) {
    console.error("Error updating account:", error);
    showAlert(accountAlertContainer, "Failed to update account settings. Please try again.", "error");
  } finally {
    toggleButtonLoading(submitBtn, false);
  }
}

// Handle Password Update
async function handlePasswordUpdate(e) {
  e.preventDefault();

  // Clear previous alerts
  passwordAlertContainer.innerHTML = "";

  const current = currentPassword.value;
  const newPass = newPassword.value;
  const confirm = confirmPassword.value;

  // Validation
  if (!current || !newPass || !confirm) {
    showAlert(passwordAlertContainer, "Please fill in all password fields", "error");
    return;
  }

  if (newPass.length < 8) {
    showAlert(passwordAlertContainer, "New password must be at least 8 characters long", "error");
    return;
  }

  if (newPass !== confirm) {
    showAlert(passwordAlertContainer, "New passwords do not match", "error");
    return;
  }

  // Show loading state
  const submitBtn = passwordForm.querySelector('button[type="submit"]');
  toggleButtonLoading(submitBtn, true);

  try {
    // Simulate API call - replace with actual backend call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showAlert(passwordAlertContainer, "Password updated successfully!", "success");

    // Clear form
    passwordForm.reset();
  } catch (error) {
    console.error("Error updating password:", error);
    showAlert(passwordAlertContainer, "Failed to update password. Please try again.", "error");
  } finally {
    toggleButtonLoading(submitBtn, false);
  }
}

// Handle Notification Update
async function handleNotificationUpdate(e) {
  e.preventDefault();

  // Clear previous alerts
  notificationAlertContainer.innerHTML = "";

  const notificationPrefs = {
    email: emailNotifications.checked,
    comments: commentNotifications.checked,
    likes: likeNotifications.checked,
    marketing: marketingEmails.checked,
  };

  // Show loading state
  const submitBtn = notificationForm.querySelector('button[type="submit"]');
  toggleButtonLoading(submitBtn, true);

  try {
    // Save to localStorage (replace with actual backend call)
    localStorage.setItem("notificationPrefs", JSON.stringify(notificationPrefs));
    await new Promise((resolve) => setTimeout(resolve, 500));

    showAlert(notificationAlertContainer, "Notification preferences saved successfully!", "success");
  } catch (error) {
    console.error("Error updating notifications:", error);
    showAlert(notificationAlertContainer, "Failed to save preferences. Please try again.", "error");
  } finally {
    toggleButtonLoading(submitBtn, false);
  }
}

// Handle Privacy Update
async function handlePrivacyUpdate(e) {
  e.preventDefault();

  // Clear previous alerts
  privacyAlertContainer.innerHTML = "";

  const privacySettings = {
    profileVisible: profileVisibility.checked,
    showEmail: showEmail.checked,
    allowComments: allowComments.checked,
  };

  // Show loading state
  const submitBtn = privacyForm.querySelector('button[type="submit"]');
  toggleButtonLoading(submitBtn, true);

  try {
    // Save to localStorage (replace with actual backend call)
    localStorage.setItem("privacySettings", JSON.stringify(privacySettings));
    await new Promise((resolve) => setTimeout(resolve, 500));

    showAlert(privacyAlertContainer, "Privacy settings saved successfully!", "success");
  } catch (error) {
    console.error("Error updating privacy:", error);
    showAlert(privacyAlertContainer, "Failed to save privacy settings. Please try again.", "error");
  } finally {
    toggleButtonLoading(submitBtn, false);
  }
}

// Delete Account Modal Functions
function openDeleteModal() {
  deleteModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeDeleteModalFn() {
  deleteModal.classList.add("hidden");
  document.body.style.overflow = "";
  deleteAccountForm.reset();
}

// Handle Account Delete
async function handleAccountDelete(e) {
  e.preventDefault();

  const password = deletePassword.value;
  const confirmed = confirmDelete.checked;

  if (!password) {
    alert("Please enter your password");
    return;
  }

  if (!confirmed) {
    alert("Please confirm that you understand this action is permanent");
    return;
  }

  // Show loading state
  const submitBtn = deleteAccountForm.querySelector('button[type="submit"]');
  toggleButtonLoading(submitBtn, true);

  try {
    // Simulate API call - replace with actual backend call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    alert("Account deleted successfully. You will be redirected to the home page.");
    window.location.href = "../home/home.html";
  } catch (error) {
    console.error("Error deleting account:", error);
    alert("Failed to delete account. Please try again.");
    toggleButtonLoading(submitBtn, false);
  }
}

// Toggle Password Visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.nextElementSibling;
  const icon = button.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Show Alert
function showAlert(container, message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;

  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

  alertDiv.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(alertDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);

  // Scroll to alert
  container.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Toggle Button Loading State
function toggleButtonLoading(button, isLoading) {
  const btnText = button.querySelector(".btn-text");
  const btnLoading = button.querySelector(".btn-loading");

  if (isLoading) {
    btnText.classList.add("hidden");
    btnLoading.classList.remove("hidden");
    button.disabled = true;
  } else {
    btnText.classList.remove("hidden");
    btnLoading.classList.add("hidden");
    button.disabled = false;
  }
}

// Logout
async function logout() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout.php`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = "../login/login.html";
    } else {
      alert("Logout failed");
    }
  } catch (error) {
    console.error("Error logging out:", error);
    alert("An error occurred during logout");
  }
}

// Utility Functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
