# 🔄 Deployment Workflow Guide

## 📋 Overview

This guide explains the proper workflow for deploying SnuggleSpace from your local development environment to your Hetzner server.

## 🏠 Local Development Workflow

### 1. Make Changes Locally
```bash
# Make your changes to the code
# Test locally with Laravel Sail
./vendor/bin/sail up -d
```

### 2. Commit and Push to GitHub
```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Description of your changes"

# Push to GitHub
git push origin main
```

## 🖥️ Server Deployment Workflow

### 1. Connect to Your Hetzner Server
```bash
ssh root@your-server-ip
# or if you created a user:
ssh snugglespace@your-server-ip
```

### 2. Navigate to Application Directory
```bash
cd /opt/snugglespace
```

### 3. Pull Latest Changes
```bash
# Pull the latest code from GitHub
git pull origin main
```

### 4. Deploy with Updated Code
```bash
# If this is your first deployment:
./deploy.sh

# If you've already deployed before:
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 🚀 Complete Deployment Process

### First Time Setup (On Server)

1. **Clone the repository:**
   ```bash
   cd /opt
   sudo mkdir snugglespace
   sudo chown $USER:$USER snugglespace
   cd snugglespace
   git clone https://github.com/devkavin/SnuggleSpace.git .
   ```

2. **Set up environment:**
   ```bash
   # Create .env file
   cp env.production.template .env
   nano .env
   ```

3. **Configure environment variables:**
   ```env
   # Change these in .env:
   CERTBOT_EMAIL=your-email@gmail.com
   DB_PASSWORD=YourSecurePassword123!
   ```

4. **Run deployment:**
   ```bash
   ./deploy.sh
   ```

### Regular Updates (On Server)

1. **Pull latest changes:**
   ```bash
   cd /opt/snugglespace
   git pull origin main
   ```

2. **Rebuild and restart:**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml build --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run migrations (if needed):**
   ```bash
   docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
   ```

## 🔧 Quick Commands Reference

### Local Development
```bash
# Start local development
./vendor/bin/sail up -d

# Stop local development
./vendor/bin/sail down

# View logs
./vendor/bin/sail logs

# Run tests
./vendor/bin/sail test
```

### Server Management
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f nginx

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

### Database Management
```bash
# Access PostgreSQL
docker-compose -f docker-compose.prod.yml exec pgsql psql -U snugglespace_user -d snugglespace

# Run Laravel commands
docker-compose -f docker-compose.prod.yml exec app php artisan migrate
docker-compose -f docker-compose.prod.yml exec app php artisan tinker
docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
```

## 🚨 Troubleshooting

### If Build Fails
```bash
# Clean build
docker-compose -f docker-compose.prod.yml build --no-cache --progress=plain

# Build specific service
docker-compose -f docker-compose.prod.yml build --no-cache app
```

### If Redis Build Fails
```bash
# Use the fix script
./fix-redis-build.sh

# Or manually use simple Dockerfile
sed -i 's|dockerfile: ./docker/php/Dockerfile|dockerfile: ./docker/php/Dockerfile.simple|g' docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml build --no-cache
```

### If Environment Issues
```bash
# Check environment file
cat .env

# Recreate from template
cp env.production.template .env
nano .env
```

## 📊 Monitoring

### Health Check
```bash
curl https://snugglespace.devkavin.com/health
```

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
df -h

# Memory usage
free -h
```

## 🔄 Typical Workflow Example

### Day 1: Initial Setup
1. **Local:** Make changes and test
2. **Local:** Commit and push to GitHub
3. **Server:** Clone repository and deploy
4. **Server:** Configure environment and SSL

### Day 2+: Regular Updates
1. **Local:** Make changes and test
2. **Local:** Commit and push to GitHub
3. **Server:** Pull changes and redeploy
4. **Server:** Verify everything works

## 🎯 Best Practices

1. **Always test locally first** with Laravel Sail
2. **Use descriptive commit messages**
3. **Pull latest changes before making new changes**
4. **Keep your .env file secure** (don't commit it)
5. **Monitor logs** after deployment
6. **Backup your database** before major updates

Your SnuggleSpace application will be available at: **https://snugglespace.devkavin.com** 