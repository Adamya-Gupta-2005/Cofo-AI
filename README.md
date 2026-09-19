# ContentForge AI

Enterprise-grade AI-powered content transformation platform built for Smart India Hackathon (SIH) 2026.

Transform complex raw source documents (incident reports, policy briefs, research papers, news) into multi-channel outputs (Executive Summaries, Cybersecurity Advisories, LinkedIn Posts, Twitter/X Threads, Presentations, Infographics, Video Packages) with zero fact distortion, sacred value preservation, and deterministic validation.

---

## Key Features

- **Single-Pass Canonical Analysis**: Raw documents are analyzed once using Groq LLaMA 3.1 70B, extracting all structured facts (`FACT-001...N`), categories, and critical numbers/dates into a canonical knowledge model.
- **Zero-Token Sacred Value Lock**: Strict prompt compiler enforces exact preservation of sacred statistics, figures, and dates with prompt-injection defense.
- **Simultaneous Batch Output Generation**: Generates 7+ structured output formats simultaneously in a single LLM invocation.
- **Deterministic Fact Validation**: Pure JavaScript validation verifies sacred anchors, keyword coverage, and section citation without extra AI token consumption.
- **Real-Time Progress Streaming**: Native Server-Sent Events (SSE) stream pipeline execution status to the browser.
- **Multi-Format Export**: Export outputs as styled PDF, Word DOCX, PowerPoint PPTX, or bundle all outputs into a ZIP archive.
- **Enterprise SaaS UX**: 3-panel transformation studio with Tiptap rich editing, one-click demo data loading, and validation inspector.

---

## Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Lucide React, Zustand, React Router v6, Axios, React Hook Form, Zod, Tiptap, react-dropzone, react-hot-toast.
- **Backend**: Node.js 20 LTS (ESM), Express 4, MongoDB 7 + Mongoose 8, JWT + Bcrypt, Multer, `pdf-parse`, `mammoth`.
- **AI**: Groq SDK (`llama-3.1-70b-versatile` & `llama-3.1-8b-instant`).
- **Exporting**: `pdf-lib`, `docx`, `pptxgenjs`, `archiver`.
- **Security & Reliability**: Helmet, Express Rate Limit, Pino logging, Zod environment & request validation.

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (Local MongoDB Community Service or MongoDB Atlas URI)
- Groq API Key (`gsk_...`)

### 1. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
Update `server/.env` with your values:
- `MONGODB_URI`: `mongodb://localhost:27017/contentforge` (or your MongoDB Atlas connection string)
- `GROQ_API_KEY`: `gsk_your_actual_groq_key_here`

### 2. Install & Run Server
```bash
cd server
npm install
npm run dev
```

### 3. Install & Run Client
In another terminal:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Demo Walkthrough
1. Register or Log in as an Operator.
2. Click **"Load Sample Input" / "Try Demo"** on the Dashboard to load the Acme Financial ransomware incident report.
3. Click **"Analyze Source"** to extract the canonical knowledge model and view the identified facts.
4. Select desired output types (LinkedIn, Executive Summary, Advisory, Presentation, etc.).
5. Click **"Generate Outputs"** to observe real-time SSE progress, view validation reports, edit with Tiptap, and download exports.
