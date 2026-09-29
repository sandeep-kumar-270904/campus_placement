import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await register(formData);
      if (user.role === 'tpo') {
        navigate('/tpo/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen relative font-sans overflow-hidden bg-mongo-dark flex items-center justify-center">
      
      {/* Full Screen Background Image */}
      <motion.div 
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="/register-landscape.jpg" 
          alt="Campus and Startup" 
          className="w-full h-full object-cover"
        />
        {/* Gradients to ensure the form is readable */}
        <div className="absolute inset-0 bg-mongo-dark/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-mongo-dark/80 via-mongo-dark/50 to-transparent"></div>
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[1416px] mx-auto px-6 py-12 flex items-center justify-start min-h-screen">
        
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md lg:w-[480px]"
        >
          {/* Frosted Glass Form Card */}
          <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20">
            <div className="mb-8">
              <Link to="/" className="flex items-center gap-2 mb-8 group w-max">
                <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-mongo-green font-bold text-xl font-display">P</span>
                </div>
                <span className="text-xl font-display font-bold tracking-tight text-mongo-dark">PLACEearly</span>
              </Link>
              
              <h2 className="text-[32px] font-extrabold text-mongo-dark font-display tracking-tight leading-tight mb-2">
                Join the platform
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Create an account to start managing your placements and campus drives.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50/90 text-red-600 text-sm font-medium rounded-xl border border-red-100 backdrop-blur-sm">
                  {error}
                </motion.div>
              )}
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">I am a...</label>
                <div className="relative">
                  <select 
                      name="role" 
                      value={formData.role}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm font-semibold text-gray-900"
                  >
                      <option value="student">Student candidate</option>
                      <option value="tpo">Placement Officer (TPO)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-mongo-dark bg-mongo-green hover:bg-[#00E05B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mongo-green shadow-[0_8px_20px_-8px_rgba(0,237,100,0.6)] transition-all duration-300"
                >
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-sm font-medium">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-mongo-dark hover:text-mongo-green-dark transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Decorative Floating Text over the image background on the right */}
        <div className="hidden lg:block absolute right-12 bottom-12 max-w-sm pointer-events-none">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.6 }}
             className="bg-mongo-dark/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl"
           >
             <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-mongo-green flex items-center justify-center font-bold text-mongo-dark text-sm">
                 ✓
               </div>
               <span className="text-white font-bold tracking-wide text-sm">TRUSTED BY UNIVERSITIES</span>
             </div>
             <p className="text-white/80 text-sm font-medium leading-relaxed">
               Join thousands of students and placement officers actively using PLACEearly to bridge the gap between education and tech careers.
             </p>
           </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Register;
