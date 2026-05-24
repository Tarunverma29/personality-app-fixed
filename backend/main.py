from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional
import psycopg2
import psycopg2.extras
import os
import json

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/personality_db")

def init_db():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            nickname VARCHAR(50) NOT NULL,
            age INTEGER NOT NULL,
            gender VARCHAR(30) NOT NULL,
            education VARCHAR(100),
            profession VARCHAR(100),
            field_of_study VARCHAR(100),
            country VARCHAR(100),
            bio TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS test_results (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            mbti_type VARCHAR(4),
            mbti_scores JSONB,
            big5_scores JSONB,
            big5_archetype VARCHAR(100),
            taken_at TIMESTAMP DEFAULT NOW()
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Personality Test API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── MODELS ─────────────────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    username: str
    email: str
    nickname: str
    age: int
    gender: str
    education: Optional[str] = None
    profession: Optional[str] = None
    field_of_study: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None

class TestResults(BaseModel):
    user_id: int
    mbti_type: str
    mbti_scores: dict
    big5_scores: dict
    big5_archetype: str

# ── HELPERS ────────────────────────────────────────────────────────────────────

def none_if_empty(v):
    """Convert empty string to None so optional DB fields don't get blank strings."""
    if v is None:
        return None
    s = str(v).strip()
    return s if s else None

# ── ROUTES ─────────────────────────────────────────────────────────────────────

@app.post("/api/users", status_code=201)
def create_user(user: UserProfile):
    # Validate mandatory fields
    if not user.username.strip():
        raise HTTPException(status_code=422, detail="Username is required")
    if not user.email.strip():
        raise HTTPException(status_code=422, detail="Email is required")
    if not user.nickname.strip():
        raise HTTPException(status_code=422, detail="Nickname is required")
    if user.age < 1 or user.age > 150:
        raise HTTPException(status_code=422, detail="Please enter a valid age")
    if not user.gender.strip():
        raise HTTPException(status_code=422, detail="Gender is required")

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO users (username, email, nickname, age, gender,
                               education, profession, field_of_study, country, bio)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, username, nickname, email, age, gender
        """, (
            user.username.strip(),
            user.email.strip().lower(),
            user.nickname.strip(),
            user.age,
            user.gender.strip(),
            none_if_empty(user.education),
            none_if_empty(user.profession),
            none_if_empty(user.field_of_study),
            none_if_empty(user.country),
            none_if_empty(user.bio),
        ))
        result = cur.fetchone()
        conn.commit()
        return dict(result)
    except psycopg2.errors.UniqueViolation as e:
        conn.rollback()
        msg = str(e)
        if "username" in msg:
            raise HTTPException(status_code=409, detail="That username is already taken — please choose another")
        elif "email" in msg:
            raise HTTPException(status_code=409, detail="An account with that email already exists")
        raise HTTPException(status_code=409, detail="Username or email already exists")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cur.close()
        conn.close()

@app.get("/api/users/{user_id}")
def get_user(user_id: int):
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(user)
    finally:
        cur.close()
        conn.close()

@app.post("/api/results", status_code=201)
def save_results(results: TestResults):
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO test_results (user_id, mbti_type, mbti_scores, big5_scores, big5_archetype)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, user_id, mbti_type, big5_archetype, taken_at
        """, (
            results.user_id,
            results.mbti_type,
            json.dumps(results.mbti_scores),
            json.dumps(results.big5_scores),
            results.big5_archetype,
        ))
        row = cur.fetchone()
        conn.commit()
        return dict(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save results: {str(e)}")
    finally:
        cur.close()
        conn.close()

@app.get("/api/results/{user_id}/latest")
def get_latest_results(user_id: int):
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            SELECT r.*, u.nickname, u.username FROM test_results r
            JOIN users u ON u.id = r.user_id
            WHERE r.user_id = %s ORDER BY r.taken_at DESC LIMIT 1
        """, (user_id,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="No results found")
        return dict(result)
    finally:
        cur.close()
        conn.close()

@app.get("/api/health")
def health():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.close()
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": str(e)}
