# Product Requirements Document (PRD)
## FastMCP Server for Payload CMS Content Publishing

**Document Version:** 1.0
**Date:** 2025-11-10
**Status:** Draft
**Owner:** Engineering Team

---

## 1. Executive Summary

This document outlines the requirements for building a Model Context Protocol (MCP) server using FastMCP that enables AI agents to autonomously manage and publish content to our Payload CMS. The server will expose CMS operations (create, read, update, publish) as MCP tools, allowing AI assistants like Claude to handle content workflows through natural language interactions.

**Key Benefits:**
- Enable autonomous content publishing through AI agents
- Streamline content creation and management workflows
- Provide structured, type-safe CMS interactions for AI
- Reduce manual admin panel usage for routine content updates
- Enable programmatic content generation and publishing

---

## 2. Background & Problem Statement

### Current State

Our portfolio website uses Payload CMS (v2.32.3) with the following architecture:
- **Collections:** Projects, Portfolio, Media, Users
- **Globals:** SiteSettings, HomeIntro, AboutPage
- **APIs:** REST API at `https://cms2.emmanuelu.com/api`
- **Admin Panel:** Web-based UI at `https://cms2.emmanuelu.com/admin`
- **Database:** MongoDB
- **Frontend Integration:** TypeScript API client with enterprise features

### Problems

1. **Manual Content Management:** All content updates require manual admin panel access
2. **No Publishing Workflow:** Content is published immediately without draft/review states
3. **Limited Automation:** No programmatic way for agents to create/update content
4. **Inefficient Workflows:** Routine content updates (new projects, portfolio items) require manual data entry
5. **No AI Integration:** Cannot leverage AI for content generation and publishing

### Opportunity

The Model Context Protocol (MCP) provides a standardized way to expose CMS capabilities to AI agents. FastMCP 2.0 offers a production-ready Python framework that can:
- Expose CMS operations as callable tools
- Provide structured data access via resources
- Enable authenticated, secure AI-driven workflows
- Support enterprise authentication patterns
- Facilitate testing and deployment

---

## 3. Goals & Objectives

### Primary Goals

1. **Enable AI-Driven Content Publishing**
   - Allow AI agents to create, update, and publish CMS content
   - Support all major collections (Projects, Portfolio) and globals

2. **Maintain Data Integrity**
   - Ensure type-safe operations with validation
   - Prevent unauthorized or malicious content modifications
   - Preserve existing content structure and relationships

3. **Provide Developer-Friendly Integration**
   - Clear API documentation
   - Type hints and schema validation
   - Comprehensive error handling

### Secondary Goals

1. **Implement Draft/Publish Workflow**
   - Add draft status to content items
   - Enable review before publishing
   - Support scheduled publishing

2. **Enable Content Search & Discovery**
   - Expose CMS content as MCP resources
   - Support filtering and search operations
   - Provide content recommendations

3. **Audit & Compliance**
   - Track all AI-initiated content changes
   - Log operations for security review
   - Support rollback capabilities

### Non-Goals (Out of Scope for v1.0)

- Replacing the admin panel UI
- Real-time collaborative editing
- Multi-language content management
- Advanced media processing/editing
- Custom workflow automation beyond basic draft/publish
- Integration with external CMS platforms

---

## 4. User Stories

### Content Creator (AI Agent)

**As an AI agent, I want to:**

1. **Create New Project**
   - Create a new project with title, description, metadata, and sections
   - Upload or reference images/videos for project galleries
   - Add tags for categorization
   - Set draft status for review

2. **Update Existing Project**
   - Modify project details (title, subtitle, metadata)
   - Add/remove sections and gallery items
   - Update tags
   - Change publication status

3. **Publish Portfolio Items**
   - Create new portfolio grid items
   - Link to detailed project pages
   - Set thumbnail images and videos
   - Manage tags for filtering

4. **Manage Site Content**
   - Update site settings (contact info, social links)
   - Modify home page intro text and animated phrases
   - Update about page timeline and skills

5. **Query Content**
   - Search for projects by tag or title
   - List all portfolio items
   - Retrieve specific content by ID
   - Check publication status

### Human Administrator

**As a CMS admin, I want to:**

1. **Review AI-Generated Content**
   - See content marked as draft by AI
   - Approve or reject AI-created content
   - Edit AI-generated content before publishing

2. **Monitor AI Activity**
   - View audit logs of AI operations
   - See what content was created/modified by AI
   - Rollback problematic changes

3. **Control AI Permissions**
   - Define what content types AI can modify
   - Set approval requirements for different content types
   - Revoke AI access if needed

### Developer

**As a developer, I want to:**

1. **Easy Setup**
   - Simple installation process
   - Clear configuration steps
   - Minimal dependencies

2. **Type Safety**
   - TypeScript/Python type definitions
   - Schema validation for all operations
   - Clear error messages

3. **Testing Support**
   - Test server locally
   - Mock CMS responses
   - Integration test examples

---

## 5. Technical Requirements

### 5.1 Functional Requirements

#### FR1: MCP Tools for CRUD Operations

