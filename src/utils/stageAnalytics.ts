import {
  Enrollment,
  ExpressionOfInterest,
  ProjectSubmission,
  SkillLevel,
  UserProfile,
  VirtualExchange
} from '../types/yep';

export interface StageDefinition {
  stageNumber: number;
  key: 'onboarding' | 'enrolled' | 'learning' | 'submission' | 'evaluation' | 'readiness';
  shortLabel: string;
  label: string;
}

export const STAGE_DEFINITIONS: StageDefinition[] = [
  { stageNumber: 1, key: 'onboarding', shortLabel: '1. Onboard', label: 'Profile & Eligibility' },
  { stageNumber: 2, key: 'enrolled', shortLabel: '2. Enrolled', label: 'Exchange Enrollment' },
  { stageNumber: 3, key: 'learning', shortLabel: '3. Learning', label: 'Coursework & Labs' },
  { stageNumber: 4, key: 'submission', shortLabel: '4. Capstone', label: 'Capstone Submission' },
  { stageNumber: 5, key: 'evaluation', shortLabel: '5. Rubric', label: 'Mentor Evaluation' },
  { stageNumber: 6, key: 'readiness', shortLabel: '6. Partner', label: 'Partner Readiness' }
];

export interface ParticipantStagePoint {
  stageNumber: number;
  key: StageDefinition['key'];
  shortLabel: string;
  label: string;
  completion: number;
}

export interface RubricPillarSummary {
  pillar: string;
  shortPillar: string;
  score: number;
}

export interface ParticipantStageSummary {
  participantId: string;
  participantName: string;
  participantRegion: string;
  avatarUrl?: string;
  skillLevel: SkillLevel;
  currentStageNumber: number;
  currentStageLabel: string;
  overallStageProgressPct: number;
  meanRubricScore: number | null;
  enrolledCount: number;
  submissionCount: number;
  gradedCount: number;
  eoiCount: number;
  consentGranted: boolean;
  stagePoints: ParticipantStagePoint[];
  rubricPillars: RubricPillarSummary[];
}

export interface CohortStageAverageSummary {
  totalParticipants: number;
  overallAveragePct: number;
  meanCohortRubricScore: number;
  averageStageNumber: number;
  levelCounts: Record<SkillLevel, number>;
  stagePoints: Array<ParticipantStagePoint>;
  rubricPillars: RubricPillarSummary[];
}

