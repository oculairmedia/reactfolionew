# Docker Backend Deployment Guide

Deploy Payload CMS backend on your own server while keeping the React frontend on Vercel.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Vercel CDN                        │
│              (React Frontend - Free)                 │
│        https://yourdomain.vercel.app                │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ API Calls (CORS enabled)
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              Your Server (VPS)                       │
│        https://api.yourdomain.com                   │
│                                                      │
│  ┌────────────────────────────────────────────┐   │
│  │  Nginx (Port 80/443) - SSL Termination    │   │
│  │  - Reverse proxy                           │   │
│  │  - CORS headers                            │   │
│  │  - Rate limiting                           │   │
│  └──────────────────┬─────────────────────────┘   │
│                     │                               │
│                     ▼                               │
│  ┌────────────────────────────────────────────┐   │
│  │      Payload CMS (Port 3001)               │   │
│  │      - Admin panel: /admin                 │   │
│  │      - REST API: /api                      │   │
│  │      - Media files: /media                 │   │
│  └──────────────────┬─────────────────────────┘   │
│                     │                               │
│                     ▼                               │
│  ┌────────────────────────────────────────────┐   │
│  │      MongoDB (Port 27017)                  │   │
│  │      - Content database                    │   │
│  │      - Persistent storage                  │   │
│  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Benefits of This Setup

✅ **Frontend on Vercel (Free)**
- Global CDN for fast loading
- Automatic deployments from Git
- Built-in SSL/HTTPS
- No server management

✅ **Backend on Your Server ($5-12/month)**
- Full control over CMS and database
- Cheaper than managed backend services
- Easy backups
- No vendor lock-in for data

✅ **Best of Both Worlds**
- Total cost: $5-12/month (just the VPS)
- Fast frontend delivery via Vercel CDN
- Full backend control on your server

---

## Prerequisites

### 1. VPS Server Requirements

- **OS**: Ubuntu 20.04+ (or any Linux distribution)
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB+ available
- **Ports**: 80, 443, 3001 open

