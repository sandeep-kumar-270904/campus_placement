import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building, CheckCircle2 } from 'lucide-react';

const ForColleges = () => {
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
            <Link to="/for-students" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">For Students</Link>
            <Link to="/for-colleges" className="text-[15px] font-bold text-mongo-green-dark transition-colors">For Colleges</Link>
            <Link to="/how-it-works" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">How it Works</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors hidden sm:block">Sign In</Link>
            <Link to="/register" className="text-[15px] font-medium bg-mongo-dark text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-[180px] pb-24 px-6 max-w-[1416px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-6 relative order-2 lg:order-1">
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               className="relative z-10 bg-[#001E2B] p-8 rounded-[32px] border border-gray-800 shadow-2xl text-white"
             >
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-mongo-green/20 rounded-full blur-3xl -z-10"></div>
                <div className="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
                  <h3 className="font-display font-bold text-xl">Eligibility Engine</h3>
                  <span className="bg-mongo-green/20 text-mongo-green text-xs font-bold px-3 py-1 rounded-full border border-mongo-green/30">Active</span>
                </div>
                
                <div className="space-y-4 font-mono text-sm">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400">Rules applied for: </span>
                    <span className="text-white font-bold">Microsoft Campus Drive</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-400">Min CGPA &gt; 8.5</span>
                      <CheckCircle2 className="w-4 h-4 text-mongo-green" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-400">Max Active Backlogs = 0</span>
                      <CheckCircle2 className="w-4 h-4 text-mongo-green" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-400">Branch in [CS, IT]</span>
                      <CheckCircle2 className="w-4 h-4 text-mongo-green" />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-mongo-green/10 text-mongo-green rounded-xl border border-mongo-green/30 text-center font-bold">
                    420 Students Auto-Approved
                  </div>
                </div>
             </motion.div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mongo-green/20 text-mongo-dark text-sm font-bold mb-6">
                <Building className="w-4 h-4" /> For Placement Officers
              </div>
              <h1 className="text-[48px] md:text-[64px] font-display font-extrabold text-mongo-dark leading-[1.1] mb-6">
                Automate your <br/> placement office.
              </h1>
              <p className="text-xl text-gray-600 font-light mb-10 max-w-lg leading-relaxed">
                Replace manual Excel filtering with the Eligibility Engine. Define company criteria once, and let PLACEearly instantly shortlist hundreds of verified students.
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-mongo-green-dark shrink-0" />
                  <span className="text-gray-700 font-medium">Verify student academic records in bulk.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-mongo-green-dark shrink-0" />
                  <span className="text-gray-700 font-medium">Generate real-time placement analytics & reports.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-mongo-green-dark shrink-0" />
                  <span className="text-gray-700 font-medium">Manage multiple ongoing drives via Kanban boards.</span>
                </li>
              </ul>

              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-mongo-dark text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 transition-colors shadow-xl">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ForColleges;
