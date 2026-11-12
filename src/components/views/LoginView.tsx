import React, { useState } from 'react';
import { useYep } from '../../context/YepContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  GraduationCap,
  UserCheck,
  Briefcase,
  Shield,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Lock,
  Mail,
  ExternalLink
} from 'lucide-react';

interface LoginViewProps {
  onOpenRegisterModal: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenRegisterModal }) => {
  const { login, loginAsDemoUser, users, setActiveTab } = useYep();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg(t('Please enter your email address.'));
      return;
    }

    const res = login(email, password);
    if (!res.success) {
      setErrorMsg(res.error || t('Authentication failed. Please check credentials.'));
    }
  };

  // Demo personas from users list
  const participantDemo = users.find(u => u.role === 'participant') || users[0];
  const mentorDemo = users.find(u => u.role === 'mentor') || users[1];
  const partnerDemo = users.find(u => u.role === 'partner') || users[2];
  const adminDemo = users.find(u => u.role === 'admin') || users[3];

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            {t('Youth Empowerment Project (YEP)')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t('Sign In to the Empowerment Platform')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {t('Access capacity-governed virtual exchanges, standardized mentor rubrics, and consent-driven partner opportunity boards.')}
          </p>
        </div>

        {/* Central Sign In Form Card */}
        <div className="max-w-md mx-auto w-full bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {t('Email Address')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. amara.okafor@outlook.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-slate-700">{t('Password')}</label>
                <span className="text-[11px] text-slate-400">{t('Any password for demo')}</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{t('Sign In to Account')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <button
              onClick={onOpenRegisterModal}
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              {t('Create Account (Aged 18–35)')}
            </button>
            <button
              onClick={() => setActiveTab('landing')}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              {t('View Public Overview')}
            </button>
          </div>
        </div>

        {/* Demo Role Accounts (1-Click Instant Login) */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('1-Click Test Accounts (Initials Badge)')}</span>
            </div>
            <p className="text-xs text-slate-500">
              {t("Select any role below to automatically sign in and immediately access that actor's dedicated dashboard:")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. Participant */}
            {participantDemo && (
              <div
                onClick={() => loginAsDemoUser(participantDemo.id)}
                className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <UserAvatar name={participantDemo.name} role="participant" size="sm" />
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {t('Age 18–35')}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {participantDemo.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {participantDemo.email}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {t('Participant · Enrolls in cohorts, submits practical capstone projects, and manages portfolio consent.')}
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full py-1.5 bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 font-semibold rounded-lg transition-colors text-xs text-center"
                >
                  {t('Sign In as Participant →')}
                </button>
              </div>
            )}

            {/* 2. Mentor / Facilitator */}
            {mentorDemo && (
              <div
                onClick={() => loginAsDemoUser(mentorDemo.id)}
                className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <UserAvatar name={mentorDemo.name} role="mentor" size="sm" />
                    <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {t('Facilitator')}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {mentorDemo.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {mentorDemo.email}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {t('Mentor · Schedules live cohort sessions, reviews submissions, and scores 1–5 rubrics.')}
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full py-1.5 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-semibold rounded-lg transition-colors text-xs text-center"
                >
                  {t('Sign In as Mentor →')}
                </button>
              </div>
            )}

            {/* 3. Employer / Partner */}
            {partnerDemo && (
              <div
                onClick={() => loginAsDemoUser(partnerDemo.id)}
                className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <UserAvatar name={partnerDemo.name} role="partner" size="sm" />
                    <span className="text-[10px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {t('Employer')}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {partnerDemo.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {partnerDemo.email}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {t('Partner · Publishes digital openings and reviews candidate expressions with explicit consent.')}
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full py-1.5 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 font-semibold rounded-lg transition-colors text-xs text-center"
                >
                  {t('Sign In as Partner →')}
                </button>
              </div>
            )}

            {/* 4. Administrator (Test Account Available Below Login) */}
            {adminDemo && (
              <div
                onClick={() => loginAsDemoUser(adminDemo.id)}
                className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <UserAvatar name={adminDemo.name} role="admin" size="sm" />
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {t('Admin')}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {adminDemo.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {adminDemo.email}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {t('Administrator · Oversees immutable audit logs, moderates flagged content, and exports zero-PII M&E.')}
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full py-1.5 bg-slate-100 group-hover:bg-amber-600 group-hover:text-white text-slate-700 font-semibold rounded-lg transition-colors text-xs text-center"
                >
                  {t('Sign In as Admin →')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
