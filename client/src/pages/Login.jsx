import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* Left Column: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          <div>
            <Link to="/" className="flex items-center gap-2 mb-12 group">
              <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-mongo-green font-bold text-xl font-display">P</span>
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-mongo-dark">PLACEearly</span>
            </Link>
            
            <h2 className="text-[32px] font-extrabold text-mongo-dark font-display tracking-tight leading-tight mb-2">
              Welcome back
            </h2>
            <p className="text-base text-gray-500 font-light">
              Sign in to manage your campus placements.
            </p>
          </div>

          <div className="mt-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50/80 text-red-600 text-sm rounded-xl border border-red-100">
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-white"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    className="appearance-none block w-full px-4 py-3.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-mongo-green focus:ring-mongo-green border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-mongo-green-dark hover:text-mongo-green transition-colors">Forgot password?</a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-mongo-dark bg-mongo-green hover:bg-[#00E05B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mongo-green shadow-lg shadow-mongo-green/20 transition-all duration-300"
                >
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-mongo-dark hover:text-mongo-green-dark transition-colors">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Animated Picture / Graphic */}
      <div className="hidden lg:block relative w-0 flex-1 bg-[#001E2B] overflow-hidden">
        {/* Animated Background Mesh */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-mongo-green/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            x: [0, -100, 0],
            y: [0, 100, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px]"
        />
        
        {/* Abstract Isometric UI Illustration */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative w-full max-w-lg aspect-square"
          >
            {/* Glassmorphism Card 1 */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[15%] right-[10%] w-64 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl z-20"
            >
              <div className="h-4 w-1/3 bg-white/30 rounded mb-4"></div>
              <div className="h-2 w-full bg-white/20 rounded mb-2"></div>
              <div className="h-2 w-4/5 bg-white/20 rounded mb-2"></div>
              <div className="h-2 w-2/3 bg-white/20 rounded"></div>
            </motion.div>

            {/* Glassmorphism Card 2 (Main) */}
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[40%] left-[10%] w-80 h-48 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl z-10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-mongo-green/20 border border-mongo-green/50 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-mongo-green"></div>
                </div>
                <div>
                  <div className="h-4 w-32 bg-white/40 rounded mb-2"></div>
                  <div className="h-3 w-20 bg-mongo-green/60 rounded"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/10 rounded"></div>
                <div className="h-2 w-full bg-white/10 rounded"></div>
                <div className="h-2 w-3/4 bg-white/10 rounded"></div>
              </div>
            </motion.div>

            {/* Decorative Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute top-[20%] left-[20%] w-96 h-96 border border-white/10 rounded-full border-dashed"
            />
          </motion.div>
        </div>

        {/* Floating Text */}
        <div className="absolute bottom-12 left-12 right-12 z-30">
          <p className="text-white/80 font-display text-2xl font-light leading-relaxed">
            "PLACEearly completely transformed how we manage campus hiring. It’s seamlessly automated our entire funnel."
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500"></div>
            <div>
              <p className="text-white font-bold text-sm">Dr. Sarah Jenkins</p>
              <p className="text-white/50 text-xs">Head of Placements, Tech University</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
