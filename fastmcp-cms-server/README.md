# FastMCP CMS Server

AI-powered content publishing for Payload CMS using the Model Context Protocol (MCP).

## Overview

This FastMCP server enables AI agents like Claude to autonomously create, manage, and publish content to your Payload CMS. It exposes CMS operations as MCP tools, allowing natural language-driven content workflows.

## Features

- **🚀 Full CRUD Operations** - Create, read, update, delete projects and portfolio items
- **📝 Draft/Publish Workflow** - Content starts as drafts and can be reviewed before publishing
- **🔒 Secure Authentication** - JWT-based authentication with Payload CMS
- **✅ Input Validation** - Multi-layer validation with Pydantic models
- **📊 Audit Logging** - Complete audit trail of all AI operations
- **⚡ Caching** - Smart caching for improved performance
- **🐳 Docker Ready** - Production-ready Docker deployment with HTTP/SSE transport
- **🏥 Health Checks** - Built-in health monitoring

## Quick Start

### Prerequisites

- Python 3.11+
- Docker and Docker Compose (for deployment)
- Access to Payload CMS instance

### Local Development

1. **Clone the repository**
   ```bash
   cd fastmcp-cms-server
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your CMS credentials
   ```

4. **Run the server**
   ```bash
   python -m server
   ```

The server will start on `http://localhost:8000`

### Docker Deployment

1. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your CMS credentials
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Check health**
   ```bash
   curl http://localhost:8000/health
   ```

## Configuration

All configuration is done via environment variables. See `.env.example` for all options.

### Required Variables

```bash
CMS_API_URL=https://cms2.emmanuelu.com/api
CMS_ADMIN_EMAIL=admin@emmanuelu.com
CMS_ADMIN_PASSWORD=your-secure-password
```

### Optional Variables

```bash
# Server
MCP_HOST=0.0.0.0
MCP_PORT=8000
LOG_LEVEL=INFO

# Performance
TOKEN_CACHE_TTL=900
REQUEST_TIMEOUT=30
MAX_RETRIES=3

# Security
REQUIRE_APPROVAL_FOR_PUBLISH=false
REQUIRE_APPROVAL_FOR_DELETE=true

# Features
ENABLE_CACHING=true
ENABLE_AUDIT_LOG=true
ENABLE_DRAFT_MODE=true
```

## MCP Tools

### Projects

- `create_project_tool` - Create a new project
- `update_project_tool` - Update existing project
- `get_project_tool` - Get project details
- `list_projects_tool` - List projects with filtering
- `publish_project_tool` - Publish a draft project
- `delete_project_tool` - Delete a project

### Portfolio

- `create_portfolio_item_tool` - Create portfolio item
- `update_portfolio_item_tool` - Update portfolio item
- `get_portfolio_item_tool` - Get portfolio item
- `list_portfolio_items_tool` - List portfolio items
- `delete_portfolio_item_tool` - Delete portfolio item

### Global Content

- `get_site_settings_tool` / `update_site_settings_tool` - Site settings
- `get_home_intro_tool` / `update_home_intro_tool` - Home page intro
- `get_about_page_tool` / `update_about_page_tool` - About page content

### Utilities

- `health_check` - Check server and CMS health

## MCP Resources

Resources provide read-only access to CMS content:

- `cms://projects` - List all projects
- `cms://projects/drafts` - List draft projects
- `cms://projects/{id}` - Get specific project
- `cms://portfolio` - List portfolio items
- `cms://globals/site-settings` - Site settings
- `cms://globals/home-intro` - Home intro
- `cms://globals/about-page` - About page

## Usage Examples

### Create a Project

```python
from models.project import CreateProjectInput

project = CreateProjectInput(
    id="my-portfolio-2025",
    title="Portfolio Website 2025",
    client="Personal Project",
    date="2025-11",
    role="Full Stack Developer",
    technologies=["React", "TypeScript", "Payload CMS"],
    tags=[{"tag": "web"}, {"tag": "fullstack"}],
    sections=[
        {
            "title": "Overview",
            "content": "A modern portfolio website built with React and Payload CMS.",
            "layout": "full-width"
        }
    ],
    draft=True
)

result = await create_project_tool(project)
```

### Update Home Intro

```python
from models.globals import HomeIntroInput, AnimatedPhrase

home_intro = HomeIntroInput(
    title="Emmanuel U",
    description="Full Stack Developer & Designer",
    animated=[
        AnimatedPhrase(text="React Developer"),
        AnimatedPhrase(text="UI/UX Designer"),
        AnimatedPhrase(text="Problem Solver")
    ]
)

result = await update_home_intro_tool(home_intro)
```

### List Draft Projects

```python
from models.project import ListProjectsInput

drafts = await list_projects_tool(
    ListProjectsInput(status="draft", limit=10)
)
```

## Connecting AI Clients

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cms-publisher": {
      "url": "http://localhost:8000",
      "transport": "sse"
    }
  }
}
```

### Other MCP Clients

Any MCP client can connect via:
- **Transport**: HTTP/SSE
- **URL**: `http://localhost:8000`

