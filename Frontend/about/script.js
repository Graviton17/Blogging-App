// About Page JavaScript

// DOM Elements
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navAuth = document.getElementById('navAuth');
const navUser = document.getElementById('navUser');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  initializeNavigation();
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
      // User is logged in
      showUserNav(data.user);
    } else {
      // User is not logged in
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
        // Redirect to home page after logout
        window.location.href = '../home/home.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Redirect anyway
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

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('show');
      }
    });
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

// Add animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.value-card, .feature-item, .section').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
