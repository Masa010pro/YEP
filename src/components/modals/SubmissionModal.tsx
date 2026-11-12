import React, { useState } from 'react';
import { useYep } from '../../context/YepContext';
import { VirtualExchange } from '../../types/yep';
import { X, WifiOff, UploadCloud, AlertCircle, CheckCircle2, Link2, FileText, Sparkles } from 'lucide-react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: VirtualExchange | null;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose, exchange }) => {
  const { submitProject, simulatedOffline } = useYep();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryLink, setRepositoryLink] = useState('');
  const [demoOrArtifactLink, setDemoOrArtifactLink] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState('');
  const [feedbackState, setFeedbackState] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen || !exchange) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackState(null);

    if (!title.trim() || !description.trim() || !keyTakeaways.trim()) {
      setFeedbackState({
        type: 'error',
        message: 'Please complete all required fields (Project Title, Work Description, and Key Takeaways).'
      });
      return;
    }

    const res = submitProject(exchange.id, {
      title: title.trim(),
      description: description.trim(),
      repositoryLink: repositoryLink.trim() || undefined,
      demoOrArtifactLink: demoOrArtifactLink.trim() || undefined,
      keyTakeaways: keyTakeaways.trim()
    });

    if (res.success) {
      setFeedbackState({
        type: 'success',
        message: res.message
      });
      setTimeout(() => {
        onClose();
        setFeedbackState(null);
      }, 1800);
    } else {
      setFeedbackState({
        type: 'error',
        message: res.message
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit Practical Capstone Project</h2>
            <p className="text-xs text-slate-500 mt-0.5">{exchange.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connectivity status banner */}
        {simulatedOffline ? (
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Low-Bandwidth Resilient Mode:</strong> Network is simulated offline. Your submission will be cached safely in local storage and queued for background synchronization.
            </span>
          </div>
        ) : (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-100 text-emerald-900 text-xs flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Online connection verified. Submissions are dispatched directly to the mentor review queue.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {feedbackState && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                feedbackState.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              {feedbackState.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{feedbackState.message}</span>
            </div>
          )}

          {/* Prompt reminder */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Assignment Prompt: {exchange.assignmentTitle}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{exchange.assignmentPrompt}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Resilient Low-Bandwidth REST Service with IndexedDB Fallback"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description of Practical Work & Methodology *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail your technical architecture, implementation decisions, and how you solved constraints..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Link2 className="w-3 h-3 text-slate-500" />
                <span>Code Repository URL (Git / GitHub)</span>
              </label>
              <input
                type="url"
                value={repositoryLink}
                onChange={e => setRepositoryLink(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500" />
                <span>Live Demo / Artifact URL</span>
              </label>
              <input
                type="url"
                value={demoOrArtifactLink}
                onChange={e => setDemoOrArtifactLink(e.target.value)}
                placeholder="https://my-demo-app.dev"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Key Learning Takeaways & Challenges Overcome *
            </label>
            <textarea
              rows={3}
              required
              value={keyTakeaways}
              onChange={e => setKeyTakeaways(e.target.value)}
              placeholder="What core architectural lesson did you gain? What trade-offs did you evaluate?"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
            />
          </div>

          {/* Mentorship Rubric Notice */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong>Evaluation Standard:</strong> Mentors grade submissions against the standardized 4-dimension 1–5 rubric: (1) Technical Execution, (2) Problem Solving & Initiative, (3) Practical Impact, and (4) Presentation Clarity.
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{simulatedOffline ? 'Queue for Offline Sync' : 'Submit Project to Mentor Queue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
