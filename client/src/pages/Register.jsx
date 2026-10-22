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
    collegeCode: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        collegeCode: formData.collegeCode ? formData.collegeCode.trim().toUpperCase() : undefined,
      };
      const user = await register(payload);
      if (user.role === 'superadmin') {
        navigate('/superadmin');
      } else if (user.role === 'tpo') {
        navigate('/tpo/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Registration failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans overflow-hidden bg-mongo-dark flex items-center justify-center">
      {/* Full Screen Background Image */}
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/register-landscape.jpg"
          alt="Campus and Startup"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[1416px] mx-auto px-6 py-12 flex items-center justify-start min-h-screen">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="w-full max-w-xl lg:w-[560px]"
        >
          {/* Frosted Glass Form Card */}
          <div className="bg-white/95 backdrop-blur-3xl p-8 sm:p-10 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border border-white/40">
            <div className="mb-6">
              <Link to="/" className="flex items-center gap-2 mb-6 group w-max">
                <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-mongo-green font-bold text-xl font-display">P</span>
                </div>
                <span className="text-xl font-display font-bold tracking-tight text-mongo-dark">PLACEearly</span>
              </Link>

              <h2 className="text-[28px] sm:text-[32px] font-extrabold text-mongo-dark font-display tracking-tight leading-tight mb-1.5">
                Join the platform
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Create an account to access verified campus placement drives.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="appearance-none block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white text-xs"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="appearance-none block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white text-xs"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="appearance-none block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white text-xs"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="appearance-none block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white text-xs"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="w-1/2">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    College Code
                  </label>
                  <input
                    type="text"
                    name="collegeCode"
                    className="appearance-none block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white text-xs uppercase font-mono"
                    placeholder="e.g. ANITS"
                    value={formData.collegeCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Account Role
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm font-semibold text-gray-900 text-xs"
                  >
                    <option value="student">Student Candidate</option>
                    <option value="tpo">Placement Officer (TPO)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-mongo-dark bg-mongo-green hover:bg-[#00E05B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mongo-green shadow-lg shadow-mongo-green/20 transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-xs font-medium">
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
              <span className="text-white font-bold tracking-wide text-sm">MULTI-TENANT PLATFORM</span>
            </div>
            <p className="text-white/80 text-xs font-medium leading-relaxed">
              Institutional databases are securely isolated. Students, drives, and credentials never cross institutional boundaries.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
