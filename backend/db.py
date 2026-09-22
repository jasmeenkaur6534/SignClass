import sqlite3
import json
import os
import time
import logging

logger = logging.getLogger("signclass.db")

DB_PATH = os.getenv("SIGNCLASS_DB_PATH", os.path.join(os.path.dirname(__file__), "signclass.db"))

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        teacher TEXT NOT NULL,
        room TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'upcoming',
        created_at REAL NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transcripts (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        speaker TEXT NOT NULL,
        text TEXT NOT NULL,
        start_ms INTEGER NOT NULL,
        timestamp_label TEXT NOT NULL,
        created_at REAL NOT NULL,
        FOREIGN KEY(class_id) REFERENCES classes(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS raw_insights (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT,
        due_date TEXT,
        due_label TEXT,
        confidence TEXT,
        source_timestamp TEXT,
        source_quote TEXT,
        completed INTEGER DEFAULT 0,
        edited INTEGER DEFAULT 0,
        created_at REAL NOT NULL,
        FOREIGN KEY(class_id) REFERENCES classes(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS verified_notes (
        class_id TEXT PRIMARY KEY,
        summary TEXT NOT NULL,
        key_concepts TEXT NOT NULL,
        important_points TEXT NOT NULL,
        assignments TEXT NOT NULL,
        deadlines TEXT NOT NULL,
        published_at REAL NOT NULL,
        FOREIGN KEY(class_id) REFERENCES classes(id)
    );
    """)

    # Seed initial default class if not present
    cursor.execute("SELECT id FROM classes WHERE id = 'CS204A'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO classes (id, subject, teacher, room, status, created_at)
        VALUES ('CS204A', 'Data Structures & Algorithms', 'Prof. R. Menon', 'Room 204', 'upcoming', ?)
        """, (time.time(),))

    conn.commit()
    conn.close()
    logger.info(f"SQLite database initialized at {DB_PATH}")

def update_class_status(class_id: str, status: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE classes SET status = ? WHERE id = ?", (status, class_id))
    conn.commit()
    conn.close()

def save_transcript_segment(class_id: str, segment: dict):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO transcripts (id, class_id, speaker, text, start_ms, timestamp_label, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        segment["id"],
        class_id,
        segment.get("speaker", "teacher"),
        segment["text"],
        segment.get("startMs", 0),
        segment.get("timestampLabel", "00:00"),
        time.time()
    ))
    conn.commit()
    conn.close()

def save_raw_insight(class_id: str, item: dict):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO raw_insights (id, class_id, type, title, detail, due_date, due_label, confidence, source_timestamp, source_quote, completed, edited, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        item["id"],
        class_id,
        item["type"],
        item["title"],
        item.get("detail", ""),
        item.get("dueDate"),
        item.get("dueLabel"),
        item.get("confidence", "high"),
        item.get("sourceTimestamp", "00:00"),
        item.get("sourceQuote", ""),
        1 if item.get("completed") else 0,
        1 if item.get("edited") else 0,
        time.time()
    ))
    conn.commit()
    conn.close()

def get_class_transcripts(class_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transcripts WHERE class_id = ? ORDER BY start_ms ASC", (class_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_class_raw_insights(class_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM raw_insights WHERE class_id = ? ORDER BY created_at ASC", (class_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_verified_notes(class_id: str, notes: dict):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO verified_notes (class_id, summary, key_concepts, important_points, assignments, deadlines, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        class_id,
        notes.get("summary", ""),
        json.dumps(notes.get("keyConcepts", [])),
        json.dumps(notes.get("importantPoints", [])),
        json.dumps(notes.get("assignments", [])),
        json.dumps(notes.get("deadlines", [])),
        time.time()
    ))
    cursor.execute("UPDATE classes SET status = 'published' WHERE id = ?", (class_id,))
    conn.commit()
    conn.close()

def get_verified_notes(class_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM verified_notes WHERE class_id = ?", (class_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "classId": row["class_id"],
        "summary": row["summary"],
        "keyConcepts": json.loads(row["key_concepts"]),
        "importantPoints": json.loads(row["important_points"]),
        "assignments": json.loads(row["assignments"]),
        "deadlines": json.loads(row["deadlines"]),
        "publishedAt": row["published_at"]
    }
