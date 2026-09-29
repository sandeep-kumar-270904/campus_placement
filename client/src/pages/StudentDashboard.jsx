import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCircle, Briefcase, FileText, Bell, Search, MapPin, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('opportunities');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center">
              <span className="text-mongo-green font-bold text-xl font-display">P</span>
            </div>
            <span className="text-xl font-display font-bold text-mongo-dark">PLACEearly</span>
          </div>
          <div className="flex flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search jobs, companies..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mongo-green transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-sm text-right hidden sm:block">
                <p className="font-semibold text-gray-900">{user?.firstName || 'Student'} {user?.lastName || 'Name'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'student'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                {(user?.firstName?.charAt(0) || 'S').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-1 w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 h-[calc(100vh-8rem)] sticky top-24">
          <nav className="space-y-2 flex-1">
            <button 
              onClick={() => setActiveTab('opportunities')}
              className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'opportunities' ? 'bg-mongo-green/10 text-mongo-green-dark' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Briefcase className={`${activeTab === 'opportunities' ? 'text-mongo-green-dark' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0 h-5 w-5`} />
              Opportunity Hub
            </button>
            <button 
              onClick={() => setActiveTab('applications')}
              className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'applications' ? 'bg-mongo-green/10 text-mongo-green-dark' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FileText className={`${activeTab === 'applications' ? 'text-mongo-green-dark' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0 h-5 w-5`} />
              My Applications
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-mongo-green/10 text-mongo-green-dark' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <UserCircle className={`${activeTab === 'profile' ? 'text-mongo-green-dark' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0 h-5 w-5`} />
              My Profile
            </button>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors w-full"
            >
              <LogOut className="text-red-500 mr-3 flex-shrink-0 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-12">
          
          {/* OPPORTUNITY HUB TAB */}
          {activeTab === 'opportunities' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">Opportunity Hub</h1>
                  <p className="text-sm text-gray-500 mt-1">Discover and apply for campus drives and internships.</p>
                </div>
                <div className="flex items-center gap-2">
                  <select className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-mongo-green">
                    <option>All Types</option>
                    <option>Full-Time</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              {/* Job Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mock Job Card 1 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">High Match</span>
                  </div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-mongo-green-dark transition-colors">Software Engineering Intern</h3>
                      <p className="text-sm text-gray-500">Google • Campus Drive</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100"><MapPin className="w-3 h-3 mr-1"/> Bangalore</div>
                    <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100"><DollarSign className="w-3 h-3 mr-1"/> 1.2L / mo</div>
                    <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100"><Calendar className="w-3 h-3 mr-1"/> Deadline: Tomorrow</div>
                  </div>
                  <button className="w-full py-2.5 bg-mongo-dark text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                    View Details & Apply
                  </button>
                </div>

                {/* Mock Job Card 2 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer relative overflow-hidden">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#0070F3]/10 border border-[#0070F3]/20 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                      <span className="font-bold text-xl text-[#0070F3]">▲</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-mongo-green-dark transition-colors">Frontend Developer</h3>
                      <p className="text-sm text-gray-500">Vercel • Off-Campus</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100"><MapPin className="w-3 h-3 mr-1"/> Remote</div>
                    <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100"><DollarSign className="w-3 h-3 mr-1"/> 24 LPA</div>
                    <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100"><Calendar className="w-3 h-3 mr-1"/> Deadline: in 3 days</div>
                  </div>
                  <button className="w-full py-2.5 bg-mongo-dark text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                    View Details & Apply
                  </button>
                </div>

                {/* Mock Job Card 3 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-200">Not Eligible: CGPA &lt; 8.0</span>
                  </div>
                  <div className="flex items-start gap-4 mb-4 opacity-50">
                    <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-xl text-blue-600 font-display">M</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Backend Engineer</h3>
                      <p className="text-sm text-gray-500">Microsoft • Campus Drive</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6 opacity-50">
                    <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"><MapPin className="w-3 h-3 mr-1"/> Hyderabad</div>
                    <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"><DollarSign className="w-3 h-3 mr-1"/> 40 LPA</div>
                  </div>
                  <button disabled className="w-full py-2.5 bg-gray-200 text-gray-500 text-sm font-semibold rounded-lg">
                    Locked
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* MY APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-gray-900">My Applications</h1>
                <p className="text-sm text-gray-500 mt-1">Track the status of your ongoing recruitment processes.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Company & Role</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Applied Date</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Round</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="w-6 h-6 object-contain" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">Software Engineering Intern</div>
                              <div className="text-sm text-gray-500">Google</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct 12, 2026</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">Technical Interview</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            In Progress
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-mongo-green-dark hover:text-mongo-green transition-colors font-bold">Track &rarr;</a>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500">
                               A
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">Data Analyst</div>
                              <div className="text-sm text-gray-500">Amazon</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sep 28, 2026</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">Application Review</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            Under Review
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-mongo-green-dark hover:text-mongo-green transition-colors font-bold">Track &rarr;</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">My Profile</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage your academic details and resume to apply for opportunities.</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5 animate-pulse"></span>
                  Pending TPO Verification
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-200 bg-gray-50 flex items-center gap-6">
                   <div className="w-20 h-20 rounded-full bg-blue-100 border-4 border-white shadow flex items-center justify-center text-blue-700 font-display font-bold text-3xl">
                      {(user?.firstName?.charAt(0) || 'S').toUpperCase()}
                   </div>
                   <div>
                      <h2 className="text-xl font-bold text-gray-900">{user?.firstName || 'Student'} {user?.lastName || 'Name'}</h2>
                      <p className="text-gray-500 text-sm mt-1">{user?.email || 'student@university.edu'}</p>
                   </div>
                </div>
                
                <div className="p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                     <GraduationCapIcon className="w-5 h-5 text-mongo-green-dark" />
                     Academic Information
                  </h3>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Degree / Course</label>
                      <input type="text" className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-mongo-green focus:border-mongo-green sm:text-sm bg-gray-50" defaultValue="B.Tech Computer Science" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current CGPA</label>
                      <input type="number" step="0.01" className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-mongo-green focus:border-mongo-green sm:text-sm bg-gray-50" defaultValue="8.5" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Active Backlogs</label>
                      <input type="number" className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-mongo-green focus:border-mongo-green sm:text-sm bg-gray-50" defaultValue="0" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Graduation Year</label>
                      <input type="number" className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-mongo-green focus:border-mongo-green sm:text-sm bg-gray-50" defaultValue="2025" />
                    </div>
                    
                    <div className="sm:col-span-6 mt-4 pt-6 border-t border-gray-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Resume Link (Drive/Dropbox)</label>
                      <input type="url" className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-mongo-green focus:border-mongo-green sm:text-sm bg-gray-50" placeholder="https://drive.google.com/..." />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50/80 flex justify-end gap-3 border-t border-gray-200">
                  <button type="button" className="inline-flex justify-center py-2.5 px-6 border border-gray-200 shadow-sm text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors">
                    Discard Changes
                  </button>
                  <button type="button" className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-lg text-mongo-dark bg-mongo-green hover:bg-[#00E05B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mongo-green transition-colors">
                    Submit for Verification
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
};

// Quick helper component for icon
function GraduationCapIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.42 10.922a2 2 0 0 0-.019-3.838L12.83 4.336a2 2 0 0 0-1.66 0L2.6 7.084a2 2 0 0 0-.019 3.838l8.571 4.743a2 2 0 0 0 1.696 0z"/>
      <path d="M22 10v6"/>
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
    </svg>
  );
}

export default StudentDashboard;
