import React, { useState } from 'react';
import { 
  X, Sparkles, CheckCircle2, AlertCircle, Zap, BookOpen 
} from 'lucide-react';
import { motion } from 'framer-motion';

const AtsMatcherModal = ({ isOpen, onClose, studentProfile, opportunities = [] }) => {
  const [selectedOppId, setSelectedOppId] = useState(opportunities[0]?.id || '');
  const [customRoleText, setCustomRoleText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  if (!isOpen) return null;

  const currentOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0];

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      // Analyze student skills against opportunity
      const studentSkills = Array.isArray(studentProfile?.skills) 
        ? studentProfile.skills.map(s => s.toLowerCase().trim())
        : (studentProfile?.skills || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

      const jobDesc = `${currentOpp?.title || ''} ${currentOpp?.description || ''} ${customRoleText}`.toLowerCase();

      // Common tech keywords pool
      const targetKeywords = [
        'react', 'node.js', 'python', 'javascript', 'typescript', 'sql', 'system design',
        'distributed systems', 'cloud', 'aws', 'docker', 'kubernetes', 'algorithms', 
        'data structures', 'microservices', 'git', 'ci/cd', 'rest api', 'mongodb', 'graphql'
      ];

      // Identify relevant keywords for this job
      const relevantKeywords = targetKeywords.filter(k => 
        jobDesc.includes(k) || 
        (currentOpp?.title?.toLowerCase().includes('engineer') && ['algorithms', 'data structures', 'system design', 'git'].includes(k)) ||
        (currentOpp?.title?.toLowerCase().includes('frontend') && ['react', 'javascript', 'typescript', 'rest api'].includes(k)) ||
        (currentOpp?.title?.toLowerCase().includes('backend') && ['node.js', 'sql', 'microservices', 'distributed systems'].includes(k))
      );

      const finalTargetKeywords = relevantKeywords.length > 0 ? relevantKeywords : ['react', 'node.js', 'sql', 'git', 'data structures'];

      const matched = finalTargetKeywords.filter(k => studentSkills.some(s => s.includes(k) || k.includes(s)));
      const missing = finalTargetKeywords.filter(k => !matched.includes(k));

      // Calculate score with CGPA & backlog boost
      let baseScore = Math.round((matched.length / (finalTargetKeywords.length || 1)) * 80);
      if ((studentProfile?.cgpa || 0) >= (currentOpp?.eligibilityRules?.minCgpa || 7.0)) baseScore += 10;
      if ((studentProfile?.backlogs || 0) === 0) baseScore += 10;
      const finalScore = Math.min(Math.max(baseScore, 35), 96);

      setAnalysisResult({
        score: finalScore,
        matchedKeywords: matched,
        missingKeywords: missing,
        cgpaQualified: (studentProfile?.cgpa || 0) >= (currentOpp?.eligibilityRules?.minCgpa || 7.0),
        roleTitle: currentOpp?.title || 'Target Role',
        companyName: currentOpp?.companyName || 'Target Company',
        recommendedQuestions: [
          `How would you optimize database query latencies in a ${matched[0] || 'relational'} database?`,
          `Describe a challenge you faced when structuring components in ${matched[1] || 'your core stack'}.`,
          `How do you handle edge-case testing and CI/CD pipelines before production release?`
        ]
      });

      setAnalyzing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mongo-green/20 text-mongo-green-dark flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-mongo-green-dark" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 font-display">AI Resume ATS Matcher</h3>
              <p className="text-xs text-gray-500">Scan your student profile against placement drive criteria.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Target Campus Drive</label>
            <select 
              value={selectedOppId}
              onChange={(e) => {
                setSelectedOppId(e.target.value);
                setAnalysisResult(null);
              }}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-mongo-green cursor-pointer"
            >
              {opportunities.map(opp => (
                <option key={opp.id} value={opp.id}>
                  {opp.companyName} — {opp.title} ({opp.salary})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Additional Job Description / Tech Keywords (Optional)</label>
            <input 
              type="text"
              placeholder="e.g. Distributed systems, Next.js, Redis, Docker, System Design..."
              value={customRoleText}
              onChange={(e) => setCustomRoleText(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-mongo-green focus:outline-none"
            />
          </div>

          <button 
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="w-full py-3 bg-mongo-dark text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Zap className="w-4 h-4 text-mongo-green" />
            {analyzing ? 'Analyzing Profile & Resume Keywords...' : 'Run ATS Match Analysis'}
          </button>
        </div>

        {/* Analysis Result */}
        {analysisResult && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4 border-t border-gray-100">
            {/* Score Banner */}
            <div className={`p-5 rounded-2xl border flex items-center justify-between ${
              analysisResult.score >= 75 ? 'bg-green-50 border-green-200' :
              analysisResult.score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">ATS Match Index</span>
                <h4 className="text-2xl font-display font-bold text-gray-900 mt-0.5">
                  {analysisResult.score}% Compatibility
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Target: <strong>{analysisResult.companyName}</strong> ({analysisResult.roleTitle})
                </p>
              </div>

              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-display font-extrabold text-xl shadow-inner ${
                analysisResult.score >= 75 ? 'bg-green-600 text-white' :
                analysisResult.score >= 50 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {analysisResult.score}%
              </div>
            </div>

            {/* Matched vs Missing Keywords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase tracking-wider mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Matched Keywords ({analysisResult.matchedKeywords.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.matchedKeywords.map((k, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-green-100 text-green-800 rounded-lg font-semibold">
                      ✓ {k}
                    </span>
                  ))}
                  {analysisResult.matchedKeywords.length === 0 && (
                    <span className="text-xs text-gray-400">No direct keywords detected</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Missing High-Yield Keywords ({analysisResult.missingKeywords.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.missingKeywords.map((k, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg font-semibold">
                      + {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tailored Interview Practice Questions */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-mongo-dark" />
                <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Tailored Interview Preparation Prompts
                </h5>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {analysisResult.recommendedQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-mongo-green-dark font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AtsMatcherModal;
