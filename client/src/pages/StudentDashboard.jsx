import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCircle, Briefcase, FileText, Bell } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center">
              <span className="text-mongo-green font-bold text-xl font-display">P</span>
            </div>
            <span className="text-xl font-display font-bold text-mongo-dark">PLACEearly</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-sm text-right hidden sm:block">
                <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                {user?.firstName?.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <nav className="space-y-1">
            <a href="#" className="bg-mongo-green/10 text-mongo-green-dark group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg">
              <UserCircle className="text-mongo-green-dark mr-3 flex-shrink-0 h-5 w-5" />
              My Profile
            </a>
            <a href="#" className="text-gray-700 hover:bg-gray-100 group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors">
              <Briefcase className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" />
              Opportunity Hub
            </a>
            <a href="#" className="text-gray-700 hover:bg-gray-100 group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors">
              <FileText className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" />
              My Applications
            </a>
          </nav>
          
          <div className="mt-10 pt-6 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors w-full"
            >
              <LogOut className="text-red-500 mr-3 flex-shrink-0 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your academic details and resume to apply for opportunities.</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              Pending Verification
            </span>
          </div>

          {/* Profile Form Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Academic Information</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree / Course</label>
                  <input type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-mongo-green focus:border-mongo-green sm:text-sm bg-gray-50" placeholder="B.Tech Computer Science" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current CGPA</label>
                  <input type="number" step="0.01" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-mongo-green focus:border-mongo-green sm:text-sm bg-gray-50" placeholder="8.5" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Active Backlogs</label>
                  <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-mongo-green focus:border-mongo-green sm:text-sm bg-gray-50" placeholder="0" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                  <input type="number" className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-mongo-green focus:border-mongo-green sm:text-sm bg-gray-50" placeholder="2025" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button type="button" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-mongo-dark bg-mongo-green hover:bg-[#00E05B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mongo-green">
                Save Profile
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
