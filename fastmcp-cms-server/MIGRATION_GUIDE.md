# Migration Guide: V1 → V2

**Version**: 2.0.0
**Date**: 2025-11-10

## Overview

FastMCP CMS Server V2 introduces a consolidated tools architecture that improves functional density from 1.0 to 7.7 operations per tool. This guide helps you migrate from V1 to V2.

## Breaking Changes

### ⚠️ Tool Count Reduced

- **V1**: 18 individual tools
- **V2**: 3 consolidated tools

The individual tools still exist in V1 but are deprecated. V2 uses a new server file (`server_v2.py`) with consolidated tools.

### No API Changes

V2 maintains backwards compatibility at the transport level. Existing clients can continue using resources, but should migrate to consolidated tools for improved performance.

## Migration Steps

### Step 1: Update Server

**Old (V1):**
```bash
python server.py
```

**New (V2):**
```bash
python server_v2.py
```

### Step 2: Update Tool Calls

#### Projects - Create

**Old:**
```python
create_project_tool(input=CreateProjectInput(
    id="proj-1",
    title="My Project",
    client="Client Name",
    technologies=["React", "TypeScript"],
    draft=True
))
```

**New:**
```python
cms_collection_ops(
    operation="create",
    collection="projects",
    data={
        "id": "proj-1",
        "title": "My Project",
        "client": "Client Name",
        "technologies": ["React", "TypeScript"]
    },
    draft=True
)
```

#### Projects - Update

**Old:**
```python
update_project_tool(
    project_id="proj-1",
    input=UpdateProjectInput(title="Updated Title")
)
```

**New:**
```python
cms_collection_ops(
    operation="update",
    collection="projects",
    doc_id="proj-1",
    data={"title": "Updated Title"}
)
```

#### Projects - Get

**Old:**
```python
get_project_tool(project_id="proj-1")
```

**New:**
```python
cms_collection_ops(
    operation="get",
    collection="projects",
    doc_id="proj-1"
)
```

#### Projects - List

**Old:**
```python
list_projects_tool(input=ListProjectsInput(
    status="published",
    limit=50,
    page=1
))
```

**New:**
```python
cms_collection_ops(
    operation="list",
    collection="projects",
    filters={"where[_status][equals]": "published"},
    limit=50,
    page=1
)
```

#### Projects - Delete

**Old:**
```python
delete_project_tool(project_id="proj-1", confirm=True)
```

**New:**
```python
cms_collection_ops(
    operation="delete",
    collection="projects",
    doc_id="proj-1",
    confirm=True
)
```

#### Projects - Publish

**Old:**
```python
publish_project_tool(input=PublishProjectInput(
    id="proj-1",
    requireApproval=False
))
```

**New:**
```python
cms_collection_ops(
    operation="publish",
    collection="projects",
    doc_id="proj-1",
    require_approval=False
)
```

### Portfolio Operations

Same pattern as projects, just change `collection="portfolio"`:

```python
# Create portfolio item
cms_collection_ops(
    operation="create",
    collection="portfolio",  # Changed from "projects"
    data={...}
)
```

### Global Operations

#### Site Settings

**Old:**
```python
get_site_settings_tool()
update_site_settings_tool(input=SiteSettingsInput(
    metaTitle="My Site"
))
```

**New:**
```python
# Get
cms_global_ops(
    operation="get",
    global_slug="site-settings"
)

# Update
cms_global_ops(
    operation="update",
    global_slug="site-settings",
    data={"metaTitle": "My Site"}
)
```

#### Home Intro

**Old:**
```python
get_home_intro_tool()
update_home_intro_tool(input=HomeIntroInput(
    title="Welcome",
    description="My portfolio"
))
```

**New:**
```python
# Get
cms_global_ops(
    operation="get",
    global_slug="home-intro"
)

# Update
cms_global_ops(
    operation="update",
    global_slug="home-intro",
    data={
        "title": "Welcome",
        "description": "My portfolio"
    }
)
```

#### About Page

**Old:**
```python
get_about_page_tool()
update_about_page_tool(input=AboutPageInput(
    aboutMe="I'm a developer..."
))
```

**New:**
```python
# Get
cms_global_ops(
    operation="get",
    global_slug="about-page"
)

# Update
cms_global_ops(
    operation="update",
    global_slug="about-page",
    data={"aboutMe": "I'm a developer..."}
)
```

### Health Check

**Old:**
```python
health_check()
```

**New:**
```python
cms_health_ops(operation="health_check")

# Plus new operations:
cms_health_ops(operation="metrics")
cms_health_ops(operation="cache_stats")
cms_health_ops(operation="connection_status")
```

