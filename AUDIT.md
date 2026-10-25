# PLACEearly Platform Audit Report
**Date:** October 26, 2026  
**Audited Platform:** PLACEearly — Campus Placement Operating System (OS)  
**Repository Path:** `C:\Users\edhub\Desktop\Anti Gravity Projects\PLACEearly`  
**Deployment Target:** Vercel (Multi-Service: Vite SPA Client + Express 5.2 Serverless Backend)  
**CI/CD Pipeline:** `.github/workflows/ci.yml`  
**Database:** MongoDB via Mongoose ODM  

---

## 1. Folder Structure & Technology Stack

### 1.1 Complete Repository Directory Tree

```
PLACEearly/
├── .git/                                   # Git version control metadata
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI workflow (Node 22: backend tests, client lint & build)
├── vercel.json                             # Vercel multi-service routing config (Vite client + Express server)
├── AUDIT.md                                # This exhaustive platform audit report
├── client/                                 # Frontend SPA Service (React 19 + Vite 8)
│   ├── public/
│   │   ├── favicon.svg                     # Platform favicon
│   │   └── register-landscape.jpg          # Campus landscape registration artwork
│   ├── src/
│   │   ├── assets/                         # SVG icons and visual assets
│   │   ├── components/                     # Reusable layouts, modals, and route guards
│   │   │   ├── AtsMatcherModal.jsx         # Candidate ATS resume matching modal
│   │   │   ├── ProtectedRoute.jsx          # Role-based route guard
│   │   │   ├── RecruiterLayout.jsx         # Recruiter portal layout and sidebar
│   │   │   ├── StudentLayout.jsx           # Student portal layout and navigation
│   │   │   ├── TpoLayout.jsx               # TPO portal layout and feature-flagged navigation
│   │   │   └── tpo/                        # TPO-specific components (e.g. Natural Language Search)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx             # User auth state, token storage, and login/logout handlers
│   │   │   └── TenantContext.jsx           # College branding, feature flags, and grading systems
│   │   ├── data/
│   │   │   ├── jobPlatformsData.js         # 55 job/internship platforms catalog
│   │   │   └── learningPlatformsData.js    # 35 coding/CS platforms catalog
│   │   ├── pages/                          # 52 page components (Public, Student, TPO, Recruiter, Super Admin)
│   │   │   ├── recruiter/                  # 6 Recruiter portal pages
│   │   │   ├── student/                    # 14 Student portal pages
│   │   │   └── tpo/                        # 18 TPO command center pages
│   │   ├── services/                       # 14 Frontend API client services (axios instances)
│   │   │   ├── aiService.js
│   │   │   ├── alumniService.js
│   │   │   ├── api.js                      # Base axios client with auth interceptor
│   │   │   ├── applicationService.js
│   │   │   ├── authService.js
│   │   │   ├── collegeService.js
│   │   │   ├── documentService.js
│   │   │   ├── externalOutcomeService.js
│   │   │   ├── internshipService.js
│   │   │   ├── interviewExperienceService.js
│   │   │   ├── notificationService.js
│   │   │   ├── opportunityService.js
│   │   │   ├── placementPolicyService.js
│   │   │   ├── recruiterService.js
│   │   │   ├── reportService.js
│   │   │   ├── resourceService.js
│   │   │   ├── studentService.js
│   │   │   └── tpoService.js
│   │   ├── App.jsx                         # Main router declaration (55 registered routes)
│   │   ├── index.css                       # Tailwind CSS v4 design tokens and fonts
│   │   └── main.jsx                        # React root entrypoint
│   ├── index.html
│   ├── package.json                        # Client dependencies (React 19, Vite 8, Tailwind 4, Recharts, Lucide)
│   └── vite.config.js                      # Vite bundler config with Tailwind plugin
└── server/                                 # Backend REST API Service (Express 5.2 + Node 22)
    ├── storage/                            # Local storage vault (fallback for object storage)
    ├── src/
    │   ├── config/                         # Environment & database configuration
    │   ├── controllers/                    # 20 Express route controllers
    │   ├── data/                           # 90+ consolidated platforms catalog (resourcesData.js)
    │   ├── middleware/                     # Auth, tenant context, and feature flag middleware
    │   │   ├── authMiddleware.js           # JWT verification & role authorization
    │   │   ├── featureFlagMiddleware.js    # Per-college feature flag enforcement
    │   │   └── tenantContext.js            # Multi-tenant scoping middleware
    │   ├── models/                         # 25 Mongoose data models
    │   ├── plugins/                        # Mongoose tenant scoping plugin
    │   ├── routes/                         # 17 Express route modules (184 total API endpoints)
    │   ├── services/                       # Specialized business logic engines
    │   │   ├── ai/                         # Claude AI suite, keyword matching, cost tracking, prompt defense
    │   │   ├── notifications/              # Event bus, queue, providers, quiet hours
    │   │   ├── policyEngine/               # Placement policy evaluation & preview simulator
    │   │   ├── reports/                    # NAAC/NIRF reporting, XLSX/PDF generators, weekly digest
    │   │   └── storage/                    # Storage abstraction (LocalStorageProvider, S3StorageProvider)
    │   ├── utils/                          # Audit logger, cryptographic seal, file validator
    │   ├── validations/                    # Zod input validation schemas (currently only collegeValidation.js)
    │   └── index.js                        # Express server entrypoint & middleware mounting
    ├── tests/                              # 24 test suites (233 passing unit/integration tests)
    └── package.json                        # Server dependencies (Express 5, Mongoose 9, Bcryptjs, JWT, Zod, AWS SDK)
```

### 1.2 Technology Stack Matrix

| Layer | Component | Version / Technology | Key Responsibilities & Capabilities |
| :--- | :--- | :--- | :--- |
| **Client** | React SPA | React 19.2.8 | Single-page application, functional components, hooks, React Router v7 |
| **Build & Tooling** | Vite | Vite 8.2.2 | Fast dev server, Rollup production bundler, CSS preprocessing |
| **Styling & Design** | Tailwind CSS | Tailwind CSS v4.3.3 | Dark-first slate palette (`bg-slate-950`, `bg-slate-900`), utility classes, design tokens |
| **Data Viz** | Recharts | Recharts 3.10.1 | Responsive BarCharts, PieCharts, LineCharts for placement metrics & funnels |
| **Server** | Node.js / Express | Express 5.2.1, Node 22 | RESTful API server, middleware pipeline, multi-tenant isolation |
| **Database** | MongoDB | Mongoose 9.9.4 | Schemas, compound indexes, discriminator/subdocs, tenant isolation hooks |
| **Authentication** | JWT & Bcrypt | jsonwebtoken 9.0.3, bcryptjs 3.0.3 | Bearer tokens with embedded tenant context (`collegeId`, `role`), salted password hashing |
| **Validation** | Zod | Zod 4.6.7 | Strict schema validation (currently applied to College settings, pending rollout across all endpoints) |
| **File Storage** | Hybrid Storage | `@aws-sdk/client-s3` + Local Vault | Memory-streamed upload with magic-byte verification, signed 5-minute download tokens |
| **AI Integration** | Claude API | `@anthropic-ai/sdk` 1.1.0 | Server-side resume matching, mock interviewer, company prep packs, prompt defense |
| **Export Formats** | SheetJS & PDFKit | `xlsx` 0.18.5, pure JS PDF generator | In-memory XLSX multi-sheet generation, vector PDF with signatory lines |
| **Hosting Target** | Vercel Serverless | Multi-service (`vercel.json`) | Serverless Lambda execution, rewrites for API and client SPA routing |
| **CI / CD** | GitHub Actions | `.github/workflows/ci.yml` | Automated backend test run (Node 22), client linting (`oxlint`), and production Vite build |

