import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import { PageSkeletonLoader } from './components/common/SkeletonLoader';
import OfflineBanner from './components/common/OfflineBanner';
import PwaInstallPrompt from './components/pwa/PwaInstallPrompt';

// Eager layouts for immediate structure
import StudentLayout from './components/StudentLayout';
import TpoLayout from './components/TpoLayout';
import RecruiterLayout from './components/RecruiterLayout';

// Public Pages (Code-Split)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForStudents = lazy(() => import('./pages/ForStudents'));
const ForColleges = lazy(() => import('./pages/ForColleges'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const PublicPortfolio = lazy(() => import('./pages/PublicPortfolio'));
const PublicVerify = lazy(() => import('./pages/PublicVerify'));
const JobPlatforms = lazy(() => import('./pages/JobPlatforms'));
const LearningPlatforms = lazy(() => import('./pages/LearningPlatforms'));
const CompanyCareers = lazy(() => import('./pages/CompanyCareers'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Student Pages (Code-Split)
const StudentDashboardHome = lazy(() => import('./pages/student/StudentDashboardHome'));
const StudentProfileBuilder = lazy(() => import('./pages/student/StudentProfileBuilder'));
const StudentOpportunityHub = lazy(() => import('./pages/student/StudentOpportunityHub'));
const StudentApplications = lazy(() => import('./pages/student/StudentApplications'));
const StudentDocuments = lazy(() => import('./pages/student/StudentDocuments'));
const StudentInterviewCalendar = lazy(() => import('./pages/student/StudentInterviewCalendar'));
const StudentPrivacy = lazy(() => import('./pages/student/StudentPrivacy'));
const StudentMockInterview = lazy(() => import('./pages/student/StudentMockInterview'));
const StudentAlumniNetwork = lazy(() => import('./pages/student/StudentAlumniNetwork'));
const StudentInterviewExperiences = lazy(() => import('./pages/student/StudentInterviewExperiences'));
const StudentInternships = lazy(() => import('./pages/student/StudentInternships'));
const StudentOutcomes = lazy(() => import('./pages/student/StudentOutcomes'));
const StudentResources = lazy(() => import('./pages/student/StudentResources'));
const NotificationPreferences = lazy(() => import('./pages/NotificationPreferences'));

// TPO & Coordinator Pages (Code-Split)
const TpoDashboardHome = lazy(() => import('./pages/tpo/TpoDashboardHome'));
const TpoStudents = lazy(() => import('./pages/tpo/TpoStudents'));
const TpoPlacementRiskDashboard = lazy(() => import('./pages/tpo/TpoPlacementRiskDashboard'));
const TpoVerification = lazy(() => import('./pages/tpo/TpoVerification'));
const TpoDrives = lazy(() => import('./pages/tpo/TpoDrives'));
const TpoDriveWorkspace = lazy(() => import('./pages/tpo/TpoDriveWorkspace'));
const TpoSchedule = lazy(() => import('./pages/tpo/TpoSchedule'));
const TpoCompanies = lazy(() => import('./pages/tpo/TpoCompanies'));
const TpoAnnouncements = lazy(() => import('./pages/tpo/TpoAnnouncements'));
const TpoDeliveryReport = lazy(() => import('./pages/tpo/TpoDeliveryReport'));
const TpoAnalytics = lazy(() => import('./pages/tpo/TpoAnalytics'));
const TpoReports = lazy(() => import('./pages/tpo/TpoReports'));
const TpoSettings = lazy(() => import('./pages/tpo/TpoSettings'));
const TpoPlacementPolicies = lazy(() => import('./pages/tpo/TpoPlacementPolicies'));
const TpoAlumniManagement = lazy(() => import('./pages/tpo/TpoAlumniManagement'));
const TpoInterviewModeration = lazy(() => import('./pages/tpo/TpoInterviewModeration'));
const TpoInternships = lazy(() => import('./pages/tpo/TpoInternships'));
const TpoExternalOutcomes = lazy(() => import('./pages/tpo/TpoExternalOutcomes'));

// Recruiter Pages (Code-Split)
const RecruiterDrives = lazy(() => import('./pages/recruiter/RecruiterDrives'));
const RecruiterDriveCandidates = lazy(() => import('./pages/recruiter/RecruiterDriveCandidates'));
const RecruiterJdEditor = lazy(() => import('./pages/recruiter/RecruiterJdEditor'));
const RecruiterScheduleSlots = lazy(() => import('./pages/recruiter/RecruiterScheduleSlots'));
const RecruiterDriveFunnel = lazy(() => import('./pages/recruiter/RecruiterDriveFunnel'));
const RecruiterAcceptInvite = lazy(() => import('./pages/recruiter/RecruiterAcceptInvite'));

// Admin & Settings Pages (Code-Split)
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const CollegeSettings = lazy(() => import('./pages/CollegeSettings'));
const AdminAuditLog = lazy(() => import('./pages/admin/AdminAuditLog'));
const SessionManagement = lazy(() => import('./pages/settings/SessionManagement'));
const Styleguide = lazy(() => import('./pages/Styleguide'));

function Unauthorized() {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen bg-slate-950 flex items-center justify-center p-8"
    >
      <div className="max-w-md w-full bg-slate-900 border border-red-800/60 rounded-2xl p-6 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-700/60 text-red-400 text-2xl flex items-center justify-center mx-auto mb-4">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Unauthorized Access</h1>
        <p className="text-xs text-slate-400 mb-6">
          Your account role does not have authorization to access this page or institutional resource.
        </p>
        <a
          href="/login"
          className="inline-block px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          Return to Sign In
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen font-sans bg-slate-950 text-slate-100 flex flex-col">
              {/* Real-Time Connectivity Banner */}
              <OfflineBanner />

              {/* PWA Installation Drawer / Pill */}
              <PwaInstallPrompt />

              <Suspense fallback={<PageSkeletonLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/styleguide" element={<Styleguide />} />
                  <Route path="/for-students" element={<ForStudents />} />
                <Route path="/for-colleges" element={<ForColleges />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/job-platforms" element={<JobPlatforms />} />
                <Route path="/learning-platforms" element={<LearningPlatforms />} />
                <Route path="/career-pages" element={<CompanyCareers />} />
                <Route path="/companies/careers" element={<CompanyCareers />} />
                <Route path="/verify/:code" element={<PublicVerify />} />
                <Route path="/portfolio/:rollNo" element={<PublicPortfolio />} />
                <Route path="/portfolio/id/:id" element={<PublicPortfolio />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/recruiter/accept-invite" element={<RecruiterAcceptInvite />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Shared Session Management Route */}
                <Route
                  element={
                    <ProtectedRoute
                      allowedRoles={['student', 'tpo', 'coordinator', 'admin', 'superadmin', 'recruiter']}
                    />
                  }
                >
                  <Route path="/settings/sessions" element={<SessionManagement />} />
                </Route>

                {/* Standalone Admin Audit Log Route */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'tpo']} />}>
                  <Route path="/admin/audit-log" element={<AdminAuditLog />} />
                </Route>

                {/* Recruiter Routes */}
                <Route element={<ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']} />}>
                  <Route path="/recruiter" element={<RecruiterLayout />}>
                    <Route index element={<Navigate to="/recruiter/drives" replace />} />
                    <Route path="drives" element={<RecruiterDrives />} />
                    <Route path="drives/:driveId/candidates" element={<RecruiterDriveCandidates />} />
                    <Route path="drives/:driveId/jd-editor" element={<RecruiterJdEditor />} />
                    <Route path="drives/:driveId/schedule" element={<RecruiterScheduleSlots />} />
                    <Route path="drives/:driveId/funnel" element={<RecruiterDriveFunnel />} />
                  </Route>
                </Route>

                {/* Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                  <Route path="/student" element={<StudentLayout />}>
                    <Route index element={<Navigate to="/student/dashboard" replace />} />
                    <Route path="dashboard" element={<StudentDashboardHome />} />
                    <Route path="opportunities" element={<StudentOpportunityHub />} />
                    <Route path="applications" element={<StudentApplications />} />
                    <Route path="profile" element={<StudentProfileBuilder />} />
                    <Route path="interviews" element={<StudentInterviewCalendar />} />
                    <Route path="mock-interview" element={<StudentMockInterview />} />
                    <Route path="documents" element={<StudentDocuments />} />
                    <Route path="privacy" element={<StudentPrivacy />} />
                    <Route path="notifications/preferences" element={<NotificationPreferences />} />
                    <Route path="alumni" element={<StudentAlumniNetwork />} />
                    <Route path="interview-experiences" element={<StudentInterviewExperiences />} />
                    <Route path="internships" element={<StudentInternships />} />
                    <Route path="outcomes" element={<StudentOutcomes />} />
                    <Route path="resources" element={<StudentResources />} />
                    <Route path="career-pages" element={<CompanyCareers />} />
                  </Route>
                </Route>

                {/* TPO & Coordinator Routes */}
                <Route
                  element={<ProtectedRoute allowedRoles={['tpo', 'coordinator', 'admin', 'superadmin']} />}
                >
                  <Route path="/tpo" element={<TpoLayout />}>
                    <Route index element={<Navigate to="/tpo/dashboard" replace />} />
                    <Route path="dashboard" element={<TpoDashboardHome />} />
                    <Route path="students" element={<TpoStudents />} />
                    <Route path="placement-risk" element={<TpoPlacementRiskDashboard />} />
                    <Route path="verification" element={<TpoVerification />} />
                    <Route path="drives" element={<TpoDrives />} />
                    <Route path="drives/:id" element={<TpoDriveWorkspace />} />
                    <Route path="schedule" element={<TpoSchedule />} />
                    <Route path="companies" element={<TpoCompanies />} />
                    <Route path="announcements" element={<TpoAnnouncements />} />
                    <Route path="notifications/tracking" element={<TpoDeliveryReport />} />
                    <Route path="analytics" element={<TpoAnalytics />} />
                    <Route path="reports" element={<TpoReports />} />
                    <Route path="audit-log" element={<AdminAuditLog />} />
                    <Route path="settings" element={<TpoSettings />} />
                    <Route path="settings/policies" element={<TpoPlacementPolicies />} />
                    <Route path="policies" element={<TpoPlacementPolicies />} />
                    <Route path="alumni" element={<TpoAlumniManagement />} />
                    <Route path="interview-experiences" element={<TpoInterviewModeration />} />
                    <Route path="internships" element={<TpoInternships />} />
                    <Route path="outcomes" element={<TpoExternalOutcomes />} />
                  </Route>
                </Route>

                {/* Super Admin Console */}
                <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                  <Route path="/superadmin" element={<SuperAdminDashboard />} />
                </Route>

                {/* College Configuration & Branding */}
                <Route element={<ProtectedRoute allowedRoles={['tpo', 'admin', 'superadmin']} />}>
                  <Route path="/college/settings" element={<CollegeSettings />} />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ToastProvider>
    </TenantProvider>
  </AuthProvider>
  );
}

export default App;
