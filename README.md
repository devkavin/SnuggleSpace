# 🎬 SnuggleSpace - Couples' Entertainment Companion

<div align="center">

![SnuggleSpace Logo](docs/screenshots/logo.png)

**A modern web application for couples to discover, track, and enjoy entertainment together**

[![Laravel](https://img.shields.io/badge/Laravel-10.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-1.x-purple.svg)](https://inertiajs.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org)

[Live Demo](#) • [Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation)

</div>

---

## 📖 About SnuggleSpace

SnuggleSpace is a modern web application designed specifically for couples who love watching movies, TV series, and anime together. It provides a shared platform to discover, track, and manage your entertainment journey as a couple.

### ✨ Key Features

- **🎯 Shared Watch Lists** - Create and manage watch lists together
- **💕 Partnership System** - Connect with your partner and share experiences
- **💌 Love Notes** - Send sweet messages to each other
- **🎲 Entertainment Spinner** - Let fate decide what to watch next
- **📊 Progress Tracking** - Monitor your watching progress and ratings
- **🎨 Beautiful UI** - Modern, responsive design with smooth animations

---

## 🖼️ Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing-page.png)
*Welcome to SnuggleSpace - Your couples' entertainment companion*

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Main dashboard showing watch lists, partnerships, and recent activity*

### Watch List Management
![Watch List](docs/screenshots/watch-list.png)
*Add, edit, and track your entertainment items*

### Partnership System
![Partnerships](docs/screenshots/partnerships.png)
*Connect with your partner and manage your relationship*

### Love Notes
![Love Notes](docs/screenshots/notes.png)
*Send and receive sweet messages from your partner*

### Entertainment Spinner
![Spinner](docs/screenshots/spinner.png)
*Let the spinner decide your next watch!*

### Mobile Responsive
![Mobile](docs/screenshots/mobile.png)
*Fully responsive design that works on all devices*

---

## 🚀 Features

### 🎯 Watch List Management
- Add movies, TV series, and anime to your watch list
- Track watching status (Plan to Watch, Watching, Completed, Dropped)
- Rate and review your entertainment
- Add genres, platforms, and descriptions
- View your partner's watch list

### 💕 Partnership System
- Send partnership requests to your significant other
- Accept or reject partnership requests
- View partnership status and history
- Shared features when partnered

### 💌 Love Notes
- Send colorful, personalized messages to your partner
- Mark messages as read/unread
- View message history
- Real-time notifications

### 🎲 Entertainment Spinner
- Random selection from your watch lists
- Filter by entertainment type (movies, TV series, anime)
- Track spinner history
- View statistics and game results

### 📊 Progress Tracking
- Monitor your watching progress
- View completion statistics
- Track ratings and reviews
- Compare preferences with your partner

---

## 🛠️ Tech Stack

### Backend
- **Laravel 11** - PHP framework for robust backend development
- **PostgreSQL** - Reliable database with Supabase hosting
- **Laravel Sanctum** - API authentication
- **Laravel Migrations** - Database schema management

### Frontend
- **React 18** - Modern JavaScript library for UI
- **Inertia.js** - Seamless SPA experience without API complexity
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server

### Deployment & Infrastructure
- **Vercel** - Serverless deployment platform
- **Supabase** - PostgreSQL database hosting
- **GitHub** - Version control and CI/CD

### Development Tools
- **Laravel Sail** - Docker development environment
- **PHPUnit** - Testing framework
- **ESLint & Prettier** - Code formatting and linting

---

## 📦 Installation

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL (or use Supabase)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/snugglespace.git
   cd snugglespace
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure database**
   ```bash
   # Update .env with your database credentials
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=snugglespace
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

6. **Run migrations**
   ```bash
   php artisan migrate
   ```

7. **Start development servers**
   ```bash
   # Terminal 1: Laravel development server
   php artisan serve
   
   # Terminal 2: Vite development server
   npm run dev
   ```

### Using Docker (Laravel Sail)

1. **Start the application**
   ```bash
   ./vendor/bin/sail up -d
   ```

2. **Install dependencies**
   ```bash
   ./vendor/bin/sail composer install
   ./vendor/bin/sail npm install
   ```

3. **Run migrations**
   ```bash
   ./vendor/bin/sail artisan migrate
   ```

4. **Build assets**
   ```bash
   ./vendor/bin/sail npm run build
   ```

### Production Deployment

1. **Build for production**
   ```bash
   npm run build
   composer install --optimize-autoloader --no-dev
   ```

2. **Configure environment variables**
   - Set `APP_ENV=production`
   - Configure database connection
   - Set up cache and session drivers

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

---

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and authentication
- **watch_lists** - Entertainment items and tracking
- **partnerships** - Couple relationships and status
- **notes** - Love messages between partners
- **spinner_games** - Entertainment spinner history

### Relationships
- Users can have multiple watch list items
- Partnerships connect two users
- Notes are sent between partners
- Spinner games track entertainment decisions

---

## 🔧 Configuration

### Environment Variables

```env
# Application
APP_NAME="SnuggleSpace"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.vercel.app

# Database
DB_CONNECTION=pgsql
DB_URL=your_supabase_connection_string

# Cache & Sessions
CACHE_DRIVER=database
SESSION_DRIVER=cookie
SESSION_SECURE_COOKIE=true

# Vercel Specific
APP_CONFIG_CACHE=/tmp/config.php
APP_EVENTS_CACHE=/tmp/events.php
APP_PACKAGES_CACHE=/tmp/packages.php
APP_ROUTES_CACHE=/tmp/routes.php
APP_SERVICES_CACHE=/tmp/services.php
```

---

## 🧪 Testing

```bash
# Run PHP tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test suite
php artisan test --testsuite=Feature
```

---

## 📱 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout

### Watch List
- `GET /v1/watch-list` - Get user's watch list
- `POST /v1/watch-list` - Add new item
- `PUT /v1/watch-list/{id}` - Update item
- `DELETE /v1/watch-list/{id}` - Remove item

### Partnerships
- `GET /v1/partnerships` - Get partnership status
- `POST /v1/partnerships` - Send partnership request
- `PATCH /v1/partnerships/{id}/accept` - Accept request
- `PATCH /v1/partnerships/{id}/reject` - Reject request

### Notes
- `GET /v1/notes` - Get sent/received notes
- `POST /v1/notes` - Send new note
- `PATCH /v1/notes/{id}/read` - Mark as read
- `DELETE /v1/notes/{id}` - Delete note

### Spinner
- `GET /v1/spinner` - Get spinner history
- `POST /v1/spinner/spin` - Spin for random selection
- `GET /v1/spinner/stats` - Get spinner statistics

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Laravel Team** - For the amazing PHP framework
- **Inertia.js** - For seamless SPA development
- **Vercel** - For excellent hosting and deployment
- **Supabase** - For reliable database hosting
- **Tailwind CSS** - For beautiful, responsive design

---

## 📞 Support

- **Email**: support@snugglespace.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/snugglespace/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/snugglespace/wiki)

---

<div align="center">

**Made with ❤️ for couples who love entertainment together**

[Back to Top](#-snugglespace---couples-entertainment-companion)

</div>
