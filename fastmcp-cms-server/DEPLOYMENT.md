# Deployment Guide

Complete guide for deploying FastMCP CMS Server to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Security Hardening](#security-hardening)
6. [Monitoring & Logging](#monitoring--logging)
7. [Scaling](#scaling)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- Docker 20.10+ and Docker Compose 2.0+
- Payload CMS instance (accessible via HTTPS)
- Admin credentials for Payload CMS
- 512MB+ RAM per container
- 1GB+ disk space

### Recommended

- Reverse proxy (Nginx/Traefik) for SSL termination
- Monitoring solution (Prometheus, Datadog, etc.)
- Log aggregation (ELK, CloudWatch, etc.)
- Secrets management (AWS Secrets Manager, Vault, etc.)

## Docker Deployment

### Step 1: Prepare Environment

```bash
# Clone repository
git clone <your-repo>
cd fastmcp-cms-server

# Create environment file
cp .env.example .env
```

### Step 2: Configure Environment

Edit `.env` file:

```bash
# REQUIRED: CMS Configuration
CMS_API_URL=https://cms2.emmanuelu.com/api
CMS_ADMIN_EMAIL=mcp-server@emmanuelu.com
CMS_ADMIN_PASSWORD=<SECURE_PASSWORD>

# Server Configuration
MCP_SERVER_NAME=CMS Publisher
LOG_LEVEL=INFO

# Security
REQUIRE_APPROVAL_FOR_DELETE=true
ENABLE_AUDIT_LOG=true
```

### Step 3: Build and Deploy

```bash
# Build Docker image
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Verify Deployment

```bash
# Health check
curl http://localhost:8000/health

# Expected response:
# {
#   "status": "healthy",
#   "server": {...},
#   "cms": {"cms_connected": true}
# }
```

## Cloud Deployment

### AWS ECS

#### 1. Create ECR Repository

```bash
aws ecr create-repository --repository-name fastmcp-cms-server

# Build and push image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t fastmcp-cms-server .
docker tag fastmcp-cms-server:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fastmcp-cms-server:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fastmcp-cms-server:latest
```

#### 2. Create Task Definition

`task-definition.json`:
```json
{
  "family": "fastmcp-cms-server",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "fastmcp-cms-server",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/fastmcp-cms-server:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "CMS_API_URL", "value": "https://cms2.emmanuelu.com/api"},
        {"name": "MCP_SERVER_NAME", "value": "CMS Publisher"},
        {"name": "LOG_LEVEL", "value": "INFO"}
      ],
      "secrets": [
        {
          "name": "CMS_ADMIN_EMAIL",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:cms-email"
        },
        {
          "name": "CMS_ADMIN_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:cms-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/fastmcp-cms-server",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

#### 3. Create ECS Service

```bash
aws ecs create-service \
  --cluster my-cluster \
  --service-name fastmcp-cms-server \
  --task-definition fastmcp-cms-server \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/fastmcp-cms-server

# Deploy
gcloud run deploy fastmcp-cms-server \
  --image gcr.io/PROJECT_ID/fastmcp-cms-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars CMS_API_URL=https://cms2.emmanuelu.com/api \
  --set-secrets CMS_ADMIN_EMAIL=cms-email:latest,CMS_ADMIN_PASSWORD=cms-password:latest \
  --port 8000 \
  --cpu 1 \
  --memory 512Mi \
  --min-instances 1 \
  --max-instances 10
```

### Azure Container Instances

```bash
# Create container instance
az container create \
  --resource-group myResourceGroup \
  --name fastmcp-cms-server \
  --image <registry>/fastmcp-cms-server:latest \
  --cpu 1 \
  --memory 1 \
  --ports 8000 \
  --environment-variables \
    CMS_API_URL=https://cms2.emmanuelu.com/api \
    LOG_LEVEL=INFO \
  --secure-environment-variables \
    CMS_ADMIN_EMAIL=<email> \
    CMS_ADMIN_PASSWORD=<password> \
  --restart-policy Always
```

## Environment Configuration

### Production Configuration

```bash
# Server
MCP_SERVER_NAME=CMS Publisher Production
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=WARNING
MCP_HOST=0.0.0.0
MCP_PORT=8000

# CMS (use secrets management for credentials)
CMS_API_URL=https://cms2.emmanuelu.com/api
CMS_ADMIN_EMAIL=<from-secrets>
CMS_ADMIN_PASSWORD=<from-secrets>

# Performance
TOKEN_CACHE_TTL=900
REQUEST_TIMEOUT=30
MAX_RETRIES=3
RETRY_BACKOFF=2

# Security
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
REQUIRE_APPROVAL_FOR_PUBLISH=false
REQUIRE_APPROVAL_FOR_DELETE=true

# Features
ENABLE_CACHING=true
CACHE_TTL=300
ENABLE_AUDIT_LOG=true
ENABLE_DRAFT_MODE=true
AUDIT_LOG_PATH=/var/log/fastmcp/audit.log
```

### Using AWS Secrets Manager

```bash
# Store secrets
aws secretsmanager create-secret \
  --name fastmcp/cms-email \
  --secret-string "admin@example.com"

aws secretsmanager create-secret \
  --name fastmcp/cms-password \
  --secret-string "secure-password"

# Reference in ECS task definition
"secrets": [
  {
    "name": "CMS_ADMIN_EMAIL",
    "valueFrom": "arn:aws:secretsmanager:region:account:secret:fastmcp/cms-email"
  }
]
```

## Security Hardening

### 1. Network Security

```yaml
# docker-compose.yml
services:
  fastmcp-cms-server:
    # Bind to localhost only if behind reverse proxy
    environment:
      - MCP_HOST=127.0.0.1

    # Use custom network
    networks:
      - internal

networks:
  internal:
    driver: bridge
    internal: true  # No external access
```

### 2. Container Security

```dockerfile
# Run as non-root user
FROM python:3.11-slim

# Create non-root user
RUN useradd -m -u 1000 fastmcp && \
    chown -R fastmcp:fastmcp /app

USER fastmcp

# Drop capabilities
RUN apt-get update && apt-get install -y libcap2-bin && \
    setcap cap_net_bind_service=+ep /usr/local/bin/python3.11
```

### 3. SSL/TLS with Nginx

```nginx
# /etc/nginx/sites-available/fastmcp
server {
    listen 443 ssl http2;
    server_name mcp.example.com;

    ssl_certificate /etc/letsencrypt/live/mcp.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.example.com/privkey.pem;

    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for SSE
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name mcp.example.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. Firewall Rules

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 8000/tcp  # Block direct access to app
sudo ufw enable

# AWS Security Group
# Inbound:
# - 443 (HTTPS) from 0.0.0.0/0
# - 8000 (App) from load balancer security group only

# Outbound:
# - 443 (HTTPS) to CMS API
```

## Monitoring & Logging

### Health Check Monitoring

```bash
# Simple monitoring script
#!/bin/bash
while true; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
    if [ $response -ne 200 ]; then
        echo "Health check failed! Status: $response"
        # Send alert
    fi
    sleep 60
done
```

### Prometheus Metrics

Add to `docker-compose.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### CloudWatch Logs (AWS)

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json <<EOF
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/fastmcp/audit.log",
            "log_group_name": "/fastmcp/audit",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
EOF

# Start agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

### Log Rotation

```bash
# /etc/logrotate.d/fastmcp
/var/log/fastmcp/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 fastmcp fastmcp
    sharedscripts
    postrotate
        docker-compose restart fastmcp-cms-server
    endscript
}
```

## Scaling

### Horizontal Scaling with Docker Compose

```bash
# Scale to 3 replicas
docker-compose up -d --scale fastmcp-cms-server=3

# Add load balancer
# docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - fastmcp-cms-server

  fastmcp-cms-server:
    build: .
    # No ports exposed directly
```

`nginx.conf`:
```nginx
upstream fastmcp {
    least_conn;
    server fastmcp-cms-server_1:8000;
    server fastmcp-cms-server_2:8000;
    server fastmcp-cms-server_3:8000;
}

server {
    listen 80;

    location / {
        proxy_pass http://fastmcp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Kubernetes Deployment

`k8s-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastmcp-cms-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fastmcp-cms-server
  template:
    metadata:
      labels:
        app: fastmcp-cms-server
    spec:
      containers:
      - name: fastmcp-cms-server
        image: <registry>/fastmcp-cms-server:latest
        ports:
        - containerPort: 8000
        env:
        - name: CMS_API_URL
          value: "https://cms2.emmanuelu.com/api"
        - name: CMS_ADMIN_EMAIL
          valueFrom:
            secretKeyRef:
              name: cms-credentials
              key: email
        - name: CMS_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: cms-credentials
              key: password
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: fastmcp-cms-server
spec:
  selector:
    app: fastmcp-cms-server
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f k8s-deployment.yaml

# Scale
kubectl scale deployment fastmcp-cms-server --replicas=5
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs fastmcp-cms-server

# Common issues:
# 1. Missing environment variables
#    Solution: Check .env file

# 2. CMS connection failure
#    Solution: Verify CMS_API_URL is accessible
docker run --rm curlimages/curl:latest curl -v https://cms2.emmanuelu.com/api/health

# 3. Port already in use
#    Solution: Change MCP_PORT or stop conflicting service
sudo lsof -i :8000
```

### High Memory Usage

```bash
# Monitor memory
docker stats fastmcp-cms-server

# Solutions:
# 1. Reduce cache TTL
CACHE_TTL=60

# 2. Disable caching
ENABLE_CACHING=false

# 3. Increase container memory limit
# docker-compose.yml
services:
  fastmcp-cms-server:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Slow Response Times

```bash
# Check CMS response time
time curl https://cms2.emmanuelu.com/api/health

# Solutions:
# 1. Enable caching
ENABLE_CACHING=true
CACHE_TTL=300

# 2. Reduce timeout
REQUEST_TIMEOUT=15

# 3. Scale horizontally
docker-compose up -d --scale fastmcp-cms-server=3
```

### SSL/TLS Issues

```bash
# Test SSL connection
openssl s_client -connect mcp.example.com:443 -servername mcp.example.com

# Check certificate
curl -vI https://mcp.example.com

# Renew Let's Encrypt certificate
sudo certbot renew
sudo systemctl reload nginx
```

## Backup & Recovery

### Backup Audit Logs

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
docker cp fastmcp-cms-server:/app/logs/audit.log /backup/audit-$DATE.log
gzip /backup/audit-$DATE.log

# Upload to S3
aws s3 cp /backup/audit-$DATE.log.gz s3://my-backup-bucket/fastmcp/
```

### Disaster Recovery

```bash
# 1. Stop service
docker-compose down

# 2. Restore from backup (if needed)
# Restore configuration, secrets, etc.

# 3. Pull latest image
docker-compose pull

# 4. Start service
docker-compose up -d

# 5. Verify health
curl http://localhost:8000/health
```

## Maintenance

### Updates

```bash
# Pull latest changes
git pull

# Rebuild image
docker-compose build

# Rolling update (no downtime)
docker-compose up -d --no-deps --build fastmcp-cms-server

# Verify
docker-compose ps
curl http://localhost:8000/health
```

### Database Maintenance

Since this is a stateless service, no database maintenance is required. However, ensure your Payload CMS instance is properly maintained.

## Support

For production issues:
- Check logs: `docker-compose logs -f`
- Review audit logs: `tail -f logs/audit.log`
- Monitor health: `watch -n 5 curl http://localhost:8000/health`
- GitHub Issues: Report issues with deployment logs
