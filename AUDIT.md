# PLACEearly Codebase Audit Report
**Date:** October 22, 2026  
**Audited Platform:** PLACEearly — Campus Placement Operating System (OS)  
**Repository Path:** `C:\Users\edhub\Desktop\Anti Gravity Projects\PLACEearly`  
**Deployment Target:** Vercel (Multi-Service: Vite SPA Client + Express 5.2 Server)  
**CI/CD Pipeline:** `.github/workflows/ci.yml`

---

## 1. Folder Structure & Technology Stack

### 1.1 Complete Repository Directory Tree

```
PLACEearly/
├── .git/                                   # Git version control metadata
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI workflow (Node 22: backend tests, client build & lint)
├── client/                                 # Frontend SPA Service (Vite + React 19)
│   ├── public/
│   │   ├── favicon.svg                     # Platform favicon
│   │   └── register-landscape.jpg          # Campus landscape background artwork for registration
│   ├── src/
│   │   ├── components/
│   │   │   ├── AtsMatcherModal.jsx         # Client-side AI ATS resume keyword matching modal
│   │   │   └── ProtectedRoute.jsx          # Role-based route guard component
│   │   ├── context/
│   │   │   └── AuthContext.jsx             # React context provider for user authentication state
│   │   ├── data/
│   │   │   ├── jobPlatformsData.js         # 55 verified job/internship platforms dataset
│   │   │   └── learningPlatformsData.js    # 35 verified coding/CS learning platforms dataset
│   │   ├── pages/
│   │   │   ├── ForColleges.jsx             # Institutional marketing page for placement officers
│   │   │   ├── ForStudents.jsx             # Candidate marketing page for students
│   │   │   ├── Home.jsx                    # Landing page, hero, pipeline preview, and footer
│   │   │   ├── HowItWorks.jsx              # 4-step placement lifecycle walkthrough page
│   │   │   ├── JobPlatforms.jsx            # 55-platform hiring directory with filters & modal
│   │   │   ├── LearningPlatforms.jsx       # 35-platform tech learning directory with filters & modal
│   │   │   ├── Login.jsx                   # Sign-in page with illustration and credentials form
│   │   │   ├── PublicPortfolio.jsx         # Public shareable student verification certificate (/verify/:rollNo)
│   │   │   ├── Register.jsx                # Registration page with campus background and role selector
│   │   │   ├── StudentDashboard.jsx        # Candidate portal: Opportunity Hub, Applications, Prep, Profile
│   │   │   └── TpoDashboard.jsx            # TPO portal: Analytics, Kanban, Drives, Verifications, Scheduler
│   │   ├── services/
│   │   │   ├── api.js                      # Axios instance with baseURL and Bearer token interceptor
│   │   │   ├── authService.js              # Auth API calls with localStorage mock fallback
│   │   │   ├── documentService.js          # Document upload API call with local blob URL fallback
│   │   │   └── placementStore.js           # 539-line client localStorage database simulating backend
│   │   ├── App.jsx                         # Root client component with React Router route declarations
│   │   ├── index.css                       # Global styles, fonts, and Tailwind v4 theme variables
│   │   └── main.jsx                        # React 19 DOM entrypoint
│   ├── .gitignore                          # Client-specific ignore file (node_modules, dist)
│   ├── index.html                          # HTML template shell with Google Fonts
│   ├── package.json                        # Frontend dependencies and build scripts
│   ├── package-lock.json                   # Locked dependency tree for client
│   └── vite.config.js                      # Vite configuration with Tailwind v4 & dev proxies (/api, /uploads)
├── server/                                 # Backend REST API Service (Node.js + Express 5.2)
│   ├── src/
│   │   ├── config/                         # Configuration directory (currently empty)
│   │   ├── controllers/
│   │   │   ├── authController.js           # Handlers for register, login, and get profile
│   │   │   ├── documentController.js       # Handler for single document/resume upload
│   │   │   ├── opportunityController.js    # Handlers for drives, applications, and status updates
│   │   │   └── profileController.js        # Handlers for student profile upsert, fetch, and verification
│   │   ├── middleware/
│   │   │   └── authMiddleware.js           # JWT verification (protect) and role authorization (authorize)
│   │   ├── models/
│   │   │   ├── Application.js              # Mongoose schema for drive applications
│   │   │   ├── Opportunity.js              # Mongoose schema for campus placement drives
│   │   │   ├── StudentProfile.js           # Mongoose schema for student academic & career profiles
│   │   │   └── User.js                     # Mongoose schema for user accounts & bcrypt hashing
│   │   ├── routes/
│   │   │   ├── authRoutes.js               # Route definitions for /api/auth
│   │   │   ├── documentRoutes.js           # Route definitions for /api/documents (Multer disk storage)
│   │   │   ├── opportunityRoutes.js        # Route definitions for /api/opportunities
│   │   │   └── profileRoutes.js            # Route definitions for /api/profile
│   │   ├── services/
│   │   │   └── eligibilityService.js       # Pure function checking CGPA, backlogs, branch, and verification
│   │   ├── utils/                          # Utility directory (currently empty)
│   │   └── index.js                        # Express app initialization, static uploads mount, and listen guard
│   ├── tests/
│   │   └── eligibilityEngine.test.js       # 6 unit tests using node:test runner for eligibilityService.js
│   ├── uploads/                            # Local filesystem directory for stored student resumes
│   ├── .env                                # Server environment variables (TRACKED BY GIT - CRITICAL)
│   ├── .gitignore                          # Server-specific ignore file
│   ├── package.json                        # Backend dependencies and test scripts
│   └── package-lock.json                   # Locked dependency tree for server
├── AUDIT.md                                # This audit report document
└── vercel.json                             # Vercel multi-service routing and build configuration
```

