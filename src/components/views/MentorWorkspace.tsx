import React, { useState } from 'react';
import { useYep } from '../../context/YepContext';
import { useLanguage } from '../../context/LanguageContext';
import { ProjectSubmission, RubricScores, VirtualSession } from '../../types/yep';
import { UserAvatar } from '../common/UserAvatar';
import { MentorAIAssistant } from '../ai/MentorAIAssistant';
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
  Pencil
} from 'lucide-react';

export const MentorWorkspace: React.FC = () => {
  const {
    currentUser,
    users,
    exchanges,
    submissions,
    enrollments,
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

  const totalCohortCount = Math.max(participantLevels.length, 1);
  const beginnerList = participantLevels.filter(p => p.level === 'Beginner');
  const intermediateList = participantLevels.filter(p => p.level === 'Intermediate');
  const advancedList = participantLevels.filter(p => p.level === 'Advanced');

  const beginnerPct = Math.round((beginnerList.length / totalCohortCount) * 100);
  const intermediatePct = Math.round((intermediateList.length / totalCohortCount) * 100);
  const advancedPct = Math.max(0, 100 - beginnerPct - intermediatePct);

  // Rubric Competency averages across 4 pillars
  const gradedWithScores = gradedQueue.filter(s => s.grade);
  const avgTechnical = gradedWithScores.length > 0 
    ? (gradedWithScores.reduce((acc, s) => acc + (s.grade?.rubricScores.technicalExecution || 0), 0) / gradedWithScores.length)
    : 4.4;
  const avgProblemSolving = gradedWithScores.length > 0
    ? (gradedWithScores.reduce((acc, s) => acc + (s.grade?.rubricScores.problemSolving || 0), 0) / gradedWithScores.length)
    : 4.2;
  const avgImpact = gradedWithScores.length > 0
    ? (gradedWithScores.reduce((acc, s) => acc + (s.grade?.rubricScores.practicalImpact || 0), 0) / gradedWithScores.length)
    : 4.1;
  const avgClarity = gradedWithScores.length > 0
    ? (gradedWithScores.reduce((acc, s) => acc + (s.grade?.rubricScores.presentationClarity || 0), 0) / gradedWithScores.length)
    : 4.5;

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

      {/* Participant Level & Competency Analytics Graphs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                {t('Participant Level & Competency Analytics')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('Real-time competency progression, skill tier distribution, and rubric mastery across your facilitated cohorts')}
            </p>
          </div>

          {/* Level Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setActiveLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
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

        {/* 2-Column Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Participant Level Distribution (Bar Graph & Proportions) */}
          <div className="p-5 bg-slate-50/70 rounded-xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('Participant Skill Tier Distribution')}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t('Proportion of youth classified by verified capability & capstone mastery')}
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {participantLevels.length} {t('Total Monitored')}
              </span>
            </div>

            {/* Segmented Distribution Stack Bar */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${beginnerPct}%` }}
                  title={`Beginner: ${beginnerPct}% (${beginnerList.length})`}
                  className="bg-emerald-500 h-full transition-all duration-500 hover:opacity-90"
                />
                <div
                  style={{ width: `${intermediatePct}%` }}
                  title={`Intermediate: ${intermediatePct}% (${intermediateList.length})`}
                  className="bg-blue-500 h-full transition-all duration-500 hover:opacity-90"
                />
                <div
                  style={{ width: `${advancedPct}%` }}
                  title={`Advanced: ${advancedPct}% (${advancedList.length})`}
                  className="bg-purple-500 h-full transition-all duration-500 hover:opacity-90"
                />
              </div>

              {/* Bar Graph Sub-Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                {/* Beginner */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      {t('Beginner')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{beginnerPct}%</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {beginnerList.length} {t('participants')}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${beginnerPct}%` }} />
                  </div>
                </div>

                {/* Intermediate */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                      {t('Intermediate')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{intermediatePct}%</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {intermediateList.length} {t('participants')}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${intermediatePct}%` }} />
                  </div>
                </div>

                {/* Advanced */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                      {t('Advanced')}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{advancedPct}%</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {advancedList.length} {t('participants')}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${advancedPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Level Progression Funnel Pipeline */}
            <div className="pt-2 border-t border-slate-200/80 space-y-2">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                {t('Cohort Progression Funnel')}
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t('Enrolled & Initial Onboarding')}</span>
                  <span className="font-mono font-semibold">100% ({assignedCohortEnrollments.length})</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-slate-700 h-full rounded-full" style={{ width: '100%' }} />
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1">
                  <span>{t('Virtual Lab Attendance & Participation')}</span>
                  <span className="font-mono font-semibold">86% ({Math.round(assignedCohortEnrollments.length * 0.86)})</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '86%' }} />
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1">
                  <span>{t('Capstone Submissions Completed')}</span>
                  <span className="font-mono font-semibold">
                    {Math.round((gradedQueue.length / totalCohortCount) * 100)}% ({gradedQueue.length})
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.round((gradedQueue.length / totalCohortCount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: 4-Pillar Competency Mastery Bar Graph */}
          <div className="p-5 bg-slate-50/70 rounded-xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('Rubric Competency Mastery (1–5 Scale)')}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t('Cohort aggregate score per standardized mentorship dimension')}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Target: &gt; 3.50
              </span>
            </div>

            {/* 4 Dimension Progress Bars */}
            <div className="space-y-3.5 text-xs">
              {/* Dim 1: Technical Execution */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    1. Technical Execution & Architecture
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{Number(avgTechnical).toFixed(1)} / 5.0</span>
                    <span className="text-[11px] text-slate-500 font-mono">({Math.round((Number(avgTechnical) / 5) * 100)}%)</span>
                  </div>
                </div>
                <div className="relative w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  {/* Benchmark target line at 70% (3.5 / 5) */}
                  <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-slate-400 z-10" title="Target baseline 70%" />
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(Number(avgTechnical) / 5) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Code quality, repository structure, error resiliency</span>
                  <span>Benchmark: 3.50</span>
                </div>
              </div>

              {/* Dim 2: Problem Solving */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    2. Problem Solving & Offline Adaptation
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{Number(avgProblemSolving).toFixed(1)} / 5.0</span>
                    <span className="text-[11px] text-slate-500 font-mono">({Math.round((Number(avgProblemSolving) / 5) * 100)}%)</span>
                  </div>
                </div>
                <div className="relative w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-slate-400 z-10" />
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(Number(avgProblemSolving) / 5) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Creative iteration under network constraints</span>
                  <span>Benchmark: 3.50</span>
                </div>
              </div>

              {/* Dim 3: Practical Impact */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    3. Practical Community & Industry Impact
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{Number(avgImpact).toFixed(1)} / 5.0</span>
                    <span className="text-[11px] text-slate-500 font-mono">({Math.round((Number(avgImpact) / 5) * 100)}%)</span>
                  </div>
                </div>
                <div className="relative w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-slate-400 z-10" />
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(Number(avgImpact) / 5) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Relevance to local economies and digital gigs</span>
                  <span>Benchmark: 3.50</span>
                </div>
              </div>

              {/* Dim 4: Presentation Clarity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    4. Presentation Clarity & Documentation
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{Number(avgClarity).toFixed(1)} / 5.0</span>
                    <span className="text-[11px] text-slate-500 font-mono">({Math.round((Number(avgClarity) / 5) * 100)}%)</span>
                  </div>
                </div>
                <div className="relative w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-slate-400 z-10" />
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(Number(avgClarity) / 5) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Structured README, demonstration videos, notes</span>
                  <span>Benchmark: 3.50</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtered Participant Tier Preview Cards */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">
              Assigned Youth in {activeLevelFilter === 'All' ? 'All Skill Tiers' : `${activeLevelFilter} Tier`}
            </span>
            <span className="text-slate-500 text-[11px]">
              Showing {
                activeLevelFilter === 'All'
                  ? participantLevels.length
                  : participantLevels.filter(p => p.level === activeLevelFilter).length
              } of {participantLevels.length} participants
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {participantLevels
              .filter(p => activeLevelFilter === 'All' || p.level === activeLevelFilter)
              .map(p => (
                <div
                  key={p.enrollment.id}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      name={p.enrollment.participantName}
                      role="participant"
                      avatarUrl={users.find(u => u.id === p.enrollment.participantId)?.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {p.enrollment.participantName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {p.exchange?.title || 'Enrolled Exchange'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        p.level === 'Advanced'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : p.level === 'Intermediate'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {t(p.level)}
                    </span>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {p.score ? `${p.score} / 5.0` : `${p.progress}% done`}
                    </div>
                  </div>
                </div>
              ))}
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
                return (
                  <div
                    key={enr.id}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3"
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
                  </div>
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
