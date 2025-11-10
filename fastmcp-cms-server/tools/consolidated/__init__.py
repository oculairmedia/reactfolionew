"""Consolidated tools for improved functional density."""

from .collections import (
    cms_collection_ops_handler,
    setup_collection_registry,
)
from .globals import (
    cms_global_ops_handler,
    setup_global_registry,
)
from .health import (
    cms_health_ops_handler,
)

__all__ = [
    "cms_collection_ops_handler",
    "setup_collection_registry",
    "cms_global_ops_handler",
    "setup_global_registry",
    "cms_health_ops_handler",
]
