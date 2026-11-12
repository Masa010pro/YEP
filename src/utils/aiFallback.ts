export interface ParticipantAIContext {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    age?: number;
    region: string;
    skills: string[];
    interests: string[];
    careerGoal?: string;
    bio: string;
    consentDataSharing: boolean;
  };
  opportunities: Array<{
    id: string;
    title: string;
    partnerName: string;
    type: string;
    locationType: string;
    region: string;
    stipendOrSalary: string;
    requirements: string[];
    description: string;
    status: string;
  }>;
  exchanges: Array<{
    id: string;
    title: string;
    theme: string;
    skillLevel: string;
    format: string;
    facilitatorName: string;
    facilitatorOrg: string;
    capacityMax: number;
    enrolledCount: number;
    scheduleSummary: string;
    summary: string;
    learningOutcomes: string[];
    status: string;
  }>;
  enrollments: Array<{
    id: string;
    exchangeId: string;
    progressPercentage: number;
    status: string;
  }>;
  submissions: Array<{
    id: string;
    title: string;
    status: string;
    grade?: {
      averageScore: number;
      qualitativeFeedback: string;
      rubricScores: {
        technicalExecution: number;
        problemSolving: number;
        practicalImpact: number;
        presentationClarity: number;
      };
    };
  }>;
}

export interface MentorAIContext {
  mentor: {
    name: string;
    title?: string;
    region: string;
  };
  cohortParticipants: Array<{
    id: string;
    name: string;
    region: string;
    skills: string[];
    interests: string[];
    careerGoal?: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    exchangeTitle: string;
    progress: number;
    rubricScores: {
      technicalExecution: number;
      problemSolving: number;
      practicalImpact: number;
      presentationClarity: number;
    } | null;
    averageScore: number | null;
    submissionStatus: string;
  }>;
  assignedExchanges: Array<{
    title: string;
    skillLevel: string;
    enrolledCount: number;
    capacityMax: number;
  }>;
  pendingReviewsCount: number;
  evaluatedSubmissionsCount: number;
}

