# SmartTech HRMS — Full Stack with Vite + React + Node.js + MongoDB

---

## 📁 Project Structure

```
smarttech-hrms/
├── frontend/               ← React (Vite) — runs on port 5173
│   ├── index.html
│   ├── vite.config.js      ← proxy to backend configured
│   ├── tailwind.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── utils/
│       │   └── api.js
│       ├── components/
│       │   └── common/
│       │       └── Layout.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── Employees.jsx
│           ├── Departments.jsx
│           ├── Attendance.jsx
│           ├── Leave.jsx
│           ├── Payroll.jsx
│           ├── Performance.jsx
│           ├── Reports.jsx
│           └── Profile.jsx
│
├── backend/                ← Node.js + Express — runs on port 5000
│   ├── index.js
│   ├── .env.example
│   ├── package.json
│   ├── models/             ← Mongoose schemas (7 models)
│   ├── controllers/        ← Business logic (9 controllers)
│   ├── routes/             ← API routes (9 files)
│   └── middleware/
│       └── authMiddleware.js
│
├── package.json            ← Root — runs both together
└── README.md
```

---

## ⚡ SETUP INSTRUCTIONS

### Step 1 — Install Node.js
Download LTS from https://nodejs.org (v18 or v20 recommended)

### Step 2 — Set up MongoDB (choose one)

**Option A — MongoDB Atlas (cloud, free):**
1. Go to https://mongodb.com/cloud/atlas
2. Create free account → New Project → Build Cluster (free M0)
3. Add database user → Allow network access from anywhere (0.0.0.0/0)
4. Click "Connect" → "Drivers" → copy the URI string

**Option B — Local MongoDB:**
- Download from https://www.mongodb.com/try/download/community
- Start the service; connection string = `mongodb://localhost:27017/smarttech_hrms`

### Step 3 — Configure environment
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env`:
```
MONGO_URI=your_mongodb_uri_here
JWT_SECRET=any_long_random_string
```

### Step 4 — Install all dependencies (one command)
From the project root:
```bash
npm run install-all
```

### Step 5 — Start the full app
```bash
npm run dev
```
This starts both servers simultaneously:
- Frontend → http://localhost:5173
- Backend  → http://localhost:5000

### Step 6 — Create your Admin account (run once)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@smarttech.com","password":"Admin@1234","role":"admin"}'
```

### Step 7 — Login
Open http://localhost:5173 and login with:
- Email: `admin@smarttech.com`
- Password: `Admin@1234`

---

## 🔑 User Roles

| Role | What they can do |
|------|-----------------|
| `admin` | Full access — all modules + user management |
| `hr_manager` | Employees, departments, payroll, leave, reports |
| `employee` | Own profile, check in/out, apply leave, view payslip |

When you add a new employee, the system **automatically creates their login** and shows a temporary password.

---

## 📦 Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| express | Web server framework |
| mongoose | MongoDB ODM |
| dotenv | Environment variables |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| cors | Cross-origin requests |
| helmet | Security headers |
| morgan | HTTP request logging |
| multer | File uploads |
| pdfkit | PDF report generation |
| nodemon | Auto-restart in dev |

### Frontend
| Package | Purpose |
|---------|---------|
| vite | Build tool & dev server |
| react + react-dom | UI framework |
| react-router-dom | Client-side routing |
| axios | HTTP requests |
| tailwindcss | Utility-first CSS |
| lucide-react | Icons |
| recharts | Charts & graphs |
| react-hot-toast | Notifications |

---

## 🛠 Troubleshooting

| Problem | Fix |
|---------|-----|
| Cannot connect to MongoDB | Check MONGO_URI in .env; whitelist IP in Atlas |
| Port 5000 in use | Set PORT=5001 in .env |
| Port 5173 in use | Vite will auto-pick next available port |
| CORS error | Ensure CLIENT_URL=http://localhost:5173 in .env |
| npm run install-all fails | Run `cd backend && npm install` then `cd ../frontend && npm install` separately |
