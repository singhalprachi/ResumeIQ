# ResumeIQ — ATS Resume Analyzer

AI-powered ATS scoring using GPT-4o + RAG pipeline, aligned to a 6-dimension SOP scoring rubric.

---

## Architecture

```
frontend/          React + Tailwind + Vite  →  Vercel
backend/           FastAPI + Python          →  Railway / Render
  ├── ChromaDB     (vector store, RAG)
  ├── OpenAI       (GPT-4o + text-embedding-3-small)
  ├── pdfplumber   (PDF parsing)
  └── python-docx  (DOCX parsing)
```

### RAG Pipeline Flow
```
Resume upload
  → parse PDF/DOCX
  → chunk text (500 tokens, 50 overlap)
  → embed with text-embedding-3-small
  → store in ChromaDB (per session)

Analysis request
  → embed JD
  → retrieve top-8 resume chunks (cosine similarity)
  → GPT-4o [system rubric + JD + full resume + RAG chunks]
  → parse JSON response
  → server-side weighted score recalculation
  → return AnalysisResponse
```

---

## Scoring Dimensions (SOP)

| # | Dimension | Weight | Key Rules |
|---|-----------|--------|-----------|
| 1 | Positioning & Clarity | 20% | No summary → hard cap 60 overall |
| 2 | Impact & Achievement | 25% | >50% passive bullets → cap |
| 3 | Skill Architecture | 20% | 30+ skills or no grouping → penalty |
| 4 | Experience Maturity | 15% | Leadership expected at mid-level |
| 5 | Human Authenticity | 10% | Detects AI/generic phrasing |
| 6 | ATS Hygiene | 10% | Headers, formatting, contact info |

Score calibration: Entry-level avg 58-68, strong 78-85. Mid-level avg 60-72, strong 80-88.

---

## Local Development

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment
cp .env.example .env.local
# Edit .env.local: VITE_API_URL=http://localhost:8000

# Run
npm run dev
```

App: http://localhost:5173

---

## Deployment

### Backend → Railway

1. Push `backend/` to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the repo (set root directory to `backend/` if monorepo)
4. Add environment variables in Railway dashboard:
   ```
   OPENAI_API_KEY=sk-...
   APP_ENV=production
   SECRET_KEY=<random 32-char string>
   ALLOWED_ORIGINS=https://your-app.vercel.app
   CHROMA_PERSIST_DIR=/tmp/chroma_db
   ```
5. Railway auto-detects Python via `requirements.txt` and runs `Procfile`
6. Copy your Railway service URL (e.g. `https://ats-backend.railway.app`)

> **Note:** Railway's ephemeral filesystem resets on redeploy. For persistent ChromaDB, add a Railway Volume and set `CHROMA_PERSIST_DIR=/mnt/data/chroma_db`.

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Go to [netlify.com](https://netlify.com) → New Project → Import repo
3. Set root directory to `frontend/`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. Deploy — netlify handles the Vite build automatically

---

## Project Structure

```
ats-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── api/
│   │   │   ├── analyze.py       # /upload-resume, /analyze endpoints
│   │   │   └── health.py        # /health
│   │   ├── core/
│   │   │   ├── config.py        # Settings via .env
│   │   │   └── vectorstore.py   # ChromaDB + OpenAI embeddings
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── parser.py        # PDF/DOCX parsing + chunking
│   │   │   └── scorer.py        # GPT-4o scoring engine (SOP)
│   │   └── utils/
│   ├── requirements.txt
│   ├── .env.example
│   ├── Procfile                 # Railway start command
│   └── railway.toml
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css            # Design tokens + animations
    │   ├── types/index.ts       # TypeScript interfaces
    │   ├── utils/api.ts         # Axios API client
    │   ├── store/appStore.ts    # Zustand global state
    │   ├── pages/
    │   │   ├── UploadPage.tsx   # Step 1: Resume + JD input
    │   │   ├── AnalyzingPage.tsx # Step 2: Loading with live steps
    │   │   └── ResultsPage.tsx  # Step 3: Full analysis report
    │   └── components/
    │       ├── ui/
    │       │   └── Navbar.tsx
    │       └── analysis/
    │           ├── ScoreRing.tsx         # Animated SVG score ring
    │           ├── DimensionBreakdown.tsx # 6-bar score chart
    │           ├── SectionScores.tsx      # Collapsible section details
    │           ├── KeywordsPanel.tsx      # Keyword match table
    │           ├── SuggestionsPanel.tsx   # Accordion improvements
    │           ├── StrengthsWeaknesses.tsx
    │           └── HardCapsAlert.tsx      # Cap warning banner
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── netlify.toml
    └── .env.example
```

---

## API Reference

### POST `/api/v1/upload-resume`
Upload resume file (PDF or DOCX).

**Form data:** `file` (multipart)

**Response:**
```json
{
  "session_id": "uuid",
  "filename": "resume.pdf",
  "sections_detected": ["summary", "experience", "skills"],
  "chunks_indexed": 14,
  "message": "Resume parsed and indexed successfully."
}
```

### POST `/api/v1/analyze`
Run ATS analysis against a job description.

**Body:**
```json
{
  "session_id": "uuid-from-upload",
  "job_description": "Full JD text..."
}
```

**Response:** Full `AnalysisResponse` with score, breakdown, keywords, suggestions.

### GET `/api/v1/health`
Health check — returns model info and environment.

---

## Scaling Notes

- **Session store:** Currently in-memory dict. For multi-instance Railway deploys, replace with Redis (`redis-py` + `upstash` works well on Railway).
- **ChromaDB:** For production scale, consider Chroma Cloud or Qdrant.
- **Rate limiting:** Add `slowapi` middleware for production traffic.
- **File storage:** Add S3/R2 for storing original resumes if audit trail is needed.
