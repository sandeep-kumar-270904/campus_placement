import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TpoDashboard from './pages/TpoDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function Home() {
  return (
    <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-5xl font-bold text-blue-600 mb-4">PLACEearly</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        The centralized platform for managing student careers, internships, jobs, and college placement activities.
      </p>
      <div className="flex space-x-4">
        <Link to="/login" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">Login</Link>
        <Link to="/register" className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium transition">Register</Link>
      </div>
    </div>
  );
}

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
