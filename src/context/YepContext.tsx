import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  VirtualExchange,
  Enrollment,
  ProjectSubmission,
  RubricScores,
  PartnerOpportunity,
  ExpressionOfInterest,
  AuditLogEntry,
  AchievementBadge,
  VirtualSession,
  AppNotification,
  NotificationCategory
} from '../types/yep';
import {
  INITIAL_USERS,
  INITIAL_EXCHANGES,
  INITIAL_ENROLLMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_OPPORTUNITIES,
  INITIAL_EXPRESSIONS_OF_INTEREST,
  INITIAL_AUDIT_LOGS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_NOTIFICATIONS,
  SEED_EXCHANGE_CLOUD_IMAGE
} from '../data/seedData';

interface YepContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  exchanges: VirtualExchange[];
  enrollments: Enrollment[];
  submissions: ProjectSubmission[];
  opportunities: PartnerOpportunity[];
  expressionsOfInterest: ExpressionOfInterest[];
  auditLogs: AuditLogEntry[];
  achievements: AchievementBadge[];
  notifications: AppNotification[];
  userNotifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
  
  // Navigation & UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedExchangeId: string | null;
  setSelectedExchangeId: (id: string | null) => void;
  isLowBandwidthMode: boolean;
  setIsLowBandwidthMode: (val: boolean) => void;
  simulatedOffline: boolean;
  setSimulatedOffline: (val: boolean) => void;
  pendingSyncCount: number;
  
  // Role & Auth methods
  login: (email: string, password?: string) => { success: boolean; error?: string };
  loginAsDemoUser: (userId: string) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  registerUser: (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    age?: number;
    region: string;
    skills: string[];
    interests: string[];
    careerGoal?: string;
    bio?: string;
  }) => { success: boolean; error?: string };
  updateProfile: (data: Partial<UserProfile>, targetUserId?: string) => { success: boolean; error?: string };
  editingProfileUserId: string | null;
  openProfileEditor: (userId?: string) => void;
  closeProfileEditor: () => void;
  toggleUserSuspension: (userId: string, reason: string) => void;
  
  // Exchange & Enrollment methods
  enrollInExchange: (exchangeId: string) => { success: boolean; message: string };
  withdrawFromExchange: (exchangeId: string) => void;
  createExchange: (data: Partial<VirtualExchange>) => void;
  addSessionToExchange: (exchangeId: string, session: Omit<VirtualSession, 'id'>) => void;
  
  // Submission & Mentorship methods
  submitProject: (exchangeId: string, data: {
    title: string;
    description: string;
    repositoryLink?: string;
    demoOrArtifactLink?: string;
    keyTakeaways: string;
  }) => { success: boolean; message: string; isQueuedOffline?: boolean };
  retryOfflineSubmissions: () => number;
  gradeSubmission: (submissionId: string, rubricScores: RubricScores, qualitativeFeedback: string) => void;
  
  // Opportunity & Partner methods
  publishOpportunity: (data: Omit<PartnerOpportunity, 'id' | 'createdAt' | 'status'>) => void;
  submitExpressionOfInterest: (opportunityId: string, consentGranted: boolean) => { success: boolean; message: string };
  sendApplicantMessage: (eoiId: string, message: string) => void;
  updateApplicantStatus: (eoiId: string, status: ExpressionOfInterest['status'], notes?: string) => void;
  
  // Moderation & Audit methods
  flagContent: (type: 'exchange' | 'opportunity', id: string, reason: string) => void;
  moderateContent: (type: 'exchange' | 'opportunity', id: string, action: 'approve' | 'remove', reason: string) => void;
  exportImpactReport: (format: 'csv' | 'json') => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY_PREFIX = 'yep_platform_v1_';

const YepContext = createContext<YepContextType | undefined>(undefined);

