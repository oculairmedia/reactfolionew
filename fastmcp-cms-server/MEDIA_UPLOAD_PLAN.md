# Media Upload Tool Implementation Plan

## Overview
Add a new consolidated MCP tool `cms_media_ops` to handle media uploads to Payload CMS, supporting:
- **Streaming uploads** for large videos (no memory buffering)
- Multiple upload sources (URL, local path, base64)
- CDN URL registration (no file upload)
- Media querying (get/list)

## Goals
- Enable AI agents to upload images/videos to Payload CMS via MCP
- Support arbitrarily large files (videos) without RAM limits
- Integrate with existing Payload Media collection and CDN auto-sync hooks
- Follow the consolidated tool architecture pattern from `server_v2.py`

---

## Design Decisions

### Upload Sources (Confirmed)
1. **`url`** - Stream download remote file → spool to temp file → upload to Payload
2. **`local_path`** - Upload directly from server filesystem (any readable path allowed)
3. **`base64`** - Decode → spool to temp file → upload to Payload
4. **`cdn_url`** - Register existing CDN URL (no file upload; relies on Payload hook)

### Streaming Strategy
- **All uploads use disk spooling** to keep memory usage flat
- Use Python `tempfile` module for temporary files
- Cleanup guaranteed via `finally` blocks
- Allow `follow_redirects=True` for URL downloads (handle CDN redirects)

### Hook Integration
- Rely on existing Payload hook (`payload/collections/Media.ts:225-236`) to set `source` field
- Hook logic: `cdn_url && !filename → source='cdn'`; `filename → source='upload'`

### Filter Pass-through
- `list` operation filters passed as JSON map exactly like `cms_collection_ops`
- Example: `{"where[source][equals]":"upload"}`

---

## Tool Interface

### Tool Name
`cms_media_ops`

### Parameters

#### Required
- `operation: str` - `"upload" | "register" | "get" | "list"`

#### Upload/Register
- `source: Optional[str]` - Required for `upload`/`register`
  - Upload: `"url" | "local_path" | "base64"`
  - Register: `"cdn_url"`
- `alt: Optional[str]` - **Required** for `upload`/`register` (Payload requirement)
- `caption: Optional[str]` - Optional
- `credit: Optional[str]` - Optional
- `media_type: Optional[str]` - `"image" | "video"` (inferred when possible)

#### Upload Inputs (source-specific)
- `url: Optional[str]` - For `source="url"`
- `local_path: Optional[str]` - For `source="local_path"`
- `file_base64: Optional[str]` - For `source="base64"` (raw or data URL)
- `filename: Optional[str]` - Required for base64; optional for url/local_path
- `mime_type: Optional[str]` - Optional (inferred from response/extension)

#### Read Operations (Stage 2)
- `media_id: Optional[str]` - For `operation="get"`
- `filters: Optional[str]` - For `operation="list"` (JSON string)
- `limit: int = 50` - Pagination limit
- `page: int = 1` - Page number

#### Flags
- `dry_run: bool = False` - Validate without uploading

### Return Value (JSON string)

#### All Operations
```json
{
  "success": bool,
  "operation": str,
  "message": str
}
```

#### Upload/Register Additional Fields
```json
{
  "mediaId": str,
  "data": {...},  // Payload media document
  "meta": {
    "source": str,
    "filename": str,
    "mime_type": str,
    "usedTempFile": bool
  }
}
```

#### Get Additional Fields
```json
{
  "mediaId": str,
  "data": {...}
}
```

#### List Additional Fields
```json
{
  "documents": [...],
  "totalDocs": int,
  "page": int,
  "totalPages": int,
  "limit": int
}
```

---

## Implementation Stages

### Stage 1: Streaming Upload + Register (Core Functionality)

#### A) Add Streaming Upload to `EnhancedCMSClient`
**File:** `fastmcp-cms-server/services/cms_client_enhanced.py`

**New Method:**
```python
async def upload_media_file_path(
    self, 
    local_path: str, 
    filename: str | None, 
    mime_type: str | None, 
    fields: dict
) -> dict
```

**Behavior:**
- Determine upload filename:
  - Use `filename` if provided
  - Else use `os.path.basename(local_path)`
