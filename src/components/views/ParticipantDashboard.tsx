import React, { useState } from 'react';
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
  Pencil
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { ParticipantAIAssistant } from '../ai/ParticipantAIAssistant';

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
    exchanges,
    enrollments,
    submissions,
    achievements,
    updateProfile,
    openProfileEditor,
    setActiveTab
  } = useYep();
  const { t } = useLanguage();

  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<ProjectSubmission | null>(null);

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
