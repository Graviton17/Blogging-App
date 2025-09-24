// Create Post functionality with TinyMCE integration
class PostEditor {
  constructor() {
    this.form = document.getElementById('postForm');
    this.titleInput = document.getElementById('postTitle');
    this.categorySelect = document.getElementById('category');
    this.statusSelect = document.getElementById('status');
    this.tagsInput = document.getElementById('tagsInput');
    this.tagsContainer = document.getElementById('tagsContainer');
    this.excerptTextarea = document.getElementById('excerpt');
    this.contentTextarea = document.getElementById('content');
    this.featuredImageInput = document.getElementById('featuredImage');
    this.imageUploadArea = document.getElementById('imageUploadArea');
    this.imagePreview = document.getElementById('imagePreview');
    this.previewModal = document.getElementById('previewModal');
    this.alertContainer = document.getElementById('alertContainer');

    this.apiBaseUrl = '/Blogging-App/Backend/api';
    this.csrfToken = '';
    this.tags = [];
    this.editor = null;
    this.currentPostId = null;
    this.isDraft = false;

    this.init();
  }

  async init() {
    await this.fetchCSRFToken();
    await this.loadCategories();
    this.setupEventListeners();
    this.initializeEditor();
    this.checkAuthStatus();
    this.setupAutoSave();

    // Check if editing existing post
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('edit');
    if (postId) {
      await this.loadPost(postId);
    }
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

  async loadCategories() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/posts/categories.php`);
      const data = await response.json();

      if (data.success && data.categories) {
        this.populateCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  populateCategories(categories) {
    this.categorySelect.innerHTML = '<option value="">Select a category...</option>';

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      this.categorySelect.appendChild(option);
    });
  }

  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Header actions
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const previewBtn = document.getElementById('previewBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (saveDraftBtn) saveDraftBtn.addEventListener('click', () => this.saveDraft());
    if (previewBtn) previewBtn.addEventListener('click', () => this.showPreview());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.handleCancel());
    if (userMenuBtn) userMenuBtn.addEventListener('click', () => this.toggleUserMenu());
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());

    // User menu dropdown
    document.addEventListener('click', (e) => {
      const userDropdown = document.getElementById('userDropdown');
      if (!e.target.closest('.user-menu') && !userDropdown.classList.contains('hidden')) {
        userDropdown.classList.add('hidden');
      }
    });

    // Title character count
    this.titleInput.addEventListener('input', () => this.updateTitleCount());

    // Tags input
    this.tagsInput.addEventListener('keydown', (e) => this.handleTagInput(e));
    this.tagsInput.addEventListener('blur', () => this.addCurrentTag());

    // Excerpt character count
    this.excerptTextarea.addEventListener('input', () => this.updateExcerptCount());

    // Featured image upload
    this.featuredImageInput.addEventListener('change', (e) => this.handleImageSelect(e));
    this.imageUploadArea.addEventListener('click', () => this.featuredImageInput.click());
    this.imageUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.imageUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.imageUploadArea.addEventListener('drop', (e) => this.handleDrop(e));

    const changeImageBtn = document.getElementById('changeImageBtn');
    const removeImageBtn = document.getElementById('removeImageBtn');

    if (changeImageBtn) {
      changeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.featuredImageInput.click();
      });
    }

    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeImage();
      });
    }

    // Preview modal
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const modalOverlay = document.querySelector('.modal-overlay');

    if (closePreviewBtn) closePreviewBtn.addEventListener('click', () => this.closePreview());
    if (modalOverlay) modalOverlay.addEventListener('click', () => this.closePreview());

    // Status change
    this.statusSelect.addEventListener('change', () => this.updatePublishButton());

    // Real-time validation
    [this.titleInput, this.categorySelect, this.statusSelect].forEach(element => {
      element.addEventListener('blur', () => this.validateField(element));
      element.addEventListener('input', () => this.clearFieldError(element));
    });
  }

  initializeEditor() {
    tinymce.init({
      selector: '#content',
      height: 500,
      menubar: false,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample'
      ],
      toolbar: 'undo redo | blocks | ' +
        'bold italic forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | image link | codesample | help',
      content_style: 'body { font-family: Inter, sans-serif; font-size: 16px; line-height: 1.6; }',
      skin: 'oxide',
      content_css: 'default',
      branding: false,
      elementpath: false,
      resize: true,
      statusbar: true,
      paste_data_images: true,
      automatic_uploads: true,
      file_picker_types: 'image',
      file_picker_callback: (callback, value, meta) => {
        if (meta.filetype === 'image') {
          this.openImagePicker(callback);
        }
      },
      images_upload_handler: (blobInfo, success, failure) => {
        this.uploadEditorImage(blobInfo, success, failure);
      },
      setup: (editor) => {
        this.editor = editor;
        editor.on('change', () => {
          this.clearFieldError(this.contentTextarea);
        });
      }
    });
  }

  async checkAuthStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/status.php`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (!data.success || !data.user) {
        // User not logged in, redirect to login
        window.location.href = `/Blogging-App/Frontend/login/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      // Update user info in the UI
      this.updateUserInfo(data.user);

    } catch (error) {
      console.error('Auth check failed:', error);
      this.showAlert('Authentication error. Please log in again.', 'error');
      setTimeout(() => {
        window.location.href = '/Blogging-App/Frontend/login/login.html';
      }, 2000);
    }
  }

  updateUserInfo(user) {
    const previewAuthor = document.getElementById('previewAuthor');
    if (previewAuthor) {
      previewAuthor.textContent = user.first_name + ' ' + user.last_name;
    }
  }

  setupAutoSave() {
    // Auto-save draft every 30 seconds
    setInterval(() => {
      if (this.hasUnsavedChanges()) {
        this.saveDraft(true); // Silent save
      }
    }, 30000);

    // Save on page unload
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
        this.saveDraft(true);
      }
    });
  }

  hasUnsavedChanges() {
    return this.titleInput.value.trim() ||
      (this.editor && this.editor.getContent().trim()) ||
      this.tags.length > 0 ||
      this.excerptTextarea.value.trim();
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const publishBtn = document.getElementById('publishBtn');
    const btnText = publishBtn.querySelector('.btn-text');
    const btnLoader = publishBtn.querySelector('.btn-loader');

    publishBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';

    this.clearAlert();

    try {
      const formData = new FormData();

      // Basic post data
      formData.append('title', this.titleInput.value.trim());
      formData.append('content', this.editor ? this.editor.getContent() : this.contentTextarea.value);
      formData.append('excerpt', this.excerptTextarea.value.trim());
      formData.append('category_id', this.categorySelect.value);
      formData.append('status', this.statusSelect.value);
      formData.append('tags', JSON.stringify(this.tags));

      if (this.csrfToken) {
        formData.append('csrf_token', this.csrfToken);
      }

      // Featured image
      if (this.featuredImageInput.files[0]) {
        formData.append('featured_image', this.featuredImageInput.files[0]);
      }

      // If editing existing post
      if (this.currentPostId) {
        formData.append('id', this.currentPostId);
      }

      const endpoint = this.currentPostId ?
        `${this.apiBaseUrl}/posts/update.php` :
        `${this.apiBaseUrl}/posts/create.php`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        const action = this.currentPostId ? 'updated' : 'created';
        const status = this.statusSelect.value;

        let message = `Post ${action} successfully!`;
        if (status === 'published') {
          message += ' It is now live on your blog.';
        } else if (status === 'draft') {
          message += ' You can publish it later from your dashboard.';
        }

        this.showAlert(message, 'success');

        // Redirect after delay
        setTimeout(() => {
          if (status === 'published' && data.post && data.post.slug) {
            window.location.href = `/Blogging-App/Frontend/post/?slug=${data.post.slug}`;
          } else {
            window.location.href = '/Blogging-App/Frontend/home/home.html';
          }
        }, 2000);

      } else {
        this.showAlert(data.message || 'Failed to save post. Please try again.', 'error');

        // Handle field-specific errors
        if (data.errors) {
          Object.keys(data.errors).forEach(field => {
            this.showFieldError(field, data.errors[field]);
          });
        }
      }

    } catch (error) {
      console.error('Post submission error:', error);
      this.showAlert('An error occurred. Please try again.', 'error');
    } finally {
      publishBtn.disabled = false;
      btnText.style.display = 'flex';
      btnLoader.style.display = 'none';
    }
  }

  async saveDraft(silent = false) {
    if (!this.hasUnsavedChanges()) {
      if (!silent) {
        this.showAlert('No changes to save.', 'info');
      }
      return;
    }

    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const originalText = saveDraftBtn.innerHTML;

    if (!silent) {
      saveDraftBtn.disabled = true;
      saveDraftBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      this.clearAlert();
    }

    try {
      const formData = new FormData();

      formData.append('title', this.titleInput.value.trim());
      formData.append('content', this.editor ? this.editor.getContent() : this.contentTextarea.value);
      formData.append('excerpt', this.excerptTextarea.value.trim());
      formData.append('category_id', this.categorySelect.value);
      formData.append('status', 'draft');
      formData.append('tags', JSON.stringify(this.tags));

      if (this.csrfToken) {
        formData.append('csrf_token', this.csrfToken);
      }

      if (this.featuredImageInput.files[0]) {
        formData.append('featured_image', this.featuredImageInput.files[0]);
      }

      if (this.currentPostId) {
        formData.append('id', this.currentPostId);
      }

      const endpoint = this.currentPostId ?
        `${this.apiBaseUrl}/posts/update.php` :
        `${this.apiBaseUrl}/posts/create.php`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        if (!this.currentPostId && data.post && data.post.id) {
          this.currentPostId = data.post.id;
          // Update URL to include edit parameter
          const url = new URL(window.location);
          url.searchParams.set('edit', this.currentPostId);
          window.history.replaceState({}, '', url);
        }

        if (!silent) {
          this.showAlert('Draft saved successfully!', 'success');
        }
        this.isDraft = true;
      } else {
        if (!silent) {
          this.showAlert(data.message || 'Failed to save draft.', 'error');
        }
      }

    } catch (error) {
      console.error('Draft save error:', error);
      if (!silent) {
        this.showAlert('Failed to save draft.', 'error');
      }
    } finally {
      if (!silent) {
        saveDraftBtn.disabled = false;
        saveDraftBtn.innerHTML = originalText;
      }
    }
  }

  async loadPost(postId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/posts/get.php?id=${postId}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.post) {
        const post = data.post;

        // Populate form fields
        this.titleInput.value = post.title || '';
        this.categorySelect.value = post.category_id || '';
        this.statusSelect.value = post.status || 'draft';
        this.excerptTextarea.value = post.excerpt || '';

        // Set content in editor
        if (this.editor) {
          this.editor.setContent(post.content || '');
        } else {
          this.contentTextarea.value = post.content || '';
        }

        // Set tags
        if (post.tags) {
          this.tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags || '[]');
          this.renderTags();
        }

        // Set featured image
        if (post.featured_image) {
          this.displayImagePreview(post.featured_image);
        }

        this.currentPostId = postId;
        this.updateTitleCount();
        this.updateExcerptCount();
        this.updatePublishButton();

        // Update page title
        document.title = `Edit: ${post.title || 'Untitled'} - BlogCraft`;

      } else {
        this.showAlert('Post not found or you do not have permission to edit it.', 'error');
        setTimeout(() => {
          window.location.href = '/Blogging-App/Frontend/home/home.html';
        }, 2000);
      }

    } catch (error) {
      console.error('Failed to load post:', error);
      this.showAlert('Failed to load post.', 'error');
    }
  }

  validateForm() {
    let isValid = true;

    this.clearAllErrors();

    // Validate title
    if (!this.titleInput.value.trim()) {
      this.showFieldError('postTitle', 'Title is required');
      isValid = false;
    }

    // Validate content
    const content = this.editor ? this.editor.getContent() : this.contentTextarea.value;
    if (!content.trim()) {
      this.showFieldError('content', 'Content is required');
      isValid = false;
    }

    // Validate category
    if (!this.categorySelect.value) {
      this.showFieldError('category', 'Please select a category');
      isValid = false;
    }

    return isValid;
  }

  validateField(element) {
    const fieldName = element.id;

    switch (fieldName) {
      case 'postTitle':
        if (!element.value.trim()) {
          this.showFieldError(fieldName, 'Title is required');
          return false;
        }
        break;
      case 'category':
        if (!element.value) {
          this.showFieldError(fieldName, 'Please select a category');
          return false;
        }
        break;
    }

    this.clearFieldError(fieldName);
    return true;
  }

  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  clearAllErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(element => {
      element.textContent = '';
      element.style.display = 'none';
    });
  }

  updateTitleCount() {
    const count = this.titleInput.value.length;
    const counter = document.getElementById('titleCount');
    const countElement = document.querySelector('.title-count');

    if (counter) counter.textContent = count;

    if (countElement) {
      countElement.className = 'char-count title-count';
      if (count > 180) countElement.classList.add('warning');
      if (count > 200) countElement.classList.add('error');
    }
  }

  updateExcerptCount() {
    const count = this.excerptTextarea.value.length;
    const counter = document.getElementById('excerptCount');
    const countElement = document.querySelector('.excerpt-count');

    if (counter) counter.textContent = count;

    if (countElement) {
      countElement.className = 'char-count excerpt-count';
      if (count > 270) countElement.classList.add('warning');
      if (count > 300) countElement.classList.add('error');
    }
  }

  updatePublishButton() {
    const publishBtn = document.getElementById('publishBtn');
    const publishText = document.getElementById('publishText');
    const status = this.statusSelect.value;

    if (publishText) {
      if (this.currentPostId) {
        publishText.textContent = 'Update Post';
      } else {
        switch (status) {
          case 'published':
            publishText.textContent = 'Publish Post';
            break;
          case 'draft':
            publishText.textContent = 'Save Draft';
            break;
          case 'private':
            publishText.textContent = 'Save Private';
            break;
          default:
            publishText.textContent = 'Save Post';
        }
      }
    }
  }

  handleTagInput(e) {
    const value = this.tagsInput.value.trim();

    if ((e.key === 'Enter' || e.key === ',') && value) {
      e.preventDefault();
      this.addTag(value);
    } else if (e.key === 'Backspace' && !value && this.tags.length > 0) {
      this.removeTag(this.tags.length - 1);
    }
  }

  addCurrentTag() {
    const value = this.tagsInput.value.trim();
    if (value) {
      this.addTag(value);
    }
  }

  addTag(tagName) {
    const normalizedTag = tagName.toLowerCase().trim();

    if (normalizedTag && !this.tags.includes(normalizedTag) && this.tags.length < 10) {
      this.tags.push(normalizedTag);
      this.tagsInput.value = '';
      this.renderTags();
    }
  }

  removeTag(index) {
    this.tags.splice(index, 1);
    this.renderTags();
  }

  renderTags() {
    this.tagsContainer.innerHTML = '';

    this.tags.forEach((tag, index) => {
      const tagElement = document.createElement('div');
      tagElement.className = 'tag-item';
      tagElement.innerHTML = `
                ${tag}
                <button type="button" class="tag-remove" onclick="postEditor.removeTag(${index})" title="Remove tag">
                    ×
                </button>
            `;
      this.tagsContainer.appendChild(tagElement);
    });
  }

  handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.processImageFile(file);
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    this.imageUploadArea.classList.add('dragover');
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.imageUploadArea.classList.remove('dragover');
  }

  handleDrop(e) {
    e.preventDefault();
    this.imageUploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.processImageFile(file);
      }
    }
  }

  processImageFile(file) {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      this.showAlert('Image file must be less than 5MB.', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showAlert('Please select a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.displayImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  displayImagePreview(imageSrc) {
    const previewImg = document.getElementById('previewImg');
    const uploadPlaceholder = this.imageUploadArea.querySelector('.upload-placeholder');

    previewImg.src = imageSrc;
    uploadPlaceholder.style.display = 'none';
    this.imagePreview.classList.remove('hidden');
  }

  removeImage() {
    this.featuredImageInput.value = '';
    this.imagePreview.classList.add('hidden');
    const uploadPlaceholder = this.imageUploadArea.querySelector('.upload-placeholder');
    uploadPlaceholder.style.display = 'flex';
  }

  openImagePicker(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        this.uploadEditorImage({
          blob: () => file,
          filename: () => file.name
        }, callback, (error) => {
          console.error('Image upload failed:', error);
        });
      }
    };
    input.click();
  }

  async uploadEditorImage(blobInfo, success, failure) {
    try {
      const formData = new FormData();
      formData.append('image', blobInfo.blob(), blobInfo.filename());

      if (this.csrfToken) {
        formData.append('csrf_token', this.csrfToken);
      }

      const response = await fetch(`${this.apiBaseUrl}/posts/upload-image.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.url) {
        success(data.url);
      } else {
        failure(data.message || 'Image upload failed');
      }

    } catch (error) {
      console.error('Image upload error:', error);
      failure('Image upload failed');
    }
  }

  showPreview() {
    const title = this.titleInput.value.trim() || 'Untitled Post';
    const content = this.editor ? this.editor.getContent() : this.contentTextarea.value;
    const excerpt = this.excerptTextarea.value.trim();
    const categoryText = this.categorySelect.options[this.categorySelect.selectedIndex]?.text || 'Uncategorized';
    const featuredImageSrc = this.imagePreview.classList.contains('hidden') ? '' :
      document.getElementById('previewImg').src;

    // Update preview content
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewContent').innerHTML = content;
    document.getElementById('previewCategory').textContent = categoryText;
    document.getElementById('previewDate').textContent = new Date().toLocaleDateString();

    // Show/hide excerpt
    const previewExcerpt = document.getElementById('previewExcerpt');
    if (excerpt) {
      previewExcerpt.textContent = excerpt;
      previewExcerpt.classList.remove('hidden');
    } else {
      previewExcerpt.classList.add('hidden');
    }

    // Show/hide featured image
    const previewFeaturedImage = document.getElementById('previewFeaturedImage');
    if (featuredImageSrc) {
      previewFeaturedImage.innerHTML = `<img src="${featuredImageSrc}" alt="Featured image">`;
      previewFeaturedImage.classList.remove('hidden');
    } else {
      previewFeaturedImage.classList.add('hidden');
    }

    // Show tags
    const previewTags = document.getElementById('previewTags');
    previewTags.innerHTML = '';
    this.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'preview-tag';
      tagElement.textContent = tag;
      previewTags.appendChild(tagElement);
    });

    this.previewModal.classList.remove('hidden');
  }

  closePreview() {
    this.previewModal.classList.add('hidden');
  }

  toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
  }

  handleCancel() {
    if (this.hasUnsavedChanges()) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        window.location.href = '/Blogging-App/Frontend/home/home.html';
      }
    } else {
      window.location.href = '/Blogging-App/Frontend/home/home.html';
    }
  }

  async handleLogout() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/logout.php`, {
        method: 'POST',
        credentials: 'include'
      });

      window.location.href = '/Blogging-App/Frontend/home/home.html';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/Blogging-App/Frontend/home/home.html';
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

    // Auto-hide success and info messages
    if (type === 'success' || type === 'info') {
      setTimeout(() => this.clearAlert(), 5000);
    }
  }

  clearAlert() {
    this.alertContainer.innerHTML = '';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.postEditor = new PostEditor();
});

// Global error handler
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});