# ⚡ PLACEearly Command & Operations Cheatsheet

Quick-reference guide to running, testing, and managing **PLACEearly** without digging through code, configs, or package scripts.

---

## 🚀 1. The Fastest Way to Start Everything

You no longer need to open two separate terminal windows or dig into subdirectories.

### Option A: Via Command Line (Recommended)
```powershell
npm run dev
```
> Starts **both** the backend API (`http://localhost:5001`) and frontend Vite client (`http://localhost:5173`) concurrently in a single terminal with colorized, prefixed logs. Press `Ctrl + C` anytime to shut down both cleanly.

### Option B: Windows One-Click (Zero Typing)
Double-click `start-dev.bat` in the project root folder.

---

## 🔍 2. Check Live Service Status & Health

To check whether backend and frontend are already running and responding:
```powershell
npm run status
```
Output:
```
• Backend API (Port 5001):   ● RUNNING (HTTP 200, 12ms)
• Frontend Client (Port 5173): ● RUNNING (HTTP 200, 4ms)
✨ All services are active and reachable!
```

---

## 📋 3. Complete Command Index

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | **Start All** | Launches Backend (:5001) + Frontend (:5173) together |
| `npm run status` | **Check Health** | Pings both ports and reports status & latency |
| `npm run quick` | **Show Cheatsheet** | Prints the interactive terminal quick guide |
| `npm test` | **Run Tests** | Runs all 330 unit and integration tests across 152 suites |
| `npm run seed:recruiter` | **Seed Recruiter** | Seeds demo corporate recruiter credentials |
| `npm run build:client` | **Build Frontend** | Runs Vite production build (`dist/`) |
| `npm run dev:server` | **Server Only** | Starts Express backend with Nodemon on port 5001 |
| `npm run dev:client` | **Client Only** | Starts Vite React frontend on port 5173 |

---

## 🌐 4. Service Endpoints & Default Port Allocation

- **Frontend Client (Vite + React 19)**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API (Express 5.2)**: [http://localhost:5001](http://localhost:5001)
- **Health Check Endpoint**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 🔑 5. Pre-Seeded Demo Accounts & Credentials

All seeded accounts use password: `Password@123`

| Role | Email | Password | Primary Routes |
| :--- | :--- | :--- | :--- |
| **TPO Placement Officer** | `tpo@demo.edu` | `Password@123` | `/tpo/command-center`, `/tpo/drives`, `/tpo/reports`, `/tpo/settings/policies` |
| **Student Candidate** | `student@demo.edu` | `Password@123` | `/student/dashboard`, `/student/opportunities`, `/student/mock-interview` |
| **Corporate Recruiter** | `recruiter.google@techcorp.com` | `Password@123` | `/recruiter/drives`, `/recruiter/drives/:id/candidates`, `/recruiter/drives/:id/funnel` |
| **Platform Super Admin** | `admin@placeearly.com` | `Password@123` | `/admin/colleges`, `/admin/users` |

> [!TIP]
> On the login page (`/login`), click any role quick-fill button to auto-populate credentials instantly.

---

## 🛠️ 6. Troubleshooting: Unlocking Busy Ports (Windows)

If a previous Node process didn't terminate and port `5001` or `5173` is blocked:

### Check which process owns the port:
```powershell
netstat -ano | findstr :5001
netstat -ano | findstr :5173
```

### Kill the stuck process by PID:
```powershell
taskkill /PID <PID_FROM_ABOVE> /F
```

---

## 🗺️ 7. Feature Location Map (Where to Find Recent Features)

| Feature | Where to Access in UI | Key Source Files |
| :--- | :--- | :--- |
| **AI Resume Matching** | Student $\to$ Opportunities $\to$ "Check my resume" | `client/src/components/AtsMatcherModal.jsx`<br>`server/src/services/ai/anthropicService.js` |
| **Mock Interview AI** | Student $\to$ Mock Interview Hub | `client/src/pages/student/StudentMockInterview.jsx`<br>`server/src/controllers/aiController.js` |
| **Policy Engine & Rules** | TPO $\to$ Settings $\to$ Placement Policies | `client/src/pages/tpo/TpoPlacementPolicies.jsx`<br>`server/src/services/policyEngine/placementPolicyEngine.js` |
| **Automated Reports** | TPO $\to$ Placement Analytics & Reports | `client/src/pages/tpo/TpoReports.jsx`<br>`server/src/services/reports/reportEngine.js` |
| **Recruiter Portal** | Corporate Recruiter Portal | `client/src/pages/recruiter/`<br>`server/src/controllers/recruiterController.js` |
| **Serverless Buffer Cache**| Automatic (Background) | `server/src/models/ReportJob.js`<br>`server/src/services/reports/reportBufferCache.js` |
