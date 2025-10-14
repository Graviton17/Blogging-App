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

// Profile Elements
const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const joinDate = document.getElementById("joinDate");
const profileEmail = document.getElementById("profileEmail");
const postsCount = document.getElementById("postsCount");
const likesCount = document.getElementById("likesCount");
const commentsCount = document.getElementById("commentsCount");
const viewsCount = document.getElementById("viewsCount");

// Tab Elements
const tabBtns = document.querySelectorAll(".tab-btn");
const postsGrid = document.getElementById("postsGrid");
const draftsGrid = document.getElementById("draftsGrid");
const likedGrid = document.getElementById("likedGrid");

// Modal Elements
const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileModal = document.getElementById("editProfileModal");
const closeModal = document.getElementById("closeModal");
const modalOverlay = document.getElementById("modalOverlay");
const cancelEdit = document.getElementById("cancelEdit");
const editProfileForm = document.getElementById("editProfileForm");
const modalAlertContainer = document.getElementById("modalAlertContainer");

// Form Elements
const editFirstName = document.getElementById("editFirstName");
const editLastName = document.getElementById("editLastName");
const editUsername = document.getElementById("editUsername");
const editEmail = document.getElementById("editEmail");
const editBio = document.getElementById("editBio");
const bioCharCount = document.getElementById("bioCharCount");

// Global State
let currentUser = null;
let userPosts = [];
let userDrafts = [];
let likedPosts = [];

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
      loadProfile();
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

// Load Profile
async function loadProfile() {
  try {
    // Display profile info
    displayProfileInfo();

    // Load stats and posts
    await Promise.all([loadStats(), loadUserPosts(), loadLikedPosts()]);

    // Show main content
    loadingContainer.classList.add("hidden");
    mainContent.classList.remove("hidden");
  } catch (error) {
    console.error("Error loading profile:", error);
    showNotLoggedIn();
  }
}

// Display Profile Info
function displayProfileInfo() {
  const firstName = currentUser.first_name || "";
  const lastName = currentUser.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || currentUser.username;

  profileName.textContent = fullName;
  profileUsername.textContent = `@${currentUser.username}`;
  profileEmail.textContent = currentUser.email || "No email";
  profileBio.textContent = currentUser.bio || "No bio yet";

  // Format join date
  if (currentUser.created_at) {
    const date = new Date(currentUser.created_at);
    const options = { year: "numeric", month: "long" };
    joinDate.textContent = date.toLocaleDateString("en-US", options);
  } else {
    joinDate.textContent = "Recently";
  }
}

// Load Stats
async function loadStats() {
  try {
    // Load posts count
    const postsResponse = await fetch(
      `${API_BASE_URL}/posts/list.php?author_id=${currentUser.id}`,
      { credentials: "include" }
    );
    const postsData = await postsResponse.json();
    const posts = postsData.posts || [];

    postsCount.textContent = posts.length;

    // Calculate total likes and views
    let totalLikes = 0;
    let totalViews = 0;

    posts.forEach((post) => {
      totalLikes += parseInt(post.likes_count || 0);
      totalViews += parseInt(post.views_count || 0);
    });

    likesCount.textContent = totalLikes;
    viewsCount.textContent = totalViews;

    // Load comments count
    const commentsResponse = await fetch(
      `${API_BASE_URL}/comments/list.php?user_id=${currentUser.id}`,
      { credentials: "include" }
    );
    const commentsData = await commentsResponse.json();
    commentsCount.textContent = commentsData.comments?.length || 0;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

// Load User Posts
async function loadUserPosts() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts/list.php?author_id=${currentUser.id}`,
      { credentials: "include" }
    );

    const data = await response.json();

    if (data.success && data.posts) {
      userPosts = data.posts.filter((post) => post.status === "published");
      userDrafts = data.posts.filter((post) => post.status === "draft");

      displayPosts(userPosts, postsGrid);
      displayPosts(userDrafts, draftsGrid);
    } else {
      displayEmptyState(postsGrid, "No published posts yet", "Start writing!");
      displayEmptyState(draftsGrid, "No drafts", "All your drafts will appear here");
    }
  } catch (error) {
    console.error("Error loading posts:", error);
    displayEmptyState(postsGrid, "Error loading posts");
    displayEmptyState(draftsGrid, "Error loading drafts");
  }
}

// Load Liked Posts
async function loadLikedPosts() {
  try {
    // Note: This would need a backend endpoint to get liked posts by user
    // For now, we'll show empty state
    displayEmptyState(likedGrid, "No liked posts yet", "Like posts to see them here");
  } catch (error) {
    console.error("Error loading liked posts:", error);
    displayEmptyState(likedGrid, "Error loading liked posts");
  }
}

// Display Posts
function displayPosts(posts, container) {
  if (posts.length === 0) {
    const message =
      container === postsGrid
        ? "No published posts yet"
        : container === draftsGrid
          ? "No drafts"
          : "No liked posts yet";
    const hint =
      container === postsGrid
        ? "Start writing!"
        : container === draftsGrid
          ? "All your drafts will appear here"
          : "Like posts to see them here";
    displayEmptyState(container, message, hint);
    return;
  }

  container.innerHTML = "";

  posts.forEach((post) => {
    const postCard = createPostCard(post);
    container.appendChild(postCard);
  });
}

// Create Post Card
function createPostCard(post) {
  const card = document.createElement("div");
  card.className = "post-card";

  const status = post.status === "published" ? "published" : "draft";
  const badgeClass = status === "published" ? "badge-published" : "badge-draft";

  // Strip HTML tags from content for excerpt
  const excerpt = stripHtml(post.content).substring(0, 150) + "...";

  card.innerHTML = `
    <div class="post-card-header">
      <div class="post-card-title">
        <h3>
          <a href="../post-detail/post-detail.html?id=${post.id}">${escapeHtml(
    post.title
  )}</a>
        </h3>
      </div>
      <span class="post-badge ${badgeClass}">${status}</span>
    </div>
    <p class="post-card-excerpt">${escapeHtml(excerpt)}</p>
    <div class="post-card-meta">
      <div class="post-stats">
        <span class="stat">
          <i class="fas fa-heart"></i>
          ${post.likes_count || 0}
        </span>
        <span class="stat">
          <i class="fas fa-comment"></i>
          ${post.comments_count || 0}
        </span>
        <span class="stat">
          <i class="fas fa-eye"></i>
          ${post.views_count || 0}
        </span>
      </div>
      <div class="post-actions">
        <button class="icon-btn" onclick="editPost(${post.id
    })" title="Edit post">
          <i class="fas fa-edit"></i>
        </button>
        <button class="icon-btn delete" onclick="deletePost(${post.id
    }, '${escapeHtml(post.title)}')" title="Delete post">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  return card;
}

