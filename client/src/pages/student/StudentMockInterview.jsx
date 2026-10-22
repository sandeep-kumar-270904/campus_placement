import React, { useState, useEffect, useRef } from 'react';
import aiService from '../../services/aiService';
import AiBadge from '../../components/ai/AiBadge';
import {
  MessageSquare,
  Send,
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Layers,
  ChevronRight,
  Shield,
} from 'lucide-react';

export default function StudentMockInterview() {
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Start Form State
  const [setupForm, setSetupForm] = useState({
    company: 'Google',
    role: 'Software Development Engineer',
    roundType: 'Technical',
  });

  // Chat input
  const [answerInput, setAnswerInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.transcript]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await aiService.getMockInterviewHistory();
      setHistory(res.sessions || []);
    } catch (err) {
      console.error('Failed to load mock interview history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setStarting(true);
    setError('');
    try {
      const res = await aiService.startMockInterview(setupForm);
      setActiveSession(res.session);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to initialize mock interview.');
    } finally {
      setStarting(false);
    }
  };

  const handleSendAnswer = async (e) => {
    e.preventDefault();
    if (!answerInput.trim() || sending || !activeSession) return;

    const answer = answerInput.trim();
    setAnswerInput('');
    setSending(true);
    setError('');

    try {
      const res = await aiService.respondMockInterview(activeSession.id || activeSession._id, answer);
      setActiveSession(res.session);
      if (res.session.status === 'Completed') {
        await loadHistory();
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit response.');
    } finally {
      setSending(false);
    }
  };

  const handleSelectHistorySession = async (sessionId) => {
    try {
      const res = await aiService.getMockInterviewSession(sessionId);
      setActiveSession(res.session);
    } catch (err) {
      alert('Failed to load past session details.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AiBadge text="AI Mock Evaluator" />
            <span className="text-xs text-slate-400 font-medium">
              Turn-by-Turn Conversational Practice
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
            AI Mock Interviewer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate realistic technical, HR, system design, and behavioral campus rounds with real-time feedback and rubric scorecards.
          </p>
        </div>

        {activeSession && (
          <button
            onClick={() => setActiveSession(null)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Interview</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Setup or Improvement History */}
        <div className="space-y-6">
          {!activeSession ? (
            /* Setup New Interview Form */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Configure Mock Round
              </h3>
              <p className="text-xs text-slate-400">
                Tailor the interview experience to your target employer and role.
              </p>

              <form onSubmit={handleStartInterview} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Target Company</label>
                  <input
                    type="text"
                    value={setupForm.company}
                    onChange={(e) => setSetupForm({ ...setupForm, company: e.target.value })}
                    required
                    placeholder="e.g. Google, Microsoft, Amazon"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Target Role</label>
                  <input
                    type="text"
                    value={setupForm.role}
                    onChange={(e) => setSetupForm({ ...setupForm, role: e.target.value })}
                    required
                    placeholder="e.g. Software Development Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Interview Round Type</label>
                  <select
                    value={setupForm.roundType}
                    onChange={(e) => setSetupForm({ ...setupForm, roundType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Technical">Technical: Core DSA & CS Fundamentals</option>
                    <option value="System Design">System Design & Distributed Architectures</option>
                    <option value="HR">HR & Culture Fit / Googleyness</option>
                    <option value="Behavioral">Behavioral (STAR Method Stories)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={starting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/20 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{starting ? 'Starting Simulation...' : 'Begin Mock Interview'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Active Session Overview Card */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                Current Active Session
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                {activeSession.role}
              </h3>
              <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                <p>Company: <span className="text-white font-sans font-bold">{activeSession.company}</span></p>
                <p>Round: <span className="text-indigo-400 font-sans font-bold">{activeSession.roundType}</span></p>
                <p>
                  Status:{' '}
                  <span
                    className={`font-sans font-bold ${
                      activeSession.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {activeSession.status}
                  </span>
                </p>
              </div>

              {activeSession.status !== 'Completed' && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-slate-400 text-[11px]">
                  Question {activeSession.currentQuestionIndex || 1} of {activeSession.maxQuestions || 5}
                </div>
              )}
            </div>
          )}

          {/* Past Improvement Progression Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Score Improvement History
            </h3>

            {loadingHistory ? (
              <div className="h-32 bg-slate-950 rounded-xl animate-pulse" />
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No past mock sessions recorded yet. Complete an interview to track performance gains!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {history.map((sess) => {
                  const score = sess.rubricScore?.overallScore ?? null;
                  return (
                    <button
                      key={sess._id}
                      onClick={() => handleSelectHistorySession(sess._id)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 text-left flex items-center justify-between transition group"
                    >
                      <div className="text-xs">
                        <span className="font-bold text-slate-200 group-hover:text-indigo-400 transition block">
                          {sess.company} • {sess.roundType}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(sess.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {score !== null ? (
                        <span
                          className={`font-mono font-bold text-xs ${
                            score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          {score}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-500/80">Incomplete</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Interactive Chat Stream or Scorecard */}
        <div className="lg:col-span-2">
          {!activeSession ? (
            /* Empty State */
            <div className="h-full min-h-[450px] bg-slate-900/40 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Start a Simulation to Practice
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Select your target company and round type on the left to begin your 5-question interview.
              </p>
            </div>
          ) : (
            /* Live Chat or Concluded Scorecard */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {(activeSession.transcript || []).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === 'student' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 mb-1 px-1 font-semibold">
                      {msg.role === 'student' ? 'You (Candidate)' : msg.role === 'ai' ? 'AI Interviewer' : 'System Evaluation'}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'student'
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                          : msg.role === 'ai'
                          ? 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                          : 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 font-bold'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-slate-500 mb-1 px-1 font-semibold">
                      AI Interviewer
                    </span>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-bl-none p-4 text-xs text-indigo-400 animate-pulse flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating response and generating follow-up...</span>
                    </div>
                  </div>
                )}

                {/* Completed Rubric Scorecard Card */}
                {activeSession.status === 'Completed' && activeSession.rubricScore && (
                  <div className="mt-6 p-6 rounded-2xl bg-slate-950 border border-indigo-500/40 shadow-2xl space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-400" />
                          Final Rubric Scorecard
                        </h4>
                        <span className="text-xs text-slate-400">
                          Comprehensive evaluation across 4 standard hiring dimensions
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-emerald-400 font-mono">
                          {activeSession.rubricScore.overallScore}%
                        </span>
                        <span className="text-[10px] text-slate-500 block">Overall Yield</span>
                      </div>
                    </div>

                    {/* 4 Dimension Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block mb-1">Communication</span>
                        <span className="text-lg font-bold text-white font-mono">
                          {activeSession.rubricScore.communication} / 10
                        </span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block mb-1">Correctness</span>
                        <span className="text-lg font-bold text-white font-mono">
                          {activeSession.rubricScore.correctness} / 10
                        </span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block mb-1">Technical Depth</span>
                        <span className="text-lg font-bold text-white font-mono">
                          {activeSession.rubricScore.depth} / 10
                        </span>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block mb-1">Structure</span>
                        <span className="text-lg font-bold text-white font-mono">
                          {activeSession.rubricScore.structure} / 10
                        </span>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Demonstrated Strengths
                        </span>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {(activeSession.strengths || []).map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Growth & Improvement Gaps
                        </span>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {(activeSession.weaknesses || []).map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Study Plan */}
                    {activeSession.studyPlan && activeSession.studyPlan.length > 0 && (
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                        <span className="font-bold text-indigo-300 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          Targeted Study Plan Sprint
                        </span>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {activeSession.studyPlan.map((plan, i) => (
                            <li key={i}>{plan}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input Area (Only when in progress) */}
              {activeSession.status !== 'Completed' ? (
                <form
                  onSubmit={handleSendAnswer}
                  className="p-4 bg-slate-950 border-t border-slate-800 flex items-end gap-3"
                >
                  <textarea
                    rows={2}
                    placeholder="Type your response to the interviewer..."
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    disabled={sending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendAnswer(e);
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={!answerInput.trim() || sending}
                    className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Interview session completed and saved to history.</span>
                  <button
                    onClick={() => setActiveSession(null)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
                  >
                    Start Another Round
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
