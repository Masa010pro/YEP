import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateParticipantFallback, generateMentorFallback } from './src/utils/aiFallback';
import type { LanguageCode } from './src/i18n/translations';

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

// 1. Participant AI Advisor Endpoint
app.post('/api/ai/participant-assistant', async (req: Request, res: Response) => {
  try {
    const { message, history = [], context = {}, language = 'en', languageName = 'English' } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const langCode = (language || 'en') as LanguageCode;
    const ai = getGenAIClient();
    if (!ai) {
      // Offline fallback using system data
      const reply = generateParticipantFallback(message, context, langCode);
      res.json({ reply, source: 'system-grounded' });
      return;
    }

    const systemPrompt = `You are the Youth Empowerment Project (YEP) Participant AI Advisor.
Your mission is to assist young participants (aged 18–35) by providing accurate, personalized, and encouraging advice about available partner opportunities (jobs, internships, gigs), virtual learning exchanges, practical projects, rubric evaluations, and project milestones.

CRITICAL INSTRUCTIONS:
- Language requirement: Respond fluently and naturally in **${languageName}** (language code: ${language}). Keep real system entity titles (like partner names, exchange titles, and technical terms) accurate, while writing all explanations, greetings, and advice in ${languageName}.
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

    const reply = response.text || generateParticipantFallback(message, context, langCode);
    res.json({ reply, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Participant AI Error:', error);
    // Provide resilient system-grounded fallback
    const fallback = generateParticipantFallback(
      req.body?.message || '',
      req.body?.context || {},
      (req.body?.language || 'en') as LanguageCode
    );
    res.json({ reply: fallback, source: 'system-grounded-fallback' });
  }
});

// 2. Mentor & Facilitator AI Advisor Endpoint
app.post('/api/ai/mentor-assistant', async (req: Request, res: Response) => {
  try {
    const { message, history = [], context = {}, language = 'en', languageName = 'English' } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const langCode = (language || 'en') as LanguageCode;
    const ai = getGenAIClient();
    if (!ai) {
      // Offline fallback using system data
      const reply = generateMentorFallback(message, context, 3, langCode);
      res.json({ reply, source: 'system-grounded' });
      return;
    }

    const systemPrompt = `You are the YEP Facilitator & Mentorship AI Specialist.
You assist mentors and cohort facilitators in:
1. Evaluating participant skills, experience levels, and practical project competency based on rubric metrics (Technical Execution, Problem Solving, Practical Impact, Presentation Clarity).
2. Generating optimal, balanced working groups and peer-learning squads from the enrolled participant roster, taking into account their skill tier (Beginner, Intermediate, Advanced), background, and declared competencies.
3. Providing pedagogical diagnostic feedback on cohort bottlenecks and suggesting actionable interventions for live virtual sessions.

CRITICAL INSTRUCTIONS:
- Language requirement: Respond fluently and professionally in **${languageName}** (language code: ${language}). Keep real participant names, exchange titles, and numerical rubric metrics accurate, while writing all analysis, greetings, and rationales in ${languageName}.
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

    const reply = response.text || generateMentorFallback(message, context, 3, langCode);
    res.json({ reply, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Mentor AI Error:', error);
    const fallback = generateMentorFallback(
      req.body?.message || '',
      req.body?.context || {},
      3,
      (req.body?.language || 'en') as LanguageCode
    );
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