---

## 2. Client Pages & Routes Inventory

The application defines **55 routes** in [`client/src/App.jsx`](file:///c:/Users/edhub/Desktop/Anti%20Gravity%20Projects/PLACEearly/client/src/App.jsx) across 6 roles (`student`, `tpo`, `recruiter`, `admin`, `superadmin`, and public visitors).

| # | Route Path | Component | Allowed Roles | Functional Status | Associated Services & APIs | Missing States / Gaps |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `/` | `Home` | public | Static (Marketing) | None | Static content only, no persistent mutations |
| 2 | `/for-students` | `ForStudents` | public | Static (Marketing) | None | Static content only, no persistent mutations |
| 3 | `/for-colleges` | `ForColleges` | public | Static (Marketing) | None | Static content only, no persistent mutations |
| 4 | `/how-it-works` | `HowItWorks` | public | Static (Marketing) | None | Static content only, no persistent mutations |
| 5 | `/job-platforms` | `JobPlatforms` | public | Static (Local Data Catalog) | None | Static content only, no persistent mutations |
| 6 | `/learning-platforms` | `LearningPlatforms` | public | Static (Local Data Catalog) | None | Static content only, no persistent mutations |
| 7 | `/verify/:code` | `PublicVerify` | public | Fully Functional | api | None (Fully Handled) |
| 8 | `/portfolio/:rollNo` | `PublicPortfolio` | public | Fully Functional | api | None (Fully Handled) |
| 9 | `/login` | `Login` | public | Static / Form-only | None | Static content only, no persistent mutations |
| 10 | `/register` | `Register` | public | Static / Form-only | None | Static content only, no persistent mutations |
| 11 | `/recruiter/accept-invite` | `RecruiterAcceptInvite` | public | Fully Functional | recruiterService | None (Fully Handled) |
| 12 | `/unauthorized` | `Unauthorized` | public | Fully Functional | None | None (Fully Handled) |
| 13 | `/recruiter` | `RecruiterLayout` | recruiter, admin, superadmin | Static / Form-only | None | Static content only, no persistent mutations |
| 14 | `drives` | `RecruiterDrives` | recruiter, admin, superadmin | Fully Functional | recruiterService | None (Fully Handled) |
| 15 | `drives/:driveId/candidates` | `RecruiterDriveCandidates` | recruiter, admin, superadmin | Fully Functional | recruiterService | None (Fully Handled) |
| 16 | `drives/:driveId/jd-editor` | `RecruiterJdEditor` | recruiter, admin, superadmin | Fully Functional | recruiterService | None (Fully Handled) |
| 17 | `drives/:driveId/schedule` | `RecruiterScheduleSlots` | recruiter, admin, superadmin | Fully Functional | recruiterService | None (Fully Handled) |
| 18 | `drives/:driveId/funnel` | `RecruiterDriveFunnel` | recruiter, admin, superadmin | Fully Functional | recruiterService | None (Fully Handled) |
| 19 | `/student` | `StudentLayout` | student | Static / Form-only | None | Static content only, no persistent mutations |
| 20 | `dashboard` | `StudentDashboardHome` | student | Fully Functional | studentService | None (Fully Handled) |
| 21 | `opportunities` | `StudentOpportunityHub` | student | Fully Functional | studentService, policyService | Needs server-side pagination for >50 drives |
| 22 | `applications` | `StudentApplications` | student | Fully Functional | studentService | None (Fully Handled) |
| 23 | `profile` | `StudentProfileBuilder` | student | Fully Functional | studentService, documentService | None (Fully Handled) |
| 24 | `interviews` | `StudentInterviewCalendar` | student | Fully Functional | studentService | None (Fully Handled) |
| 25 | `mock-interview` | `StudentMockInterview` | student | Partly Mocked (Hardcoded Defaults) | aiService | Initial hardcoded state defaults, needs empty/DB init |
| 26 | `documents` | `StudentDocuments` | student | Fully Functional | studentService, documentService | None (Fully Handled) |
| 27 | `privacy` | `StudentPrivacy` | student | Fully Functional | studentService | None (Fully Handled) |
| 28 | `notifications/preferences` | `NotificationPreferences` | student | Fully Functional | notificationService | None (Fully Handled) |
| 29 | `alumni` | `StudentAlumniNetwork` | student | Partly Mocked (Hardcoded Defaults) | alumniService | Initial hardcoded state defaults, needs empty/DB init |
| 30 | `interview-experiences` | `StudentInterviewExperiences` | student | Fully Functional | interviewExperienceService | None (Fully Handled) |
| 31 | `internships` | `StudentInternships` | student | Fully Functional | internshipService | None (Fully Handled) |
| 32 | `outcomes` | `StudentOutcomes` | student | Fully Functional | externalOutcomeService | None (Fully Handled) |
| 33 | `resources` | `StudentResources` | student | Fully Functional | resourceService | None (Fully Handled) |
| 34 | `/tpo` | `TpoLayout` | tpo, admin, superadmin | Fully Functional | tpoService | None (Fully Handled) |
| 35 | `dashboard` | `TpoDashboardHome` | tpo, admin, superadmin | Fully Functional | tpoService | None (Fully Handled) |
| 36 | `students` | `TpoStudents` | tpo, admin, superadmin | Fully Functional | tpoService | None (Fully Handled) |
| 37 | `placement-risk` | `TpoPlacementRiskDashboard` | tpo, admin, superadmin | Fully Functional | aiService | None (Fully Handled) |
| 38 | `verification` | `TpoVerification` | tpo, admin, superadmin | Fully Functional | tpoService | None (Fully Handled) |
| 39 | `drives` | `TpoDrives` | tpo, admin, superadmin | Fully Functional | tpoService | None (Fully Handled) |
| 40 | `drives/:id` | `TpoDriveWorkspace` | tpo, admin, superadmin | Fully Functional | tpoService | None (Fully Handled) |
| 41 | `schedule` | `TpoSchedule` | tpo, admin, superadmin | Fully Functional | tpoService | None (Fully Handled) |
| 42 | `companies` | `TpoCompanies` | tpo, admin, superadmin | Fully Functional | tpoService | None (Fully Handled) |
| 43 | `announcements` | `TpoAnnouncements` | tpo, admin, superadmin | Fully Functional | tpoService | None (Fully Handled) |
| 44 | `notifications/tracking` | `TpoDeliveryReport` | tpo, admin, superadmin | Fully Functional | notificationService | None (Fully Handled) |
| 45 | `analytics` | `TpoAnalytics` | tpo, admin, superadmin | Fully Functional | tpoService | None (Fully Handled) |
| 46 | `reports` | `TpoReports` | tpo, admin, superadmin | Fully Functional | reportService, tpoService, api | None (Fully Handled) |
| 47 | `settings` | `TpoSettings` | tpo, admin, superadmin | Partly Mocked (Hardcoded Defaults) | tpoService, notificationService | Initial hardcoded state defaults, needs empty/DB init |
| 48 | `settings/policies` | `TpoPlacementPolicies` | tpo, admin, superadmin | Fully Functional | policyService, tpoService | None (Fully Handled) |
| 49 | `policies` | `TpoPlacementPolicies` | tpo, admin, superadmin | Fully Functional | policyService, tpoService | None (Fully Handled) |
| 50 | `alumni` | `TpoAlumniManagement` | tpo, admin, superadmin | Fully Functional | alumniService | None (Fully Handled) |
| 51 | `interview-experiences` | `TpoInterviewModeration` | tpo, admin, superadmin | Fully Functional | interviewExperienceService | None (Fully Handled) |
| 52 | `internships` | `TpoInternships` | tpo, admin, superadmin | Fully Functional | internshipService | None (Fully Handled) |
| 53 | `outcomes` | `TpoExternalOutcomes` | tpo, admin, superadmin | Fully Functional | externalOutcomeService | None (Fully Handled) |
| 54 | `/superadmin` | `SuperAdminDashboard` | superadmin | Fully Functional | collegeService | None (Fully Handled) |
| 55 | `/college/settings` | `CollegeSettings` | tpo, admin, superadmin | Fully Functional | collegeService | None (Fully Handled) |

> **Note on Legacy Pages:** Two monolithic unmounted files exist in `client/src/pages/`:
> - `StudentDashboard.jsx` (988 lines): Legacy pre-modularization dashboard, relies on `placementStore.js` (localStorage). Not loaded by `App.jsx`.
> - `TpoDashboard.jsx` (1,483 lines): Legacy pre-modularization dashboard, relies on `placementStore.js` (localStorage). Not loaded by `App.jsx`.
> - `placementStore.js` (539 lines): In-memory mock store only referenced by the two unmounted legacy files.

---

## 3. Server API Endpoints Inventory

The backend exposes **184 API endpoints** across 17 route modules mounted in [`server/src/index.js`](file:///c:/Users/edhub/Desktop/Anti%20Gravity%20Projects/PLACEearly/server/src/index.js).

| Method | Endpoint Path | Source Route File | Auth Req? | Role Check Present | Zod Validated? | Automated Test? |
| :--- | :--- | :--- | :---: | :--- | :---: | :---: |
| `POST` | `/api/ai/resume-match` | `aiRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/ai/mock-interview/start` | `aiRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/ai/mock-interview/:sessionId/respond` | `aiRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/ai/mock-interview/history` | `aiRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/ai/mock-interview/:sessionId` | `aiRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/ai/prep-pack/:companyName` | `aiRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/alumni/directory` | `alumniRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/alumni/profile` | `alumniRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/alumni/referrals/request` | `alumniRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/alumni/referrals/my-requests` | `alumniRoutes.js` | Yes | Authenticated | **No** | **No** |
| `PATCH` | `/api/alumni/referrals/:id` | `alumniRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/alumni/mentors/match` | `alumniRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/alumni/tpo/unverified` | `alumniRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/alumni/tpo/verify/:id` | `alumniRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/auth/register` | `authRoutes.js` | **No** | **None (Public)** | **No** | **No** |
| `POST` | `/api/auth/login` | `authRoutes.js` | **No** | **None (Public)** | **No** | **No** |
| `GET` | `/api/auth/profile` | `authRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/auth/invite-recruiter` | `authRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/auth/invite/:token` | `authRoutes.js` | **No** | **None (Public)** | Yes | **No** |
| `POST` | `/api/auth/set-password` | `authRoutes.js` | **No** | **None (Public)** | **No** | **No** |
| `GET` | `/api/colleges/public/:identifier` | `collegeRoutes.js` | **No** | **None (Public)** | **No** | **No** |
| `GET` | `/api/colleges` | `collegeRoutes.js` | Yes | `superadmin` | **No** | Yes |
| `POST` | `/api/colleges` | `collegeRoutes.js` | Yes | `superadmin` | **No** | Yes |
| `GET` | `/api/colleges/:id` | `collegeRoutes.js` | Yes | `superadmin, tpo, admin` | **No** | **No** |
| `PUT` | `/api/colleges/:id/config` | `collegeRoutes.js` | Yes | `superadmin, tpo, admin` | **No** | **No** |
| `PUT` | `/api/colleges/:id/features` | `collegeRoutes.js` | Yes | `superadmin` | **No** | **No** |
| `POST` | `/api/colleges/:id/tpo-invite` | `collegeRoutes.js` | Yes | `superadmin` | **No** | **No** |
| `GET` | `/api/colleges/:id/stats` | `collegeRoutes.js` | Yes | `superadmin, tpo, admin` | **No** | **No** |
| `POST` | `/api/documents/upload` | `documentRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/documents/:id/signed-url` | `documentRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/documents/raw/{*key}` | `documentRoutes.js` | **No** | **None (Public)** | **No** | **No** |
| `GET` | `/api/documents/raw` | `documentRoutes.js` | **No** | **None (Public)** | **No** | Yes |
| `GET` | `/api/documents` | `documentRoutes.js` | Yes | Authenticated | **No** | Yes |
| `POST` | `/api/external-outcomes` | `externalOutcomeRoutes.js` | Yes | Authenticated | **No** | Yes |
| `GET` | `/api/external-outcomes/my-outcomes` | `externalOutcomeRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/external-outcomes/stats` | `externalOutcomeRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/external-outcomes/tpo/queue` | `externalOutcomeRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/external-outcomes/tpo/verify/:id` | `externalOutcomeRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/internships` | `internshipRoutes.js` | Yes | Authenticated | **No** | Yes |
| `POST` | `/api/internships` | `internshipRoutes.js` | Yes | Authenticated | **No** | Yes |
| `PATCH` | `/api/internships/:id/ppo` | `internshipRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/internships/stats` | `internshipRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/interview-experiences` | `interviewExperienceRoutes.js` | Yes | Authenticated | **No** | Yes |
| `POST` | `/api/interview-experiences` | `interviewExperienceRoutes.js` | Yes | Authenticated | **No** | Yes |
| `POST` | `/api/interview-experiences/:id/upvote` | `interviewExperienceRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/interview-experiences/moderation` | `interviewExperienceRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/interview-experiences/:id/moderate` | `interviewExperienceRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/notifications/unsubscribe` | `notificationRoutes.js` | Yes | Authenticated | **No** | Yes |
| `GET` | `/api/notifications` | `notificationRoutes.js` | Yes | Authenticated | **No** | Yes |
| `GET` | `/api/notifications/unread-count` | `notificationRoutes.js` | Yes | Authenticated | **No** | **No** |
| `PATCH` | `/api/notifications/:id/read` | `notificationRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/notifications/mark-all-read` | `notificationRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/notifications/preferences` | `notificationRoutes.js` | Yes | Authenticated | **No** | **No** |
| `PUT` | `/api/notifications/preferences` | `notificationRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/notifications/preferences/whatsapp-optin` | `notificationRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/notifications/preferences/push-subscribe` | `notificationRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/notifications/tracking` | `notificationRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/notifications/retry-failed` | `notificationRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/notifications/templates` | `notificationRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PUT` | `/api/notifications/templates/:eventType` | `notificationRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/notifications/templates/test-send` | `notificationRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/notifications/queue/drain` | `notificationRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/notifications/trigger-reminders` | `notificationRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/opportunities` | `opportunityRoutes.js` | Yes | Authenticated | **No** | Yes |
| `POST` | `/api/opportunities` | `opportunityRoutes.js` | Yes | `tpo, superadmin` | **No** | Yes |
| `POST` | `/api/opportunities/:id/apply` | `opportunityRoutes.js` | Yes | `student` | **No** | **No** |
| `GET` | `/api/opportunities/applications/me` | `opportunityRoutes.js` | Yes | `student` | **No** | **No** |
| `GET` | `/api/opportunities/applications/all` | `opportunityRoutes.js` | Yes | `tpo, superadmin` | **No** | **No** |
| `GET` | `/api/opportunities/:id/applications` | `opportunityRoutes.js` | Yes | `tpo, superadmin` | **No** | **No** |
| `PUT` | `/api/opportunities/applications/:id/status` | `opportunityRoutes.js` | Yes | `tpo, superadmin` | **No** | **No** |
| `GET` | `/api/policies` | `placementPolicyRoutes.js` | Yes | Authenticated | **No** | Yes |
| `GET` | `/api/tpo/policies` | `placementPolicyRoutes.js` | Yes | Authenticated | **No** | Yes |
| `POST` | `/api/policies/exceptions` | `placementPolicyRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/tpo/policies/exceptions` | `placementPolicyRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/policies/check/:id` | `placementPolicyRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/tpo/policies/check/:id` | `placementPolicyRoutes.js` | Yes | Authenticated | **No** | **No** |
| `PUT` | `/api/policies` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | Yes |
| `PUT` | `/api/tpo/policies` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | Yes |
| `POST` | `/api/policies/preview` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/policies/preview` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/policies/overrides` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/policies/overrides` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/policies/overrides` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/policies/overrides` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `DELETE` | `/api/policies/overrides/:id` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `DELETE` | `/api/tpo/policies/overrides/:id` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/policies/exceptions` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/policies/exceptions` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/policies/exceptions/:id` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/tpo/policies/exceptions/:id` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/policies/fairness-report` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/policies/fairness-report` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/policies/fairness-report/export` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/policies/fairness-report/export` | `placementPolicyRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/profile/me` | `profileRoutes.js` | Yes | Authenticated | **No** | Yes |
| `POST` | `/api/profile` | `profileRoutes.js` | Yes | Authenticated | **No** | Yes |
| `GET` | `/api/profile/all` | `profileRoutes.js` | Yes | `tpo, superadmin` | **No** | **No** |
| `PUT` | `/api/profile/:id/verify` | `profileRoutes.js` | Yes | `tpo, superadmin` | **No** | **No** |
| `GET` | `/api/recruiter/drives` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | Yes |
| `GET` | `/api/recruiter/drives/:id` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `PUT` | `/api/recruiter/drives/:id/propose-jd` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `GET` | `/api/recruiter/drives/:id/candidates` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/recruiter/applications/:id/status` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `GET` | `/api/recruiter/drives/:id/export-shortlist` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `GET` | `/api/recruiter/applications/:id/resume` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `POST` | `/api/recruiter/drives/:id/schedule-slots` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `GET` | `/api/recruiter/drives/:id/schedule` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `POST` | `/api/recruiter/applications/:id/feedback` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `POST` | `/api/recruiter/applications/:id/propose-offer` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `GET` | `/api/recruiter/drives/:id/funnel` | `recruiterRoutes.js` | Yes | `recruiter, admin, superadmin` | **No** | **No** |
| `GET` | `/api/resources` | `resourceRoutes.js` | Yes | Authenticated | **No** | Yes |
| `GET` | `/api/resources/bookmarks` | `resourceRoutes.js` | Yes | Authenticated | **No** | **No** |
| `POST` | `/api/resources/bookmarks/:resourceId` | `resourceRoutes.js` | Yes | Authenticated | **No** | **No** |
| `GET` | `/api/student/dashboard/today` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `GET` | `/api/student/profile` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `PUT` | `/api/student/profile` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `GET` | `/api/student/opportunities` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `GET` | `/api/student/opportunities/:id/eligibility` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `POST` | `/api/student/opportunities/:id/apply` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `DELETE` | `/api/student/opportunities/:id/withdraw` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `GET` | `/api/student/applications` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/student/applications/:id/offer-decision` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `GET` | `/api/student/interviews` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | Yes |
| `GET` | `/api/student/interviews/export-ics` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `GET` | `/api/student/documents` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | Yes |
| `POST` | `/api/student/documents/noc-request` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `GET` | `/api/student/privacy/export-data` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `POST` | `/api/student/privacy/deletion-request` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `POST` | `/api/student/privacy/consent` | `studentRoutes.js` | Yes | `student, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/dashboard-summary` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/students` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/students/:id` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/students/bulk-verify` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/students/bulk-import/preview` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/students/bulk-import/commit` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/students/manual` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PUT` | `/api/tpo/students/:id/notes` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/verification-queue` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/verification/:studentId/action` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/drives` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | Yes |
| `POST` | `/api/tpo/drives` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | Yes |
| `PUT` | `/api/tpo/drives/:id` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/drives/preview-eligibility` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/tpo/drives/:id/status` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/drives/:id/duplicate` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/tpo/drives/:id/review-proposed-jd` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/drives/:id/workspace` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/drives/:id/eligible-non-applicants` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/tpo/drives/:id/applicants/advance` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/drives/:id/shortlist-upload` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/drives/:id/applicants/:appId/feedback` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/drives/:id/applicants/:appId/offer` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/tpo/applications/:appId/review-proposed-offer` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/schedule/slots` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/schedule/check-clash` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/schedule/bulk-generate` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PUT` | `/api/tpo/schedule/slots/:id` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/schedule/export-ics` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/companies` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/companies` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PUT` | `/api/tpo/companies/:id` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/companies/:id/reminder` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/announcements` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/announcements/preview-recipients` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/announcements/send` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/analytics/overview` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/analytics/unplaced` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/analytics/multiple-offers` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/reports/templates` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/reports/generate` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/reports/history` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/reports/jobs` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/reports/jobs/:jobId` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/reports/download/:jobId` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/reports/jobs-history` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/reports/yoy` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PATCH` | `/api/tpo/reports/settings` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/reports/digest` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/tpo/settings` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PUT` | `/api/tpo/settings/policies` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PUT` | `/api/tpo/settings/branches` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `POST` | `/api/tpo/settings/team` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `PUT` | `/api/tpo/settings/templates` | `tpoRoutes.js` | Yes | `tpo, admin, superadmin` | **No** | **No** |
| `GET` | `/api/verify/:code` | `verifyRoutes.js` | **No** | **None (Public)** | **No** | **No** |

---

## 4. Data Models, Schemas, Indexes & Relations

The platform contains **25 Mongoose data models** located in [`server/src/models/`](file:///c:/Users/edhub/Desktop/Anti%20Gravity%20Projects/PLACEearly/server/src/models/).

### 4.1 Model: `AiAuditLog` (`AiAuditLog.js`)

- **Top-Level Fields (13):** `collegeId`, `userId`, `userRole`, `feature`, `model`, `promptTokens`, `completionTokens`, `totalTokens`, `estimatedCostUsd`, `latencyMs`, `isFallback`, `status`, `sanitizedMetadata`
- **Compound & Custom Indexes (1):**
  - `.index({ createdAt: -1 })`
- **Foreign Key Relations (`ref`):** `College`, `User`

### 4.2 Model: `AlumniProfile` (`AlumniProfile.js`)

- **Top-Level Fields (19):** `userId`, `collegeId`, `fullName`, `email`, `batchYear`, `branch`, `currentCompany`, `currentRole`, `location`, `linkedinUrl`, `bio`, `isVerifiedAlumni`, `verifiedBy`, `verifiedAt`, `verificationMethod`, `willingToRefer`, `willingToMentor`, `mentorshipDomains`, `totalReferralsProvided`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, currentCompany: 1, branch: 1 })`
- **Foreign Key Relations (`ref`):** `User`, `College`

### 4.3 Model: `AlumniReferralRequest` (`AlumniReferralRequest.js`)

- **Top-Level Fields (12):** `studentId`, `alumniId`, `collegeId`, `requestType`, `targetCompany`, `targetRole`, `jobUrlOrId`, `resumeUrl`, `message`, `status`, `alumniNote`, `respondedAt`
- **Compound & Custom Indexes (1):**
  - `.index({ studentId: 1, createdAt: -1 })`
- **Foreign Key Relations (`ref`):** `User`, `AlumniProfile`, `College`

### 4.4 Model: `Announcement` (`Announcement.js`)

- **Top-Level Fields (24):** `collegeId`, `title`, `body`, `category`, `segments`, `targetAll`, `branches`, `graduationYears`, `driveId`, `driveRound`, `placedStatus`, `channels`, `inApp`, `email`, `smsOrWhatsapp`, `scheduledAt`, `sentAt`, `sentBy`, `recipientCount`, `deliveryStats`, `delivered`, `read`, `failed`, `status`
- **Compound & Custom Indexes (2):**
  - `.index({ collegeId: 1, createdAt: -1 })`
  - `.index({ collegeId: 1, status: 1, scheduledAt: 1 })`
- **Foreign Key Relations (`ref`):** `College`, `Opportunity`, `User`

### 4.5 Model: `Application` (`Application.js`)

- **Top-Level Fields (5):** `roundName`, `status`, `movedAt`, `movedBy`, `notes`
- **Compound & Custom Indexes (4):**
  - `.index({ collegeId: 1, studentId: 1, opportunityId: 1 }, { unique: true })`
  - `.index({ collegeId: 1, opportunityId: 1, status: 1 })`
  - `.index({ collegeId: 1, studentId: 1 })`
  - `.index({ collegeId: 1, 'offer.status': 1 })`
- **Foreign Key Relations (`ref`):** `User`, `College`, `Opportunity`

### 4.6 Model: `AuditLog` (`AuditLog.js`)

- **Top-Level Fields (11):** `collegeId`, `actorId`, `actorEmail`, `actorRole`, `action`, `targetModel`, `targetId`, `beforeState`, `afterState`, `ipAddress`, `userAgent`
- **Compound & Custom Indexes (3):**
  - `.index({ collegeId: 1, createdAt: -1 })`
  - `.index({ collegeId: 1, action: 1 })`
  - `.index({ collegeId: 1, actorId: 1 })`
- **Foreign Key Relations (`ref`):** `College`, `User`

### 4.7 Model: `College` (`College.js`)

- **Top-Level Fields (36):** `name`, `code`, `logo`, `domains`, `timezone`, `academicYearConfig`, `currentYear`, `startMonth`, `endMonth`, `placementSeason`, `startDate`, `endDate`, `branches`, `gradingSystem`, `scale`, `minPassCgpa`, `policies`, `maxActiveBacklogsAllowed`, `allowMultipleOffers`, `dreamTierThreshold`, `rules`, `featureFlags`, `atsMatcher`, `prepHub`, `publicPortfolio`, `interviewScheduler`, `alumniNetwork`, `interviewExperiences`, `internshipPpo`, `offCampusHigherStudies`, `consolidatedResources`, `reportSettings`, `headerTitle`, `logoUrl`, `signatories`, `title`
- **Compound & Custom Indexes (1):**
  - `.index({ domains: 1 })`
- **Foreign Key Relations (`ref`):** *None (Root / Standalone Model)*

### 4.8 Model: `Company` (`Company.js`)

- **Top-Level Fields (33):** `name`, `designation`, `email`, `phone`, `linkedIn`, `isPrimary`, `collegeId`, `logo`, `industry`, `tier`, `status`, `website`, `contactPersons`, `pastVisits`, `year`, `driveDate`, `hiredCount`, `highestCtc`, `avgCtc`, `notes`, `hiresHistory`, `count`, `roles`, `ctcHistory`, `minCtc`, `maxCtc`, `note`, `createdBy`, `createdAt`, `followUpReminders`, `title`, `dueDate`, `completed`
- **Compound & Custom Indexes (3):**
  - `.index({ collegeId: 1, name: 1 }, { unique: true })`
  - `.index({ collegeId: 1, status: 1 })`
  - `.index({ collegeId: 1, tier: 1 })`
- **Foreign Key Relations (`ref`):** `College`, `User`

### 4.9 Model: `Document` (`Document.js`)

- **Top-Level Fields (12):** `collegeId`, `ownerId`, `filename`, `originalName`, `mimeType`, `size`, `storageKey`, `sha256Hash`, `purpose`, `uploadedAt`, `scanStatus`, `scanDetails`
- **Compound & Custom Indexes (2):**
  - `.index({ collegeId: 1, ownerId: 1, purpose: 1 })`
  - `.index({ collegeId: 1, sha256Hash: 1 })`
- **Foreign Key Relations (`ref`):** `College`, `User`

### 4.10 Model: `EligibilityCache` (`EligibilityCache.js`)

- **Top-Level Fields (18):** `collegeId`, `studentId`, `opportunityId`, `isEligible`, `score`, `reasons`, `rule`, `actual`, `gap`, `status`, `message`, `whatIf`, `action`, `description`, `impact`, `summary`, `profileUpdatedAt`, `opportunityUpdatedAt`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, studentId: 1, opportunityId: 1 }, { unique: true })`
- **Foreign Key Relations (`ref`):** `College`, `User`, `Opportunity`

### 4.11 Model: `ExternalOutcome` (`ExternalOutcome.js`)

- **Top-Level Fields (30):** `studentId`, `collegeId`, `category`, `offCampusDetails`, `companyName`, `role`, `ctcLpa`, `location`, `offerLetterUrl`, `joiningDate`, `higherStudiesDetails`, `universityName`, `degree`, `country`, `program`, `examTaken`, `score`, `admissionLetterUrl`, `entrepreneurshipDetails`, `startupName`, `sector`, `incorporationDate`, `website`, `teamSize`, `fundingRaisedLakhs`, `cinOrUdyamNumber`, `verificationStatus`, `rejectionReason`, `verifiedBy`, `verifiedAt`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, category: 1, verificationStatus: 1 })`
- **Foreign Key Relations (`ref`):** `User`, `College`

### 4.12 Model: `InternshipRecord` (`InternshipRecord.js`)

- **Top-Level Fields (23):** `studentId`, `collegeId`, `opportunityId`, `companyName`, `role`, `stipendMonthly`, `durationMonths`, `startDate`, `endDate`, `mode`, `location`, `mentorName`, `mentorEmail`, `ppoStatus`, `ppoDetails`, `ctc`, `fixedCtc`, `variableCtc`, `offerLetterUrl`, `conversionDate`, `performanceRating`, `notes`, `isVerifiedByTPO`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, ppoStatus: 1 })`
- **Foreign Key Relations (`ref`):** `User`, `College`, `Opportunity`

