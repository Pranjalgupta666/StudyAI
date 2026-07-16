<div align="center">

# 📚 StudyAI — AI-Powered Study Assistant

> Upload any PDF and instantly ask questions, generate summaries & quizzes — powered by AI, running free on your local machine.

<br/>

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br/>

[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3-f97316?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Local%20Vector%20DB-8b5cf6?style=for-the-badge)](https://trychroma.com)
[![SQLite](https://img.shields.io/badge/SQLite-Local%20DB-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Sentence%20Transformers-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co)

<br/>

![Cost](https://img.shields.io/badge/Cost-$0%20%2F%20Month-22c55e?style=for-the-badge&logo=cashapp&logoColor=white)
![RAG](https://img.shields.io/badge/Architecture-RAG%20Pipeline-6366f1?style=for-the-badge)
![Local](https://img.shields.io/badge/Runs-100%25%20Locally-0ea5e9?style=for-the-badge)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 💬 Ask Questions
Chat with your PDF document. Get precise answers with exact page references — no hallucinations, only answers from your document.

</td>
<td width="50%">

### 📝 Smart Summaries
Generate three types of summaries instantly — Full Summary, Key Concepts bullet points, or a TL;DR in 3 sentences.

</td>
</tr>
<tr>
<td width="50%">

### 🧠 Quiz Generator
Auto-generate 5 multiple choice questions with explanations and instant scoring to test your understanding.

</td>
<td width="50%">

### 🔒 100% Private
Your PDFs never leave your computer. Everything runs locally — embeddings, vector search, and file storage.

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
PDF Upload
    │
    ▼
📄 PyMuPDF extracts text page by page
    │
    ▼
✂️  LangChain splits into 500-word chunks (100-word overlap)
    │
    ▼
🧠 sentence-transformers converts chunks → 384-dim vectors
    │
    ▼
⬡  ChromaDB stores vectors + text on local disk
    │
    ▼
✅ Document is READY

User asks a question
    │
    ▼
🔍 Question gets embedded with same model
    │
    ▼
⬡  ChromaDB finds top 5 most similar chunks
    │
    ▼
🤖 Chunks + question sent to Groq (LLaMA 3.3 70B)
    │
    ▼
💬 Answer streamed back token by token
```

---

## 🛠️ Tech Stack

### 🐍 Backend
| Technology | Purpose |
|:---:|:---|
| ![Python](https://img.shields.io/badge/-Python-3776AB?style=flat&logo=python&logoColor=white) | Core backend language |
| ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat&logo=fastapi&logoColor=white) | REST API framework — all routes and endpoints |
| ![Uvicorn](https://img.shields.io/badge/-Uvicorn-4B5563?style=flat) | ASGI server — runs FastAPI asynchronously |
| ![Pydantic](https://img.shields.io/badge/-Pydantic-E92063?style=flat) | Data validation and settings management |
| ![SQLite](https://img.shields.io/badge/-SQLite-003B57?style=flat&logo=sqlite&logoColor=white) | Local database — tracks document records |
| ![SQLAlchemy](https://img.shields.io/badge/-SQLAlchemy-D71F00?style=flat) | Async ORM — maps Python classes to DB tables |

### 🤖 AI / ML
| Technology | Purpose |
|:---:|:---|
| ![Groq](https://img.shields.io/badge/-Groq%20LLaMA%203.3-f97316?style=flat) | Free LLM — Q&A, summaries, quiz generation |
| ![HuggingFace](https://img.shields.io/badge/-sentence--transformers-FFD21E?style=flat&logo=huggingface&logoColor=black) | Local embeddings — converts text to vectors |
| ![ChromaDB](https://img.shields.io/badge/-ChromaDB-8b5cf6?style=flat) | Local vector database — similarity search |
| ![LangChain](https://img.shields.io/badge/-LangChain-1C3C3C?style=flat) | Text splitting — chunk PDF content |
| ![PyMuPDF](https://img.shields.io/badge/-PyMuPDF-FF0000?style=flat) | PDF parsing — extract text page by page |

### ⚛️ Frontend
| Technology | Purpose |
|:---:|:---|
| ![Next.js](https://img.shields.io/badge/-Next.js%2014-000000?style=flat&logo=nextdotjs&logoColor=white) | React framework — routing and pages |
| ![React](https://img.shields.io/badge/-React%2018-61DAFB?style=flat&logo=react&logoColor=black) | UI component library |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | Type-safe JavaScript |
| ![TailwindCSS](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) | Utility-first styling |
| ![Lucide](https://img.shields.io/badge/-Lucide%20React-F56565?style=flat) | Icon library |

---

## 💰 Cost Breakdown

| Service | Free Tier | What we use it for |
|---|---|---|
| 🤖 Groq API | **14,400 req/day free** | LLM for Q&A, summaries, quizzes |
| 🧠 sentence-transformers | **100% free** (local) | Text embeddings |
| ⬡ ChromaDB | **100% free** (local) | Vector storage & search |
| 🗃️ SQLite | **100% free** (built-in) | Document metadata |
| 📁 Local Storage | **100% free** (your disk) | PDF file storage |
| **Total** | **$0 / month** | |

---

## 🚀 Getting Started

### Prerequisites

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org/downloads)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Git](https://img.shields.io/badge/Git-Latest-F05032?style=flat&logo=git&logoColor=white)](https://git-scm.com)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Pranjalgupta666/StudyAI.git
cd StudyAI
```

### 2️⃣ Get your free Groq API key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up free → click **API Keys** → **Create API Key**
3. Copy the key (starts with `gsk_...`)

### 3️⃣ Set up the backend

**Mac / Linux:**
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

**Windows (PowerShell):**
```powershell
cd backend
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

### 4️⃣ Add your API key

Open `backend/.env`:

```env
GEMINI_API_KEY=gsk_your-groq-key-here
```

### 5️⃣ Set up the frontend

```bash
cd ../frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
```

---

## ▶️ Running the App

Open **2 terminal windows:**

**Terminal 1 — Backend:**
```bash
# Mac/Linux
cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload --port 8000

# Windows
cd backend; .\venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

**Open:** [http://localhost:3000](http://localhost:3000) 🎉

> ⚠️ First run downloads the sentence-transformers model (~90MB) — one time only.

---

## 📁 Project Structure

```
StudyAI/
├── 🐍 backend/
│   ├── app/
│   │   ├── 🚀 main.py              # FastAPI entry point
│   │   ├── core/
│   │   │   └── ⚙️  config.py        # Settings & environment
│   │   ├── db/
│   │   │   └── 🗃️  database.py      # SQLite async setup
│   │   ├── models/
│   │   │   └── 📋 document.py      # Database models
│   │   ├── api/
│   │   │   ├── 📄 documents.py     # Upload/status/delete routes
│   │   │   └── 🤖 ai.py            # Ask/summarize/quiz routes
│   │   └── services/
│   │       ├── 💾 storage.py       # Local file storage
│   │       ├── ⚙️  ingestion.py     # PDF processing pipeline
│   │       └── 🧠 rag.py           # RAG pipeline + Groq
│   ├── 📦 requirements.txt
│   └── 🔐 .env.example
│
└── ⚛️  frontend/
    ├── src/
    │   ├── app/
    │   │   ├── 🏠 page.tsx          # Main app page
    │   │   └── 📐 layout.tsx        # Root layout
    │   ├── components/
    │   │   ├── upload/
    │   │   │   └── ⬆️  UploadZone.tsx
    │   │   ├── chat/
    │   │   │   └── 💬 ChatPanel.tsx
    │   │   ├── summary/
    │   │   │   └── 📝 SummaryPanel.tsx
    │   │   └── quiz/
    │   │       └── 🧠 QuizPanel.tsx
    │   └── lib/
    │       └── 🔌 api.ts            # Typed API client
    └── 📦 package.json
```

---

## 🔌 API Endpoints

```
POST   /api/v1/documents/upload        Upload a PDF file
GET    /api/v1/documents/              List all documents
GET    /api/v1/documents/{id}/status   Poll processing status
DELETE /api/v1/documents/{id}          Delete a document
POST   /api/v1/ai/ask                  Ask a question
POST   /api/v1/ai/ask/stream           Streaming Q&A (SSE)
POST   /api/v1/ai/summarize            Generate summary
POST   /api/v1/ai/quiz                 Generate quiz
```

> 📖 Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🐛 Common Issues

| Error | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'app'` | Run `cd backend` first before uvicorn |
| `venv\Scripts\activate` fails on Windows | Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| PyMuPDF fails to install | Use Python 3.11: `py -3.11 -m venv venv` |
| `GEMINI_API_KEY field required` | Copy `.env.example` to `.env` and add your Groq key |
| ChromaDB `np.float_` error | Run `pip install numpy==1.26.4 chromadb==0.4.24` |
| Quota exceeded error | Get a free Groq key at [console.groq.com](https://console.groq.com) |

---

## 🤝 Contributing

Contributions are welcome!

```bash
git checkout -b feature/amazing-feature
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
# Open a Pull Request
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ by [Pranjal Gupta](https://github.com/Pranjalgupta666)**

[![GitHub](https://img.shields.io/badge/GitHub-Pranjalgupta666-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Pranjalgupta666)

⭐ **Star this repo if you found it helpful!**

</div>
