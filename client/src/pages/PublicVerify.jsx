import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  GraduationCap, Building2, Calendar, UserCheck, KeyRound, 
  Copy, Check, Printer, ArrowLeft, ExternalLink 
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function PublicVerify() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchVerification = async () => {
      if (!code) {
        setLoading(false);
        setError('No verification code or roll number provided.');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/verify/${encodeURIComponent(code)}`);
        setData(response.data);
      } catch (err) {
        console.error('Verification error:', err);
        setError(
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          `Unable to verify record for '${code}'. Record may not exist.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [code]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold tracking-wide text-slate-300">
            Validating Ed25519 Cryptographic Signature & Database Integrity...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-800/60 rounded-3xl p-8 text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-950/70 border border-red-700/60 text-red-400 flex items-center justify-center mx-auto text-2xl shadow-lg">
            ✕
          </div>
          <h2 className="text-xl font-bold text-white">Record Verification Failed</h2>
          <p className="text-xs text-slate-400">{error || 'No record found.'}</p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              ← Back to PLACEearly Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const student = data.student || {};
  const isValid = Boolean(data.valid);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Floating Action Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 shadow"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> PLACEearly Home
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 px-3.5 py-2 rounded-xl border border-slate-800 shadow flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied!' : 'Share Verification'}
          </button>

          <button
            onClick={handlePrint}
            className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition cursor-pointer font-bold"
          >
            <Printer className="w-3.5 h-3.5" /> Print Certificate
          </button>
        </div>
      </div>

      {/* Main Cryptographic Credential Certificate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden relative"
      >
        {/* Certificate Top Ribbon */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg shadow">
              P
            </div>
            <div>
              <p className="text-xs font-black tracking-wider uppercase text-emerald-400">
                PLACEearly Official Credential Registry
              </p>
              <p className="text-[11px] text-slate-400">
                Institutional Placement Cell & Registrar Cryptographic Seal
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isValid
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
                : 'bg-red-950/80 text-red-300 border-red-600/60'
            }`}
          >
            {isValid ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Level 3 Ed25519 Verified</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Verification Failed</span>
              </>
            )}
          </div>
        </div>

        {/* Big Cryptographic Verification Status Banner */}
        <div
          className={`p-6 border-b transition-colors ${
            isValid
              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
              : 'bg-red-950/40 border-red-800/50 text-red-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                isValid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {isValid ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2
                  className={`text-xl font-black tracking-tight ${
                    isValid ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isValid ? 'Signature valid' : 'Record changed or invalid'}
                </h2>
                {student.keyId && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-purple-400" />
                    Key: {student.keyId}
                  </span>
                )}
                {student.version && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                    v{student.version}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isValid
                  ? 'The academic metrics below have been cryptographically signed with the college placement office Ed25519 private key. Zero database tampering detected.'
                  : data.reason || 'The academic record does not match the registered digital signature or requires TPO re-verification.'}
              </p>
            </div>
          </div>
        </div>

        {/* Student Profile Header */}
        <div className="p-8 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-700 text-emerald-400 font-black text-3xl flex items-center justify-center shadow-lg">
              {student.name ? student.name.charAt(0) : 'S'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">{student.name}</h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {student.rollNo}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-semibold">{student.branch}</p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                {student.collegeName} ({student.collegeCode})
              </p>
            </div>

            <div className="text-right sm:self-center">
              <Link
                to={`/portfolio/${student.rollNo}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                View Portfolio <ExternalLink className="w-3 h-3 text-emerald-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Academic Performance Metrics Grid */}
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Signed Academic Credentials
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Cumulative CGPA
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {Number(student.cgpa || 0).toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Digitally Signed</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Backlogs
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {student.backlogs ?? 0}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Verified Count</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Graduation Batch
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {student.gradYear || 2026}
                </span>
                <span className="text-[10px] text-slate-400">Class Year</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Cryptographic Status
                </span>
                <span
                  className={`text-xs font-black mt-2 block ${
                    isValid ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isValid ? 'VALID SEAL' : 'INVALID'}
                </span>
                <span className="text-[10px] text-slate-400">SHA-256 / Ed25519</span>
              </div>
            </div>
          </div>

          {/* Audit Verification Trail */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Signing Official:</span>
                <span className="font-semibold text-white">{student.verifier || 'Institutional Placement Office'}</span>
              </div>
              {student.verifiedAt && (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Verified: {new Date(student.verifiedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Verification Code:</span>
                <span className="text-purple-300 font-bold">{student.verificationCode || code}</span>
              </div>
              <div className="flex justify-between">
                <span>Cryptographic Algorithm:</span>
                <span className="text-emerald-400">Ed25519 Curve25519 Digital Signature</span>
              </div>
              <div className="flex justify-between">
                <span>Canonical Hash Format:</span>
                <span>SHA-256 (RFC 8785 JSON Canonicalization)</span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300">Privacy Guarantee: </span>
            In compliance with institutional FERPA / privacy guidelines, sensitive candidate contact information (email address, phone number, and residential address) is never exposed via this public certificate.
          </div>
        </div>

        {/* Certificate Footer */}
        <div className="px-8 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>Official Institutional Registry & Verification Portal</span>
          <span>Powered by PLACEearly OS</span>
        </div>
      </motion.div>
    </div>
  );
}