### 4.13 Model: `InterviewExperience` (`InterviewExperience.js`)

- **Top-Level Fields (6):** `roundName`, `roundType`, `durationMinutes`, `questions`, `tips`, `difficulty`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, status: 1, upvoteCount: -1 })`
- **Foreign Key Relations (`ref`):** `User`, `College`

### 4.14 Model: `InterviewSlot` (`InterviewSlot.js`)

- **Top-Level Fields (18):** `collegeId`, `opportunityId`, `roundName`, `roundNumber`, `studentId`, `panelName`, `interviewerNames`, `date`, `startTime`, `endTime`, `startDateTime`, `endDateTime`, `mode`, `roomOrLink`, `status`, `cancellationReason`, `feedbackSummary`, `createdBy`
- **Compound & Custom Indexes (3):**
  - `.index({ collegeId: 1, opportunityId: 1, status: 1 })`
  - `.index({ collegeId: 1, studentId: 1, startDateTime: 1, endDateTime: 1 })`
  - `.index({ collegeId: 1, panelName: 1, startDateTime: 1, endDateTime: 1 })`
- **Foreign Key Relations (`ref`):** `College`, `Opportunity`, `User`

### 4.15 Model: `MockInterviewSession` (`MockInterviewSession.js`)

- **Top-Level Fields (4):** `role`, `content`, `timestamp`, `questionNumber`
- **Compound & Custom Indexes (1):**
  - `.index({ studentId: 1, createdAt: -1 })`
- **Foreign Key Relations (`ref`):** `College`, `User`

### 4.16 Model: `Notification` (`Notification.js`)

- **Top-Level Fields (20):** `collegeId`, `userId`, `eventId`, `eventType`, `channel`, `title`, `body`, `deepLink`, `status`, `failureReason`, `retryCount`, `maxRetries`, `nextRetryAt`, `idempotencyKey`, `metadata`, `isMandatory`, `readAt`, `deliveredAt`, `sentAt`, `queuedAt`
- **Compound & Custom Indexes (3):**
  - `.index({ collegeId: 1, userId: 1, channel: 1, status: 1 })`
  - `.index({ collegeId: 1, status: 1, nextRetryAt: 1 })`
  - `.index({ collegeId: 1, idempotencyKey: 1 }, { unique: true })`
- **Foreign Key Relations (`ref`):** `College`, `User`

### 4.17 Model: `NotificationPreference` (`NotificationPreference.js`)

- **Top-Level Fields (22):** `collegeId`, `userId`, `channels`, `in_app`, `email`, `push`, `whatsapp`, `sms`, `pushSubscription`, `endpoint`, `keys`, `p256dh`, `auth`, `whatsappOptIn`, `enabled`, `verifiedAt`, `phoneNumber`, `emailUnsubscribed`, `unsubscribed`, `unsubscribedAt`, `customPreferences`, `of`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, userId: 1 }, { unique: true })`
- **Foreign Key Relations (`ref`):** `College`, `User`

