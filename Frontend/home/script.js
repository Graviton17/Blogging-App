// API Configuration - Use centralized config or fallback
const API_BASE = typeof API_ENDPOINTS !== 'undefined'
  ? API_ENDPOINTS
  : {
    AUTH: {
      STATUS: 'http://localhost/blogging-app/Backend/api/auth/status.php',
      LOGOUT: 'http://localhost/blogging-app/Backend/api/auth/logout.php',
    },
    POSTS: {
      LIST: 'http://localhost/blogging-app/Backend/api/posts/list.php',
      CATEGORIES: 'http://localhost/blogging-app/Backend/api/posts/categories.php',
      GET: 'http://localhost/blogging-app/Backend/api/posts/get.php',
    },
    COMMENTS: {
      LIST: 'http://localhost/blogging-app/Backend/api/comments/list.php',
    }
  };

// Global State
let currentUser = null;
let currentPage = 1;
let currentFilters = {};
let currentView = 'grid';

// DOM Elements
const navAuth = document.getElementById('navAuth');
const navUser = document.getElementById('navUser');
const userBtn = document.getElementById('userBtn');
const userName = document.getElementById('userName');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const featuredPosts = document.getElementById('featuredPosts');
const postsContainer = document.getElementById('postsContainer');
const paginationContainer = document.getElementById('paginationContainer');
const tagsCloud = document.getElementById('tagsCloud');
const recentComments = document.getElementById('recentComments');
const viewBtns = document.querySelectorAll('.view-btn');
const newsletterForm = document.getElementById('newsletterForm');
const heroSignupBtn = document.getElementById('heroSignupBtn');

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
});

async function initializeApp() {
  try {
    // Check authentication status
    await checkAuthStatus();

    // Load initial data
    await Promise.all([
      loadPosts(),
      loadFeaturedPosts(),
      loadTags(),
      loadRecentComments()
    ]);

    // Setup event listeners
    setupEventListeners();

  } catch (error) {
    console.error('Failed to initialize app:', error);
    showNotification('Failed to load data. Please refresh the page.', 'error');
  }
}

