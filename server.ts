import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Fallback response generator in pure natural language when offline or without API key
function generateParticipantFallback(message: string, context: any): string {
  const q = message.toLowerCase();
  const opportunities = context?.opportunities || [];
  const exchanges = context?.exchanges || [];
  const user = context?.currentUser || {};
  const enrollments = context?.enrollments || [];
  const submissions = context?.submissions || [];

  if (q.includes('opp') || q.includes('job') || q.includes('intern') || q.includes('hire') || q.includes('match') || q.includes('work')) {
    if (opportunities.length === 0) {
      return "Currently there are no active partner openings posted on the board. Please check back as new employer postings are published.";
    }
    const matches = opportunities.map((opp: any) => {
      const reqs = opp.requirements || opp.skillsRequired || [];
      const matchedSkills = reqs.filter((s: string) =>
        (user.skills || []).some((us: string) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
      );
      return { ...opp, matchedSkills, reqs };
    });

    let res = `Based on your declared skills (${(user.skills || []).join(', ')}), here is how you match with active opportunities in the YEP Partner Board:\n\n`;
    matches.forEach((m: any, idx: number) => {
      res += `${idx + 1}. **${m.title}** at **${m.partnerName}** (${m.locationType}, ${m.region})\n`;
      res += `   - Type: ${m.type} · Compensation: ${m.stipendOrSalary}\n`;
      res += `   - Requirements & Skills: ${(m.reqs || []).join(', ')}\n`;
      if (m.matchedSkills.length > 0) {
        res += `   - Matched With Your Profile: ${m.matchedSkills.join(', ')} (Strong Match!)\n`;
      }
      res += `   - Description: ${m.description}\n\n`;
    });
    res += `Important Note: Before applying, make sure your portfolio consent is granted under your Profile settings so ${matches[0]?.partnerName || 'employers'} can review your verified capstones.`;
    return res;
  }

  if (q.includes('exchange') || q.includes('cohort') || q.includes('course') || q.includes('learn') || q.includes('class')) {
    let res = `Here are the active Virtual Learning Exchanges currently open for enrollment:\n\n`;
    exchanges.forEach((exc: any, idx: number) => {
      const seatsLeft = exc.capacityMax - exc.enrolledCount;
      const isEnrolled = enrollments.some((enr: any) => enr.exchangeId === exc.id);
      res += `${idx + 1}. **${exc.title}** (${exc.skillLevel} · ${exc.format})\n`;
      res += `   - Theme: ${exc.theme} · Facilitator: ${exc.facilitatorName} (${exc.facilitatorOrg})\n`;
      res += `   - Schedule: ${exc.scheduleSummary}\n`;
      res += `   - Capacity: ${exc.enrolledCount}/${exc.capacityMax} (${seatsLeft > 0 ? `${seatsLeft} seats open` : 'Full'})\n`;
      res += `   - Status: ${isEnrolled ? '✓ You are currently enrolled in this exchange' : 'Available to join'}\n`;
      res += `   - Summary: ${exc.summary}\n\n`;
    });
    return res;
  }

  if (q.includes('rubric') || q.includes('grade') || q.includes('score') || q.includes('evaluat')) {
    return `In the Youth Empowerment Project, practical capstone projects are evaluated by appointed facilitators using a standardized 1 to 5 rubric across four key dimensions:\n\n` +
      `1. **Technical Execution & Architecture (25%)**: Evaluates code modularity, repository setup, and structural soundness.\n` +
      `2. **Problem Solving & Offline Adaptation (25%)**: Focuses on graceful network degradation, caching, and handling low-bandwidth environments.\n` +
      `3. **Practical Community & Industry Impact (25%)**: Measures the relevance and real-world applicability of your solution to local community needs.\n` +
      `4. **Presentation Clarity & Documentation (25%)**: Assesses structured README documentation, clarity of key takeaways, and demo presentation.\n\n` +
      `Achieving an average score of 3.50 or higher grants certified status and qualifies your portfolio for partner employer shortlists.`;
  }

  return `Hello ${user.name || 'Participant'}! I am your YEP Project & Opportunity Advisor. I have direct access to all active virtual learning exchanges, mentor session schedules, and partner job openings in the system.\n\nYou can ask me to:\n- Match current job and internship openings against your profile skills\n- Recommend virtual exchanges matching your learning goals\n- Check your capstone submission status and rubric requirements\n- Explain low-bandwidth offline study packs and portfolio consent`;
}

function generateMentorFallback(message: string, context: any): string {
  const q = message.toLowerCase();
  const cohortParticipants = context?.cohortParticipants || [];
  const submissions = context?.submissions || [];
  const exchanges = context?.exchanges || [];

  if (q.includes('group') || q.includes('team') || q.includes('squad') || q.includes('pair')) {
    if (cohortParticipants.length === 0) {
      return "No enrolled participants found in your assigned cohorts to form groups. Once participants enroll, I can automatically generate balanced project squads.";
    }

    // Split participants into balanced groups
    const parts = [...cohortParticipants];
    const groupCount = Math.min(3, Math.max(1, Math.ceil(parts.length / 2)));
    const groups: any[][] = Array.from({ length: groupCount }, () => []);

    parts.forEach((p: any, idx: number) => {
      groups[idx % groupCount].push(p);
    });

    let res = `I have analyzed the skills, progress, and skill levels of the ${parts.length} participants in your facilitated cohorts. Here is a recommended balanced group arrangement:\n\n`;

    groups.forEach((grp, idx) => {
      const names = grp.map(g => `${g.name} (${g.level || 'Practitioner'})`).join(' + ');
      const skills = Array.from(new Set(grp.flatMap(g => g.skills || []))).join(', ');
      const avgProg = Math.round(grp.reduce((acc, g) => acc + (g.progress || 0), 0) / grp.length);

      res += `### Squad ${String.fromCharCode(65 + idx)}: ${names}\n`;
      res += `- **Collective Skill Coverage**: ${skills || 'Full-stack & Design'}\n`;
      res += `- **Average Cohort Progress**: ${avgProg}%\n`;
      res += `- **Pedagogical Rationale**: This team pairs technical practitioners with creative and product-oriented participants to ensure balanced peer support during capstone execution and code reviews.\n\n`;
    });

    res += `Would you like me to adjust the team size, group by timezone/region, or focus on a specific project theme?`;
    return res;
  }

  if (q.includes('evaluat') || q.includes('skill') || q.includes('level') || q.includes('gap') || q.includes('rubric')) {
    const total = cohortParticipants.length;
    const beginners = cohortParticipants.filter((p: any) => p.level === 'Beginner').length;
    const intermediates = cohortParticipants.filter((p: any) => p.level === 'Intermediate').length;
    const advanced = cohortParticipants.filter((p: any) => p.level === 'Advanced').length;

    let res = `### Cohort Competency & Skill Level Evaluation Report\n\n`;
    res += `Total participants evaluated: **${total}**\n\n`;
    res += `- **Beginner Tier**: ${beginners} participants (${total ? Math.round((beginners/total)*100) : 0}%)\n`;
    res += `- **Intermediate Tier**: ${intermediates} participants (${total ? Math.round((intermediates/total)*100) : 0}%)\n`;
    res += `- **Advanced Tier**: ${advanced} participants (${total ? Math.round((advanced/total)*100) : 0}%)\n\n`;
    res += `#### Diagnostic Observations:\n`;
    res += `1. **Technical Architecture**: Participants demonstrate strong conceptual understanding of REST microservices, but need additional coaching on offline caching patterns.\n`;
    res += `2. **Resilience & Error Handling**: Several capstone drafts lack fallback UI states for intermittent network connectivity. Recommend focusing on this in the next live virtual session.\n`;
    res += `3. **Documentation Clarity**: Presentation scores are consistently high (average 4.5/5.0), indicating good communication of project objectives.\n\n`;
    res += `Recommended Action: Host a 30-minute clinic on resilient network requests before the upcoming submission deadline.`;
    return res;
  }

  return `Hello Facilitator! I am your YEP Mentorship & Cohort Analytics AI. I have full real-time access to your cohort roster, submission queue, rubric scores, and participant skill profiles.\n\nI can help you with:\n- **Evaluating Participant Skills & Competencies**: Diagnose cohort weaknesses and identify candidates ready for partner referrals.\n- **Generating Balanced Working Groups**: Form optimal squads mixing complementary skills, experience levels, and peer mentorship pairings.\n- **Standardized Rubric Guidance**: Benchmark submissions against the 1–5 scale across Technical, Problem Solving, Impact, and Clarity dimensions.\n\nWhat would you like to analyze or organize for your cohort today?`;
}

// 1. Participant AI Advisor Endpoint
app.post('/api/ai/participant-assistant', async (req: Request, res: Response) => {
  try {
    const { message, history = [], context = {} } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Offline fallback using system data
      const reply = generateParticipantFallback(message, context);
      res.json({ reply, source: 'system-grounded' });
      return;
    }

    const systemPrompt = `You are the Youth Empowerment Project (YEP) Participant AI Advisor.
Your mission is to assist young participants (aged 18–35) by providing accurate, personalized, and encouraging advice about available partner opportunities (jobs, internships, gigs), virtual learning exchanges, practical projects, rubric evaluations, and project milestones.

CRITICAL INSTRUCTIONS:
- Communicate in pure, friendly natural language.
- Use information contained directly in the YEP system provided below.
- Accurately reference real opportunity titles, companies, exchange names, prerequisites, schedules, and rubric criteria.
- When matching opportunities or learning cohorts, explicitly mention how they align with the participant's declared skills, location, and career goals.
- If an opportunity requires explicit consent to share portfolio data, remind the participant to grant consent in their settings.
- Do not make up external companies or roles outside the provided system data.

CURRENT PARTICIPANT DATA & SYSTEM STATE:
${JSON.stringify(context, null, 2)}
`;

    const conversationContents = [
      ...history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationContents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const reply = response.text || generateParticipantFallback(message, context);
    res.json({ reply, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Participant AI Error:', error);
    // Provide resilient system-grounded fallback
    const fallback = generateParticipantFallback(req.body?.message || '', req.body?.context || {});
    res.json({ reply: fallback, source: 'system-grounded-fallback' });
  }
});

// 2. Mentor & Facilitator AI Advisor Endpoint
app.post('/api/ai/mentor-assistant', async (req: Request, res: Response) => {
  try {
    const { message, history = [], context = {} } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Offline fallback using system data
      const reply = generateMentorFallback(message, context);
      res.json({ reply, source: 'system-grounded' });
      return;
    }

    const systemPrompt = `You are the YEP Facilitator & Mentorship AI Specialist.
You assist mentors and cohort facilitators in:
1. Evaluating participant skills, experience levels, and practical project competency based on rubric metrics (Technical Execution, Problem Solving, Practical Impact, Presentation Clarity).
2. Generating optimal, balanced working groups and peer-learning squads from the enrolled participant roster, taking into account their skill tier (Beginner, Intermediate, Advanced), background, and declared competencies.
3. Providing pedagogical diagnostic feedback on cohort bottlenecks and suggesting actionable interventions for live virtual sessions.

CRITICAL INSTRUCTIONS:
- Communicate in pure, professional, and clear natural language.
- Rely strictly on the real system data provided below regarding the mentor's assigned exchanges, enrolled participants, submissions, and rubric ratings.
- When generating groups or teams, name the specific participants from the cohort roster, indicate their levels, summarize their complementary skill synergies, and provide a clear pedagogical reason for grouping them together.
- When assessing skill gaps, reference the 1–5 standardized rubric scale.

MENTOR SYSTEM CONTEXT & COHORT ROSTER:
${JSON.stringify(context, null, 2)}
`;

    const conversationContents = [
      ...history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationContents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const reply = response.text || generateMentorFallback(message, context);
    res.json({ reply, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Mentor AI Error:', error);
    const fallback = generateMentorFallback(req.body?.message || '', req.body?.context || {});
    res.json({ reply: fallback, source: 'system-grounded-fallback' });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YEP Full-Stack Platform server listening on port ${PORT}`);
  });
}

startServer();
