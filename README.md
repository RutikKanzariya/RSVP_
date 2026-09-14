# GlobalVox RSVP Calling Campaign System

Full-stack RSVP calling campaign application built with **Python FastAPI**, **MongoDB Atlas**, and a **React/Next.js UI**.

---

## 📁 Project Structure

```text
GlobalVox-RSVP/
│
├── backend/
│   ├── app/
│   │   ├── config.py             # App environment & MongoDB settings
│   │   ├── database.py           # MongoDB Atlas connection (Motor / PyMongo)
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic & MongoDB document schemas
│   │   ├── routes/
│   │   │   └── routes.py         # FastAPI endpoints for invitees, campaigns, calls
│   │   └── services/
│   │       └── calling_service.py # AI voice calling simulator logic
│   ├── requirements.txt
│   ├── .env                      # MongoDB Atlas URI & port configuration
│   └── main.py                   # FastAPI app entry point (Uvicorn server)
│
├── frontend/                     # React / Next.js web dashboard
├── .gitignore
└── README.md
```

---

## 🗄️ MongoDB Atlas Schema (`globalvox_rsvp` Database)

1. **`invitees`**: Master directory (`_id`, `externalId`, `name`, `phone`, `email`, `company`, `createdAt`).
2. **`campaigns`**: Event campaign records (`_id`, `campaignName`, `eventName`, `eventDate`, `location`, `objective`, `status`, `totalInvitees`).
3. **`campaign_invitees`**: Snapshot list per campaign (`_id`, `campaignId`, `inviteeId`, `status`, `attemptCount`, `maxAttempts`, `lastAttemptAt`, `notes`).
4. **`call_results`**: Append-only log history (`_id`, `campaignId`, `inviteeId`, `campaignInviteeId`, `attempt`, `callStatus`, `rsvpStatus`, `duration`, `error`, `rawResponse`, `startedAt`, `completedAt`).

---

## 🚀 How to Run the Application

### 1. Start the Python FastAPI Backend (Port 8000)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **API Base URL**: `http://localhost:8000/api`
- **Swagger Docs**: `http://localhost:8000/docs`

### 2. Start the React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:3000` in your browser.

---

## ⚙️ MongoDB Atlas Configuration (`backend/.env`)

To connect to your live MongoDB Atlas database, update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/globalvox_rsvp?retryWrites=true&w=majority
DATABASE_NAME=globalvox_rsvp
PORT=8000
HOST=0.0.0.0
```
