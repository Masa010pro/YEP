import React from 'react';
import { UserRole } from '../../types/yep';

interface UserAvatarProps {
  name: string;
  role?: UserRole;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Generate initials from name: "Masa David" -> "MD"
export const getInitials = (name: string): string => {
  if (!name) return 'YP';
  const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'YP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const roleColorThemes: Record<UserRole, { bg: string; text: string; border: string }> = {
  participant: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700'
  },
  mentor: {
    bg: 'bg-blue-100 dark:bg-blue-950/60',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700'
  },
  partner: {
    bg: 'bg-indigo-100 dark:bg-indigo-950/60',
    text: 'text-indigo-800 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-700'
  },
  admin: {
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-900 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700'
  }
};

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base font-bold'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  role = 'participant',
  size = 'md',
  className = ''
}) => {
  const initials = getInitials(name);
  const theme = roleColorThemes[role] || roleColorThemes.participant;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      aria-label={name}
      title={name}
      className={`rounded-full flex items-center justify-center font-bold tracking-tight select-none border shrink-0 ${sizeClass} ${theme.bg} ${theme.text} ${theme.border} ${className}`}
    >
      <span className="font-mono">{initials}</span>
    </div>
  );
};
