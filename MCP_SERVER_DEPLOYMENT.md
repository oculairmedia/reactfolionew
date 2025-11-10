# FastMCP CMS Server - Deployment Complete ✅

## Overview
AI-powered content management server for Payload CMS using the Model Context Protocol (MCP).

## Deployment Status

| Component | Status | URL/Port |
|-----------|--------|----------|
| **MCP Server** | ✅ Running | http://localhost:8050/mcp |
| **Transport** | ✅ HTTP | JSON-RPC 2.0 |
| **Backend CMS** | ✅ Running | https://cms2.emmanuelu.com/api |
| **Docker Container** | ✅ Running | fastmcp-cms-server |

## Server Information

- **Name:** Emmanuel Portfolio CMS Publisher
- **Version:** 1.0.0 (FastMCP 2.13.0.2)
- **Protocol:** MCP 2024-11-05
- **Transport:** HTTP (JSON-RPC 2.0)
- **Port:** 8050
- **Endpoint:** `http://localhost:8050/mcp`

## Available MCP Tools (16 total)

### Projects Management
1. `create_project_tool` - Create new projects with sections, gallery, metadata
2. `update_project_tool` - Update existing project content
3. `get_project_tool` - Retrieve project by ID
4. `list_projects_tool` - Query projects with filters
5. `publish_project_tool` - Publish draft projects to production
6. `delete_project_tool` - Remove projects (with approval)

### Portfolio Management
7. `create_portfolio_item_tool` - Create portfolio grid items
8. `update_portfolio_item_tool` - Update portfolio items
9. `get_portfolio_item_tool` - Retrieve portfolio item by ID
10. `list_portfolio_items_tool` - Query portfolio items
11. `delete_portfolio_item_tool` - Remove portfolio items (with approval)

### Global Settings
12. `get_site_settings_tool` - Retrieve site settings (logo, SEO, contact, social)
13. `update_site_settings_tool` - Update site-wide settings
14. `get_home_intro_tool` - Retrieve home page intro
15. `update_home_intro_tool` - Update home hero section and animated phrases
16. `get_about_page_tool` - Retrieve about page content
17. `update_about_page_tool` - Update bio, timeline, skills, services

### Monitoring
18. `health_check` - Check server and CMS health status

## Available MCP Resources (7 total)

Read-only data access via URI templates:

1. `cms://projects` - List all projects
2. `cms://projects/{id}` - Get specific project
3. `cms://portfolio` - List all portfolio items
4. `cms://portfolio/{id}` - Get specific portfolio item
5. `cms://globals/site-settings` - Site-wide settings
6. `cms://globals/home-intro` - Home page intro
7. `cms://globals/about-page` - About page content

## Testing the MCP Server

### Initialize Connection
```bash
curl -X POST http://localhost:8050/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "test", "version": "1.0.0"}
    },
    "id": 1
  }'
```

### List Available Tools
```bash
curl -X POST http://localhost:8050/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 2
  }'
```

### List Projects
```bash
curl -X POST http://localhost:8050/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_projects_tool",
      "arguments": {}
    },
    "id": 3
  }'
```

## Features

### Security
- ✅ Multi-layer input validation (Pydantic models)
- ✅ HTML sanitization (XSS prevention)
- ✅ URL validation (dangerous protocol blocking)
- ✅ JWT authentication with auto-refresh
- ✅ Configurable approval requirements
- ✅ Rate limiting support (100 req/min)

### Performance
- ✅ Smart caching (300s TTL)
- ✅ Request retry logic with exponential backoff
- ✅ Connection pooling
- ✅ Async operations

### Monitoring
- ✅ Structured logging (JSON format)
- ✅ Complete audit trail
- ✅ Health check endpoint
- ✅ Uptime tracking

## Configuration

### Environment Variables (.env)
```bash
# CMS Configuration
CMS_API_URL=https://cms2.emmanuelu.com/api
CMS_ADMIN_EMAIL=emanuvaderland@gmail.com
CMS_ADMIN_PASSWORD=7beEXKPk93xSD6m

# Server Configuration
MCP_SERVER_NAME=Emmanuel Portfolio CMS Publisher
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=INFO

# HTTP Server Configuration
MCP_HOST=0.0.0.0
MCP_PORT=8050

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
```

## Docker Management

### View Logs
```bash
cd /opt/stacks/implement-payload-cms-011CUxhkCJAiefDu2xtFQKcp/fastmcp-cms-server
docker-compose logs -f
```

