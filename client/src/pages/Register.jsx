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
    <div className="min-h-screen flex items-center justify-center bg-mongo-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-[32px] shadow-2xl border border-gray-100 relative z-10"
      >
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-mongo-dark rounded-xl flex items-center justify-center mb-6 shadow-md">
            <span className="text-mongo-green font-bold text-2xl font-display">P</span>
          </div>
          <h2 className="text-3xl font-extrabold text-mongo-dark font-display tracking-tight flex items-center justify-center gap-2">
            Create an account
            <motion.span
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                repeatDelay: 1.5
              }}
              className="inline-block"
            >
              ✨
            </motion.span>
          </h2>
          <p className="mt-2 text-sm text-mongo-text/60">
            Join PLACEearly to streamline your placements
          </p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 text-red-600 text-sm text-center rounded-lg border border-red-100">
              {error}
            </motion.div>
          )}
          
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50"
              placeholder="you@university.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <div className="relative">
              <select 
                  name="role" 
                  value={formData.role}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm font-medium"
              >
                  <option value="student">Student</option>
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
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-mongo-dark bg-mongo-green hover:bg-[#00E05B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mongo-green shadow-lg shadow-mongo-green/20 transition-all duration-300"
            >
              Register
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm mt-6">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-mongo-green-dark hover:text-mongo-green transition-colors">
              Log in instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
