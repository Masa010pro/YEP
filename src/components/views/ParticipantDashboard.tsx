import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useYep } from '../../context/YepContext';
import { useLanguage } from '../../context/LanguageContext';
import { VirtualExchange, ProjectSubmission } from '../../types/yep';
import {
  Calendar,
  Clock,
  Video,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Send,
  Download,
  AlertTriangle,
  FileCheck,
  Bot,
  Sparkles,
  Pencil,
  TrendingUp,
  Target
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ParticipantAIAssistant } from '../ai/ParticipantAIAssistant';
import {
  computeParticipantStageSummary,
  computeCohortStageAverage
} from '../../utils/stageAnalytics';

interface ParticipantDashboardProps {
  onSelectExchange: (exchange: VirtualExchange) => void;
  onOpenSubmitModal: (exchange: VirtualExchange) => void;
  onOpenOfflinePack: (exchange: VirtualExchange) => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  onSelectExchange,
  onOpenSubmitModal,
  onOpenOfflinePack
}) => {
  const {
    currentUser,
    users,
    exchanges,
    enrollments,
    submissions,
    expressionsOfInterest,
    achievements,
    updateProfile,
    openProfileEditor,
    setActiveTab
  } = useYep();
  const { t } = useLanguage();

  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<ProjectSubmission | null>(null);

  const stageAnalytics = useMemo(() => {
    if (!currentUser) return null;
    const allParticipants = users.filter(u => u.role === 'participant');
    const allSummaries = allParticipants.map(u =>
      computeParticipantStageSummary(u, enrollments, submissions, exchanges, expressionsOfInterest)
    );
    const currentSummary =
      allSummaries.find(s => s.participantId === currentUser.id) ||
      computeParticipantStageSummary(currentUser, enrollments, submissions, exchanges, expressionsOfInterest);
    const cohortAverage = computeCohortStageAverage(allSummaries);

    const stageChartData = currentSummary.stagePoints.map((pt, idx) => ({
      stage: t(pt.shortLabel),
      fullLabel: t(pt.label),
      participantCompletion: pt.completion,
      cohortAverage: cohortAverage.stagePoints[idx]?.completion ?? 0
    }));

    const rubricChartData = currentSummary.rubricPillars.map((p, idx) => ({
      pillar: t(p.shortPillar),
      participantScore: p.score,
      cohortAverage: cohortAverage.rubricPillars[idx]?.score ?? 0
    }));

    return {
      currentSummary,
      cohortAverage,
      stageChartData,
      rubricChartData
    };
  }, [currentUser, users, enrollments, submissions, exchanges, expressionsOfInterest, t]);

  if (!currentUser) return null;

  // Active user's enrollments
  const userEnrollments = enrollments.filter(e => e.participantId === currentUser.id && e.status === 'active');
  const enrolledExchangeIds = userEnrollments.map(e => e.exchangeId);
  const enrolledExchanges = exchanges.filter(e => enrolledExchangeIds.includes(e.id));

  // Submissions by user
  const userSubmissions = submissions.filter(s => s.participantId === currentUser.id);
  const pendingSubmissions = userSubmissions.filter(s => s.status === 'under_review' || s.status === 'submitted');
  const gradedSubmissions = userSubmissions.filter(s => s.status === 'graded');

  // Upcoming sessions from enrolled exchanges
  const upcomingSessions = enrolledExchanges
    .flatMap(e => e.sessions.map(s => ({ ...s, exchangeTitle: e.title, exchangeId: e.id })))
    .filter(s => !s.isCompleted)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Recommended exchanges based on declared interests
  const recommendedExchanges = exchanges
    .filter(e => !enrolledExchangeIds.includes(e.id))
    .filter(e => currentUser.interests.some(interest => e.theme.toLowerCase().includes(interest.toLowerCase())))
    .slice(0, 3);

  const meanRubricScore = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((acc, s) => acc + (s.grade?.averageScore || 0), 0) / gradedSubmissions.length).toFixed(2)
    : 'N/A';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Participant Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <UserAvatar
              name={currentUser.name}
              role={currentUser.role}
              avatarUrl={currentUser.avatarUrl}
              size="xl"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Participant (Age {currentUser.age || 22})
                </span>
                <button
                  type="button"
                  onClick={() => openProfileEditor(currentUser.id)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>{t('Edit Profile')}</span>
                </button>
              </div>
              <p className="text-xs text-slate-600">
                {currentUser.titleOrOrg || 'Digital Learner'} · {currentUser.region}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                <span className="font-medium text-slate-700">{t('Skills:')}</span>
                {currentUser.skills.slice(0, 4).map((sk, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Explicit Consent Control Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs max-w-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('Partner Data Consent')}</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentUser.consentDataSharing}
                  onChange={e => updateProfile({ consentDataSharing: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {currentUser.consentDataSharing
                ? t('Consent Granted: Verified capstone evidence and rubric ratings will be shared with prospective employers on the Partner Board.')
                : t('Consent Withheld: No personal portfolio evidence or rubric scores are visible to external employers by default.')}
            </p>
          </div>
        </div>

        {/* Metric Strip (Tabular Figures) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-100 text-xs">
          <div>
            <div className="text-slate-500">{t('Active Cohorts')}</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5 font-mono">
              {userEnrollments.length}
            </div>
            <div className="text-[11px] text-slate-400">{t('Virtual exchanges')}</div>
          </div>
          <div>
            <div className="text-slate-500">{t('Graded Capstones')}</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5 font-mono">
              {gradedSubmissions.length}
            </div>
            <div className="text-[11px] text-slate-400">{t('Evaluated by mentors')}</div>
          </div>
          <div>
            <div className="text-slate-500">{t('Mean Rubric Rating')}</div>
            <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-0.5 font-mono">
              {meanRubricScore} {meanRubricScore !== 'N/A' && '/ 5.00'}
            </div>
            <div className="text-[11px] text-slate-400">{t('Standardized rubric')}</div>
          </div>
          <div>
            <div className="text-slate-500">{t('Earned Milestones')}</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5 font-mono">
              {achievements.length}
            </div>
            <div className="text-[11px] text-slate-400">{t('Verified credentials')}</div>
          </div>
        </div>
      </div>

      {/* Participant Current Stage & Track Graphs */}
      {stageAnalytics && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {t('My Current Stage & Learning Track')}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('Live progression across all 6 YEP pathway stages compared against the cohort baseline')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold font-mono tabular-nums">
                {t('Stage')} {stageAnalytics.currentSummary.currentStageNumber} / 6 · {t(stageAnalytics.currentSummary.currentStageLabel)}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                {t('Tier')}: {t(stageAnalytics.currentSummary.skillLevel)}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-semibold font-mono tabular-nums">
                {stageAnalytics.currentSummary.overallStageProgressPct}% {t('Overall')}
              </span>
            </div>
          </div>

          {/* 6-Stage Horizontal Milestone Track */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {stageAnalytics.currentSummary.stagePoints.map(pt => {
              const isCompleted = pt.completion >= 100;
              const isCurrent = pt.stageNumber === stageAnalytics.currentSummary.currentStageNumber;
              return (
                <div
                  key={pt.key}
                  className={`p-3 rounded-xl border text-xs transition-colors ${
                    isCurrent
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : isCompleted
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide ${
                        isCurrent
                          ? 'text-emerald-800'
                          : isCompleted
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {t('Stage')} {pt.stageNumber}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] font-bold text-slate-900">
                      {pt.completion}%
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 mt-1 truncate">
                    {t(pt.label)}
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCurrent
                          ? 'bg-emerald-600'
                          : isCompleted
                          ? 'bg-slate-800'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${pt.completion}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2-Column Recharts Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph 1: Stage Progression Track vs Cohort Average */}
            <div className="p-4 sm:p-5 bg-slate-50/70 rounded-xl border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {t('Stage Completion Track vs Cohort Average (%)')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {t('Your stage milestones compared with all active participants')}
                  </p>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {t('Cohort Avg')}: {stageAnalytics.cohortAverage.overallAveragePct}%
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={stageAnalytics.stageChartData} margin={{ top: 10, right: 12, left: -16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="stage"
                      tick={{ fontSize: 11, fill: '#475569' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar
                      dataKey="participantCompletion"
                      name={t('Your Stage Progress')}
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                      barSize={26}
                    />
                    <Line
                      type="monotone"
                      dataKey="cohortAverage"
                      name={t('Cohort Average')}
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#2563eb' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graph 2: 4-Pillar Rubric Competency vs Cohort Average */}
            <div className="p-4 sm:p-5 bg-slate-50/70 rounded-xl border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('Rubric Competency Track (1–5 Scale)')}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {stageAnalytics.currentSummary.meanRubricScore !== null
                      ? t('Based on mentor rubric evaluations vs cohort mean')
                      : t('Formative readiness trajectory ahead of formal rubric grading')}
                  </p>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  {stageAnalytics.currentSummary.meanRubricScore !== null
                    ? `${stageAnalytics.currentSummary.meanRubricScore} / 5.00`
                    : t('Pending Grade')}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageAnalytics.rubricChartData} margin={{ top: 10, right: 12, left: -16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="pillar"
                      tick={{ fontSize: 11, fill: '#475569' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[0, 1, 2, 3, 4, 5]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar
                      dataKey="participantScore"
                      name={t('Your Score')}
                      fill="#0f172a"
                      radius={[4, 4, 0, 0]}
                      barSize={22}
                    />
                    <Bar
                      dataKey="cohortAverage"
                      name={t('Cohort Average')}
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                      barSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participant AI Advisor & Opportunity Matcher Spotlight */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-sm border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('AI Project & Opportunity Advisor')}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            {t('Ask questions & match any system opportunities or learning projects in natural language')}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Need guidance matching partner openings with your skills ({currentUser.skills.slice(0, 3).join(', ')}), exploring virtual exchanges, or understanding capstone rubric evaluations? The AI advisor is grounded in active platform data.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="text-[11px] text-emerald-300 font-mono bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg">
            {t('Use floating advisor anytime ↘')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active Exchanges & Submissions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Exchanges */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {t('My Enrolled Exchanges')}
              </h2>
              <button
                onClick={() => setActiveTab('exchanges')}
                className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 transition-colors cursor-pointer"
              >
                {t('Browse All Catalogue →')}
              </button>
            </div>

            {enrolledExchanges.length > 0 ? (
              <div className="space-y-3">
                {enrolledExchanges.map(exchange => {
                  const enrollment = userEnrollments.find(e => e.exchangeId === exchange.id);
                  const hasSubmitted = submissions.some(
                    s => s.participantId === currentUser.id && s.exchangeId === exchange.id
                  );

                  return (
                    <div
                      key={exchange.id}
                      className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{exchange.theme}</span>
                          <span aria-hidden="true">·</span>
                          <span>{exchange.format}</span>
                        </div>
                        <h3
                          onClick={() => onSelectExchange(exchange)}
                          className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          {exchange.title}
                        </h3>
                        <div className="text-xs text-slate-600">
                          Facilitator: {exchange.facilitatorName} ({exchange.facilitatorOrg})
                        </div>

                        {/* Progress */}
                        <div className="pt-2 flex items-center gap-3 text-xs">
                          <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${enrollment?.progressPercentage || 10}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums text-slate-500 text-[11px]">
                            {enrollment?.progressPercentage || 10}% Progress
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onOpenOfflinePack(exchange)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1"
                          title="Offline notes"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">{t('Notes')}</span>
                        </button>

                        <button
                          onClick={() => onOpenSubmitModal(exchange)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs ${
                            hasSubmitted
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{hasSubmitted ? t('Update Submission') : t('Submit Capstone')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-slate-400" />
                <p>{t('You are not currently enrolled in any virtual exchanges.')}</p>
                <button
                  onClick={() => setActiveTab('exchanges')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer inline-block"
                >
                  {t('Explore Open Cohorts')}
                </button>
              </div>
            )}
          </div>

          {/* Submission Queue & Graded Rubric Feedback */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {t('Project Submissions & Mentor Feedback')}
              </h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {userSubmissions.length} {t('Total Submissions')}
              </span>
            </div>

            {userSubmissions.length > 0 ? (
              <div className="space-y-3">
                {userSubmissions.map(submission => (
                  <div
                    key={submission.id}
                    className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{submission.exchangeTitle}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                          {submission.title}
                        </h4>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {submission.status === 'graded' ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-900 font-semibold rounded-md text-xs">
                            <Award className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="font-mono tabular-nums">{submission.grade?.averageScore} / 5.00</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-medium rounded-md text-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>{t('In Mentor Review Queue')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {submission.description}
                    </p>

                    {/* Graded Feedback Card Details */}
                    {submission.grade && (
                      <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-xs space-y-2.5">
                        <div className="flex items-center justify-between text-slate-700 font-medium">
                          <span>{t('Standardized 1–5 Rubric Evaluation')}</span>
                          <span className="text-[11px] text-slate-500">
                            Evaluated by {submission.grade.mentorName}
                          </span>
                        </div>

                        {/* 4 Rubric dimensions */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                            <div className="text-slate-500">{t('Technical Execution')}</div>
                            <div className="font-mono font-bold text-slate-900 tabular-nums">
                              {submission.grade.rubricScores.technicalExecution} / 5
                            </div>
                          </div>
                          <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                            <div className="text-slate-500">{t('Problem Solving')}</div>
                            <div className="font-mono font-bold text-slate-900 tabular-nums">
                              {submission.grade.rubricScores.problemSolving} / 5
                            </div>
                          </div>
                          <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                            <div className="text-slate-500">{t('Practical Impact')}</div>
                            <div className="font-mono font-bold text-slate-900 tabular-nums">
                              {submission.grade.rubricScores.practicalImpact} / 5
                            </div>
                          </div>
                          <div className="p-2 bg-slate-50 rounded border border-slate-200/60">
                            <div className="text-slate-500">{t('Presentation Clarity')}</div>
                            <div className="font-mono font-bold text-slate-900 tabular-nums">
                              {submission.grade.rubricScores.presentationClarity} / 5
                            </div>
                          </div>
                        </div>

                        {/* Qualitative Mentor Comment */}
                        <div className="text-xs text-slate-700 bg-emerald-50/60 p-2.5 rounded border border-emerald-100">
                          <span className="font-semibold text-emerald-950 block mb-0.5">{t('Mentor Qualitative Feedback:')}</span>
                          <p className="leading-relaxed italic">"{submission.grade.qualitativeFeedback}"</p>
                        </div>
                      </div>
                    )}

                    {/* Artifact Links */}
                    <div className="flex items-center gap-3 text-xs pt-1">
                      {submission.repositoryLink && (
                        <a
                          href={submission.repositoryLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{t('Code Repository')}</span>
                        </a>
                      )}
                      {submission.demoOrArtifactLink && (
                        <a
                          href={submission.demoOrArtifactLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{t('Live Artifact Demo')}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                {t('No project submissions yet. Complete assignments in your enrolled exchanges to submit for mentor evaluation.')}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Sessions & Recommendations */}
        <div className="space-y-6">
          {/* Upcoming Synchronous Sessions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{t('Upcoming Virtual Sessions')}</span>
              </h2>
            </div>

            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map(session => (
                  <div
                    key={session.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{session.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{session.exchangeTitle}</div>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{session.time}</span>
                      </div>
                    </div>

                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t('Join Live Session')}</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                {t('No upcoming cohort sessions scheduled right now.')}
              </div>
            )}
          </div>

          {/* Recommended Exchanges Based on Interests */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              {t('Recommended for You')}
            </h2>
            <div className="space-y-3">
              {recommendedExchanges.map(exc => (
                <div
                  key={exc.id}
                  onClick={() => onSelectExchange(exc)}
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-colors cursor-pointer text-xs space-y-1.5"
                >
                  <div className="text-[11px] text-emerald-800 font-semibold">{exc.theme}</div>
                  <div className="font-bold text-slate-900 line-clamp-1">{exc.title}</div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>{exc.format}</span>
                    <span className="text-emerald-700 font-medium">{t('View Details →')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements & Digital Credentials */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{t('Earned Badges & Milestones')}</span>
            </h2>
            <div className="space-y-2 text-xs">
              {achievements.map(ach => (
                <div
                  key={ach.id}
                  className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50 flex items-start gap-2.5"
                >
                  <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{ach.title}</div>
                    <div className="text-[11px] text-slate-500 leading-snug">{ach.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grounded Participant AI Advisor Floating Assistant */}
      <ParticipantAIAssistant />
    </div>
  );
};