export function computeParticipantStageSummary(
  user: UserProfile,
  enrollments: Enrollment[],
  submissions: ProjectSubmission[],
  exchanges: VirtualExchange[],
  eois: ExpressionOfInterest[]
): ParticipantStageSummary {
  const userEnrollments = enrollments.filter(
    e => e.participantId === user.id && e.status !== 'withdrawn'
  );
  const userSubmissions = submissions.filter(s => s.participantId === user.id);
  const gradedSubmissions = userSubmissions.filter(s => s.status === 'graded' && s.grade);
  const userEois = eois.filter(e => e.participantId === user.id);

  // Stage 1: Profile & Eligibility
  const hasEligibility =
    !user.age || (user.age >= 18 && user.age <= 35);
  const hasSkills = user.skills.length > 0 && user.interests.length > 0;
  const stage1 = hasEligibility ? (hasSkills ? 100 : 75) : 40;

  // Stage 2: Exchange Enrollment (active enrollment or submitted capstone in an exchange)
  const effectiveExchangeIds = new Set<string>([
    ...userEnrollments.map(e => e.exchangeId),
    ...userSubmissions.map(s => s.exchangeId)
  ]);
  const stage2 = effectiveExchangeIds.size > 0 ? 100 : 0;

  // Stage 3: Learning & Sessions progress
  let stage3 = 0;
  if (userEnrollments.length > 0) {
    const avgEnrProgress =
      userEnrollments.reduce((acc, e) => acc + e.progressPercentage, 0) /
      userEnrollments.length;
    stage3 = Math.round(avgEnrProgress);
  } else if (gradedSubmissions.length > 0) {
    stage3 = 100;
  } else if (userSubmissions.length > 0) {
    stage3 = 75;
  }

  // Stage 4: Capstone Submission
  let stage4 = 0;
  if (effectiveExchangeIds.size > 0) {
    const submittedExchangeIds = new Set(userSubmissions.map(s => s.exchangeId));
    stage4 = Math.min(
      100,
      Math.round((submittedExchangeIds.size / effectiveExchangeIds.size) * 100)
    );
  }

  // Stage 5: Mentor Rubric Evaluation
  let stage5 = 0;
  if (gradedSubmissions.length > 0) {
    stage5 = 100;
  } else if (userSubmissions.length > 0) {
    stage5 = 50; // Submitted & awaiting mentor rubric grading
  }

  // Stage 6: Partner Readiness (consent + graded portfolio + applications / invites)
  const hasInterviewInvite = userEois.some(e => e.status === 'interview_invited');
  const stage6 = Math.min(
    100,
    (user.consentDataSharing ? 40 : 0) +
      (gradedSubmissions.length > 0 ? 30 : userSubmissions.length > 0 ? 15 : 0) +
      (hasInterviewInvite ? 30 : userEois.length > 0 ? 20 : 0)
  );

  const completionValues = [stage1, stage2, stage3, stage4, stage5, stage6];
  const stagePoints: ParticipantStagePoint[] = STAGE_DEFINITIONS.map((def, idx) => ({
    stageNumber: def.stageNumber,
    key: def.key,
    shortLabel: def.shortLabel,
    label: def.label,
    completion: completionValues[idx]
  }));

  // Determine current stage (highest stage with active progress >= 50, or stage 1)
  let currentStageNumber = 1;
  for (let i = 0; i < stagePoints.length; i++) {
    if (stagePoints[i].completion >= 50) {
      currentStageNumber = stagePoints[i].stageNumber;
    }
  }
  const currentStageDef = STAGE_DEFINITIONS[currentStageNumber - 1];

  const overallStageProgressPct = Math.round(
    completionValues.reduce((sum, val) => sum + val, 0) / completionValues.length
  );

  // Mean rubric score & 4-pillar vector
  const meanRubricScore =
    gradedSubmissions.length > 0
      ? Number(
          (
            gradedSubmissions.reduce((acc, s) => acc + (s.grade?.averageScore || 0), 0) /
            gradedSubmissions.length
          ).toFixed(2)
        )
      : null;

  // Compute participant's rubric pillars (or baseline readiness estimate if awaiting evaluation)
  let tech = 0;
  let solve = 0;
  let impact = 0;
  let clarity = 0;
  if (gradedSubmissions.length > 0) {
    tech =
      gradedSubmissions.reduce(
        (acc, s) => acc + (s.grade?.rubricScores.technicalExecution || 0),
        0
      ) / gradedSubmissions.length;
    solve =
      gradedSubmissions.reduce(
        (acc, s) => acc + (s.grade?.rubricScores.problemSolving || 0),
        0
      ) / gradedSubmissions.length;
    impact =
      gradedSubmissions.reduce(
        (acc, s) => acc + (s.grade?.rubricScores.practicalImpact || 0),
        0
      ) / gradedSubmissions.length;
    clarity =
      gradedSubmissions.reduce(
        (acc, s) => acc + (s.grade?.rubricScores.presentationClarity || 0),
        0
      ) / gradedSubmissions.length;
  } else {
    // Grounded formative baseline from progress & submission status (out of 5)
    const base = userSubmissions.length > 0 ? 3.2 : Math.max(1.5, (stage3 / 100) * 3.0);
    tech = Number(base.toFixed(2));
    solve = Number(Math.max(1.5, base - 0.1).toFixed(2));
    impact = Number(Math.min(5, base + (user.consentDataSharing ? 0.2 : 0)).toFixed(2));
    clarity = Number(base.toFixed(2));
  }

  const rubricPillars: RubricPillarSummary[] = [
    { pillar: 'Technical Execution', shortPillar: 'Technical', score: Number(tech.toFixed(2)) },
    { pillar: 'Problem Solving', shortPillar: 'Problem Solving', score: Number(solve.toFixed(2)) },
    { pillar: 'Practical Impact', shortPillar: 'Impact', score: Number(impact.toFixed(2)) },
    { pillar: 'Presentation Clarity', shortPillar: 'Clarity', score: Number(clarity.toFixed(2)) }
  ];

  // Determine Skill Level
  const enrolledExchanges = exchanges.filter(ex => effectiveExchangeIds.has(ex.id));
  let skillLevel: SkillLevel = enrolledExchanges.some(e => e.skillLevel === 'Advanced')
    ? 'Advanced'
    : enrolledExchanges.some(e => e.skillLevel === 'Intermediate')
    ? 'Intermediate'
    : 'Beginner';

  if (meanRubricScore !== null) {
    if (meanRubricScore >= 4.3) {
      skillLevel = 'Advanced';
    } else if (meanRubricScore >= 3.3 && skillLevel === 'Beginner') {
      skillLevel = 'Intermediate';
    }
  } else if (userSubmissions.length > 0 && stage3 >= 70 && skillLevel === 'Beginner') {
    skillLevel = 'Intermediate';
  }

  return {
    participantId: user.id,
    participantName: user.name,
    participantRegion: user.region,
    avatarUrl: user.avatarUrl,
    skillLevel,
    currentStageNumber,
    currentStageLabel: currentStageDef.label,
    overallStageProgressPct,
    meanRubricScore,
    enrolledCount: effectiveExchangeIds.size,
    submissionCount: userSubmissions.length,
    gradedCount: gradedSubmissions.length,
    eoiCount: userEois.length,
    consentGranted: user.consentDataSharing,
    stagePoints,
    rubricPillars
  };
}

