import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePostLoginRedirect = (user) => {
    if (user.role === 'superadmin') {
      navigate('/superadmin');
    } else if (user.role === 'tpo' || user.role === 'admin' || user.role === 'coordinator') {
      navigate('/tpo/dashboard');
    } else if (user.role === 'recruiter') {
      navigate('/recruiter/drives');
    } else {
      navigate('/student/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password, collegeCode ? collegeCode.trim().toUpperCase() : undefined);
      handlePostLoginRedirect(user);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const inputEmail = window.prompt('Enter your Institutional Google Email (e.g. name@university.edu):', email || '');
    if (!inputEmail) return;

    try {
      setGoogleLoading(true);
      setError('');
      const user = await googleLogin({
        email: inputEmail.trim().toLowerCase(),
        firstName: 'Institutional',
        lastName: 'Member',
        collegeCode: collegeCode ? collegeCode.trim().toUpperCase() : undefined,
      });
      handlePostLoginRedirect(user);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Institutional Google login failed.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left Column: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
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
              Sign in to your campus placement workspace.
            </p>
          </div>

          <div className="mt-10">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
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

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      College Code (Optional)
                    </label>
                    <span className="text-[11px] text-gray-400">e.g. ANITS, IITB</span>
                  </div>
                  <input
                    type="text"
                    className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mongo-green focus:border-transparent transition-all shadow-sm bg-white font-mono uppercase text-xs"
                    placeholder="Leave blank to auto-detect"
                    value={collegeCode}
                    onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-mongo-green focus:ring-mongo-green border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-semibold text-mongo-green-dark hover:text-mongo-green transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-mongo-dark bg-mongo-green hover:bg-[#00E05B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mongo-green shadow-lg shadow-mongo-green/20 transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400 font-mono">Or continue with</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition shadow-sm disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  {googleLoading ? 'Signing in with Google...' : 'Institutional Google Sign-In'}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-bold text-mongo-dark hover:text-mongo-green-dark transition-colors">
                  Create one now
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
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="/student-cartoon.jpg"
          alt="Student Cartoon"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#001E2B] via-[#001E2B]/40 to-transparent"></div>

        <div className="absolute bottom-12 left-12 right-12 z-30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <p className="text-white font-display text-[28px] font-medium leading-tight mb-6">
              &quot;PLACEearly completely transformed how we manage campus hiring across departments and branches.&quot;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mongo-green to-blue-500 shadow-lg border-2 border-white/20"></div>
              <div>
                <p className="text-white font-bold text-base">Dr. Sarah Jenkins</p>
                <p className="text-white/70 text-sm font-medium">Head of Placements, Tech University</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
