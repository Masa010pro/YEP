import React, { useState } from 'react';
import { useYep } from '../../context/YepContext';
import { useLanguage } from '../../context/LanguageContext';
import { VirtualExchange, ExchangeTheme, SkillLevel, ExchangeFormat } from '../../types/yep';
import { UserAvatar } from '../common/UserAvatar';
import {
  Search,
  Users,
  Calendar,
  CheckCircle,
  Download,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface ExchangeCatalogViewProps {
  onSelectExchange: (exchange: VirtualExchange) => void;
  onOpenOfflinePack: (exchange: VirtualExchange) => void;
}

export const ExchangeCatalogView: React.FC<ExchangeCatalogViewProps> = ({
  onSelectExchange,
  onOpenOfflinePack
}) => {
  const { exchanges, enrollments, currentUser, enrollInExchange, isLowBandwidthMode } = useYep();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [enrollmentNotification, setEnrollmentNotification] = useState<{
    id: string;
    success: boolean;
    msg: string;
  } | null>(null);

  const themes: ExchangeTheme[] = [
    'Cloud & Web Dev',
    'AI & Data Analytics',
    'Green Tech & Agritech',
    'UI/UX & Creative Media',
    'Digital Growth & Product',
    'Civic Tech & Social Innovation'
  ];

  const filteredExchanges = exchanges.filter(exc => {
    const matchesSearch =
      exc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exc.facilitatorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTheme = selectedTheme === 'all' || exc.theme === selectedTheme;
    const matchesLevel = selectedLevel === 'all' || exc.skillLevel === selectedLevel;
    const matchesFormat = selectedFormat === 'all' || exc.format === selectedFormat;
    return matchesSearch && matchesTheme && matchesLevel && matchesFormat;
  });

  const handleQuickEnroll = (e: React.MouseEvent, exchangeId: string) => {
    e.stopPropagation();
    const res = enrollInExchange(exchangeId);
    setEnrollmentNotification({
      id: exchangeId,
      success: res.success,
      msg: res.message
    });
    setTimeout(() => {
      setEnrollmentNotification(null);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Section Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-emerald-800 tracking-wide uppercase mb-1">
              Virtual Exchange Discovery
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {t('Virtual Exchanges & Learning Cohorts')}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Capacity-governed virtual cohorts delivering practical technical skills, synchronous facilitator mentorship, and asynchronous offline bundles for intermittent connectivity.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
            <span>{filteredExchanges.length} Exchanges Available</span>
            <span aria-hidden="true">·</span>
            <span>Capacity Enforced</span>
          </div>
        </div>
      </div>

      {/* Global Toast if quick enrolled */}
      {enrollmentNotification && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            enrollmentNotification.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {enrollmentNotification.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{enrollmentNotification.msg}</span>
          </div>
          <button
            onClick={() => setEnrollmentNotification(null)}
            className="text-xs font-medium underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by exchange topic, skill, keywords, or facilitator name..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Filter bars (Buttons / Segmented Tabs following §1.A) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium mr-1">{t('Theme:')}</span>
          <button
            onClick={() => setSelectedTheme('all')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              selectedTheme === 'all'
                ? 'bg-slate-900 text-white font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('All Themes')}
          </button>
          {themes.map(tTheme => (
            <button
              key={tTheme}
              onClick={() => setSelectedTheme(tTheme)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedTheme === tTheme
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tTheme}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">{t('Level:')}</span>
            {(['all', 'Beginner', 'Intermediate', 'Advanced'] as (string | SkillLevel)[]).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-emerald-100 text-emerald-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl === 'all' ? t('All') : t(lvl)}
              </button>
            ))}
          </div>

          {/* Format Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">{t('Format:')}</span>
            {(['all', '4-Week Cohort', 'Virtual Bootcamp', 'Weekend Sprint'] as (string | ExchangeFormat)[]).map(fmt => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  selectedFormat === fmt
                    ? 'bg-emerald-100 text-emerald-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fmt === 'all' ? t('All') : fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exchange Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExchanges.map(exchange => {
          const isEnrolled = currentUser
            ? enrollments.some(
                e => e.participantId === currentUser.id && e.exchangeId === exchange.id && e.status === 'active'
              )
            : false;
          const isFull = exchange.enrolledCount >= exchange.capacityMax;
          const seatsLeft = exchange.capacityMax - exchange.enrolledCount;
          const capacityPct = Math.round((exchange.enrolledCount / exchange.capacityMax) * 100);

          return (
            <div
              key={exchange.id}
              onClick={() => onSelectExchange(exchange)}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all flex flex-col cursor-pointer"
            >
              {/* Card Image Banner (conditionally simplified in low-bandwidth mode) */}
              {!isLowBandwidthMode ? (
                <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={exchange.bannerImage}
                    alt={exchange.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Status label without pill sandwich */}
                  <div className="absolute top-3 right-3 text-[11px] font-semibold text-white bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded">
                    {isFull ? 'Cohort Full' : `${seatsLeft} Seats Open`}
                  </div>

                  {/* Clean unboxed metadata on banner */}
                  <div className="absolute bottom-2.5 left-3 text-[11px] text-slate-200 flex items-center gap-2">
                    <span>{exchange.theme}</span>
                    <span aria-hidden="true">·</span>
                    <span>{exchange.format}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{exchange.theme}</span>
                  <span className="text-[11px] font-mono text-slate-600">{seatsLeft} seats left</span>
                </div>
              )}

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Clean unboxed metadata kicker */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{exchange.skillLevel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{exchange.scheduleSummary.split(',')[0]}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {exchange.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {exchange.summary}
                  </p>
                </div>

                {/* Capacity & Dates */}
                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Capacity bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Enrolled Capacity</span>
                      </span>
                      <span className="font-mono tabular-nums font-medium text-slate-800">
                        {exchange.enrolledCount}/{exchange.capacityMax} ({capacityPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isFull ? 'bg-rose-500' : capacityPct > 80 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, capacityPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Facilitator info */}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={exchange.facilitatorName}
                        role="mentor"
                        size="xs"
                      />
                      <span className="truncate max-w-[130px] font-medium">{exchange.facilitatorName}</span>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onOpenOfflinePack(exchange);
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
                      title="Download offline notes bundle"
                    >
                      <Download className="w-3 h-3" />
                      <span>{t('Study Notes')}</span>
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    {isEnrolled ? (
                      <div className="w-full py-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Enrolled · Access Syllabus</span>
                      </div>
                    ) : (
                      <button
                        onClick={e => handleQuickEnroll(e, exchange.id)}
                        disabled={isFull || exchange.status !== 'open'}
                        className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          isFull || exchange.status !== 'open'
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        }`}
                      >
                        {isFull ? t('Capacity Reached') : t('Enroll Now')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExchanges.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-600 space-y-2">
          <p className="text-sm font-semibold text-slate-900">No virtual exchanges match your current filter.</p>
          <p className="text-xs text-slate-500">Try adjusting your theme, level, or search keyword.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTheme('all');
              setSelectedLevel('all');
              setSelectedFormat('all');
            }}
            className="mt-2 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