### 1.2 Technology Stack Summary

| Layer | Technologies & Libraries | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 19.2.8 | Declarative component UI |
| **Client Bundler** | Vite | 8.2.2 | Fast HMR dev server & production bundler |
| **Styling & Design System** | Tailwind CSS v4 + `@tailwindcss/vite` | 4.3.3 | Utility-first styling & design tokens |
| **Animation Engine** | Framer Motion | 13.4.5 | Page transitions, modal spring physics, layout animations |
| **Client Routing** | React Router DOM | 7.18.3 | Client-side SPA routing & route guards |
| **Client State / Async** | `@tanstack/react-query` | 5.102.8 | Installed in `package.json` (currently unused in code) |
| **Data Visualization** | Recharts | 3.10.1 | Placement analytics bar charts, donut charts, and stats |
| **Icons** | Lucide React | 1.37.0 | Vector iconography across dashboards and directories |
| **HTTP Client** | Axios | 1.20.0 | API communication with Bearer token interceptor |
| **Backend Runtime** | Node.js (CommonJS) | 22.x | Server runtime environment |
| **Web Server Framework** | Express | 5.2.1 | REST API framework with route middleware |
| **Database & ODM** | MongoDB + Mongoose | 9.9.4 | NoSQL document database and schema modeling |
| **Authentication & Crypto** | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` | JWT 9.0.3, bcryptjs 3.0.3 | Token-based auth & salted password hashing (10 rounds) |
| **File Handling** | Multer | 2.4.0 | Multipart form-data handling for resumes/transcripts |
| **CORS & Environment** | `cors` + `dotenv` | CORS 2.8.6, dotenv 17.4.2 | Cross-origin headers & environment loading |
| **CI / CD Pipeline** | GitHub Actions | Ubuntu Latest, Node 22 | Automated backend unit testing and frontend lint/build |
| **Deployment / Hosting** | Vercel Multi-Service | Schema `openapi.vercel.sh` | Independent build roots for `client` and `server` with URL rewrites |

---

## 2. Client Pages & Route Audit Table

| Route / Path | File | Permitted Role(s) | Implementation Status | Which API Endpoint It Calls |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `client/src/pages/Home.jsx` | Public (All) | **Static UI** | None (Static presentation, contains 9 dead `href="#"` links) |
| `/for-students` | `client/src/pages/ForStudents.jsx` | Public (All) | **Static UI** | None (Static marketing cards) |
| `/for-colleges` | `client/src/pages/ForColleges.jsx` | Public (All) | **Static UI** | None (Static marketing cards) |
| `/how-it-works` | `client/src/pages/HowItWorks.jsx` | Public (All) | **Static UI** | None (Static 4-step timeline) |
| `/job-platforms` | `client/src/pages/JobPlatforms.jsx` | Public (All) | **Partly Mocked** | None (Reads local `client/src/data/jobPlatformsData.js`, bookmarks to `localStorage`) |
| `/learning-platforms` | `client/src/pages/LearningPlatforms.jsx` | Public (All) | **Partly Mocked** | None (Reads local `client/src/data/learningPlatformsData.js`, bookmarks to `localStorage`) |
| `/verify/:rollNo` | `client/src/pages/PublicPortfolio.jsx` | Public (All) | **Partly Mocked** | None (Reads from `placementStore.js` in `localStorage`, falls back to hardcoded `Alex Mercer`) |
| `/login` | `client/src/pages/Login.jsx` | Public (Unauthenticated) | **Partly Mocked** | `POST /api/auth/login` (falls back to `localStorage.mock_db_users` if backend offline) |
| `/register` | `client/src/pages/Register.jsx` | Public (Unauthenticated) | **Partly Mocked** | `POST /api/auth/register` (falls back to `localStorage.mock_db_users` if backend offline) |
| `/unauthorized` | `client/src/App.jsx` (inline) | Public (All) | **Static UI** | None (Plain red text box) |
| `/student/dashboard` | `client/src/pages/StudentDashboard.jsx` | `student` | **Partly Mocked** | Calls `placementStore.js` (`localStorage`) for opportunities, applications, profile, notifications. Only calls `POST /api/documents/upload` via `documentService.js` |
| `/tpo/dashboard` | `client/src/pages/TpoDashboard.jsx` | `tpo`, `superadmin` | **Partly Mocked** | Calls `placementStore.js` (`localStorage`) for all operations (drives, verifications, applicants, scheduler, analytics). Calls **NO** backend API |
| **Missing Route** | *Dept Coordinator Dashboard* | `coordinator` | **Missing / Non-existent** | None (No page or route created) |
| **Missing Route** | *Recruiter Dashboard* | `recruiter` | **Missing / Non-existent** | None (No page or route created) |
| **Missing Route** | *Admin Dashboard* | `admin` | **Missing / Non-existent** | None (No page or route created) |
| **Missing Route** | *Super Admin Control Center* | `superadmin` | **Missing / Non-existent** | None (Currently redirected to TPO dashboard) |

---

## 3. Server API Endpoint Audit Table

| HTTP Method | Route Path | Auth Required? | Role Check Present? | Zod Validation Present? | Automated Tests Present? | Controller Handler |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | No | No | No | No | Inline handler in `server/src/index.js` line 26 |
| `POST` | `/api/auth/register` | No | **No (VULNERABILITY: caller can submit any `role` string)** | No | No | `authController.registerUser` |
| `POST` | `/api/auth/login` | No | No | No | No | `authController.loginUser` |
| `GET` | `/api/auth/profile` | Yes (`protect`) | No | No | No | `authController.getUserProfile` |
| `GET` | `/api/opportunities` | Yes (`verifyToken`) | Partial (filters Open if student, but any authenticated user can call) | No | No | `opportunityController.getOpportunities` (No pagination) |
| `POST` | `/api/opportunities` | Yes (`verifyToken`) | Yes (`tpo`, `superadmin`) | No | No | `opportunityController.createOpportunity` (No Zod validation) |
| `POST` | `/api/opportunities/:id/apply` | Yes (`verifyToken`) | Yes (`student`) | No | No | `opportunityController.applyToOpportunity` (**CRITICAL BUG: schema mismatch**) |
| `GET` | `/api/opportunities/applications/me` | Yes (`verifyToken`) | Yes (`student`) | No | No | `opportunityController.getMyApplications` (No pagination) |
| `GET` | `/api/opportunities/applications/all` | Yes (`verifyToken`) | Yes (`tpo`, `superadmin`) | No | No | `opportunityController.getAllApplications` (No pagination) |
| `GET` | `/api/opportunities/:id/applications` | Yes (`verifyToken`) | Yes (`tpo`, `superadmin`) | No | No | `opportunityController.getOpportunityApplications` (No pagination) |
| `PUT` | `/api/opportunities/applications/:id/status` | Yes (`verifyToken`) | Yes (`tpo`, `superadmin`) | No | No | `opportunityController.updateApplicationStatus` (No Zod validation) |
| `GET` | `/api/profile/me` | Yes (`verifyToken`) | No | No | No | `profileController.getMyProfile` (**CRITICAL BUG: queries `userId` instead of `user`**) |
| `POST` | `/api/profile` | Yes (`verifyToken`) | No | No | No | `profileController.upsertProfile` (**CRITICAL BUG: sets `userId` and `academicInfo`**) |
| `GET` | `/api/profile/all` | Yes (`verifyToken`) | Yes (`tpo`, `superadmin`) | No | No | `profileController.getAllProfiles` (**CRITICAL BUG: populates `userId` instead of `user`**) |
| `PUT` | `/api/profile/:id/verify` | Yes (`verifyToken`) | Yes (`tpo`, `superadmin`) | No | No | `profileController.verifyProfile` (**CRITICAL BUG: sets `isVerified` instead of `isVerifiedByTPO`**) |
| `POST` | `/api/documents/upload` | Yes (`verifyToken`) | No | No (Multer extension check only) | No | `documentController.uploadDocument` (Updates unindexed `resumeUrl` on profile) |
| `GET` | `/uploads/*` | No | No | No | No | Static file serving via `express.static` (Fails on Vercel serverless) |

---

## 4. Data Models: Fields, Indexes, Relations & Schema Mismatches

### 4.1 Model: `User` (`server/src/models/User.js`)
*   **Collection:** `users`
*   **Fields:**
    *   `email`: String, required, unique, lowercase, trim.
    *   `password`: String, required, minlength 6 (hashed via bcrypt pre-save hook).
    *   `role`: String, enum `['student', 'tpo', 'coordinator', 'superadmin']`, default `'student'`.
    *   `isVerified`: Boolean, default `false`.
    *   `firstName`: String, required, trim.
    *   `lastName`: String, required, trim.
    *   `createdAt`: Date (via `timestamps: true`).
    *   `updatedAt`: Date (via `timestamps: true`).
*   **Indexes:**
    *   `{ email: 1 }` (unique, generated by Mongoose).
*   **Relations:**
    *   Target of `StudentProfile.user`.
    *   Target of `Application.studentId`.
    *   Target of `Opportunity.createdBy`.
*   **Deficiencies Identified:**
    *   `role` enum missing required roles: `'recruiter'` and `'admin'`.
    *   No index on `role` or `isVerified`.
    *   No audit trail fields (`lastLoginAt`, `loginIp`, `failedLoginAttempts`).

---

### 4.2 Model: `StudentProfile` (`server/src/models/StudentProfile.js`)
*   **Collection:** `studentprofiles`
*   **Fields:**
    *   `user`: ObjectId, ref `'User'`, required, unique.
    *   `personalInfo`:
        *   `phone`: String.
        *   `dateOfBirth`: Date.
        *   `gender`: String, enum `['Male', 'Female', 'Other']`.
        *   `address`: String.
    *   `academics`:
        *   `tenth`: Embedded `academicSchema` (`degree`, `institution`, `boardOrUniversity`, `yearOfPassing`, `score`, `scoreType`).
        *   `twelfth`: Embedded `academicSchema`.
        *   `undergrad`: Embedded `academicSchema` (with `branch`).
        *   `currentCgpa`: Number, default `0`.
        *   `activeBacklogs`: Number, default `0`.
        *   `totalBacklogs`: Number, default `0`.
        *   `graduationYear`: Number.
    *   `skills`: Array of Strings.
    *   `projects`: Array of `{ title, description, link }`.
    *   `experience`: Array of `{ company, role, duration, description }`.
    *   `careerGoals`: String.
    *   `isVerifiedByTPO`: Boolean, default `false`.
    *   `createdAt`, `updatedAt`: Dates.
*   **Indexes:**
    *   `{ user: 1 }` (unique).
*   **Relations:**
    *   References `User` via `user` field.
*   **CRITICAL Schema-to-Controller Inconsistencies:**
    1. **Field Name Mismatch `user` vs `userId`**:
       `StudentProfile.js` declares `user: { type: ObjectId, ref: 'User' }`. But `profileController.js` and `opportunityController.js` repeatedly execute `StudentProfile.findOne({ userId: req.user.userId })`. This query returns `null` because `userId` does not exist in the schema.
    2. **Field Name Mismatch `isVerifiedByTPO` vs `isVerified`**:
       The schema defines `isVerifiedByTPO: { type: Boolean, default: false }`. But `opportunityController.js` checks `if (!profile.isVerified)` and `profileController.js` sets `profile.isVerified = isVerified`. Mongoose in strict mode drops `isVerified`, preventing verification from ever persisting.
    3. **Academic Structure Mismatch `academics` vs `academicInfo`**:
       The schema defines `academics: { currentCgpa, activeBacklogs, undergrad: { branch } }`. But `opportunityController.js` executes `profile.academicInfo.cgpa < rules.minCgpa` and `profile.academicInfo.activeBacklogs`. In Node.js, `profile.academicInfo` is `undefined`, causing an immediate fatal `TypeError: Cannot read properties of undefined (reading 'cgpa')`.
    4. **Missing `resumeUrl`**:
       `documentController.js` executes `profile.resumeUrl = fileUrl; await profile.save()`. Because `resumeUrl` is not declared in `StudentProfile.js`, Mongoose strict mode discards the field unless strict is disabled.
    5. **Missing `rollNo`**:
       Student roll numbers are referenced on all frontend pages and `PublicPortfolio.jsx` (`/verify/:rollNo`), but `rollNo` does not exist in `StudentProfile.js`.

---

### 4.3 Model: `Opportunity` (`server/src/models/Opportunity.js`)
*   **Collection:** `opportunities`
*   **Fields:**
    *   `title`: String, required, trim.
    *   `companyName`: String, required.
    *   `companyLogo`: String (URL).
    *   `type`: String, enum `['Job', 'Internship']`, required.
    *   `location`: String, required.
    *   `salary`: String, required (e.g., "24 LPA").
    *   `description`: String, required.
    *   `eligibilityRules`:
        *   `minCgpa`: Number, default `0`.
        *   `maxBacklogs`: Number, default `0`.
        *   `allowedBranches`: Array of Strings.
    *   `deadline`: Date, required.
    *   `status`: String, enum `['Open', 'Closed']`, default `'Open'`.
    *   `createdBy`: ObjectId, ref `'User'`, required.
    *   `createdAt`, `updatedAt`: Dates.
*   **Indexes:**
    *   None explicitly declared.
*   **Relations:**
    *   References `User` via `createdBy`.
    *   Target of `Application.opportunityId`.
*   **Deficiencies Identified:**
    *   No index on `{ status: 1, deadline: 1 }`, causing unindexed full-collection scans on the public drive feed.
    *   No compensation breakdown fields (Base, Bonus, Stocks) despite UI displaying package breakdowns.
    *   No interview round workflow definition array attached to the drive.

---

### 4.4 Model: `Application` (`server/src/models/Application.js`)
*   **Collection:** `applications`
*   **Fields:**
    *   `studentId`: ObjectId, ref `'User'`, required.
    *   `opportunityId`: ObjectId, ref `'Opportunity'`, required.
    *   `status`: String, enum `['Applied', 'In Review', 'Shortlisted', 'Rejected', 'Hired']`, default `'Applied'`.
    *   `currentRound`: String, default `'Application Review'`.
    *   `appliedAt`: Date, default `Date.now`.
    *   `createdAt`, `updatedAt`: Dates.
*   **Indexes:**
    *   `{ studentId: 1, opportunityId: 1 }` (unique compound index).
*   **Relations:**
    *   References `User` via `studentId`.
    *   References `Opportunity` via `opportunityId`.
*   **Deficiencies Identified:**
    *   `status` enum does not align with the 5-stage tracker required by the system (`Applied`, `Online Assessment`, `Technical`, `HR`, `Offer Extended` / `Placed`).
    *   No fields for interview scheduling (`interviewDate`, `interviewTime`, `venueOrLink`, `interviewerNotes`).
    *   No audit trail tracking who changed the stage and when.

---

### 4.5 Completely Missing Models Required by Specification
1.  **`AuditLog` Model (Rule 5 Requirement)**:
    *   Required fields: `actorId` (ref User), `actorRole`, `action`, `targetModel`, `targetId`, `beforeState`, `afterState`, `ipAddress`, `userAgent`, `timestamp`.
    *   Currently does not exist anywhere in the repository.
2.  **`Notification` Model**:
    *   Required for sending real-time in-app alerts when drives open, applications advance, or interviews are scheduled. Currently simulated in `placementStore.js`.
3.  **`InterviewSchedule` Model**:
    *   Required for storing scheduled interview rounds, Google Meet / room venues, and calendar metadata.

---

## 5. Complete Inventory of Hardcoded & Mock Data

1.  **`client/src/services/placementStore.js` (Entire File — 539 Lines)**:
    *   Lines 8–104: `INITIAL_DATA.opportunities` contains 5 hardcoded company drives (Google 1.2L/mo, Microsoft 44 LPA, Vercel 24 LPA, Amazon 28 LPA, Atlassian 32 LPA).
    *   Lines 105–170: `INITIAL_DATA.applications` contains 4 hardcoded application objects with simulated candidates (Priya Sharma, Alex Mercer, Rohan Verma, Ananya Patel).
    *   Lines 171–245: `INITIAL_DATA.students` contains 4 hardcoded student records with fake roll numbers, CGPAs (8.8, 9.2, 7.8, 8.4), and branches.
    *   Lines 246–275: `INITIAL_DATA.notifications` contains 3 hardcoded notification items.
    *   Lines 280–539: Functions `getOpportunities`, `createOpportunity`, `toggleOpportunityStatus`, `getMyApplications`, `applyToOpportunity`, `getAllApplications`, `updateApplicationStatus`, `getStudents`, `verifyStudentProfile`, `getStudentProfile`, `updateStudentProfile`, `getNotifications`, `markNotificationsAsRead`, and `getPlatformAnalytics` operate purely on `localStorage.setItem('placeearly_platform_store_v1', ...)` and completely bypass the backend API.
2.  **`client/src/services/authService.js`**:
    *   Lines 24–42: Falls back to `localStorage.getItem('mock_db_users')`, generating fake user IDs (`mock_id_...`) and fake tokens (`jwt_token_...`), storing passwords in plaintext in browser storage.
    *   Lines 61–74: Login fallback compares plain text password against `mock_db_users`.
3.  **`client/src/services/documentService.js`**:
    *   Lines 16–18: Falls back to `URL.createObjectURL(file)` when backend is offline, creating an ephemeral blob URL that breaks when the browser closes.
4.  **`client/src/pages/PublicPortfolio.jsx`**:
    *   Lines 27–40: Hardcoded fallback student profile:
        ```javascript
        name: 'Alex Mercer', rollNo: 'CS2026-08', branch: 'Computer Science & Engineering',
        degree: 'Bachelor of Technology (B.Tech)', cgpa: 8.85, backlogs: 0, gradYear: 2026,
        isVerified: true, resumeUrl: 'https://drive.google.com/file/d/alex-resume-2026',
        placedCompany: 'Google (Software Engineering Intern)'
        ```
    *   Line 196: Hardcoded mock verification hash:
        ```javascript
        HASH: SHA256-8F92-B7A1-420E-PLACE-2026-OK
        ```
5.  **`client/src/pages/TpoDashboard.jsx`**:
    *   Lines 28–34: `branchPlacementData` hardcoded array:
        `[{ branch: 'CSE', rate: 94 }, { branch: 'IT', rate: 89 }, { branch: 'ECE', rate: 82 }, { branch: 'Mech', rate: 74 }, { branch: 'EEE', rate: 71 }]`
    *   Lines 36–41: `ctcTierData` hardcoded array:
        `[{ tier: '>30 LPA', count: 28 }, { tier: '15-30 LPA', count: 64 }, { tier: '8-15 LPA', count: 86 }, { tier: '<8 LPA', count: 24 }]`
    *   Lines 43–50: `companyShareData` hardcoded array:
        `[{ name: 'Google', value: 14 }, { name: 'Microsoft', value: 18 }, { name: 'Amazon', value: 24 }, { name: 'Atlassian', value: 12 }, { name: 'Vercel', value: 16 }, { name: 'Others', value: 38 }]`
    *   Lines 52–108: `KANBAN_STAGES` hardcoded configuration.
    *   Lines 450–520: Stat cards displaying hardcoded values: `400 Total Students`, `340 Verified`, `12 Total Drives`, `210 Placed`, `14.2 LPA Average CTC`, `87.5% Placement Rate`.
6.  **`client/src/pages/StudentDashboard.jsx`**:
    *   Lines 47–58: Hardcoded default profile state: `Alex Mercer`, `CS2026-08`, `cgpa: 8.5`, `degree: B.Tech Computer Science`.
    *   Lines 622–680: Hardcoded preparation tracks ("DSA Top 75", "Google & Microsoft Guide", "STAR Method Behavioral Bank", "Core CS Subject Refresher").
7.  **`client/src/components/AtsMatcherModal.jsx`**:
    *   Lines 28–32: Hardcoded target keywords array (`react`, `node.js`, `python`, `sql`, etc.).
    *   Lines 48–51: Simulated scoring formula (`baseScore + 10 (CGPA) + 10 (Backlogs)` capped between 35 and 96).
    *   Lines 60–64: Hardcoded recommended interview questions.
    *   Lines 19, 68: `setTimeout(..., 600)` simulating latency without any real backend API or NLP service.
8.  **`client/src/pages/ForStudents.jsx`**:
    *   Lines 66–80: Hardcoded mockup cards (`{[1, 2].map(...)}` rendering "Software Engineer", "Top Tech Corp", "24 LPA").
9.  **`client/src/pages/ForColleges.jsx`**:
    *   Lines 48–70: Hardcoded eligibility engine mockup ("Microsoft Campus Drive", "Min CGPA > 8.5", "420 Students Auto-Approved").
10. **`client/src/data/jobPlatformsData.js` (Entire File — 746 Lines)**:
    *   Contains 55 static job board records bundled directly into the frontend code with no backend database.
11. **`client/src/data/learningPlatformsData.js` (Entire File — 796 Lines)**:
    *   Contains 35 static learning platform records bundled directly into the frontend code with no backend database.
12. **`server/src/middleware/authMiddleware.js`**:
    *   Line 12: Insecure hardcoded fallback string `'fallback_secret'`.
13. **`server/src/controllers/authController.js`**:
    *   Line 6: Insecure hardcoded fallback string `'fallback_secret'`.

---

## 6. Dead Buttons, Placeholder Links & Non-Functional Elements

### 6.1 Landing Page (`client/src/pages/Home.jsx`)
*   **Line 56–58 (`Platform Update: Auto-Eligibility is live`)**: Wrapped in a span with `cursor-pointer hover:underline` but has no `onClick` handler, no route, and does not navigate anywhere.
*   **Line 291 (`Platform -> Opportunity Hub`)**: `<a href="#">Opportunity Hub</a>` (Dead link, jumps to top of page).
*   **Line 292 (`Platform -> Eligibility Engine`)**: `<a href="#">Eligibility Engine</a>` (Dead link).
*   **Line 293 (`Platform -> Student Profiles`)**: `<a href="#">Student Profiles</a>` (Dead link).
*   **Line 294 (`Platform -> Analytics Reports`)**: `<a href="#">Analytics Reports</a>` (Dead link).
*   **Line 300 (`Resources -> Preparation Hub`)**: `<a href="#">Preparation Hub</a>` (Dead link).
*   **Line 301 (`Resources -> Help Center`)**: `<a href="#">Help Center</a>` (Dead link).
*   **Line 302 (`Resources -> Contact Support`)**: `<a href="#">Contact Support</a>` (Dead link).
*   **Line 309 (`Legal -> Privacy Policy`)**: `<a href="#">Privacy Policy</a>` (Dead link).
*   **Line 310 (`Legal -> Terms of Service`)**: `<a href="#">Terms of Service</a>` (Dead link).

### 6.2 Authentication Pages (`Login.jsx` & `Register.jsx`)
*   **`Login.jsx` Line 91 (`Remember me` checkbox)**: `<input id="remember-me" type="checkbox" />` has no React state, no `onChange` handler, and does nothing.
*   **`Login.jsx` Line 95 (`Forgot password?`)**: `<a href="#" ...>Forgot password?</a>` (Dead link; no reset modal or password recovery workflow).
*   **`Login.jsx` Lines 19–23 (Role redirection)**: Only redirects `tpo` to `/tpo/dashboard` and all other roles (including `coordinator`, `recruiter`, `admin`, `superadmin`) to `/student/dashboard`.
*   **`Register.jsx` Lines 147–156 (Role selector)**: Dropdown only contains `<option value="student">` and `<option value="tpo">`. Roles `coordinator`, `recruiter`, `admin`, and `superadmin` are absent.
*   **`ForColleges.jsx` Line 101 (`Start Free Trial`)**: Button links to `/register`, where no institutional trial or college registration exists.
*   **`HowItWorks.jsx` Line 102 (`Get Started Free`)**: Generic link to `/register`.

### 6.3 Student Dashboard (`StudentDashboard.jsx`)
*   **Preparation Hub Tracks 2 & 3 (Lines 638–662)**: Cards for "Google & Microsoft Guide" and "STAR Method Behavioral Bank" have no click action, no modal, and no download link.
*   **Notification Bell (Lines 196–237)**: Displays mock notifications from `placementStore`. Clicking an alert does not open the associated application or drive; no clear/delete button.
*   **Resume Upload (Lines 108–120)**: If the backend `/api/documents/upload` fails, it falls back to a temporary browser blob URL (`URL.createObjectURL(file)`) which breaks on page refresh or browser restart.

### 6.4 TPO Dashboard (`TpoDashboard.jsx`)
*   **CSV Export (Lines 896–901)**: Generates a CSV file from in-memory `placementStore` in the student's browser. If TPO accesses from another device, the export is blank or contains only initial mock records.
*   **Interview Scheduler Form (Lines 1181–1250)**: Form updates `placementStore` in `localStorage`. Does not generate Google Calendar invites, send emails, or write to a database.
*   **Search and Filter Inputs**: Operates on client memory arrays; does not support server-side pagination, regex search, or sorting.

### 6.5 Public Portfolio (`PublicPortfolio.jsx`)
*   **Line 49–51 (`Print Certificate` button)**: Triggers `window.print()` without print-specific CSS rules (`@media print`), printing raw web navigation headers and buttons.

---

## 7. Security & Vulnerability Analysis

### 7.1 Critical Security Vulnerabilities (CVSS High / Critical)

1.  **Arbitrary Role Privilege Escalation (CWE-269)**:
    *   **File:** `server/src/controllers/authController.js` Line 16, 28:
        ```javascript
        const { firstName, lastName, email, password, role } = req.body;
        const user = await User.create({ firstName, lastName, email, password, role: role || 'student' });
        ```
    *   **Vulnerability:** Any anonymous user can send a `POST /api/auth/register` with `{"role": "superadmin"}` or `{"role": "tpo"}` and automatically receive an active Super Admin or TPO account with full access.
2.  **Hardcoded Fallback JWT Secret (CWE-798)**:
    *   **Files:** `server/src/middleware/authMiddleware.js` Line 12 & `server/src/controllers/authController.js` Line 6:
        ```javascript
        jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        ```
    *   **Vulnerability:** If the server runs without `JWT_SECRET` configured, any attacker can forge arbitrary JWTs signed with `'fallback_secret'` and authenticate as any user or admin.
3.  **Committed Secrets in Version Control (CWE-312 / CWE-540)**:
    *   **File:** `server/.env` is tracked and committed to Git:
        ```
        JWT_SECRET=placeearly_super_secure_jwt_secret_key_2026
        ```
    *   **Vulnerability:** The secret key is publicly visible in repository history. Anyone with repo access can mint valid tokens. Furthermore, there is no root `.gitignore` file.
4.  **Plaintext Passwords in Browser LocalStorage (CWE-312)**:
    *   **File:** `client/src/services/authService.js` Line 37–40, 64:
        ```javascript
        const existingUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
        const user = existingUsers.find(u => u.email === userData.email && u.password === userData.password);
        ```
    *   **Vulnerability:** When offline fallback occurs, user passwords are stored unhashed in `localStorage`, accessible by any XSS script.
5.  **Insecure File Upload Handling (CWE-434)**:
    *   **File:** `server/src/routes/documentRoutes.js` Lines 21–29:
        ```javascript
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        ```
    *   **Vulnerability:** The server validates only the filename extension, not MIME magic bytes (`file-type`). An attacker can upload an executable disguised as `.pdf` to `server/uploads`. Furthermore, files are served statically from `/uploads` without `Content-Security-Policy` or download disposition headers.

### 7.2 Missing Controls & Best Practices
*   **Missing Rate Limiting (CWE-307)**: Neither `/api/auth/login` nor `/api/auth/register` implements rate limiting (e.g., `express-rate-limit`). The system is vulnerable to brute-force password guessing and automated registration floods.
*   **Excessive Token Lifetime**: JWTs have a fixed 30-day lifetime (`expiresIn: '30d'`) without refresh tokens, rotation, or server-side token revocation mechanisms.
*   **Permissive CORS**: `server/src/index.js` mounts `app.use(cors())` with default wildcard `*`, allowing cross-origin requests from any domain.
*   **No Input Sanitization or Validation**: No Zod or Joi schemas on any route. `req.body` is passed directly to Mongoose queries and object creation.
*   **Missing Audit Logging**: No audit trail exists for sensitive mutations (profile verification, status changes, drive deletion), violating compliance and platform integrity requirements.

---

## 8. Deployment & Serverless Issues (Vercel)

1.  **Ephemeral Local Disk Writes**:
    *   `server/src/routes/documentRoutes.js` uses `multer.diskStorage` writing to `server/uploads/`.
    *   On Vercel, serverless function filesystems are read-only (except `/tmp`) and completely ephemeral. Files written to disk are destroyed as soon as the lambda instance terminates.
    *   Uploaded student resumes will disappear and return 404s on subsequent requests.
2.  **Static File Serving of Dynamic Uploads**:
    *   `server/src/index.js` mounts `app.use('/uploads', express.static(path.join(__dirname, '../uploads')))`.
    *   Because Vercel serverless builds `server` as a bundle, `../uploads` does not exist persistently in serverless containers. Cloud storage (AWS S3, Vercel Blob, Cloudinary) must be used.
3.  **Client-Side LocalStorage Data Siloing**:
    *   Because `placementStore.js` and `authService.js` write to `localStorage`, changes made by one user (e.g., student applying to a drive) are invisible to all other users (e.g., TPO reviewing applicants). The app behaves like a single-browser toy rather than a multi-user platform.
4.  **Mongoose Connection Pool Exhaustion on Lambda Cold Starts**:
    *   `server/src/index.js` calls `mongoose.connect(MONGO_URI)` without caching the connection promise across lambda invocations. Each incoming HTTP request on a new serverless container will open a new MongoDB connection, quickly exhausting MongoDB connection limits.
5.  **Missing Production Environment Configuration**:
    *   `server/.env` specifies `MONGO_URI=mongodb://127.0.0.1:27017/placeearly`. On Vercel, `127.0.0.1` is localhost inside the serverless container where no MongoDB instance runs, causing immediate connection timeouts unless a cloud MongoDB Atlas connection string is provided in the Vercel dashboard.

---

## 9. Prioritized Remediation Roadmap

### Priority 0 (P0) — Security & Structural Blockers
1.  **Security & Secret Scrubbing**:
    *   Remove `server/.env` from Git tracking (`git rm --cached server/.env`), create root `.gitignore` ignoring `.env`, `.env.*`, `uploads/`, `node_modules/`, and rotate `JWT_SECRET`.
    *   Enforce that the server throws an explicit fatal error at startup if `process.env.JWT_SECRET` is undefined, completely removing `'fallback_secret'`.
2.  **Fix Database & Schema Inconsistencies**:
    *   Reconcile `StudentProfile.js` with controllers:
        *   Standardize reference field: use `user` (or consistently rename to `userId`).
        *   Standardize verification field: use `isVerifiedByTPO` (or `isVerified`).
        *   Standardize academic subdocument: map `academics` cleanly to avoid `TypeError: Cannot read properties of undefined (reading 'cgpa')`.
        *   Add `rollNo` and `resumeUrl` directly to `StudentProfile` schema.
    *   Align `Application.js` `status` enum with the 5-stage placement workflow (`Applied`, `Online Assessment`, `Technical Round`, `HR Round`, `Offer Extended`, `Rejected`).
3.  **Eliminate Mock Fallbacks & Wire Real API**:
    *   Replace `placementStore.js` with real API calls using Axios / TanStack React Query.
    *   Remove `mock_db_users` and localStorage authentication mocks from `authService.js`.
4.  **Prevent Privilege Escalation on Registration**:
    *   Enforce that `POST /api/auth/register` only registers `student` accounts by default. Require authenticated admin tokens for creating `tpo`, `coordinator`, `recruiter`, `admin`, or `superadmin` roles.
5.  **Fix File Upload Architecture**:
    *   Replace `multer.diskStorage` with cloud object storage (e.g., Vercel Blob or AWS S3 / Cloudinary) or memory storage with external persistence so resume uploads survive serverless recycling.

### Priority 1 (P1) — Functional & Real-World Placement OS Requirements
1.  **Zod Schema Validation on All Endpoints**:
    *   Install `zod` in `server/` and create validation middleware for all request bodies, params, and queries.
    *   Standardize error response format across the entire API: `{ error: { code, message, details? } }`.
2.  **Role-Based Access Control for All 6 Specified Roles**:
    *   Expand `User.js` role enum to include `student`, `tpo`, `coordinator` (Dept Coordinator), `recruiter`, `admin`, `superadmin`.
    *   Create dedicated dashboards/views or permission boundaries for Department Coordinators and Recruiters.
    *   Update `ProtectedRoute.jsx` and navigation links to reflect all 6 roles.
3.  **Audit Logging Engine (Rule 5)**:
    *   Create `AuditLog` Mongoose model and Express audit middleware.
    *   Log every status change, verification decision, drive creation, and student application with `who`, `what`, `target`, `before/after`, `timestamp`, and `ip`.
4.  **Server-Side Pagination, Filtering & Sorting (Rule 4)**:
    *   Add pagination (`page`, `limit`), search queries (`q`), and multi-criteria filters on `/api/opportunities`, `/api/opportunities/applications/all`, and `/api/profile/all`.
    *   Update client list screens with loading skeletons, empty states, and pagination controls.
5.  **Mongoose Serverless Connection Caching**:
    *   Implement connection caching (`cached.conn`, `cached.promise`) in a dedicated `server/src/config/db.js` module.
6.  **Rate Limiting**:
    *   Add `express-rate-limit` on `/api/auth/login` and `/api/auth/register` to block brute-force attacks.

### Priority 2 (P2) — Polish, Design System & Completeness
1.  **Dark-First Design System (Rule 7)**:
    *   Refactor `index.css` and Tailwind configuration to default to dark-first semantic tokens (`--color-bg`, `--color-card`, `--color-border`, `--color-text`, `--color-primary`) with accessible contrast ratios (WCAG AA).
    *   Ensure all screens are responsive down to 360px viewport width.
2.  **Clean Up Dead Buttons & Links**:
    *   Replace all `href="#"` links on `Home.jsx` with real pages or modals.
    *   Wire or remove the `Remember me` checkbox and `Forgot password?` link on `Login.jsx`.
    *   Add real links/modals for Tracks 2 and 3 in the Student Preparation Hub.
3.  **Automated Testing Suite (Rule 6)**:
    *   Add comprehensive backend integration tests (`supertest`) covering authentication, eligibility evaluation, and role permissions.
    *   Add client component tests (Vitest + React Testing Library) verifying form validations and loading states.
4.  **Database-Backed Directories**:
    *   Migrate `jobPlatformsData.js` and `learningPlatformsData.js` to database collections or cached API endpoints with search, category filters, and bookmarking backed by user accounts.