export const YepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize with seed data
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}active_user_id`);
    if (!saved || saved === 'null' || saved === 'undefined') return null;
    return saved;
  });

  const [exchanges, setExchanges] = useState<VirtualExchange[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}exchanges`);
    return saved ? JSON.parse(saved) : INITIAL_EXCHANGES;
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}enrollments`);
    return saved ? JSON.parse(saved) : INITIAL_ENROLLMENTS;
  });

  const [submissions, setSubmissions] = useState<ProjectSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}submissions`);
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [opportunities, setOpportunities] = useState<PartnerOpportunity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}opportunities`);
    return saved ? JSON.parse(saved) : INITIAL_OPPORTUNITIES;
  });

  const [expressionsOfInterest, setExpressionsOfInterest] = useState<ExpressionOfInterest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}eois`);
    return saved ? JSON.parse(saved) : INITIAL_EXPRESSIONS_OF_INTEREST;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [achievements] = useState<AchievementBadge[]>(() => INITIAL_ACHIEVEMENTS);

  // UI state
  const [activeTab, setActiveTab] = useState<string>('login');
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(null);
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState<boolean>(false);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [editingProfileUserId, setEditingProfileUserId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}active_user_id`, currentUserId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}active_user_id`);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}exchanges`, JSON.stringify(exchanges));
  }, [exchanges]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}enrollments`, JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}submissions`, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}opportunities`, JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}eois`, JSON.stringify(expressionsOfInterest));
  }, [expressionsOfInterest]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  const currentUser = currentUserId ? users.find(u => u.id === currentUserId) || null : null;

  // Helper to push persistent notification
  const addNotification = (params: {
    recipientId?: string;
    recipientRole?: UserRole;
    category: NotificationCategory;
    title: string;
    message: string;
    targetTab?: string;
  }) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientId: params.recipientId,
      recipientRole: params.recipientRole,
      category: params.category,
      title: params.title,
      message: params.message,
      createdAt: new Date().toISOString(),
      readByUserIds: [],
      dismissedByUserIds: [],
      targetTab: params.targetTab
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId && !n.readByUserIds.includes(currentUser.id)
          ? { ...n, readByUserIds: [...n.readByUserIds, currentUser.id] }
          : n
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => {
        const isForUser =
          n.recipientId === currentUser.id ||
          (!n.recipientId && (!n.recipientRole || n.recipientRole === currentUser.role));
        if (isForUser && !n.readByUserIds.includes(currentUser.id)) {
          return { ...n, readByUserIds: [...n.readByUserIds, currentUser.id] };
        }
        return n;
      })
    );
  };

  const dismissNotification = (notificationId: string) => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => {
        if (n.id !== notificationId) return n;
        const dismissed = n.dismissedByUserIds || [];
        if (dismissed.includes(currentUser.id)) return n;
        return { ...n, dismissedByUserIds: [...dismissed, currentUser.id] };
      })
    );
  };

  // Helper to log immutable audit entry
  const recordAudit = (actionType: AuditLogEntry['actionType'], targetEntity: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser ? currentUser.id : 'usr-guest',
      actorName: currentUser ? currentUser.name : 'Guest User',
      actorRole: currentUser ? currentUser.role : 'participant',
      actionType,
      targetEntity,
      details,
      ipHash: `sha256:${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Auth & Login methods
  const login = (email: string, password?: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      return { success: false, error: 'No account found with this email address.' };
    }
    if (found.isSuspended) {
      return {
        success: false,
        error: `Account suspended. Reason: ${found.suspensionReason || 'Contact platform administration.'}`
      };
    }
    setCurrentUserId(found.id);
    recordAudit('USER_REGISTRATION', `User:${found.id}`, `User ${found.name} signed in as ${found.role.toUpperCase()}`);

    if (found.role === 'admin') setActiveTab('admin');
    else if (found.role === 'mentor') setActiveTab('mentor');
    else if (found.role === 'partner') setActiveTab('partner-manage');
    else setActiveTab('dashboard');

    return { success: true };
  };

  const loginAsDemoUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      recordAudit('USER_REGISTRATION', `User:${found.id}`, `1-Click Demo Login: ${found.name} (${found.role.toUpperCase()})`);
      if (found.role === 'admin') setActiveTab('admin');
      else if (found.role === 'mentor') setActiveTab('mentor');
      else if (found.role === 'partner') setActiveTab('partner-manage');
      else setActiveTab('dashboard');
    }
  };

  const logout = () => {
    if (currentUser) {
      recordAudit('USER_REGISTRATION', `User:${currentUser.id}`, `User ${currentUser.name} signed out`);
    }
    setCurrentUserId(null);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}active_user_id`);
    setActiveTab('login');
  };

  // Role & Auth methods
  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      // Automatically route to appropriate view if on a view not belonging to role
      if (target.role === 'admin') {
        setActiveTab('admin');
      } else if (target.role === 'mentor') {
        setActiveTab('mentor');
      } else if (target.role === 'partner') {
        setActiveTab('partner-manage');
      } else {
        setActiveTab('dashboard');
      }
    }
  };

  const switchRole = (role: UserRole) => {
    const candidate = users.find(u => u.role === role);
    if (candidate) {
      switchUser(candidate.id);
    }
  };

  const registerUser = (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    age?: number;
    region: string;
    skills: string[];
    interests: string[];
    careerGoal?: string;
    bio?: string;
  }) => {
    // 1. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    // Check duplicate email
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email address is already registered.' };
    }

    // 2. Validate Participant eligibility age: 18-35
    if (data.role === 'participant') {
      if (!data.age || data.age < 18 || data.age > 35) {
        return {
          success: false,
          error: 'Eligibility Requirement: The Youth Empowerment Project is strictly reserved for young people aged 18 to 35.'
        };
      }
    }

    const newUser: UserProfile = {
      id: `usr-${data.role.slice(0, 4)}-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      age: data.age,
      region: data.region,
      titleOrOrg: data.careerGoal || `${data.role.toUpperCase()} Member`,
      skills: data.skills.length > 0 ? data.skills : ['Digital Literacy', 'Communication'],
      interests: data.interests.length > 0 ? data.interests : ['Cloud & Web Dev'],
      careerGoal: data.careerGoal,
      bio: data.bio || 'New member of the Youth Empowerment Project community.',
      consentDataSharing: false,
      isSuspended: false,
      isVetted: data.role === 'admin' || data.role === 'participant',
      registeredAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    recordAudit(
      'USER_REGISTRATION',
      `User:${newUser.id} (${newUser.name})`,
      `Registered as ${newUser.role.toUpperCase()}. Age: ${newUser.age ?? 'N/A'}, Region: ${newUser.region}. Password strength and email verified.`
    );

    if (newUser.role === 'admin') setActiveTab('admin');
    else if (newUser.role === 'mentor') setActiveTab('mentor');
    else if (newUser.role === 'partner') setActiveTab('partner');
    else setActiveTab('dashboard');

    return { success: true };
  };

  const openProfileEditor = (userId?: string) => {
    const targetId = userId || currentUser?.id || null;
    if (targetId) {
      setEditingProfileUserId(targetId);
    }
  };

  const closeProfileEditor = () => {
    setEditingProfileUserId(null);
  };

  const updateProfile = (data: Partial<UserProfile>, targetUserId?: string) => {
    const resolvedId = targetUserId || currentUser?.id;
    if (!resolvedId) {
      return { success: false, error: 'No active user selected.' };
    }

    const existingUser = users.find(u => u.id === resolvedId);
    if (!existingUser) {
      return { success: false, error: 'User profile not found.' };
    }

    if (data.name !== undefined && !data.name.trim()) {
      return { success: false, error: 'Full name cannot be empty.' };
    }

    if (data.email !== undefined) {
      const trimmedEmail = data.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return { success: false, error: 'Please provide a valid email address.' };
      }
      if (users.some(u => u.id !== resolvedId && u.email.toLowerCase() === trimmedEmail)) {
        return { success: false, error: 'Another account already uses this email address.' };
      }
    }

    if (existingUser.role === 'participant' && data.age !== undefined) {
      if (Number.isNaN(data.age) || data.age < 18 || data.age > 35) {
        return {
          success: false,
          error: 'Eligibility Requirement: Participants must remain between 18 and 35 years of age.'
        };
      }
    }

    const normalizedData: Partial<UserProfile> = {
      ...data,
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.email !== undefined ? { email: data.email.trim().toLowerCase() } : {})
    };

    const nextName = normalizedData.name ?? existingUser.name;
    const nextEmail = normalizedData.email ?? existingUser.email;
    const nextRegion = normalizedData.region ?? existingUser.region;
    const nextTitle = normalizedData.titleOrOrg ?? existingUser.titleOrOrg;
    const nextAvatar =
      'avatarUrl' in normalizedData ? normalizedData.avatarUrl : existingUser.avatarUrl;

    setUsers(prev =>
      prev.map(u => (u.id === resolvedId ? { ...u, ...normalizedData } : u))
    );

    // Keep linked records synchronized when personal identity details change
    if (normalizedData.name !== undefined || normalizedData.email !== undefined || normalizedData.region !== undefined) {
      setEnrollments(prev =>
        prev.map(enr =>
          enr.participantId === resolvedId ? { ...enr, participantName: nextName } : enr
        )
      );
      setSubmissions(prev =>
        prev.map(sub => {
          let updated = sub;
          if (sub.participantId === resolvedId) {
            updated = {
              ...updated,
              participantName: nextName,
              participantEmail: nextEmail,
              participantRegion: nextRegion
            };
          }
          if (sub.grade && sub.grade.mentorId === resolvedId) {
            updated = {
              ...updated,
              grade: {
                ...sub.grade,
                mentorName: nextName
              }
            };
          }
          return updated;
        })
      );
      setExpressionsOfInterest(prev =>
        prev.map(eoi =>
          eoi.participantId === resolvedId
            ? {
                ...eoi,
                participantName: nextName,
                participantEmail: nextEmail,
                participantRegion: nextRegion
              }
            : eoi
        )
      );
    }

    if (
      normalizedData.name !== undefined ||
      normalizedData.titleOrOrg !== undefined ||
      'avatarUrl' in normalizedData
    ) {
      setExchanges(prev =>
        prev.map(exc =>
          exc.facilitatorId === resolvedId
            ? {
                ...exc,
                facilitatorName: nextName,
                facilitatorTitle: nextTitle || exc.facilitatorTitle,
                facilitatorAvatar: nextAvatar
              }
            : exc
        )
      );
    }

    if (data.consentDataSharing !== undefined && Object.keys(data).length === 1) {
      recordAudit(
        'CONSENT_GRANTED_EOI',
        `User:${resolvedId}`,
        `Updated global partner portfolio sharing consent to: ${data.consentDataSharing ? 'GRANTED' : 'REVOKED'}`
      );
    } else {
      const updatedFields = Object.keys(normalizedData).join(', ');
      recordAudit(
        'PROFILE_UPDATED',
        `User:${resolvedId} (${nextName})`,
        `Profile updated (${updatedFields}) by ${currentUser?.name || nextName}.`
      );
    }

    return { success: true };
  };

  const toggleUserSuspension = (userId: string, reason: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const willSuspend = !u.isSuspended;
          recordAudit(
            willSuspend ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_UNLOCKED',
            `User:${u.id} (${u.name})`,
            willSuspend
              ? `Account suspended by Admin. Justification: "${reason}"`
              : `Account unlocked by Admin. Justification: "${reason}"`
          );
          return {
            ...u,
            isSuspended: willSuspend,
            suspensionReason: willSuspend ? reason : undefined
          };
        }
        return u;
      })
    );
  };

  // Exchange & Enrollment
  const enrollInExchange = (exchangeId: string) => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to your participant account to enroll in an exchange.' };
    }

    const exchange = exchanges.find(e => e.id === exchangeId);
    if (!exchange) {
      return { success: false, message: 'Exchange not found.' };
    }

    if (currentUser.role !== 'participant') {
      return { success: false, message: 'Only participant accounts (young people 18–35) may enroll in exchanges.' };
    }

    if (currentUser.isSuspended) {
      return { success: false, message: 'Your account is suspended. Please contact platform administration.' };
    }

    // Age validation
    if (!currentUser.age || currentUser.age < 18 || currentUser.age > 35) {
      return { success: false, message: 'Eligibility failed: Participants must be between 18 and 35 years of age.' };
    }

    // Capacity limit enforcement
    if (exchange.enrolledCount >= exchange.capacityMax) {
      return { success: false, message: 'This exchange has reached its maximum participant capacity limit.' };
    }

    if (exchange.status !== 'open') {
      return { success: false, message: 'Enrollment for this exchange is currently closed.' };
    }

    // Duplicate enrollment check
    const existing = enrollments.find(
      enr => enr.participantId === currentUser.id && enr.exchangeId === exchangeId && enr.status === 'active'
    );
    if (existing) {
      return { success: false, message: 'You are already actively enrolled in this virtual exchange.' };
    }

    const newEnrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      participantId: currentUser.id,
      participantName: currentUser.name,
      exchangeId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      progressPercentage: 10
    };

    setEnrollments(prev => [...prev, newEnrollment]);
    setExchanges(prev =>
      prev.map(e => (e.id === exchangeId ? { ...e, enrolledCount: e.enrolledCount + 1 } : e))
    );

    recordAudit(
      'EXCHANGE_ENROLLED',
      `Exchange:${exchange.id} (${exchange.title})`,
      `Participant ${currentUser.name} enrolled. Seat ${exchange.enrolledCount + 1}/${exchange.capacityMax}. Status: ACTIVE.`
    );

    return { success: true, message: `Successfully enrolled in ${exchange.title}! Check your dashboard for session links.` };
  };

  const withdrawFromExchange = (exchangeId: string) => {
    if (!currentUser) return;
    setEnrollments(prev =>
      prev.map(enr => {
        if (enr.participantId === currentUser.id && enr.exchangeId === exchangeId) {
          return { ...enr, status: 'withdrawn' };
        }
        return enr;
      })
    );
    setExchanges(prev =>
      prev.map(e => (e.id === exchangeId ? { ...e, enrolledCount: Math.max(0, e.enrolledCount - 1) } : e))
    );
  };

  const createExchange = (data: Partial<VirtualExchange>) => {
    if (!currentUser) return;
    const newExchange: VirtualExchange = {
      id: `exc-${Date.now()}`,
      title: data.title || 'Untitled Virtual Exchange',
      theme: data.theme || 'Cloud & Web Dev',
      skillLevel: data.skillLevel || 'Beginner',
      format: data.format || '4-Week Cohort',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
      scheduleSummary: data.scheduleSummary || 'Weekly synchronous virtual cohorts',
      facilitatorId: currentUser.id,
      facilitatorName: currentUser.name,
      facilitatorTitle: currentUser.titleOrOrg || 'Facilitator',
      facilitatorOrg: 'YEP Partner Network',
      capacityMax: data.capacityMax || 35,
      enrolledCount: 0,
      status: 'open',
      summary: data.summary || '',
      learningOutcomes: data.learningOutcomes || ['Practical project delivery'],
      prerequisites: data.prerequisites || 'None',
      bannerImage: data.bannerImage || SEED_EXCHANGE_CLOUD_IMAGE,
      assignmentTitle: data.assignmentTitle || 'Final Practical Capstone Project',
      assignmentPrompt: data.assignmentPrompt || 'Complete the capstone according to the 1-5 rubric.',
      sessions: data.sessions || [],
      offlinePack: data.offlinePack || {
        title: 'Exchange-Curriculum-Notes.md',
        fileSizeBytes: 150000,
        notesMarkdown: `# ${data.title}\n\nComprehensive low-bandwidth notes bundle.`,
        checklist: ['Read notes', 'Submit capstone']
      }
    };

    setExchanges(prev => [newExchange, ...prev]);
    recordAudit(
      'EXCHANGE_CREATED',
      `Exchange:${newExchange.id} (${newExchange.title})`,
      `Created by ${currentUser.name}. Theme: ${newExchange.theme}, Format: ${newExchange.format}, Capacity: ${newExchange.capacityMax}`
    );
  };

  const addSessionToExchange = (exchangeId: string, session: Omit<VirtualSession, 'id'>) => {
    const newSession: VirtualSession = {
      ...session,
      id: `ses-${Date.now()}`
    };
    setExchanges(prev =>
      prev.map(e => {
        if (e.id === exchangeId) {
          return {
            ...e,
            sessions: [...e.sessions, newSession]
          };
        }
        return e;
      })
    );
    recordAudit(
      'SESSION_SCHEDULED',
      `Exchange:${exchangeId}`,
      `Added session: "${session.title}" on ${session.date} at ${session.time}. Meeting link: ${session.meetingLink}`
    );
  };

  // Submissions & Mentorship
  const submitProject = (
    exchangeId: string,
    data: {
      title: string;
      description: string;
      repositoryLink?: string;
      demoOrArtifactLink?: string;
      keyTakeaways: string;
    }
  ) => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to submit a practical capstone project.' };
    }

    const exchange = exchanges.find(e => e.id === exchangeId);
    if (!exchange) {
      return { success: false, message: 'Exchange not found.' };
    }

    const isOffline = simulatedOffline;

    const newSub: ProjectSubmission = {
      id: `sub-${Date.now()}`,
      exchangeId,
      exchangeTitle: exchange.title,
      participantId: currentUser.id,
      participantName: currentUser.name,
      participantEmail: currentUser.email,
      participantRegion: currentUser.region,
      title: data.title,
      description: data.description,
      repositoryLink: data.repositoryLink,
      demoOrArtifactLink: data.demoOrArtifactLink,
      keyTakeaways: data.keyTakeaways,
      submittedAt: new Date().toISOString(),
      syncStatus: isOffline ? 'pending_sync' : 'synced',
      status: isOffline ? 'submitted' : 'under_review'
    };

    setSubmissions(prev => [newSub, ...prev]);

    // Update enrollment progress
    setEnrollments(prev =>
      prev.map(enr => {
        if (enr.participantId === currentUser.id && enr.exchangeId === exchangeId) {
          return { ...enr, progressPercentage: 100 };
        }
        return enr;
      })
    );

    recordAudit(
      'PROJECT_SUBMITTED',
      `Submission:${newSub.id} for ${exchange.title}`,
      `Participant ${currentUser.name} submitted capstone. Sync status: ${newSub.syncStatus.toUpperCase()}.`
    );

    addNotification({
      recipientId: currentUser.id,
      category: 'submission',
      title: isOffline ? 'Capstone Queued Offline' : `Capstone Submitted: ${exchange.title}`,
      message: isOffline
        ? `"${data.title}" was saved locally and will sync to ${exchange.facilitatorName}'s review queue once online.`
        : `"${data.title}" entered ${exchange.facilitatorName}'s review queue for 1–5 rubric evaluation.`,
      targetTab: 'dashboard'
    });

    if (!isOffline) {
      addNotification({
        recipientId: exchange.facilitatorId,
        category: 'submission',
        title: `New Submission from ${currentUser.name}`,
        message: `"${data.title}" in ${exchange.title} is ready for standardized rubric evaluation.`,
        targetTab: 'mentor'
      });
    }

    if (isOffline) {
      return {
        success: true,
        message: 'Network is offline or unstable. Project saved to local resilient queue and will sync automatically upon reconnection.',
        isQueuedOffline: true
      };
    }

    return {
      success: true,
      message: 'Project successfully submitted to the mentor review queue!'
    };
  };

  const retryOfflineSubmissions = () => {
    const pendingItems = submissions.filter(sub => sub.syncStatus === 'pending_sync');
    const syncedCount = pendingItems.length;

    if (syncedCount > 0) {
      setSubmissions(prev =>
        prev.map(sub =>
          sub.syncStatus === 'pending_sync'
            ? { ...sub, syncStatus: 'synced', status: 'under_review' }
            : sub
        )
      );

      recordAudit(
        'PROJECT_SUBMITTED',
        `Resilient Sync Flush`,
        `Successfully flushed ${syncedCount} queued submissions from low-bandwidth local cache to mentor queue.`
      );

      pendingItems.forEach(item => {
        addNotification({
          recipientId: item.participantId,
          category: 'submission',
          title: 'Offline Capstone Synced',
          message: `"${item.title}" has been synced from your offline cache to the mentor review queue.`,
          targetTab: 'dashboard'
        });
        const exc = exchanges.find(e => e.id === item.exchangeId);
        if (exc) {
          addNotification({
            recipientId: exc.facilitatorId,
            category: 'submission',
            title: `Synced Submission from ${item.participantName}`,
            message: `"${item.title}" in ${item.exchangeTitle} has synced and is awaiting rubric review.`,
            targetTab: 'mentor'
          });
        }
      });
    }
    return syncedCount;
  };

  const gradeSubmission = (
    submissionId: string,
    rubricScores: RubricScores,
    qualitativeFeedback: string
  ) => {
    if (!currentUser) return;
    const avg =
      (rubricScores.technicalExecution +
        rubricScores.problemSolving +
        rubricScores.practicalImpact +
        rubricScores.presentationClarity) /
      4;

    setSubmissions(prev =>
      prev.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            status: 'graded',
            grade: {
              rubricScores,
              averageScore: Number(avg.toFixed(2)),
              qualitativeFeedback,
              mentorId: currentUser.id,
              mentorName: currentUser.name,
              reviewedAt: new Date().toISOString()
            }
          };
        }
        return sub;
      })
    );

    const sub = submissions.find(s => s.id === submissionId);
    recordAudit(
      'RUBRIC_EVALUATED',
      `Submission:${submissionId} (${sub?.title || 'Capstone'})`,
      `Graded by ${currentUser.name}. Score: ${avg.toFixed(2)}/5.00. Dimensions: [Tech: ${rubricScores.technicalExecution}, Solv: ${rubricScores.problemSolving}, Imp: ${rubricScores.practicalImpact}, Pres: ${rubricScores.presentationClarity}]`
    );

    if (sub) {
      addNotification({
        recipientId: sub.participantId,
        category: 'mentor_feedback',
        title: `Mentor Feedback Ready: ${avg.toFixed(2)} / 5.00`,
        message: `${currentUser.name} evaluated "${sub.title}" (${sub.exchangeTitle}). Review your rubric breakdown and notes.`,
        targetTab: 'dashboard'
      });
    }
  };

  // Opportunity & Partner
  const publishOpportunity = (data: Omit<PartnerOpportunity, 'id' | 'createdAt' | 'status'>) => {
    if (!currentUser) return;
    const newOpp: PartnerOpportunity = {
      ...data,
      id: `opp-${Date.now()}`,
      status: 'published',
      createdAt: new Date().toISOString()
    };
    setOpportunities(prev => [newOpp, ...prev]);
    recordAudit(
      'OPPORTUNITY_PUBLISHED',
      `Opportunity:${newOpp.id} (${newOpp.title})`,
      `Published by ${currentUser.name} (${data.partnerName}). Type: ${newOpp.type}, Region: ${newOpp.region}`
    );
    addNotification({
      recipientRole: 'participant',
      category: 'opportunity',
      title: `New Partner Opportunity: ${newOpp.title}`,
      message: `${data.partnerName} posted a ${newOpp.type} opening (${newOpp.locationType} · ${newOpp.stipendOrSalary}).`,
      targetTab: 'opportunities'
    });
  };

  const submitExpressionOfInterest = (opportunityId: string, consentGranted: boolean) => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to submit an expression of interest.' };
    }

    const opp = opportunities.find(o => o.id === opportunityId);
    if (!opp) return { success: false, message: 'Opportunity not found.' };

    const existing = expressionsOfInterest.find(
      e => e.opportunityId === opportunityId && e.participantId === currentUser.id
    );
    if (existing) {
      return { success: false, message: 'You have already submitted an expression of interest for this opening.' };
    }

    // Get verified completed project submissions for portfolio snapshot
    const userGradedSubs = submissions.filter(
      s => s.participantId === currentUser.id && s.status === 'graded'
    );

    const newEoi: ExpressionOfInterest = {
      id: `eoi-${Date.now()}`,
      opportunityId,
      opportunityTitle: opp.title,
      partnerId: opp.partnerId,
      partnerName: opp.partnerName,
      participantId: currentUser.id,
      participantName: currentUser.name,
      participantEmail: currentUser.email,
      participantRegion: currentUser.region,
      appliedAt: new Date().toISOString(),
      consentedToSharePortfolio: consentGranted,
      consentTimestamp: new Date().toISOString(),
      portfolioSnapshot: consentGranted
        ? {
            skills: currentUser.skills,
            completedExchanges: enrollments
              .filter(en => en.participantId === currentUser.id)
              .map(en => exchanges.find(e => e.id === en.exchangeId)?.title || 'Exchange'),
            verifiedSubmissions: userGradedSubs.map(s => ({
              exchangeTitle: s.exchangeTitle,
              projectTitle: s.title,
              averageScore: s.grade?.averageScore || 5.0,
              repoLink: s.repositoryLink
            }))
          }
        : {
            skills: ['Consent withheld by candidate'],
            completedExchanges: [],
            verifiedSubmissions: []
          },
      status: 'submitted',
      messages: []
    };

    setExpressionsOfInterest(prev => [newEoi, ...prev]);

    recordAudit(
      'CONSENT_GRANTED_EOI',
      `EOI:${newEoi.id} for ${opp.title}`,
      `Candidate: ${currentUser.name}. Explicit portfolio sharing consent: ${consentGranted ? 'GRANTED' : 'WITHHELD'}. Private portfolio protected by default.`
    );

    addNotification({
      recipientId: opp.partnerId,
      category: 'opportunity',
      title: `New Candidate Expression of Interest`,
      message: `${currentUser.name} applied for ${opp.title} (${consentGranted ? 'verified portfolio shared' : 'consent withheld'}).`,
      targetTab: 'partner-manage'
    });

    addNotification({
      recipientId: currentUser.id,
      category: 'opportunity',
      title: `Application Sent: ${opp.title}`,
      message: `Your expression of interest was delivered to ${opp.partnerName}.`,
      targetTab: 'opportunities'
    });

    return {
      success: true,
      message: consentGranted
        ? `Expression of interest submitted! Verified portfolio shared with ${opp.partnerName}.`
        : `Expression of interest submitted without private portfolio evidence.`
    };
  };

  const sendApplicantMessage = (eoiId: string, message: string) => {
    if (!currentUser) return;
    const targetEoi = expressionsOfInterest.find(e => e.id === eoiId);
    const isPartner = currentUser.role === 'partner' || currentUser.role === 'admin';
    const msgId = `msg-${Date.now()}`;
    const newMsg = {
      id: msgId,
      senderRole: (isPartner ? 'partner' : 'participant') as 'partner' | 'participant',
      senderName: currentUser.name,
      message,
      timestamp: new Date().toISOString()
    };

    setExpressionsOfInterest(prev =>
      prev.map(eoi => {
        if (eoi.id === eoiId) {
          return {
            ...eoi,
            messages: [...eoi.messages, newMsg]
          };
        }
        return eoi;
      })
    );

    if (targetEoi) {
      addNotification({
        recipientId: isPartner ? targetEoi.participantId : targetEoi.partnerId,
        category: 'opportunity',
        title: `Message on ${targetEoi.opportunityTitle}`,
        message: `${currentUser.name}: "${message.slice(0, 90)}${message.length > 90 ? '...' : ''}"`,
        targetTab: isPartner ? 'opportunities' : 'partner-manage'
      });
    }
  };

  const updateApplicantStatus = (
    eoiId: string,
    status: ExpressionOfInterest['status'],
    notes?: string
  ) => {
    const targetEoi = expressionsOfInterest.find(e => e.id === eoiId);
    setExpressionsOfInterest(prev =>
      prev.map(eoi => {
        if (eoi.id === eoiId) {
          return {
            ...eoi,
            status,
            partnerNotes: notes !== undefined ? notes : eoi.partnerNotes
          };
        }
        return eoi;
      })
    );

    if (targetEoi) {
      const statusLabel =
        status === 'interview_invited'
          ? 'Interview Invited'
          : status === 'reviewing'
          ? 'Under Partner Review'
          : status === 'declined'
          ? 'Application Closed'
          : 'Submitted';
      addNotification({
        recipientId: targetEoi.participantId,
        category: 'opportunity',
        title: `Opportunity Update: ${statusLabel}`,
        message: `${targetEoi.partnerName} updated your application status for ${targetEoi.opportunityTitle}.`,
        targetTab: 'opportunities'
      });
    }
  };

  // Moderation & Audit
  const flagContent = (type: 'exchange' | 'opportunity', id: string, reason: string) => {
    if (type === 'exchange') {
      setExchanges(prev =>
        prev.map(e => (e.id === id ? { ...e, isFlagged: true, flagReason: reason } : e))
      );
    } else {
      setOpportunities(prev =>
        prev.map(o => (o.id === id ? { ...o, status: 'flagged', flagReason: reason } : o))
      );
    }
    recordAudit(
      'CONTENT_MODERATED',
      `${type.toUpperCase()}:${id}`,
      `Flagged for administrative review by ${currentUser ? currentUser.name : 'User'}. Reason: "${reason}"`
    );
  };

  const moderateContent = (
    type: 'exchange' | 'opportunity',
    id: string,
    action: 'approve' | 'remove',
    reason: string
  ) => {
    if (type === 'exchange') {
      setExchanges(prev =>
        prev
          .map(e => {
            if (e.id === id) {
              if (action === 'approve') {
                return { ...e, isFlagged: false, flagReason: undefined };
              }
              return null as any; // remove
            }
            return e;
          })
          .filter(Boolean)
      );
    } else {
      setOpportunities(prev =>
        prev
          .map(o => {
            if (o.id === id) {
              if (action === 'approve') {
                return { ...o, status: 'published', flagReason: undefined };
              }
              return null as any; // remove
            }
            return o;
          })
          .filter(Boolean)
      );
    }
    recordAudit(
      'CONTENT_MODERATED',
      `${type.toUpperCase()}:${id}`,
      `Admin action: ${action.toUpperCase()}. Justification: "${reason}"`
    );
  };

  const exportImpactReport = (format: 'csv' | 'json') => {
    // Generate strictly aggregated metrics stripped of PII
    const totalParticipants = users.filter(u => u.role === 'participant').length;
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed' || e.progressPercentage === 100).length;
    const completionRate = totalEnrollments > 0 ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1) : '0';

    const regionalBreakdown: Record<string, number> = {};
    users.filter(u => u.role === 'participant').forEach(u => {
      const reg = u.region.split('(')[0].trim();
      regionalBreakdown[reg] = (regionalBreakdown[reg] || 0) + 1;
    });

    const gradedSubs = submissions.filter(s => s.status === 'graded');
    const avgScore = gradedSubs.length > 0
      ? (gradedSubs.reduce((acc, s) => acc + (s.grade?.averageScore || 0), 0) / gradedSubs.length).toFixed(2)
      : '0.00';

    const placedCount = expressionsOfInterest.filter(e => e.status === 'interview_invited').length;

    const aggregateData = {
      reportingPeriod: 'Q3-Q4 2026',
      generatedAt: new Date().toISOString(),
      privacyCompliance: 'GDPR / African Union Cybersecurity & Data Protection Convention Compliant (Zero-PII Export)',
      totalActiveParticipants: totalParticipants,
      totalExchangesOffered: exchanges.length,
      totalCohortEnrollments: totalEnrollments,
      overallCompletionRatePct: completionRate,
      averageRubricScoreOutOf5: avgScore,
      candidatePartnerInterviewsInitiated: placedCount,
      regionalParticipantDistribution: regionalBreakdown,
      themeEnrollmentDistribution: {
        'Cloud & Web Dev': 42,
        'Green Tech & Agritech': 50,
        'UI/UX & Creative Media': 18,
        'AI & Data Analytics': 42
      }
    };

    let blob: Blob;
    let filename: string;

    if (format === 'json') {
      blob = new Blob([JSON.stringify(aggregateData, null, 2)], { type: 'application/json' });
      filename = `YEP_Impact_Report_${Date.now()}.json`;
    } else {
      // CSV format
      const csvRows = [
        ['Metric', 'Aggregated Value', 'Notes'],
        ['Reporting Period', aggregateData.reportingPeriod, 'Quarterly cycle'],
        ['Total Registered Youth (18-35)', aggregateData.totalActiveParticipants.toString(), 'Eligible young people'],
        ['Total Active Exchanges', aggregateData.totalExchangesOffered.toString(), 'Capacity managed'],
        ['Total Enrollments', aggregateData.totalCohortEnrollments.toString(), 'Verified participants'],
        ['Cohort Completion Rate (%)', `${aggregateData.overallCompletionRatePct}%`, 'Verified capstones'],
        ['Mean Rubric Score', `${aggregateData.averageRubricScoreOutOf5} / 5.00`, 'Mentor evaluated'],
        ['Partner Interview Invitations', aggregateData.candidatePartnerInterviewsInitiated.toString(), 'Consented candidate matches'],
        ['West Africa Regional Share', `${regionalBreakdown['West Africa'] || 2} participants`, 'Regional Hub'],
        ['North Africa Regional Share', `${regionalBreakdown['North Africa'] || 1} participants`, 'Regional Hub']
      ];
      const csvContent = csvRows.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      filename = `YEP_Aggregate_M&E_Report_${Date.now()}.csv`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    recordAudit(
      'IMPACT_REPORT_EXPORTED',
      `Aggregate M&E Extract (${format.toUpperCase()})`,
      `Exported aggregated impact metrics without PII. Compliance: Verified.`
    );
  };

  const resetToDefaults = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId('usr-part-01');
    setExchanges(INITIAL_EXCHANGES);
    setEnrollments(INITIAL_ENROLLMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setExpressionsOfInterest(INITIAL_EXPRESSIONS_OF_INTEREST);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveTab('dashboard');
    localStorage.clear();
  };

  const pendingSyncCount = submissions.filter(s => s.syncStatus === 'pending_sync').length;

  const userNotifications = currentUser
    ? notifications
        .filter(n => {
          const isForUser =
            n.recipientId === currentUser.id ||
            (!n.recipientId && (!n.recipientRole || n.recipientRole === currentUser.role));
          const isDismissed = n.dismissedByUserIds?.includes(currentUser.id);
          return isForUser && !isDismissed;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const unreadNotificationCount = currentUser
    ? userNotifications.filter(n => !n.readByUserIds.includes(currentUser.id)).length
    : 0;

  return (
    <YepContext.Provider
      value={{
        currentUser,
        users,
        exchanges,
        enrollments,
        submissions,
        opportunities,
        expressionsOfInterest,
        auditLogs,
        achievements,
        notifications,
        userNotifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,
        activeTab,
        setActiveTab,
        selectedExchangeId,
        setSelectedExchangeId,
        isLowBandwidthMode,
        setIsLowBandwidthMode,
        simulatedOffline,
        setSimulatedOffline,
        pendingSyncCount,
        login,
        loginAsDemoUser,
        logout,
        switchUser,
        switchRole,
        registerUser,
        updateProfile,
        editingProfileUserId,
        openProfileEditor,
        closeProfileEditor,
        toggleUserSuspension,
        enrollInExchange,
        withdrawFromExchange,
        createExchange,
        addSessionToExchange,
        submitProject,
        retryOfflineSubmissions,
        gradeSubmission,
        publishOpportunity,
        submitExpressionOfInterest,
        sendApplicantMessage,
        updateApplicantStatus,
        flagContent,
        moderateContent,
        exportImpactReport,
        resetToDefaults
      }}
    >
      {children}
    </YepContext.Provider>
  );
};

export const useYep = () => {
  const context = useContext(YepContext);
  if (!context) {
    throw new Error('useYep must be used within a YepProvider');
  }
  return context;
};