### 4.18 Model: `NotificationTemplate` (`NotificationTemplate.js`)

- **Top-Level Fields (15):** `collegeId`, `eventType`, `channels`, `in_app`, `title`, `body`, `deepLink`, `email`, `subject`, `bodyHtml`, `bodyText`, `push`, `whatsapp`, `templateName`, `sms`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, eventType: 1 }, { unique: true })`
- **Foreign Key Relations (`ref`):** `College`

### 4.19 Model: `Opportunity` (`Opportunity.js`)

- **Top-Level Fields (5):** `roundNumber`, `name`, `mode`, `expectedDate`, `venueOrLink`
- **Compound & Custom Indexes (3):**
  - `.index({ collegeId: 1, status: 1, deadline: 1 })`
  - `.index({ collegeId: 1, createdAt: -1 })`
  - `.index({ collegeId: 1, companyName: 1 })`
- **Foreign Key Relations (`ref`):** `College`, `Company`, `User`

### 4.20 Model: `PlacementPolicy` (`PlacementPolicy.js`)

- **Top-Level Fields (4):** `name`, `minCtc`, `maxCtc`, `order`
- **Compound & Custom Indexes (0):**
  - *Default `_id` index only*
- **Foreign Key Relations (`ref`):** `Opportunity`, `College`

### 4.21 Model: `PolicyExceptionRequest` (`PolicyExceptionRequest.js`)

- **Top-Level Fields (3):** `name`, `url`, `uploadedAt`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, studentId: 1, opportunityId: 1 })`
- **Foreign Key Relations (`ref`):** `College`, `User`, `Opportunity`, `PolicyOverride`

