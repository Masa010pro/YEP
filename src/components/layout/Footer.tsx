import React from 'react';
import { useYep } from '../../context/YepContext';
import { ShieldCheck, Download, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { exportImpactReport, setActiveTab } = useYep();

  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Youth Empowerment Project (YEP)
            </h3>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              A high-impact human development platform connecting young people aged 18–35 with practical virtual learning exchanges, rigorous mentor rubrics, and vetted entry-level digital opportunities.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Consent-driven portfolio sharing</span>
              <span aria-hidden="true">·</span>
              <span>Zero-PII aggregate reporting</span>
              <span aria-hidden="true">·</span>
              <span>Low-bandwidth ready</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button
                  onClick={() => setActiveTab('exchanges')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Virtual Exchanges
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('opportunities')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Partner Opportunity Board
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('landing')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  18–35 Eligibility Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('admin')}
                  className="hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Audit Trail & Governance
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Monitoring & Evaluation
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              Download current aggregated M&E metrics on enrollments, regional distribution, and rubric completion rates.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => exportImpactReport('csv')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors cursor-pointer w-fit"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Aggregate CSV</span>
              </button>
              <button
                onClick={() => exportImpactReport('json')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors cursor-pointer w-fit"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Aggregate JSON</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Youth Empowerment Project. Derived from Functional & Operational Blueprint.</p>
          <div className="flex items-center gap-4">
            <span>Role-Based Access Control (RBAC)</span>
            <span aria-hidden="true">·</span>
            <span>Immutable Security Audit Log</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
