# 📝 Blogging App

[![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-blue)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-orange)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success)]()

A modern, full-featured blogging platform built with vanilla PHP and JavaScript. Create, manage, and share your stories with a powerful content management system.

![Blogging App Banner](assets/images/banner.png)

---

## ✨ Features at a Glance

🔐 **Secure Authentication** - User registration, login, password reset, email verification  
✍️ **Rich Post Editor** - Create beautiful posts with formatting, images, and categories  
💬 **Comments System** - Engage with readers through nested comments and replies  
❤️ **Social Features** - Like posts, share on social media, follow authors  
👤 **User Profiles** - Customizable profiles with avatars and social links  
⚙️ **Settings Management** - Control notifications, privacy, and account preferences  
📊 **Analytics** - Track views, likes, and engagement on your posts  
🔍 **Search & Filter** - Find content easily with powerful search and filtering  
📱 **Responsive Design** - Perfect experience on desktop, tablet, and mobile  
🛡️ **Security First** - CSRF protection, XSS prevention, SQL injection protection

---

## 🚀 Quick Start

### Prerequisites

- **XAMPP** (Apache, MySQL, PHP 7.4+)
- **Git**
- Modern web browser

### Installation

```bash
# 1. Clone the repository
cd /opt/lampp/htdocs
git clone https://github.com/Graviton17/Blogging-App.git
cd Blogging-App

# 2. Create database
# Open http://localhost/phpmyadmin
# Create database: blog_app
# Import: database/blog_app.sql

# 3. Configure
# Edit config/database.php with your credentials

# 4. Access application
# Home: http://localhost/Blogging-App/Frontend/home/home.html
```

**Detailed installation guide**: [docs/website-description.md](docs/website-description.md)

---

## 📸 Screenshots

### Home Page

![Home Page](screenshots/home.png)

### Post Creation

![Create Post](screenshots/create-post.png)

### User Profile

![Profile](screenshots/profile.png)

---

## 🏗️ Technology Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend**  | PHP 7.4+                       |
| **Database** | MySQL 5.7+                     |
| **Server**   | Apache 2.4+                    |
| **Icons**    | Font Awesome                   |
| **Fonts**    | Google Fonts (Inter)           |

---

## 📁 Project Structure

```
Blogging-App/
├── Backend/              # Server-side code
│   ├── api/             # REST API endpoints
│   ├── models/          # Data models
│   ├── utils/           # Utility classes
│   └── includes/        # Configuration
├── Frontend/            # Client-side code
│   ├── home/            # Landing page
│   ├── login/           # Authentication
│   ├── create-post/     # Post editor
│   ├── post-detail/     # Single post view
│   ├── profile/         # User profile
│   ├── settings/        # User settings
│   └── assets/          # CSS, JS, images
├── config/              # Configuration files
├── database/            # SQL schemas & seeds
├── docs/                # Documentation
├── uploads/             # User uploads
└── logs/                # Application logs
```

---

## 🎯 Key Features

### For Authors

- ✍️ **Rich Text Editor** - Create stunning posts with formatting
- 📝 **Draft Management** - Save and edit drafts before publishing
- ⏰ **Schedule Posts** - Plan your content calendar
- 📊 **Post Analytics** - Track views, likes, and engagement
- 🏷️ **Categories & Tags** - Organize your content
- 💬 **Comment Moderation** - Manage comments on your posts

### For Readers

- 🔍 **Discover Content** - Browse by category, search, filter
- ❤️ **Engage** - Like posts and comments
- 💬 **Discuss** - Comment and reply to conversations
- 🔗 **Share** - Share on Twitter, Facebook, LinkedIn, WhatsApp
- 👤 **Follow** - Keep track of your favorite authors
- 📚 **Reading List** - Save posts for later

### For Admins

