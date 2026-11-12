import React, { useState } from 'react';
import { VirtualExchange } from '../../types/yep';
import { X, Download, FileText, CheckSquare, HardDrive } from 'lucide-react';

interface OfflineStudyPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: VirtualExchange | null;
}

export const OfflineStudyPackModal: React.FC<OfflineStudyPackModalProps> = ({
  isOpen,
  onClose,
  exchange
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !exchange) return null;

  const handleDownload = () => {
    const content = `${exchange.offlinePack.notesMarkdown}\n\n## Action Checklist\n${exchange.offlinePack.checklist
      .map(c => `- [ ] ${c}`)
      .join('\n')}\n\nGenerated for offline use by Youth Empowerment Project.`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exchange.offlinePack.title || 'YEP-StudyBundle.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exchange.offlinePack.notesMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Low-Bandwidth Offline Study Bundle
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {exchange.title} · Estimated Bundle Size: {(exchange.offlinePack.fileSizeBytes / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 leading-relaxed">
            <strong>Optimized for low-connectivity regions:</strong> This study pack contains the full text syllabus, offline architectural cheat sheets, formulas, and self-checklists. You can review and complete practical assignments completely disconnected from the internet.
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Full Study Notes (Markdown)</span>
            </h3>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-h-64 border border-slate-800">
              {exchange.offlinePack.notesMarkdown}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Offline Milestone Checklist</span>
            </h3>
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {exchange.offlinePack.checklist.map((item, idx) => (
                <label key={idx} className="flex items-start gap-2 text-slate-700 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded text-emerald-600" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Raw Text'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.MD Study Pack)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
