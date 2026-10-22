import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
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
import TpoDeliveryReport from './pages/tpo/TpoDeliveryReport';
import NotificationPreferences from './pages/NotificationPreferences';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CollegeSettings from './pages/CollegeSettings';
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
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/notifications/preferences" element={<NotificationPreferences />} />
              </Route>

              {/* TPO Routes */}
              <Route element={<ProtectedRoute allowedRoles={['tpo', 'admin', 'superadmin']} />}>
                <Route path="/tpo" element={<TpoLayout />}>
                  <Route index element={<Navigate to="/tpo/dashboard" replace />} />
                  <Route path="dashboard" element={<TpoDashboardHome />} />
                  <Route path="students" element={<TpoStudents />} />
                  <Route path="verification" element={<TpoVerification />} />
                  <Route path="drives" element={<TpoDrives />} />
                  <Route path="drives/:id" element={<TpoDriveWorkspace />} />
                  <Route path="schedule" element={<TpoSchedule />} />
                  <Route path="companies" element={<TpoCompanies />} />
                  <Route path="announcements" element={<TpoAnnouncements />} />
                  <Route path="notifications/tracking" element={<TpoDeliveryReport />} />
                  <Route path="analytics" element={<TpoAnalytics />} />
                  <Route path="reports" element={<TpoReports />} />
                  <Route path="settings" element={<TpoSettings />} />
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