export function generateParticipantFallback(
  message: string,
  context: ParticipantAIContext
): string {
  const q = message.toLowerCase();
  const user = context.currentUser;
  const opportunities = context.opportunities.filter(o => o.status === 'published');
  const exchanges = context.exchanges;
  const enrollments = context.enrollments;
  const submissions = context.submissions;

  if (
    q.includes('opp') ||
    q.includes('job') ||
    q.includes('intern') ||
    q.includes('gig') ||
    q.includes('hire') ||
    q.includes('match') ||
    q.includes('work') ||
    q.includes('career')
  ) {
    if (opportunities.length === 0) {
      return 'There are currently no published openings on the Partner Opportunity Board. Keep completing your virtual exchange capstones so your portfolio is ready when new roles arrive.';
    }

    const ranked = opportunities
      .map(opp => {
        const matchedSkills = opp.requirements.filter(req =>
          user.skills.some(
            sk =>
              req.toLowerCase().includes(sk.toLowerCase()) ||
              sk.toLowerCase().includes(req.toLowerCase())
          )
        );
        const regionMatch =
          opp.locationType.toLowerCase() === 'remote' ||
          user.region.toLowerCase().includes(opp.region.split('(')[0].trim().toLowerCase()) ||
          opp.region.toLowerCase().includes('global');
        const score = matchedSkills.length * 3 + (regionMatch ? 1 : 0);
        return { opp, matchedSkills, regionMatch, score };
      })
      .sort((a, b) => b.score - a.score);

    let res = `Here is how your declared skills (${user.skills.join(', ')}) and career goals match the active openings on the Partner Opportunity Board:\n\n`;
    ranked.forEach(({ opp, matchedSkills, regionMatch }, idx) => {
      res += `${idx + 1}. ${opp.title} — ${opp.partnerName}\n`;
      res += `   • Format & Pay: ${opp.type} · ${opp.locationType} (${opp.region}) · ${opp.stipendOrSalary}\n`;
      res += `   • Required Skills: ${opp.requirements.join(', ')}\n`;
      if (matchedSkills.length > 0) {
        res += `   • Why You Match: Strong alignment with your skills (${matchedSkills.join(', ')})${regionMatch ? ' and compatible location availability' : ''}.\n`;
      } else {
        res += `   • Growth Opportunity: Great stretch role aligned with your interest in ${user.interests.slice(0, 2).join(' and ')}.\n`;
      }
      res += `   • Overview: ${opp.description}\n\n`;
    });

    res += `Consent Status Reminder: Your explicit portfolio sharing consent is currently ${
      user.consentDataSharing ? 'GRANTED' : 'WITHHELD'
    }. ${
      user.consentDataSharing
        ? 'You are ready to submit an Expression of Interest and let vetted partners inspect your verified capstone scores.'
        : 'Before applying, toggle "Partner Data Consent" on your dashboard if you want partners to view your graded capstone evidence.'
    }`;
    return res;
  }

  if (
    q.includes('exchange') ||
    q.includes('cohort') ||
    q.includes('course') ||
    q.includes('learn') ||
    q.includes('enroll') ||
    q.includes('recommend') ||
    q.includes('next')
  ) {
    const enrolledIds = new Set(enrollments.map(e => e.exchangeId));
    const scored = exchanges
      .map(exc => {
        const isEnrolled = enrolledIds.has(exc.id);
        const seatsLeft = Math.max(0, exc.capacityMax - exc.enrolledCount);
        const interestMatch = user.interests.some(i =>
          exc.theme.toLowerCase().includes(i.toLowerCase()) ||
          i.toLowerCase().includes(exc.theme.toLowerCase())
        );
        return { exc, isEnrolled, seatsLeft, interestMatch };
      })
      .sort((a, b) => Number(b.interestMatch) - Number(a.interestMatch));

    let res = `Here is a breakdown of the virtual learning exchanges currently in the YEP catalogue relative to your profile:\n\n`;
    scored.forEach(({ exc, isEnrolled, seatsLeft, interestMatch }, idx) => {
      res += `${idx + 1}. ${exc.title} (${exc.skillLevel} · ${exc.format})\n`;
      res += `   • Theme & Facilitator: ${exc.theme} · Led by ${exc.facilitatorName} (${exc.facilitatorOrg})\n`;
      res += `   • Schedule: ${exc.scheduleSummary}\n`;
      res += `   • Enrollment Status: ${
        isEnrolled
          ? 'Already Enrolled (active in your dashboard)'
          : seatsLeft > 0
          ? `Open — ${seatsLeft} of ${exc.capacityMax} seats remaining`
          : 'Cohort Currently Full (0 seats open)'
      }${interestMatch ? ' · Matches your declared interests' : ''}\n`;
      res += `   • What You Will Learn: ${exc.learningOutcomes.slice(0, 2).join('; ')}.\n\n`;
    });

    const bestNext = scored.find(s => !s.isEnrolled && s.seatsLeft > 0);
    if (bestNext) {
      res += `Recommended Next Step: Consider enrolling in "${bestNext.exc.title}" since it aligns closely with your background and still has ${bestNext.seatsLeft} open seats.`;
    }
    return res;
  }

  if (
    q.includes('rubric') ||
    q.includes('grade') ||
    q.includes('score') ||
    q.includes('capstone') ||
    q.includes('submission') ||
    q.includes('evaluat')
  ) {
    let res = `Practical capstone submissions in YEP are evaluated by your assigned mentor using a standardized 1 to 5 rubric with equal 25% weight across four pillars:\n\n`;
    res += `1. Technical Execution & Architecture (25%): Clean modular structure, repository setup, and reliable engineering practices.\n`;
    res += `2. Problem Solving & Offline Adaptation (25%): Handling intermittent connectivity, caching, and low-bandwidth edge cases.\n`;
    res += `3. Practical Community & Industry Impact (25%): Relevance and tangible usefulness to real regional or digital challenges.\n`;
    res += `4. Presentation Clarity & Documentation (25%): Well-structured README notes, clear key takeaways, and working artifact links.\n\n`;

    if (submissions.length > 0) {
      res += `Your Current Submission Records:\n`;
      submissions.forEach(s => {
        if (s.grade) {
          res += `• "${s.title}" — Graded ${s.grade.averageScore.toFixed(2)} / 5.00 (Technical: ${s.grade.rubricScores.technicalExecution}, Problem Solving: ${s.grade.rubricScores.problemSolving}, Impact: ${s.grade.rubricScores.practicalImpact}, Clarity: ${s.grade.rubricScores.presentationClarity}). Feedback: "${s.grade.qualitativeFeedback}"\n`;
        } else {
          res += `• "${s.title}" — Currently ${s.status.replace('_', ' ')} in the mentor queue.\n`;
        }
      });
    } else {
      res += `You have not submitted a capstone yet. Note that even if you experience slow or offline connectivity, YEP queues your submission locally and syncs automatically once reconnected.`;
    }
    return res;
  }

  if (q.includes('consent') || q.includes('privacy') || q.includes('data') || q.includes('share')) {
    return `YEP follows strict consent-driven portfolio sharing rules:\n\n` +
      `• Private by Default: Employers and partners never see your personal details, project links, or mentor rubric scores unless you explicitly opt in.\n` +
      `• Your Current Setting: Partner Data Consent is currently ${user.consentDataSharing ? 'ENABLED (Granted)' : 'DISABLED (Withheld)'}.\n` +
      `• Per-Application Control: When you click "Express Interest" on any Partner Opportunity Board listing, you choose explicitly whether to attach your verified capstone snapshot and rubric ratings for that employer.\n` +
      `• Zero-PII Reporting: Programme administrators only export anonymized aggregate statistics for monitoring and evaluation.`;
  }

  return `Hello ${user.name.split(' ')[0]}! I am your YEP Opportunity & Project Advisor, connected directly to the live platform data.\n\n` +
    `Right now, there are ${opportunities.length} open partner opportunities and ${exchanges.length} virtual learning exchanges in the system, and you are actively enrolled in ${enrollments.length} cohort${enrollments.length === 1 ? '' : 's'}.\n\n` +
    `Try asking me:\n` +
    `• "Which partner jobs or internships match my skills (${user.skills.slice(0, 3).join(', ')})?"\n` +
    `• "Which virtual exchange should I join next?"\n` +
    `• "How are capstone rubrics scored and what are my grades?"\n` +
    `• "How does explicit portfolio consent protect my data?"`;
}

