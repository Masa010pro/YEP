import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useYep } from '../../context/YepContext';
import { useLanguage } from '../../context/LanguageContext';
import { ProjectSubmission, RubricScores, VirtualSession } from '../../types/yep';
import { UserAvatar } from '../common/UserAvatar';
import { MentorAIAssistant } from '../ai/MentorAIAssistant';
import {
  computeParticipantStageSummary,
  computeCohortStageAverage
} from '../../utils/stageAnalytics';
import {
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  Users,
  Video,
  FileText,
  Sliders,
  Send,
  X,
  Sparkles,
  BarChart3,
  TrendingUp,
  Award,
  Target,
  Layers,
  Check,
  Pencil,
  UserCheck
} from 'lucide-react';

export const MentorWorkspace: React.FC = () => {
  const {
    currentUser,
    users,
    exchanges,
    submissions,
    enrollments,
    expressionsOfInterest,
    gradeSubmission,
    addSessionToExchange,
    openProfileEditor
  } = useYep();
  const { t } = useLanguage();

  // Active rubric evaluation modal state
  const [evaluatingSub, setEvaluatingSub] = useState<ProjectSubmission | null>(null);
  const [rubricScores, setRubricScores] = useState<RubricScores>({
    technicalExecution: 4,
    problemSolving: 4,
    practicalImpact: 4,
    presentationClarity: 4
  });
  const [qualitativeFeedback, setQualitativeFeedback] = useState('');
  const [gradeSuccessMsg, setGradeSuccessMsg] = useState<string | null>(null);
  const [activeLevelFilter, setActiveLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('all');

  // Schedule session modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [sessionTargetExchangeId, setSessionTargetExchangeId] = useState('');
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('2026-11-25');
  const [newSessionTime, setNewSessionTime] = useState('17:00–18:30 GMT');
  const [newSessionLink, setNewSessionLink] = useState('https://meet.jit.si/yep-mentor-session');
  const [newSessionAgenda, setNewSessionAgenda] = useState('Mid-cohort architectural review and rubric alignment.');

  if (!currentUser) return null;

  // Filter exchanges assigned to this mentor
  const assignedExchanges = exchanges.filter(e => e.facilitatorId === currentUser.id);
  const assignedExchangeIds = assignedExchanges.map(e => e.id);

  // Submissions for mentor's exchanges
  const relevantSubmissions = submissions.filter(s => assignedExchangeIds.includes(s.exchangeId));
  const pendingQueue = relevantSubmissions.filter(s => s.status === 'under_review' || s.status === 'submitted');
  const gradedQueue = relevantSubmissions.filter(s => s.status === 'graded');

  // Cohort participants analytics & level calculation
  const assignedCohortEnrollments = enrollments.filter(enr => assignedExchangeIds.includes(enr.exchangeId));
  
  const participantLevels = assignedCohortEnrollments.map(enr => {
    const exc = exchanges.find(e => e.id === enr.exchangeId);
    const sub = submissions.find(s => s.participantId === enr.participantId && s.exchangeId === enr.exchangeId);
    let level: 'Beginner' | 'Intermediate' | 'Advanced' = exc?.skillLevel || 'Beginner';
    if (sub?.grade && sub.grade.averageScore >= 4.3) {
      level = 'Advanced';
    } else if (sub?.grade && sub.grade.averageScore >= 3.3) {
      level = level === 'Beginner' ? 'Intermediate' : level;
    }
    return {
      enrollment: enr,
      exchange: exc,
      submission: sub,
      level,
      score: sub?.grade?.averageScore || null,
      progress: enr.progressPercentage
    };
  });

  // Unique participants active across this mentor's cohorts (enrollments or submissions)
  const monitoredParticipants = useMemo(() => {
    const activeIds = new Set<string>([
      ...assignedCohortEnrollments.map(e => e.participantId),
      ...relevantSubmissions.map(s => s.participantId)
    ]);
    const matched = users.filter(u => u.role === 'participant' && activeIds.has(u.id));
    return matched.length > 0 ? matched : users.filter(u => u.role === 'participant');
  }, [users, assignedCohortEnrollments, relevantSubmissions]);

  const participantStageSummaries = useMemo(
    () =>
      monitoredParticipants.map(u =>
        computeParticipantStageSummary(u, enrollments, submissions, exchanges, expressionsOfInterest)
      ),
    [monitoredParticipants, enrollments, submissions, exchanges, expressionsOfInterest]
  );

  const cohortStageAverage = useMemo(
    () => computeCohortStageAverage(participantStageSummaries),
    [participantStageSummaries]
  );

  const selectedParticipantSummary = useMemo(
    () =>
      selectedParticipantId === 'all'
        ? null
        : participantStageSummaries.find(p => p.participantId === selectedParticipantId) || null,
    [selectedParticipantId, participantStageSummaries]
  );

  const totalCohortCount = Math.max(participantStageSummaries.length, 1);
  const beginnerList = participantStageSummaries.filter(p => p.skillLevel === 'Beginner');
  const intermediateList = participantStageSummaries.filter(p => p.skillLevel === 'Intermediate');
  const advancedList = participantStageSummaries.filter(p => p.skillLevel === 'Advanced');

  const beginnerPct = Math.round((beginnerList.length / totalCohortCount) * 100);
  const intermediatePct = Math.round((intermediateList.length / totalCohortCount) * 100);
  const advancedPct = Math.max(0, 100 - beginnerPct - intermediatePct);

  const stageGraphData = useMemo(
    () =>
      cohortStageAverage.stagePoints.map((pt, idx) => ({
        stage: t(pt.shortLabel),
        fullLabel: t(pt.label),
        cohortAverage: pt.completion,
        individualCompletion: selectedParticipantSummary
          ? selectedParticipantSummary.stagePoints[idx]?.completion ?? 0
          : pt.completion
      })),
    [cohortStageAverage, selectedParticipantSummary, t]
  );

  const competencyGraphData = useMemo(
    () =>
      cohortStageAverage.rubricPillars.map((p, idx) => ({
        pillar: t(p.shortPillar),
        cohortAverage: p.score,
        individualScore: selectedParticipantSummary
          ? selectedParticipantSummary.rubricPillars[idx]?.score ?? 0
          : p.score
      })),
    [cohortStageAverage, selectedParticipantSummary, t]
  );

  const participantComparisonData = useMemo(
    () =>
      participantStageSummaries.map(s => ({
        name: s.participantName.split(' ')[0],
        fullName: s.participantName,
        stagePct: s.overallStageProgressPct,
        stageNumber: s.currentStageNumber,
        level: s.skillLevel
      })),
    [participantStageSummaries]
  );

  const openRubricModal = (sub: ProjectSubmission) => {
    setEvaluatingSub(sub);
    setGradeSuccessMsg(null);
    if (sub.grade) {
      setRubricScores(sub.grade.rubricScores);
      setQualitativeFeedback(sub.grade.qualitativeFeedback);
    } else {
      setRubricScores({
        technicalExecution: 4,
        problemSolving: 4,
        practicalImpact: 4,
        presentationClarity: 4
      });
      setQualitativeFeedback(
        'Strong implementation demonstrating good mastery of resilience patterns and clean modular architecture.'
      );
    }
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingSub) return;

    gradeSubmission(evaluatingSub.id, rubricScores, qualitativeFeedback);
    setGradeSuccessMsg('Evaluation submitted successfully! Participant dashboard and audit logs updated.');
    setTimeout(() => {
      setEvaluatingSub(null);
      setGradeSuccessMsg(null);
    }, 1500);
  };

  const currentAverage = (
    (rubricScores.technicalExecution +
      rubricScores.problemSolving +
      rubricScores.practicalImpact +
      rubricScores.presentationClarity) /
    4
  ).toFixed(2);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTargetExchangeId) return;

    addSessionToExchange(sessionTargetExchangeId, {
      title: newSessionTitle,
      date: newSessionDate,
      time: newSessionTime,
      durationMinutes: 90,
      meetingLink: newSessionLink,
      agenda: newSessionAgenda,
      isCompleted: false
    });

    setIsScheduleModalOpen(false);
    setNewSessionTitle('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Mentor Header */}
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
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {t('Mentor / Facilitator')}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {currentUser.titleOrOrg} · {currentUser.region}
              </p>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                {t('Overseeing participant cohorts, synchronous virtual coaching, and assessing capstones against standardized 1–5 rubrics.')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => openProfileEditor(currentUser.id)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{t('Edit Profile')}</span>
            </button>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Schedule Virtual Session')}</span>
            </button>
          </div>
        </div>

        {/* Tabular KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-100 text-xs">
          <div>
            <div className="text-slate-500">{t('Assigned Exchanges')}</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {assignedExchanges.length}
            </div>
            <div className="text-[11px] text-slate-400">{t('Active cohorts')}</div>
          </div>
          <div>
            <div className="text-slate-500">{t('Enrolled Participants')}</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {assignedExchanges.reduce((acc, e) => acc + e.enrolledCount, 0)}
            </div>
            <div className="text-[11px] text-slate-400">{t('Across your cohorts')}</div>
          </div>
          <div>
            <div className="text-slate-500">{t('Pending Review Queue')}</div>
            <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-0.5">
              {pendingQueue.length}
            </div>
            <div className="text-[11px] text-slate-400">{t('Awaiting 1–5 rubric evaluation')}</div>
          </div>
          <div>
            <div className="text-slate-500">{t('Completed Evaluations')}</div>
            <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
              {gradedQueue.length}
            </div>
            <div className="text-[11px] text-slate-400">{t('Graded capstones')}</div>
          </div>
        </div>
      </div>

      {/* Participant Stage, Level & Competency Analytics Graphs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                {t('Participant Stage, Level & Competency Analytics')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedParticipantSummary
                ? `${t('Inspecting individual track for')} ${selectedParticipantSummary.participantName}`
                : t('Viewing cohort average across all monitored participants — select any participant to view alone')}
            </p>
          </div>

          {/* Average of All vs Individual Participant Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setSelectedParticipantId('all')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedParticipantId === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('Average of All')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedParticipantId === 'all' && participantStageSummaries[0]) {
                    setSelectedParticipantId(participantStageSummaries[0].participantId);
                  }
                }}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedParticipantId !== 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('Individual Alone')}
              </button>
            </div>

            <select
              aria-label={t('Select participant scope')}
              value={selectedParticipantId}
              onChange={e => setSelectedParticipantId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">
                {t('All Participants (Cohort Average)')} ({participantStageSummaries.length})
              </option>
              {participantStageSummaries.map(p => (
                <option key={p.participantId} value={p.participantId}>
                  {p.participantName} — {t('Stage')} {p.currentStageNumber}/6 ({t(p.skillLevel)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Scope Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">{t('Active Scope')}</div>
            <div className="font-bold text-slate-900 mt-0.5 truncate">
              {selectedParticipantSummary
                ? selectedParticipantSummary.participantName
                : `${t('Cohort Average')} (${cohortStageAverage.totalParticipants})`}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {selectedParticipantSummary
                ? selectedParticipantSummary.participantRegion
                : t('Aggregated across cohort')}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">{t('Current Stage')}</div>
            <div className="font-bold text-emerald-700 font-mono tabular-nums text-base mt-0.5">
              {selectedParticipantSummary
                ? `${t('Stage')} ${selectedParticipantSummary.currentStageNumber} / 6`
                : `${t('Avg')} ${cohortStageAverage.averageStageNumber} / 6`}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {selectedParticipantSummary
                ? t(selectedParticipantSummary.currentStageLabel)
                : `${cohortStageAverage.overallAveragePct}% ${t('stage track')}`}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">{t('Skill Tier / Level')}</div>
            <div className="font-bold text-slate-900 text-base mt-0.5">
              {selectedParticipantSummary
                ? t(selectedParticipantSummary.skillLevel)
                : `${beginnerPct}% / ${intermediatePct}% / ${advancedPct}%`}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {selectedParticipantSummary
                ? `${selectedParticipantSummary.overallStageProgressPct}% ${t('overall completion')}`
                : `${t('Beginner')} · ${t('Intermediate')} · ${t('Advanced')}`}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500">{t('Rubric Performance')}</div>
            <div className="font-bold text-slate-900 font-mono tabular-nums text-base mt-0.5">
              {selectedParticipantSummary
                ? selectedParticipantSummary.meanRubricScore !== null
                  ? `${selectedParticipantSummary.meanRubricScore} / 5.00`
                  : t('Pending')
                : `${cohortStageAverage.meanCohortRubricScore} / 5.00`}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {selectedParticipantSummary
                ? `${selectedParticipantSummary.gradedCount}/${selectedParticipantSummary.submissionCount} ${t('graded')}`
                : t('Cohort rubric mean')}
            </div>
          </div>
        </div>

        {/* 2-Column Recharts Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 1: Participant Stage Track (6 Stages) */}
          <div className="p-5 bg-slate-50/70 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {selectedParticipantSummary
                      ? `${t('Stage Track')}: ${selectedParticipantSummary.participantName}`
                      : t('Cohort Average Stage Track (Stages 1–6)')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedParticipantSummary
                    ? t('Individual participant stage completion (%) compared to cohort average')
                    : t('Average completion percentage across all 6 YEP pathway stages')}
                </div>
              </div>
              <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                {selectedParticipantSummary
                  ? `${selectedParticipantSummary.overallStageProgressPct}%`
                  : `${cohortStageAverage.overallAveragePct}% ${t('Avg')}`}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stageGraphData} margin={{ top: 10, right: 12, left: -16, bottom: 4 }}>
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
                  {selectedParticipantSummary ? (
                    <>
                      <Bar
                        dataKey="individualCompletion"
                        name={selectedParticipantSummary.participantName}
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
                    </>
                  ) : (
                    <Bar
                      dataKey="cohortAverage"
                      name={t('Cohort Average (%)')}
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                      barSize={28}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graph 2: Level & Rubric Competency Graph */}
          <div className="p-5 bg-slate-50/70 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {selectedParticipantSummary
                      ? `${t('Competency Profile')}: ${selectedParticipantSummary.participantName}`
                      : t('Individual Stage % vs Cohort Rubric Mastery')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedParticipantSummary
                    ? t('4-pillar rubric mastery (1–5) vs cohort average')
                    : t('Participant-by-participant stage track (%) across monitored youth')}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                {selectedParticipantSummary
                  ? t(selectedParticipantSummary.skillLevel)
                  : `${cohortStageAverage.totalParticipants} ${t('participants')}`}
              </span>
            </div>

            <div className="h-64 w-full">
              {selectedParticipantSummary ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={competencyGraphData} margin={{ top: 10, right: 12, left: -16, bottom: 4 }}>
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
                      dataKey="individualScore"
                      name={selectedParticipantSummary.participantName}
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
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={participantComparisonData} margin={{ top: 10, right: 12, left: -16, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
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
                      dataKey="stagePct"
                      name={t('Overall Stage Track (%)')}
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Participant Skill Tier Filter + Selectable Participant Cards */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {t('Inspect Participant Level & Stage Track')}
              </span>
              {selectedParticipantSummary && (
                <button
                  type="button"
                  onClick={() => setSelectedParticipantId('all')}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                >
                  {t('Reset to Average of All')}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-[11px] self-start sm:self-auto">
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setActiveLevelFilter(lvl)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    activeLevelFilter === lvl
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t(lvl)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {participantStageSummaries
              .filter(p => activeLevelFilter === 'All' || p.skillLevel === activeLevelFilter)
              .map(p => {
                const isSelected = selectedParticipantId === p.participantId;
                return (
                  <button
                    key={p.participantId}
                    type="button"
                    onClick={() =>
                      setSelectedParticipantId(prev =>
                        prev === p.participantId ? 'all' : p.participantId
                      )
                    }
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400 ring-1 ring-emerald-300'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        name={p.participantName}
                        role="participant"
                        avatarUrl={p.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate flex items-center gap-1">
                          <span className="truncate">{p.participantName}</span>
                          {isSelected && <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate font-mono tabular-nums">
                          {t('Stage')} {p.currentStageNumber}/6 · {p.overallStageProgressPct}%
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          p.skillLevel === 'Advanced'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : p.skillLevel === 'Intermediate'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {t(p.skillLevel)}
                      </span>
                      <div className="text-[10px] font-mono tabular-nums text-slate-500 mt-0.5">
                        {p.meanRubricScore !== null ? `${p.meanRubricScore} / 5.0` : `${p.submissionCount} sub`}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Facilitator AI Diagnostic & Grouping Assistant */}
      <MentorAIAssistant />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Review Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {t('Unified Project Review Queue')}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('Submissions requiring standardized rubric evaluation and qualitative mentorship')}
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {pendingQueue.length} {t('Pending')}
              </span>
            </div>

            {pendingQueue.length > 0 ? (
              <div className="space-y-3">
                {pendingQueue.map(sub => (
                  <div
                    key={sub.id}
                    className="p-4 border border-amber-200/80 bg-amber-50/30 rounded-xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-slate-800">{sub.participantName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{sub.participantRegion}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                          {sub.title}
                        </h3>
                        <div className="text-xs text-slate-600 font-medium">
                          {sub.exchangeTitle}
                        </div>
                      </div>

                      <button
                        onClick={() => openRubricModal(sub)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{t('Evaluate Rubric')}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                      {sub.description}
                    </p>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200/70">
                      <strong className="text-slate-800">{t('Key Takeaways:')}</strong> {sub.keyTakeaways}
                    </div>

                    {/* Artifact links */}
                    <div className="flex items-center gap-3 text-xs pt-1">
                      {sub.repositoryLink && (
                        <a
                          href={sub.repositoryLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{t('Code Repository')}</span>
                        </a>
                      )}
                      {sub.demoOrArtifactLink && (
                        <a
                          href={sub.demoOrArtifactLink}
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
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p>{t('All submitted capstone projects have been evaluated. Your review queue is clear!')}</p>
              </div>
            )}
          </div>

          {/* Graded Submissions Archive */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              {t('Evaluated Submissions History')} ({gradedQueue.length})
            </h2>
            <div className="space-y-3">
              {gradedQueue.map(sub => (
                <div
                  key={sub.id}
                  className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{sub.title}</div>
                    <div className="text-slate-500 text-[11px]">
                      {sub.participantName} ({sub.participantRegion}) · {sub.exchangeTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      {sub.grade?.averageScore} / 5.00
                    </div>
                    <button
                      onClick={() => openRubricModal(sub)}
                      className="text-xs text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
                    >
                      {t('Edit Grade')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Sessions & Cohort Management */}
        <div className="space-y-6">
          {/* Scheduled Sessions Management */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{t('Facilitated Cohort Sessions')}</span>
              </h2>
            </div>

            <div className="space-y-3">
              {assignedExchanges.flatMap(e =>
                e.sessions.map(s => (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{s.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{e.title}</div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <span>{s.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{s.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{s.agenda}</p>
                    <a
                      href={s.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Video className="w-3 h-3" />
                      <span>{t('Start Virtual Room')}</span>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enrolled Participant Roster */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-600" />
              <span>{t('Assigned Cohort Roster')}</span>
            </h2>
            <div className="space-y-2">
              {assignedCohortEnrollments.map(enr => {
                const partInfo = participantLevels.find(p => p.enrollment.id === enr.id);
                const isSelected = selectedParticipantId === enr.participantId;
                return (
                  <button
                    key={enr.id}
                    type="button"
                    onClick={() =>
                      setSelectedParticipantId(prev =>
                        prev === enr.participantId ? 'all' : enr.participantId
                      )
                    }
                    className={`w-full p-2.5 rounded-lg border flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        name={enr.participantName}
                        role="participant"
                        avatarUrl={users.find(u => u.id === enr.participantId)?.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 truncate">{enr.participantName}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border shrink-0 ${
                            partInfo?.level === 'Advanced' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            partInfo?.level === 'Intermediate' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {partInfo?.level || 'Beginner'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {exchanges.find(e => e.id === enr.exchangeId)?.title.slice(0, 24)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono tabular-nums text-slate-700 text-[11px] font-bold">
                        {enr.progressPercentage}% Progress
                      </span>
                      <div className="w-16 bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1 rounded-full"
                          style={{ width: `${enr.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Rubric Evaluation Modal */}
      {evaluatingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Standardized 1–5 Rubric Evaluation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Candidate: {evaluatingSub.participantName} · {evaluatingSub.title}
                </p>
              </div>
              <button
                onClick={() => setEvaluatingSub(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {gradeSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{gradeSuccessMsg}</span>
                </div>
              )}

              {/* Live Rubric Score Display */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Cumulative Rubric Rating</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                    {currentAverage} / 5.00
                  </div>
                </div>
                <div className="text-right text-xs text-slate-300">
                  <div>Equal 25% weight across 4 core competencies</div>
                  <div className="text-[11px] text-slate-400">Recorded in immutable audit trail</div>
                </div>
              </div>

              {/* Criterion 1: Technical Execution */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-900">
                    1. Technical Execution & Architecture
                  </label>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {rubricScores.technicalExecution} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={rubricScores.technicalExecution}
                  onChange={e =>
                    setRubricScores(prev => ({
                      ...prev,
                      technicalExecution: Number(e.target.value)
                    }))
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 - Non-functional / brittle</span>
                  <span>3 - Proficient & stable</span>
                  <span>5 - Resilient production standard</span>
                </div>
              </div>

              {/* Criterion 2: Problem Solving */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-900">
                    2. Creative Problem Solving & Initiative
                  </label>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {rubricScores.problemSolving} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={rubricScores.problemSolving}
                  onChange={e =>
                    setRubricScores(prev => ({
                      ...prev,
                      problemSolving: Number(e.target.value)
                    }))
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 - Minimal adaptation</span>
                  <span>3 - Context-aware solutions</span>
                  <span>5 - Novel optimization for constraints</span>
                </div>
              </div>

              {/* Criterion 3: Practical Impact */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-900">
                    3. Practical Real-World Impact
                  </label>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {rubricScores.practicalImpact} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={rubricScores.practicalImpact}
                  onChange={e =>
                    setRubricScores(prev => ({
                      ...prev,
                      practicalImpact: Number(e.target.value)
                    }))
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 - Abstract without utility</span>
                  <span>3 - Applicable to local industry</span>
                  <span>5 - Direct transformative value</span>
                </div>
              </div>

              {/* Criterion 4: Presentation Clarity */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-900">
                    4. Presentation Clarity & Documentation
                  </label>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {rubricScores.presentationClarity} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={rubricScores.presentationClarity}
                  onChange={e =>
                    setRubricScores(prev => ({
                      ...prev,
                      presentationClarity: Number(e.target.value)
                    }))
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 - Sparse or missing documentation</span>
                  <span>3 - Clear README and diagrams</span>
                  <span>5 - Exemplary professional artifact</span>
                </div>
              </div>

              {/* Structured Qualitative Feedback */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Structured Qualitative Feedback (Shared with Participant) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={qualitativeFeedback}
                  onChange={e => setQualitativeFeedback(e.target.value)}
                  placeholder="Provide concrete praise and actionable improvement areas for the participant..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEvaluatingSub(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('Publish Graded Evaluation')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900">Schedule Synchronous Session</h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Exchange</label>
                <select
                  value={sessionTargetExchangeId}
                  onChange={e => setSessionTargetExchangeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {assignedExchanges.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={newSessionTitle}
                  onChange={e => setNewSessionTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Architectural Code Walkthrough"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newSessionDate}
                    onChange={e => setNewSessionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time & Timezone</label>
                  <input
                    type="text"
                    required
                    value={newSessionTime}
                    onChange={e => setNewSessionTime(e.target.value)}
                    placeholder="17:00–18:30 GMT"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">External Meeting Link</label>
                <input
                  type="url"
                  required
                  value={newSessionLink}
                  onChange={e => setNewSessionLink(e.target.value)}
                  placeholder="https://meet.jit.si/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Agenda & Instructions</label>
                <textarea
                  rows={2}
                  required
                  value={newSessionAgenda}
                  onChange={e => setNewSessionAgenda(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-xs"
                >
                  Publish Session to Enrolled Youth
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
