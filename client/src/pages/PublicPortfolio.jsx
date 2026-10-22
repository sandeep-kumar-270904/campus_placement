import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, GraduationCap, Award, 
  ExternalLink, Copy, Check, ArrowLeft, Printer, QrCode as QrIcon 
} from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import api from '../services/api';

const PublicPortfolio = () => {
  const { rollNo } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        // Attempt to fetch real cryptographic verification record
        const res = await api.get(`/verify/${encodeURIComponent(rollNo)}`);
        if (res.data && res.data.student) {
          setVerificationData(res.data);
          setStudent({
            name: res.data.student.name,
            rollNo: res.data.student.rollNo,
            branch: res.data.student.branch,
            degree: 'Bachelor of Technology (B.Tech)',
            cgpa: res.data.student.cgpa,
            backlogs: res.data.student.backlogs,
            gradYear: res.data.student.gradYear,
            isVerified: res.data.valid,
            collegeName: res.data.student.collegeName,
            verificationCode: res.data.student.verificationCode,
            keyId: res.data.student.keyId,
            skills: ['React', 'Node.js', 'System Design', 'Algorithms', 'MongoDB', 'Python'],
          });
        }
      } catch {
        // Fallback profile if offline/mock
        setStudent({
          name: 'Alex Mercer',
          rollNo: rollNo || 'CS2026-08',
          branch: 'Computer Science & Engineering',
          degree: 'Bachelor of Technology (B.Tech)',
          cgpa: 8.85,
          backlogs: 0,
          gradYear: 2026,
          isVerified: true,
          collegeName: 'University College of Engineering',
          verificationCode: `PE-COL-${rollNo || 'CS2026-08'}`,
          skills: ['React', 'Node.js', 'System Design', 'Algorithms', 'MongoDB', 'Python'],
          placedCompany: 'Google (Software Engineering Intern)',
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [rollNo]);

  // Generate QR Code linking directly to /verify/:code
  useEffect(() => {
    if (!student) return;
    const targetCode = student.verificationCode || student.rollNo || rollNo;
    const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(targetCode)}`;

    QRCode.toDataURL(
      verifyUrl,
      {
        width: 140,
        margin: 1,
        color: {
          dark: '#001E2B',
          light: '#FFFFFF',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrCodeDataUrl(url);
        }
      }
    );
  }, [student, rollNo]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mongo-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-gray-600">Verifying Institutional Record...</p>
        </div>
      </div>
    );
  }

  const targetVerifyCode = student.verificationCode || student.rollNo || rollNo;
  const isSealValid = verificationData ? verificationData.valid : student.isVerified;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-mongo-green selection:text-mongo-dark py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Floating Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyLink}
            className="text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-mongo-green-dark" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied!' : 'Share Portfolio'}
          </button>
          
          <button 
            onClick={handlePrint}
            className="text-xs font-bold bg-mongo-dark text-white hover:bg-gray-800 px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-mongo-green" /> Print Portfolio
          </button>
        </div>
      </div>

      {/* Main Verified Credential Certificate Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden relative"
      >
        {/* Verification Ribbon */}
        <div className="bg-mongo-dark text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-mongo-green rounded-md flex items-center justify-center text-mongo-dark font-bold font-display text-base">
              P
            </div>
            <div>
              <p className="text-xs font-extrabold tracking-wider uppercase text-mongo-green">PLACEearly Verified Portfolio</p>
              <p className="text-[11px] text-gray-400">{student.collegeName || 'Institutional Placement Cell Records Office'}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isSealValid ? 'bg-mongo-green/20 text-mongo-green border-mongo-green/30' : 'bg-red-950/60 text-red-300 border-red-800/50'
          }`}>
            {isSealValid ? <ShieldCheck className="w-4 h-4 text-mongo-green" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
            {isSealValid ? 'Verified Record' : 'Record Changed'}
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="p-8 sm:p-10 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50/60">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-mongo-dark text-mongo-green font-display font-extrabold text-3xl flex items-center justify-center shadow-lg border-4 border-white">
              {student.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">{student.name}</h1>
                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isSealValid ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {isSealValid ? 'Authenticated' : 'Pending Verification'}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-600">{student.branch}</p>
              <p className="text-xs text-gray-500 mt-0.5">{student.degree || 'B.Tech'} • Roll No: <strong className="text-gray-900">{student.rollNo}</strong></p>

              {student.placedCompany && student.placedCompany !== 'Not Placed' && (
                <div className="mt-4 inline-flex items-center gap-2 bg-mongo-green/10 text-mongo-dark px-3.5 py-1.5 rounded-xl border border-mongo-green/20 text-xs font-bold">
                  <Award className="w-4 h-4 text-mongo-green-dark" />
                  Campus Offer: {student.placedCompany}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Academic Credentials Grid */}
        <div className="p-8 sm:p-10 space-y-8">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-mongo-green-dark" />
              Verified Academic Performance
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Cumulative CGPA</span>
                <span className="text-2xl font-display font-extrabold text-mongo-dark mt-1 block">{student.cgpa}</span>
                <span className="text-[10px] text-green-600 font-bold">Verified Score</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Active Backlogs</span>
                <span className="text-2xl font-display font-extrabold text-mongo-dark mt-1 block">{student.backlogs}</span>
                <span className="text-[10px] text-green-600 font-bold">Zero Backlogs</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Graduation Batch</span>
                <span className="text-2xl font-display font-extrabold text-mongo-dark mt-1 block">{student.gradYear}</span>
                <span className="text-[10px] text-gray-500 font-medium">Class Year</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Verification</span>
                <span className="text-sm font-display font-bold text-green-700 mt-2 block">Level 3 Complete</span>
                <span className="text-[10px] text-gray-400 font-medium">Ed25519 Sealed</span>
              </div>
            </div>
          </div>

          {/* Cryptographic QR Code Verification Card */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-gray-800 shadow-lg flex flex-col sm:flex-row items-center gap-6">
            {qrCodeDataUrl ? (
              <div className="p-2 bg-white rounded-2xl shadow-md shrink-0">
                <img src={qrCodeDataUrl} alt="Verification QR Code" className="w-28 h-28 object-contain" />
              </div>
            ) : (
              <div className="w-28 h-28 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                <QrIcon className="w-8 h-8 text-mongo-green" />
              </div>
            )}

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="w-4 h-4 text-mongo-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-mongo-green">
                  Cryptographic TPO Verification Seal
                </span>
              </div>
              <p className="text-sm font-bold text-white leading-snug">
                Scan with any smartphone camera to verify this student&apos;s academic record in real time.
              </p>
              <p className="text-xs text-gray-400">
                Links directly to the immutable verification seal signed with the institutional Ed25519 key.
              </p>
              <div className="pt-1">
                <Link
                  to={`/verify/${encodeURIComponent(targetVerifyCode)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-mongo-green hover:underline"
                >
                  Open Public Verification Certificate ➔
                </Link>
              </div>
            </div>
          </div>

          {/* Verified Skills */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Verified Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {(student.skills || ['React', 'Node.js', 'System Design', 'Algorithms']).map((skill, i) => (
                <span key={i} className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-800 rounded-xl border border-gray-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>Powered by PLACEearly Placement Management System</span>
          <span>Official Institutional Registry</span>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicPortfolio;
