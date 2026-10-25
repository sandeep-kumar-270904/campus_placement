import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentLayout from './components/StudentLayout';
import StudentDashboardHome from './pages/student/StudentDashboardHome';
import StudentProfileBuilder from './pages/student/StudentProfileBuilder';
import StudentOpportunityHub from './pages/student/StudentOpportunityHub';
import StudentApplications from './pages/student/StudentApplications';
import StudentDocuments from './pages/student/StudentDocuments';
import StudentInterviewCalendar from './pages/student/StudentInterviewCalendar';
import StudentPrivacy from './pages/student/StudentPrivacy';
import TpoLayout from './components/TpoLayout';
import TpoDashboardHome from './pages/tpo/TpoDashboardHome';
import TpoStudents from './pages/tpo/TpoStudents';
import TpoVerification from './pages/tpo/TpoVerification';
import TpoDrives from './pages/tpo/TpoDrives';
import TpoDriveWorkspace from './pages/tpo/TpoDriveWorkspace';
import TpoSchedule from './pages/tpo/TpoSchedule';
import TpoCompanies from './pages/tpo/TpoCompanies';
import TpoAnnouncements from './pages/tpo/TpoAnnouncements';
import TpoAnalytics from './pages/tpo/TpoAnalytics';
import TpoReports from './pages/tpo/TpoReports';
import TpoSettings from './pages/tpo/TpoSettings';
import TpoPlacementPolicies from './pages/tpo/TpoPlacementPolicies';
import TpoDeliveryReport from './pages/tpo/TpoDeliveryReport';
import NotificationPreferences from './pages/NotificationPreferences';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CollegeSettings from './pages/CollegeSettings';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminAuditLog from './pages/admin/AdminAuditLog';
import SessionManagement from './pages/settings/SessionManagement';
import RecruiterLayout from './components/RecruiterLayout';
import RecruiterDrives from './pages/recruiter/RecruiterDrives';
import RecruiterDriveCandidates from './pages/recruiter/RecruiterDriveCandidates';
import RecruiterJdEditor from './pages/recruiter/RecruiterJdEditor';
import RecruiterScheduleSlots from './pages/recruiter/RecruiterScheduleSlots';
import RecruiterDriveFunnel from './pages/recruiter/RecruiterDriveFunnel';
import RecruiterAcceptInvite from './pages/recruiter/RecruiterAcceptInvite';
import StudentMockInterview from './pages/student/StudentMockInterview';
import StudentAlumniNetwork from './pages/student/StudentAlumniNetwork';
import StudentInterviewExperiences from './pages/student/StudentInterviewExperiences';
import StudentInternships from './pages/student/StudentInternships';
import StudentOutcomes from './pages/student/StudentOutcomes';
import StudentResources from './pages/student/StudentResources';
import TpoAlumniManagement from './pages/tpo/TpoAlumniManagement';
import TpoInterviewModeration from './pages/tpo/TpoInterviewModeration';
import TpoInternships from './pages/tpo/TpoInternships';
import TpoExternalOutcomes from './pages/tpo/TpoExternalOutcomes';
import TpoPlacementRiskDashboard from './pages/tpo/TpoPlacementRiskDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ForStudents from './pages/ForStudents';
import ForColleges from './pages/ForColleges';
import HowItWorks from './pages/HowItWorks';
import PublicPortfolio from './pages/PublicPortfolio';
import PublicVerify from './pages/PublicVerify';
import JobPlatforms from './pages/JobPlatforms';
import LearningPlatforms from './pages/LearningPlatforms';
import Home from './pages/Home';

function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-slate-900 border border-red-800/60 rounded-2xl p-6 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-700/60 text-red-400 text-2xl flex items-center justify-center mx-auto mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Unauthorized Access</h2>
        <p className="text-xs text-slate-400 mb-6">
          Your account role does not have authorization to access this page or institutional resource.
        </p>
        <a
          href="/login"
          className="inline-block px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
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
        <Router>
          <div className="min-h-screen font-sans text-gray-900 bg-gray-100">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/for-students" element={<ForStudents />} />
              <Route path="/for-colleges" element={<ForColleges />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/job-platforms" element={<JobPlatforms />} />
              <Route path="/learning-platforms" element={<LearningPlatforms />} />
              <Route path="/verify/:code" element={<PublicVerify />} />
              <Route path="/portfolio/:rollNo" element={<PublicPortfolio />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/recruiter/accept-invite" element={<RecruiterAcceptInvite />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Shared Session Management Route */}
              <Route element={<ProtectedRoute allowedRoles={['student', 'tpo', 'coordinator', 'admin', 'superadmin', 'recruiter']} />}>
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
                </Route>
              </Route>

              {/* TPO & Coordinator Routes */}
              <Route element={<ProtectedRoute allowedRoles={['tpo', 'coordinator', 'admin', 'superadmin']} />}>
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
          </div>
        </Router>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;
