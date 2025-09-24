// Sign-up functionality and UI interactions
class SignupManager {
  constructor() {
    this.form = document.getElementById('signupForm');
    this.inputs = {
      firstName: document.getElementById('firstName'),
      lastName: document.getElementById('lastName'),
      username: document.getElementById('username'),
      email: document.getElementById('email'),
      password: document.getElementById('password'),
      confirmPassword: document.getElementById('confirmPassword'),
      bio: document.getElementById('bio'),
      agreeTerms: document.getElementById('agreeTerms'),
      newsletter: document.getElementById('newsletter')
    };

    this.submitButton = document.getElementById('submitBtn');
    this.alertContainer = document.getElementById('alertContainer');
    this.termsModal = document.getElementById('termsModal');

    this.apiBaseUrl = '/Blogging-App/Backend/api';
    this.csrfToken = '';

    this.init();
  }

  async init() {
    await this.fetchCSRFToken();
    this.setupEventListeners();
    this.setupFormValidation();
    this.checkExistingLogin();
  }

  async fetchCSRFToken() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/csrf-token.php`);
      const data = await response.json();

      if (data.success && data.token) {
        this.csrfToken = data.token;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }

  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Password visibility toggles
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');

    if (passwordToggle) {
      passwordToggle.addEventListener('click', () => this.togglePasswordVisibility('password'));
    }
    if (confirmPasswordToggle) {
      confirmPasswordToggle.addEventListener('click', () => this.togglePasswordVisibility('confirmPassword'));
    }

    // Password strength checking
    this.inputs.password.addEventListener('input', () => this.checkPasswordStrength());

    // Real-time validation
    Object.keys(this.inputs).forEach(key => {
      if (this.inputs[key]) {
        this.inputs[key].addEventListener('blur', () => this.validateField(key));
        this.inputs[key].addEventListener('input', () => this.clearFieldError(key));
      }
    });

    // Username availability checking
    let usernameTimeout;
    this.inputs.username.addEventListener('input', () => {
      clearTimeout(usernameTimeout);
      usernameTimeout = setTimeout(() => this.checkUsernameAvailability(), 500);
    });

    // Bio character count
    this.inputs.bio.addEventListener('input', () => this.updateCharCount());

    // Social signup buttons
    const googleBtn = document.getElementById('googleSignup');
    const githubBtn = document.getElementById('githubSignup');

    if (googleBtn) googleBtn.addEventListener('click', () => this.handleSocialSignup('google'));
    if (githubBtn) githubBtn.addEventListener('click', () => this.handleSocialSignup('github'));

    // Terms modal handlers
    const termsLinks = document.querySelectorAll('.terms-link');
    const termsModalClose = document.getElementById('termsModalClose');
    const modalOverlay = document.querySelector('.modal-overlay');

    termsLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.openTermsModal();
      });
    });

    if (termsModalClose) termsModalClose.addEventListener('click', () => this.closeTermsModal());
    if (modalOverlay) modalOverlay.addEventListener('click', () => this.closeTermsModal());
  }

  setupFormValidation() {
    // Custom validation messages
    this.inputs.firstName.addEventListener('invalid', (e) => {
      if (e.target.validity.valueMissing) {
        e.target.setCustomValidity('Please enter your first name');
      } else if (e.target.validity.tooShort) {
        e.target.setCustomValidity('First name must be at least 2 characters');
      }
    });

    this.inputs.lastName.addEventListener('invalid', (e) => {
      if (e.target.validity.valueMissing) {
        e.target.setCustomValidity('Please enter your last name');
      } else if (e.target.validity.tooShort) {
        e.target.setCustomValidity('Last name must be at least 2 characters');
      }
    });

    this.inputs.username.addEventListener('invalid', (e) => {
      if (e.target.validity.valueMissing) {
        e.target.setCustomValidity('Please choose a username');
      } else if (e.target.validity.tooShort) {
        e.target.setCustomValidity('Username must be at least 3 characters');
      } else if (e.target.validity.patternMismatch) {
        e.target.setCustomValidity('Username can only contain letters, numbers, and underscores');
      }
    });

    this.inputs.email.addEventListener('invalid', (e) => {
      if (e.target.validity.valueMissing) {
        e.target.setCustomValidity('Please enter your email address');
      } else if (e.target.validity.typeMismatch) {
        e.target.setCustomValidity('Please enter a valid email address');
      }
    });

    this.inputs.password.addEventListener('invalid', (e) => {
      if (e.target.validity.valueMissing) {
        e.target.setCustomValidity('Please create a password');
      } else if (e.target.validity.tooShort) {
        e.target.setCustomValidity('Password must be at least 8 characters');
      }
    });

    this.inputs.confirmPassword.addEventListener('invalid', (e) => {
      if (e.target.validity.valueMissing) {
        e.target.setCustomValidity('Please confirm your password');
      }
    });

    this.inputs.agreeTerms.addEventListener('invalid', (e) => {
      if (!e.target.checked) {
        e.target.setCustomValidity('You must agree to the terms of service');
      }
    });

    // Clear custom validity on input
    Object.values(this.inputs).forEach(input => {
      if (input) {
        input.addEventListener('input', () => input.setCustomValidity(''));
      }
    });
  }

  async checkExistingLogin() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/status.php`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.user) {
        // User is already logged in
        this.showAlert('You are already logged in. Redirecting...', 'info');
        setTimeout(() => {
          window.location.href = '/Blogging-App/Frontend/home/home.html';
        }, 1500);
      }
    } catch (error) {
      // Not logged in, which is expected for signup page
      console.debug('User not logged in');
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.setLoading(true);
    this.clearAlert();

    try {
      const formData = new FormData();

      // Add form data
      Object.keys(this.inputs).forEach(key => {
        if (this.inputs[key] && this.inputs[key].type !== 'checkbox') {
          formData.append(key, this.inputs[key].value.trim());
        } else if (this.inputs[key] && this.inputs[key].type === 'checkbox') {
          formData.append(key, this.inputs[key].checked ? '1' : '0');
        }
      });

      if (this.csrfToken) {
        formData.append('csrf_token', this.csrfToken);
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/register.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        this.showAlert(
          'Account created successfully! Please check your email for verification instructions.',
          'success'
        );

        // Clear form
        this.form.reset();
        this.updateCharCount();
        this.checkPasswordStrength();

        // Redirect after delay
        setTimeout(() => {
          window.location.href = '/Blogging-App/Frontend/login/login.html?message=Account created successfully. Please verify your email and log in.&type=success';
        }, 3000);

      } else {
        this.showAlert(data.message || 'Registration failed. Please try again.', 'error');

        // Handle specific field errors
        if (data.errors) {
          Object.keys(data.errors).forEach(field => {
            this.showFieldError(field, data.errors[field]);
          });
        }
      }

    } catch (error) {
      console.error('Registration error:', error);
      this.showAlert('An error occurred. Please try again.', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  validateForm() {
    let isValid = true;

    // Clear previous errors
    this.clearAllErrors();

    // Validate all fields
    Object.keys(this.inputs).forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(fieldName) {
    const input = this.inputs[fieldName];
    if (!input) return true;

    const value = input.value.trim();

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        return this.validateName(fieldName, value);
      case 'username':
        return this.validateUsername(value);
      case 'email':
        return this.validateEmail(value);
      case 'password':
        return this.validatePassword(value);
      case 'confirmPassword':
        return this.validateConfirmPassword(value);
      case 'bio':
        return this.validateBio(value);
      case 'agreeTerms':
        return this.validateTermsAgreement();
      default:
        return true;
    }
  }

  validateName(fieldName, value) {
    if (!value) {
      this.showFieldError(fieldName, `${fieldName === 'firstName' ? 'First' : 'Last'} name is required`);
      return false;
    }

    if (value.length < 2) {
      this.showFieldError(fieldName, `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`);
      return false;
    }

    if (value.length > 50) {
      this.showFieldError(fieldName, `${fieldName === 'firstName' ? 'First' : 'Last'} name must be less than 50 characters`);
      return false;
    }

    this.clearFieldError(fieldName);
    return true;
  }

  validateUsername(value) {
    if (!value) {
      this.showFieldError('username', 'Username is required');
      return false;
    }

    if (value.length < 3) {
      this.showFieldError('username', 'Username must be at least 3 characters');
      return false;
    }

    if (value.length > 30) {
      this.showFieldError('username', 'Username must be less than 30 characters');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      this.showFieldError('username', 'Username can only contain letters, numbers, and underscores');
      return false;
    }

    this.clearFieldError('username');
    return true;
  }

  validateEmail(value) {
    if (!value) {
      this.showFieldError('email', 'Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      this.showFieldError('email', 'Please enter a valid email address');
      return false;
    }

    this.clearFieldError('email');
    return true;
  }

  validatePassword(value) {
    if (!value) {
      this.showFieldError('password', 'Password is required');
      return false;
    }

    if (value.length < 8) {
      this.showFieldError('password', 'Password must be at least 8 characters');
      return false;
    }

    this.clearFieldError('password');
    return true;
  }

  validateConfirmPassword(value) {
    const password = this.inputs.password.value;

    if (!value) {
      this.showFieldError('confirmPassword', 'Please confirm your password');
      return false;
    }

    if (value !== password) {
      this.showFieldError('confirmPassword', 'Passwords do not match');
      return false;
    }

    this.clearFieldError('confirmPassword');
    return true;
  }

  validateBio(value) {
    if (value.length > 500) {
      this.showFieldError('bio', 'Bio must be less than 500 characters');
      return false;
    }

    this.clearFieldError('bio');
    return true;
  }

  validateTermsAgreement() {
    if (!this.inputs.agreeTerms.checked) {
      this.showFieldError('agreeTerms', 'You must agree to the terms of service');
      return false;
    }

    this.clearFieldError('agreeTerms');
    return true;
  }

  async checkUsernameAvailability() {
    const username = this.inputs.username.value.trim();

    if (username.length < 3) return;

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/check-username.php?username=${encodeURIComponent(username)}`);
      const data = await response.json();

      if (!data.available) {
        this.showFieldError('username', 'Username is already taken');
      } else {
        this.clearFieldError('username');
      }
    } catch (error) {
      console.error('Username check failed:', error);
    }
  }

  checkPasswordStrength() {
    const password = this.inputs.password.value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    if (!password) {
      strengthBar.className = 'strength-bar';
      strengthBar.style.width = '0%';
      strengthText.textContent = 'Password strength: Weak';
      return;
    }

    let strength = 0;
    let strengthLevel = 'weak';

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // Determine strength level
    if (strength >= 5) {
      strengthLevel = 'strong';
    } else if (strength >= 3) {
      strengthLevel = 'good';
    } else if (strength >= 2) {
      strengthLevel = 'fair';
    }

    strengthBar.className = `strength-bar ${strengthLevel}`;
    strengthText.textContent = `Password strength: ${strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1)}`;
  }

  updateCharCount() {
    const bioValue = this.inputs.bio.value;
    const countElement = document.getElementById('bioCount');
    const charCountElement = document.querySelector('.char-count');

    if (countElement) {
      countElement.textContent = bioValue.length;
    }

    if (charCountElement) {
      charCountElement.className = 'char-count';
      if (bioValue.length > 450) {
        charCountElement.classList.add('warning');
      }
      if (bioValue.length > 500) {
        charCountElement.classList.add('error');
      }
    }
  }

  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement = this.inputs[fieldName];

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }

    if (inputElement) {
      inputElement.classList.add('error');
    }
  }

  clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement = this.inputs[fieldName];

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }

    if (inputElement) {
      inputElement.classList.remove('error');
    }
  }

  clearAllErrors() {
    Object.keys(this.inputs).forEach(field => this.clearFieldError(field));
  }

  togglePasswordVisibility(fieldName) {
    const input = this.inputs[fieldName];
    const toggleId = fieldName === 'password' ? 'passwordToggle' : 'confirmPasswordToggle';
    const toggle = document.getElementById(toggleId);

    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;

    const icon = toggle.querySelector('i');
    if (icon) {
      icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
  }

  setLoading(loading) {
    const btnText = this.submitButton.querySelector('.btn-text');
    const btnLoader = this.submitButton.querySelector('.btn-loader');

    this.submitButton.disabled = loading;

    if (loading) {
      btnText.style.display = 'none';
      btnLoader.style.display = 'flex';
    } else {
      btnText.style.display = 'flex';
      btnLoader.style.display = 'none';
    }
  }

  showAlert(message, type = 'info') {
    this.clearAlert();

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;

    const icon = type === 'success' ? 'fa-check-circle' :
      type === 'error' ? 'fa-exclamation-circle' :
        'fa-info-circle';

    alert.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

    this.alertContainer.appendChild(alert);

    // Auto-hide success messages
    if (type === 'success') {
      setTimeout(() => this.clearAlert(), 8000);
    }
  }

  clearAlert() {
    this.alertContainer.innerHTML = '';
  }

  handleSocialSignup(provider) {
    this.showAlert(`${provider} signup coming soon!`, 'info');
    // In a real implementation, this would redirect to OAuth endpoints
    // window.location.href = `${this.apiBaseUrl}/auth/oauth/${provider}`;
  }

  openTermsModal() {
    this.termsModal.classList.remove('hidden');
  }

  closeTermsModal() {
    this.termsModal.classList.add('hidden');
  }
}

// Global functions for modal
function acceptTerms() {
  const agreeTermsCheckbox = document.getElementById('agreeTerms');
  if (agreeTermsCheckbox) {
    agreeTermsCheckbox.checked = true;
  }
  closeTermsModal();
}

function closeTermsModal() {
  const termsModal = document.getElementById('termsModal');
  if (termsModal) {
    termsModal.classList.add('hidden');
  }
}

// Utility functions
function redirectTo(url) {
  window.location.href = url;
}

function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const signupManager = new SignupManager();

  // Handle URL parameters for messages
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  const type = urlParams.get('type') || 'info';

  if (message) {
    signupManager.showAlert(decodeURIComponent(message), type);

    // Clean URL
    const url = new URL(window.location);
    url.searchParams.delete('message');
    url.searchParams.delete('type');
    window.history.replaceState({}, '', url);
  }
});

// Global error handler
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});
