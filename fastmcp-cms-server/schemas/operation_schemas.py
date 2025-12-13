"""JSON schemas for operation outputs (MCP 2025 Tool Output Schemas)."""

from typing import TypedDict, Literal, Optional


# ============================================================================
# TypedDict Definitions for Python Type Hints
# ============================================================================

class CreateDocumentOutput(TypedDict):
    """Structured output for create operations."""
    success: bool
    documentId: str
    status: Literal["draft", "published"]
    message: str
    data: dict


class UpdateDocumentOutput(TypedDict):
    """Structured output for update operations."""
    success: bool
    documentId: str
    message: str
    data: dict


class GetDocumentOutput(TypedDict):
    """Structured output for get operations."""
    success: bool
    documentId: str
    data: dict


class ListDocumentsOutput(TypedDict):
    """Structured output for list operations."""
    success: bool
    documents: list[dict]
    totalDocs: int
    page: int
    totalPages: int
    limit: int


class DeleteDocumentOutput(TypedDict):
    """Structured output for delete operations."""
    success: bool
    documentId: str
    message: str


class BatchOperationOutput(TypedDict):
    """Structured output for batch operations."""
    success: bool
    totalRequested: int
    successful: int
    failed: int
    results: list[dict]
    errors: list[dict]


class SearchDocumentsOutput(TypedDict):
    """Structured output for search operations."""
    success: bool
    results: list[dict]
    totalResults: int
    query: str


class GetGlobalOutput(TypedDict):
    """Structured output for get global operations."""
    success: bool
    data: dict


class UpdateGlobalOutput(TypedDict):
    """Structured output for update global operations."""
    success: bool
    message: str
    data: dict


class HealthCheckOutput(TypedDict):
    """Structured output for health check."""
    status: str
    server: dict
    cms: dict
    features: dict


# ============================================================================
# JSON Schema Definitions (MCP 2025 Standard)
# ============================================================================

