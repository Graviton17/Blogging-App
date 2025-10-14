// Login functionality and UI interactions
class LoginManager {
  constructor() {
    this.form = document.getElementById('loginForm');
    this.emailInput = document.getElementById('login'); // Changed from 'email' to 'login' to match HTML
    this.passwordInput = document.getElementById('password');
    this.rememberCheckbox = document.getElementById('remember');
    this.submitButton = document.getElementById('loginButton'); // Changed from 'submitBtn' to 'loginButton' to match HTML
    this.alertContainer = document.getElementById('alertContainer');

    this.forgotPasswordModal = document.getElementById('forgotPasswordModal');
    this.resetForm = document.getElementById('resetForm');
    this.resetEmailInput = document.getElementById('resetEmail');

    // Use API configuration if available, otherwise use XAMPP default
    this.apiEndpoints = typeof API_ENDPOINTS !== 'undefined'
      ? API_ENDPOINTS.AUTH
      : {
        CSRF_TOKEN: 'http://localhost/blogging-app/Backend/api/auth/csrf-token.php',
        LOGIN: 'http://localhost/blogging-app/Backend/api/auth/login.php',
        STATUS: 'http://localhost/blogging-app/Backend/api/auth/status.php',
        FORGOT_PASSWORD: 'http://localhost/blogging-app/Backend/api/auth/forgot-password.php',
      };
    this.csrfToken = '';

    this.init();
  }

  async init() {
    await this.fetchCSRFToken();
    this.setupEventListeners();
    this.checkExistingLogin();
    this.setupFormValidation();
  }