**FR1.1: Project Management**
- `create_project` - Create new project with full metadata
- `update_project` - Update existing project by ID
- `get_project` - Retrieve project details
- `list_projects` - List all projects with filtering
- `delete_project` - Remove project (admin only)
- `publish_project` - Change status from draft to published
- `unpublish_project` - Revert to draft status

**FR1.2: Portfolio Management**
- `create_portfolio_item` - Create new portfolio grid item
- `update_portfolio_item` - Update existing portfolio item
- `get_portfolio_item` - Retrieve portfolio item details
- `list_portfolio_items` - List all portfolio items with filtering
- `delete_portfolio_item` - Remove portfolio item (admin only)

**FR1.3: Media Management**
- `upload_media` - Upload image/video to CMS
- `get_media` - Retrieve media details
- `list_media` - List all media files
- `delete_media` - Remove media file (admin only)

**FR1.4: Global Content Management**
- `update_site_settings` - Modify site-wide settings
- `get_site_settings` - Retrieve current settings
- `update_home_intro` - Modify home page intro
- `get_home_intro` - Retrieve home intro
- `update_about_page` - Modify about page content
- `get_about_page` - Retrieve about page

**FR1.5: Search & Discovery**
- `search_content` - Full-text search across collections
- `get_tags` - List all available tags
- `filter_by_tag` - Get content filtered by tag

#### FR2: MCP Resources for Data Access

**FR2.1: Collection Resources**
- `cms://projects` - List all projects
- `cms://projects/{id}` - Specific project
- `cms://portfolio` - List portfolio items
- `cms://portfolio/{id}` - Specific portfolio item
- `cms://media` - List media files
- `cms://media/{id}` - Specific media file

**FR2.2: Global Resources**
- `cms://globals/site-settings` - Site settings
- `cms://globals/home-intro` - Home intro
- `cms://globals/about-page` - About page

**FR2.3: Meta Resources**
- `cms://schema` - Full CMS schema definition
- `cms://tags` - All available tags
- `cms://health` - CMS health status

#### FR3: MCP Prompts for Common Workflows

**FR3.1: Content Creation Prompts**
- `create-project-from-description` - Guide AI through project creation
- `add-portfolio-item` - Guide AI through portfolio item creation
- `update-about-me` - Help update about page

**FR3.2: Content Management Prompts**
- `publish-draft-content` - Review and publish drafts
- `update-project-details` - Structured project updates
- `refresh-homepage` - Update home page content

### 5.2 Non-Functional Requirements

#### NFR1: Performance
- API response time: < 2 seconds for 95th percentile
- Support concurrent requests: minimum 10 simultaneous connections
- Resource listing: paginated results, max 100 items per page
- Caching: implement smart caching for frequently accessed content

#### NFR2: Security
- Authentication: JWT-based authentication with CMS
- Authorization: Role-based access control (admin/editor roles)
- Input validation: strict schema validation for all inputs
- Rate limiting: max 100 requests per minute per client
- Audit logging: log all write operations with timestamps and user context

#### NFR3: Reliability
- Error handling: graceful degradation on CMS unavailability
- Retry logic: automatic retry with exponential backoff (3 attempts)
- Health checks: expose health endpoint for monitoring
- Uptime target: 99.5% availability

#### NFR4: Maintainability
- Code coverage: minimum 80% test coverage
- Documentation: comprehensive API docs and examples
- Type safety: full Python type hints, validated schemas
- Logging: structured logging with levels (DEBUG, INFO, WARNING, ERROR)

#### NFR5: Scalability
- Horizontal scaling: stateless server design
- Connection pooling: efficient MongoDB connection management
- Resource limits: configurable memory and CPU limits
- Background tasks: support for async operations

---

## 6. Architecture & Design

### 6.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   AI Assistant (Claude)                 │
│                                                           │
│  "Create a new project about my React portfolio"        │
└───────────────────────┬─────────────────────────────────┘
                        │ MCP Protocol
                        │ (stdio/HTTP/SSE)
                        ▼
