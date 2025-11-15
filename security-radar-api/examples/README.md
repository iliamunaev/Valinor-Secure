# API Usage Examples

This directory contains practical examples for using the AI Security Assessor API.

## Examples

### 1. Cache Retrieval Example

Demonstrates the complete cache workflow:
- Perform an assessment
- Extract the cache_key from response
- Retrieve the assessment from cache
- List all cached assessments

#### Bash Version

```bash
# Run the shell script
./examples/cache_example.sh
```

**Requirements:**
- `curl` installed
- `python3` installed (for JSON parsing)
- API service running at http://localhost:8088

#### Python Version

```bash
# Run the Python script
python examples/cache_example.py

# Or make it executable and run directly
chmod +x examples/cache_example.py
./examples/cache_example.py
```

**Requirements:**
- Python 3.7+
- `requests` library (`pip install requests`)
- API service running at http://localhost:8088

### 2. Example Client

A comprehensive client library with multiple examples:

```bash
# Run the example client (from project root)
python example_client.py
```

This demonstrates:
- Health check
- Basic assessment
- Multiple product assessments
- Cache retrieval workflow
- Listing cached assessments

## Quick Start

Before running any examples, make sure the API service is running:

```bash
# Option 1: Run locally
python main.py

# Option 2: Run with Docker
docker-compose up -d

# Option 3: Use Makefile
make up
```

Then run any example:

```bash
# Cache examples
./examples/cache_example.sh
python examples/cache_example.py

# Full client example
python example_client.py
```

## Example Output

### Cache Example Output

```
🔍 AI Security Assessor - Cache Example
==================================================

1️⃣ Checking if service is running...
✅ Service is running

2️⃣ Step 1: Performing assessment for FileZilla...
✅ Assessment complete!
   Cache Key: 44a7c0bc6d776be269e5a830ed4080...

3️⃣ Step 2: Retrieving assessment from cache...
✅ Successfully retrieved from cache!

📊 Cached Assessment Details:
   Product: FileZilla
   Vendor: Tim Kosse
   Category: File Sharing
   Trust Score: 50/100
   Confidence: Low
   Cached At: 2024-01-15T10:30:00
   Access Count: 2

4️⃣ Step 3: Listing all cached assessments...
✅ Found 3 cached assessments:

   • FileZilla (Tim Kosse)
     Cache Key: 44a7c0bc6d776be269e5a830ed4080...
     Cached: 2024-01-15T10:30:00
     Access Count: 2

   • 1Password (1Password)
     Cache Key: 8f3e4a1b2c9d5e7f6a0b1c2d3e4f5a...
     Cached: 2024-01-15T09:15:00
     Access Count: 1

✅ Cache example completed successfully!

💡 Tip: You can use the cache_key from any assessment to retrieve it later
```

## API Endpoints Used

These examples demonstrate the following endpoints:

- `GET /health` - Health check
- `POST /assess` - Perform assessment
- `GET /cache/{identifier}` - Retrieve cached assessment
- `GET /cache` - List all cached assessments

## Error Handling

All examples include proper error handling:

- Service not running → Clear error message with start instructions
- Invalid cache key → HTTP 404 error with details
- Network errors → Graceful failure with error messages

## Creating Your Own Examples

Use these examples as templates for your own integrations:

**Python Template:**
```python
import requests

API_URL = "http://localhost:8088"

# Perform assessment
response = requests.post(f"{API_URL}/assess", json={
    "product_name": "YourProduct"
})
assessment = response.json()

# Get cache key
cache_key = assessment["cache_key"]

# Retrieve from cache later
cached = requests.get(f"{API_URL}/cache/{cache_key}")
print(cached.json())
```

**Bash Template:**
```bash
API_URL="http://localhost:8088"

# Perform assessment
RESPONSE=$(curl -s -X POST "${API_URL}/assess" \
    -H "Content-Type: application/json" \
    -d '{"product_name": "YourProduct"}')

# Extract cache key
CACHE_KEY=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['cache_key'])")

# Retrieve from cache
curl -s "${API_URL}/cache/${CACHE_KEY}" | python3 -m json.tool
```

## Troubleshooting

### Service Not Running

```
❌ Error: Service is not running at http://localhost:8088
```

**Solution:**
```bash
# Start the service
python main.py
# or
docker-compose up -d
# or
make up
```

### Module Not Found (Python examples)

```
ModuleNotFoundError: No module named 'requests'
```

**Solution:**
```bash
pip install requests
# or install all dependencies
pip install -r requirements.txt
```

### Permission Denied (Bash examples)

```
bash: ./examples/cache_example.sh: Permission denied
```

**Solution:**
```bash
chmod +x examples/cache_example.sh
```

## Additional Resources

- [Main README](../README.md) - Complete project documentation
- [API Documentation](http://localhost:8088/docs) - Interactive API docs (when service is running)
- [Docker Documentation](../DOCKER.md) - Container deployment guide
- [Test Documentation](../tests/README.md) - Test suite documentation