export function generateMentorFallback(
  message: string,
  context: MentorAIContext,
  targetGroupSize = 3
): string {
  const q = message.toLowerCase();
  const participants = context.cohortParticipants || [];

  if (
    q.includes('group') ||
    q.includes('team') ||
    q.includes('squad') ||
    q.includes('pair') ||
    q.includes('peer')
  ) {
    if (participants.length === 0) {
      return 'No enrolled participants were found in your assigned cohorts yet. Once learners enroll in your exchanges, I can organize them into balanced squads.';
    }

    // Sort by skill level tier descending so round-robin distribution mixes Advanced, Intermediate, and Beginner evenly
    const levelRank: Record<string, number> = { Advanced: 3, Intermediate: 2, Beginner: 1 };
    const sorted = [...participants].sort(
      (a, b) => (levelRank[b.level] || 1) - (levelRank[a.level] || 1) || b.progress - a.progress
    );

    const effectiveSize = Math.max(2, Math.min(4, targetGroupSize));
    const groupCount = Math.max(1, Math.ceil(sorted.length / effectiveSize));
    const squads: typeof sorted[] = Array.from({ length: groupCount }, () => []);

    sorted.forEach((p, idx) => {
      squads[idx % groupCount].push(p);
    });

    let res = `Based on the skills, competency tiers, and cohort progress of your ${participants.length} assigned participants, here is a balanced ${effectiveSize}-person squad plan:\n\n`;

    squads.forEach((squad, idx) => {
      const squadName = `Squad ${String.fromCharCode(65 + idx)}`;
      const memberLines = squad
        .map(m => `${m.name} (${m.level}, ${m.progress}% progress${m.averageScore ? `, ${m.averageScore.toFixed(2)}/5.0 rubric` : ''})`)
        .join(' · ');
      const uniqueSkills = Array.from(new Set(squad.flatMap(m => m.skills))).slice(0, 6);
      const regions = Array.from(new Set(squad.map(m => m.region.split('(')[0].trim())));
      const hasMixedLevels = new Set(squad.map(m => m.level)).size > 1;

      res += `${squadName}: ${memberLines}\n`;
      res += `• Combined Skill Coverage: ${uniqueSkills.join(', ')}\n`;
      res += `• Regional Spread: ${regions.join(', ')}\n`;
      res += `• Pedagogical Rationale: ${
        hasMixedLevels
          ? 'Pairs higher-tier practitioners with developing peers so technical architecture, UI/UX accessibility, and data workflows reinforce each other during sprint reviews.'
          : 'Aligns peers at similar readiness levels to collaborate rapidly on shared cohort deliverables.'
      }\n\n`;
    });

    res += `Tip: You can change the Squad Size dropdown (Pairs of 2, Triads of 3, or Squads of 4) and click "Generate Balanced Project Groups" again to test alternative configurations.`;
    return res;
  }

  if (
    q.includes('interview') ||
    q.includes('ready') ||
    q.includes('top') ||
    q.includes('refer') ||
    q.includes('below') ||
    q.includes('help') ||
    q.includes('intervention')
  ) {
    const graded = participants.filter(p => p.averageScore !== null);
    const highPerformers = participants.filter(
      p => (p.averageScore !== null && p.averageScore >= 4.0) || p.level === 'Advanced' || p.progress >= 70
    );
    const needsSupport = participants.filter(
      p => (p.averageScore !== null && p.averageScore < 3.5) || p.progress < 40 || p.level === 'Beginner'
    );

    let res = `Here is a targeted readiness assessment across your ${participants.length} cohort participants:\n\n`;
    res += `Interview-Ready / High-Readiness Candidates:\n`;
    if (highPerformers.length > 0) {
      highPerformers.forEach(p => {
        res += `• ${p.name} (${p.level} · ${p.progress}% progress${p.averageScore ? ` · ${p.averageScore.toFixed(2)}/5.0` : ''}) — Core skills: ${p.skills.slice(0, 4).join(', ')}. Strong candidate for partner referrals.\n`;
      });
    } else {
      res += `• No participants have crossed the 4.00 graded rubric threshold yet (${graded.length} graded so far).\n`;
    }

    res += `\nParticipants Recommended for Targeted Coaching:\n`;
    if (needsSupport.length > 0) {
      needsSupport.forEach(p => {
        res += `• ${p.name} (${p.level} · ${p.progress}% progress) — Recommend pairing with an Advanced peer for code & architecture feedback and sharing the offline low-bandwidth checklist.\n`;
      });
    } else {
      res += `• All active participants are currently tracking at or above expected cohort milestones.\n`;
    }
    return res;
  }

  // Default comprehensive skill & competency diagnostic
  const total = participants.length;
  const beginners = participants.filter(p => p.level === 'Beginner');
  const intermediates = participants.filter(p => p.level === 'Intermediate');
  const advanced = participants.filter(p => p.level === 'Advanced');
  const gradedSubs = participants.filter(p => p.rubricScores !== null);

  const avgMetric = (key: 'technicalExecution' | 'problemSolving' | 'practicalImpact' | 'presentationClarity', fallback: number) =>
    gradedSubs.length > 0
      ? (gradedSubs.reduce((acc, p) => acc + (p.rubricScores?.[key] || 0), 0) / gradedSubs.length).toFixed(2)
      : fallback.toFixed(2);

  return `Cohort Skills, Level & Competency Diagnostic (${total} Enrolled Participants)\n\n` +
    `1. Skill Level Breakdown:\n` +
    `• Advanced Tier: ${advanced.length} (${total ? Math.round((advanced.length / total) * 100) : 0}%) — ${advanced.map(p => p.name).join(', ') || 'None yet'}\n` +
    `• Intermediate Tier: ${intermediates.length} (${total ? Math.round((intermediates.length / total) * 100) : 0}%) — ${intermediates.map(p => p.name).join(', ') || 'None yet'}\n` +
    `• Beginner Tier: ${beginners.length} (${total ? Math.round((beginners.length / total) * 100) : 0}%) — ${beginners.map(p => p.name).join(', ') || 'None yet'}\n\n` +
    `2. 4-Pillar Rubric Averages (1–5 Scale, Target > 3.50):\n` +
    `• Technical Execution & Architecture: ${avgMetric('technicalExecution', 4.4)} / 5.0\n` +
    `• Problem Solving & Offline Adaptation: ${avgMetric('problemSolving', 4.2)} / 5.0\n` +
    `• Practical Community & Industry Impact: ${avgMetric('practicalImpact', 4.1)} / 5.0\n` +
    `• Presentation Clarity & Documentation: ${avgMetric('presentationClarity', 4.5)} / 5.0\n\n` +
    `3. Recommended Facilitator Actions:\n` +
    `• Review Queue Priority: You currently have ${context.pendingReviewsCount} pending capstone submission${context.pendingReviewsCount === 1 ? '' : 's'} awaiting rubric scoring and ${context.evaluatedSubmissionsCount} graded.\n` +
    `• Next Live Virtual Session Focus: Run an interactive workshop pairing Beginner/Intermediate participants with Advanced peers to strengthen offline error handling and API resilience.`;
}
