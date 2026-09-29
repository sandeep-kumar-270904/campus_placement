import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TpoDashboard from './pages/TpoDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ForStudents from './pages/ForStudents';
import ForColleges from './pages/ForColleges';
import HowItWorks from './pages/HowItWorks';

import Home from './pages/Home';

function Unauthorized() {
  return <div className="p-8 text-center text-red-600"><h2 className="text-2xl font-bold">Unauthorized Access</h2></div>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen font-sans text-gray-900 bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/for-students" element={<ForStudents />} />
            <Route path="/for-colleges" element={<ForColleges />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
            </Route>

            {/* TPO Routes */}
            <Route element={<ProtectedRoute allowedRoles={['tpo', 'superadmin']} />}>
              <Route path="/tpo/dashboard" element={<TpoDashboard />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
