import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight, GraduationCap, Briefcase, FileCheck, Building } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-mongo-bg text-mongo-text font-sans selection:bg-mongo-green selection:text-mongo-dark overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-mongo-bg/90 backdrop-blur-md border-b border-mongo-gray/30">
        <div className="max-w-[1416px] mx-auto px-6 h-[88px] flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-mongo-green font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-mongo-dark">PLACEearly</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8">
              <a href="#platform" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">For Students</a>
              <a href="#solutions" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">For Colleges</a>
              <a href="#resources" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">How it Works</a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link to="/register" className="text-[15px] font-medium bg-mongo-dark text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-[180px] pb-24 px-6 relative max-w-[1416px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-mongo-gray bg-white mb-8 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-mongo-green animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-widest text-mongo-green-dark">Platform Update</span>
                <span className="text-sm font-medium text-mongo-text flex items-center cursor-pointer hover:underline">
                  Auto-Eligibility is live <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
              
              <h1 className="text-[56px] leading-[1.05] md:text-[80px] font-display font-extrabold text-mongo-dark tracking-[-0.02em] mb-8">
                The Campus <br /> Placement OS
              </h1>
              
              <p className="text-xl md:text-[22px] leading-relaxed text-mongo-text/80 max-w-[600px] mb-10 font-light">
                Unify your entire placement lifecycle. 
                PLACEearly bridges the gap between student career prep and institutional hiring operations in one powerful workspace.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-mongo-green text-mongo-dark px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#00E05B] transition-colors border border-transparent shadow-[0_4px_14px_0_rgba(0,237,100,0.39)]">
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-full text-lg font-medium text-mongo-dark border border-mongo-gray hover:border-mongo-dark transition-colors bg-transparent">
                  Access Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-mongo-gray/50 bg-white"
            >
              {/* Application Tracker UI Mockup */}
              <div className="h-10 bg-mongo-dark flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-mongo-green/80"></div>
                </div>
                <div className="text-xs text-gray-400 font-mono">PLACEearly Application Pipeline</div>
              </div>
              <div className="p-6 bg-[#F8F9FA] min-h-[400px]">
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Software Engineering Intern</div>
                      <div className="text-xs text-gray-500">Google • Campus Drive</div>
                    </div>
                  </div>
                  <div className="h-8 px-3 bg-mongo-green/20 rounded text-mongo-green-dark text-xs font-bold flex items-center border border-mongo-green/30">APPLIED</div>
                </div>
                
                {/* Timeline UI */}
                <div className="relative pl-4 space-y-6 border-l-2 border-gray-200 ml-2 mt-8">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-mongo-green border-4 border-[#F8F9FA]"></div>
                    <p className="text-sm font-bold text-gray-900">Eligibility Verified</p>
                    <p className="text-xs text-gray-500 mt-1">CGPA & Backlogs criteria met automatically.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#F8F9FA]"></div>
                    <p className="text-sm font-bold text-gray-900">Aptitude Test Passed</p>
                    <p className="text-xs text-gray-500 mt-1">Score updated by TPO.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-gray-300 border-4 border-[#F8F9FA]"></div>
                    <p className="text-sm font-medium text-gray-500">Technical Interview</p>
                    <p className="text-xs text-gray-400 mt-1">Pending schedule.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dark Inverse Section */}
      <section className="bg-mongo-dark text-white py-32 px-6 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-mongo-green/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-[1416px] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[40px] md:text-[56px] font-display font-extrabold leading-tight mb-6 tracking-tight">
                Automate your <br/>
                <span className="text-mongo-green">placement funnel.</span>
              </h2>
              <p className="text-xl text-gray-400 font-light mb-10 max-w-[500px]">
                Say goodbye to scattered Google Forms and Excel sheets. Define rules, evaluate hundreds of students instantly, and manage recruitment rounds natively.
              </p>
              
              <ul className="space-y-6">
                {[
                  { title: 'Centralized Opportunity Hub', desc: 'Publish both campus and off-campus drives directly to student dashboards.' },
                  { title: 'The Eligibility Engine', desc: 'Automatically cross-reference company criteria with verified academic profiles.' },
                  { title: 'Real-time Dashboards', desc: 'Monitor branch-wise analytics, application pipelines, and offer rates.' }
                ].map((item, idx) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 }}
                    key={idx} 
                    className="flex gap-4"
                  >
                    <div className="mt-1 flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-mongo-green" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {/* Engine Abstract UI */}
            <div className="bg-[#00141D] border border-gray-800 rounded-2xl p-8 shadow-2xl relative">
              <div className="absolute -top-4 -left-4 bg-mongo-green text-mongo-dark font-bold text-xs uppercase tracking-widest py-2 px-4 rounded-full shadow-lg">
                Engine Logic
              </div>
              <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                <code className="block mb-2"><span className="text-purple-400">const</span> <span className="text-blue-400">evaluateStudent</span> = (profile, company) {'=>'} {'{'}</code>
                <code className="block mb-2 pl-4"><span className="text-gray-500">// Check active backlogs constraint</span></code>
                <code className="block mb-2 pl-4"><span className="text-purple-400">if</span> (profile.activeBacklogs {'>'} company.maxBacklogs) {'{'}</code>
                <code className="block mb-2 pl-8"><span className="text-purple-400">return</span> {'{'} </code>
                <code className="block mb-2 pl-12 text-mongo-green">status: <span className="text-orange-400">"REJECTED"</span>,</code>
                <code className="block mb-2 pl-12">reason: <span className="text-yellow-300">`Backlog limit exceeded.`</span></code>
                <code className="block mb-2 pl-8">{'}'}</code>
                <code className="block mb-2 pl-4">{'}'}</code>
                <code className="block mb-2 pl-4"><span className="text-gray-500">// Verify branch eligibility</span></code>
                <code className="block mb-2 pl-4"><span className="text-purple-400">if</span> (!company.allowedBranches.includes(profile.branch)) {'{'}</code>
                <code className="block mb-2 pl-8"><span className="text-purple-400">return</span> {'{'} <span className="text-mongo-green">status:</span> <span className="text-orange-400">"NOT_ELIGIBLE"</span> {'}'}</code>
                <code className="block mb-2 pl-4">{'}'}</code>
                <code className="block mb-2 pl-4"><span className="text-purple-400">return</span> {'{'} <span className="text-mongo-green">status:</span> <span className="text-orange-400">"APPROVED"</span> {'}'}</code>
                <code className="block">{'}'}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-32 px-6 bg-[#F8F9FA] relative">
        {/* Decorative background blurs */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-mongo-green/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1416px] mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <h2 className="text-[40px] md:text-[56px] font-display font-extrabold text-mongo-dark tracking-tight mb-6">Designed for Higher Education</h2>
            <p className="text-xl text-mongo-text/70 max-w-2xl mx-auto font-light">
              We replaced isolated portals with a single unified operating system tailored perfectly for students, coordinators, and placement officers.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: GraduationCap, 
                title: 'Career Profiles', 
                desc: 'Students build comprehensive, verified portfolios containing academic records, projects, and multiple resumes.',
                color: 'from-blue-500 to-cyan-400',
                bg: 'bg-blue-50'
              },
              { 
                icon: Briefcase, 
                title: 'Unified Tracking', 
                desc: 'Stop relying on personal notes. Track external internships and campus drives in one unified Kanban-style board.',
                color: 'from-purple-500 to-pink-500',
                bg: 'bg-purple-50'
              },
              { 
                icon: FileCheck, 
                title: 'TPO Verification', 
                desc: 'Placement officers can verify student 10th, 12th, and UG marks, ensuring companies receive 100% accurate data.',
                color: 'from-mongo-green-dark to-[#00ED64]',
                bg: 'bg-green-50'
              }
            ].map((feat, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                whileHover={{ y: -10 }}
                className="group relative bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden" 
                key={idx}
              >
                {/* Hover gradient glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${"{feat.color}"}`}></div>
                
                <div className={`w-16 h-16 rounded-2xl ${"{feat.bg}"} flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  <div className={`absolute inset-0 opacity-20 rounded-2xl bg-gradient-to-br ${"{feat.color}"}`}></div>
                  <feat.icon className="w-8 h-8 text-mongo-dark relative z-10" />
                </div>
                <h3 className="text-2xl font-display font-bold text-mongo-dark mb-4 relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-colors duration-300">{feat.title}</h3>
                <p className="text-mongo-text/70 leading-relaxed font-light relative z-10">{feat.desc}</p>
                
                {/* Decorative line */}
                <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${"{feat.color}"} transition-all duration-500 ease-out`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-mongo-gray/30 pt-20 pb-10 px-6">
        <div className="max-w-[1416px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center">
                  <span className="text-mongo-green font-bold text-xl">P</span>
                </div>
                <span className="text-2xl font-bold tracking-tight text-mongo-dark">PLACEearly</span>
              </Link>
              <p className="text-mongo-text/60 max-w-sm mb-6">
                The centralized operating system bridging the gap between student career goals and college placement operations.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-mongo-dark mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Opportunity Hub</a></li>
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Eligibility Engine</a></li>
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Student Profiles</a></li>
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Analytics Reports</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-mongo-dark mb-6">Resources</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Preparation Hub</a></li>
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Help Center</a></li>
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-mongo-gray/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-mongo-text/50 text-sm">© {new Date().getFullYear()} PLACEearly. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-mongo-text/50">
              <a href="#" className="hover:text-mongo-dark">Privacy Policy</a>
              <a href="#" className="hover:text-mongo-dark">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
