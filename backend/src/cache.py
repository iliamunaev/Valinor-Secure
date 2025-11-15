import os
import json
import hashlib
import redis.asyncio as redis
from typing import Optional

# Redis connection
redis_client: Optional[redis.Redis] = None

async def init_redis():
    """Initialize Redis connection"""
    global redis_client
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    try:
        redis_client = await redis.from_url(
            f"redis://{redis_host}:{redis_port}",
            decode_responses=True
        )
        # Test connection
        await redis_client.ping()
        print(f"Connected to Redis at {redis_host}:{redis_port}")
    except Exception as e:
        print(f"Redis connection failed: {e}")
        redis_client = None

async def close_redis():
    """Close Redis connection"""
    global redis_client
    if redis_client:
        await redis_client.close()
        print("Redis connection closed")

def get_redis_client():
    """Get the Redis client instance"""
    return redis_client

def generate_cache_key(endpoint: str, data: dict) -> str:
    """Generate a unique cache key from endpoint and request data"""
    key_data = f"{endpoint}:{json.dumps(data, sort_keys=True)}"
    return hashlib.md5(key_data.encode()).hexdigest()

async def get_cached_response(cache_key: str) -> Optional[dict]:
    """Get cached response from Redis if it exists"""
    if redis_client:
        try:
            cached = await redis_client.get(f"cache:{cache_key}")
            if cached:
                return json.loads(cached)
        except Exception as e:
            print(f"Redis get error: {e}")
    return None

async def set_cached_response(cache_key: str, response: dict, ttl: int = 3600):
    """Cache response in Redis with TTL (default 1 hour)"""
    if redis_client:
        try:
            await redis_client.setex(
                f"cache:{cache_key}",
                ttl,
                json.dumps(response)
            )
        except Exception as e:
            print(f"Redis set error: {e}")

