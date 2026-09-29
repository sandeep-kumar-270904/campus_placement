import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, UserPlus, FileCheck, Target, Award } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-mongo-bg text-mongo-text font-sans selection:bg-mongo-green selection:text-mongo-dark overflow-x-hidden">
      
      {/* Navigation */}
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
            <Link to="/for-colleges" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">For Colleges</Link>
            <Link to="/how-it-works" className="text-[15px] font-bold text-mongo-green-dark transition-colors">How it Works</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors hidden sm:block">Sign In</Link>
            <Link to="/register" className="text-[15px] font-medium bg-mongo-dark text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-[180px] pb-32 px-6 max-w-[1416px] mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-[48px] md:text-[64px] font-display font-extrabold text-mongo-dark leading-[1.1] mb-6 max-w-3xl mx-auto">
            From Registration to <span className="text-mongo-green-dark">Placement</span> in 4 Steps.
          </h1>
          <p className="text-xl text-gray-600 font-light mb-16 max-w-2xl mx-auto leading-relaxed">
            Discover how PLACEearly's unified platform brings students and placement officers together for a seamless recruitment season.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto text-left">
          {/* Connecting Line */}
          <div className="absolute left-[39px] top-[50px] bottom-[50px] w-0.5 bg-gray-200 hidden md:block"></div>

          <div className="space-y-20">
            {/* Step 1 */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative flex flex-col md:flex-row gap-8 items-start">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-8 border-mongo-bg relative z-10 shrink-0 shadow-sm">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <div className="pt-4">
                <h3 className="text-3xl font-display font-bold text-mongo-dark mb-4">1. Profile Creation</h3>
                <p className="text-gray-600 font-light text-lg max-w-xl">
                  Students register and build their comprehensive academic profile. They input their CGPA, backlogs, upload transcripts, and attach their master resume.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative flex flex-col md:flex-row gap-8 items-start">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center border-8 border-mongo-bg relative z-10 shrink-0 shadow-sm">
                <FileCheck className="w-8 h-8 text-purple-600" />
              </div>
              <div className="pt-4">
                <h3 className="text-3xl font-display font-bold text-mongo-dark mb-4">2. TPO Verification</h3>
                <p className="text-gray-600 font-light text-lg max-w-xl">
                  Placement Officers review the uploaded transcripts against the entered data. Once approved, the student profile is marked as "Verified" and locked from tampering.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative flex flex-col md:flex-row gap-8 items-start">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center border-8 border-mongo-bg relative z-10 shrink-0 shadow-sm">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <div className="pt-4">
                <h3 className="text-3xl font-display font-bold text-mongo-dark mb-4">3. Automated Eligibility</h3>
                <p className="text-gray-600 font-light text-lg max-w-xl">
                  Companies announce drives. The Eligibility Engine instantly filters the student database, automatically applying eligible candidates or allowing 1-click applications.
                </p>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative flex flex-col md:flex-row gap-8 items-start">
              <div className="w-20 h-20 rounded-full bg-mongo-green/20 flex items-center justify-center border-8 border-mongo-bg relative z-10 shrink-0 shadow-sm">
                <Award className="w-8 h-8 text-mongo-green-dark" />
              </div>
              <div className="pt-4">
                <h3 className="text-3xl font-display font-bold text-mongo-dark mb-4">4. Placed & Analytics</h3>
                <p className="text-gray-600 font-light text-lg max-w-xl">
                  Students track their rounds (Aptitude, Tech Interview) directly in their portal. Once offered, the dashboard analytics update instantly for the college administration.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-32">
          <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-mongo-dark text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-gray-800 transition-colors shadow-xl">
            Get Started Free <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HowItWorks;
