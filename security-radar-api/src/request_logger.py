"""
Request/Response Logger for quality checks and auditing
Logs all API requests and responses to a text file
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional
import threading


class RequestLogger:
    """
    Thread-safe logger for API requests and responses.
    Writes detailed logs to a text file for quality checks.
    """

    def __init__(self, log_file: str = "api_request_log.txt"):
        """
        Initialize the request logger.

        Args:
            log_file: Path to the log file
        """
        self.log_file = Path(log_file)
        self.lock = threading.Lock()

        # Create log file if it doesn't exist
        if not self.log_file.exists():
            self.log_file.touch()
            self._write_header()

    def _write_header(self):
        """Write header to the log file."""
        with open(self.log_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("Security Radar API - Request/Response Log\n")
            f.write(f"Log started: {datetime.utcnow().isoformat()}\n")
            f.write("=" * 80 + "\n\n")

    def _format_dict(self, data: Dict[str, Any], indent: int = 2) -> str:
        """Format dictionary as pretty-printed JSON."""
        try:
            return json.dumps(data, indent=indent, default=str, ensure_ascii=False)
        except Exception as e:
            return f"<Error formatting data: {str(e)}>"

    def log_request(
        self,
        endpoint: str,
        method: str,
        request_data: Dict[str, Any],
        request_id: Optional[str] = None
    ) -> str:
        """
        Log an incoming API request.

        Args:
            endpoint: API endpoint path
            method: HTTP method (GET, POST, etc.)
            request_data: Request payload
            request_id: Optional unique request identifier

        Returns:
            Request ID for correlation with response
        """
        timestamp = datetime.utcnow()
        req_id = request_id or f"req_{timestamp.strftime('%Y%m%d_%H%M%S_%f')}"

        log_entry = [
            "\n" + "=" * 80,
            f"REQUEST - {req_id}",
            "=" * 80,
            f"Timestamp: {timestamp.isoformat()}",
            f"Endpoint:  {endpoint}",
            f"Method:    {method}",
            "",
            "Request Data:",
            self._format_dict(request_data),
            "-" * 80,
        ]

        with self.lock:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write('\n'.join(log_entry) + '\n')

        return req_id

    def log_response(
        self,
        request_id: str,
        status_code: int,
        response_data: Dict[str, Any],
        duration_ms: Optional[float] = None,
        model_used: Optional[str] = None,
        error: Optional[str] = None
    ):
        """
        Log an API response.

        Args:
            request_id: Request ID to correlate with request
            status_code: HTTP status code
            response_data: Response payload
            duration_ms: Request duration in milliseconds
            model_used: LLM model used for this request
            error: Error message if request failed
        """
        timestamp = datetime.utcnow()

        log_entry = [
            f"RESPONSE - {request_id}",
            "-" * 80,
            f"Timestamp:    {timestamp.isoformat()}",
            f"Status Code:  {status_code}",
        ]

        if duration_ms is not None:
            log_entry.append(f"Duration:     {duration_ms:.2f}ms")

        if model_used:
            log_entry.append(f"Model Used:   {model_used}")

        if error:
            log_entry.append(f"Error:        {error}")

        log_entry.extend([
            "",
            "Response Data:",
            self._format_dict(response_data),
            "=" * 80,
            ""
        ])

        with self.lock:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write('\n'.join(log_entry) + '\n')

    def log_llm_interaction(
        self,
        request_id: str,
        model: str,
        prompt: str,
        response: str,
        duration_ms: Optional[float] = None
    ):
        """
        Log LLM prompt and response for quality checks.

        Args:
            request_id: Request ID for correlation
            model: LLM model name
            prompt: Prompt sent to LLM
            response: Response from LLM
            duration_ms: LLM call duration in milliseconds
        """
        timestamp = datetime.utcnow()

        log_entry = [
            "",
            "~" * 80,
            f"LLM INTERACTION - {request_id}",
            "~" * 80,
            f"Timestamp: {timestamp.isoformat()}",
            f"Model:     {model}",
        ]

        if duration_ms is not None:
            log_entry.append(f"Duration:  {duration_ms:.2f}ms")

        log_entry.extend([
            "",
            "--- PROMPT START ---",
            prompt.strip(),
            "--- PROMPT END ---",
            "",
            "--- LLM RESPONSE START ---",
            response.strip(),
            "--- LLM RESPONSE END ---",
            "~" * 80,
            ""
        ])

        with self.lock:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write('\n'.join(log_entry) + '\n')

    def get_log_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the log file.

        Returns:
            Dictionary with log file statistics
        """
        if not self.log_file.exists():
            return {
                "exists": False,
                "size_bytes": 0,
                "size_mb": 0.0,
                "total_requests": 0
            }

        size_bytes = self.log_file.stat().st_size

        # Count requests
        total_requests = 0
        try:
            with open(self.log_file, 'r', encoding='utf-8') as f:
                total_requests = sum(1 for line in f if line.startswith("REQUEST - req_"))
        except Exception:
            pass

        return {
            "exists": True,
            "path": str(self.log_file.absolute()),
            "size_bytes": size_bytes,
            "size_mb": size_bytes / (1024 * 1024),
            "total_requests": total_requests,
            "last_modified": datetime.fromtimestamp(
                self.log_file.stat().st_mtime
            ).isoformat()
        }


# Global logger instance
_logger: Optional[RequestLogger] = None


def get_logger(log_file: Optional[str] = None) -> RequestLogger:
    """
    Get the global logger instance (singleton pattern).

    Args:
        log_file: Optional custom log file path

    Returns:
        RequestLogger instance
    """
    global _logger

    if _logger is None:
        from .config import settings
        log_path = log_file or settings.request_log_file
        _logger = RequestLogger(log_path)

    return _logger
