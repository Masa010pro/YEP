import React, { useState, useRef, useEffect } from 'react';
import { useYep } from '../../context/YepContext';
import { UserAvatar } from '../common/UserAvatar';
import { generateParticipantFallback, ParticipantAIContext } from '../../utils/aiFallback';
import {
  Sparkles,
  Send,
  X,
  Bot,
  Briefcase,
  GraduationCap,
  Award,
  ChevronDown,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const ParticipantAIAssistant: React.FC = () => {
  const {
    currentUser,
    exchanges,
    opportunities,
    enrollments,
    submissions,
    achievements
  } = useYep();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I am your personal YEP Opportunity & Project Advisor. I can analyze your declared skills (${(currentUser?.skills || []).slice(0, 3).join(', ')}), match you with partner job & internship openings, guide you on active learning exchanges, and explain capstone rubric requirements in pure natural language. What can I help you discover today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!currentUser) return null;

  const quickPrompts = [
    {
      icon: <Briefcase className="w-3.5 h-3.5 text-indigo-600" />,
      label: 'Match partner jobs to my skills',
      prompt: 'Based on my declared skills and region, which open partner opportunities on the board match me best?'
    },
    {
      icon: <GraduationCap className="w-3.5 h-3.5 text-blue-600" />,
      label: 'Recommend next virtual exchange',
      prompt: 'Which virtual learning exchange should I enroll in next to advance toward my career goals?'
    },
    {
      icon: <Award className="w-3.5 h-3.5 text-emerald-600" />,
      label: 'How are capstone rubrics scored?',
      prompt: 'Explain the 1-5 standardized rubric criteria and how my capstones are graded across the 4 competencies.'
    },
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />,
      label: 'Explain portfolio consent rules',
      prompt: 'How does explicit consent protect my portfolio data when expressing interest in partner jobs?'
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Assemble full real-time system context
    const participantContext: ParticipantAIContext = {
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        age: currentUser.age,
        region: currentUser.region,
        skills: currentUser.skills,
        interests: currentUser.interests,
        careerGoal: currentUser.careerGoal,
        bio: currentUser.bio,
        consentDataSharing: currentUser.consentDataSharing
      },
      opportunities: opportunities.map(o => ({
        id: o.id,
        title: o.title,
        partnerName: o.partnerName,
        type: o.type,
        locationType: o.locationType,
        region: o.region,
        stipendOrSalary: o.stipendOrSalary,
        requirements: o.requirements,
        description: o.description,
        status: o.status
      })),
      exchanges: exchanges.map(e => ({
        id: e.id,
        title: e.title,
        theme: e.theme,
        skillLevel: e.skillLevel,
        format: e.format,
        facilitatorName: e.facilitatorName,
        facilitatorOrg: e.facilitatorOrg,
        capacityMax: e.capacityMax,
        enrolledCount: e.enrolledCount,
        scheduleSummary: e.scheduleSummary,
        summary: e.summary,
        learningOutcomes: e.learningOutcomes,
        status: e.status
      })),
      enrollments: enrollments.filter(e => e.participantId === currentUser.id),
      submissions: submissions.filter(s => s.participantId === currentUser.id).map(s => ({
        id: s.id,
        title: s.title,
        status: s.status,
        grade: s.grade
      }))
    };

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/ai/participant-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          context: participantContext
        })
      });

      if (!res.ok) {
        throw new Error(`Static mode (${res.status})`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || generateParticipantFallback(text, participantContext),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Seamless pure-natural-language static/GitHub Pages fallback grounded in system state
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: generateParticipantFallback(text, participantContext),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-slate-800 text-white rounded-full p-4 shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 cursor-pointer border border-slate-700 group"
          title="Open Participant AI Advisor"
          aria-label="Open Participant AI Advisor"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline">
            Ask YEP AI Advisor
          </span>
        </button>
      )}

      {/* Floating Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 bg-white shadow-2xl rounded-2xl border border-slate-200 flex flex-col overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[460px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Participant AI Advisor</span>
                  <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                    Grounded in System Data
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Matching opportunities, exchanges, and capstone guidance
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title={isExpanded ? 'Restore window size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0 flex items-center gap-2 no-scrollbar text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
              Quick Inquiries:
            </span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(qp.prompt)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 border border-slate-200 rounded-lg shrink-0 transition-colors cursor-pointer shadow-2xs font-medium text-[11px]"
              >
                {qp.icon}
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50/40">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-emerald-400 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-3.5 max-w-[85%] space-y-1.5 ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="text-[10px] font-semibold opacity-70 flex items-center justify-between gap-4">
                    <span>{msg.sender === 'user' ? currentUser.name : 'YEP Advisor'}</span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed text-xs">
                    {msg.text}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <UserAvatar name={currentUser.name} role="participant" size="xs" className="mt-0.5" />
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-emerald-400 border border-slate-800 flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-xs flex items-center gap-2 text-slate-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span className="text-[11px]">Analyzing opportunities & system records in natural language...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask anything about jobs, exchanges, capstone projects, rubrics..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4 text-emerald-400" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
