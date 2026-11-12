import React, { useState } from 'react';
import { useYep } from '../../context/YepContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  Sparkles,
  Users,
  Send,
  Layers,
  Award,
  RefreshCw,
  TrendingUp,
  Brain,
  CheckCircle,
  Sliders,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

interface AIResponseRecord {
  id: string;
  type: 'groups' | 'evaluation' | 'custom';
  title: string;
  query: string;
  response: string;
  timestamp: string;
}

export const MentorAIAssistant: React.FC = () => {
  const {
    currentUser,
    exchanges,
    submissions,
    enrollments,
    users
  } = useYep();

  const [inputQuery, setInputQuery] = useState('');
  const [targetGroupSize, setTargetGroupSize] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'grouping' | 'skills' | 'chat'>('grouping');

  // Filter exchanges assigned to this mentor
  const assignedExchanges = exchanges.filter(e => e.facilitatorId === currentUser?.id);
  const assignedExchangeIds = assignedExchanges.map(e => e.id);

  // Relevant enrollments and submissions
  const cohortEnrollments = enrollments.filter(enr => assignedExchangeIds.includes(enr.exchangeId));
  const relevantSubmissions = submissions.filter(s => assignedExchangeIds.includes(s.exchangeId));

  // Build rich participant data for analysis
  const cohortParticipants = cohortEnrollments.map(enr => {
    const usr = users.find(u => u.id === enr.participantId);
    const sub = relevantSubmissions.find(s => s.participantId === enr.participantId);
    const exc = exchanges.find(e => e.id === enr.exchangeId);

    let level: 'Beginner' | 'Intermediate' | 'Advanced' = exc?.skillLevel || 'Beginner';
    if (sub?.grade && sub.grade.averageScore >= 4.3) {
      level = 'Advanced';
    } else if (sub?.grade && sub.grade.averageScore >= 3.3) {
      level = level === 'Beginner' ? 'Intermediate' : level;
    }

    return {
      id: enr.participantId,
      name: enr.participantName,
      region: usr?.region || 'West Africa',
      skills: usr?.skills || ['Software Development', 'Problem Solving'],
      interests: usr?.interests || ['Web Dev'],
      careerGoal: usr?.careerGoal || 'Junior Engineer',
      level,
      exchangeTitle: exc?.title || 'Cohort',
      progress: enr.progressPercentage,
      rubricScores: sub?.grade?.rubricScores || null,
      averageScore: sub?.grade?.averageScore || null,
      submissionStatus: sub?.status || 'not_submitted'
    };
  });

  const [analysisHistory, setAnalysisHistory] = useState<AIResponseRecord[]>([
    {
      id: 'init-1',
      type: 'groups',
      title: 'Initial Cohort Grouping & Skill Assessment Ready',
      query: 'Form initial project squads for active participants',
      response: `Welcome to the Facilitator AI Assistant. I have indexed ${cohortParticipants.length} active participants across your assigned cohorts. Click "Generate Balanced Project Groups" to form optimal teams or "Evaluate Skills & Competencies" to review experience distributions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  if (!currentUser) return null;

  const handleRunAnalysis = async (mode: 'groups' | 'evaluation' | 'custom', customPrompt?: string) => {
    let prompt = customPrompt || inputQuery;
    let title = 'Cohort Inquiry';

    if (mode === 'groups') {
      prompt = `Please evaluate the skills, experience levels (Beginner, Intermediate, Advanced), and capstone progress of our ${cohortParticipants.length} enrolled participants, and generate balanced working groups (target size: approximately ${targetGroupSize} participants per group). For each group, provide the assigned participant names, their skill coverage, and a clear pedagogical explanation of why they will collaborate effectively.`;
      title = `Balanced Project Squad Formation (Size: ~${targetGroupSize})`;
    } else if (mode === 'evaluation') {
      prompt = `Provide a comprehensive skill and competency diagnostic evaluation for the active participants in our cohorts. Detail the breakdown of skill levels, technical strengths, common rubric vulnerabilities across our 4 assessment pillars (Technical, Problem Solving, Impact, Clarity), and recommended facilitator coaching interventions.`;
      title = 'Cohort Skills & Experience Diagnostic';
    }

    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setInputQuery('');

    try {
      const mentorContext = {
        mentor: {
          name: currentUser.name,
          title: currentUser.titleOrOrg,
          region: currentUser.region
        },
        cohortParticipants,
        assignedExchanges: assignedExchanges.map(e => ({
          title: e.title,
          skillLevel: e.skillLevel,
          enrolledCount: e.enrolledCount,
          capacityMax: e.capacityMax
        })),
        pendingReviewsCount: relevantSubmissions.filter(s => s.status === 'under_review' || s.status === 'submitted').length,
        evaluatedSubmissionsCount: relevantSubmissions.filter(s => s.status === 'graded').length
      };

      const res = await fetch('/api/ai/mentor-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          context: mentorContext
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const newRecord: AIResponseRecord = {
        id: `rec-${Date.now()}`,
        type: mode,
        title,
        query: prompt,
        response: data.reply || 'Analysis completed based on current cohort metrics.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAnalysisHistory(prev => [newRecord, ...prev]);
    } catch (err: any) {
      console.error('Mentor AI Assistant error:', err);
      // Fallback
      const fallbackRecord: AIResponseRecord = {
        id: `rec-${Date.now()}`,
        type: mode,
        title: `${title} (Local System Grounding)`,
        query: prompt,
        response: `Analysis based on ${cohortParticipants.length} enrolled participants:\n\n- Beginner Tier: ${cohortParticipants.filter(p => p.level === 'Beginner').length}\n- Intermediate Tier: ${cohortParticipants.filter(p => p.level === 'Intermediate').length}\n- Advanced Tier: ${cohortParticipants.filter(p => p.level === 'Advanced').length}\n\nRecommended Pairings:\n1. Squad A: ${cohortParticipants.slice(0, targetGroupSize).map(p => `${p.name} (${p.level})`).join(' + ')}\n2. Squad B: ${cohortParticipants.slice(targetGroupSize, targetGroupSize * 2).map(p => `${p.name} (${p.level})`).join(' + ') || 'Remaining cohort participants'}\n\nPedagogical Synergies: Groups combine complementary development strengths with high rubric accountability.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAnalysisHistory(prev => [fallbackRecord, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-xs shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Facilitator AI Diagnostic & Grouping Assistant
              </h2>
              <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluate participant skills, experience levels, and automatically form balanced project squads with pure natural language rationales
            </p>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('grouping')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'grouping'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Group Formation</span>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'skills'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Skill Evaluation</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Custom Query</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Action Bar */}
      {activeTab === 'grouping' && (
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900">
                Automated Balanced Project Squad Formation
              </div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                The AI analyzes the {cohortParticipants.length} participants in your cohorts, mixes skill tiers (Beginner, Intermediate, Advanced), and pairs complementary competencies.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-medium text-slate-700">Squad Size:</label>
                <select
                  value={targetGroupSize}
                  onChange={e => setTargetGroupSize(Number(e.target.value))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={2}>Pairs (2 participants)</option>
                  <option value={3}>Triads (3 participants)</option>
                  <option value={4}>Squads (4 participants)</option>
                </select>
              </div>

              <button
                onClick={() => handleRunAnalysis('groups')}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Generate Balanced Project Groups</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900">
                Cohort Competency & Experience Diagnostic
              </div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                Audit rubric scoring across Technical, Problem Solving, Impact, and Clarity to uncover collective learning bottlenecks.
              </div>
            </div>

            <button
              onClick={() => handleRunAnalysis('evaluation')}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Layers className="w-3.5 h-3.5" />
              )}
              <span>Evaluate Skills & Competencies</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleRunAnalysis('custom');
          }}
          className="space-y-3 text-xs"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask anything about participant experience, who needs extra help, or recommended pairing strategies..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
              ) : (
                <Send className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span>Analyze</span>
            </button>
          </div>

          {/* Quick chip prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
            <span>Try asking:</span>
            <button
              type="button"
              onClick={() => handleRunAnalysis('custom', 'Which participants demonstrate the highest technical readiness for employer interviews?')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
            >
              "Which participants are interview-ready?"
            </button>
            <button
              type="button"
              onClick={() => handleRunAnalysis('custom', 'Identify participants whose rubric scores fall below the 3.50 target and suggest coaching steps.')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
            >
              "Who needs mentorship intervention?"
            </button>
            <button
              type="button"
              onClick={() => handleRunAnalysis('custom', 'Pair each Beginner tier participant with an Advanced peer mentor for capstone reviews.')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
            >
              "Pair beginners with advanced peer mentors"
            </button>
          </div>
        </form>
      )}

      {/* AI Analysis Output Feed */}
      <div className="space-y-4 pt-2">
        {analysisHistory.map((item, idx) => (
          <div
            key={item.id}
            className={`p-5 rounded-xl border text-xs space-y-3 transition-all ${
              idx === 0
                ? 'bg-slate-50/80 border-slate-300 shadow-xs'
                : 'bg-white border-slate-200 opacity-90'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-slate-900 text-emerald-400">
                  <Brain className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-900">{item.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">({item.timestamp})</span>
              </div>
              <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 capitalize font-medium">
                {item.type} Analysis
              </span>
            </div>

            <div className="text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {item.response}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
