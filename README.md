# PsycheMap — Personality Assessment App (Fixed)

A full-stack personality testing platform: **MBTI** (10 Qs) + **Big Five / OCEAN** (50 Qs) with radar chart results.

## Quick Start (Docker — recommended)

```bash
docker compose up --build
# → http://localhost:3000
```

## Manual Setup

### PostgreSQL
```bash
createdb personality_db
```

### Backend
```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL="postgresql://postgres:password@localhost:5432/personality_db"
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
# → http://localhost:3000
```

---

## Bugs Fixed (v2 → v3)

| # | Location | Bug | Fix |
|---|----------|-----|-----|
| 1 | backend/main.py | `@app.on_event("startup")` deprecated in FastAPI 0.111 | Replaced with `@asynccontextmanager lifespan` |
| 2 | backend/main.py | `EmailStr` imported but `email-validator` not in requirements — causes 500 on startup | Removed `EmailStr`, use plain `str` with manual validation |
| 3 | backend/main.py | Empty strings `""` sent for optional fields would violate DB expectations | Added `none_if_empty()` helper, explicit field stripping |
| 4 | backend/main.py | `UniqueViolation` catch too broad — no specific message for username vs email | Now detects which field caused the conflict, returns clear message |
| 5 | backend/main.py | No try/finally in `get_user` — DB connection could leak | Added finally blocks to all routes |
| 6 | frontend/App.jsx | React state (`user`, `mbti`, `big5`) lost on any navigation / page reload | Added `sessionStorage` persistence; state survives navigation |
| 7 | frontend/OnboardingPage.jsx | No client-side validation — blank fields could reach backend | Added per-field validation with inline error messages |
| 8 | frontend/OnboardingPage.jsx | No email format check | Added regex email validation |
| 9 | frontend/OnboardingPage.jsx | Optional fields sent as `""` (empty string) not `null` | Now sends `null` for all empty optional fields |
| 10 | frontend/MBTITest.jsx | `onComplete(result)` + `nav()` in same click — nav fires before state updates | Wrapped in proper sequence; `App.jsx` now writes sessionStorage synchronously |
| 11 | frontend/ResultsPage.jsx | No fallback if props are null (e.g. after refresh) | Added sessionStorage fallback reads + "Start Over" screen |
| 12 | frontend/ResultsPage.jsx | Save errors silently swallowed | Now displays save error to user |
| 13 | frontend/LandingPage.module.css | Used modern CSS nesting (`em { }` inside selector) — breaks some bundlers | Flattened to standard CSS selectors |
| 14 | backend/Dockerfile | Missing `curl` — docker-compose healthcheck would always fail | Added `apt-get install curl` |
| 15 | docker-compose.yml | Backend healthcheck missing; frontend could start before backend ready | Added `healthcheck` for backend; frontend waits for it |
| 16 | requirements.txt | `email-validator` missing, `uvicorn` not using `[standard]` extras | Cleaned up, added `uvicorn[standard]` |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/users` | Create user (returns `{id, username, nickname, email, age, gender}`) |
| `GET` | `/api/users/:id` | Get user by ID |
| `POST` | `/api/results` | Save test results |
| `GET` | `/api/results/:user_id/latest` | Get latest results |
| `GET` | `/api/health` | Health check (also tests DB connection) |

## User Flow

```
/ → /onboarding (Step 1: required fields → Step 2: optional)
  → /test/mbti (10 cognitive questions)
  → /test/big5 (50 OCEAN questions, 7-point scale)
  → /results   (radar chart + Big Five breakdown + MBTI stack)
```