### 4.22 Model: `PolicyOverride` (`PolicyOverride.js`)

- **Top-Level Fields (11):** `collegeId`, `studentId`, `opportunityId`, `policyType`, `mandatoryReason`, `approvedBy`, `isActive`, `expiresAt`, `revokedAt`, `revokedBy`, `revocationReason`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, studentId: 1, isActive: 1 })`
- **Foreign Key Relations (`ref`):** `College`, `User`, `Opportunity`

### 4.23 Model: `ReportJob` (`ReportJob.js`)

- **Top-Level Fields (21):** `jobId`, `collegeId`, `templateId`, `format`, `status`, `progress`, `downloadUrl`, `fileName`, `fileSize`, `rowCount`, `generatedBy`, `id`, `name`, `email`, `role`, `filters`, `graduationYear`, `branch`, `dateRange`, `error`, `completedAt`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, createdAt: -1 })`
- **Foreign Key Relations (`ref`):** `College`, `User`

### 4.24 Model: `StudentProfile` (`StudentProfile.js`)

- **Top-Level Fields (18):** `degree`, `institution`, `boardOrUniversity`, `yearOfPassing`, `score`, `scoreType`, `branch`, `status`, `verificationCode`, `sparse`, `hash`, `signature`, `keyId`, `version`, `verifiedAt`, `verifiedBy`, `signedPayload`, `rejectionReason`
- **Compound & Custom Indexes (5):**
  - `.index({ collegeId: 1, rollNo: 1 }, { unique: true })`
  - `.index({ collegeId: 1, user: 1 }, { unique: true })`
  - `.index({ collegeId: 1, branch: 1 })`
  - `.index({ collegeId: 1, isVerifiedByTPO: 1 })`
  - `.index({ 'verificationRecord.verificationCode': 1 })`
