#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   StudyAI Free Stack Setup           ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1. Backend
echo "▶ Setting up backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy .env if not already there
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Open backend/.env and paste your free Gemini key:"
  echo "   Get it at → https://aistudio.google.com"
  echo ""
fi

cd ..

echo "✓ Backend ready"
echo ""

echo "▶ Setting up frontend..."
cd frontend
npm install
if [ ! -f .env.local ]; then
  echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
fi
cd ..

echo "✓ Frontend ready"
echo ""
echo "══════════════════════════════════════"
echo " To start the app, open 2 terminals:"
echo ""
echo "  Terminal 1 (backend):"
echo "    cd backend && source venv/bin/activate"
echo "    uvicorn app.main:app --reload --port 8000"
echo ""
echo "  Terminal 2 (frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "  Then open → http://localhost:3000"
echo "══════════════════════════════════════"