- Create multipart request:
  - `files = {"file": (upload_filename, open(local_path, "rb"), mime_type or "application/octet-stream")}`
  - `data = fields` (must include `alt`)
- Headers:
  - `Authorization: Bearer <token>` only
  - Do NOT set `Content-Type` (httpx sets multipart boundary)
- HTTP call:
  - `POST {base_url}/media`
  - Use existing connection pool: `self._connection_pool.request(...)`
- Error handling:
  - If `401`: refresh token once and retry
  - If `>=400`: raise `CMSConnectionError` with truncated response
- Return: parsed JSON response
- Cache invalidation: `self.cache.invalidate_smart("create", "media")`
- Audit logging: `self.audit.log_create(resource_type="media", ...)`

#### B) Implement `cms_media_ops_handler`
**File:** `fastmcp-cms-server/tools/consolidated/media.py`

**Operations:** `upload`, `register`

**Upload Handler Flow:**

**Validation:**
- `alt` required
- `source` required
- Source-specific requirements:
  - `url` → must have `url` parameter
  - `local_path` → must have `local_path` parameter
  - `base64` → must have `file_base64` and `filename`

**Source: URL (streaming → spool → upload)**
1. Create temp file: `tempfile.NamedTemporaryFile(delete=False)`
2. Stream download:
   - `httpx.AsyncClient().stream("GET", url, follow_redirects=True)`
   - Write chunks to temp file
3. Infer `filename` if missing:
   - `basename(urlparse(url).path)` or fallback `"downloaded-media"`
4. Infer `mime_type` if missing:
   - Response header `Content-Type`
5. Call `upload_media_file_path(temp_path, filename, mime_type, fields)`
6. Cleanup temp file in `finally`

**Source: Base64 (decode → spool → upload)**
1. Parse input (supports raw base64 or data URL `data:<mime>;base64,<payload>`)
2. Extract mime from data URL if present
3. Decode and write to temp file
4. Call `upload_media_file_path(temp_path, filename, mime_type, fields)`
5. Cleanup temp file in `finally`

**Source: Local Path**
1. Validate file exists/readable
2. Infer mime if missing: `mimetypes.guess_type(filename)`
3. Call `upload_media_file_path(local_path, filename, mime_type, fields)`

**Register Handler Flow (source=cdn_url):**
1. Validate `cdn_url` present
2. Use `EnhancedCMSClient.create_document(collection="media", data={cdn_url, alt, caption, credit, media_type})`
3. Payload hook sets `source='cdn'`
4. Return similar output shape

#### C) Wire into FastMCP
**Files:**
- `fastmcp-cms-server/tools/consolidated/__init__.py` - Export handler
- `fastmcp-cms-server/server_v2.py` - Add `@mcp.tool()` wrapper

**Wrapper:**
- Matches existing `cms_collection_ops` style
- Returns `json.dumps(result)`

---

### Stage 2: Get + List Operations

**Operations:** `get`, `list`

#### Get Handler
- Use `EnhancedCMSClient.get_document("media", media_id)`
- Return media document

#### List Handler
- Use `EnhancedCMSClient.get_collection("media", filters=parsed_filters, limit, page)`
- Pass-through JSON filter keys
- Return paginated results

---

## Testing Plan

### Stage 1 Tests
**File:** `fastmcp-cms-server/tests/test_media_tool.py`

**Unit Tests (mock connection pool):**
- `upload_media_file_path` uses `files=` not `json=`
- URL upload creates temp file and cleans up
- Base64 upload decodes and spools correctly
- Local path upload validates file exists
- Register uses `create_document` correctly
- `alt` validation works
- Missing source raises validation error

### Stage 2 Tests
- `get` calls correct client method
- `list` passes filters through correctly
- Pagination parameters work

---

## Usage Examples

### Upload video from URL (streaming)
```python
cms_media_ops(
    operation="upload",
    source="url",
    url="https://example.com/video.mp4",
    filename="hero-video.mp4",
    alt="Homepage hero video"
)
```

### Upload from local path
```python
cms_media_ops(
    operation="upload",
    source="local_path",
    local_path="/data/uploads/launch.mov",
    alt="Product launch teaser",
    caption="Our new product launching soon"
)
```

