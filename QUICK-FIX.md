# 🚨 Quick Fix for Current Issues

## Problem 1: Docker Permission Denied

**Error:** `permission denied while trying to connect to the Docker daemon socket`

**Solution:**
```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Apply the group changes without logging out
newgrp docker

# Verify you can run docker commands
docker ps
```

## Problem 2: CERTBOT_EMAIL Variable Not Set

**Error:** `The "CERTBOT_EMAIL" variable is not set. Defaulting to a blank string.`

**Solution:**
```bash
# Create .env file from template
cp env.production.template .env

# Edit the .env file
nano .env
```

**In the .env file, change these lines:**
```env
# Change this:
CERTBOT_EMAIL=your-email@example.com
# To your actual email:
CERTBOT_EMAIL=your-actual-email@gmail.com

# Change this:
DB_PASSWORD=your_secure_password_here
# To a secure password:
DB_PASSWORD=MySecurePassword123!
```

## Problem 3: Version Warning (Optional)

**Warning:** `the attribute 'version' is obsolete`

**Solution:** Already fixed in the updated docker-compose.prod.yml file.

## Complete Fix Process

1. **Fix Docker permissions:**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Set up environment variables:**
   ```bash
   cp env.production.template .env
   nano .env
   ```

3. **Test Docker access:**
   ```bash
   docker ps
   ```

4. **Run the deployment:**
   ```bash
   ./deploy.sh
   ```

## Alternative: Use the Fix Script

```bash
# Run the automated fix script
./fix-permissions.sh

# Then run deployment
./deploy.sh
```

## What to Edit in .env File

Open the `.env` file and make sure these values are set correctly:

```env
# Application
APP_NAME="SnuggleSpace"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://snugglespace.devkavin.com
APP_KEY=base64:YOUR_APP_KEY_HERE

# Database
DB_CONNECTION=pgsql
DB_HOST=pgsql
DB_PORT=5432
DB_DATABASE=snugglespace
DB_USERNAME=snugglespace_user
DB_PASSWORD=MySecurePassword123!  # ← Change this

# Certbot
CERTBOT_EMAIL=your-email@gmail.com  # ← Change this
```

## After Fixing

Once you've fixed these issues, your deployment should work smoothly. The application will be available at:

**https://snugglespace.devkavin.com** 