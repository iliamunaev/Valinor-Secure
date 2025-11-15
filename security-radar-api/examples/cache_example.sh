#!/bin/bash

# Cache Retrieval Example for AI Security Assessor
# This script demonstrates how to use the cache endpoint

set -e

API_URL="http://localhost:8088"

echo "🔍 AI Security Assessor - Cache Example"
echo "========================================"
echo ""

# Check if service is running
echo "1️⃣ Checking if service is running..."
if ! curl -s "${API_URL}/health" > /dev/null 2>&1; then
    echo "❌ Error: Service is not running at ${API_URL}"
    echo "   Please start the service first:"
    echo "   - python main.py"
    echo "   - docker-compose up"
    echo "   - make up"
    exit 1
fi
echo "✅ Service is running"
echo ""

# Step 1: Perform an assessment
echo "2️⃣ Step 1: Performing assessment for FileZilla..."
RESPONSE=$(curl -s -X POST "${API_URL}/assess" \
    -H "Content-Type: application/json" \
    -d '{
        "product_name": "FileZilla",
        "company_name": "Tim Kosse"
    }')

# Extract cache_key from response
CACHE_KEY=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['cache_key'])" 2>/dev/null)

if [ -z "$CACHE_KEY" ]; then
    echo "❌ Error: Failed to get cache_key from response"
    exit 1
fi

echo "✅ Assessment complete!"
echo "   Product: FileZilla"
echo "   Cache Key: ${CACHE_KEY:0:32}..."
echo ""

# Step 2: Retrieve from cache
echo "3️⃣ Step 2: Retrieving assessment from cache..."
CACHED_RESPONSE=$(curl -s "${API_URL}/cache/${CACHE_KEY}")

# Check if retrieval was successful
if echo "$CACHED_RESPONSE" | grep -q "detail"; then
    echo "❌ Error: Failed to retrieve from cache"
    echo "$CACHED_RESPONSE" | python3 -m json.tool
    exit 1
fi

echo "✅ Successfully retrieved from cache!"
echo ""
echo "📊 Cached Assessment Details:"
echo "$CACHED_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'   Product: {data[\"product_name\"]}')
print(f'   Vendor: {data[\"vendor\"][\"name\"]}')
print(f'   Category: {data[\"category\"]}')
print(f'   Trust Score: {data[\"trust_score\"][\"score\"]}/100')
print(f'   Confidence: {data[\"trust_score\"][\"confidence\"]}')
if '_cache_metadata' in data:
    print(f'   Cached At: {data[\"_cache_metadata\"][\"cached_at\"]}')
    print(f'   Access Count: {data[\"_cache_metadata\"][\"access_count\"]}')
"
echo ""

# Step 3: List all cached assessments
echo "4️⃣ Step 3: Listing all cached assessments..."
CACHE_LIST=$(curl -s "${API_URL}/cache?limit=5")

echo "$CACHE_LIST" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ Found {data[\"total\"]} cached assessments:')
for item in data['assessments']:
    print(f'   • {item[\"product_name\"]} ({item.get(\"company_name\", \"N/A\")})')
    print(f'     Cache Key: {item[\"cache_key\"][:32]}...')
    print(f'     Cached: {item[\"cached_at\"]}')
    print(f'     Access Count: {item[\"access_count\"]}')
    print()
"

echo "✅ Cache example completed successfully!"
echo ""
echo "💡 Tip: You can use the cache_key from any assessment to retrieve it later:"
echo "   curl ${API_URL}/cache/YOUR_CACHE_KEY"
