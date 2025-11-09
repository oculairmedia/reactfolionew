# Docker Deployment Guide

Complete guide for deploying the React Portfolio with Payload CMS using Docker on your own server.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Setup](#detailed-setup)
5. [SSL/HTTPS Configuration](#sslhttps-configuration)
6. [Production Deployment](#production-deployment)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Docker Services

```
┌─────────────────────────────────────────────┐
│              Your Server                     │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │         Nginx (Port 80/443)        │    │
│  │  ┌──────────────┬──────────────┐  │    │
│  │  │   Frontend   │   /admin     │  │    │
│  │  │   /          │   /api       │  │    │
│  │  └──────┬───────┴──────┬───────┘  │    │
│  └─────────┼──────────────┼──────────┘    │
│            │              │                 │
│            │              ▼                 │
│            │     ┌─────────────────┐       │
│            │     │  Payload CMS    │       │
│            │     │  (Port 3001)    │       │
│            │     └────────┬────────┘       │
│            │              │                 │
│            │              ▼                 │
│            │     ┌─────────────────┐       │
│            │     │    MongoDB      │       │
│            │     │  (Port 27017)   │       │
│            │     └─────────────────┘       │
│            │                                │
│  ┌─────────▼──────────────────────────┐   │
│  │     React Build (Static Files)     │   │
│  └────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### What Gets Deployed

- **Nginx**: Reverse proxy serving both frontend and backend
- **Payload CMS**: Backend API and admin panel (Node.js)
- **MongoDB**: Database for content storage
- **React Build**: Static frontend files

---

## Prerequisites

### Server Requirements

- **OS**: Ubuntu 20.04+ (or any Linux distribution)
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB+ available
- **Ports**: 80, 443, 3001, 27017 available

### Software Requirements

1. **Docker** (v20.10+)
2. **Docker Compose** (v2.0+)
3. **Git**

### Install Docker on Ubuntu

```bash
# Update package list
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Activate the changes
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## Quick Start

### 1. Clone Repository

```bash
cd /opt  # or your preferred directory
git clone https://github.com/oculairmedia/reactfolionew.git
cd reactfolionew
```

### 2. Build React Frontend

```bash
# Install dependencies
npm install

# Build the React app
npm run build
```

This creates the `build/` directory with static files.

### 3. Configure Environment

```bash
# Copy environment template
cp .env.docker .env.production

# Generate a secure secret
openssl rand -base64 32

# Edit environment file
nano .env.production
```

Update the following in `.env.production`:

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_super_secure_mongodb_password

# Payload CMS Configuration
PAYLOAD_SECRET=paste_the_generated_secret_from_above
PAYLOAD_PUBLIC_SERVER_URL=https://yourdomain.com
```

### 4. Start Services

```bash
# Start all services
docker compose --env-file .env.production up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 5. Access Your Site

- **Frontend**: http://your-server-ip
- **Admin Panel**: http://your-server-ip/admin
- **API**: http://your-server-ip/api

### 6. Create First Admin User

1. Navigate to `http://your-server-ip/admin`
2. Fill in the "Create First User" form
3. Login and start adding content!

---

## Detailed Setup

### Configuration Files

#### 1. Environment Variables (`.env.production`)

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=SecurePassword123!

# Payload CMS Configuration
PAYLOAD_SECRET=your_32_character_minimum_secret_key_here
PAYLOAD_PUBLIC_SERVER_URL=https://yourdomain.com

# These are constructed automatically in docker-compose.yml:
# MONGODB_URI=mongodb://admin:password@mongodb:27017/portfolio?authSource=admin
```

#### 2. Docker Compose Services

The `docker-compose.yml` defines three services:

**MongoDB**:
- Image: `mongo:7`
- Port: `27017`
- Volume: Persistent data storage
- Health checks enabled

**Payload CMS**:
- Built from Dockerfile
- Port: `3001`
- Depends on MongoDB
- Persistent media storage
- Health checks enabled

**Nginx**:
- Image: `nginx:alpine`
- Ports: `80`, `443`
- Serves React build
- Proxies `/admin` and `/api` to Payload

### Building and Running

#### Development Mode (with logs)

```bash
# Build and start
docker compose --env-file .env.production up --build

# This shows logs in terminal (Ctrl+C to stop)
```

#### Production Mode (detached)

```bash
# Build images
docker compose build

# Start in background
docker compose --env-file .env.production up -d

# View logs
docker compose logs -f payload
docker compose logs -f mongodb
docker compose logs -f nginx

# Stop services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v
```

### Useful Docker Commands

```bash
# Check running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Enter a running container
docker exec -it portfolio-payload sh
docker exec -it portfolio-mongodb mongosh

# Restart a service
docker compose restart payload
docker compose restart nginx

# View resource usage
docker stats

# Clean up unused images/containers
docker system prune -a
```

---

## SSL/HTTPS Configuration

### Option 1: Let's Encrypt with Certbot

#### Install Certbot

```bash
sudo apt install -y certbot
```

#### Stop Nginx temporarily

```bash
docker compose stop nginx
```

#### Generate SSL Certificate

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

This creates certificates at:
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

#### Copy Certificates to Docker Volume

```bash
# Create SSL directory
sudo mkdir -p /var/lib/docker/volumes/portfolio_nginx_ssl/_data

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /var/lib/docker/volumes/portfolio_nginx_ssl/_data/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /var/lib/docker/volumes/portfolio_nginx_ssl/_data/

# Set permissions
sudo chmod 644 /var/lib/docker/volumes/portfolio_nginx_ssl/_data/*
```

#### Update nginx.conf

Uncomment the HTTPS server block in `nginx.conf` and update:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # ... rest of configuration
}
```

#### Restart Nginx

```bash
docker compose restart nginx
```

#### Auto-Renewal

```bash
# Add to crontab
sudo crontab -e

# Add this line (runs twice daily)
0 0,12 * * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /var/lib/docker/volumes/portfolio_nginx_ssl/_data/ && docker compose -f /opt/reactfolionew/docker-compose.yml restart nginx
```

### Option 2: Cloudflare (Easiest)

1. Point your domain to Cloudflare
2. Enable SSL/TLS (Flexible or Full)
3. Cloudflare handles HTTPS automatically
4. Your server can run on HTTP (port 80 only)

---

## Production Deployment

### 1. Domain Setup

Point your domain's DNS to your server IP:

```
Type: A
Name: @
Value: your.server.ip.address
TTL: 300

Type: A
Name: www
Value: your.server.ip.address
TTL: 300
```

### 2. Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Optionally allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 3. Update Environment for Production

Edit `.env.production`:

```env
PAYLOAD_PUBLIC_SERVER_URL=https://yourdomain.com
```

Update `nginx.conf` server_name:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

### 4. Deploy

```bash
# Pull latest changes
git pull origin main

# Rebuild React frontend
npm run build

# Rebuild and restart Docker services
docker compose build
docker compose --env-file .env.production up -d

# Check logs
docker compose logs -f
```

### 5. Performance Optimization

#### Enable Nginx Caching

Add to `nginx.conf` (already included):

```nginx
gzip on;
gzip_vary on;
gzip_comp_level 6;
```

#### MongoDB Optimization

```bash
# Enter MongoDB container
docker exec -it portfolio-mongodb mongosh -u admin -p yourpassword

# Create indexes (in MongoDB shell)
use portfolio
db.projects.createIndex({ id: 1 })
db.portfolio.createIndex({ id: 1 })
db.users.createIndex({ email: 1 })
```

---

## Maintenance

### Backups

#### Automated MongoDB Backup Script

```bash
# Create backup script
nano /opt/reactfolionew/backup.sh
```

```bash
#!/bin/bash
# MongoDB Backup Script

BACKUP_DIR="/opt/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
MONGO_PASSWORD="your_mongodb_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec portfolio-mongodb mongodump \
  --username admin \
  --password $MONGO_PASSWORD \
  --authenticationDatabase admin \
  --out /data/backup/$DATE

# Copy from container to host
docker cp portfolio-mongodb:/data/backup/$DATE $BACKUP_DIR/

# Compress
cd $BACKUP_DIR
tar -czf mongodb_backup_$DATE.tar.gz $DATE
rm -rf $DATE

# Keep only last 7 days
find $BACKUP_DIR -name "mongodb_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/mongodb_backup_$DATE.tar.gz"
```

```bash
# Make executable
chmod +x /opt/reactfolionew/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add line:
0 2 * * * /opt/reactfolionew/backup.sh >> /var/log/mongodb-backup.log 2>&1
```

#### Restore from Backup

```bash
# Extract backup
cd /opt/backups/mongodb
tar -xzf mongodb_backup_20231109_020000.tar.gz

# Copy to container
docker cp 20231109_020000 portfolio-mongodb:/data/restore/

# Restore
docker exec portfolio-mongodb mongorestore \
  --username admin \
  --password your_password \
  --authenticationDatabase admin \
  --drop \
  /data/restore/20231109_020000
```

### Updates

```bash
# Pull latest code
cd /opt/reactfolionew
git pull

# Rebuild frontend
npm install
npm run build

# Rebuild Docker images
docker compose build

# Restart with zero downtime
docker compose up -d --no-deps --build payload nginx

# Check logs
docker compose logs -f
```

### Monitoring

```bash
# Container health
docker compose ps

# Resource usage
docker stats

# Disk usage
docker system df
df -h

# Logs
docker compose logs --tail=100 -f payload
docker compose logs --tail=100 -f mongodb
docker compose logs --tail=100 -f nginx
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs payload

# Common issues:
# 1. Environment variables missing
docker compose config  # Validates compose file

# 2. Port already in use
sudo lsof -i :3001
sudo lsof -i :80

# 3. Permission issues
sudo chown -R $USER:$USER /opt/reactfolionew
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Test connection
docker exec -it portfolio-mongodb mongosh -u admin -p yourpassword

# If connection fails, check environment variables match
docker compose exec payload env | grep MONGODB
```

### Payload Admin Won't Load

```bash
# Check Payload logs
docker compose logs payload

# Check if port 3001 is accessible
curl http://localhost:3001/admin

# Check Nginx configuration
docker compose exec nginx nginx -t

# Restart Nginx
docker compose restart nginx
```

### Upload Files Not Persisting

```bash
# Check volume exists
docker volume ls | grep payload_media

# Check volume mount
docker inspect portfolio-payload | grep -A 10 Mounts

# Check permissions
docker exec portfolio-payload ls -la /app/media
```

### High Memory Usage

```bash
# Check current usage
docker stats

# Limit container memory (add to docker-compose.yml)
services:
  payload:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Clear Everything and Start Fresh

```bash
# WARNING: This deletes all data!

# Stop and remove containers, networks, volumes
docker compose down -v

# Remove images
docker compose down --rmi all

# Clean system
docker system prune -a

# Rebuild from scratch
docker compose build --no-cache
docker compose --env-file .env.production up -d
```

---

## Cost Analysis

### Your Own Server

**Monthly Costs**:
- VPS (2GB RAM, 2 vCPU): $5-12/month (DigitalOcean, Vultr, Hetzner)
- Domain: $10-15/year (~$1/month)
- **Total: $6-13/month**

**One-Time Costs**:
- None (if using free SSL with Let's Encrypt)

**Benefits**:
- Full control
- No vendor lock-in
- Can host multiple projects
- Better for learning

**Recommended VPS Providers**:
- **Hetzner**: €4.49/month (cheapest, great performance)
- **DigitalOcean**: $6/month (easy to use)
- **Vultr**: $6/month (many locations)
- **Linode**: $5/month (reliable)

---

## Security Checklist

- [ ] Strong MongoDB password set
- [ ] Strong Payload secret key (32+ characters)
- [ ] Firewall configured (ufw)
- [ ] SSL/HTTPS enabled
- [ ] Regular backups automated
- [ ] MongoDB not exposed publicly (only accessible within Docker network)
- [ ] Nginx rate limiting enabled
- [ ] Security headers configured
- [ ] Docker containers run as non-root user
- [ ] Keep Docker and packages updated

---

## Summary

### Pros of Docker Deployment

✅ Full control over your infrastructure
✅ One-time setup, no recurring platform fees
✅ All services on one server
✅ Easy backups and migrations
✅ Learn Docker and DevOps skills
✅ Can scale vertically (upgrade server)

### Cons of Docker Deployment

❌ Requires server management
❌ You're responsible for uptime
❌ Need to handle security updates
❌ Learning curve for Docker
❌ No automatic scaling

### When to Choose Docker

- You have or can manage a VPS
- You want full control
- You're comfortable with command line
- You want to minimize costs
- You're hosting multiple projects

### When to Choose Managed Services

- You want zero maintenance
- You need automatic scaling
- You prefer clicking buttons to typing commands
- You value time over money

---

## Quick Command Reference

```bash
# Start everything
docker compose --env-file .env.production up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f

# Restart a service
docker compose restart payload

# Rebuild and restart
docker compose up -d --build

# Enter container shell
docker exec -it portfolio-payload sh

# Backup MongoDB
./backup.sh

# Update SSL certificates
sudo certbot renew

# Check status
docker compose ps
```

---

**Need help?** Check the logs first, then refer to the troubleshooting section above!