**Recommended VPS Providers:**
- [Hetzner](https://www.hetzner.com/) - €4.49/month (best value)
- [DigitalOcean](https://www.digitalocean.com/) - $6/month
- [Vultr](https://www.vultr.com/) - $6/month
- [Linode](https://www.linode.com/) - $5/month

### 2. Domain Configuration

You'll need a domain or subdomain for your API:
- **Option 1**: Subdomain (recommended): `api.yourdomain.com`
- **Option 2**: Separate domain: `yourdomain-api.com`

**DNS Configuration:**
```
Type: A
Name: api
Value: your.server.ip.address
TTL: 300
```

### 3. Software Requirements

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git

---

## Quick Start

### Step 1: Server Setup

**1.1. Install Docker on Ubuntu**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

**1.2. Clone Repository**

```bash
# Clone to /opt or your preferred directory
cd /opt
sudo git clone https://github.com/oculairmedia/reactfolionew.git
sudo chown -R $USER:$USER reactfolionew
cd reactfolionew
```

### Step 2: Configure Environment

**2.1. Create Environment File**

```bash
cp .env.backend .env.production

# Generate secure secrets
openssl rand -base64 32  # Use this for PAYLOAD_SECRET
openssl rand -base64 32  # Use this for MONGO_ROOT_PASSWORD

# Edit configuration
nano .env.production
```

**2.2. Update `.env.production`**

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=<paste generated password>

# Payload CMS Configuration
PAYLOAD_SECRET=<paste generated secret>
PAYLOAD_PUBLIC_SERVER_URL=https://api.yourdomain.com

# Vercel Frontend URL (for CORS)
VERCEL_URL=https://yourdomain.vercel.app
```

### Step 3: Update CORS Configuration

**3.1. Edit Payload Config**

Edit `payload/config.ts` and update the CORS settings:

```typescript
cors: [
  process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  process.env.VERCEL_URL || 'http://localhost:3000',
  'https://yourdomain.vercel.app',  // Add your Vercel domain
  'https://*.vercel.app',            // Allow preview deployments
].filter(Boolean),

csrf: [
  process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  process.env.VERCEL_URL || 'http://localhost:3000',
  'https://yourdomain.vercel.app',
  'https://*.vercel.app',
].filter(Boolean),
```

### Step 4: Deploy Backend

**4.1. Start Services (Without SSL first)**

```bash
# Start MongoDB and Payload only (no Nginx yet)
docker compose -f docker-compose.backend.yml --env-file .env.production up -d mongodb payload

# Check status
docker compose -f docker-compose.backend.yml ps

# View logs
docker compose -f docker-compose.backend.yml logs -f payload
```

**4.2. Test Backend**

```bash
# Test locally
curl http://localhost:3001/admin

# You should see the Payload admin login page HTML
```

### Step 5: Configure SSL with Let's Encrypt

**5.1. Update Nginx Configuration**

Edit `nginx-backend.conf` and replace:
- `api.yourdomain.com` → your actual API domain
- `https://yourdomain.vercel.app` → your actual Vercel URL

**5.2. Install Certbot**

```bash
sudo apt install -y certbot
```

**5.3. Stop any service using port 80**

```bash
docker compose -f docker-compose.backend.yml stop nginx
```

**5.4. Generate SSL Certificate**

```bash
sudo certbot certonly --standalone -d api.yourdomain.com
```

This creates certificates at:
- `/etc/letsencrypt/live/api.yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/api.yourdomain.com/privkey.pem`

**5.5. Copy Certificates to Docker Volume**

```bash
# Create SSL directory
sudo mkdir -p /var/lib/docker/volumes/reactfolionew_nginx_ssl/_data

# Copy certificates
sudo cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem \
  /var/lib/docker/volumes/reactfolionew_nginx_ssl/_data/

sudo cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem \
  /var/lib/docker/volumes/reactfolionew_nginx_ssl/_data/

# Set permissions
sudo chmod 644 /var/lib/docker/volumes/reactfolionew_nginx_ssl/_data/*
```

**5.6. Start Nginx**

```bash
# Start Nginx with SSL profile
docker compose -f docker-compose.backend.yml --profile with-ssl --env-file .env.production up -d nginx

# Check logs
docker compose -f docker-compose.backend.yml logs -f nginx
```

**5.7. Test HTTPS**

```bash
curl https://api.yourdomain.com/health
# Should return: OK

curl https://api.yourdomain.com/api/access/me
# Should return JSON (even if unauthenticated)
```

### Step 6: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 7: Create First Admin User

**7.1. Access Admin Panel**

Navigate to: `https://api.yourdomain.com/admin`

**7.2. Create Admin User**

Fill in the "Create First User" form:
- Name: Your name
- Email: Your email
- Password: Strong password (8+ characters)

### Step 8: Configure Vercel Frontend

**8.1. Add Environment Variable in Vercel**

Go to your Vercel project → Settings → Environment Variables

Add:
```
Name: REACT_APP_API_URL
Value: https://api.yourdomain.com/api
Environment: Production, Preview, Development
```

**8.2. Redeploy Frontend**

```bash
# Trigger a redeploy in Vercel dashboard or push a commit
git commit --allow-empty -m "Update API URL"
git push
```

**8.3. Test Integration**

Visit your Vercel site and open browser console:

```javascript
// Test API connection
fetch('https://api.yourdomain.com/api/globals/site-settings')
  .then(r => r.json())
  .then(console.log)
```

You should see data (or authentication error if not logged in).

---

## SSL Auto-Renewal

**Set up automatic certificate renewal:**

```bash
# Edit crontab
sudo crontab -e

# Add this line (runs twice daily)
0 0,12 * * * certbot renew --quiet && \
  cp /etc/letsencrypt/live/api.yourdomain.com/*.pem \
  /var/lib/docker/volumes/reactfolionew_nginx_ssl/_data/ && \
  docker compose -f /opt/reactfolionew/docker-compose.backend.yml restart nginx
```

---

## Backups

### Automated MongoDB Backup Script

```bash
# Create backup script
nano /opt/reactfolionew/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
MONGO_PASSWORD="your_mongodb_password"

mkdir -p $BACKUP_DIR

docker exec portfolio-mongodb mongodump \
  --username admin \
  --password $MONGO_PASSWORD \
  --authenticationDatabase admin \
  --out /data/backup/$DATE

docker cp portfolio-mongodb:/data/backup/$DATE $BACKUP_DIR/

cd $BACKUP_DIR
tar -czf mongodb_backup_$DATE.tar.gz $DATE
rm -rf $DATE

find $BACKUP_DIR -name "mongodb_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: mongodb_backup_$DATE.tar.gz"
```

```bash
# Make executable
chmod +x /opt/reactfolionew/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add:
0 2 * * * /opt/reactfolionew/backup.sh >> /var/log/mongodb-backup.log 2>&1
```

### Restore from Backup

```bash
cd /opt/backups/mongodb
tar -xzf mongodb_backup_20231109_020000.tar.gz

docker cp 20231109_020000 portfolio-mongodb:/data/restore/

docker exec portfolio-mongodb mongorestore \
  --username admin \
  --password your_password \
  --authenticationDatabase admin \
  --drop \
  /data/restore/20231109_020000
```

---

## Maintenance

### View Logs

```bash
cd /opt/reactfolionew

# All services
docker compose -f docker-compose.backend.yml logs -f

# Specific service
docker compose -f docker-compose.backend.yml logs -f payload
docker compose -f docker-compose.backend.yml logs -f mongodb
docker compose -f docker-compose.backend.yml logs -f nginx
```

### Restart Services

```bash
# Restart all
docker compose -f docker-compose.backend.yml restart

# Restart specific service
docker compose -f docker-compose.backend.yml restart payload
docker compose -f docker-compose.backend.yml restart nginx
```

### Update Backend

```bash
cd /opt/reactfolionew

# Pull latest changes
git pull

# Rebuild and restart
docker compose -f docker-compose.backend.yml build
docker compose -f docker-compose.backend.yml --profile with-ssl --env-file .env.production up -d

# Check logs
docker compose -f docker-compose.backend.yml logs -f
```

### Check Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
df -h

# Memory
free -h
```

---

## Troubleshooting

### CORS Errors in Browser

**Symptoms**: Console shows CORS errors when frontend tries to access API

**Solutions**:

1. **Check Nginx CORS headers**:
   ```bash
   # Test CORS headers
   curl -I -X OPTIONS https://api.yourdomain.com/api/projects \
     -H "Origin: https://yourdomain.vercel.app" \
     -H "Access-Control-Request-Method: GET"
   ```

2. **Update nginx-backend.conf**:
   - Ensure your Vercel URL is correct
   - Restart Nginx: `docker compose -f docker-compose.backend.yml restart nginx`

3. **Update Payload config.ts**:
   - Add your Vercel URL to `cors` and `csrf` arrays
   - Rebuild: `docker compose -f docker-compose.backend.yml build payload`

### SSL Certificate Issues

**Certificate not found:**
```bash
# Check certificates exist
sudo ls -la /etc/letsencrypt/live/api.yourdomain.com/

# Check copied to Docker volume
sudo ls -la /var/lib/docker/volumes/reactfolionew_nginx_ssl/_data/
```

**Certificate expired:**
```bash
# Manually renew
sudo certbot renew

# Copy to Docker volume
sudo cp /etc/letsencrypt/live/api.yourdomain.com/*.pem \
  /var/lib/docker/volumes/reactfolionew_nginx_ssl/_data/

# Restart Nginx
docker compose -f docker-compose.backend.yml restart nginx
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker compose -f docker-compose.backend.yml ps mongodb

# Check MongoDB logs
docker compose -f docker-compose.backend.yml logs mongodb

# Test connection
docker exec -it portfolio-mongodb mongosh -u admin -p yourpassword
```

### Payload Container Won't Start

```bash
# Check logs
docker compose -f docker-compose.backend.yml logs payload

# Common issues:
# 1. PAYLOAD_SECRET not set
# 2. MONGODB_URI incorrect
# 3. MongoDB not ready

# Verify environment
docker compose -f docker-compose.backend.yml config
```

### High Memory Usage

```bash
# Check current usage
docker stats

# Restart containers
docker compose -f docker-compose.backend.yml restart

# If needed, add memory limits to docker-compose.backend.yml
```

---

## Security Checklist

- [ ] Strong MongoDB password (32+ characters)
- [ ] Strong Payload secret key (32+ characters)
- [ ] Firewall configured (ufw enabled)
- [ ] SSL/HTTPS enabled with valid certificate
- [ ] CORS restricted to your Vercel domain only
- [ ] Regular backups automated
- [ ] MongoDB not exposed publicly (only accessible within Docker network)
- [ ] Nginx rate limiting enabled
- [ ] Security headers configured in Nginx
- [ ] Keep Docker and packages updated

---

## Cost Summary

| Service | Provider | Cost |
|---------|----------|------|
| Frontend | Vercel | **Free** |
| Backend VPS | Hetzner/DO | **$5-12/month** |
| Database | MongoDB (on VPS) | **Included** |
| SSL Certificate | Let's Encrypt | **Free** |
| **Total** | | **$5-12/month** |

**vs. Managed Services:**
- Vercel + Railway + MongoDB Atlas = $5/month
- Vercel + Heroku + MongoDB Atlas = $7/month

**Benefits of This Setup:**
- Similar cost to managed
- Full backend control
- Easy backups
- Better for learning

---

## Quick Command Reference

```bash
# Start backend services
docker compose -f docker-compose.backend.yml --profile with-ssl --env-file .env.production up -d

# Stop services
docker compose -f docker-compose.backend.yml down

# View logs
docker compose -f docker-compose.backend.yml logs -f

# Restart a service
docker compose -f docker-compose.backend.yml restart payload

# Rebuild and restart
docker compose -f docker-compose.backend.yml build
docker compose -f docker-compose.backend.yml --profile with-ssl up -d

# Backup MongoDB
./backup.sh

# Renew SSL
sudo certbot renew

# Check status
docker compose -f docker-compose.backend.yml ps
docker stats
```

---

## Summary

You now have:
- ✅ Fast frontend on Vercel's global CDN (free)
- ✅ Full backend control on your VPS ($5-12/month)
- ✅ Secure HTTPS connection
- ✅ CORS configured for cross-origin requests
- ✅ Automated backups
- ✅ Easy maintenance and updates

Access your services:
- **Frontend**: https://yourdomain.vercel.app
- **Admin Panel**: https://api.yourdomain.com/admin
- **API**: https://api.yourdomain.com/api

Start adding content and your frontend will fetch it automatically!