- **Foreign Key Relations (`ref`):** `User`, `College`

### 4.25 Model: `User` (`User.js`)

- **Top-Level Fields (12):** `collegeId`, `email`, `password`, `role`, `isVerified`, `firstName`, `lastName`, `companyId`, `companyName`, `inviteToken`, `inviteExpiresAt`, `isInvited`
- **Compound & Custom Indexes (1):**
  - `.index({ collegeId: 1, email: 1 }, { unique: true })`
- **Foreign Key Relations (`ref`):** `College`, `Company`

---

## 5. Hardcoded & Mock Data Locations

Auditing identified **4 active locations** where mock or static fallback data is present:

1. **`client/src/components/tpo/TpoNaturalLanguageSearch.jsx` (Line 24):**
   - `const sampleQueries = [...]` defines hardcoded quick-suggestion pill queries (e.g. *"Show unplaced CSE students with CGPA > 8.0"*).
   - *Impact:* Low; these are prompt suggestions for user convenience, but should ideally be dynamically seeded or tailored to college branch offerings.

2. **`client/src/pages/tpo/TpoSettings.jsx` (Line 39) & `server/src/controllers/notificationController.js` (Line 486):**
   - `const sampleVars = { studentName: 'Aditya Sharma', companyName: 'Google', ... }` hardcodes test merge tags for notification previews.
   - *Impact:* Moderate; previewing notifications with static candidate names can be misleading. Should pull from the logged-in TPO's college student sample.

