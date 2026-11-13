import React, { useEffect, useRef, useState } from 'react';
import { useYep } from '../../context/YepContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppNotification, NotificationCategory } from '../../types/yep';
import {
  Bell,
  Briefcase,
  CheckCheck,
  FileText,
  Award,
  X,
  ArrowRight
} from 'lucide-react';

type FilterType = 'all' | NotificationCategory;

const formatRelativeTime = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
};

export const NotificationsPanel: React.FC = () => {
  const {
    currentUser,
    userNotifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
    setActiveTab
  } = useYep();
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!currentUser) return null;

  const filteredNotifications =
    filter === 'all'
      ? userNotifications
      : userNotifications.filter(n => n.category === filter);

  const countByCategory = (cat: FilterType) =>
    cat === 'all'
      ? userNotifications.length
      : userNotifications.filter(n => n.category === cat).length;

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.targetTab) {
      setActiveTab(notif.targetTab);
    }
    setIsOpen(false);
  };

  const getCategoryMeta = (category: NotificationCategory) => {
    switch (category) {
      case 'submission':
        return {
          label: t('Submission'),
          icon: <FileText className="w-3.5 h-3.5 text-blue-700" />,
          badgeClass: 'bg-blue-50 text-blue-800 border-blue-200'
        };
      case 'mentor_feedback':
        return {
          label: t('Mentor Feedback'),
          icon: <Award className="w-3.5 h-3.5 text-emerald-700" />,
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'opportunity':
        return {
          label: t('Opportunity'),
          icon: <Briefcase className="w-3.5 h-3.5 text-amber-700" />,
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
        };
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-label={t('Notifications')}
        title={t('Notifications')}
        className={`relative p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
          isOpen
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
        }`}
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">{t('Updates')}</span>
        {unreadNotificationCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold font-mono tabular-nums inline-flex items-center justify-center">
            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={t('Notifications')}
          className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full sm:mt-2 w-[calc(100vw-1rem)] sm:w-[390px] bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 text-emerald-700 shrink-0" />
              <h3 className="text-xs font-bold text-slate-900 truncate">
                {t('Notifications')}
              </h3>
              <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                {unreadNotificationCount} {t('unread')}
              </span>
            </div>

            {unreadNotificationCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{t('Mark all read')}</span>
              </button>
            )}
          </div>

          {/* Category Filter Bar */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1 overflow-x-auto bg-white">
            {(
              [
                { id: 'all', label: t('All') },
                { id: 'submission', label: t('Submissions') },
                { id: 'mentor_feedback', label: t('Feedback') },
                { id: 'opportunity', label: t('Opportunities') }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                  filter === tab.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`font-mono tabular-nums text-[10px] ${
                    filter === tab.id ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {countByCategory(tab.id)}
                </span>
              </button>
            ))}
          </div>

          {/* Notification Feed */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notif => {
                const isRead = notif.readByUserIds.includes(currentUser.id);
                const meta = getCategoryMeta(notif.category);

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition-colors flex items-start gap-2.5 ${
                      isRead ? 'bg-white hover:bg-slate-50/80' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 shrink-0">
                      {meta.icon}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notif)}
                      className="flex-1 min-w-0 text-left space-y-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isRead && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-emerald-600"
                              title="Unread"
                            />
                          )}
                          <span className="text-[10px] font-mono tabular-nums text-slate-400">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-900 leading-snug">
                        {notif.title}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      {notif.targetTab && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 pt-0.5">
                          <span>{t('Open workspace')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => dismissNotification(notif.id)}
                      aria-label={t('Dismiss notification')}
                      title={t('Dismiss notification')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-1.5">
                <Bell className="w-6 h-6 text-slate-300 mx-auto" />
                <div className="text-xs font-semibold text-slate-700">
                  {t('No notifications in this view')}
                </div>
                <p className="text-[11px] text-slate-500">
                  {t('Updates on exchange submissions, mentor feedback, and partner opportunities appear here.')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
