import React from 'react';
import { useYep } from '../../context/YepContext';
import { useLanguage } from '../../context/LanguageContext';
import { VirtualExchange } from '../../types/yep';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  WifiOff,
  BookOpen,
  Briefcase,
  CheckCircle,
  Download
} from 'lucide-react';
import { SEED_HERO_IMAGE } from '../../data/seedData';

interface LandingViewProps {
  onSelectExchange: (exchange: VirtualExchange) => void;
  onOpenRegisterModal: () => void;
  onOpenOfflinePack: (exchange: VirtualExchange) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSelectExchange,
  onOpenRegisterModal,
  onOpenOfflinePack
}) => {
  const { exchanges, setActiveTab, isLowBandwidthMode } = useYep();
  const { t } = useLanguage();
  const featuredExchanges = exchanges.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Quiet unboxed text kicker */}
              <div className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
                Youth Empowerment Project · Functional Blueprint
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15] text-balance">
                Accelerating youth potential through practical virtual exchanges and verified industry linkages.
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                A role-governed platform connecting young people aged 18–35 with hands-on technical cohorts, standardized 1–5 mentor rubrics, and consent-driven entry-level opportunities across emerging markets.
              </p>

              {/* Eligibility & Access Highlight */}
              <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 space-y-1.5 max-w-xl">
                <div className="font-semibold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Mandatory Core Eligibility Criteria</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
                  <span>Age requirement: <strong>18 to 35 years</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>100% Free beneficiary access</span>
                  <span aria-hidden="true">·</span>
                  <span>Low-bandwidth study packs</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('exchanges')}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <span>{t('Explore Exchange Catalogue')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenRegisterModal}
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('Register Profile (18–35)')}
                </button>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              {!isLowBandwidthMode ? (
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 aspect-[4/3] group">
                  <img
                    src={SEED_HERO_IMAGE}
                    alt="Young participants collaborating on digital projects in YEP lab"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                    <div className="font-semibold">Collaborative Digital Cohorts</div>
                    <div className="text-slate-300 text-[11px] mt-0.5">
                      Synchronous sessions with offline-ready curriculum packs
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-100 rounded-2xl border border-slate-200 text-xs space-y-3">
                  <div className="font-semibold text-slate-800">Low-Bandwidth Mode Active</div>
                  <p className="text-slate-600">
                    High-resolution imagery is minimized to conserve mobile bandwidth. Downloadable Markdown bundles are ready for offline learning.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Claim-to-Proof Quantitative Metric Strip */}
        <div className="border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                  12,480+
                </div>
                <div className="text-slate-700 font-semibold mt-1">Young People Enrolled</div>
                <div className="text-slate-500 text-[11px]">Strict 18–35 age verified cohort</div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">
                  94.2%
                </div>
                <div className="text-slate-700 font-semibold mt-1">Capstone Completion</div>
                <div className="text-slate-500 text-[11px]">Assessed against 1–5 rubrics</div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                  18 Hubs
                </div>
                <div className="text-slate-700 font-semibold mt-1">Regional Deployment</div>
                <div className="text-slate-500 text-[11px]">West, East, North & Southern Africa</div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold text-indigo-700 font-mono tabular-nums">
                  420+
                </div>
                <div className="text-slate-700 font-semibold mt-1">Vetted Partner Employers</div>
                <div className="text-slate-500 text-[11px]">Consent-driven candidate matching</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Platform Blueprint
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Designed for high impact, strict privacy, and low connectivity
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every feature directly translates the project report into dependable user workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Capacity-Enforced Virtual Exchanges
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict cohort limits ensure active facilitator mentorship. Participants receive structured schedules, live session links, and downloadable offline study bundles.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Standardized 1–5 Rubric Evaluation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mentors evaluate capstone projects across Technical Execution, Problem Solving, Practical Impact, and Presentation Clarity, supplemented with actionable qualitative coaching.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Consent-Gated Talent Linkages
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No participant portfolios or rubric grades are exposed to partners without explicit, informed consent. Vetted partners post fair paid openings with direct candidate messaging.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Exchanges Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-semibold text-emerald-800 tracking-wide uppercase mb-1">
              Curated Cohorts
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Featured Virtual Exchanges Open for Enrollment
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('exchanges')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            View Complete Catalogue →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredExchanges.map(exc => (
            <div
              key={exc.id}
              onClick={() => onSelectExchange(exc)}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all flex flex-col cursor-pointer"
            >
              <div className="h-40 bg-slate-900 relative overflow-hidden">
                <img
                  src={exc.bannerImage}
                  alt={exc.title}
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3 text-[11px] text-slate-200 flex items-center gap-2">
                  <span>{exc.theme}</span>
                  <span aria-hidden="true">·</span>
                  <span>{exc.format}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {exc.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {exc.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums text-slate-600">
                    {exc.capacityMax - exc.enrolledCount} seats open
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onOpenOfflinePack(exc);
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Offline Pack</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
              Ready to participate in the Youth Empowerment Project?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Whether you are an aspiring young developer (aged 18–35), an expert mentor, or an industry partner seeking verified digital talent, our platform provides the tools to succeed.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenRegisterModal}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {t('Create Account (Age 18–35)')}
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {t('View Partner Openings')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
