# API Documentation - Blogging App

## 🌐 API Overview

This document outlines all the PHP backend API endpoints for the blogging application. All APIs follow RESTful conventions and return JSON responses.

## 🔗 Base URL

```
http://localhost/blogging-app/backend/api/
```

## 📋 Response Format

All API responses follow this standard format:

```json
{
    "success": boolean,
    "message": "string",
    "data": object|array|null,
    "errors": array|null,
    "pagination": object|null
}
```

## 🔐 Authentication

Most endpoints require authentication via session cookies or JWT tokens.

### Authentication Headers

```
Cookie: PHPSESSID=session_id_here
// OR
Authorization: Bearer jwt_token_here
```

---

## 👤 Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### POST /auth/login

Authenticate user and create session.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123",
  "remember_me": true
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "author"
    },
    "session_id": "abc123xyz"
  }
}
```

### POST /auth/logout

End user session.

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/forgot-password

Request password reset.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

### POST /auth/reset-password

Reset password with token.

**Request Body:**

```json
{
  "token": "reset_token_here",
  "password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

---

## 👥 User Endpoints

### GET /users/profile

Get current user's profile.

**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "author",
    "profile": {
      "bio": "Tech enthusiast and blogger",
      "avatar_url": "/uploads/avatars/user_1.jpg",
      "website_url": "https://johndoe.com",
      "location": "New York, USA"
    }
  }
}
```

### PUT /users/profile

Update user profile.

**Authentication:** Required

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Updated bio",
  "website_url": "https://newsite.com",
  "location": "Los Angeles, CA"
}
```

### POST /users/upload-avatar

Upload profile avatar.

**Authentication:** Required
**Content-Type:** multipart/form-data

**Request Body:**

```
avatar: [file]
```

### GET /users/{id}

Get public user profile.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "profile": {
      "bio": "Tech enthusiast",
      "avatar_url": "/uploads/avatars/user_1.jpg",
      "website_url": "https://johndoe.com"
    },
    "posts_count": 15,
    "joined_date": "2023-01-15"
  }
}
```

---

## 📝 Posts Endpoints

### GET /posts

Get all published posts with pagination and filters.

**Query Parameters:**

- `page` (int): Page number (default: 1)
- `limit` (int): Posts per page (default: 10, max: 50)
- `category` (string): Filter by category slug
- `tag` (string): Filter by tag slug
- `author` (string): Filter by author username
- `search` (string): Search in title and content
- `sort` (string): Sort by (latest, popular, oldest)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Getting Started with PHP",
      "slug": "getting-started-with-php",
      "excerpt": "Learn the basics of PHP programming...",
      "featured_image": "/uploads/images/post_1.jpg",
      "author": {
        "id": 1,
        "username": "johndoe",
        "avatar_url": "/uploads/avatars/user_1.jpg"
      },
      "categories": ["Technology", "Programming"],
      "tags": ["php", "beginner"],
      "view_count": 150,
      "like_count": 25,
      "comment_count": 8,
      "published_at": "2023-10-15T14:30:00Z",
      "reading_time": 5
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_posts": 47,
    "posts_per_page": 10
  }
}
```

### GET /posts/{id}

Get single post by ID.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Getting Started with PHP",
    "slug": "getting-started-with-php",
    "content": "Full post content here...",
    "excerpt": "Learn the basics...",
    "featured_image": "/uploads/images/post_1.jpg",
    "author": {
      "id": 1,
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "/uploads/avatars/user_1.jpg"
    },
    "categories": [{ "id": 1, "name": "Technology", "slug": "technology" }],
    "tags": [{ "id": 1, "name": "PHP", "slug": "php" }],
    "view_count": 150,
    "like_count": 25,
    "comment_count": 8,
    "is_liked": false,
    "published_at": "2023-10-15T14:30:00Z",
    "updated_at": "2023-10-15T16:20:00Z"
  }
}
```

### POST /posts

Create new post.

**Authentication:** Required (Author role)

**Request Body:**

```json
{
  "title": "New Blog Post",
  "content": "Full post content here...",
  "excerpt": "Short description...",
  "category_ids": [1, 2],
  "tags": ["php", "tutorial"],
  "status": "published",
  "visibility": "public",
  "featured_image": "/uploads/images/new_post.jpg"
}
```

### PUT /posts/{id}

Update existing post.

**Authentication:** Required (Author of post or Admin)

**Request Body:**

```json
{
  "title": "Updated Post Title",
  "content": "Updated content...",
  "excerpt": "Updated excerpt...",
  "category_ids": [1, 3],
  "tags": ["php", "advanced"],
  "status": "published"
}
```

### DELETE /posts/{id}

Delete post.

**Authentication:** Required (Author of post or Admin)

**Response (200):**

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### GET /posts/my-posts

Get current user's posts.

**Authentication:** Required

**Query Parameters:**

- `page` (int): Page number
- `limit` (int): Posts per page
- `status` (string): Filter by status (draft, published, archived)

### POST /posts/{id}/like

Like/unlike a post.

**Authentication:** Required

**Response (200):**

```json
{
  "success": true,
  "message": "Post liked successfully",
  "data": {
    "is_liked": true,
    "like_count": 26
  }
}
```

### POST /posts/upload-image

Upload image for post content.

**Authentication:** Required
**Content-Type:** multipart/form-data

**Request Body:**

```
image: [file]
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "url": "/uploads/images/content_image_123.jpg",
    "filename": "content_image_123.jpg"
  }
}
```

---

## 💬 Comments Endpoints

### GET /posts/{id}/comments

Get comments for a specific post.

**Query Parameters:**

- `page` (int): Page number (default: 1)
- `limit` (int): Comments per page (default: 20)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "Great article!",
      "author": {
        "id": 2,
        "username": "jane_doe",
        "avatar_url": "/uploads/avatars/user_2.jpg"
      },
      "created_at": "2023-10-15T15:30:00Z",
      "replies": [
        {
          "id": 2,
          "content": "Thanks!",
          "author": {
            "id": 1,
            "username": "johndoe",
            "avatar_url": "/uploads/avatars/user_1.jpg"
          },
          "created_at": "2023-10-15T16:00:00Z"
        }
      ]
    }
  ]
}
```

