# 🚀 SnuggleSpace Production Deployment Guide

This guide will help you deploy SnuggleSpace to your Hetzner CAX21 server with Docker.

## 📋 Prerequisites

- Hetzner CAX21 server with Ubuntu/Debian
- Docker and Docker Compose installed
- Domain `snugglespace.devkavin.com` pointing to your server
- Cloudflare DNS configured (A, AAAA, CNAME records)

## 🔧 Server Setup

### 1. Connect to Your Hetzner Server

```bash
ssh root@your-server-ip
```

### 2. Create a Non-Root User (Recommended)

```bash
# Create user
adduser snugglespace
usermod -aG sudo snugglespace

# Switch to the new user
su - snugglespace
```

### 3. Install Docker (if not already installed)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes
exit
# SSH back in
```

## 🚀 Automated Deployment

### Option 1: Using the Deployment Script

1. **Clone your repository to the server:**

```bash
cd /opt
sudo mkdir snugglespace
sudo chown $USER:$USER snugglespace
cd snugglespace
git clone https://github.com/yourusername/snugglespace.git .
```

2. **Run the deployment script:**

```bash
./deploy.sh
```

3. **Configure environment variables when prompted:**

The script will create a `.env` file. Edit it with your production settings:

```bash
nano .env
```

Key settings to configure:
- `DB_PASSWORD`: Set a secure database password
- `CERTBOT_EMAIL`: Your email for SSL certificates
- `APP_KEY`: Should be auto-generated

### Option 2: Manual Deployment

1. **Create application directory:**

```bash
sudo mkdir -p /opt/snugglespace
sudo chown $USER:$USER /opt/snugglespace
cd /opt/snugglespace
```

2. **Clone your repository:**

```bash
git clone https://github.com/yourusername/snugglespace.git .
```

3. **Create environment file:**

```bash
cp env.production.template .env
nano .env
```

4. **Start the services:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

5. **Run migrations:**

```bash
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
```

6. **Generate SSL certificate:**

```bash
docker-compose -f docker-compose.prod.yml run --rm certbot
```

7. **Restart nginx with SSL:**

```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🔒 SSL Certificate Setup

The deployment includes automatic SSL certificate generation using Let's Encrypt. The certificate will be automatically renewed every 60 days.

### Manual SSL Renewal

```bash
cd /opt/snugglespace
docker-compose -f docker-compose.prod.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🛠️ Management Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f app
```

### Stop/Start Services

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Restart specific service
docker-compose -f docker-compose.prod.yml restart nginx
```

### System Service (Auto-start)

```bash
# Enable auto-start
sudo systemctl enable snugglespace

# Start/stop/restart
sudo systemctl start snugglespace
sudo systemctl stop snugglespace
sudo systemctl restart snugglespace

# Check status
sudo systemctl status snugglespace
```

### Database Management

```bash
# Access PostgreSQL
docker-compose -f docker-compose.prod.yml exec pgsql psql -U snugglespace_user -d snugglespace

# Run Laravel commands
docker-compose -f docker-compose.prod.yml exec app php artisan migrate
docker-compose -f docker-compose.prod.yml exec app php artisan tinker
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```env
# Application
APP_NAME="SnuggleSpace"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://snugglespace.devkavin.com

# Database
DB_CONNECTION=pgsql
DB_HOST=pgsql
DB_PORT=5432
DB_DATABASE=snugglespace
DB_USERNAME=snugglespace_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# SSL Certificate
CERTBOT_EMAIL=your-email@example.com
```

### Nginx Configuration

The Nginx configuration is located in `docker/nginx/conf.d/default.conf` and includes:

- HTTP to HTTPS redirect
- SSL/TLS configuration
- Security headers
- Static asset caching
- Laravel routing

### PHP Configuration

PHP settings are in `docker/php/php.ini` and include:

- Memory limit: 512M
- Upload max filesize: 100M
- OPcache enabled
- Error logging configured

## 📊 Monitoring

### Health Check

Your application includes a health check endpoint:

```bash
curl https://snugglespace.devkavin.com/health
```

### Resource Usage

```bash
# Check container resource usage
docker stats

# Check disk usage
df -h

# Check memory usage
free -h
```

## 🔄 Updates

To update your application:

```bash
cd /opt/snugglespace

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations if needed
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
```

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Issues:**
   ```bash
   # Check certificate status
   docker-compose -f docker-compose.prod.yml run --rm certbot certificates
   
   # Force renewal
   docker-compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal
   ```

2. **Database Connection Issues:**
   ```bash
   # Check database logs
   docker-compose -f docker-compose.prod.yml logs pgsql
   
   # Test connection
   docker-compose -f docker-compose.prod.yml exec app php artisan tinker
   ```

3. **Permission Issues:**
   ```bash
   # Fix storage permissions
   docker-compose -f docker-compose.prod.yml exec app chown -R www-data:www-data storage bootstrap/cache
   ```

### Log Locations

- **Nginx logs:** `docker-compose -f docker-compose.prod.yml logs nginx`
- **PHP logs:** `docker-compose -f docker-compose.prod.yml logs app`
- **Database logs:** `docker-compose -f docker-compose.prod.yml logs pgsql`

## 📞 Support

If you encounter issues:

1. Check the logs using the commands above
2. Verify your DNS settings in Cloudflare
3. Ensure ports 80 and 443 are open on your Hetzner firewall
4. Check that your domain is properly configured

Your SnuggleSpace application should now be accessible at: **https://snugglespace.devkavin.com** 