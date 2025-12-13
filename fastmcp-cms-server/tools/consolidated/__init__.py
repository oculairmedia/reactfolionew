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
from .media import (
    cms_media_ops_handler,
    setup_media_registry,
)

__all__ = [
    "cms_collection_ops_handler",
    "setup_collection_registry",
    "cms_global_ops_handler",
    "setup_global_registry",
    "cms_health_ops_handler",
    "cms_media_ops_handler",
    "setup_media_registry",
]
