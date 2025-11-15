# Request/Response Logging Format

This document describes the logging format used for quality checks and auditing.

## Configuration

Logging is configured in `.env`:

```env
ENABLE_REQUEST_LOGGING=true
REQUEST_LOG_FILE=api_request_log.txt
```

## Log File Location

By default, logs are written to: `api_request_log.txt`

## Log Entry Format

Each API request generates three types of log entries:

### 1. REQUEST Entry

```
================================================================================
REQUEST - req_YYYYMMDD_HHMMSS_ffffff
================================================================================
Timestamp: 2025-11-15T12:21:12.042535
Endpoint:  /assess
Method:    POST

Request Data:
{
  "product_name": "Zoom",
  "company_name": "Zoom Video Communications",
  "url": null,
  "sha1": null,
  "model": null,
  "force_refresh": false
}
--------------------------------------------------------------------------------
```

### 2. LLM INTERACTION Entry (if LLM was called)

```
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
LLM INTERACTION - req_YYYYMMDD_HHMMSS_ffffff
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Timestamp: 2025-11-15T12:21:12.042535
Model:     gpt-4
Duration:  23228.66ms

--- PROMPT START ---
You are a cybersecurity expert conducting a comprehensive security assessment...
[Full prompt text]
--- PROMPT END ---

--- LLM RESPONSE START ---
{
  "vendor": {
    "name": "Zoom Video Communications",
    "website": "https://zoom.us/",
    ...
  },
  ...
}
--- LLM RESPONSE END ---
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

### 3. RESPONSE Entry

```
RESPONSE - req_YYYYMMDD_HHMMSS_ffffff
--------------------------------------------------------------------------------
Timestamp:    2025-11-15T12:21:35.271401
Status Code:  200
Duration:     23456.78ms
Model Used:   gpt-4

Response Data:
{
  "product_name": "Zoom",
  "vendor": "Zoom Video Communications",
  "category": "Communication",
  "trust_score": 75,
  "cached": false
}
================================================================================
```

## Log Monitoring

### View Log Statistics

GET `/logs/stats` returns:

```json
{
  "enabled": true,
  "exists": true,
  "path": "/path/to/api_request_log.txt",
  "size_bytes": 12345,
  "size_mb": 0.01,
  "total_requests": 10,
  "last_modified": "2025-11-15T12:21:35.271401"
}
```

## Quality Check Use Cases

### 1. Verify LLM Outputs

Check if the LLM is providing accurate, properly formatted responses:

```bash
grep -A 50 "LLM RESPONSE START" api_request_log.txt
```

### 2. Monitor Performance

Check request durations:

```bash
grep "Duration:" api_request_log.txt
```

### 3. Audit Requests

Find all requests for a specific product:

```bash
grep -B 5 "product_name.*Zoom" api_request_log.txt
```

### 4. Debug Errors

Find failed requests:

```bash
grep -A 10 "Status Code:  5" api_request_log.txt
```

### 5. Model Usage Tracking

See which models were used:

```bash
grep "Model Used:" api_request_log.txt | sort | uniq -c
```

## Log Rotation

The log file will grow over time. Consider implementing log rotation:

```bash
# Manual rotation
mv api_request_log.txt api_request_log_$(date +%Y%m%d).txt
```

Or use `logrotate` on Linux:

```
/path/to/api_request_log.txt {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

## Privacy Considerations

The log file contains:
- Product names and vendor information (potentially sensitive)
- Complete LLM prompts and responses
- API usage patterns

**Recommendations:**
- Restrict file access permissions (chmod 600)
- Store logs securely
- Implement log retention policies
- Consider encrypting archived logs
- Review logs regularly and delete when no longer needed

## Thread Safety

The logger uses thread-safe file writes with locking, so it's safe to use in concurrent environments (multiple workers, async operations).
