"""
File utilities — temp file management and cleanup.
"""

import os
import tempfile
from typing import Optional


def save_temp_file(contents: bytes, suffix: str = ".tif") -> str:
    """Save bytes to a temporary file and return the path."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(contents)
        return tmp.name


def cleanup_temp_file(path: Optional[str]):
    """Remove a temporary file if it exists."""
    if path and os.path.exists(path):
        try:
            os.unlink(path)
        except OSError:
            pass
