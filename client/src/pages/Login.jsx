import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'tpo') {
        navigate('/tpo/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mongo-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-mongo-green/20 rounded-full blur-[100px] pointer-events-none"></div>
      
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
            Welcome back
            <motion.span
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                repeatDelay: 1
              }}
              className="inline-block origin-[70%_70%]"
            >
              👋
            </motion.span>
          </h2>
          <p className="mt-2 text-sm text-mongo-text/60">
            Sign in to continue to PLACEearly
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 text-red-600 text-sm text-center rounded-lg border border-red-100">
              {error}
            </motion.div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-gray-50/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-mongo-dark bg-mongo-green hover:bg-[#00E05B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mongo-green shadow-lg shadow-mongo-green/20 transition-all duration-300"
            >
              Sign In
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm mt-6">
          <p className="text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-mongo-green-dark hover:text-mongo-green transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