3. **`client/src/pages/student/StudentProfileBuilder.jsx` (Lines 53–59):**
   - `useState([ { semesterNumber: 1, sgpa: 8.0 ... } ])` and initial skills `['React', 'Node.js', 'TypeScript', 'SQL']`.
   - *Impact:* **High (Violates Rule 2)**. New students who have not yet entered their academic records see pre-populated fake semester cards and skills instead of an empty onboarding state.

4. **`server/src/services/policyEngine/placementPolicyEngine.js` (Line 445):**
   - `const sampleBlocked = [];` placeholder used when policy simulation runs without drive candidates.
   - *Impact:* Low; fallback when evaluating policies against zero applicants.

5. **Legacy Mock Store (`client/src/services/placementStore.js`):**
   - 539 lines of hardcoded opportunities (`Google`, `Microsoft`, `Vercel`), students, applications, and round feedback.
   - *Impact:* Dead code; unreferenced by `App.jsx`, but consumes repository space and could cause confusion.

---

## 6. Dead Buttons, Placeholder Links & Non-Functional Forms

Auditing identified **11 dead links and non-functional triggers**:

1. **`client/src/pages/Home.jsx` (Lines 291–310):**
   - 9 dead footer links with `href="#"`:
     - Opportunity Hub (`href="#"`)
     - Eligibility Engine (`href="#"`)
     - Student Profiles (`href="#"`)
     - Analytics Reports (`href="#"`)
     - Preparation Hub (`href="#"`)
     - Help Center (`href="#"`)
     - Contact Support (`href="#"`)
     - Privacy Policy (`href="#"`)
     - Terms of Service (`href="#"`)
   - *Remediation:* Route internal links to their respective app paths (`/student/opportunities`, `/for-colleges`, `/how-it-works`) and create dedicated modal/pages for Privacy Policy and Terms of Service.

2. **`client/src/pages/Login.jsx` (Line 135):**
   - `<a href="#" ...>Forgot password?</a>` is an inert anchor tag without an `onClick` handler or password reset route.
   - *Remediation:* Wire to a password recovery modal or dedicated `/forgot-password` endpoint.

3. **`client/src/pages/student/StudentPrivacy.jsx` (Export Data Request):**
   - Export data button triggers client download of profile JSON, but does not request official institutional GDPR/DPDP export from backend.
   - *Remediation:* Wire to backend `GET /api/student/export-data` to package complete audit trail and attachments.

---

## 7. Security Analysis

