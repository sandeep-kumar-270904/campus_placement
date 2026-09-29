import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, MapPin, DollarSign, Calendar } from 'lucide-react';

const ForStudents = () => {
  return (
    <div className="min-h-screen bg-mongo-bg text-mongo-text font-sans selection:bg-mongo-green selection:text-mongo-dark overflow-x-hidden">
      
      {/* Navigation - Simplified for subpages */}
      <nav className="fixed w-full z-50 bg-mongo-bg/90 backdrop-blur-md border-b border-mongo-gray/30">
        <div className="max-w-[1416px] mx-auto px-6 h-[88px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-mongo-green font-bold text-xl font-display">P</span>
            </div>
            <span className="text-xl font-display font-bold tracking-tight text-mongo-dark">PLACEearly</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/for-students" className="text-[15px] font-bold text-mongo-green-dark transition-colors">For Students</Link>
            <Link to="/for-colleges" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">For Colleges</Link>
            <Link to="/how-it-works" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">How it Works</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors hidden sm:block">Sign In</Link>
            <Link to="/register" className="text-[15px] font-medium bg-mongo-dark text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-[180px] pb-24 px-6 max-w-[1416px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6">
                <GraduationCap className="w-4 h-4" /> For Students & Candidates
              </div>
              <h1 className="text-[48px] md:text-[64px] font-display font-extrabold text-mongo-dark leading-[1.1] mb-6">
                Land your dream job, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">stress-free.</span>
              </h1>
              <p className="text-xl text-gray-600 font-light mb-10 max-w-lg leading-relaxed">
                Stop filling out the same Google Forms for every company. Build one verified profile and apply to hundreds of campus and off-campus drives with a single click.
              </p>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-mongo-dark text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 transition-colors shadow-xl">
                Create Student Profile <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
          
          <div className="relative">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
               className="relative z-10 bg-white p-8 rounded-[32px] border border-gray-100 shadow-2xl"
             >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl -z-10"></div>
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="font-display font-bold text-xl text-gray-900">Opportunity Hub</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">3 New Matches</span>
                </div>
                
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 border border-gray-100 rounded-2xl hover:border-blue-200 transition-colors">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
                        <div>
                          <h4 className="font-bold text-gray-900">Software Engineer</h4>
                          <p className="text-xs text-gray-500">Top Tech Corp</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-600">24 LPA</span>
                         <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-600">Bangalore</span>
                      </div>
                    </div>
                  ))}
                </div>
             </motion.div>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12">
           <div>
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 font-bold text-xl">1</div>
             <h3 className="text-2xl font-display font-bold mb-3">Build Once</h3>
             <p className="text-gray-600 font-light">Upload your resume, enter your CGPA and backlogs just once. We automatically format it for recruiters.</p>
           </div>
           <div>
             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 font-bold text-xl">2</div>
             <h3 className="text-2xl font-display font-bold mb-3">Get Verified</h3>
             <p className="text-gray-600 font-light">Your college TPO verifies your academic records, giving your profile a "Trusted" badge that top companies look for.</p>
           </div>
           <div>
             <div className="w-12 h-12 bg-mongo-green/20 text-mongo-green-dark rounded-2xl flex items-center justify-center mb-6 font-bold text-xl">3</div>
             <h3 className="text-2xl font-display font-bold mb-3">One-Click Apply</h3>
             <p className="text-gray-600 font-light">Browse the Opportunity Hub and apply instantly if you meet the eligibility criteria.</p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default ForStudents;