## Development

### Run Tests

```bash
pytest tests/ -v --cov=.
```

### Code Formatting

```bash
black .
ruff check .
```

### Project Structure

```
fastmcp-cms-server/
├── models/              # Pydantic models for validation
│   ├── project.py
│   ├── portfolio.py
│   └── globals.py
├── services/            # Business logic layer
│   ├── auth.py          # Authentication service
│   ├── cache.py         # Caching service
│   ├── audit.py         # Audit logging
│   └── cms_client.py    # CMS API client
├── tools/               # MCP tool definitions
│   ├── projects.py
│   ├── portfolio.py
│   └── globals.py
├── resources/           # MCP resource definitions
│   └── collections.py
├── utils/               # Utility functions
│   ├── validation.py
│   ├── errors.py
│   └── logging.py
├── tests/               # Test suite
├── server.py            # Main FastMCP server
├── config.py            # Configuration management
├── Dockerfile           # Docker image
└── docker-compose.yml   # Docker Compose setup
```

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "server": {
    "name": "CMS Publisher",
    "version": "1.0.0",
    "uptime_seconds": 3600
  },
  "cms": {
    "cms_connected": true,
    "cms_status": "ok"
  },
  "features": {
    "caching": true,
    "audit_log": true,
    "draft_mode": true
  }
}
```

### Audit Logs

Audit logs are written to `./logs/audit.log` (configurable via `AUDIT_LOG_PATH`).

Each entry includes:
- Timestamp
- Operation performed
- Actor (always "mcp-server" for AI operations)
- Resource type and ID
- Before/after changes
- Operation status

### Docker Logs

```bash
# View logs
docker-compose logs -f fastmcp-cms-server

# View last 100 lines
docker-compose logs --tail=100 fastmcp-cms-server
```

## Security

### Authentication

- Server authenticates with CMS using admin credentials
- JWT tokens are cached and auto-refreshed
- All CMS operations require valid authentication

### Input Validation

- Multi-layer validation (Pydantic → Custom → CMS)
- HTML sanitization to prevent XSS
- URL validation to block dangerous protocols
- ID validation to enforce naming conventions

### Rate Limiting

- Configurable request limits (default: 100 req/min)
- Automatic backoff on rate limit errors

### Approval Requirements

Configure approval requirements for sensitive operations:

```bash
REQUIRE_APPROVAL_FOR_PUBLISH=false  # Set true to require manual approval
REQUIRE_APPROVAL_FOR_DELETE=true    # Deletion always requires confirmation
```

## Troubleshooting

### Connection Errors

**Problem**: `CMSConnectionError: Failed to connect to CMS`

**Solutions**:
- Verify `CMS_API_URL` is correct and accessible
- Check network connectivity to CMS
- Ensure CMS server is running
- Check firewall/security group settings

### Authentication Errors

**Problem**: `AuthenticationError: Invalid email or password`

**Solutions**:
- Verify `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD`
- Ensure admin user exists in CMS
- Check CMS user roles and permissions

### Docker Issues

**Problem**: Container won't start

**Solutions**:
```bash
# Check logs
docker-compose logs fastmcp-cms-server

# Rebuild image
docker-compose build --no-cache

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Performance Issues

**Solutions**:
- Enable caching: `ENABLE_CACHING=true`
- Increase cache TTL: `CACHE_TTL=600`
- Reduce request timeout: `REQUEST_TIMEOUT=15`
- Scale horizontally with multiple containers

## Production Deployment

### Best Practices

1. **Use environment-specific configs**
   ```bash
   # Production
   LOG_LEVEL=WARNING
   ENABLE_AUDIT_LOG=true
   REQUIRE_APPROVAL_FOR_DELETE=true
   ```

2. **Enable audit logging**
   - Set `ENABLE_AUDIT_LOG=true`
   - Mount persistent volume for logs
   - Regularly backup audit logs

3. **Monitor health**
   - Set up health check monitoring
   - Configure alerts for downtime
   - Track response times

4. **Secure credentials**
   - Use secrets management (AWS Secrets Manager, HashiCorp Vault)
   - Never commit `.env` files
   - Rotate passwords regularly

5. **Scale as needed**
   ```bash
   docker-compose up -d --scale fastmcp-cms-server=3
   ```

### Reverse Proxy Setup (Nginx)

```nginx
upstream fastmcp {
    server localhost:8000;
}

server {
    listen 80;
    server_name mcp.example.com;

    location / {
        proxy_pass http://fastmcp;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Report an issue](https://github.com/yourusername/fastmcp-cms-server/issues)
- Documentation: See `/docs/PRD-FastMCP-CMS-Server.md`

## Acknowledgments

- [FastMCP](https://gofastmcp.com/) - Python framework for MCP servers
- [Payload CMS](https://payloadcms.com/) - TypeScript-first headless CMS
- [Model Context Protocol](https://modelcontextprotocol.io/) - Standard protocol for AI-to-service communication
