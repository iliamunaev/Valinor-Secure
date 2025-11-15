"""
Cache service using SQLite for storing assessment results
"""

import sqlite3
import json
import hashlib
from datetime import datetime
from typing import Optional, Dict, List, Any
from pathlib import Path


class CacheService:
    """
    Lightweight cache service using SQLite for reproducible assessments.
    Stores assessment results with timestamps for auditability.
    """

    def __init__(self, db_path: str = "assessment_cache.db"):
        """Initialize cache service with SQLite database."""
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize the database schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                cache_key TEXT PRIMARY KEY,
                product_name TEXT NOT NULL,
                company_name TEXT,
                sha1 TEXT,
                url TEXT,
                assessment_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 0
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_product_name
            ON assessments(product_name)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_created_at
            ON assessments(created_at)
        """)

        conn.commit()
        conn.close()

    def _get_connection(self) -> sqlite3.Connection:
        """Get a database connection."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def generate_key(self, product_name: str, company_name: Optional[str] = None,
                     sha1: Optional[str] = None, url: Optional[str] = None) -> str:
        """
        Generate a cache key from input parameters.

        Args:
            product_name: Product name
            company_name: Company/vendor name
            sha1: Binary hash
            url: Product URL

        Returns:
            Cache key (hash of normalized inputs)
        """
        # Normalize inputs for consistent caching
        normalized = {
            "product": product_name.lower().strip(),
            "company": company_name.lower().strip() if company_name else "",
            "sha1": sha1.lower().strip() if sha1 else "",
            "url": url.lower().strip() if url else ""
        }

        # Create deterministic cache key
        key_string = f"{normalized['product']}|{normalized['company']}|{normalized['sha1']}|{normalized['url']}"
        cache_key = hashlib.sha256(key_string.encode()).hexdigest()

        return cache_key

    def get(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached assessment by key.

        Args:
            cache_key: Cache key to lookup

        Returns:
            Assessment data if found, None otherwise
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT assessment_data, created_at, access_count
            FROM assessments
            WHERE cache_key = ?
        """, (cache_key,))

        row = cursor.fetchone()

        if row:
            # Update access tracking
            cursor.execute("""
                UPDATE assessments
                SET accessed_at = CURRENT_TIMESTAMP,
                    access_count = access_count + 1
                WHERE cache_key = ?
            """, (cache_key,))
            conn.commit()

            # Parse and return assessment data
            assessment_data = json.loads(row["assessment_data"])
            assessment_data["_cache_metadata"] = {
                "cached_at": row["created_at"],
                "access_count": row["access_count"] + 1
            }

            conn.close()
            return assessment_data

        conn.close()
        return None

    def set(self, cache_key: str, assessment_data: Dict[str, Any],
            product_name: str = "", company_name: Optional[str] = None,
            sha1: Optional[str] = None, url: Optional[str] = None) -> bool:
        """
        Store assessment in cache.

        Args:
            cache_key: Cache key
            assessment_data: Assessment result to cache
            product_name: Product name for indexing
            company_name: Company name for indexing
            sha1: Binary hash for indexing
            url: URL for indexing

        Returns:
            True if successful
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT OR REPLACE INTO assessments
                (cache_key, product_name, company_name, sha1, url, assessment_data)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                cache_key,
                product_name,
                company_name,
                sha1,
                url,
                json.dumps(assessment_data, default=str)
            ))

            conn.commit()
            conn.close()
            return True

        except Exception as e:
            print(f"Cache set error: {e}")
            conn.close()
            return False

    def list_all(self, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """
        List all cached assessments with pagination.

        Args:
            limit: Maximum number of results
            offset: Offset for pagination

        Returns:
            List of cached assessments
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT cache_key, product_name, company_name, created_at,
                   accessed_at, access_count
            FROM assessments
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))

        rows = cursor.fetchall()
        results = []

        for row in rows:
            results.append({
                "cache_key": row["cache_key"],
                "product_name": row["product_name"],
                "company_name": row["company_name"],
                "cached_at": row["created_at"],
                "last_accessed": row["accessed_at"],
                "access_count": row["access_count"]
            })

        conn.close()
        return results

    def search_by_product(self, product_name: str) -> List[Dict[str, Any]]:
        """
        Search cache by product name.

        Args:
            product_name: Product name to search for

        Returns:
            List of matching assessments
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT cache_key, product_name, company_name, created_at
            FROM assessments
            WHERE product_name LIKE ?
            ORDER BY created_at DESC
        """, (f"%{product_name}%",))

        rows = cursor.fetchall()
        results = []

        for row in rows:
            results.append({
                "cache_key": row["cache_key"],
                "product_name": row["product_name"],
                "company_name": row["company_name"],
                "cached_at": row["created_at"]
            })

        conn.close()
        return results

    def clear_old_entries(self, days: int = 30) -> int:
        """
        Clear cache entries older than specified days.

        Args:
            days: Number of days to keep

        Returns:
            Number of deleted entries
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            DELETE FROM assessments
            WHERE created_at < datetime('now', '-' || ? || ' days')
        """, (days,))

        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()

        return deleted_count

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.

        Returns:
            Dictionary with cache statistics
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                COUNT(*) as total_entries,
                SUM(access_count) as total_accesses,
                MIN(created_at) as oldest_entry,
                MAX(created_at) as newest_entry
            FROM assessments
        """)

        row = cursor.fetchone()
        conn.close()

        return {
            "total_entries": row["total_entries"],
            "total_accesses": row["total_accesses"],
            "oldest_entry": row["oldest_entry"],
            "newest_entry": row["newest_entry"]
        }
