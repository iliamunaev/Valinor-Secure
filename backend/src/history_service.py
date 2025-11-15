"""
Assessment history service using SQLite for storing user assessment history
"""

import sqlite3
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path


class HistoryService:
    """
    History service using SQLite for storing assessment history.
    """

    def __init__(self, db_path: str = "assessment_history.db"):
        """Initialize history service with SQLite database."""
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize the database schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessment_history (
                id TEXT PRIMARY KEY,
                product_name TEXT NOT NULL,
                trust_score INTEGER,
                risk_level TEXT,
                assessment_data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_created_at
            ON assessment_history(created_at DESC)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_product_name
            ON assessment_history(product_name)
        """)

        conn.commit()
        conn.close()

    def _get_connection(self) -> sqlite3.Connection:
        """Get a database connection."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def save_assessment(
        self,
        assessment_id: str,
        product_name: str,
        trust_score: int,
        risk_level: str,
        assessment_data: Dict[str, Any]
    ) -> bool:
        """
        Save an assessment to history.

        Args:
            assessment_id: Unique identifier for the assessment
            product_name: Name of the product assessed
            trust_score: Trust score (0-100)
            risk_level: Risk level (Low, Medium, High)
            assessment_data: Full assessment data

        Returns:
            True if saved successfully
        """
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                INSERT OR REPLACE INTO assessment_history
                (id, product_name, trust_score, risk_level, assessment_data, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                assessment_id,
                product_name,
                trust_score,
                risk_level,
                json.dumps(assessment_data),
                datetime.utcnow().isoformat()
            ))

            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error saving assessment: {e}")
            return False

    def get_history(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get assessment history with pagination.

        Args:
            limit: Maximum number of items to return
            offset: Number of items to skip

        Returns:
            List of assessment history items
        """
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT id, product_name, trust_score, risk_level, assessment_data, created_at
                FROM assessment_history
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """, (limit, offset))

            rows = cursor.fetchall()
            conn.close()

            history = []
            for row in rows:
                history.append({
                    'id': row['id'],
                    'productName': row['product_name'],
                    'trustScore': row['trust_score'],
                    'riskLevel': row['risk_level'],
                    'assessmentData': json.loads(row['assessment_data']),
                    'timestamp': row['created_at']
                })

            return history
        except Exception as e:
            print(f"Error fetching history: {e}")
            return []

    def get_assessment(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific assessment by ID.

        Args:
            assessment_id: The assessment ID

        Returns:
            Assessment data or None if not found
        """
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT id, product_name, trust_score, risk_level, assessment_data, created_at
                FROM assessment_history
                WHERE id = ?
            """, (assessment_id,))

            row = cursor.fetchone()
            conn.close()

            if row:
                return {
                    'id': row['id'],
                    'productName': row['product_name'],
                    'trustScore': row['trust_score'],
                    'riskLevel': row['risk_level'],
                    'assessmentData': json.loads(row['assessment_data']),
                    'timestamp': row['created_at']
                }
            return None
        except Exception as e:
            print(f"Error fetching assessment: {e}")
            return None

    def delete_assessment(self, assessment_id: str) -> bool:
        """
        Delete an assessment from history.

        Args:
            assessment_id: The assessment ID to delete

        Returns:
            True if deleted successfully
        """
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                DELETE FROM assessment_history
                WHERE id = ?
            """, (assessment_id,))

            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error deleting assessment: {e}")
            return False

    def clear_history(self) -> bool:
        """
        Clear all assessment history.

        Returns:
            True if cleared successfully
        """
        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            cursor.execute("DELETE FROM assessment_history")

            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error clearing history: {e}")
            return False
