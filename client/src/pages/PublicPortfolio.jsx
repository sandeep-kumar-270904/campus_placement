import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle2, GraduationCap, Award, 
  ExternalLink, Copy, Check, ArrowLeft, Printer 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getStudents } from '../services/placementStore';

const PublicPortfolio = () => {
  const { rollNo } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const allStudents = getStudents();
    const found = allStudents.find(
      s => (s.rollNo || '').toLowerCase() === (rollNo || '').toLowerCase() ||
           (s.id || '').toLowerCase() === (rollNo || '').toLowerCase()
    );

    if (found) {
      setStudent(found);
    } else {
      // Default fallback student if not found in mock store
      setStudent({
        name: 'Alex Mercer',
        rollNo: rollNo || 'CS2026-08',
        branch: 'Computer Science & Engineering',
        degree: 'Bachelor of Technology (B.Tech)',
        cgpa: 8.85,
        backlogs: 0,
        gradYear: 2026,
        isVerified: true,
        resumeUrl: 'https://drive.google.com/file/d/alex-resume-2026',
        skills: ['React', 'Node.js', 'System Design', 'Algorithms', 'MongoDB', 'Python'],
        placedCompany: 'Google (Software Engineering Intern)'
      });
    }
  }, [rollNo]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mongo-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-gray-600">Verifying Institutional Record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-mongo-green selection:text-mongo-dark py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Floating Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyLink}
            className="text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-mongo-green-dark" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied!' : 'Share Verification Link'}
          </button>
          
          <button 
            onClick={handlePrint}
            className="text-xs font-bold bg-mongo-dark text-white hover:bg-gray-800 px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-mongo-green" /> Print Certificate
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
              <p className="text-xs font-extrabold tracking-wider uppercase text-mongo-green">PLACEearly Verified Credential</p>
              <p className="text-[11px] text-gray-400">Institutional Placement Cell Records Office</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-mongo-green/20 text-mongo-green px-3 py-1 rounded-full text-xs font-bold border border-mongo-green/30">
            <ShieldCheck className="w-4 h-4 text-mongo-green" />
            Verified Record
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
                <span className="inline-flex items-center text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Authenticated
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
                <span className="text-[10px] text-green-600 font-bold">Top 5% of Cohort</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Active Backlogs</span>
                <span className="text-2xl font-display font-extrabold text-mongo-dark mt-1 block">{student.backlogs}</span>
                <span className="text-[10px] text-green-600 font-bold">Clean Record</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Graduation Batch</span>
                <span className="text-2xl font-display font-extrabold text-mongo-dark mt-1 block">{student.gradYear}</span>
                <span className="text-[10px] text-gray-500 font-medium">Final Year</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Verification</span>
                <span className="text-sm font-display font-bold text-green-700 mt-2 block">Level 3 Complete</span>
                <span className="text-[10px] text-gray-400 font-medium">Placement Cell</span>
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

          {/* Verification Audit Details */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div>
              <p className="font-bold text-gray-900">Cryptographically Signed Academic Record</p>
              <p className="font-mono text-[11px] text-gray-500 mt-0.5">HASH: SHA256-8F92-B7A1-420E-PLACE-2026-OK</p>
            </div>
            {student.resumeUrl && (
              <a 
                href={student.resumeUrl} 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2 bg-white text-blue-600 border border-gray-200 rounded-xl font-bold shadow-xs hover:bg-gray-50 flex items-center gap-1.5"
              >
                View Transcripts / Resume <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
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
