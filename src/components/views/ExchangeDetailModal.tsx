import React, { useState } from 'react';
import { useYep } from '../../context/YepContext';
import { VirtualExchange } from '../../types/yep';
import { UserAvatar } from '../common/UserAvatar';
import {
  X,
  Calendar,
  Users,
  CheckCircle,
  Download,
  Video,
  Award,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ExchangeDetailModalProps {
  exchange: VirtualExchange | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmitModal: (exchange: VirtualExchange) => void;
  onOpenOfflinePackModal: (exchange: VirtualExchange) => void;
}

export const ExchangeDetailModal: React.FC<ExchangeDetailModalProps> = ({
  exchange,
  isOpen,
  onClose,
  onOpenSubmitModal,
  onOpenOfflinePackModal
}) => {
  const { currentUser, enrollments, enrollInExchange } = useYep();
  const [enrollMsg, setEnrollMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen || !exchange) return null;

  const isEnrolled = currentUser
    ? enrollments.some(
        e => e.participantId === currentUser.id && e.exchangeId === exchange.id && e.status === 'active'
      )
    : false;

  const isFull = exchange.enrolledCount >= exchange.capacityMax;
  const capacityPct = Math.round((exchange.enrolledCount / exchange.capacityMax) * 100);

  const handleEnroll = () => {
    setEnrollMsg(null);
    const res = enrollInExchange(exchange.id);
    setEnrollMsg({
      success: res.success,
      text: res.message
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Banner with Scrim Overlay */}
        <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
          <img
            src={exchange.bannerImage}
            alt={exchange.title}
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner content */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium mb-1">
              <span>{exchange.theme}</span>
              <span aria-hidden="true">·</span>
              <span>{exchange.format}</span>
              <span aria-hidden="true">·</span>
              <span>{exchange.skillLevel}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              {exchange.title}
            </h1>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto text-xs sm:text-sm">
          {enrollMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                enrollMsg.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{enrollMsg.text}</span>
            </div>
          )}

          {/* Key metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-slate-500 text-[11px]">Schedule</div>
              <div className="font-semibold text-slate-800 mt-0.5">{exchange.scheduleSummary}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Duration</div>
              <div className="font-semibold text-slate-800 mt-0.5">{exchange.startDate} to {exchange.endDate}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Facilitator</div>
              <div className="font-semibold text-slate-800 mt-0.5">{exchange.facilitatorName}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Cohort Capacity</div>
              <div className="font-semibold text-slate-800 mt-0.5 tabular-nums">
                {exchange.enrolledCount} / {exchange.capacityMax} seats ({capacityPct}%)
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Enrollment Capacity Rule</span>
              </span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {exchange.capacityMax - exchange.enrolledCount} seats remaining
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isFull ? 'bg-rose-600' : capacityPct > 80 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, capacityPct)}%` }}
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Curriculum Overview
            </h2>
            <p className="text-slate-700 leading-relaxed">{exchange.summary}</p>
          </div>

          {/* Learning Outcomes */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Measurable Learning Outcomes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {exchange.learningOutcomes.map((outcome, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/80 text-xs text-slate-800"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Synchronous Sessions */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Synchronous Virtual Cohort Sessions
            </h2>
            <div className="space-y-2">
              {exchange.sessions.map(session => (
                <div
                  key={session.id}
                  className="p-3 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white"
                >
                  <div>
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm">{session.title}</div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{session.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{session.time}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{session.agenda}</p>
                  </div>

                  {isEnrolled && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-medium border border-emerald-200 transition-colors shrink-0"
                    >
                      <Video className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Join Call</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Facilitator Bio */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-4">
            <UserAvatar
              name={exchange.facilitatorName}
              role="mentor"
              size="lg"
            />
            <div>
              <div className="font-semibold text-slate-900 text-xs sm:text-sm">{exchange.facilitatorName}</div>
              <div className="text-xs text-slate-500">
                {exchange.facilitatorTitle} · {exchange.facilitatorOrg}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Appointed subject-matter expert guiding weekly sessions, peer code reviews, and assessing participant practical capstone work using standardized 1–5 rubrics.
              </p>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => onOpenOfflinePackModal(exchange)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Offline Study Bundle</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>

            {isEnrolled ? (
              <button
                onClick={() => onOpenSubmitModal(exchange)}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Submit Capstone Project</span>
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={isFull || exchange.status !== 'open'}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 ${
                  isFull || exchange.status !== 'open'
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isFull ? 'Cohort Full' : 'Enroll in Exchange'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
