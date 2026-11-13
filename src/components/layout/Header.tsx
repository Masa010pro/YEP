import React from 'react';
import { useYep } from '../../context/YepContext';
import { useLanguage } from '../../context/LanguageContext';
import { Wifi, WifiOff, RefreshCw, LogOut, LogIn, Pencil } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export const Header: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    isLowBandwidthMode,
    setIsLowBandwidthMode,
    simulatedOffline,
    setSimulatedOffline,
    pendingSyncCount,
    retryOfflineSubmissions,
    openProfileEditor,
    logout
  } = useYep();
  const { t } = useLanguage();

  const handleRetrySync = () => {
    const count = retryOfflineSubmissions();
    if (count > 0) {
      alert(`Flushed ${count} submission(s) from offline queue to mentor review.`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16 min-w-0">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab(currentUser ? (currentUser.role === 'admin' ? 'admin' : currentUser.role === 'mentor' ? 'mentor' : currentUser.role === 'partner' ? 'partner-manage' : 'dashboard') : 'login')}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-emerald-700 transition-colors whitespace-nowrap truncate min-w-0 text-left cursor-pointer"
          >
            {t('Youth Empowerment Project')}
          </button>

          {/* Zone 2: Desktop single-line navigation links */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-600 shrink-0">
            {currentUser ? (
              <>
                {currentUser.role === 'participant' && (
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'dashboard' ? 'text-emerald-700 font-semibold' : ''
                    }`}
                  >
                    {t('My Dashboard')}
                  </button>
                )}
                {currentUser.role === 'mentor' && (
                  <button
                    onClick={() => setActiveTab('mentor')}
                    className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'mentor' ? 'text-emerald-700 font-semibold' : ''
                    }`}
                  >
                    {t('Mentor Workspace')}
                  </button>
                )}
                {currentUser.role === 'partner' && (
                  <button
                    onClick={() => setActiveTab('partner-manage')}
                    className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'partner-manage' ? 'text-emerald-700 font-semibold' : ''
                    }`}
                  >
                    {t('Talent Pipeline')}
                  </button>
                )}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeTab === 'admin' ? 'text-emerald-700 font-semibold' : ''
                    }`}
                  >
                    {t('Control Center')}
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('exchanges')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'exchanges' ? 'text-emerald-700 font-semibold' : ''
                  }`}
                >
                  {t('Exchange Catalogue')}
                </button>

                <button
                  onClick={() => setActiveTab('opportunities')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'opportunities' ? 'text-emerald-700 font-semibold' : ''
                  }`}
                >
                  {t('Partner Board')}
                </button>

                <button
                  onClick={() => setActiveTab('landing')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'landing' ? 'text-emerald-700 font-semibold' : ''
                  }`}
                >
                  {t('Public Overview')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'login' ? 'text-emerald-700 font-semibold' : ''
                  }`}
                >
                  {t('Sign In')}
                </button>
                <button
                  onClick={() => setActiveTab('landing')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'landing' ? 'text-emerald-700 font-semibold' : ''
                  }`}
                >
                  {t('Platform Overview')}
                </button>
                <button
                  onClick={() => setActiveTab('exchanges')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'exchanges' ? 'text-emerald-700 font-semibold' : ''
                  }`}
                >
                  {t('Curriculum Catalogue')}
                </button>
                <button
                  onClick={() => setActiveTab('opportunities')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'opportunities' ? 'text-emerald-700 font-semibold' : ''
                  }`}
                >
                  {t('Partner Opportunities')}
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Controls, Language Switcher & User Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Global East African & English Language Switcher */}
            <LanguageSwitcher />

            {/* Low-bandwidth mode toggle */}
            <button
              onClick={() => setIsLowBandwidthMode(!isLowBandwidthMode)}
              title={isLowBandwidthMode ? 'Disable Low-Bandwidth Mode' : 'Enable Low-Bandwidth Mode (Saves Mobile Data)'}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLowBandwidthMode
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isLowBandwidthMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isLowBandwidthMode ? t('Data Saver') : t('Saver')}</span>
            </button>

            {/* Simulated Offline Toggle */}
            <button
              onClick={() => setSimulatedOffline(!simulatedOffline)}
              title={simulatedOffline ? 'Simulating Offline: click to reconnect' : 'Simulate intermittent offline connectivity'}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                simulatedOffline
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${simulatedOffline ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className="hidden lg:inline">{simulatedOffline ? t('Offline') : t('Connected')}</span>
            </button>

            {/* Offline queue indicator */}
            {pendingSyncCount > 0 && (
              <button
                onClick={handleRetrySync}
                className="px-2.5 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
                title="Sync queued submissions to server"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>{t('Sync')} ({pendingSyncCount})</span>
              </button>
            )}

            {/* Logged in User Profile & Sign Out button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openProfileEditor(currentUser.id)}
                  title={t('Edit Personal Profile')}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs transition-colors cursor-pointer"
                >
                  <UserAvatar
                    name={currentUser.name}
                    role={currentUser.role}
                    avatarUrl={currentUser.avatarUrl}
                    size="xs"
                  />
                  <span className="hidden sm:inline font-semibold text-slate-800 max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="hidden md:inline text-[10px] uppercase font-bold text-slate-500 px-1 py-0.2 bg-white rounded border border-slate-200">
                    {currentUser.role}
                  </span>
                  <Pencil className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-rose-700 bg-white hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Sign out to return to login and switch accounts"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('Sign Out')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('Sign In')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact navigation bar for screens below xl (tablets, split panes, mobile) */}
        {currentUser && (
          <nav className="flex xl:hidden items-center gap-4 pb-2.5 pt-1 overflow-x-auto text-xs font-medium text-slate-600 border-t border-slate-100">
            {currentUser.role === 'participant' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'dashboard' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                {t('My Dashboard')}
              </button>
            )}
            {currentUser.role === 'mentor' && (
              <button
                onClick={() => setActiveTab('mentor')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'mentor' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                {t('Mentor Workspace')}
              </button>
            )}
            {currentUser.role === 'partner' && (
              <button
                onClick={() => setActiveTab('partner-manage')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'partner-manage' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                {t('Talent Pipeline')}
              </button>
            )}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'admin' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                {t('Control Center')}
              </button>
            )}
            <button
              onClick={() => setActiveTab('exchanges')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'exchanges' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {t('Exchange Catalogue')}
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'opportunities' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {t('Partner Board')}
            </button>
            <button
              onClick={() => setActiveTab('landing')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'landing' ? 'text-emerald-700 font-semibold' : ''
              }`}
            >
              {t('Public Overview')}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