// Authentication
async function checkAuthStatus() {
  try {
    const url = API_BASE.AUTH?.STATUS || `${API_BASE}/auth/status.php`;

    // Create a timeout for the request
    const timeoutId = setTimeout(() => {
      throw new Error('Authentication check timed out');
    }, 10000); // 10 second timeout

    const response = await fetch(url, {
      credentials: 'include', // Re-enabled after fixing CORS configuration
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Authentication check failed`);
    }

    const data = await response.json();

    if (data.authenticated) {
      currentUser = data.user;
      updateAuthUI(true);
    } else {
      updateAuthUI(false);
    }
  } catch (error) {
    console.error('Auth check failed:', error);

    // Different error handling based on error type
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn('Network error during auth check - user may be offline');
    } else if (error.message.includes('timeout')) {
      console.warn('Auth check timed out - server may be slow');
    } else if (error.message.includes('HTTP')) {
      console.warn('Server error during auth check:', error.message);
    }

    // Always fall back to unauthenticated state on error
    updateAuthUI(false);
  }
}

function updateAuthUI(isAuthenticated) {
  if (isAuthenticated && currentUser) {
    navAuth.classList.add('hidden');
    navUser.classList.remove('hidden');
    userName.textContent = currentUser.first_name || currentUser.username;
    // Hide hero signup button when user is authenticated
    if (heroSignupBtn) {
      heroSignupBtn.style.display = 'none';
    }
  } else {
    navAuth.classList.remove('hidden');
    navUser.classList.add('hidden');
    // Show hero signup button when user is not authenticated
    if (heroSignupBtn) {
      heroSignupBtn.style.display = '';
    }
  }
}

async function logout() {
  try {
    const url = API_BASE.AUTH?.LOGOUT || `${API_BASE}/auth/logout.php`;

    const timeoutId = setTimeout(() => {
      throw new Error('Logout request timed out');
    }, 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      currentUser = null;
      updateAuthUI(false);
      showNotification('Logged out successfully', 'success');
    } else {
      throw new Error(`HTTP ${response.status}: Logout request failed`);
    }
  } catch (error) {
    console.error('Logout failed:', error);

    // Even if logout fails on server, clear local state
    currentUser = null;
    updateAuthUI(false);

    if (error.message.includes('timeout')) {
      showNotification('Logout request timed out, but you have been logged out locally', 'warning');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      showNotification('Network error during logout, but you have been logged out locally', 'warning');
    } else {
      showNotification('Logout failed on server, but you have been logged out locally', 'warning');
    }
  }
}

// Data Loading Functions
async function loadPosts(page = 1, filters = {}) {
  try {
    showLoading(postsContainer);

    const params = new URLSearchParams({
      page: page,
      limit: 12,
      ...filters
    });

    const response = await fetch(`${API_BASE.POSTS.LIST}?${params}`, {
      credentials: 'include' // Re-enabled after fixing CORS configuration
    });
    const data = await response.json();

    if (data.success) {
      renderPosts(data.posts);
      renderPagination(data.pagination);
      currentPage = page;
      currentFilters = filters;
    } else {
      throw new Error(data.error || 'Failed to load posts');
    }
  } catch (error) {
    console.error('Failed to load posts:', error);
    showError(postsContainer, 'Failed to load posts');
  }
}

async function loadFeaturedPosts() {
  try {
    const response = await fetch(`${API_BASE.POSTS.LIST}?limit=3&sort=view_count&order=DESC`, {
      credentials: 'include' // Re-enabled after fixing CORS configuration
    });
    const data = await response.json();

    if (data.success) {
      renderFeaturedPosts(data.posts);
    } else {
      throw new Error(data.error || 'Failed to load featured posts');
    }
  } catch (error) {
    console.error('Failed to load featured posts:', error);
    showError(featuredPosts, 'Failed to load featured posts');
  }
}

async function loadTags() {
  try {
    // This would typically come from an API endpoint
    const tags = [
      'JavaScript', 'PHP', 'Web Design', 'Photography', 'Adventure',
      'Recipe', 'Health', 'Productivity', 'Marketing', 'Finance'
    ];

    renderTags(tags);
  } catch (error) {
    console.error('Failed to load tags:', error);
    showError(tagsCloud, 'Failed to load tags');
  }
}

async function loadRecentComments() {
  try {
    // This would typically come from an API endpoint
    const comments = [
      {
        author: 'John Doe',
        text: 'Great article! Very informative and well written.',
        post_title: 'Getting Started with React',
        post_id: 1
      },
      {
        author: 'Jane Smith',
        text: 'Thanks for sharing this. It really helped me understand...',
        post_title: 'Modern CSS Techniques',
        post_id: 2
      }
    ];

    renderRecentComments(comments);
  } catch (error) {
    console.error('Failed to load recent comments:', error);
    showError(recentComments, 'Failed to load recent comments');
  }
}

// Rendering Functions
function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: 2rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray-300); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--gray-500);">No posts found</h3>
                <p style="color: var(--gray-400);">Try adjusting your search criteria</p>
            </div>
        `;
    return;
  }

  postsContainer.innerHTML = posts.map(post => createPostCard(post)).join('');
  postsContainer.className = `posts-container ${currentView}-view`;
}

function createPostCard(post) {
  const excerpt = post.excerpt || stripHtml(post.content).substring(0, 150) + '...';
  const publishedDate = formatDate(post.created_at);

  return `
        <article class="post-card ${currentView}-view">
            <div class="post-content">
                <div class="post-meta">
                    <span><i class="fas fa-user"></i> ${escapeHtml(post.author_name || 'Anonymous')}</span>
                    <span><i class="fas fa-calendar"></i> ${publishedDate}</span>
                    <span><i class="fas fa-eye"></i> ${post.view_count || 0}</span>
                </div>
                <h3 class="post-title">
                    <a href="#" onclick="viewPost(${post.id}); return false;">${escapeHtml(post.title)}</a>
                </h3>
                <p class="post-excerpt">${escapeHtml(excerpt)}</p>
                ${post.categories ? `
                    <div class="post-tags">
                        ${post.categories.map(cat => `<a href="#" class="tag" onclick="filterByCategory('${cat.name}'); return false;">${escapeHtml(cat.name)}</a>`).join('')}
                    </div>
                ` : ''}
                <div class="post-stats">
                    <span><i class="fas fa-comments"></i> ${post.comment_count || 0} comments</span>
                    <a href="#" class="post-read-more" onclick="viewPost(${post.id}); return false;">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </article>
    `;
}

function renderFeaturedPosts(posts) {
  if (!posts || posts.length === 0) {
    featuredPosts.innerHTML = '<p class="text-center" style="color: var(--gray-500);">No featured posts available</p>';
    return;
  }

  featuredPosts.innerHTML = posts.map(post => createFeaturedPostCard(post)).join('');
}

function createFeaturedPostCard(post) {
  const excerpt = post.excerpt || stripHtml(post.content).substring(0, 120) + '...';

  return `
        <div class="featured-post-card">
            <div class="featured-content">
                <span class="featured-badge">Featured</span>
                <h3><a href="#" onclick="viewPost(${post.id}); return false;">${escapeHtml(post.title)}</a></h3>
                <p>${escapeHtml(excerpt)}</p>
                <div class="featured-meta">
                    <span>${escapeHtml(post.author_name || 'Anonymous')}</span>
                    <span>${formatDate(post.created_at)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderTags(tags) {
  tagsCloud.innerHTML = tags.map(tag => `
        <a href="#" class="tag" onclick="filterByTag('${tag}'); return false;">${escapeHtml(tag)}</a>
    `).join('');
}

function renderRecentComments(comments) {
  if (!comments || comments.length === 0) {
    recentComments.innerHTML = '<p style="color: var(--gray-500);">No recent comments</p>';
    return;
  }

  recentComments.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-author">${escapeHtml(comment.author)}</div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            <div class="comment-post">
                on <a href="#" onclick="viewPost(${comment.post_id}); return false;">${escapeHtml(comment.post_title)}</a>
            </div>
        </div>
    `).join('');
}

function renderPagination(pagination) {
  if (!pagination || pagination.total_pages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  const { current_page, total_pages, has_prev, has_next } = pagination;
  let paginationHTML = '<div class="pagination">';

  // Previous button
  paginationHTML += `
        <button class="pagination-btn" ${!has_prev ? 'disabled' : ''} 
                onclick="changePage(${current_page - 1})" ${!has_prev ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `;

  // Page numbers
  const startPage = Math.max(1, current_page - 2);
  const endPage = Math.min(total_pages, current_page + 2);

  if (startPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
            <button class="pagination-btn ${i === current_page ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
  }

  if (endPage < total_pages) {
    if (endPage < total_pages - 1) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${total_pages})">${total_pages}</button>`;
  }

  // Next button
  paginationHTML += `
        <button class="pagination-btn" ${!has_next ? 'disabled' : ''} 
                onclick="changePage(${current_page + 1})" ${!has_next ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;

  paginationHTML += '</div>';
  paginationContainer.innerHTML = paginationHTML;
}

// Event Listeners
function setupEventListeners() {
  // Mobile navigation
  navToggle?.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });

  // User dropdown
  userBtn?.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (dropdownMenu && !userBtn?.contains(e.target)) {
      dropdownMenu.classList.remove('show');
    }
    if (navMenu && !navToggle?.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('show');
    }
  });

  // Logout
  logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // View toggle
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      changeView(view);
    });
  });

  // Newsletter
  newsletterForm?.addEventListener('submit', handleNewsletterSubscription);
}

// Action Functions
function filterByCategory(categoryName) {
  loadPosts(1, { category: categoryName });
}

function filterByTag(tagName) {
  loadPosts(1, { tag: tagName });
}

function changePage(page) {
  if (page >= 1) {
    loadPosts(page, currentFilters);
  }
}

function changeView(view) {
  currentView = view;

  // Update button states
  viewBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Update posts container class
  postsContainer.className = `posts-container ${view}-view`;
}

function viewPost(postId) {
  // Validate postId
  if (!postId || postId <= 0) {
    showNotification('Invalid post ID', 'error');
    return false;
  }

  // Navigate to post detail page
  window.location.href = `../post-detail/post-detail.html?id=${postId}`;
  return false;
}

async function handleNewsletterSubscription(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;

  try {
    // This would typically send to a newsletter API
    console.log('Newsletter subscription:', email);
    showNotification('Thank you for subscribing!', 'success');
    e.target.reset();
  } catch (error) {
    console.error('Newsletter subscription failed:', error);
    showNotification('Subscription failed. Please try again.', 'error');
  }
}

// Utility Functions
function showLoading(container) {
  container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading...</span>
        </div>
    `;
}

function showError(container, message) {
  container.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  // Add to page
  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success': return 'check-circle';
    case 'error': return 'exclamation-circle';
    case 'warning': return 'exclamation-triangle';
    default: return 'info-circle';
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function stripHtml(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// Add notification styles
const notificationStyles = `
    <style>
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow-lg);
            padding: 1rem;
            border-left: 4px solid var(--primary-color);
            animation: slideIn 0.3s ease-out;
        }
        
        .notification-success { border-left-color: var(--success-color); }
        .notification-error { border-left-color: var(--error-color); }
        .notification-warning { border-left-color: var(--warning-color); }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            padding: 0.25rem;
            margin-left: auto;
            cursor: pointer;
            color: var(--gray-500);
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .featured-post-card {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            overflow: hidden;
            transition: var(--transition);
        }
        
        .featured-post-card:hover {
            box-shadow: var(--box-shadow-lg);
            transform: translateY(-2px);
        }
        
        .featured-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        .featured-content {
            padding: 1.5rem;
            position: relative;
        }
        
        .featured-badge {
            position: absolute;
            top: -10px;
            left: 1rem;
            background: var(--primary-color);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: var(--border-radius);
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .featured-content h3 {
            margin: 0.5rem 0;
        }
        
        .featured-content h3 a {
            color: var(--gray-900);
        }
        
        .featured-content h3 a:hover {
            color: var(--primary-color);
        }
        
        .featured-meta {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
            font-size: 0.875rem;
            color: var(--gray-500);
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);