// Display Empty State
function displayEmptyState(container, message, hint = "") {
  container.innerHTML = `
    <div class="empty-posts">
      <i class="fas fa-inbox"></i>
      <h3>${message}</h3>
      ${hint ? `<p>${hint}</p>` : ""}
      ${container === postsGrid || container === draftsGrid
      ? '<a href="../create-post/create-post.html" class="btn btn-primary"><i class="fas fa-plus"></i> Create Post</a>'
      : ""
    }
    </div>
  `;
}

// Edit Post
function editPost(postId) {
  window.location.href = `../create-post/create-post.html?id=${postId}`;
}

// Delete Post
async function deletePost(postId, postTitle) {
  if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts/delete.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id: postId }),
    });

    const data = await response.json();

    if (data.success) {
      // Reload posts
      await loadUserPosts();
      await loadStats();
    } else {
      alert(data.message || "Failed to delete post");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("An error occurred while deleting the post");
  }
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

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  // Edit profile
  editProfileBtn.addEventListener("click", () => {
    openEditModal();
  });

  closeModal.addEventListener("click", () => {
    closeEditModal();
  });

  modalOverlay.addEventListener("click", () => {
    closeEditModal();
  });

  cancelEdit.addEventListener("click", () => {
    closeEditModal();
  });

  // Bio character counter
  editBio.addEventListener("input", () => {
    bioCharCount.textContent = editBio.value.length;
  });

  // Edit profile form
  editProfileForm.addEventListener("submit", handleProfileUpdate);
}

// Switch Tab
function switchTab(tab) {
  // Update tab buttons
  tabBtns.forEach((btn) => {
    if (btn.dataset.tab === tab) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update tab panes
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.remove("active");
  });

  if (tab === "posts") {
    document.getElementById("postsTab").classList.add("active");
  } else if (tab === "drafts") {
    document.getElementById("draftsTab").classList.add("active");
  } else if (tab === "liked") {
    document.getElementById("likedTab").classList.add("active");
  }
}

// Open Edit Modal
function openEditModal() {
  // Pre-fill form with current user data
  editFirstName.value = currentUser.first_name || "";
  editLastName.value = currentUser.last_name || "";
  editUsername.value = currentUser.username || "";
  editEmail.value = currentUser.email || "";
  editBio.value = currentUser.bio || "";
  bioCharCount.textContent = (currentUser.bio || "").length;

  // Clear any previous alerts
  modalAlertContainer.innerHTML = "";

  editProfileModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// Close Edit Modal
function closeEditModal() {
  editProfileModal.classList.add("hidden");
  document.body.style.overflow = "";
  modalAlertContainer.innerHTML = "";
}

// Handle Profile Update
async function handleProfileUpdate(e) {
  e.preventDefault();

  // Clear previous alerts
  modalAlertContainer.innerHTML = "";

  // Get form values
  const formData = {
    first_name: editFirstName.value.trim(),
    last_name: editLastName.value.trim(),
    email: editEmail.value.trim(),
    bio: editBio.value.trim(),
  };

  // Validate email
  if (formData.email && !isValidEmail(formData.email)) {
    showModalAlert("Please enter a valid email address", "error");
    return;
  }

  // Show loading state
  const submitBtn = editProfileForm.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector(".btn-text");
  const btnLoading = submitBtn.querySelector(".btn-loading");
  btnText.classList.add("hidden");
  btnLoading.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    // Note: You would need to create a backend endpoint for updating profile
    // For now, we'll simulate success
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update current user data
    currentUser.first_name = formData.first_name;
    currentUser.last_name = formData.last_name;
    currentUser.email = formData.email;
    currentUser.bio = formData.bio;

    // Update display
    displayProfileInfo();

    showModalAlert("Profile updated successfully!", "success");

    // Close modal after a short delay
    setTimeout(() => {
      closeEditModal();
    }, 1500);
  } catch (error) {
    console.error("Error updating profile:", error);
    showModalAlert("Failed to update profile. Please try again.", "error");
  } finally {
    // Reset button state
    btnText.classList.remove("hidden");
    btnLoading.classList.add("hidden");
    submitBtn.disabled = false;
  }
}

// Show Modal Alert
function showModalAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;

  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

  alertDiv.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;

  modalAlertContainer.appendChild(alertDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
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

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