### 7.1 Password Hashing & Encryption
- **Status:** **Secure.**
- **Implementation:** [`server/src/models/User.js`](file:///c:/Users/edhub/Desktop/Anti%20Gravity%20Projects/PLACEearly/server/src/models/User.js) uses `bcryptjs` with standard salt cost of 10 in a pre-save hook.
- **Verification Seal:** Uses Ed25519 asymmetric cryptographic signing for academic records (`cryptographicSeal.js`), preventing database tampering.

### 7.2 JWT Token Handling & Fallback Secrets
- **Status:** **CRITICAL VULNERABILITY (P0).**
- **Issue:** Multiple server files contain a hardcoded fallback string for `JWT_SECRET`:
  ```javascript
  process.env.JWT_SECRET || 'fallback_secret'
  ```
  Found in:
  - `server/src/middleware/authMiddleware.js` (Line 18)
  - `server/src/controllers/authController.js` (Line 19)
  - `server/src/controllers/notificationController.js`
  - `server/src/services/notifications/templateEngine.js`
- **Risk:** If `JWT_SECRET` is unset or fails to load in production, an attacker can forge administrative JWT tokens using `"fallback_secret"` and gain full superadmin access.
- **Remediation:** Throw a fatal error on server startup if `process.env.JWT_SECRET` is missing or shorter than 32 characters. Never allow a fallback default in production.

### 7.3 Token in Query Parameters
- **Status:** **HIGH SECURITY RISK (P0).**
- **Issue:** In `server/src/middleware/authMiddleware.js` (Lines 12–14):
  ```javascript
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }
  ```
- **Risk:** Tokens passed in query parameters are written to server access logs, reverse-proxy logs, browser history, and leaked via the HTTP `Referer` header to third-party assets.
- **Remediation:** Restrict Bearer tokens strictly to the `Authorization` header. If query token is needed for one-time file downloads, use short-lived single-use HMAC signed tokens (as done in `LocalStorageProvider`).

### 7.4 Missing Route-Level Role Authorization
- **Status:** **HIGH SECURITY RISK (P0).**
- **Issue:** Out of 184 API endpoints:
  - 155 require authentication (`protect` middleware).
  - Several mutative endpoints rely on controller-level checks rather than route-level `authorize(...)` middleware.
  - `server/src/routes/internshipRoutes.js`: Endpoints like `POST /api/internships` and `PATCH /api/internships/:id/ppo` check authentication, but any authenticated student could theoretically attempt to patch other students' PPO conversion records if object ownership checks in controller fail.
- **Remediation:** Add explicit `authorize('student')` or `authorize('tpo', 'admin')` to every route definition.

### 7.5 Missing Rate Limiting
- **Status:** **HIGH SECURITY RISK (P0).**
- **Issue:** Rate limiting is only implemented for Claude AI queries (`anthropicService.js`) and Alumni Referral requests (3/week).
- **Vulnerabilities:**
  - `POST /api/auth/login` has no rate limiter (vulnerable to brute-force credential stuffing).
  - `POST /api/auth/register` has no rate limiter (vulnerable to automated spam registrations).
  - Public routes `/api/verify/:code` and `/api/verify/portfolio/:rollNo` have no rate limiter (vulnerable to candidate enumeration and scraping).
- **Remediation:** Implement `express-rate-limit` with Redis or in-memory sliding window:
  - Auth routes: 5 requests per minute per IP.
  - Public verification routes: 30 requests per minute per IP.
  - General API: 120 requests per minute per user.

### 7.6 Overly Permissive CORS Configuration
- **Status:** **HIGH RISK (P1).**
- **Issue:** In `server/src/index.js` (Line 14):
  ```javascript
  app.use(cors());
  ```
- **Risk:** Defaults to `Access-Control-Allow-Origin: *`, allowing any origin to make requests.
- **Remediation:** Restrict CORS origin to `process.env.CLIENT_URL` with credentials support.

### 7.7 Committed Sensitive Files
- **Status:** **CRITICAL VULNERABILITY (P0).**
- **Issue:** `server/.env` is tracked in git index (`git ls-files server/.env` returns `server/.env`). It contains:
  ```env
  PORT=5001
  MONGO_URI=mongodb://127.0.0.1:27017/placeearly
  JWT_SECRET=placeearly_super_secure_jwt_secret_key_2026
  CLIENT_URL=http://localhost:5173
  ```
- **Remediation:** Run `git rm --cached server/.env`, add `.env` to `.gitignore`, provide `.env.example` with dummy placeholders, and rotate `JWT_SECRET`.

---

## 8. Deployment & Vercel Serverless Compatibility Issues

Deploying on Vercel serverless introduces architectural constraints that will cause production failures unless addressed:

### 8.1 In-Memory Buffer Cache (`reportBufferCache.js`)
- **Issue:** Report downloads (`POST /api/tpo/reports/jobs` followed by `GET /api/tpo/reports/download/:jobId`) store binary XLSX/PDF buffers in a local `Map` (`const bufferCache = new Map()`).
- **Failure on Vercel:** Serverless instances are stateless and ephemeral. The job generation runs in one Lambda instance, while the subsequent download request hits a different Lambda instance where `bufferCache.get(jobId)` is `undefined`, producing HTTP `404 File Not Found`.
- **Fix:** Persist generated report buffers in AWS S3 or store Base64/GridFS payloads in MongoDB, using pre-signed S3 download URLs.

### 8.2 Background Execution via `setImmediate` (`tpoReportJobController.js`)
- **Issue:** Report generation runs inside `setImmediate(async () => { ... })` after responding with HTTP 202.
- **Failure on Vercel:** Vercel freezes or tears down the serverless container as soon as the response stream closes. Asynchronous background tasks spawned without awaiting will be abruptly killed mid-execution.
- **Fix:** For reports taking under 8 seconds, compute synchronously before responding; for longer jobs, use Vercel Background Functions, AWS SQS/Lambda, or a dedicated worker.

### 8.3 Local Disk Storage Fallback (`LocalStorageProvider.js`)
- **Issue:** `LocalStorageProvider` writes uploaded documents and metadata to `path.join(__dirname, '../../../storage/private_vault')`.
- **Failure on Vercel:** Vercel Lambda file systems are strictly read-only except for the temporary `/tmp` directory (which is erased between invocations). Calling `fs.mkdirSync` or `fs.promises.writeFile` throws `EROFS: read-only file system`.
- **Fix:** Enforce `S3StorageProvider` in production environments. Automatically detect `process.env.VERCEL` and disable `LocalStorageProvider`.

### 8.4 In-Memory AI Caching & Rate Limiting
- **Issue:** `aiCache.js` and `anthropicService.js` store cache keys and token counts in memory.
- **Failure on Vercel:** Rate limit counts and cache hits will not be shared across serverless instances, leading to ineffective rate limits and redundant Claude API calls.
- **Fix:** Back rate limiting and response caches with MongoDB collection (`AiCache`) or Upstash Redis.

---

## 9. Prioritized Remediation Roadmap

### Priority 0: Critical Fixes (Security & Serverless Blockers)
1. **Remove `server/.env` from git tracking**: Untrack `server/.env`, update `.gitignore`, and create `.env.example`.
2. **Eliminate Hardcoded `JWT_SECRET` Fallbacks**: Fail fast on server boot if `JWT_SECRET` is missing or insecure. Remove `|| 'fallback_secret'`.
3. **Disallow JWT in Query Parameters**: Reject tokens passed via `req.query.token` in `authMiddleware.js`.
4. **Fix Report Buffer Persistence for Serverless**: Replace `reportBufferCache.js` in-memory map with S3 or database-backed storage so report downloads work reliably across Lambda instances.
5. **Enforce S3 Storage on Vercel**: Ensure document uploads never attempt to write to local disk on Vercel.
6. **Implement Authentication Rate Limiting**: Protect `/api/auth/login` and `/api/auth/register` with rate limiters.
7. **Restrict CORS**: Configure CORS with whitelist restricted to `CLIENT_URL`.

### Priority 1: Required for Production Real-World Use
1. **Zod Validation on All Mutative Routes**: Implement Zod request body schemas for:
   - Opportunities (`POST /api/opportunities`, `PUT /api/opportunities/:id`)
   - Applications (`POST /api/opportunities/:id/apply`)
   - Profile Updates (`PUT /api/profile`)
   - Recruiter Management (`POST /api/auth/invite-recruiter`, `POST /api/auth/set-password`)
   - Student Outcomes (`POST /api/external-outcomes`)
   - Policy Updates (`POST /api/policies`)
2. **Purge Fake Initial State from `StudentProfileBuilder.jsx`**: Remove hardcoded fake semesters and skills; render clean empty states and step-by-step onboarding for new students.
3. **Delete Dead Legacy Code**: Safely remove unreferenced `StudentDashboard.jsx`, `TpoDashboard.jsx`, and `placementStore.js`.
4. **Implement Missing Dead Button Handlers**: Wire "Forgot password?" to password reset flow, and connect footer links in `Home.jsx` to real application routes.
5. **Pagination on All List Endpoints**: Ensure student directory, drives list, announcements, and audit logs support standard `page`, `limit`, `total`, `totalPages` envelope.
6. **Complete Audit Logging**: Add `logAuditAction` to all profile edits, document deletions, and policy overrides.

### Priority 2: UI Polish, Design System & Accessibility
1. **Design System Consistency**: Harmonize dark mode palette across all components so public pages, auth screens, and dashboards share cohesive typography, surface elevations, and contrast ratios.
2. **Mobile Responsiveness (360px)**: Verify that complex multi-column tables in TPO command center, Kanban boards, and student application timelines collapse into clean cards on narrow mobile viewports.
3. **Accessible Form Controls**: Add missing `aria-label`, `aria-describedby`, and visible focus rings across inputs and modals.
4. **Dynamic Sample Queries**: Replace static sample queries in TPO Natural Language Search with queries reflecting the active college's actual branches and batches.
