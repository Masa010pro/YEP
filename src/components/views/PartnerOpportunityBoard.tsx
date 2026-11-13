import React, { useState } from 'react';
import { useYep } from '../../context/YepContext';
import { useLanguage } from '../../context/LanguageContext';
import { PartnerOpportunity, ExpressionOfInterest, OpportunityType, LocationType } from '../../types/yep';
import { UserAvatar } from '../common/UserAvatar';
import {
  Briefcase,
  Calendar,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Plus,
  Send,
  ShieldAlert,
  ShieldCheck,
  X,
  Pencil
} from 'lucide-react';

export const PartnerOpportunityBoard: React.FC = () => {
  const {
    currentUser,
    users,
    opportunities,
    expressionsOfInterest,
    publishOpportunity,
    submitExpressionOfInterest,
    sendApplicantMessage,
    updateApplicantStatus,
    openProfileEditor
  } = useYep();
  const { t } = useLanguage();

  // State for posting new opportunity
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postType, setPostType] = useState<OpportunityType>('Entry-Level Digital Work');
  const [postLocation, setPostLocation] = useState<LocationType>('Remote');
  const [postRegion, setPostRegion] = useState('Sub-Saharan Africa / Pan-African');
  const [postSalary, setPostSalary] = useState('$1,200 – $1,500 / month (Paid)');
  const [postClosingDate, setPostClosingDate] = useState('2026-12-30');
  const [postDesc, setPostDesc] = useState('');
  const [postReqs, setPostReqs] = useState('Verified YEP Cloud or Web Dev Capstone, Git familiarity');

  // State for expressing interest (Participant)
  const [eoiModalOpp, setEoiModalOpp] = useState<PartnerOpportunity | null>(null);
  const [explicitConsentGranted, setExplicitConsentGranted] = useState(true);
  const [eoiFeedback, setEoiFeedback] = useState<{ success: boolean; text: string } | null>(null);

  // State for communication drawer with candidate (Partner)
  const [activeEoiForChat, setActiveEoiForChat] = useState<ExpressionOfInterest | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState('');

  if (!currentUser) return null;

  const isPartner = currentUser.role === 'partner' || currentUser.role === 'admin';
  const isParticipant = currentUser.role === 'participant';

  // Filter EOI for current partner if partner
  const relevantEois = isPartner
    ? expressionsOfInterest.filter(e => currentUser.role === 'admin' || e.partnerId === currentUser.id)
    : expressionsOfInterest.filter(e => e.participantId === currentUser.id);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    publishOpportunity({
      partnerId: currentUser.id,
      partnerName: currentUser.titleOrOrg || currentUser.name,
      partnerType: 'Vetted Industry Partner',
      partnerLogo: '💼',
      title: postTitle,
      type: postType,
      locationType: postLocation,
      region: postRegion,
      stipendOrSalary: postSalary,
      closingDate: postClosingDate,
      description: postDesc,
      requirements: postReqs.split(',').map(r => r.trim()).filter(Boolean)
    });

    setIsPostingModalOpen(false);
    setPostTitle('');
    setPostDesc('');
  };

  const handleConfirmEoi = () => {
    if (!eoiModalOpp) return;
    const res = submitExpressionOfInterest(eoiModalOpp.id, explicitConsentGranted);
    setEoiFeedback({ success: res.success, text: res.message });
    setTimeout(() => {
      setEoiModalOpp(null);
      setEoiFeedback(null);
    }, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEoiForChat || !chatMessageInput.trim()) return;

    sendApplicantMessage(activeEoiForChat.id, chatMessageInput.trim());
    setChatMessageInput('');
    // refresh active eoi reference
    const updated = expressionsOfInterest.find(item => item.id === activeEoiForChat.id);
    if (updated) {
      setActiveEoiForChat({ ...updated });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-indigo-700 tracking-wide uppercase mb-1">
              {t('Employment & Industry Linkages')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {t('Partner Opportunity Board')}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {t('Connecting qualified young participants with vetted entry-level digital roles, paid internships, and freelance gigs. Fully governed by explicit consent data-sharing rules.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => openProfileEditor(currentUser.id)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{t('Edit Profile')}</span>
            </button>
            {isPartner && (
              <button
                onClick={() => setIsPostingModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('Publish New Digital Opening')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabular Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-100 text-xs">
          <div>
            <div className="text-slate-500">{t('Published Openings')}</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {opportunities.length}
            </div>
            <div className="text-[11px] text-slate-400">Vetted employers & NGOs</div>
          </div>
          <div>
            <div className="text-slate-500">{t('Expressions of Interest')}</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {expressionsOfInterest.length}
            </div>
            <div className="text-[11px] text-slate-400">Candidate applications</div>
          </div>
          <div>
            <div className="text-slate-500">{t('Consent Compliance')}</div>
            <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
              100%
            </div>
            <div className="text-[11px] text-slate-400">Zero default data exposure</div>
          </div>
          <div>
            <div className="text-slate-500">{t('Interviews Invited')}</div>
            <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums mt-0.5">
              {expressionsOfInterest.filter(e => e.status === 'interview_invited').length}
            </div>
            <div className="text-[11px] text-slate-400">Direct talent outreach</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Opportunities vs Expressions of Interest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Openings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {t('Active Vetted Openings')} ({opportunities.length})
            </h2>
            <span className="text-xs text-slate-500">Strictly Fair Compensation & Growth</span>
          </div>

          <div className="space-y-4">
            {opportunities.map(opp => {
              const hasApplied = expressionsOfInterest.some(
                e => e.opportunityId === opp.id && e.participantId === currentUser.id
              );

              return (
                <div
                  key={opp.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-all space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      {/* Clean unboxed metadata */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-indigo-700">{opp.partnerName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{opp.type}</span>
                        <span aria-hidden="true">·</span>
                        <span>{opp.locationType} ({opp.region})</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {opp.title}
                      </h3>
                      <div className="text-xs font-semibold text-slate-800 mt-0.5">
                        Compensation: <span className="text-emerald-700">{opp.stipendOrSalary}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Closes {opp.closingDate}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Requirements checklist */}
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-1.5">
                      Candidate Requirements & Prerequisites:
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                      {opp.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Explicit portfolio consent requested upon application</span>
                    </div>

                    {isParticipant && (
                      <div>
                        {hasApplied ? (
                          <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t('Interest Expressed')}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEoiModalOpp(opp)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            {t('Express Interest')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Candidate Applications & Expressions of Interest */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>
                  {isPartner ? t('Consented Candidate Expressions') : t('My Opportunity Applications')}
                </span>
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {relevantEois.length}
              </span>
            </div>

            {relevantEois.length > 0 ? (
              <div className="space-y-3">
                {relevantEois.map(eoi => (
                  <div
                    key={eoi.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={eoi.participantName}
                            role="participant"
                            avatarUrl={users.find(u => u.id === eoi.participantId)?.avatarUrl}
                            size="xs"
                          />
                          <span className="font-bold text-slate-900">{eoi.participantName}</span>
                        </div>
                        <span className="text-[11px] font-mono tabular-nums text-slate-500">
                          {new Date(eoi.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Applied for: <span className="font-medium text-slate-700">{eoi.opportunityTitle}</span>
                      </div>
                    </div>

                    {/* Explicit Consent Flag */}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {eoi.consentedToSharePortfolio ? (
                        <div className="flex items-center gap-1 text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Explicit Consent: Granted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Consent: Withheld (Protected)</span>
                        </div>
                      )}
                    </div>

                    {/* Consented Portfolio Evidence preview */}
                    {eoi.consentedToSharePortfolio && eoi.portfolioSnapshot.verifiedSubmissions.length > 0 && (
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                        <div className="font-semibold text-slate-800">Verified Capstone Evidence:</div>
                        {eoi.portfolioSnapshot.verifiedSubmissions.map((sub, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-600">
                            <span className="truncate max-w-[170px]">{sub.projectTitle}</span>
                            <span className="font-mono tabular-nums font-bold text-emerald-700">
                              {sub.averageScore} / 5.0
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status & Messaging Button */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="capitalize text-slate-600 font-medium text-[11px]">
                        Status: <strong className="text-slate-900">{eoi.status.replace('_', ' ')}</strong>
                      </span>

                      <button
                        onClick={() => {
                          const item = expressionsOfInterest.find(i => i.id === eoi.id);
                          if (item) setActiveEoiForChat({ ...item });
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 font-medium text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        <span>Chat ({eoi.messages.length})</span>
                      </button>
                    </div>

                    {/* Partner Interview Invitation quick action */}
                    {isPartner && eoi.status !== 'interview_invited' && (
                      <button
                        onClick={() => {
                          updateApplicantStatus(eoi.id, 'interview_invited', 'Invited to technical introductory call.');
                          sendApplicantMessage(
                            eoi.id,
                            `Hello ${eoi.participantName}, your verified portfolio has been shortlisted! We would like to schedule an introductory video call with our engineering lead.`
                          );
                        }}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors cursor-pointer text-center"
                      >
                        {t('Invite to Interview Call')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                {isPartner
                  ? 'No expressions of interest received yet for your published openings.'
                  : 'You have not submitted an expression of interest to any openings yet.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explicit Consent Application Modal (Participant) */}
      {eoiModalOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Express Interest in Opportunity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{eoiModalOpp.title}</p>
              </div>
              <button
                onClick={() => setEoiModalOpp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {eoiFeedback && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    eoiFeedback.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{eoiFeedback.text}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900">Company / Partner: {eoiModalOpp.partnerName}</div>
                <div className="text-slate-600">Location: {eoiModalOpp.locationType} ({eoiModalOpp.region})</div>
                <div className="text-slate-600">Compensation: {eoiModalOpp.stipendOrSalary}</div>
              </div>

              {/* Explicit Consent Checkbox Section */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consentCheckbox"
                    checked={explicitConsentGranted}
                    onChange={e => setExplicitConsentGranted(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="consentCheckbox" className="font-semibold text-slate-900 cursor-pointer">
                    Grant Explicit Portfolio & Rubric Evaluation Sharing Consent
                  </label>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                  By checking this box, you authorize <strong>{eoiModalOpp.partnerName}</strong> to review your verified YEP project submissions, mentor 1–5 rubric ratings, and code repository links.
                </p>
                {!explicitConsentGranted && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                    <strong>Notice:</strong> If unchecked, your contact email will still be submitted, but all capstone artifacts and rubric grades will remain completely private.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEoiModalOpp(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEoi}
                  className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm & Submit Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post New Opportunity Modal (Partner) */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900">Publish New Digital Opportunity</h3>
              <button
                onClick={() => setIsPostingModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  placeholder="e.g. Junior Cloud Infrastructure Associate"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Opportunity Type</label>
                  <select
                    value={postType}
                    onChange={e => setPostType(e.target.value as OpportunityType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Entry-Level Digital Work">Entry-Level Digital Work</option>
                    <option value="Paid Internship">Paid Internship</option>
                    <option value="Freelance Gig">Freelance Gig</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Work Arrangement</label>
                  <select
                    value={postLocation}
                    onChange={e => setPostLocation(e.target.value as LocationType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-Site">On-Site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Compensation / Stipend *</label>
                  <input
                    type="text"
                    required
                    value={postSalary}
                    onChange={e => setPostSalary(e.target.value)}
                    placeholder="e.g. $1,200 / month (Paid)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Closing Date</label>
                  <input
                    type="date"
                    required
                    value={postClosingDate}
                    onChange={e => setPostClosingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Role Description *</label>
                <textarea
                  rows={3}
                  required
                  value={postDesc}
                  onChange={e => setPostDesc(e.target.value)}
                  placeholder="Detail the day-to-day work, team structure, and technologies used..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Candidate Requirements (comma-separated)
                </label>
                <input
                  type="text"
                  value={postReqs}
                  onChange={e => setPostReqs(e.target.value)}
                  placeholder="YEP Cloud Capstone, Git, Written English"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPostingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-xs"
                >
                  Publish Opening to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secure Candidate Messaging Drawer */}
      {activeEoiForChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={activeEoiForChat.participantName}
                  role="participant"
                  avatarUrl={users.find(u => u.id === activeEoiForChat.participantId)?.avatarUrl}
                  size="sm"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Candidate Secure Messaging
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeEoiForChat.participantName} · {activeEoiForChat.opportunityTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveEoiForChat(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/30">
              {activeEoiForChat.messages.length > 0 ? (
                activeEoiForChat.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl max-w-[85%] ${
                      msg.senderRole === 'partner'
                        ? 'ml-auto bg-slate-900 text-white'
                        : 'mr-auto bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="text-[10px] opacity-75 mb-0.5">{msg.senderName}</div>
                    <p className="leading-relaxed">{msg.message}</p>
                    <div className="text-[9px] opacity-60 text-right mt-1 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No messages yet. Send an introductory note or interview invitation.
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={chatMessageInput}
                onChange={e => setChatMessageInput(e.target.value)}
                placeholder="Type secure message or meeting details..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