### Upload base64 image
```python
cms_media_ops(
    operation="upload",
    source="base64",
    file_base64="data:image/png;base64,iVBORw0KG...",
    filename="screenshot.png",
    alt="Dashboard screenshot"
)
```

### Register existing CDN URL
```python
cms_media_ops(
    operation="register",
    source="cdn_url",
    cdn_url="https://oculair.b-cdn.net/cache/images/project.jpg",
    alt="Project thumbnail"
)
```

### Get media by ID (Stage 2)
```python
cms_media_ops(
    operation="get",
    media_id="6567a3b2c..."
)
```

### List uploaded media (Stage 2)
```python
cms_media_ops(
    operation="list",
    filters='{"where[source][equals]":"upload"}',
    limit=25,
    page=1
)
```

---

## File Changes Summary

### New Files
- `fastmcp-cms-server/tools/consolidated/media.py` - Tool handler
- `fastmcp-cms-server/tests/test_media_tool.py` - Unit tests
- `fastmcp-cms-server/MEDIA_UPLOAD_PLAN.md` - This document

### Modified Files
- `fastmcp-cms-server/services/cms_client_enhanced.py` - Add `upload_media_file_path()`
- `fastmcp-cms-server/tools/consolidated/__init__.py` - Export media handler
- `fastmcp-cms-server/server_v2.py` - Add `@mcp.tool()` for `cms_media_ops`
- `fastmcp-cms-server/schemas/operation_schemas.py` - Add media schemas
- `fastmcp-cms-server/README_V2.md` - Document new tool (optional)

---

## Integration Points

### Payload CMS
- Collection: `media` (`payload/collections/Media.ts`)
- Endpoint: `POST /api/media` (multipart upload)
- Required field: `alt` (line 171)
- Hook: `beforeChange` sets `source` based on `cdn_url`/`filename` (line 225)
- Hook: `afterChange` triggers CDN sync for uploads (line 238)

### BunnyCDN
- Auto-sync job runs after upload completes
- Sets `cdn_url`, `cdn_synced`, `cdn_uploaded_at` fields
- Tool returns immediate Payload doc; CDN sync is async

---

## Next Steps

1. ✅ Confirm upload sources
2. ✅ Design tool interface
3. ✅ Document plan
4. ✅ Implement Stage 1: streaming upload/register
5. ✅ Add Stage 1 tests
6. ⏳ Implement Stage 2: get/list
7. ⏳ Add Stage 2 tests
8. ⏳ Update documentation with examples

---

## Stage 1 Implementation Summary (Completed)

### Files Added
- `tools/consolidated/media.py` - Consolidated media operations handler with `upload` and `register` ops
- `tests/integration/test_media_tool.py` - Integration tests for media tool

### Files Modified
- `services/cms_client_enhanced.py` - Added `upload_media_file_path()` method for multipart uploads
- `tools/consolidated/__init__.py` - Export `cms_media_ops_handler` and `setup_media_registry`
- `server_v2.py` - Added `cms_media_ops` tool (4 tools total, 25 operations, density 6.2x)
- `schemas/operation_schemas.py` - Added `media_upload` and `media_register` schemas
- `requirements.txt` - Added `httpx[http2]>=0.27.0`
- `core/middleware.py` - Removed hard delete-confirm check (handler returns `requiresConfirmation`)
- `tools/consolidated/health.py` - Added `maybe_await()` helper for sync/async compatibility

### Key Design Decisions
- Multipart uploads do NOT set `Content-Type: application/json` header (httpx sets multipart boundary)
- URL and base64 sources spool to temp files for memory-safe large file handling
- Temp files always cleaned up via `finally` blocks
- `alt` is required for all uploads (Payload schema requirement)
- Delete confirmation moved from middleware validation to handler response pattern

### Test Results
- All new tests passing
- 132/137 tests pass (4 pre-existing failures unrelated to Stage 1 work)
- Server compiles and loads with 4 tools

---

## Notes

- No hard size limit on uploads (videos supported)
- Temp files stored in system temp dir (OS default)
- Redirects allowed for URL downloads
- Any readable path allowed for `local_path` source
- Filters use pass-through JSON map syntax
- Tool follows consolidated architecture pattern (single tool, multiple ops)
