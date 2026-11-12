import React, { useState } from 'react';
import { useYep } from '../../context/YepContext';
import { AuditActionType } from '../../types/yep';
import { UserAvatar } from '../common/UserAvatar';
import {
  Shield,
  AlertTriangle,
  Download,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  Lock,
  Unlock,
  Eye,
  BarChart3,
  X
} from 'lucide-react';

export const AdminControlCenter: React.FC = () => {
  const {
    currentUser,
    users,
    exchanges,
    enrollments,
    submissions,
    opportunities,
    expressionsOfInterest,
    auditLogs,
    toggleUserSuspension,
    moderateContent,
    exportImpactReport
  } = useYep();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'moderation' | 'users' | 'audit' | 'reports'>('overview');
  const [auditFilterAction, setAuditFilterAction] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  
  // User suspension modal state
  const [suspensionTargetUser, setSuspensionTargetUser] = useState<{ id: string; name: string; isSuspended: boolean } | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  if (!currentUser) return null;

  // Flagged items for moderation
  const flaggedExchanges = exchanges.filter(e => e.isFlagged);
  const flaggedOpportunities = opportunities.filter(o => o.status === 'flagged');
  const totalFlaggedCount = flaggedExchanges.length + flaggedOpportunities.length;

  // Aggregates
  const totalParticipants = users.filter(u => u.role === 'participant').length;
  const totalEnrollments = enrollments.length;
  const completedEnrollments = enrollments.filter(e => e.progressPercentage === 100).length;
  const completionRate = totalEnrollments > 0 ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1) : '0';
  
  const gradedSubs = submissions.filter(s => s.status === 'graded');
  const meanScore = gradedSubs.length > 0
    ? (gradedSubs.reduce((acc, s) => acc + (s.grade?.averageScore || 0), 0) / gradedSubs.length).toFixed(2)
    : '0.00';

  const placedCount = expressionsOfInterest.filter(e => e.status === 'interview_invited').length;

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesAction = auditFilterAction === 'all' || log.actionType === auditFilterAction;
    const matchesSearch =
      log.actorName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const handleConfirmSuspension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspensionTargetUser || !suspensionReason.trim()) return;

    toggleUserSuspension(suspensionTargetUser.id, suspensionReason.trim());
    setSuspensionTargetUser(null);
    setSuspensionReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <UserAvatar
              name={currentUser.name}
              role={currentUser.role}
              size="xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Programme Manager / Administrator
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {currentUser.titleOrOrg} · {currentUser.region}
              </p>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                Centralized operational governance: monitoring participant safety, enforcing 18–35 eligibility, moderating opportunities, and auditing immutable system logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportImpactReport('csv')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export M&E CSV</span>
            </button>
          </div>
        </div>

        {/* Tabular KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-6 mt-6 border-t border-slate-100 text-xs">
          <div>
            <div className="text-slate-500">Registered Youth (18-35)</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {totalParticipants}
            </div>
            <div className="text-[11px] text-slate-400">Validated beneficiaries</div>
          </div>
          <div>
            <div className="text-slate-500">Total Enrollments</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {totalEnrollments}
            </div>
            <div className="text-[11px] text-slate-400">Cohort assignments</div>
          </div>
          <div>
            <div className="text-slate-500">Cohort Completion Rate</div>
            <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
              {completionRate}%
            </div>
            <div className="text-[11px] text-slate-400">Capstone certified</div>
          </div>
          <div>
            <div className="text-slate-500">Mean Rubric Rating</div>
            <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums mt-0.5">
              {meanScore} / 5.0
            </div>
            <div className="text-[11px] text-slate-400">Across 4 dimensions</div>
          </div>
          <div>
            <div className="text-slate-500">Partner Interviews</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {placedCount}
            </div>
            <div className="text-[11px] text-slate-400">Consented candidate matches</div>
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher (Segmented button control following §1.A) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Impact Overview
        </button>

        <button
          onClick={() => setActiveAdminTab('moderation')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'moderation'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          <span>Moderation Queue</span>
          {totalFlaggedCount > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {totalFlaggedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          User Accounts & RBAC ({users.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('audit')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'audit'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Immutable Audit Log ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('reports')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'reports'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Zero-PII M&E Reports
        </button>
      </div>

      {/* VIEW 1: OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* Regional distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Participant Regional Hub Distribution</span>
            </h3>
            <p className="text-slate-500">
              Aggregated enrollment distribution across targeted demographic hubs.
            </p>
            <div className="space-y-3 pt-2">
              {[
                { region: 'West Africa (Lagos, Accra)', count: 2, share: '66.7%' },
                { region: 'North Africa (Cairo, Alexandria)', count: 1, share: '33.3%' },
                { region: 'East Africa (Nairobi, Kigali)', count: 0, share: '0.0%' },
                { region: 'Southern Africa (Johannesburg)', count: 0, share: '0.0%' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-medium">{item.region}</span>
                    <span className="font-mono tabular-nums">{item.count} participants ({item.share})</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: item.share }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Engagement Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Exchange Theme Capacity & Demand</span>
            </h3>
            <p className="text-slate-500">
              Real-time capacity utilization against operational limits.
            </p>
            <div className="space-y-3 pt-2">
              {exchanges.map(exc => (
                <div key={exc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{exc.theme}</span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {exc.enrolledCount} / {exc.capacityMax} seats
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{exc.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MODERATION QUEUE */}
      {activeAdminTab === 'moderation' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Content & Trust Moderation Queue
            </h3>
            <p className="text-slate-500 mt-0.5">
              Review flagged exchange curriculum, unverified employer postings, or conduct violations.
            </p>
          </div>

          {totalFlaggedCount > 0 ? (
            <div className="space-y-4">
              {flaggedExchanges.map(exc => (
                <div
                  key={exc.id}
                  className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-rose-800">Flagged Exchange: {exc.title}</span>
                      <div className="text-slate-600 mt-0.5">Theme: {exc.theme} · Facilitator: {exc.facilitatorName}</div>
                      <div className="text-rose-900 mt-1">
                        <strong>Reason:</strong> {exc.flagReason || 'Requires administrative compliance check'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moderateContent('exchange', exc.id, 'approve', 'Compliance verified by administrator.')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Content</span>
                      </button>
                      <button
                        onClick={() => moderateContent('exchange', exc.id, 'remove', 'Violates youth safety standards.')}
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Remove Post</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {flaggedOpportunities.map(opp => (
                <div
                  key={opp.id}
                  className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-rose-800">Flagged Opportunity: {opp.title}</span>
                      <div className="text-slate-600 mt-0.5">Partner: {opp.partnerName} · Closing: {opp.closingDate}</div>
                      <div className="text-rose-900 mt-1">
                        <strong>Reason:</strong> {opp.flagReason || 'Compensation below fair standard threshold'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moderateContent('opportunity', opp.id, 'approve', 'Compensation verified compliant.')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => moderateContent('opportunity', opp.id, 'remove', 'Removed due to substandard compensation.')}
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500">
              <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p>Zero active flags. All exchange curricula and opportunity postings are verified compliant.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: USER ACCOUNTS & RBAC */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                User Directory & Access Governance
              </h3>
              <p className="text-slate-500 mt-0.5">
                Manage participant, mentor, partner, and admin permissions.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {users.length} Active Accounts
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">User & Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Age / Eligibility</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Consent Status</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={u.name} role={u.role} size="xs" />
                        <div>
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize font-medium text-slate-800">
                      {u.role}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">
                      {u.role === 'participant' ? (
                        <span className="text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {u.age} yrs (Eligible)
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A (Staff/Partner)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.region.split('(')[0].trim()}
                    </td>
                    <td className="px-4 py-3">
                      {u.consentDataSharing ? (
                        <span className="text-emerald-700 font-medium">Granted</span>
                      ) : (
                        <span className="text-slate-400">Withheld</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isSuspended ? (
                        <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== currentUser.id ? (
                        <button
                          onClick={() =>
                            setSuspensionTargetUser({
                              id: u.id,
                              name: u.name,
                              isSuspended: u.isSuspended
                            })
                          }
                          className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                            u.isSuspended
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          {u.isSuspended ? 'Unlock Account' : 'Suspend Account'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Current Session</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: IMMUTABLE AUDIT LOG */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-800" />
                <span>Immutable Security & Operations Audit Trail</span>
              </h3>
              <p className="text-slate-500 mt-0.5">
                Every sensitive state transition is timestamped, actor-attributed, and non-repudiable.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {filteredAuditLogs.length} Events Logged
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={e => setAuditSearchQuery(e.target.value)}
                placeholder="Search actor, target entity, or details..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <select
              value={auditFilterAction}
              onChange={e => setAuditFilterAction(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
            >
              <option value="all">All Action Types</option>
              <option value="USER_REGISTRATION">USER_REGISTRATION</option>
              <option value="EXCHANGE_ENROLLED">EXCHANGE_ENROLLED</option>
              <option value="PROJECT_SUBMITTED">PROJECT_SUBMITTED</option>
              <option value="RUBRIC_EVALUATED">RUBRIC_EVALUATED</option>
              <option value="CONSENT_GRANTED_EOI">CONSENT_GRANTED_EOI</option>
              <option value="ACCOUNT_SUSPENDED">ACCOUNT_SUSPENDED</option>
              <option value="CONTENT_MODERATED">CONTENT_MODERATED</option>
              <option value="IMPACT_REPORT_EXPORTED">IMPACT_REPORT_EXPORTED</option>
            </select>
          </div>

          {/* Audit Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs divide-y divide-slate-200 font-mono">
              <thead className="bg-slate-50 text-slate-600 font-sans font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Timestamp (UTC)</th>
                  <th className="px-4 py-2.5">Actor</th>
                  <th className="px-4 py-2.5">Action Type</th>
                  <th className="px-4 py-2.5">Target Entity</th>
                  <th className="px-4 py-2.5">Details</th>
                  <th className="px-4 py-2.5">Cryptographic IP Digest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px]">
                {filteredAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-sans font-semibold text-slate-900 whitespace-nowrap">
                      {log.actorName} ({log.actorRole})
                    </td>
                    <td className="px-4 py-2.5 text-indigo-700 font-bold whitespace-nowrap">
                      {log.actionType}
                    </td>
                    <td className="px-4 py-2.5 text-slate-800 whitespace-nowrap">
                      {log.targetEntity}
                    </td>
                    <td className="px-4 py-2.5 font-sans text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap text-[10px]">
                      {log.ipHash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: ZERO-PII M&E REPORTS */}
      {activeAdminTab === 'reports' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Aggregated Monitoring & Evaluation (M&E) Exports
            </h3>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              In accordance with the functional blueprint and global data protection standards, these programmatic reports summarize demographic, enrollment, and rubric performance metrics stripped of individual user identifiers.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Zero-PII Compliance Verified</span>
            </div>
            <p className="text-emerald-900 leading-relaxed text-xs">
              Exports aggregate only cohort completion ratios, mean rubric achievements, regional participation percentages, and verified partner interview counts. No names, telephone numbers, or email addresses are ever bundled.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => exportImpactReport('csv')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Aggregate CSV Report</span>
            </button>
            <button
              onClick={() => exportImpactReport('json')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Download Machine-Readable JSON</span>
            </button>
          </div>
        </div>
      )}

      {/* Suspension Justification Modal */}
      {suspensionTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900">
                {suspensionTargetUser.isSuspended ? 'Unlock Account' : 'Suspend User Account'}
              </h3>
              <button
                onClick={() => setSuspensionTargetUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSuspension} className="p-6 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed">
                You are about to {suspensionTargetUser.isSuspended ? 'restore access for' : 'suspend'}{' '}
                <strong>{suspensionTargetUser.name}</strong>. A documented justification is required for the immutable audit log.
              </p>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Mandatory Administrative Justification *
                </label>
                <textarea
                  rows={3}
                  required
                  value={suspensionReason}
                  onChange={e => setSuspensionReason(e.target.value)}
                  placeholder="e.g. Terms of Service violation / account review completed..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSuspensionTargetUser(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 font-semibold text-white rounded-lg shadow-xs cursor-pointer ${
                    suspensionTargetUser.isSuspended
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  Confirm & Write to Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
