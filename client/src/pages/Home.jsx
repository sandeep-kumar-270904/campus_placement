import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight, Globe, Layers, ShieldCheck, Zap } from 'lucide-react';

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
              <span className="text-xl font-bold tracking-tight text-mongo-dark">PLACEearly</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8">
              <a href="#platform" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">Platform</a>
              <a href="#solutions" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">Solutions</a>
              <a href="#resources" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">Resources</a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link to="/register" className="text-[15px] font-medium bg-mongo-dark text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
              Try Free
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
                <span className="text-xs font-semibold uppercase tracking-widest text-mongo-green-dark">New Release</span>
                <span className="text-sm font-medium text-mongo-text flex items-center cursor-pointer hover:underline">
                  Eligibility Engine 2.0 <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
              
              <h1 className="text-[56px] leading-[1.05] md:text-[80px] font-bold text-mongo-dark tracking-[-0.02em] mb-8">
                The Campus <br /> Placement Platform
              </h1>
              
              <p className="text-xl md:text-[22px] leading-relaxed text-mongo-text/80 max-w-[600px] mb-10 font-light">
                Get your students placed faster with a flexible, intelligent platform. 
                PLACEearly makes managing profiles, tracking applications, and defining eligibility rules effortless.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-mongo-green text-mongo-dark px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#00E05B] transition-colors border border-transparent shadow-[0_4px_14px_0_rgba(0,237,100,0.39)]">
                  Start Building Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/contact" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-full text-lg font-medium text-mongo-dark border border-mongo-gray hover:border-mongo-dark transition-colors bg-transparent">
                  Contact Sales
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
              {/* Mockup UI */}
              <div className="h-10 bg-mongo-dark flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-mongo-green/80"></div>
              </div>
              <div className="p-6 bg-[#F8F9FA] min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-24 bg-mongo-green/20 rounded text-mongo-green-dark text-xs font-bold flex items-center justify-center border border-mongo-green/30">ELIGIBLE</div>
                </div>
                <div className="space-y-4">
                  <div className="h-24 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                     <div className="h-4 w-1/3 bg-gray-200 rounded mb-4"></div>
                     <div className="h-3 w-full bg-gray-100 rounded mb-2"></div>
                     <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
                  </div>
                  <div className="h-24 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                     <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
                     <div className="h-3 w-full bg-gray-100 rounded mb-2"></div>
                     <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dark Inverse Section (MongoDB style) */}
      <section className="bg-mongo-dark text-white py-32 px-6 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-mongo-green/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-[1416px] mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[40px] md:text-[56px] font-bold leading-tight mb-6 tracking-tight">
                Data-driven <br/>
                <span className="text-mongo-green">placement operations.</span>
              </h2>
              <p className="text-xl text-gray-400 font-light mb-10 max-w-[500px]">
                Eliminate spreadsheets. Our Eligibility Engine evaluates student profiles against company criteria instantly, providing clear reasons for disqualification and streamlining the funnel.
              </p>
              
              <ul className="space-y-6">
                {[
                  { title: 'Unified Profiles', desc: 'One verified profile for campus and external opportunities.' },
                  { title: 'Automated Eligibility', desc: 'Define rules for CGPA, backlogs, and branches. We handle the math.' },
                  { title: 'Real-time Analytics', desc: 'Track funnel conversions and generate historical placement reports instantly.' }
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
            
            {/* Abstract Code/Data UI element */}
            <div className="bg-[#00141D] border border-gray-800 rounded-2xl p-8 shadow-2xl relative">
              <div className="absolute -top-4 -left-4 bg-mongo-green text-mongo-dark font-bold text-xs uppercase tracking-widest py-2 px-4 rounded-full shadow-lg">
                Engine Active
              </div>
              <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                <code className="block mb-2"><span className="text-purple-400">const</span> <span className="text-blue-400">checkEligibility</span> = (student, rule) {'=>'} {'{'}</code>
                <code className="block mb-2 pl-4"><span className="text-gray-500">// Evaluating CGPA criteria</span></code>
                <code className="block mb-2 pl-4"><span className="text-purple-400">if</span> (student.cgpa {'<'} rule.minCgpa) {'{'}</code>
                <code className="block mb-2 pl-8"><span className="text-purple-400">return</span> {'{'} </code>
                <code className="block mb-2 pl-12 text-mongo-green">eligible: <span className="text-orange-400">false</span>,</code>
                <code className="block mb-2 pl-12">reason: <span className="text-yellow-300">`CGPA ${"{student.cgpa}"} is below required ${"{rule.minCgpa}"}`</span></code>
                <code className="block mb-2 pl-8">{'}'}</code>
                <code className="block mb-2 pl-4">{'}'}</code>
                <code className="block mb-2 pl-4"><span className="text-purple-400">return</span> {'{'} <span className="text-mongo-green">eligible:</span> <span className="text-orange-400">true</span> {'}'}</code>
                <code className="block">{'}'}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-32 px-6 bg-mongo-bg">
        <div className="max-w-[1416px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[40px] md:text-[56px] font-bold text-mongo-dark tracking-tight mb-6">Designed for scale</h2>
            <p className="text-xl text-mongo-text/70 max-w-2xl mx-auto font-light">
              Built on a robust, modular architecture to handle the complexities of thousands of students, companies, and concurrent applications.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: 'Centralized Hub', desc: 'A single destination for students to discover jobs, internships, and track applications without juggling portals.' },
              { icon: Layers, title: 'Document Management', desc: 'Securely manage multiple resume versions, transcripts, and ID documents directly on the platform.' },
              { icon: ShieldCheck, title: 'Audit & Compliance', desc: 'Maintain historical records, TPO verifications, and access logs to ensure transparent placement processes.' }
            ].map((feat, idx) => (
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-10 rounded-2xl border border-mongo-gray/40 shadow-sm hover:shadow-xl transition-all duration-300" 
                key={idx}
              >
                <div className="w-14 h-14 bg-mongo-bg rounded-xl border border-mongo-gray/50 flex items-center justify-center mb-8">
                  <feat.icon className="w-7 h-7 text-mongo-green-dark" />
                </div>
                <h3 className="text-2xl font-bold text-mongo-dark mb-4">{feat.title}</h3>
                <p className="text-mongo-text/70 leading-relaxed font-light">{feat.desc}</p>
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
                The world's leading modern platform for campus placements, career tracking, and hiring operations.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-mongo-dark mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Opportunity Hub</a></li>
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Eligibility Engine</a></li>
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Analytics</a></li>
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-mongo-dark mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">About Us</a></li>
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Careers</a></li>
                <li><a href="#" className="text-mongo-text/70 hover:text-mongo-green-dark transition-colors">Contact</a></li>
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