### POST /posts/{id}/comments

Add comment to post.

**Authentication:** Required

**Request Body:**

```json
{
  "content": "This is my comment",
  "parent_id": null
}
```

### PUT /comments/{id}

Update comment.

**Authentication:** Required (Comment author or Admin)

**Request Body:**

```json
{
  "content": "Updated comment content"
}
```

### DELETE /comments/{id}

Delete comment.

**Authentication:** Required (Comment author or Admin)

---

## 🏷️ Categories & Tags Endpoints

### GET /categories

Get all active categories.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Tech-related posts",
      "color": "#007bff",
      "post_count": 15
    }
  ]
}
```

### GET /tags

Get popular tags.

**Query Parameters:**

- `limit` (int): Number of tags to return (default: 20)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "PHP",
      "slug": "php",
      "usage_count": 25
    }
  ]
}
```

### GET /tags/search

Search tags by name.

**Query Parameters:**

- `q` (string): Search query

---

## 🔍 Search Endpoints

### GET /search

Global search across posts.

**Query Parameters:**

- `q` (string): Search query
- `type` (string): Search type (posts, users, all)
- `page` (int): Page number
- `limit` (int): Results per page

**Response (200):**

```json
{
    "success": true,
    "data": {
        "posts": [...],
        "users": [...],
        "total_results": 25
    }
}
```

---

## 📊 Admin Endpoints

### GET /admin/dashboard

Get admin dashboard statistics.

**Authentication:** Required (Admin role)

**Response (200):**

```json
{
    "success": true,
    "data": {
        "total_posts": 150,
        "total_users": 50,
        "total_comments": 300,
        "pending_comments": 5,
        "recent_posts": [...],
        "recent_users": [...]
    }
}
```

### GET /admin/posts

Get all posts for admin management.

**Authentication:** Required (Admin role)

**Query Parameters:**

- `status` (string): Filter by status
- `page` (int): Page number
- `limit` (int): Posts per page

### PUT /admin/comments/{id}/approve

Approve pending comment.

**Authentication:** Required (Admin role)

### DELETE /admin/comments/{id}

Delete comment (admin).

**Authentication:** Required (Admin role)

---

## ⚙️ Settings Endpoints

### GET /settings

Get public site settings.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "site_title": "My Blogging App",
    "site_description": "A modern blogging platform",
    "posts_per_page": 10,
    "allow_registration": true
  }
}
```

---

## 📤 File Upload Guidelines

### Supported File Types

- **Images**: jpg, jpeg, png, gif, webp (max 5MB)
- **Documents**: pdf (max 10MB)

### Upload Paths

- Avatars: `/uploads/avatars/`
- Post images: `/uploads/images/`
- Media files: `/uploads/media/`

---

## 🚨 Error Codes

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

---

## 🔄 Rate Limiting

- **General API**: 100 requests per minute per IP
- **Authentication**: 5 login attempts per minute per IP
- **File Upload**: 10 uploads per minute per user

---

## 🧪 Testing

Use tools like Postman or curl to test the API endpoints:

```bash
# Register new user
curl -X POST http://localhost/blogging-app/backend/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","confirm_password":"password123"}'

# Get posts
curl -X GET "http://localhost/blogging-app/backend/api/posts?page=1&limit=10"

# Login
curl -X POST http://localhost/blogging-app/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Create post (authenticated)
curl -X POST http://localhost/blogging-app/backend/api/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"My New Post","content":"Post content here...","status":"published"}'
```
