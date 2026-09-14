# GlobalVox RSVP AI Calling System

A fully-decoupled, scalable event management and voice calling automation platform built with **Python FastAPI**, **MongoDB Atlas**, and **Next.js/React**. 

This system integrates a high-performance backend capable of bulk-simulating concurrent AI voice calls and a stunning, responsive frontend dashboard inspired by enterprise CRM systems.

## 🌟 Key Features
- **Scalable Architecture**: Complete separation of frontend (React) and backend (FastAPI) for independent deployments.
- **AI Calling Simulator**: Bulk-processing asynchronous endpoint handling 500+ simulated calls concurrently.
- **MongoDB Atlas Integration**: Persistent live storage for Invitees, Event Campaigns, and Call Results.
- **Next.js Dashboard**: Real-time progress trackers, active batch execution monitoring, and rich typography.

---

## 📁 Project Structure

```text
GlobalVox-RSVP/
│
├── backend/                      # Python FastAPI API Server
│   ├── app/
│   │   ├── config.py             # App environment & MongoDB settings
│   │   ├── database.py           # MongoDB Atlas Async connection pooling
│   │   ├── models/schemas.py     # Pydantic & MongoDB validation schemas
│   │   ├── routes/routes.py      # Core endpoints (Invitees, Campaigns, Call Executor)
│   │   └── services/calling_service.py # AI voice calling logic
│   ├── requirements.txt
│   ├── .python-version           # Enforces Python 3.11 for Render deployment compatibility
│   ├── .env                      # Contains MONGODB_URI (Local only)
│   └── main.py                   # FastAPI Application Entry point
│
├── frontend/                     # Next.js Web Dashboard
│   ├── src/
│   │   ├── app/page.tsx          # Main View, State Management, UI Tabs
│   │   └── components/           # Invitee Directory, Dashboard UI, Campaign Forms
│   ├── package.json
│   ├── tailwind.config.ts        # Theming & custom UI styling
│   └── .env.local                # Contains NEXT_PUBLIC_API_URL
│
└── sample_invitees.csv           # Mock Data for testing file uploads
```

---

## 🚀 Live Deployment Guide (Free Tier)

### 1. Deploy Frontend (Vercel)
The Next.js Application is designed to be hosted serverlessly on Vercel.
1. Connect this repository to Vercel.
2. Under "Root Directory", type `frontend/`.
3. Add an Environment Variable: `NEXT_PUBLIC_API_URL` pointing to your hosted FastAPI backend (e.g. `https://your-backend.onrender.com/api`).
4. Click Deploy.

### 2. Deploy Backend (Render)
The FastAPI application is perfectly optimized for Render's standard web services with pre-configured `.python-version` constraints.
1. Connect this repository to Render as a New Web Service.
2. Under "Root Directory", explicitly type `backend`.
3. Build Command: `pip install -r requirements.txt`. 
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `MONGODB_URI`: *Your actual Mongo Atlas URL*
   - `DATABASE_NAME`: `globalvox_rsvp`
6. Click Deploy.

---

## 🖥️ Run Locally for Development

### 1. Setup the Database
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Grab the connection string.
3. In `backend/.env`, set `MONGODB_URI` equal to your connection string.

### 2. Run the FastAPI Backend (Port 8000)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Open `http://localhost:8000/docs` to test endpoints and test database connections interactively via Swagger UI.

### 3. Run the Next.js Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:3000` to interact with the GlobalVox HQ UI.

---

## 🗄️ Database Schemas

- **`invitees`**: Master directory database holding names, emails, phones, and company affiliations.
- **`campaigns`**: Individual event events holding configuration and total statistics overview.
- **`campaign_invitees`**: Campaign snapshots containing the specific invitees selected for a given campaign and tracking their individual attempt statuses (`pending`, `confirmed`, `failed`).
- **`call_results`**: Event-based append-only logging recording transcription arrays and outcomes for every single call attempt instance.
