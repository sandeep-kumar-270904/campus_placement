import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Code, Briefcase, Zap, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans">
      
      {/* Navigation Bar */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">P</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">PLACEearly</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Features</a>
            <a href="#students" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">For Students</a>
            <a href="#colleges" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">For Colleges</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">Sign In</Link>
            <Link to="/register" className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6 border border-blue-100">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
              The Modern Placement Platform
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 max-w-4xl mx-auto leading-tight">
              Build your career. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Automate your placements.</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Get your students placed faster with an intelligent, centralized platform. 
              PLACEearly makes managing profiles, eligibility, and applications seamless for both colleges and students.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                Start Building Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition">
                Explore the Platform
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to scale placements</h2>
            <p className="text-lg text-gray-600">Replace scattered spreadsheets, forms, and group chats with a single unified workspace designed for modern campus recruitment.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Opportunity Hub</h3>
              <p className="text-gray-600 leading-relaxed">Centralize campus and external jobs. Track every application from initial submission to final offer in one clear pipeline.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Eligibility Engine</h3>
              <p className="text-gray-600 leading-relaxed">Set complex academic criteria and let the engine automatically evaluate student eligibility in real-time, eliminating manual checks.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Profiles</h3>
              <p className="text-gray-600 leading-relaxed">Ensure data accuracy with TPO-verified student profiles. Maintain a single source of truth for all academic and career records.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Built for the future of campus hiring.</h2>
              <p className="text-lg text-gray-600 mb-8">
                Whether you are a student tracking your dream internship or a placement officer managing thousands of records, PLACEearly scales with you.
              </p>
              <ul className="space-y-4">
                {['Real-time Placement Analytics', 'Automated Notifications & Reminders', 'Centralized Document Management', 'Interview & Round Tracking'].map((item, idx) => (
                  <li key={idx} className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              {/* Abstract Dashboard Mockup */}
              <div className="aspect-w-4 aspect-h-3 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden p-6 relative">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-white rounded-md border border-gray-200 w-1/3"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-white rounded-md border border-gray-200 shadow-sm"></div>
                    <div className="h-24 bg-white rounded-md border border-gray-200 shadow-sm"></div>
                    <div className="h-24 bg-blue-50 rounded-md border border-blue-100 shadow-sm"></div>
                  </div>
                  <div className="h-40 bg-white rounded-md border border-gray-200 shadow-sm mt-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold">PLACEearly</span>
            </div>
            <p className="text-gray-400 max-w-xs text-sm">
              The modern data platform for career and campus placement management.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Analytics</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} PLACEearly. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
