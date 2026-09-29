import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Building, ShieldCheck, PieChart, Bell, Search, Settings, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const TpoDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-mongo-dark border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-[1416px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-mongo-green rounded-md flex items-center justify-center">
              <span className="text-mongo-dark font-bold text-xl font-display">P</span>
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">PLACEearly <span className="text-mongo-green text-sm font-medium ml-1">Admin</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-mongo-dark"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
              <div className="text-sm text-right hidden sm:block">
                <p className="font-semibold text-white">{user?.firstName || 'TPO'} {user?.lastName || 'Admin'}</p>
                <p className="text-xs text-mongo-green capitalize">{user?.role || 'Placement Officer'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white border border-gray-600 font-bold">
                {(user?.firstName?.charAt(0) || 'T').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1416px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-1 w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 h-[calc(100vh-8rem)] sticky top-24">
          <nav className="space-y-2 flex-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-mongo-dark text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <PieChart className={`${activeTab === 'overview' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('verifications')}
              className={`w-full group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors justify-between ${activeTab === 'verifications' ? 'bg-mongo-dark text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <div className="flex items-center">
                <ShieldCheck className={`${activeTab === 'verifications' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
                Verifications
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'verifications' ? 'bg-mongo-green text-mongo-dark' : 'bg-red-100 text-red-600'}`}>12</span>
            </button>
            <button 
              onClick={() => setActiveTab('companies')}
              className={`w-full group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'companies' ? 'bg-mongo-dark text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Building className={`${activeTab === 'companies' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
              Companies & Drives
            </button>
            <button 
              onClick={() => setActiveTab('students')}
              className={`w-full group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${activeTab === 'students' ? 'bg-mongo-dark text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Users className={`${activeTab === 'students' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
              Student Database
            </button>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-gray-200 space-y-2">
            <button className="text-gray-700 hover:bg-gray-100 group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors w-full">
              <Settings className="text-gray-400 mr-3 flex-shrink-0 h-5 w-5" />
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors w-full"
            >
              <LogOut className="text-red-500 mr-3 flex-shrink-0 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-12">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">Platform Overview</h1>
                  <p className="text-sm text-gray-500 mt-1">Metrics and quick actions for the 2026 placement season.</p>
                </div>
                <button className="bg-mongo-dark text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-md">
                  + New Placement Drive
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                  { title: "Total Students", val: "1,248", change: "+12%" },
                  { title: "Verified Profiles", val: "892", change: "+45%" },
                  { title: "Active Drives", val: "14", change: "Steady" },
                  { title: "Offers Extended", val: "156", change: "+8%" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-full -z-10 group-hover:bg-mongo-green/10 transition-colors"></div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-3xl font-display font-bold text-mongo-dark mb-2">{stat.val}</p>
                    <p className="text-xs font-bold text-mongo-green-dark bg-mongo-green/10 inline-block px-2 py-0.5 rounded">{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Chart & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-mongo-dark mb-4">Placement Funnel Conversion</h3>
                  <div className="h-64 flex items-end justify-between gap-2 mt-8">
                     {/* Mock Bar Chart */}
                     {[
                       { label: 'Registered', h: '100%', val: '800' },
                       { label: 'Eligible', h: '75%', val: '600' },
                       { label: 'Tested', h: '60%', val: '480' },
                       { label: 'Interviewed', h: '40%', val: '320' },
                       { label: 'Offered', h: '25%', val: '200' },
                     ].map((bar, i) => (
                       <div key={i} className="flex flex-col items-center flex-1 group">
                         <span className="text-xs font-bold text-gray-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{bar.val}</span>
                         <div className="w-full bg-mongo-dark rounded-t-lg relative overflow-hidden transition-all duration-500 hover:bg-mongo-green group-hover:shadow-[0_0_15px_rgba(0,237,100,0.5)]" style={{ height: bar.h }}>
                            <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>
                         </div>
                         <span className="text-xs font-semibold text-gray-500 mt-3 hidden sm:block">{bar.label}</span>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-mongo-dark mb-4">Pending Verifications</h3>
                  <div className="space-y-4">
                     {[
                       { name: "Rahul Sharma", branch: "Computer Science", id: "CS2025-01" },
                       { name: "Priya Patel", branch: "Information Tech", id: "IT2025-42" },
                       { name: "Amit Kumar", branch: "Electronics", id: "EC2025-11" },
                       { name: "Sneha Reddy", branch: "Computer Science", id: "CS2025-89" },
                     ].map((student, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                         <div>
                           <p className="text-sm font-bold text-gray-900">{student.name}</p>
                           <p className="text-xs text-gray-500">{student.id} • {student.branch}</p>
                         </div>
                         <button onClick={() => setActiveTab('verifications')} className="text-mongo-green-dark bg-mongo-green/20 p-2 rounded-lg hover:bg-mongo-green/30 transition-colors">
                           <ChevronRight className="w-4 h-4" />
                         </button>
                       </div>
                     ))}
                  </div>
                  <button onClick={() => setActiveTab('verifications')} className="w-full mt-4 text-sm font-bold text-mongo-dark py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    View All 12 Pending
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* VERIFICATIONS TAB */}
          {activeTab === 'verifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-gray-900">Profile Verifications</h1>
                <p className="text-sm text-gray-500 mt-1">Review student academic records to ensure eligibility accuracy.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Search by ID or Name..." 
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mongo-green"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm font-semibold bg-white border border-gray-300 rounded-lg shadow-sm">Filter</button>
                  </div>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Details</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CGPA & Backlogs</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Documents</th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {/* Mock Row 1 */}
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">R</div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">Rahul Sharma</div>
                            <div className="text-sm text-gray-500">CS2025-01 • Computer Science</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-bold">8.75 CGPA</div>
                        <div className="text-sm text-green-600">0 Backlogs</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href="#" className="text-sm text-blue-600 font-semibold hover:underline">View Transcripts</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors mr-2">Verify</button>
                        <button className="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">Reject</button>
                      </td>
                    </tr>
                    {/* Mock Row 2 */}
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700">P</div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">Priya Patel</div>
                            <div className="text-sm text-gray-500">IT2025-42 • Information Tech</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-bold">7.20 CGPA</div>
                        <div className="text-sm text-yellow-600">1 Active Backlog</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href="#" className="text-sm text-blue-600 font-semibold hover:underline">View Transcripts</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors mr-2">Verify</button>
                        <button className="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">Reject</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* OTHER TABS PLACEHOLDER */}
          {(activeTab === 'companies' || activeTab === 'students') && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-2xl border-dashed">
              <Building className="w-12 h-12 text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Module Under Construction</h2>
              <p className="text-gray-500 text-sm">This section is part of Phase 3 development.</p>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
};

export default TpoDashboard;