export function computeCohortStageAverage(
  summaries: ParticipantStageSummary[]
): CohortStageAverageSummary {
  const count = summaries.length;
  if (count === 0) {
    return {
      totalParticipants: 0,
      overallAveragePct: 0,
      meanCohortRubricScore: 0,
      averageStageNumber: 1,
      levelCounts: { Beginner: 0, Intermediate: 0, Advanced: 0 },
      stagePoints: STAGE_DEFINITIONS.map(def => ({
        stageNumber: def.stageNumber,
        key: def.key,
        shortLabel: def.shortLabel,
        label: def.label,
        completion: 0
      })),
      rubricPillars: [
        { pillar: 'Technical Execution', shortPillar: 'Technical', score: 0 },
        { pillar: 'Problem Solving', shortPillar: 'Problem Solving', score: 0 },
        { pillar: 'Practical Impact', shortPillar: 'Impact', score: 0 },
        { pillar: 'Presentation Clarity', shortPillar: 'Clarity', score: 0 }
      ]
    };
  }

  const levelCounts: Record<SkillLevel, number> = {
    Beginner: summaries.filter(s => s.skillLevel === 'Beginner').length,
    Intermediate: summaries.filter(s => s.skillLevel === 'Intermediate').length,
    Advanced: summaries.filter(s => s.skillLevel === 'Advanced').length
  };

  const stagePoints = STAGE_DEFINITIONS.map((def, idx) => {
    const avgCompletion = Math.round(
      summaries.reduce((acc, s) => acc + (s.stagePoints[idx]?.completion || 0), 0) / count
    );
    return {
      stageNumber: def.stageNumber,
      key: def.key,
      shortLabel: def.shortLabel,
      label: def.label,
      completion: avgCompletion
    };
  });

  const pillarKeys = ['Technical Execution', 'Problem Solving', 'Practical Impact', 'Presentation Clarity'];
  const shortKeys = ['Technical', 'Problem Solving', 'Impact', 'Clarity'];

  const rubricPillars: RubricPillarSummary[] = pillarKeys.map((pillar, idx) => {
    const avgScore =
      summaries.reduce((acc, s) => acc + (s.rubricPillars[idx]?.score || 0), 0) / count;
    return {
      pillar,
      shortPillar: shortKeys[idx],
      score: Number(avgScore.toFixed(2))
    };
  });

  const overallAveragePct = Math.round(
    summaries.reduce((acc, s) => acc + s.overallStageProgressPct, 0) / count
  );

  const gradedOnly = summaries.filter(s => s.meanRubricScore !== null);
  const meanCohortRubricScore =
    gradedOnly.length > 0
      ? Number(
          (
            gradedOnly.reduce((acc, s) => acc + (s.meanRubricScore || 0), 0) /
            gradedOnly.length
          ).toFixed(2)
        )
      : Number(
          (
            rubricPillars.reduce((acc, p) => acc + p.score, 0) / rubricPillars.length
          ).toFixed(2)
        );

  const averageStageNumber = Number(
    (
      summaries.reduce((acc, s) => acc + s.currentStageNumber, 0) / count
    ).toFixed(1)
  );

  return {
    totalParticipants: count,
    overallAveragePct,
    meanCohortRubricScore,
    averageStageNumber,
    levelCounts,
    stagePoints,
    rubricPillars
  };
}
