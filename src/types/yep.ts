export type UserRole = 'participant' | 'mentor' | 'partner' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  age?: number;
  region: string;
  avatarUrl?: string;
  titleOrOrg?: string;
  skills: string[];
  interests: string[];
  careerGoal?: string;
  bio: string;
  consentDataSharing: boolean; // Explicit consent to share portfolio with partner employers
  isSuspended: boolean;
  suspensionReason?: string;
  isVetted?: boolean; // For partners / mentors
  registeredAt: string;
}

export type ExchangeTheme = 
  | 'Cloud & Web Dev'
  | 'AI & Data Analytics'
  | 'Digital Growth & Product'
  | 'Green Tech & Agritech'
  | 'UI/UX & Creative Media'
  | 'Civic Tech & Social Innovation';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ExchangeFormat = 'Virtual Bootcamp' | '4-Week Cohort' | 'Weekend Sprint';

export interface VirtualSession {
  id: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  meetingLink: string;
  agenda: string;
  isCompleted: boolean;
}

export interface OfflineBundle {
  title: string;
  fileSizeBytes: number;
  notesMarkdown: string;
  checklist: string[];
}

export interface VirtualExchange {
  id: string;
  title: string;
  theme: ExchangeTheme;
  skillLevel: SkillLevel;
  format: ExchangeFormat;
  startDate: string;
  endDate: string;
  scheduleSummary: string;
  facilitatorId: string;
  facilitatorName: string;
  facilitatorTitle: string;
  facilitatorOrg: string;
  facilitatorAvatar?: string;
  capacityMax: number;
  enrolledCount: number;
  status: 'open' | 'in_progress' | 'closed';
  summary: string;
  learningOutcomes: string[];
  prerequisites: string;
  bannerImage: string;
  sessions: VirtualSession[];
  assignmentTitle: string;
  assignmentPrompt: string;
  offlinePack: OfflineBundle;
  isFlagged?: boolean;
  flagReason?: string;
}

export interface Enrollment {
  id: string;
  participantId: string;
  participantName: string;
  exchangeId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'withdrawn';
  progressPercentage: number;
}

export interface RubricScores {
  technicalExecution: number; // 1-5
  problemSolving: number;     // 1-5
  practicalImpact: number;    // 1-5
  presentationClarity: number; // 1-5
}

export interface ProjectSubmission {
  id: string;
  exchangeId: string;
  exchangeTitle: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantRegion: string;
  title: string;
  description: string;
  repositoryLink?: string;
  demoOrArtifactLink?: string;
  keyTakeaways: string;
  submittedAt: string;
  syncStatus: 'synced' | 'pending_sync' | 'draft';
  status: 'submitted' | 'under_review' | 'graded' | 'needs_revision';
  grade?: {
    rubricScores: RubricScores;
    averageScore: number;
    qualitativeFeedback: string;
    mentorId: string;
    mentorName: string;
    reviewedAt: string;
  };
}

export type OpportunityType = 'Entry-Level Digital Work' | 'Paid Internship' | 'Freelance Gig' | 'Apprenticeship';
export type LocationType = 'Remote' | 'Hybrid' | 'On-Site';

export interface PartnerOpportunity {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerType: string;
  partnerLogo?: string;
  title: string;
  type: OpportunityType;
  locationType: LocationType;
  region: string;
  stipendOrSalary: string;
  closingDate: string;
  description: string;
  requirements: string[];
  status: 'published' | 'closed' | 'flagged';
  flagReason?: string;
  createdAt: string;
}

export interface ExpressionOfInterest {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  partnerId: string;
  partnerName: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantRegion: string;
  appliedAt: string;
  consentedToSharePortfolio: boolean; // EXPLICIT CONSENT
  consentTimestamp: string;
  portfolioSnapshot: {
    skills: string[];
    completedExchanges: string[];
    verifiedSubmissions: Array<{
      exchangeTitle: string;
      projectTitle: string;
      averageScore: number;
      repoLink?: string;
    }>;
  };
  status: 'submitted' | 'reviewing' | 'interview_invited' | 'declined';
  partnerNotes?: string;
  messages: Array<{
    id: string;
    senderRole: 'partner' | 'participant';
    senderName: string;
    message: string;
    timestamp: string;
  }>;
}

export type AuditActionType = 
  | 'USER_REGISTRATION'
  | 'EXCHANGE_ENROLLED'
  | 'EXCHANGE_CREATED'
  | 'SESSION_SCHEDULED'
  | 'PROJECT_SUBMITTED'
  | 'RUBRIC_EVALUATED'
  | 'OPPORTUNITY_PUBLISHED'
  | 'CONSENT_GRANTED_EOI'
  | 'CONTENT_MODERATED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_UNLOCKED'
  | 'IMPACT_REPORT_EXPORTED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actionType: AuditActionType;
  targetEntity: string;
  details: string;
  ipHash: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: string;
  earnedAt?: string;
  iconName: string;
}