OPERATION_SCHEMAS = {
    # Collection Operations
    "create": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of document creation",
        "properties": {
            "success": {
                "type": "boolean",
                "description": "Whether the operation succeeded"
            },
            "documentId": {
                "type": "string",
                "description": "ID of the created document"
            },
            "status": {
                "type": "string",
                "enum": ["draft", "published"],
                "description": "Document status"
            },
            "message": {
                "type": "string",
                "description": "Human-readable result message"
            },
            "data": {
                "type": "object",
                "description": "Full document data"
            }
        },
        "required": ["success", "documentId", "message"]
    },

    "update": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of document update",
        "properties": {
            "success": {
                "type": "boolean",
                "description": "Whether the operation succeeded"
            },
            "documentId": {
                "type": "string",
                "description": "ID of the updated document"
            },
            "message": {
                "type": "string",
                "description": "Human-readable result message"
            },
            "data": {
                "type": "object",
                "description": "Updated document data"
            }
        },
        "required": ["success", "documentId", "message"]
    },

    "get": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Single document retrieval result",
        "properties": {
            "success": {
                "type": "boolean",
                "description": "Whether the operation succeeded"
            },
            "documentId": {
                "type": "string",
                "description": "ID of the document"
            },
            "data": {
                "type": "object",
                "description": "Full document data"
            }
        },
        "required": ["success", "documentId", "data"]
    },

    "list": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Paginated list of documents",
        "properties": {
            "success": {
                "type": "boolean",
                "description": "Whether the operation succeeded"
            },
            "documents": {
                "type": "array",
                "items": {"type": "object"},
                "description": "Array of documents"
            },
            "totalDocs": {
                "type": "integer",
                "description": "Total number of documents matching query"
            },
            "page": {
                "type": "integer",
                "description": "Current page number"
            },
            "totalPages": {
                "type": "integer",
                "description": "Total number of pages"
            },
            "limit": {
                "type": "integer",
                "description": "Documents per page"
            }
        },
        "required": ["success", "documents", "totalDocs"]
    },

    "delete": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of document deletion",
        "properties": {
            "success": {
                "type": "boolean",
                "description": "Whether the operation succeeded"
            },
            "documentId": {
                "type": "string",
                "description": "ID of the deleted document"
            },
            "message": {
                "type": "string",
                "description": "Human-readable result message"
            }
        },
        "required": ["success", "documentId", "message"]
    },

    "publish": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of document publication",
        "properties": {
            "success": {
                "type": "boolean",
                "description": "Whether the operation succeeded"
            },
            "documentId": {
                "type": "string",
                "description": "ID of the published document"
            },
            "status": {
                "type": "string",
                "enum": ["published", "requires_approval"],
                "description": "Publication status"
            },
            "message": {
                "type": "string",
                "description": "Human-readable result message"
            },
            "requiresApproval": {
                "type": "boolean",
                "description": "Whether human approval is required"
            }
        },
        "required": ["success", "documentId", "message"]
    },

    # Batch Operations
    "batch_create": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of batch creation",
        "properties": {
            "success": {
                "type": "boolean",
                "description": "Whether all operations succeeded"
            },
            "totalRequested": {
                "type": "integer",
                "description": "Total number of documents requested"
            },
            "successful": {
                "type": "integer",
                "description": "Number of successful creations"
            },
            "failed": {
                "type": "integer",
                "description": "Number of failed creations"
            },
            "results": {
                "type": "array",
                "items": {"type": "object"},
                "description": "Array of successful results"
            },
            "errors": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "index": {"type": "integer"},
                        "item": {"type": "object"},
                        "error": {"type": "string"}
                    }
                },
                "description": "Array of errors"
            }
        },
        "required": ["success", "totalRequested", "successful", "failed"]
    },

    "batch_update": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of batch update",
        "properties": {
            "success": {"type": "boolean"},
            "totalRequested": {"type": "integer"},
            "successful": {"type": "integer"},
            "failed": {"type": "integer"},
            "results": {"type": "array"},
            "errors": {"type": "array"}
        },
        "required": ["success", "totalRequested", "successful", "failed"]
    },

    "batch_delete": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of batch deletion",
        "properties": {
            "success": {"type": "boolean"},
            "totalRequested": {"type": "integer"},
            "successful": {"type": "integer"},
            "failed": {"type": "integer"},
            "results": {"type": "array"},
            "errors": {"type": "array"}
        },
        "required": ["success", "totalRequested", "successful", "failed"]
    },

    # Advanced Operations
    "search": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Search results",
        "properties": {
            "success": {"type": "boolean"},
            "results": {
                "type": "array",
                "items": {"type": "object"}
            },
            "totalResults": {"type": "integer"},
            "query": {"type": "string"}
        },
        "required": ["success", "results", "totalResults"]
    },

    "archive": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of archiving document",
        "properties": {
            "success": {"type": "boolean"},
            "documentId": {"type": "string"},
            "message": {"type": "string"}
        },
        "required": ["success", "documentId", "message"]
    },

    "restore": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of restoring document",
        "properties": {
            "success": {"type": "boolean"},
            "documentId": {"type": "string"},
            "message": {"type": "string"}
        },
        "required": ["success", "documentId", "message"]
    },

    # Global Operations
    "get_global": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Global singleton data",
        "properties": {
            "success": {"type": "boolean"},
            "data": {"type": "object"}
        },
        "required": ["success", "data"]
    },

    "update_global": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of global update",
        "properties": {
            "success": {"type": "boolean"},
            "message": {"type": "string"},
            "data": {"type": "object"}
        },
        "required": ["success", "message"]
    },

    "list_globals": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "List of all globals",
        "properties": {
            "success": {"type": "boolean"},
            "globals": {
                "type": "array",
                "items": {"type": "string"}
            }
        },
        "required": ["success", "globals"]
    },

    "export_global": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Exported global data",
        "properties": {
            "success": {"type": "boolean"},
            "globalSlug": {"type": "string"},
            "data": {"type": "object"},
            "exportedAt": {"type": "string", "format": "date-time"}
        },
        "required": ["success", "globalSlug", "data"]
    },

    "import_global": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of global import",
        "properties": {
            "success": {"type": "boolean"},
            "globalSlug": {"type": "string"},
            "message": {"type": "string"}
        },
        "required": ["success", "globalSlug", "message"]
    },

    # Health & Monitoring
    "health_check": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Health check result",
        "properties": {
            "status": {
                "type": "string",
                "enum": ["healthy", "degraded", "unhealthy"]
            },
            "server": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "version": {"type": "string"},
                    "uptime_seconds": {"type": "integer"}
                }
            },
            "cms": {
                "type": "object",
                "properties": {
                    "cms_connected": {"type": "boolean"},
                    "cms_status": {"type": "string"}
                }
            },
            "features": {
                "type": "object",
                "properties": {
                    "caching": {"type": "boolean"},
                    "audit_log": {"type": "boolean"},
                    "draft_mode": {"type": "boolean"}
                }
            }
        },
        "required": ["status", "server", "cms"]
    },

    "metrics": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Server metrics",
        "properties": {
            "cache": {"type": "object"},
            "circuit_breaker": {"type": "object"},
            "connection_pool": {"type": "object"},
            "request_deduplication": {"type": "object"}
        },
        "required": []
    },

    # Media Operations
    "media_upload": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of uploading a media file",
        "properties": {
            "success": {"type": "boolean"},
            "operation": {"type": "string", "enum": ["upload"]},
            "message": {"type": "string"},
            "error": {"type": "string"},
            "mediaId": {"type": ["string", "null"]},
            "data": {"type": ["object", "null"]},
            "meta": {
                "type": "object",
                "properties": {
                    "source": {"type": "string", "enum": ["url", "local_path", "base64"]},
                    "filename": {"type": ["string", "null"]},
                    "mime_type": {"type": ["string", "null"]},
                    "usedTempFile": {"type": "boolean"}
                },
                "required": ["source", "usedTempFile"]
            }
        },
        "required": ["success", "operation"]
    },

    "media_register": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of registering a CDN URL as media",
        "properties": {
            "success": {"type": "boolean"},
            "operation": {"type": "string", "enum": ["register"]},
            "message": {"type": "string"},
            "error": {"type": "string"},
            "mediaId": {"type": ["string", "null"]},
            "data": {"type": ["object", "null"]},
            "meta": {
                "type": "object",
                "properties": {
                    "source": {"type": "string", "enum": ["cdn_url"]}
                },
                "required": ["source"]
            }
        },
        "required": ["success", "operation"]
    },

    "media_get": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of getting a single media document",
        "properties": {
            "success": {"type": "boolean"},
            "operation": {"type": "string", "enum": ["get"]},
            "message": {"type": "string"},
            "error": {"type": "string"},
            "mediaId": {"type": ["string", "null"]},
            "data": {"type": ["object", "null"]}
        },
        "required": ["success", "operation"]
    },

    "media_list": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "description": "Result of listing media documents",
        "properties": {
            "success": {"type": "boolean"},
            "operation": {"type": "string", "enum": ["list"]},
            "message": {"type": "string"},
            "error": {"type": "string"},
            "documents": {
                "type": "array",
                "items": {"type": "object"}
            },
            "totalDocs": {"type": "integer"},
            "page": {"type": "integer"},
            "totalPages": {"type": "integer"},
            "limit": {"type": "integer"}
        },
        "required": ["success", "operation"]
    },
}


def get_schema(operation: str) -> Optional[dict]:
    """
    Get JSON schema for an operation.

    Args:
        operation: Operation name

    Returns:
        JSON schema dictionary or None if not found
    """
    return OPERATION_SCHEMAS.get(operation)
