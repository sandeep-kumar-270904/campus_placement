import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import {
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function RecruiterAcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [validating, setValidating] = useState(true);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError('Invitation token is missing. Please use the exact link sent in your invitation email.');
      setValidating(false);
      return;
    }

    const checkToken = async () => {
      try {
        const res = await recruiterService.validateInviteToken(token);
        setInviteDetails(res);
      } catch (err) {
        setTokenError(
          err.response?.data?.error?.message ||
            'This invitation link is invalid, expired, or has already been used.'
        );
      } finally {
        setValidating(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await recruiterService.setPassword({ token, password });

      // Save token and user to localStorage
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      if (res.user || res._id) {
        const userObj = res.user || {
          _id: res._id,
          id: res._id,
          email: res.email,
          firstName: res.firstName,
          lastName: res.lastName,
          role: res.role,
          companyId: res.companyId,
          companyName: res.companyName,
          collegeId: res.collegeId,
        };
        localStorage.setItem('user', JSON.stringify(userObj));
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/recruiter/drives';
      }, 1500);
    } catch (err) {
      setSubmitError(
        err.response?.data?.error?.message || 'Failed to set password. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white">Validating Corporate Invitation...</h2>
          <p className="text-xs text-slate-400">Verifying security token with institutional keys.</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-800/60 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-white">Invalid or Expired Invitation</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{tokenError}</p>
          <div className="pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-100">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-indigo-500/20">
            P
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome to PLACEearly
          </h1>
          <p className="text-xs text-slate-400">
            Corporate Recruiter Workspace Invitation
          </p>
        </div>

        {/* Invited Info Badge */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Corporate Entity:</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              {inviteDetails?.companyName || 'Corporate Partner'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Invited By:</span>
            <span className="font-semibold text-slate-200">
              {inviteDetails?.collegeName || 'Placement Cell'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Recruiter Email:</span>
            <span className="font-mono text-slate-200">{inviteDetails?.email}</span>
          </div>
        </div>

        {submitError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{submitError}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Password set successfully! Redirecting to your drives...</span>
          </div>
        )}

        {/* Password Set Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">
              Create Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || success}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/20 transition"
            >
              <span>{submitting ? 'Setting Password...' : 'Activate Account & Access Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            Already activated your account?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
