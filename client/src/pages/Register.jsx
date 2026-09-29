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
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* Left Column: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-full max-w-md lg:w-[420px]"
        >
          <div>
            <Link to="/" className="flex items-center gap-2 mb-10 group">
              <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-mongo-green font-bold text-xl font-display">P</span>
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-mongo-dark">PLACEearly</span>
            </Link>
            
            <h2 className="text-[32px] font-extrabold text-mongo-dark font-display tracking-tight leading-tight mb-2">
              Create an account
            </h2>
            <p className="text-base text-gray-500 font-light">
              Join the modern platform for campus placements.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50/80 text-red-600 text-sm rounded-xl border border-red-100">
                  {error}
                </motion.div>
              )}
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-white"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-white"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-white"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-white"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">I am a...</label>
                <div className="relative">
                  <select 
                      name="role" 
                      value={formData.role}
                      onChange={handleChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm font-medium"
                  >
                      <option value="student">Student looking for jobs</option>
                      <option value="tpo">Placement Officer (TPO)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-mongo-dark bg-mongo-green hover:bg-[#00E05B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mongo-green shadow-lg shadow-mongo-green/20 transition-all duration-300"
                >
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-mongo-dark hover:text-mongo-green-dark transition-colors">
                  Log in instead
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Cartoon Image */}
      <div className="hidden lg:block relative w-0 flex-1 bg-[#001E2B] overflow-hidden">
        <motion.img 
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="/student-cartoon.jpg" 
          alt="Student Cartoon" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#001E2B] via-[#001E2B]/40 to-transparent"></div>

        {/* Floating Text */}
        <div className="absolute bottom-12 left-12 right-12 z-30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-white font-display text-[28px] font-medium leading-tight mb-6">
              "We saw a 40% increase in successful placements in our first year after migrating from spreadsheets to PLACEearly."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg border-2 border-white/20"></div>
              <div>
                <p className="text-white font-bold text-base">Michael Chang</p>
                <p className="text-white/70 text-sm font-medium">Director of Career Services, Global Engineering College</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
