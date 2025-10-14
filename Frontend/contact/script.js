// Contact Page JavaScript

// DOM Elements
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navAuth = document.getElementById('navAuth');
const navUser = document.getElementById('navUser');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const contactForm = document.getElementById('contactForm');
const messageInput = document.getElementById('message');
const messageCount = document.getElementById('messageCount');
const alertContainer = document.getElementById('alertContainer');

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  initializeNavigation();
  initializeForm();
});

// Check if user is authenticated
async function checkAuthStatus() {
  try {
    const response = await fetch('http://localhost/blogging-app/Backend/api/auth/status.php', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (data.authenticated) {
      showUserNav(data.user);
      // Pre-fill email if user is logged in
      const emailInput = document.getElementById('email');
      if (emailInput && data.user.email) {
        emailInput.value = data.user.email;
      }
      // Pre-fill name if available
      const firstNameInput = document.getElementById('firstName');
      const lastNameInput = document.getElementById('lastName');
      if (firstNameInput && data.user.first_name) {
        firstNameInput.value = data.user.first_name;
      }
      if (lastNameInput && data.user.last_name) {
        lastNameInput.value = data.user.last_name;
      }
    } else {
      showAuthNav();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    showAuthNav();
  }
}

// Show navigation for authenticated users
function showUserNav(user) {
  if (navAuth) navAuth.style.display = 'none';
  if (navUser) {
    navUser.classList.remove('hidden');
    if (userName) {
      userName.textContent = user.username || user.first_name || 'User';
    }
  }
}

// Show navigation for non-authenticated users
function showAuthNav() {
  if (navAuth) navAuth.style.display = 'flex';
  if (navUser) navUser.classList.add('hidden');
}

// Logout handler
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost/blogging-app/Backend/api/auth/logout.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = '../home/home.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '../home/home.html';
    }
  });
}

// Initialize navigation toggle for mobile
function initializeNavigation() {
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('show');
      }
    });
  }
}

// Initialize form
function initializeForm() {
  // Character counter for message
  if (messageInput && messageCount) {
    messageInput.addEventListener('input', () => {
      const length = messageInput.value.length;
      messageCount.textContent = length;

      if (length > 1000) {
        messageInput.value = messageInput.value.substring(0, 1000);
        messageCount.textContent = '1000';
      }
    });
  }

  // Form submission
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  // Clear previous errors
  clearErrors();
  clearAlerts();

  // Get form data
  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value.trim()
  };

  // Validate form
  if (!validateForm(formData)) {
    return;
  }

  // Show loading state
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.classList.remove('hidden');
  btnLoading.style.display = 'flex';

  // Simulate form submission (replace with actual API call)
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Show success message
    showAlert('success', 'Message sent successfully! We\'ll get back to you soon.');

    // Reset form
    contactForm.reset();
    messageCount.textContent = '0';

    // Scroll to top to show alert
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Form submission error:', error);
    showAlert('error', 'Failed to send message. Please try again later.');
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    btnText.style.display = 'flex';
    btnLoading.style.display = 'none';
    btnLoading.classList.add('hidden');
  }
}

// Validate form
function validateForm(data) {
  let isValid = true;

  // Validate first name
  if (!data.firstName) {
    showError('firstName', 'First name is required');
    isValid = false;
  }

  // Validate last name
  if (!data.lastName) {
    showError('lastName', 'Last name is required');
    isValid = false;
  }

  // Validate email
  if (!data.email) {
    showError('email', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(data.email)) {
    showError('email', 'Please enter a valid email address');
    isValid = false;
  }

  // Validate subject
  if (!data.subject) {
    showError('subject', 'Please select a subject');
    isValid = false;
  }

  // Validate message
  if (!data.message) {
    showError('message', 'Message is required');
    isValid = false;
  } else if (data.message.length < 10) {
    showError('message', 'Message must be at least 10 characters');
    isValid = false;
  }

  return isValid;
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Show error message
function showError(fieldName, message) {
  const errorElement = document.getElementById(`${fieldName}Error`);
  const inputElement = document.getElementById(fieldName);

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  if (inputElement) {
    inputElement.style.borderColor = 'var(--danger)';
  }
}

// Clear all errors
function clearErrors() {
  const errorElements = document.querySelectorAll('.form-error');
  errorElements.forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });

  const inputElements = document.querySelectorAll('.form-input, .form-select, .form-textarea');
  inputElements.forEach(el => {
    el.style.borderColor = '';
  });
}

// Show alert message
function showAlert(type, message) {
  if (!alertContainer) return;

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;

  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => {
      alert.remove();
    }, 300);
  }, 5000);
}

// Clear alerts
function clearAlerts() {
  if (alertContainer) {
    alertContainer.innerHTML = '';
  }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