  async fetchCSRFToken() {
    try {
      const url = this.apiEndpoints.CSRF_TOKEN;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && (data.token || data.csrf_token)) {
        this.csrfToken = data.token || data.csrf_token;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }

  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Password visibility toggle
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle) {
      passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());
    }

    // Social login buttons
    const googleBtn = document.getElementById('googleLogin');
    const githubBtn = document.getElementById('githubLogin');

    if (googleBtn) googleBtn.addEventListener('click', () => this.handleSocialLogin('google'));
    if (githubBtn) githubBtn.addEventListener('click', () => this.handleSocialLogin('github'));

    // Forgot password modal
    const forgotPasswordLink = document.getElementById('forgotPasswordLink'); // Changed from 'forgotPassword' to match HTML
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.openForgotPasswordModal();
      });
    }

    // Modal close handlers
    const modalCloseBtn = document.getElementById('modalClose');
    const modalOverlay = document.querySelector('.modal-overlay');

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => this.closeForgotPasswordModal());
    if (modalOverlay) modalOverlay.addEventListener('click', () => this.closeForgotPasswordModal());

    // Reset form submission
    if (this.resetForm) {
      this.resetForm.addEventListener('submit', (e) => this.handleResetSubmit(e));
    }

    // Real-time form validation
    this.emailInput.addEventListener('blur', () => this.validateEmail());
    this.passwordInput.addEventListener('blur', () => this.validatePassword());

    // Clear errors on input
    this.emailInput.addEventListener('input', () => this.clearFieldError('login')); // Changed from 'email' to 'login'
    this.passwordInput.addEventListener('input', () => this.clearFieldError('password'));

    // Remember me functionality
    if (this.rememberCheckbox && localStorage.getItem('rememberEmail')) {
      this.emailInput.value = localStorage.getItem('rememberEmail');
      this.rememberCheckbox.checked = true;
    }
  }

  setupFormValidation() {
    // Add custom validation messages
    this.emailInput.addEventListener('invalid', (e) => {
      if (e.target.validity.valueMissing) {
        e.target.setCustomValidity('Please enter your username or email address to continue');
      } else if (e.target.validity.typeMismatch) {
        e.target.setCustomValidity('Please enter a valid email address (e.g., user@example.com)');
      }
    });

    this.passwordInput.addEventListener('invalid', (e) => {
      if (e.target.validity.valueMissing) {
        e.target.setCustomValidity('Please enter your password to log in');
      }
    });

    // Clear custom validity on input
    [this.emailInput, this.passwordInput].forEach(input => {
      input.addEventListener('input', () => input.setCustomValidity(''));
    });
  }

  async checkExistingLogin() {
    try {
      const response = await fetch(this.apiEndpoints.STATUS, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.user) {
        // User is already logged in, redirect to dashboard or home
        this.showAlert('You are already logged in. Redirecting...', 'info');
        setTimeout(() => {
          window.location.href = '../home/home.html';
        }, 1500);
      }
    } catch (error) {
      // Not logged in, which is expected for login page
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
      // Prepare login data as JSON
      const loginData = {
        login: this.emailInput.value.trim(),
        password: this.passwordInput.value,
        remember: this.rememberCheckbox.checked,
        csrf_token: this.csrfToken
      };

      const url = this.apiEndpoints.LOGIN;

      // Create timeout for the request
      const timeoutId = setTimeout(() => {
        throw new Error('Login request timed out');
      }, 15000); // 15 second timeout for login

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData),
        signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Login request failed`);
      }

      const data = await response.json();

      if (data.success) {
        this.showAlert('Login successful! Redirecting...', 'success');

        // Handle remember me
        if (this.rememberCheckbox.checked) {
          localStorage.setItem('rememberEmail', this.emailInput.value.trim());
        } else {
          localStorage.removeItem('rememberEmail');
        }

        // Redirect after short delay
        setTimeout(() => {
          const redirectUrl = new URLSearchParams(window.location.search).get('redirect') ||
            '../home/home.html';
          window.location.href = redirectUrl;
        }, 1500);

      } else {
        this.showAlert(data.error || data.message || 'Login failed. Please try again.', 'error');

        // Handle specific field errors
        if (data.errors) {
          Object.keys(data.errors).forEach(field => {
            this.showFieldError(field, data.errors[field]);
          });
        }
      }

    } catch (error) {
      console.error('Login error:', error);

      // Provide specific error messages based on error type
      if (error.message.includes('timeout')) {
        this.showAlert('Login request timed out. Please check your connection and try again.', 'error');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        this.showAlert('Network error. Please check your internet connection and try again.', 'error');
      } else if (error.message.includes('HTTP 500')) {
        this.showAlert('Server error. Please try again later or contact support.', 'error');
      } else if (error.message.includes('HTTP 429')) {
        this.showAlert('Too many login attempts. Please wait a few minutes and try again.', 'error');
      } else if (error.message.includes('HTTP')) {
        this.showAlert('Login service is currently unavailable. Please try again later.', 'error');
      } else {
        this.showAlert('An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      this.setLoading(false);
    }
  }

  validateForm() {
    let isValid = true;

    // Clear previous errors
    this.clearAllErrors();

    // Validate email
    if (!this.validateEmail()) {
      isValid = false;
    }

    // Validate password
    if (!this.validatePassword()) {
      isValid = false;
    }

    return isValid;
  }

  validateEmail() {
    const email = this.emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      this.showFieldError('login', 'Please enter your username or email address to continue');
      return false;
    }

    // Allow both username and email format
    // if (!emailRegex.test(email)) {
    //   this.showFieldError('login', 'Please enter a valid email address');
    //   return false;
    // }

    this.clearFieldError('login'); // Changed from 'email' to 'login'
    return true;
  }

  validatePassword() {
    const password = this.passwordInput.value;

    if (!password) {
      this.showFieldError('password', 'Please enter your password to log in');
      return false;
    }

    if (password.length < 6) {
      this.showFieldError('password', 'Password must be at least 6 characters long');
      return false;
    }

    this.clearFieldError('password');
    return true;
  }

  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    const inputElement = document.getElementById(fieldName);

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
    const inputElement = document.getElementById(fieldName);

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }

    if (inputElement) {
      inputElement.classList.remove('error');
    }
  }

  clearAllErrors() {
    ['email', 'password'].forEach(field => this.clearFieldError(field));
  }

  togglePasswordVisibility() {
    const type = this.passwordInput.type === 'password' ? 'text' : 'password';
    this.passwordInput.type = type;

    const toggle = document.getElementById('passwordToggle');
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
      setTimeout(() => this.clearAlert(), 5000);
    }
  }

  clearAlert() {
    this.alertContainer.innerHTML = '';
  }

  handleSocialLogin(provider) {
    this.showAlert(`${provider} login coming soon!`, 'info');
    // In a real implementation, this would redirect to OAuth endpoints
    // window.location.href = `${this.apiBaseUrl}/auth/oauth/${provider}`;
  }

  openForgotPasswordModal() {
    this.forgotPasswordModal.classList.remove('hidden');
    this.resetEmailInput.focus();
  }

  closeForgotPasswordModal() {
    this.forgotPasswordModal.classList.add('hidden');
    this.resetForm.reset();
    this.clearResetErrors();
  }

  async handleResetSubmit(e) {
    e.preventDefault();

    const email = this.resetEmailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      this.showResetError('Please enter your email address');
      return;
    }

    if (!emailRegex.test(email)) {
      this.showResetError('Please enter a valid email address');
      return;
    }

    const resetBtn = document.getElementById('resetBtn');
    const originalText = resetBtn.innerHTML;

    resetBtn.disabled = true;
    resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
      const formData = new FormData();
      formData.append('email', email);

      if (this.csrfToken) {
        formData.append('csrf_token', this.csrfToken);
      }

      const response = await fetch(this.apiEndpoints.FORGOT_PASSWORD, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        this.showResetSuccess('Password reset instructions have been sent to your email.');
        setTimeout(() => this.closeForgotPasswordModal(), 3000);
      } else {
        this.showResetError(data.message || 'Failed to send reset email. Please try again.');
      }

    } catch (error) {
      console.error('Reset password error:', error);
      this.showResetError('An error occurred. Please try again.');
    } finally {
      resetBtn.disabled = false;
      resetBtn.innerHTML = originalText;
    }
  }

  showResetError(message) {
    const errorDiv = document.getElementById('resetError');
    errorDiv.textContent = message;
    errorDiv.className = 'alert alert-error';
    errorDiv.style.display = 'block';
  }

  showResetSuccess(message) {
    const errorDiv = document.getElementById('resetError');
    errorDiv.textContent = message;
    errorDiv.className = 'alert alert-success';
    errorDiv.style.display = 'block';
  }

  clearResetErrors() {
    const errorDiv = document.getElementById('resetError');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
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

// Handle browser back/forward navigation
window.addEventListener('popstate', (e) => {
  // Handle navigation state if needed
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const loginManager = new LoginManager();

  // Handle URL parameters for messages
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  const type = urlParams.get('type') || 'info';

  if (message) {
    loginManager.showAlert(decodeURIComponent(message), type);

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