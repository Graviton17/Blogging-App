// BlogCraft - Create Post Manager
document.addEventListener('DOMContentLoaded', function () {
  // Initialize the create post functionality
  const createPost = {
    // DOM elements
    form: document.getElementById('postForm'),
    titleInput: document.getElementById('postTitle'),
    categorySelect: document.getElementById('category'),
    statusSelect: document.getElementById('status'),
    tagsInput: document.getElementById('tagsInput'),
    tagsContainer: document.getElementById('tagsContainer'),
    excerptTextarea: document.getElementById('excerpt'),
    contentTextarea: document.getElementById('content'),
    previewModal: document.getElementById('previewModal'),
    alertContainer: document.getElementById('alertContainer'),

    // State
    tags: [],
    csrfToken: null,
    apiBaseUrl: typeof API_CONFIG !== 'undefined'
      ? API_CONFIG.BASE_URL
      : 'http://localhost/blogging-app/Backend/api',

    // Initialize
    init: function () {
      this.loadCSRFToken();
      this.loadCategories();
      this.setupEventListeners();
      this.initCharacterCounters();
    },

    // Event listeners
    setupEventListeners: function () {
      // Form submission
      if (this.form) {
        this.form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (this.validateForm()) {
            this.publishPost();
          }
        });
      }

      // Title input
      if (this.titleInput) {
        this.titleInput.addEventListener('input', () => {
          this.updateCharCount('title');
        });
      }

      // Tags input
      if (this.tagsInput) {
        this.tagsInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            this.addTag();
          }
        });
      }

      // Excerpt textarea
      if (this.excerptTextarea) {
        this.excerptTextarea.addEventListener('input', () => {
          this.updateCharCount('excerpt');
        });
      }

      // Action buttons
      const saveDraftBtn = document.getElementById('saveDraftBtn');
      if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => this.saveDraft());
      }

      const previewBtn = document.getElementById('previewBtn');
      if (previewBtn) {
        previewBtn.addEventListener('click', () => this.showPreview());
      }

      const cancelBtn = document.getElementById('cancelBtn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.cancelEditing());
      }

      // Modal close
      const closePreviewBtn = document.getElementById('closePreviewBtn');
      if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', () => this.closeModal());
      }

      // User menu
      const userMenuBtn = document.getElementById('userMenuBtn');
      if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleUserDropdown();
        });
      }

      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.logout());
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        this.closeUserDropdown();
      });
    },

    // Load CSRF token
    loadCSRFToken: async function () {
      try {
        const response = await fetch(this.apiBaseUrl + '/auth/csrf-token.php', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
          this.csrfToken = data.token;
        } else {
          console.error('Failed to load CSRF token:', data.error);
        }
      } catch (error) {
        console.error('Error loading CSRF token:', error);
      }
    },

    // Load categories
    loadCategories: async function () {
      try {
        const response = await fetch(this.apiBaseUrl + '/posts/categories.php', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.status === 'success') {
          this.populateCategories(data.categories || []);
        } else {
          throw new Error('Failed to load categories');
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        this.populateCategories([
          { id: 1, name: 'Technology' },
          { id: 2, name: 'Travel' },
          { id: 3, name: 'Lifestyle' },
          { id: 4, name: 'Food' },
          { id: 5, name: 'Business' }
        ]);
      }
    },

    populateCategories: function (categories) {
      if (!this.categorySelect) return;

      this.categorySelect.innerHTML = '<option value="">Select a category...</option>';
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        this.categorySelect.appendChild(option);
      });
    },

    // Form validation
    validateForm: function () {
      let isValid = true;
      this.clearErrors();

      const title = this.titleInput ? this.titleInput.value.trim() : '';
      if (!title) {
        this.showFieldError('titleError', 'Title is required');
        isValid = false;
      }

      if (!this.categorySelect || !this.categorySelect.value) {
        this.showFieldError('categoryError', 'Please select a category');
        isValid = false;
      }

      const content = this.contentTextarea ? this.contentTextarea.value.trim() : '';
      if (!content) {
        this.showFieldError('contentError', 'Content is required');
        isValid = false;
      }

      return isValid;
    },

    // Publish post
    publishPost: async function () {
      try {
        // Use FormData approach for testing
        const formData = new FormData();

        if (this.titleInput) formData.append('title', this.titleInput.value.trim());
        if (this.categorySelect) formData.append('category_id', this.categorySelect.value);
        if (this.statusSelect) formData.append('status', this.statusSelect.value);
        if (this.excerptTextarea) formData.append('excerpt', this.excerptTextarea.value.trim());
        if (this.contentTextarea) formData.append('content', this.contentTextarea.value.trim());

        formData.append('tags', JSON.stringify(this.tags));

        // Use flexible endpoint for testing
        const response = await fetch(this.apiBaseUrl + '/posts/create-flexible.php', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await response.json();

        if (data.success || data.status === 'success') {
          this.showAlert('Post published successfully!', 'success');
          setTimeout(() => {
            window.location.href = '../home/home.html';
          }, 2000);
        } else {
          throw new Error(data.error || 'Failed to publish post');
        }
      } catch (error) {
        console.error('Error publishing post:', error);
        this.showAlert('Failed to publish post. Please try again.', 'error');
      }
    },

    // Save draft
    saveDraft: async function () {
      try {
        // Use FormData approach for testing
        const formData = new FormData();

        if (this.titleInput) formData.append('title', this.titleInput.value.trim());
        if (this.categorySelect) formData.append('category_id', this.categorySelect.value);
        formData.append('status', 'draft');
        if (this.excerptTextarea) formData.append('excerpt', this.excerptTextarea.value.trim());
        if (this.contentTextarea) formData.append('content', this.contentTextarea.value.trim());

        formData.append('tags', JSON.stringify(this.tags));

        // Use flexible endpoint for testing
        const response = await fetch(this.apiBaseUrl + '/posts/create-flexible.php', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await response.json();

        if (data.success || data.status === 'success') {
          this.showAlert('Draft saved successfully!', 'success');
        } else {
          throw new Error(data.error || 'Failed to save draft');
        }
      } catch (error) {
        console.error('Error saving draft:', error);
        this.showAlert('Failed to save draft.', 'error');
      }
    },

    // Tag management
    addTag: function () {
      if (!this.tagsInput) return;

      const tagText = this.tagsInput.value.trim().replace(',', '');

      if (tagText && !this.tags.includes(tagText) && this.tags.length < 10) {
        this.tags.push(tagText);
        this.renderTags();
        this.tagsInput.value = '';
      }
    },

    removeTag: function (index) {
      this.tags.splice(index, 1);
      this.renderTags();
    },

    renderTags: function () {
      if (!this.tagsContainer) return;

      this.tagsContainer.innerHTML = '';

      this.tags.forEach((tag, index) => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.innerHTML = tag + '<button type="button" class="tag-remove" onclick="createPost.removeTag(' + index + ')"><i class="fas fa-times"></i></button>';
        this.tagsContainer.appendChild(tagElement);
      });
    },

    // Preview modal
    showPreview: function () {
      this.updatePreviewContent();
      if (this.previewModal) {
        this.previewModal.classList.remove('hidden');
      }
    },

    updatePreviewContent: function () {
      const previewTitle = document.getElementById('previewTitle');
      if (previewTitle && this.titleInput) {
        previewTitle.textContent = this.titleInput.value || 'Untitled Post';
      }

      const previewContent = document.getElementById('previewContent');
      if (previewContent && this.contentTextarea) {
        const content = this.contentTextarea.value.trim();
        previewContent.innerHTML = content.replace(/\n/g, '<br>') || 'No content yet...';
      }
    },

    closeModal: function () {
      if (this.previewModal) {
        this.previewModal.classList.add('hidden');
      }
    },

    // Character counters
    initCharacterCounters: function () {
      this.updateCharCount('title');
      this.updateCharCount('excerpt');
    },

    updateCharCount: function (field) {
      let input, counter, maxLength;

      if (field === 'title') {
        input = this.titleInput;
        counter = document.getElementById('titleCount');
        maxLength = 200;
      } else if (field === 'excerpt') {
        input = this.excerptTextarea;
        counter = document.getElementById('excerptCount');
        maxLength = 300;
      }

      if (!input || !counter) return;

      const currentLength = input.value.length;
      counter.textContent = currentLength;
    },

    // User interface helpers
    toggleUserDropdown: function () {
      const dropdown = document.getElementById('userDropdown');
      if (!dropdown) return;

      const isVisible = dropdown.style.opacity === '1';
      dropdown.style.opacity = isVisible ? '0' : '1';
      dropdown.style.visibility = isVisible ? 'hidden' : 'visible';
    },

    closeUserDropdown: function () {
      const dropdown = document.getElementById('userDropdown');
      if (!dropdown) return;

      dropdown.style.opacity = '0';
      dropdown.style.visibility = 'hidden';
    },

    // Utility functions
    showAlert: function (message, type) {
      if (!this.alertContainer) return;

      const alert = document.createElement('div');
      alert.className = 'alert ' + type;
      alert.innerHTML = '<i class="fas fa-info-circle"></i><span>' + message + '</span>';

      this.alertContainer.appendChild(alert);

      setTimeout(() => {
        if (alert.parentNode) {
          alert.remove();
        }
      }, 5000);
    },

    showFieldError: function (fieldId, message) {
      const errorElement = document.getElementById(fieldId);
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('active');
      }
    },

    clearFieldError: function (fieldId) {
      const errorElement = document.getElementById(fieldId);
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('active');
      }
    },

    clearErrors: function () {
      const errorElements = document.querySelectorAll('.form-error');
      errorElements.forEach(error => {
        error.textContent = '';
        error.classList.remove('active');
      });
    },

    cancelEditing: function () {
      if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        window.location.href = '../home/home.html';
      }
    },

    logout: async function () {
      try {
        await fetch(this.apiBaseUrl + '/auth/logout.php', {
          method: 'POST',
          credentials: 'include'
        });
        window.location.href = '../login/login.html';
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '../login/login.html';
      }
    },

    // Debug method to see what we're sending
    debugRequest: async function (formData) {
      try {
        const response = await fetch(this.apiBaseUrl + '/posts/debug.php', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        // Debug response logged in console
      } catch (error) {
        console.error('Debug request failed:', error);
      }
    }
  };

  // Make createPost globally available for onclick handlers
  window.createPost = createPost;

  // Initialize
  createPost.init();
});
