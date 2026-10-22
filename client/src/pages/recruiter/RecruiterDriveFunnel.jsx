import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import recruiterService from '../../services/recruiterService';
import {
  TrendingUp,
  Users,
  Award,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Percent,
  Sparkles,
  BarChart2,
  PieChart,
} from 'lucide-react';

export default function RecruiterDriveFunnel() {
  const { driveId } = useParams();

  const [drive, setDrive] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFunnel();
  }, [driveId]);

  const loadFunnel = async () => {
    setLoading(true);
    setError('');
    try {
      const [driveRes, funnelRes] = await Promise.all([
        recruiterService.getDriveDetails(driveId),
        recruiterService.getDriveFunnel(driveId),
      ]);
      setDrive(driveRes.drive || driveRes);
      setFunnelData(funnelRes.funnel || funnelRes);
    } catch (err) {
      console.error('Failed to load funnel analytics:', err);
      setError(err.response?.data?.error?.message || 'Failed to load drive funnel analytics.');
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    {
      name: 'Applied Candidates',
      key: 'applied',
      color: 'bg-indigo-600',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      count: funnelData?.counts?.applied || 0,
      conversion: '100%',
    },
    {
      name: 'Shortlisted Pool',
      key: 'shortlisted',
      color: 'bg-violet-600',
      textColor: 'text-violet-400',
      borderColor: 'border-violet-500/30',
      count: funnelData?.counts?.shortlisted || 0,
      conversion: funnelData?.conversions?.shortlistRate ? `${funnelData.conversions.shortlistRate}%` : '0%',
    },
    {
      name: 'Technical / Assessment',
      key: 'inProgress',
      color: 'bg-amber-600',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      count: funnelData?.counts?.inProgress || 0,
      conversion: funnelData?.conversions?.interviewRate ? `${funnelData.conversions.interviewRate}%` : '0%',
    },
    {
      name: 'Offers Proposed & Extended',
      key: 'offers',
      color: 'bg-emerald-600',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      count: funnelData?.counts?.offers || 0,
      conversion: funnelData?.conversions?.offerRate ? `${funnelData.conversions.offerRate}%` : '0%',
    },
    {
      name: 'Final Placed / Accepted',
      key: 'placed',
      color: 'bg-teal-500',
      textColor: 'text-teal-400',
      borderColor: 'border-teal-500/30',
      count: funnelData?.counts?.placed || 0,
      conversion: funnelData?.conversions?.placementYield ? `${funnelData.conversions.placementYield}%` : '0%',
    },
  ];

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
            <span>{drive?.companyName || 'Corporate Drive'}</span>
            <span>•</span>
            <span>Hiring Pipeline Efficiency & Conversion Yield</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            Recruitment Funnel Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Stage-by-stage candidate throughput, conversion percentages, and drop-off analysis for {drive?.title || 'this drive'}.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
      ) : (
        <div className="space-y-6">
          {/* Key KPI Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Total Applicants
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">
                  {funnelData?.counts?.applied || 0}
                </span>
                <span className="text-xs text-slate-500">students</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Shortlist Conversion
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-400 font-mono">
                  {funnelData?.conversions?.shortlistRate || 0}%
                </span>
                <span className="text-xs text-slate-500">of applicants</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Offer Acceptance Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  {funnelData?.conversions?.offerRate || 0}%
                </span>
                <span className="text-xs text-slate-500">of interviews</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Overall Pipeline Yield
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-400 font-mono">
                  {funnelData?.conversions?.placementYield || 0}%
                </span>
                <span className="text-xs text-slate-500">hired ratio</span>
              </div>
            </div>
          </div>

          {/* Visual Funnel Graphic */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Candidate Funnel Flow & Drop-offs
            </h3>

            <div className="space-y-4">
              {stages.map((stage, idx) => {
                const widthPercent = Math.max(Math.round((stage.count / maxCount) * 100), 12);

                return (
                  <div key={stage.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                          {idx + 1}
                        </span>
                        {stage.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white font-mono text-sm">
                          {stage.count} candidates
                        </span>
                        <span className={`font-semibold text-xs ${stage.textColor}`}>
                          ({stage.conversion})
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar representation */}
                    <div className="h-8 bg-slate-950 rounded-xl overflow-hidden p-1 border border-slate-800 flex items-center">
                      <div
                        style={{ width: `${widthPercent}%` }}
                        className={`h-full rounded-lg ${stage.color} transition-all duration-700 flex items-center justify-end px-3 shadow-inner`}
                      >
                        <span className="text-[11px] font-black text-white font-mono">
                          {stage.count}
                        </span>
                      </div>
                    </div>

                    {idx < stages.length - 1 && (
                      <div className="flex items-center justify-center py-1">
                        <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Funnel Insights & Summary Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Recruitment Efficiency Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="font-bold text-white block">Shortlist Selectivity</span>
                <p className="text-slate-400">
                  Your team shortlisted {funnelData?.counts?.shortlisted || 0} out of{' '}
                  {funnelData?.counts?.applied || 0} applicants ({funnelData?.conversions?.shortlistRate || 0}%). This demonstrates rigorous academic and skill screening while maintaining an ample candidate bench.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="font-bold text-white block">Interview to Offer Ratio</span>
                <p className="text-slate-400">
                  {funnelData?.counts?.offers || 0} candidates received formal offer proposals from a pool of{' '}
                  {funnelData?.counts?.inProgress || 0} interviewees. High conversion in final rounds signals strong alignment between the job criteria and candidate preparation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
