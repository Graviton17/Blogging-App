// BlogCraft - Post Detail Manager
document.addEventListener('DOMContentLoaded', function () {
  // Initialize the post detail functionality
  const postDetail = {
    // State
    currentPost: null,
    currentUser: null,
    comments: [],
    commentsPage: 1,
    commentsLoading: false,
    csrfToken: null,
    apiBaseUrl: typeof API_CONFIG !== 'undefined'
      ? API_CONFIG.BASE_URL
      : 'http://localhost/blogging-app/Backend/api',

    // DOM elements
    loadingContainer: document.getElementById('loadingContainer'),
    errorContainer: document.getElementById('errorContainer'),
    mainContent: document.getElementById('mainContent'),
    errorMessage: document.getElementById('errorMessage'),

    // Navigation elements
    navAuth: document.getElementById('navAuth'),
    navUser: document.getElementById('navUser'),
    userName: document.getElementById('userName'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    logoutBtn: document.getElementById('logoutBtn'),

    // Post elements
    pageTitle: document.getElementById('pageTitle'),
    metaDescription: document.getElementById('metaDescription'),
    breadcrumbCategory: document.getElementById('breadcrumbCategory'),
    breadcrumbTitle: document.getElementById('breadcrumbTitle'),
    postCategories: document.getElementById('postCategories'),
    postTitle: document.getElementById('postTitle'),
    authorName: document.getElementById('authorName'),
    postDate: document.getElementById('postDate'),
    readTime: document.getElementById('readTime'),
    viewCount: document.getElementById('viewCount'),
    likeBtn: document.getElementById('likeBtn'),
    likeCount: document.getElementById('likeCount'),
    shareBtn: document.getElementById('shareBtn'),
    postControls: document.getElementById('postControls'),
    editBtn: document.getElementById('editBtn'),
    deleteBtn: document.getElementById('deleteBtn'),
    postExcerpt: document.getElementById('postExcerpt'),
    postBody: document.getElementById('postBody'),
    postTags: document.getElementById('postTags'),

    // Comments elements
    commentsSection: document.getElementById('commentsSection'),
    commentsCount: document.getElementById('commentsCount'),
    commentFormContainer: document.getElementById('commentFormContainer'),
    commentForm: document.getElementById('commentForm'),
    commentText: document.getElementById('commentText'),
    commentCharCount: document.getElementById('commentCharCount'),
    loginPrompt: document.getElementById('loginPrompt'),
    commentsList: document.getElementById('commentsList'),
    loadMoreContainer: document.getElementById('loadMoreContainer'),
    loadMoreComments: document.getElementById('loadMoreComments'),

    // Share elements
    shareModal: document.getElementById('shareModal'),
    closeShareModal: document.getElementById('closeShareModal'),
    shareUrlInput: document.getElementById('shareUrlInput'),
    copyShareUrl: document.getElementById('copyShareUrl'),
    shareFacebook: document.getElementById('shareFacebook'),
    shareTwitter: document.getElementById('shareTwitter'),
    shareLinkedin: document.getElementById('shareLinkedin'),
    copyLink: document.getElementById('copyLink'),

    // Related posts
    relatedPosts: document.getElementById('relatedPosts'),
    relatedPostsGrid: document.getElementById('relatedPostsGrid'),

    // Alert container
    alertContainer: document.getElementById('alertContainer'),

    // Initialize
    init: function () {
      this.getPostIdFromUrl();
      this.checkAuthStatus();
      this.loadCSRFToken();
      this.setupEventListeners();
      this.loadPost();
    },

    // Get post ID from URL parameters
    getPostIdFromUrl: function () {
      const urlParams = new URLSearchParams(window.location.search);
      this.postId = urlParams.get('id');

      if (!this.postId) {
        this.showError('No post ID provided');
        return;
      }
    },

    // Setup event listeners
    setupEventListeners: function () {
      // User menu toggle
      const userBtn = document.getElementById('userBtn');
      if (userBtn) {
        userBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleUserDropdown();
        });
      }

      // Logout
      if (this.logoutBtn) {
        this.logoutBtn.addEventListener('click', () => this.logout());
      }

      // Like button
      if (this.likeBtn) {
        this.likeBtn.addEventListener('click', () => this.toggleLike());
      }

      // Share button
      if (this.shareBtn) {
        this.shareBtn.addEventListener('click', () => this.showShareModal());
      }

      // Edit button
      if (this.editBtn) {
        this.editBtn.addEventListener('click', () => this.editPost());
      }

      // Delete button
      if (this.deleteBtn) {
        this.deleteBtn.addEventListener('click', () => this.deletePost());
      }

      // Comment form
      if (this.commentForm) {
        this.commentForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.submitComment();
        });
      }

      // Comment text character count
      if (this.commentText) {
        this.commentText.addEventListener('input', () => {
          this.updateCharCount();
        });
      }

      // Load more comments
      if (this.loadMoreComments) {
        this.loadMoreComments.addEventListener('click', () => this.loadMoreCommentsHandler());
      }

      // Share modal
      if (this.closeShareModal) {
        this.closeShareModal.addEventListener('click', () => this.hideShareModal());
      }

      if (this.copyShareUrl) {
        this.copyShareUrl.addEventListener('click', () => this.copyUrlToClipboard());
      }

      if (this.copyLink) {
        this.copyLink.addEventListener('click', () => this.copyUrlToClipboard());
      }

      // Social share buttons
      if (this.shareFacebook) {
        this.shareFacebook.addEventListener('click', () => this.shareOnPlatform('facebook'));
      }

      if (this.shareTwitter) {
        this.shareTwitter.addEventListener('click', () => this.shareOnPlatform('twitter'));
      }

      if (this.shareLinkedin) {
        this.shareLinkedin.addEventListener('click', () => this.shareOnPlatform('linkedin'));
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        this.closeUserDropdown();
      });

      // Close modal when clicking outside
      if (this.shareModal) {
        this.shareModal.addEventListener('click', (e) => {
          if (e.target === this.shareModal) {
            this.hideShareModal();
          }
        });
      }
    },

    // Load CSRF token
    loadCSRFToken: async function () {
      try {
        const response = await fetch(this.apiBaseUrl + '/auth/csrf-token.php', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.success && (data.token || data.csrf_token)) {
          this.csrfToken = data.token || data.csrf_token;
        } else {
          console.error('Failed to load CSRF token:', data.error);
        }
      } catch (error) {
        console.error('Error loading CSRF token:', error);
      }
    },

    // Check authentication status
    checkAuthStatus: async function () {
      try {
        const response = await fetch(this.apiBaseUrl + '/auth/status.php', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.authenticated) {
          this.currentUser = data.user;
          this.showUserInterface();
        } else {
          this.showGuestInterface();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        this.showGuestInterface();
      }
    },

    // Show user interface
    showUserInterface: function () {
      if (this.navAuth) this.navAuth.classList.add('hidden');
      if (this.navUser) this.navUser.classList.remove('hidden');

      if (this.userName) this.userName.textContent = this.currentUser.username || this.currentUser.email;

      if (this.commentFormContainer) this.commentFormContainer.classList.remove('hidden');
      if (this.loginPrompt) this.loginPrompt.classList.add('hidden');
    },

    // Show guest interface
    showGuestInterface: function () {
      if (this.navAuth) this.navAuth.classList.remove('hidden');
      if (this.navUser) this.navUser.classList.add('hidden');

      if (this.commentFormContainer) this.commentFormContainer.classList.add('hidden');
      if (this.loginPrompt) this.loginPrompt.classList.remove('hidden');
    },

    // Load post data
    loadPost: async function () {
      try {
        this.showLoading();

        const apiUrl = `${this.apiBaseUrl}/posts/get.php?id=${this.postId}`;
        console.log('Fetching post from:', apiUrl);

        const response = await fetch(apiUrl, {
          credentials: 'include'
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load post`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        // Check for error in response
        if (data.error) {
          throw new Error(data.error);
        }

        // Verify post data exists
        if (!data.post) {
          throw new Error('Post data not found in response');
        }

        this.currentPost = data.post;
        console.log('Post loaded successfully:', this.currentPost.title);

        this.renderPost();
        this.loadComments();
        this.loadRelatedPosts();
        this.hideLoading();

      } catch (error) {
        console.error('Error loading post:', error);
        this.showError(error.message || 'Failed to load post');
      }
    },

    // Render post data
    renderPost: function () {
      const post = this.currentPost;

      // Safety check
      if (!post) {
        console.error('Cannot render post: post data is null or undefined');
        this.showError('Post data is missing');
        return;
      }

      // Update page metadata
      if (this.pageTitle) {
        this.pageTitle.textContent = `${post.title} - BlogCraft`;
      }

      if (this.metaDescription) {
        this.metaDescription.setAttribute('content', post.excerpt || post.title);
      }

      // Update breadcrumb
      if (this.breadcrumbCategory && post.categories && post.categories.length > 0) {
        this.breadcrumbCategory.textContent = post.categories[0].name;
      }

      if (this.breadcrumbTitle) {
        this.breadcrumbTitle.textContent = this.truncateText(post.title, 50);
      }

      // Render categories
      if (this.postCategories && post.categories) {
        this.postCategories.innerHTML = post.categories.map(category =>
          `<a href="../home/home.html?category=${encodeURIComponent(category.name)}" class="category-tag">${this.escapeHtml(category.name)}</a>`
        ).join('');
      }

      // Post title
      if (this.postTitle) {
        this.postTitle.textContent = post.title;
      }

      // Author info
      if (this.authorName) {
        this.authorName.textContent = post.author_name || 'Unknown Author';
      }

      // Post metadata
      if (this.postDate) {
        this.postDate.textContent = this.formatDate(post.created_at);
      }

      if (this.readTime) {
        this.readTime.textContent = this.calculateReadTime(post.content);
      }

      if (this.viewCount) {
        this.viewCount.textContent = post.view_count || 0;
      }

      // Like count and state
      if (this.likeCount) {
        this.likeCount.textContent = post.like_count || 0;
      }

      // Set like button state - ensure is_liked is defined
      if (this.likeBtn) {
        const isLiked = post.is_liked === true; // Ensure boolean
        if (isLiked) {
          this.likeBtn.classList.add('active');
          this.likeBtn.querySelector('i').className = 'fas fa-heart';
        } else {
          this.likeBtn.classList.remove('active');
          this.likeBtn.querySelector('i').className = 'far fa-heart';
        }

        // Disable like button if not logged in
        if (!this.currentUser) {
          this.likeBtn.disabled = false; // Keep enabled to show login message
        }
      }

      // Post controls (edit/delete for author)
      if (this.postControls && this.currentUser && post.author_id == this.currentUser.id) {
        this.postControls.classList.remove('hidden');
      }

      // Post excerpt
      if (this.postExcerpt && post.excerpt) {
        this.postExcerpt.innerHTML = this.escapeHtml(post.excerpt);
      } else if (this.postExcerpt) {
        this.postExcerpt.style.display = 'none';
      }

      // Post content
      if (this.postBody) {
        this.postBody.innerHTML = post.content;
      }

      // Post tags
      if (this.postTags && post.tags && post.tags.length > 0) {
        this.postTags.innerHTML = post.tags.map(tag =>
          `<a href="../home/home.html?tag=${encodeURIComponent(tag)}" class="tag">${this.escapeHtml(tag)}</a>`
        ).join('');
      }

      // Setup share URL
      if (this.shareUrlInput) {
        this.shareUrlInput.value = window.location.href;
      }
    },

    // Load comments
    loadComments: async function () {
      try {
        const response = await fetch(`${this.apiBaseUrl}/comments/list.php?post_id=${this.postId}&page=${this.commentsPage}`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.comments) {
          if (this.commentsPage === 1) {
            this.comments = data.comments;
          } else {
            this.comments = [...this.comments, ...data.comments];
          }

          this.renderComments();

          // Update comments count - use pagination object
          if (this.commentsCount && data.pagination) {
            this.commentsCount.textContent = data.pagination.total_comments || this.comments.length;
          }

          // Show/hide load more button - use pagination object
          if (this.loadMoreContainer && data.pagination) {
            if (data.pagination.has_next) {
              this.loadMoreContainer.classList.remove('hidden');
            } else {
              this.loadMoreContainer.classList.add('hidden');
            }
          }
        }
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    },

    // Render comments
    renderComments: function () {
      if (!this.commentsList) return;

      this.commentsList.innerHTML = this.comments.map(comment => `
                <div class="comment" data-comment-id="${comment.id}">
                    <div class="comment-header">
                        <div class="comment-meta">
                            <div class="comment-author">${this.escapeHtml(comment.user_name)}</div>
                            <div class="comment-date">${this.formatDate(comment.created_at)}</div>
                        </div>
                        <div class="comment-actions">
                            ${this.currentUser && comment.user_id == this.currentUser.id ? `
                                <button class="comment-action" onclick="postDetail.editComment(${comment.id})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="comment-action" onclick="postDetail.deleteComment(${comment.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            ` : ''}
                            <button class="comment-action" onclick="postDetail.likeComment(${comment.id})">
                                <i class="fas fa-heart"></i> ${comment.like_count || 0}
                            </button>
                        </div>
                    </div>
                    <div class="comment-content">
                        ${this.escapeHtml(comment.content)}
                    </div>
                </div>
            `).join('');
    },

    // Load related posts
    loadRelatedPosts: async function () {
      try {
        const response = await fetch(`${this.apiBaseUrl}/posts/list.php?category=${this.currentPost.categories[0]?.id || ''}&limit=3&exclude=${this.postId}`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.posts && data.posts.length > 0) {
          this.renderRelatedPosts(data.posts);
        } else {
          if (this.relatedPosts) {
            this.relatedPosts.style.display = 'none';
          }
        }
      } catch (error) {
        console.error('Error loading related posts:', error);
        if (this.relatedPosts) {
          this.relatedPosts.style.display = 'none';
        }
      }
    },

    // Render related posts
    renderRelatedPosts: function (posts) {
      if (!this.relatedPostsGrid) return;

      this.relatedPostsGrid.innerHTML = posts.map(post => `
                <article class="related-post">
                    <div class="related-post-content">
                        <a href="post-detail.html?id=${post.id}" class="related-post-title">${this.escapeHtml(post.title)}</a>
                        <p class="related-post-excerpt">${this.escapeHtml(this.truncateText(post.excerpt || '', 100))}</p>
                        <div class="related-post-meta">
                            <span>${this.formatDate(post.created_at)}</span>
                            <span>${post.view_count || 0} views</span>
                        </div>
                    </div>
                </article>
            `).join('');
    },

    // Submit comment
    submitComment: async function () {
      if (!this.currentUser) {
        this.showAlert('Please log in to comment', 'error');
        return;
      }

      const content = this.commentText.value.trim();
      if (!content) {
        this.showAlert('Please enter a comment', 'error');
        return;
      }

      // Ensure we have a CSRF token
      if (!this.csrfToken) {
        await this.loadCSRFToken();
        if (!this.csrfToken) {
          this.showAlert('Security token not available. Please refresh the page.', 'error');
          return;
        }
      }

      try {
        const response = await fetch(this.apiBaseUrl + '/comments/create.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            post_id: this.postId,
            content: content,
            csrf_token: this.csrfToken
          })
        });

        const data = await response.json();

        if (data.success) {
          this.commentText.value = '';
          this.updateCharCount();
          this.commentsPage = 1;
          this.loadComments();
          this.showAlert('Comment posted successfully!', 'success');
          // Reload CSRF token for next comment
          await this.loadCSRFToken();
        } else {
          throw new Error(data.error || 'Failed to post comment');
        }
      } catch (error) {
        console.error('Error posting comment:', error);
        this.showAlert('Failed to post comment', 'error');
      }
    },

    // Load more comments
    loadMoreCommentsHandler: function () {
      if (this.commentsLoading) return;

      this.commentsLoading = true;
      this.commentsPage++;

      this.loadComments().finally(() => {
        this.commentsLoading = false;
      });
    },

    // Toggle like
    toggleLike: async function () {
      if (!this.currentUser) {
        this.showAlert('Please log in to like posts', 'error');
        return;
      }

      try {
        const response = await fetch(this.apiBaseUrl + '/posts/like.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            post_id: this.postId
          })
        });

        const data = await response.json();

        if (data.success) {
          // Update like count and button state
          if (this.likeCount) {
            this.likeCount.textContent = data.like_count;
          }

          if (this.likeBtn) {
            if (data.liked) {
              this.likeBtn.classList.add('active');
              this.likeBtn.querySelector('i').className = 'fas fa-heart';
            } else {
              this.likeBtn.classList.remove('active');
              this.likeBtn.querySelector('i').className = 'far fa-heart';
            }
          }
        }
      } catch (error) {
        console.error('Error toggling like:', error);
        this.showAlert('Failed to update like', 'error');
      }
    },

    // Edit post
    editPost: function () {
      window.location.href = `../create-post/create-post.html?edit=${this.postId}`;
    },

    // Delete post
    deletePost: async function () {
      if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
      }

      try {
        const response = await fetch(this.apiBaseUrl + '/posts/delete.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            id: this.postId
          })
        });

        const data = await response.json();

        if (data.success) {
          this.showAlert('Post deleted successfully', 'success');
          setTimeout(() => {
            window.location.href = '../home/home.html';
          }, 2000);
        } else {
          throw new Error(data.error || 'Failed to delete post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        this.showAlert('Failed to delete post', 'error');
      }
    },

    // Share functionality
    showShareModal: function () {
      if (this.shareModal) {
        this.shareModal.classList.add('show');
      }
    },

    hideShareModal: function () {
      if (this.shareModal) {
        this.shareModal.classList.remove('show');
      }
    },

    shareOnPlatform: function (platform) {
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(this.currentPost.title);
      const text = encodeURIComponent(this.currentPost.excerpt || this.currentPost.title);

      let shareUrl = '';

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    },

    copyUrlToClipboard: async function () {
      try {
        await navigator.clipboard.writeText(window.location.href);
        this.showAlert('Link copied to clipboard!', 'success');
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showAlert('Link copied to clipboard!', 'success');
      }
    },

    // Utility functions
    showLoading: function () {
      if (this.loadingContainer) this.loadingContainer.classList.remove('hidden');
      if (this.errorContainer) this.errorContainer.classList.add('hidden');
      if (this.mainContent) this.mainContent.classList.add('hidden');
    },

    hideLoading: function () {
      if (this.loadingContainer) this.loadingContainer.classList.add('hidden');
      if (this.mainContent) this.mainContent.classList.remove('hidden');
    },

    showError: function (message) {
      if (this.loadingContainer) this.loadingContainer.classList.add('hidden');
      if (this.errorContainer) this.errorContainer.classList.remove('hidden');
      if (this.mainContent) this.mainContent.classList.add('hidden');

      if (this.errorMessage) {
        this.errorMessage.textContent = message;
      }
    },

    updateCharCount: function () {
      if (this.commentText && this.commentCharCount) {
        const count = this.commentText.value.length;
        this.commentCharCount.textContent = count;

        if (count > 900) {
          this.commentCharCount.style.color = 'var(--error)';
        } else if (count > 800) {
          this.commentCharCount.style.color = 'var(--warning)';
        } else {
          this.commentCharCount.style.color = 'var(--gray-500)';
        }
      }
    },

    toggleUserDropdown: function () {
      if (this.dropdownMenu) {
        this.dropdownMenu.classList.toggle('show');
      }
    },

    closeUserDropdown: function () {
      if (this.dropdownMenu) {
        this.dropdownMenu.classList.remove('show');
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
        window.location.href = '../login/login.html';
      }
    },

    showAlert: function (message, type = 'info') {
      if (!this.alertContainer) return;

      const alert = document.createElement('div');
      alert.className = `alert ${type}`;
      alert.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${this.escapeHtml(message)}</span>
            `;

      this.alertContainer.appendChild(alert);

      // Show alert
      setTimeout(() => {
        alert.classList.add('show');
      }, 100);

      // Hide alert after 5 seconds
      setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
          if (alert.parentNode) {
            alert.remove();
          }
        }, 300);
      }, 5000);
    },

    escapeHtml: function (text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    truncateText: function (text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substr(0, maxLength) + '...';
    },

    formatDate: function (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    calculateReadTime: function (content) {
      const wordsPerMinute = 200;
      const words = content.split(/\s+/).length;
      const minutes = Math.ceil(words / wordsPerMinute);
      return `${minutes} min read`;
    },

    // Comment actions (placeholder functions)
    editComment: function (commentId) {
      console.log('Edit comment:', commentId);
      this.showAlert('Comment editing not implemented yet', 'info');
    },

    deleteComment: function (commentId) {
      console.log('Delete comment:', commentId);
      this.showAlert('Comment deletion not implemented yet', 'info');
    },

    likeComment: function (commentId) {
      console.log('Like comment:', commentId);
      this.showAlert('Comment liking not implemented yet', 'info');
    }
  };

  // Make postDetail globally available
  window.postDetail = postDetail;

  // Initialize
  postDetail.init();
});