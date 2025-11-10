"""Operation schemas for structured MCP outputs."""

from .operation_schemas import (
    OPERATION_SCHEMAS,
    get_schema,
    CreateDocumentOutput,
    UpdateDocumentOutput,
    GetDocumentOutput,
    ListDocumentsOutput,
    DeleteDocumentOutput,
    BatchOperationOutput,
    SearchDocumentsOutput,
    GetGlobalOutput,
    UpdateGlobalOutput,
    HealthCheckOutput,
)

__all__ = [
    "OPERATION_SCHEMAS",
    "get_schema",
    "CreateDocumentOutput",
    "UpdateDocumentOutput",
    "GetDocumentOutput",
    "ListDocumentsOutput",
    "DeleteDocumentOutput",
    "BatchOperationOutput",
    "SearchDocumentsOutput",
    "GetGlobalOutput",
    "UpdateGlobalOutput",
    "HealthCheckOutput",
]
