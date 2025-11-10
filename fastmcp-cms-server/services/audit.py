"""Audit logging service for tracking operations."""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Optional
from config import Config
from utils.logging import get_logger

logger = get_logger(__name__)


class AuditService:
    """Service for logging operations for security and compliance."""

    def __init__(self):
        """Initialize audit service."""
        self._enabled = Config.ENABLE_AUDIT_LOG
        self._log_path = Path(Config.AUDIT_LOG_PATH)

        if self._enabled:
            # Ensure log directory exists
            self._log_path.parent.mkdir(parents=True, exist_ok=True)
            logger.info("Audit logging enabled", log_path=str(self._log_path))

    def log_operation(
        self,
        operation: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        action: str = "",
        status: str = "success",
        actor: str = "mcp-server",
        changes: Optional[dict] = None,
        metadata: Optional[dict] = None,
        error: Optional[str] = None,
    ) -> None:
        """
        Log an operation to the audit log.

        Args:
            operation: Name of the operation (e.g., "create_project")
            resource_type: Type of resource (e.g., "project", "portfolio")
            resource_id: ID of the resource
            action: Action performed (e.g., "create", "update", "delete")
            status: Operation status ("success", "failure", "error")
            actor: Who performed the operation
            changes: Before/after values for updates
            metadata: Additional metadata
            error: Error message if operation failed
        """
        if not self._enabled:
            return

        audit_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "operation": operation,
            "actor": actor,
            "resourceType": resource_type,
            "resourceId": resource_id,
            "action": action,
            "status": status,
            "changes": changes or {},
            "metadata": metadata or {},
        }

        if error:
            audit_entry["error"] = error

        try:
            # Append to log file
            with open(self._log_path, "a") as f:
                f.write(json.dumps(audit_entry) + "\n")

            logger.debug(
                "Audit log entry created",
                operation=operation,
                resource_type=resource_type,
                resource_id=resource_id,
                status=status,
            )

        except Exception as e:
            logger.error("Failed to write audit log", error=str(e))

    def log_create(
        self,
        resource_type: str,
        resource_id: str,
        data: dict,
        metadata: Optional[dict] = None,
    ) -> None:
        """
        Log a create operation.

        Args:
            resource_type: Type of resource
            resource_id: ID of created resource
            data: Created data
            metadata: Additional metadata
        """
        self.log_operation(
            operation=f"create_{resource_type}",
            resource_type=resource_type,
            resource_id=resource_id,
            action="create",
            changes={"before": None, "after": data},
            metadata=metadata,
        )

    def log_update(
        self,
        resource_type: str,
        resource_id: str,
        before: Optional[dict] = None,
        after: Optional[dict] = None,
        metadata: Optional[dict] = None,
    ) -> None:
        """
        Log an update operation.

        Args:
            resource_type: Type of resource
            resource_id: ID of updated resource
            before: Data before update
            after: Data after update
            metadata: Additional metadata
        """
        self.log_operation(
            operation=f"update_{resource_type}",
            resource_type=resource_type,
            resource_id=resource_id,
            action="update",
            changes={"before": before, "after": after},
            metadata=metadata,
        )

    def log_delete(
        self,
        resource_type: str,
        resource_id: str,
        data: Optional[dict] = None,
        metadata: Optional[dict] = None,
    ) -> None:
        """
        Log a delete operation.

        Args:
            resource_type: Type of resource
            resource_id: ID of deleted resource
            data: Deleted data
            metadata: Additional metadata
        """
        self.log_operation(
            operation=f"delete_{resource_type}",
            resource_type=resource_type,
            resource_id=resource_id,
            action="delete",
            changes={"before": data, "after": None},
            metadata=metadata,
        )

    def log_publish(
        self,
        resource_type: str,
        resource_id: str,
        metadata: Optional[dict] = None,
    ) -> None:
        """
        Log a publish operation.

        Args:
            resource_type: Type of resource
            resource_id: ID of published resource
            metadata: Additional metadata
        """
        self.log_operation(
            operation=f"publish_{resource_type}",
            resource_type=resource_type,
            resource_id=resource_id,
            action="publish",
            metadata=metadata,
        )

    def log_error(
        self,
        operation: str,
        resource_type: str,
        error: str,
        resource_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> None:
        """
        Log an error.

        Args:
            operation: Operation that failed
            resource_type: Type of resource
            error: Error message
            resource_id: ID of resource (if applicable)
            metadata: Additional metadata
        """
        self.log_operation(
            operation=operation,
            resource_type=resource_type,
            resource_id=resource_id,
            status="error",
            error=error,
            metadata=metadata,
        )