- 👥 **User Management** - Manage users and roles
- 🛡️ **Moderation** - Moderate all content site-wide
- 📊 **Analytics** - Site-wide statistics
- ⚙️ **Configuration** - System settings control

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ CSRF token protection
- ✅ XSS prevention
- ✅ SQL injection protection
- ✅ Rate limiting
- ✅ Secure session management
- ✅ Input validation and sanitization
- ✅ Security audit logging

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Complete Website Documentation](docs/website-description.md)** - Full feature documentation
- **[API Documentation](docs/website-description.md#api-documentation)** - REST API reference
- **[Installation Guide](docs/website-description.md#installation-guide)** - Step-by-step setup
- **[Configuration](docs/website-description.md#configuration)** - Configuration options
- **[Deployment](docs/website-description.md#deployment)** - Production deployment guide
- **[Troubleshooting](docs/website-description.md#troubleshooting)** - Common issues and solutions

---

## 🔧 Configuration

### Database Configuration

Edit `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'blog_app');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### Application Configuration

Edit `config/app.php`:

```php
define('APP_ENV', 'development'); // development | production
define('APP_URL', 'http://localhost/Blogging-App/Frontend');
define('API_URL', 'http://localhost/Blogging-App/Backend/api');
```

---

## 🧪 Testing

### Manual Testing

```bash
# Test database connection
php test-database.php

# Expected output: ✅ Database connection successful!
```

### Test User Accounts

After installation, create test accounts via sign-up page, then update role:

```sql
-- Make user an admin
UPDATE users SET role = 'admin' WHERE username = 'your_username';

-- Make user an author
UPDATE users SET role = 'author' WHERE username = 'your_username';
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Update `APP_ENV` to `'production'`
- [ ] Set production URLs
- [ ] Configure database credentials
- [ ] Enable HTTPS
- [ ] Set up email SMTP
- [ ] Configure backups
- [ ] Set up monitoring

See [Deployment Guide](docs/website-description.md#deployment) for details.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Testing
- `chore:` - Maintenance

---

## 🐛 Bug Reports

Found a bug? Please report it:

1. Check [existing issues](https://github.com/Graviton17/Blogging-App/issues)
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details

---

## 📝 Changelog

### Version 1.0.0 (Current)

**Features:**

- ✅ User authentication and authorization
- ✅ Post creation, editing, and deletion
- ✅ Comments system with nested replies
- ✅ Like functionality for posts and comments
- ✅ User profiles and settings
- ✅ Categories and tags
- ✅ Search and filtering
- ✅ Responsive design
- ✅ Security features (CSRF, XSS, SQL injection protection)

**Bug Fixes:**

- ✅ Fixed duplicate require_once statements
- ✅ Fixed missing FileUpload.php dependency
- ✅ Fixed CSRF validation in create-flexible.php
- ✅ Fixed debug console.log statements

---

## 🗺️ Roadmap

### Version 1.1 (Planned)

- [ ] Email notifications system
- [ ] Advanced search with filters
- [ ] Post bookmarking
- [ ] User following system
- [ ] Progressive Web App (PWA)

### Version 1.2 (Future)

- [ ] Multi-language support
- [ ] Dark mode
- [ ] Analytics dashboard
- [ ] API documentation (Swagger)
- [ ] Two-factor authentication

### Version 2.0 (Future)

- [ ] GraphQL API
- [ ] Real-time notifications
- [ ] Video posts
- [ ] AI-powered recommendations

---

## 📊 Stats

- **Lines of Code**: ~15,000
- **Database Tables**: 11
- **API Endpoints**: 25+
- **Frontend Pages**: 9
- **Languages**: PHP, JavaScript, HTML, CSS, SQL

---

## 👨‍💻 Authors

- **Krish Kalola** - _Initial work_ - [Graviton17](https://github.com/Graviton17)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- PHP and MySQL communities
- Apache HTTP Server
- XAMPP development environment
- All contributors and testers

---

## 📞 Support

- 📧 Email: support@bloggingapp.com
- 🐛 Issues: [GitHub Issues](https://github.com/Graviton17/Blogging-App/issues)
- 📖 Documentation: [docs/website-description.md](docs/website-description.md)

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

<p align="center">Made with ❤️ by Krish Kalola</p>

<p align="center">
  <a href="https://github.com/Graviton17/Blogging-App">View Project</a>
  ·
  <a href="https://github.com/Graviton17/Blogging-App/issues">Report Bug</a>
  ·
  <a href="https://github.com/Graviton17/Blogging-App/issues">Request Feature</a>
</p>