## New Features in V2

### 1. Batch Operations (3x-5x faster!)

**Not available in V1**

```python
# Batch create
cms_collection_ops(
    operation="batch_create",
    collection="projects",
    items=[
        {"id": "proj-1", "title": "Project 1"},
        {"id": "proj-2", "title": "Project 2"},
        {"id": "proj-3", "title": "Project 3"}
    ],
    parallel=True  # Execute in parallel for 3x speedup
)

# Batch update
cms_collection_ops(
    operation="batch_update",
    collection="projects",
    items=[
        {"id": "proj-1", "data": {"title": "Updated 1"}},
        {"id": "proj-2", "data": {"title": "Updated 2"}}
    ],
    parallel=True
)

# Batch delete
cms_collection_ops(
    operation="batch_delete",
    collection="projects",
    doc_ids=["proj-1", "proj-2", "proj-3"],
    confirm=True,
    parallel=True
)
```

### 2. Search

**Not available in V1**

```python
cms_collection_ops(
    operation="search",
    collection="projects",
    query="react typescript",
    limit=20
)
```

### 3. Archive/Restore

**Not available in V1**

```python
# Archive
cms_collection_ops(
    operation="archive",
    collection="projects",
    doc_id="proj-1"
)

# Restore
cms_collection_ops(
    operation="restore",
    collection="projects",
    doc_id="proj-1"
)
```

### 4. Global Export/Import

**Not available in V1**

```python
# Export for backup
backup = cms_global_ops(
    operation="export",
    global_slug="site-settings"
)

# Import from backup
cms_global_ops(
    operation="import",
    global_slug="site-settings",
    data=backup["data"]
)
```

### 5. Enhanced Monitoring

**Not available in V1**

```python
# Detailed metrics
cms_health_ops(operation="metrics")
# Returns: cache stats, circuit breaker state, deduplication stats, connection pool

# Cache performance
cms_health_ops(operation="cache_stats")
# Returns: hit rate, size, hits, misses

# Connection status
cms_health_ops(operation="connection_status")
# Returns: connection pool stats, circuit breaker state
```

## Performance Improvements

### Before (V1) - Sequential
```python
# Creating 3 projects: 600ms total
await create_project_tool(...)  # 200ms
await create_project_tool(...)  # 200ms
await create_project_tool(...)  # 200ms
```

### After (V2) - Parallel
```python
# Creating 3 projects: 200ms total (3x faster!)
await cms_collection_ops(
    operation="batch_create",
    collection="projects",
    items=[...],  # 3 items
    parallel=True  # Runs in parallel
)
```

## Rollback Plan

If you need to rollback to V1:

```bash
# Stop V2
pkill -f server_v2.py

# Start V1
python server.py
```

V1 and V2 can coexist - they use different server files.

## Timeline

| Date | Milestone |
|------|-----------|
| **2025-11-10** | V2 released, V1 still supported |
| **2025-11-17** | V1 tools marked deprecated |
| **2025-12-01** | V2 becomes default |
| **2026-01-01** | V1 tools removed |

## Support

During migration period (Nov 10 - Dec 31):
- Both V1 and V2 are fully supported
- V1 tools continue to work
- V2 tools offer better performance

## Quick Reference

| Task | V1 Tool | V2 Tool | V2 Operation |
|------|---------|---------|--------------|
| Create project | `create_project_tool` | `cms_collection_ops` | `operation="create", collection="projects"` |
| Update project | `update_project_tool` | `cms_collection_ops` | `operation="update", collection="projects"` |
| Get project | `get_project_tool` | `cms_collection_ops` | `operation="get", collection="projects"` |
| List projects | `list_projects_tool` | `cms_collection_ops` | `operation="list", collection="projects"` |
| Delete project | `delete_project_tool` | `cms_collection_ops` | `operation="delete", collection="projects"` |
| Publish project | `publish_project_tool` | `cms_collection_ops` | `operation="publish", collection="projects"` |
| Create portfolio | `create_portfolio_item_tool` | `cms_collection_ops` | `operation="create", collection="portfolio"` |
| Get settings | `get_site_settings_tool` | `cms_global_ops` | `operation="get", global_slug="site-settings"` |
| Update settings | `update_site_settings_tool` | `cms_global_ops` | `operation="update", global_slug="site-settings"` |
| Health check | `health_check` | `cms_health_ops` | `operation="health_check"` |

## Questions?

- Check README_V2.md for full documentation
- Review the proposal: MCP_DENSITY_IMPROVEMENT_PROPOSAL.md
- Open an issue for support

---

**Happy migrating! 🚀**