### Restart Server
```bash
docker-compose restart
```

### Stop Server
```bash
docker-compose down
```

### Rebuild and Restart
```bash
docker-compose down && docker-compose up -d --build
```

### Check Status
```bash
docker-compose ps
docker ps | grep fastmcp
```

## Connecting MCP Clients

### Claude Desktop Configuration
Add to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "emmanuel-cms": {
      "command": "curl",
      "args": ["-X", "POST", "http://192.168.50.90:8050/mcp"],
      "env": {
        "CONTENT_TYPE": "application/json"
      }
    }
  }
}
```

Or use HTTP transport directly:
```json
{
  "mcpServers": {
    "emmanuel-cms": {
      "url": "http://192.168.50.90:8050/mcp",
      "transport": "http"
    }
  }
}
```

### OpenCode Configuration
```bash
# Add MCP server
opencode mcp add --transport http emmanuel-cms http://192.168.50.90:8050/mcp

# List servers
opencode mcp list

# Test connection
opencode mcp test emmanuel-cms
```

## Example AI Interactions

Once connected, AI agents can:

**Create Content:**
> "Create a new project for my React portfolio with sections about the tech stack and deployment process"

**Update Content:**
> "Update the home page intro to include these animated phrases: React Developer, UI/UX Designer, Problem Solver"

**Query Content:**
> "List all draft projects and show me the one about the e-commerce site"

**Publish:**
> "Publish the binmetrics project"

**Manage Settings:**
> "Update the site settings to change the contact email"

## Project Structure

```
fastmcp-cms-server/
├── server.py              # Main MCP server
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker orchestration
├── .env                  # Environment variables
│
├── models/               # Pydantic validation models
│   ├── project.py
│   ├── portfolio.py
│   └── globals.py
│
├── tools/                # MCP tool implementations
│   ├── projects.py       # 6 project management tools
│   ├── portfolio.py      # 5 portfolio management tools
│   └── globals.py        # 6 global settings tools
│
├── resources/            # MCP resource providers
│   └── collections.py    # 7 read-only resources
│
├── services/             # Business logic layer
│   ├── cms_client.py     # CMS API client
│   ├── auth.py           # JWT authentication
│   ├── cache.py          # Caching layer
│   └── audit.py          # Audit logging
│
├── utils/                # Utility functions
│   ├── validation.py     # Input validation & sanitization
│   ├── errors.py         # Custom exceptions
│   └── logging.py        # Structured logging
│
└── tests/                # Test suite
    ├── test_models.py
    └── test_validation.py
```

## Troubleshooting

### Server Won't Start
```bash
# Check logs
docker logs fastmcp-cms-server

# Check if port is in use
lsof -i :8050

# Rebuild container
cd /opt/stacks/implement-payload-cms-011CUxhkCJAiefDu2xtFQKcp/fastmcp-cms-server
docker-compose down
docker-compose up -d --build
```

### Can't Connect to CMS
```bash
# Test CMS API
curl https://cms2.emmanuelu.com/api/projects

# Check CMS credentials in .env
cat .env | grep CMS_
```

### MCP Client Issues
- Ensure Accept header includes `application/json, text/event-stream`
- Use POST method for all MCP requests
- Content-Type must be `application/json`
- Check MCP protocol version compatibility

## Security Notes

1. **Credentials:** CMS credentials are stored in `.env` file (not committed to git)
2. **Network:** MCP server listens on all interfaces (0.0.0.0) - ensure firewall rules
3. **Approval:** Delete operations require approval by default
4. **Validation:** All inputs are validated and sanitized before CMS submission
5. **Audit:** All AI operations are logged with timestamps

## Next Steps

1. ✅ MCP server deployed and running
2. ✅ HTTP transport configured
3. ✅ Connected to CMS backend
4. 🔄 Configure MCP client (Claude Desktop/OpenCode)
5. 🔄 Test AI-driven content creation
6. 🔄 Monitor audit logs
7. 🔄 (Optional) Expose via Cloudflare Tunnel for remote access

## Support

- **FastMCP Docs:** https://gofastmcp.com
- **MCP Protocol:** https://modelcontextprotocol.io
- **Payload CMS API:** https://cms2.emmanuelu.com/api
- **Repository:** https://github.com/oculairmedia/reactfolionew

---

**Status:** ✅ Production Ready
**Last Updated:** November 9, 2025
**Port:** 8050
**Endpoint:** http://localhost:8050/mcp