┌─────────────────────────────────────────────────────────┐
│               FastMCP Server (Python)                   │
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │    Tools    │  │  Resources   │  │    Prompts     │ │
│  │  (CRUD ops) │  │ (Data access)│  │  (Workflows)   │ │
│  └──────┬──────┘  └──────┬───────┘  └────────┬───────┘ │
│         │                │                    │         │
│         └────────────────┼────────────────────┘         │
│                          │                              │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │         CMS Client Service Layer               │  │
│  │  - Authentication & Authorization               │  │
│  │  - Request Validation & Sanitization            │  │
│  │  - Error Handling & Retry Logic                 │  │
│  │  - Caching & Request Deduplication              │  │
│  │  - Audit Logging                                 │  │
│  └──────────────────────┬───────────────────────────┘  │
└───────────────────────┬─┴─────────────────────────────┘
                        │ REST API
                        │ (HTTPS + JWT)
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Payload CMS Server                         │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  REST API (/api/*)                              │   │
│  │  - Projects, Portfolio, Media, Users             │   │
│  │  - Globals (Settings, Home, About)               │   │
│  └───────────────────────┬──────────────────────────┘   │
│                          │                              │
│  ┌───────────────────────▼──────────────────────────┐  │
│  │  MongoDB Database                                │  │
│  │  - Collections & Globals Data                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Component Design

#### 6.2.1 FastMCP Server Structure

```python
fastmcp_cms_server/
├── __init__.py
├── server.py              # Main FastMCP server setup
├── config.py              # Configuration management
├── models/                # Pydantic models for validation
│   ├── __init__.py
│   ├── project.py         # Project model
│   ├── portfolio.py       # Portfolio model
│   ├── media.py           # Media model
│   └── globals.py         # Global content models
├── services/              # Business logic layer
│   ├── __init__.py
│   ├── cms_client.py      # CMS API client wrapper
│   ├── auth.py            # Authentication service
│   ├── cache.py           # Caching layer
│   └── audit.py           # Audit logging service
├── tools/                 # MCP tool definitions
│   ├── __init__.py
│   ├── projects.py        # Project CRUD tools
│   ├── portfolio.py       # Portfolio CRUD tools
│   ├── media.py           # Media management tools
│   ├── globals.py         # Global content tools
│   └── search.py          # Search and discovery tools
├── resources/             # MCP resource definitions
│   ├── __init__.py
│   ├── collections.py     # Collection resources
│   └── globals.py         # Global resources
├── prompts/               # MCP prompt templates
│   ├── __init__.py
│   ├── content_creation.py
│   └── content_management.py
└── utils/                 # Utility functions
    ├── __init__.py
    ├── validation.py      # Input validation
    ├── errors.py          # Custom exceptions
    └── logging.py         # Structured logging
```

#### 6.2.2 Key Classes & Interfaces

**CMSClient Service:**
```python
class CMSClient:
    """Wrapper around Payload CMS REST API"""

    def __init__(self, base_url: str, email: str, password: str):
        self.base_url = base_url
        self.auth = AuthService(email, password)
        self.cache = CacheService()
        self.audit = AuditService()

    async def get_collection(
        self,
        collection: str,
        filters: dict = None,
        limit: int = 100,
        page: int = 1
    ) -> dict:
        """Fetch collection with pagination and filtering"""

    async def create_document(
        self,
        collection: str,
        data: dict,
        draft: bool = True
    ) -> dict:
        """Create new document in collection"""

    async def update_document(
        self,
        collection: str,
        doc_id: str,
        data: dict
    ) -> dict:
        """Update existing document"""

    async def delete_document(
        self,
        collection: str,
        doc_id: str
    ) -> bool:
        """Delete document from collection"""
```

**Tool Implementation Pattern:**
```python
from fastmcp import FastMCP
from pydantic import BaseModel, Field

class CreateProjectInput(BaseModel):
    title: str = Field(..., description="Project title")
    subtitle: str = Field(None, description="Project subtitle")
    client: str = Field(..., description="Client name")
    technologies: list[str] = Field(..., description="Technologies used")
    description: str = Field(..., description="Project description")
    draft: bool = Field(True, description="Create as draft")

@mcp.tool()
async def create_project(
    input: CreateProjectInput,
    context
) -> dict:
    """
    Create a new project in the CMS.

    This tool creates a project with all required metadata, sections,
    and gallery items. Projects are created as drafts by default.
    """
    # Validate input
    # Call CMS client
    # Log operation
    # Return result
```

### 6.3 Data Flow

#### 6.3.1 Create Project Flow

```
1. AI Agent → MCP Tool Call
   Input: create_project({title: "...", client: "...", ...})

2. FastMCP Server → Input Validation
   - Validate against Pydantic model
   - Check required fields
   - Sanitize inputs

3. Server → Authentication
   - Retrieve JWT token from CMS
   - Cache token for reuse
   - Handle token refresh

4. Server → CMS API Request
   POST /api/projects
   Headers: {Authorization: Bearer <token>}
   Body: {id, title, subtitle, metadata, ...}

5. CMS → Database Write
   - Validate against schema
   - Create document in MongoDB
   - Return created document

6. Server → Response Processing
   - Log operation to audit trail
   - Cache result if applicable
   - Transform to MCP response format

7. FastMCP → AI Agent
   Return: {success: true, project: {...}, id: "..."}
```

#### 6.3.2 Publish Draft Flow

```
1. AI Agent → List drafts
   Tool: list_projects({status: "draft"})

2. Server → Return draft projects

3. AI Agent → Review content
   Tool: get_project({id: "project-123"})

4. Server → Return full project details

5. AI Agent → Decide to publish
   Tool: publish_project({id: "project-123"})

6. Server → Update document
   PATCH /api/projects/project-123
   Body: {_status: "published", publishedAt: "2025-11-10T..."}

7. CMS → Update database & return result

8. Server → Audit log & return success
```

### 6.4 Security Architecture

#### 6.4.1 Authentication Flow

```
┌─────────────┐
│ MCP Client  │
│  (Claude)   │
└──────┬──────┘
       │
       │ 1. MCP Tool Call (no auth in MCP layer)
       ▼
┌─────────────────────────────────┐
│    FastMCP Server               │
│                                 │
│  2. Check server config for     │
│     CMS credentials             │
│     (from environment)          │
│                                 │
│  3. Authenticate with CMS       │
│     POST /api/users/login       │
│     {email, password}           │
└──────┬──────────────────────────┘
       │
       │ 4. JWT Token Response
       ▼
┌─────────────────────────────────┐
│    Payload CMS                  │
│                                 │
│  5. Validate credentials        │
│  6. Generate JWT                │
│  7. Return token + user info    │
└──────┬──────────────────────────┘
       │
       │ 8. Cache token (15min TTL)
       ▼
┌─────────────────────────────────┐
│  FastMCP Server - Token Cache   │
│                                 │
│  9. Store: {                    │
│       token: "eyJ...",           │
│       expires: timestamp,        │
│       user: {role: "admin"}      │
│     }                            │
└──────┬──────────────────────────┘
       │
       │ 10. Subsequent requests use cached token
       │     Authorization: Bearer eyJ...
       ▼
```

#### 6.4.2 Authorization Levels

| Role | Create | Read | Update | Delete | Publish |
|------|--------|------|--------|--------|---------|
| **Public** | ❌ | ✅ (published only) | ❌ | ❌ | ❌ |
| **Editor** | ✅ | ✅ (all) | ✅ (own drafts) | ❌ | ❌ |
| **Admin** | ✅ | ✅ (all) | ✅ (all) | ✅ | ✅ |
| **MCP Server** | ✅ | ✅ (all) | ✅ (all) | ⚠️ (flagged) | ⚠️ (requires approval) |

**Note:** MCP server will run with admin credentials but implement additional safety checks:
- All destructive operations (delete) require explicit confirmation
- Publish operations can be configured to require human approval
- All operations are audit-logged

---

## 7. API Specifications

### 7.1 MCP Tools Specification

#### Tool: `create_project`

**Description:** Create a new project with full metadata, sections, and gallery items.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique project ID (URL slug)",
      "pattern": "^[a-z0-9-]+$"
    },
    "title": {
      "type": "string",
      "description": "Project title"
    },
    "subtitle": {
      "type": "string",
      "description": "Project subtitle (optional)"
    },
    "client": {
      "type": "string",
      "description": "Client name"
    },
    "date": {
      "type": "string",
      "description": "Project date (YYYY-MM-DD)"
    },
    "role": {
      "type": "string",
      "description": "Your role in the project"
    },
    "technologies": {
      "type": "array",
      "items": {"type": "string"},
      "description": "Technologies used"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "tag": {"type": "string"}
        }
      },
      "description": "Project tags for categorization"
    },
    "hero": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["image", "video"]
        },
        "imageUrl": {"type": "string"},
        "videoUrl": {"type": "string"},
        "alt": {"type": "string"}
      },
      "description": "Hero image or video"
    },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {"type": "string"},
          "content": {"type": "string"},
          "layout": {
            "type": "string",
            "enum": ["full-width", "two-column"]
          }
        }
      },
      "description": "Project content sections"
    },
    "gallery": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": ["image", "video"]
          },
          "url": {"type": "string"},
          "caption": {"type": "string"},
          "width": {
            "type": "string",
            "enum": ["full", "half"]
          }
        }
      },
      "description": "Gallery images/videos"
    },
    "draft": {
      "type": "boolean",
      "default": true,
      "description": "Create as draft (requires publishing)"
    }
  },
  "required": ["id", "title", "client", "technologies"]
}
```

**Output Schema:**
```json
{
  "type": "object",
  "properties": {
    "success": {"type": "boolean"},
    "projectId": {"type": "string"},
    "status": {
      "type": "string",
      "enum": ["draft", "published"]
    },
    "createdAt": {"type": "string"},
    "message": {"type": "string"}
  }
}
```

**Example Usage:**
```python
result = await create_project({
    "id": "react-portfolio-2025",
    "title": "React Portfolio Website",
    "subtitle": "Modern portfolio with CMS integration",
    "client": "Personal Project",
    "date": "2025-11",
    "role": "Full Stack Developer",
    "technologies": ["React", "TypeScript", "Payload CMS", "MongoDB"],
    "tags": [{"tag": "web"}, {"tag": "fullstack"}],
    "hero": {
        "type": "image",
        "imageUrl": "/media/portfolio-hero.jpg",
        "alt": "Portfolio website screenshot"
    },
    "sections": [
        {
            "title": "Overview",
            "content": "A modern portfolio website built with React...",
            "layout": "full-width"
        }
    ],
    "draft": true
})
```

#### Tool: `publish_project`

**Description:** Publish a draft project, making it visible on the public website.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Project ID to publish"
    },
    "requireApproval": {
      "type": "boolean",
      "default": false,
      "description": "Flag for human approval before publishing"
    }
  },
  "required": ["id"]
}
```

**Output Schema:**
```json
{
  "type": "object",
  "properties": {
    "success": {"type": "boolean"},
    "projectId": {"type": "string"},
    "status": {"type": "string"},
    "publishedAt": {"type": "string"},
    "message": {"type": "string"}
  }
}
```

#### Tool: `list_projects`

**Description:** List all projects with optional filtering.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["all", "draft", "published"],
      "default": "all"
    },
    "tag": {
      "type": "string",
      "description": "Filter by tag"
    },
    "limit": {
      "type": "integer",
      "default": 100,
      "maximum": 100
    },
    "page": {
      "type": "integer",
      "default": 1,
      "minimum": 1
    }
  }
}
```

**Output Schema:**
```json
{
  "type": "object",
  "properties": {
    "projects": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "title": {"type": "string"},
          "client": {"type": "string"},
          "status": {"type": "string"},
          "createdAt": {"type": "string"},
          "publishedAt": {"type": "string"}
        }
      }
    },
    "totalDocs": {"type": "integer"},
    "page": {"type": "integer"},
    "totalPages": {"type": "integer"}
  }
}
```

### 7.2 MCP Resources Specification

#### Resource: `cms://projects`

**Description:** List all projects in the CMS.

**URI Template:** `cms://projects?status={status}&tag={tag}&page={page}`

**Response Schema:**
```json
{
  "type": "object",
  "properties": {
    "uri": {"type": "string"},
    "mimeType": {"type": "string", "const": "application/json"},
    "content": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "title": {"type": "string"},
          "client": {"type": "string"},
          "status": {"type": "string"},
          "tags": {"type": "array"}
        }
      }
    }
  }
}
```

#### Resource: `cms://projects/{id}`

**Description:** Get specific project by ID.

**URI Template:** `cms://projects/{id}`

**Response:** Full project object with all fields.

### 7.3 MCP Prompts Specification

#### Prompt: `create-project-from-description`

**Description:** Guide AI through creating a project from natural language description.

**Arguments:**
- `description` (string): Natural language description of the project

**Template:**
```
You are helping create a new project in the CMS. Based on this description:

"{description}"

Please create a project with:
1. A unique ID (lowercase, hyphen-separated)
2. A clear, concise title
3. Client name
4. Technologies used
5. Your role
6. Project sections describing the work
7. Appropriate tags

Use the create_project tool with proper formatting.
Create as draft for review before publishing.
```

---

## 8. Security & Authentication

### 8.1 Authentication Strategy

**Environment-Based Credentials:**
```bash
# .env file for MCP server
CMS_API_URL=https://cms2.emmanuelu.com/api
CMS_ADMIN_EMAIL=admin@emmanuelu.com
CMS_ADMIN_PASSWORD=<secure-password>
CMS_TOKEN_CACHE_TTL=900  # 15 minutes
```

**Token Management:**
- Authenticate once on server startup
- Cache JWT token with TTL
- Auto-refresh before expiration
- Retry logic on 401 responses

### 8.2 Authorization Controls

**Operation-Level Permissions:**

| Operation | Requires Admin | Requires Approval | Audit Log |
|-----------|----------------|-------------------|-----------|
| `create_*` | ❌ | Optional | ✅ |
| `update_*` | ❌ | Optional | ✅ |
| `delete_*` | ✅ | ✅ | ✅ |
| `publish_*` | ⚠️ | Optional | ✅ |
| `get_*` | ❌ | ❌ | ❌ |
| `list_*` | ❌ | ❌ | ❌ |

### 8.3 Input Validation

**Multi-Layer Validation:**

1. **Pydantic Models:** Type validation and field constraints
2. **Custom Validators:** Business logic validation (e.g., unique IDs)
3. **CMS Schema Validation:** Final validation by Payload CMS
4. **Sanitization:** Remove/escape dangerous characters

**Example Sanitization:**
```python
def sanitize_content(content: str) -> str:
    """Remove potentially dangerous content"""
    # Remove script tags
    # Escape HTML entities
    # Validate URLs
    # Check for SQL injection patterns
    return cleaned_content
```

### 8.4 Rate Limiting

**Request Limits:**
- 100 requests per minute per MCP client
- 10 write operations per minute
- 1000 read operations per hour

**Implementation:**
```python
from fastmcp import Context

@mcp.tool()
@rate_limit(max_requests=10, window=60)  # 10 per minute
async def create_project(input: CreateProjectInput, context: Context):
    ...
```

### 8.5 Audit Logging

**Logged Information:**
```json
{
  "timestamp": "2025-11-10T12:34:56Z",
  "operation": "create_project",
  "actor": "mcp-server",
  "resourceType": "project",
  "resourceId": "react-portfolio-2025",
  "action": "create",
  "status": "success",
  "ipAddress": "127.0.0.1",
  "changes": {
    "before": null,
    "after": {"title": "...", ...}
  },
  "metadata": {
    "draft": true,
    "requiresApproval": false
  }
}
```

**Storage:**
- Append-only log file
- Optional database storage
- Retention: 90 days minimum

---

## 9. Testing Strategy

### 9.1 Unit Tests

**Coverage Requirements:**
- Services: 90% coverage
- Tools: 85% coverage
- Resources: 80% coverage
- Utilities: 95% coverage

**Example Test:**
```python
import pytest
from fastmcp_cms_server.services.cms_client import CMSClient
from fastmcp_cms_server.models.project import CreateProjectInput

@pytest.mark.asyncio
async def test_create_project_success():
    """Test successful project creation"""
    client = CMSClient(base_url="http://test", email="test", password="test")

    input_data = CreateProjectInput(
        id="test-project",
        title="Test Project",
        client="Test Client",
        technologies=["Python", "FastMCP"]
    )

    result = await client.create_document("projects", input_data.dict())

    assert result["success"] == True
    assert result["id"] == "test-project"
```

### 9.2 Integration Tests

**Test Scenarios:**
1. Full project creation workflow (create → update → publish)
2. Portfolio item management
3. Global content updates
4. Media upload and management
5. Search and filtering operations
6. Error handling and retry logic
7. Authentication token refresh

**Test Environment:**
- Separate test CMS instance
- Mock MongoDB database
- Test data fixtures

### 9.3 End-to-End Tests

**Workflow Tests:**
```python
@pytest.mark.e2e
async def test_ai_publish_workflow():
    """Test complete AI-driven publishing workflow"""
    # 1. AI creates draft project
    project = await create_project(draft=True, ...)

    # 2. AI lists drafts
    drafts = await list_projects(status="draft")
    assert project["id"] in [d["id"] for d in drafts]

    # 3. AI reviews content
    details = await get_project(id=project["id"])
    assert details["status"] == "draft"

    # 4. AI publishes project
    result = await publish_project(id=project["id"])
    assert result["status"] == "published"

    # 5. Verify public visibility
    published = await list_projects(status="published")
    assert project["id"] in [p["id"] for p in published]
```

### 9.4 Security Tests

**Security Test Cases:**
1. SQL injection attempts in input fields
2. XSS attempts in content fields
3. Authentication bypass attempts
4. Rate limit enforcement
5. Invalid token handling
6. Permission boundary tests
7. Audit log integrity

### 9.5 Performance Tests

**Load Testing:**
- Concurrent requests: 50 simultaneous connections
- Sustained load: 1000 requests over 10 minutes
- Stress testing: increase load until failure
- Measure: response times, error rates, resource usage

**Benchmarks:**
- p50 response time: < 500ms
- p95 response time: < 2000ms
- p99 response time: < 5000ms
- Error rate: < 0.1%

---

## 10. Deployment Plan

### 10.1 Deployment Options

#### Option 1: Local Development (Recommended for v1.0)

**Setup:**
```bash
# Install dependencies
uv pip install fastmcp pydantic requests python-dotenv

# Configure environment
cp .env.example .env
# Edit .env with CMS credentials

# Run server
python -m fastmcp_cms_server.server
```

**MCP Client Configuration (Claude Desktop):**
```json
{
  "mcpServers": {
    "cms": {
      "command": "python",
      "args": ["-m", "fastmcp_cms_server.server"],
      "env": {
        "CMS_API_URL": "https://cms2.emmanuelu.com/api",
        "CMS_ADMIN_EMAIL": "admin@emmanuelu.com"
      }
    }
  }
}
```

#### Option 2: FastMCP Cloud (Future)

**Benefits:**
- No local setup required
- Automatic scaling
- Built-in monitoring
- Easy sharing with team

**Setup:**
```bash
# Deploy to FastMCP Cloud
fastmcp deploy --name cms-server
```

#### Option 3: Self-Hosted HTTP/SSE Server

**Setup:**
```python
# server.py with HTTP transport
if __name__ == "__main__":
    mcp.run(transport="sse", host="0.0.0.0", port=8000)
```

**Docker Deployment:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "-m", "fastmcp_cms_server.server"]
```

### 10.2 Environment Configuration

**Production Environment Variables:**
```bash
# CMS Configuration
CMS_API_URL=https://cms2.emmanuelu.com/api
CMS_ADMIN_EMAIL=mcp-server@emmanuelu.com
CMS_ADMIN_PASSWORD=${SECRET_CMS_PASSWORD}

# Server Configuration
MCP_SERVER_NAME="CMS Publisher"
MCP_SERVER_VERSION="1.0.0"
LOG_LEVEL=INFO
AUDIT_LOG_PATH=/var/log/mcp-cms/audit.log

# Performance Configuration
TOKEN_CACHE_TTL=900
REQUEST_TIMEOUT=30
MAX_RETRIES=3
RETRY_BACKOFF=2

# Security Configuration
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
REQUIRE_APPROVAL_FOR_PUBLISH=false
REQUIRE_APPROVAL_FOR_DELETE=true
```

### 10.3 Monitoring & Observability

**Health Checks:**
```python
@mcp.tool()
async def health_check() -> dict:
    """Check MCP server and CMS connectivity"""
    return {
        "status": "healthy",
        "cms_connected": await cms_client.check_health(),
        "uptime": get_uptime(),
        "version": "1.0.0"
    }
```

**Metrics to Track:**
- Request count by operation
- Success/error rates
- Response times (p50, p95, p99)
- Active connections
- Cache hit rate
- Token refresh count
- Audit log size

**Logging Strategy:**
```python
import structlog

logger = structlog.get_logger()

logger.info(
    "project_created",
    project_id="react-portfolio",
    status="draft",
    duration_ms=123
)
```

### 10.4 Rollback Plan

**Rollback Triggers:**
- Error rate > 5%
- Response time p95 > 10 seconds
- CMS connection failures > 3 consecutive
- Critical security vulnerability discovered

**Rollback Steps:**
1. Stop MCP server
2. Revert to previous version
3. Clear cache
4. Restart server
5. Verify health checks
6. Monitor for 30 minutes

---

## 11. Success Metrics

### 11.1 Adoption Metrics

**Target Metrics (3 months post-launch):**
- AI-created content: 50% of new projects
- AI-updated content: 30% of content updates
- Publishing workflow usage: 80% of new content goes through draft → publish
- Admin time saved: 5 hours per week

### 11.2 Performance Metrics

**SLA Targets:**
- Availability: 99.5% uptime
- Response time p95: < 2 seconds
- Error rate: < 0.5%
- Data integrity: 100% (zero data loss)

### 11.3 Quality Metrics

**Content Quality:**
- AI-generated content approval rate: > 80%
- Content requiring edits: < 30%
- Content rollback rate: < 5%

### 11.4 Business Metrics

**Value Delivered:**
- Time to publish new project: reduced from 30 min → 5 min
- Content creation throughput: increased by 3x
- Admin overhead: reduced by 50%
- Content freshness: increased update frequency by 2x

---

## 12. Timeline & Milestones

### Phase 1: Foundation (Week 1-2)

**Week 1: Setup & Core Infrastructure**
- ✅ Research FastMCP and Payload CMS integration
- ✅ Create PRD (this document)
- Set up development environment
- Install FastMCP and dependencies
- Create project structure
- Implement CMS client service
- Set up authentication

**Week 2: Core Tools Development**
- Implement project CRUD tools
- Implement portfolio CRUD tools
- Add input validation with Pydantic
- Create basic error handling
- Write unit tests for services

**Deliverables:**
- Working MCP server with basic CRUD tools
- Test coverage: 70%
- Local development setup complete

### Phase 2: Features & Resources (Week 3-4)

**Week 3: Resources & Advanced Tools**
- Implement MCP resources for collections
- Add global content management tools
- Implement search and filtering
- Create media management tools
- Add caching layer

**Week 4: Prompts & Workflows**
- Create MCP prompts for common workflows
- Implement draft/publish workflow
- Add approval mechanism
- Create audit logging
- Write integration tests

**Deliverables:**
- Full feature set complete
- Test coverage: 80%
- Working draft/publish workflow
- Audit logging operational

### Phase 3: Testing & Hardening (Week 5-6)

**Week 5: Testing & Security**
- Comprehensive integration testing
- Security testing and hardening
- Performance testing and optimization
- Load testing
- Fix bugs and issues

**Week 6: Documentation & Polish**
- Write API documentation
- Create usage examples
- Write deployment guide
- Create troubleshooting guide
- Final testing and validation

**Deliverables:**
- Test coverage: 85%
- All security tests passing
- Complete documentation
- Production-ready codebase

### Phase 4: Deployment & Launch (Week 7-8)

**Week 7: Deployment Preparation**
- Set up production environment
- Configure monitoring and alerting
- Create deployment scripts
- Conduct final security review
- Create rollback plan

**Week 8: Launch & Monitoring**
- Deploy to production
- Monitor performance and errors
- Gather user feedback
- Quick iterations on issues
- Celebrate launch! 🎉

**Deliverables:**
- Production deployment
- Monitoring dashboards
- Launch documentation
- Support plan

---

## 13. Risks & Mitigation

### Risk 1: CMS API Changes

**Risk:** Payload CMS API changes break MCP server functionality

**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Pin CMS version in documentation
- Implement comprehensive integration tests
- Add API version checking on startup
- Create migration guide for CMS upgrades
- Monitor Payload CMS release notes

### Risk 2: Authentication Token Expiration

**Risk:** JWT tokens expire during long-running operations

**Likelihood:** High
**Impact:** Medium
**Mitigation:**
- Implement automatic token refresh
- Add retry logic on 401 responses
- Cache tokens with TTL tracking
- Implement proactive refresh before expiration
- Add token refresh monitoring

### Risk 3: Data Integrity Issues

**Risk:** AI creates malformed or invalid content

**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Multi-layer validation (Pydantic → Custom → CMS)
- Implement draft-by-default for AI operations
- Add rollback capabilities
- Comprehensive audit logging
- Human review for critical content

### Risk 4: Rate Limiting Impact

**Risk:** CMS rate limits block legitimate operations

**Likelihood:** Low
**Impact:** Medium
**Mitigation:**
- Implement client-side rate limiting
- Add request queuing
- Implement exponential backoff
- Monitor rate limit headers
- Cache aggressively to reduce requests

### Risk 5: Security Vulnerabilities

**Risk:** MCP server introduces security vulnerabilities

**Likelihood:** Medium
**Impact:** Critical
**Mitigation:**
- Comprehensive input validation and sanitization
- Regular security audits
- Principle of least privilege
- Audit logging for all operations
- Rate limiting and authentication
- Keep dependencies updated

### Risk 6: Performance Degradation

**Risk:** MCP server slows down under load

**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Implement caching layer
- Add connection pooling
- Load testing before production
- Horizontal scaling capability
- Performance monitoring and alerting

### Risk 7: Incomplete Documentation

**Risk:** Users struggle to use MCP server effectively

**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Comprehensive API documentation
- Usage examples for all tools
- Troubleshooting guide
- Video tutorials
- Community support channel

---

## 14. Future Enhancements

### Phase 2 Features (Post v1.0)

**Advanced Publishing Workflows:**
- Multi-stage approval (draft → review → approved → published)
- Scheduled publishing with cron jobs
- Content expiration and archiving
- A/B testing support for content variants

**Content Intelligence:**
- AI-powered content suggestions
- Duplicate content detection
- SEO optimization recommendations
- Automatic tag generation
- Content quality scoring

**Collaboration Features:**
- Multi-user draft editing
- Comment and review system
- Change tracking and version history
- Conflict resolution for simultaneous edits

**Analytics Integration:**
- Content performance tracking
- AI operation analytics
- Publishing metrics dashboard
- Cost tracking for AI operations

**Extended CMS Support:**
- Support for other CMS platforms (Strapi, Contentful)
- Multi-CMS management from single server
- CMS migration tools

**Developer Experience:**
- Web UI for testing tools
- Interactive API explorer
- Webhook support for events
- GraphQL API support
- TypeScript SDK for custom integrations

### Phase 3 Features (Future)

**Enterprise Features:**
- Multi-tenancy support
- Role-based access control (RBAC)
- SSO integration (SAML, OAuth)
- Compliance features (GDPR, CCPA)
- Advanced audit trails and reporting

**AI Enhancements:**
- Content generation from templates
- Automated image alt text generation
- Content translation support
- Voice-to-content workflows
- Video content summarization

**Integration Ecosystem:**
- Social media auto-posting
- Email newsletter integration
- Asset management (DAM) integration
- Marketing automation platforms
- Analytics platforms (GA4, Mixpanel)

---

## 15. Appendices

### Appendix A: Glossary

- **MCP:** Model Context Protocol - standardized protocol for AI-to-service communication
- **FastMCP:** Python framework for building MCP servers
- **Payload CMS:** TypeScript-first headless CMS
- **Tool:** Callable function exposed by MCP server to AI agents
- **Resource:** Read-only data source exposed via URI templates
- **Prompt:** Reusable message template for guiding AI interactions
- **Draft:** Unpublished content visible only to admins
- **Published:** Content visible on public website
- **Audit Log:** Record of all operations performed on content

### Appendix B: References

**Documentation:**
- [FastMCP Official Docs](https://gofastmcp.com/)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

**Code Repositories:**
- [FastMCP GitHub](https://github.com/jlowin/fastmcp)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)

**Related Projects:**
- Current CMS: `/home/user/reactfolionew/payload/`
- Frontend API Client: `/home/user/reactfolionew/src/utils/payloadApi.ts`
- Migration Tools: `/home/user/reactfolionew/migrate-to-cms-enhanced.js`

### Appendix C: Configuration Examples

**Complete .env File:**
```bash
# CMS Configuration
CMS_API_URL=https://cms2.emmanuelu.com/api
CMS_ADMIN_EMAIL=mcp-server@emmanuelu.com
CMS_ADMIN_PASSWORD=your-secure-password-here

# Server Configuration
MCP_SERVER_NAME=CMS Publisher
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=INFO
AUDIT_LOG_PATH=./logs/audit.log

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

**MCP Client Config (Claude Desktop):**
```json
{
  "mcpServers": {
    "cms-publisher": {
      "command": "python",
      "args": ["-m", "fastmcp_cms_server.server"],
      "env": {
        "CMS_API_URL": "https://cms2.emmanuelu.com/api",
        "CMS_ADMIN_EMAIL": "mcp-server@emmanuelu.com",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Appendix D: Success Criteria Checklist

**v1.0 Launch Criteria:**

Core Functionality:
- [ ] All CRUD operations working for Projects
- [ ] All CRUD operations working for Portfolio
- [ ] Global content management working
- [ ] Media management working
- [ ] Search and filtering working

Quality:
- [ ] Test coverage ≥ 80%
- [ ] All security tests passing
- [ ] Performance benchmarks met
- [ ] Documentation complete

Deployment:
- [ ] Production environment configured
- [ ] Monitoring and alerts set up
- [ ] Audit logging operational
- [ ] Rollback plan tested

User Experience:
- [ ] All tools have clear descriptions
- [ ] Error messages are helpful
- [ ] Example usage documented
- [ ] Troubleshooting guide available

Security:
- [ ] Authentication working
- [ ] Authorization enforced
- [ ] Input validation comprehensive
- [ ] Audit logging complete
- [ ] Rate limiting implemented

---

**End of PRD**

*This document is a living document and will be updated as the project evolves.*

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-10 | Engineering Team | Initial PRD creation |
