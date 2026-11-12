import React, { useState } from 'react';
import { YepProvider, useYep } from './context/YepContext';
import { Header } from './components/layout/Header';
import { LoginView } from './components/views/LoginView';
import { LandingView } from './components/views/LandingView';
import { ExchangeCatalogView } from './components/views/ExchangeCatalogView';
import { ParticipantDashboard } from './components/views/ParticipantDashboard';
import { MentorWorkspace } from './components/views/MentorWorkspace';
import { PartnerOpportunityBoard } from './components/views/PartnerOpportunityBoard';
import { AdminControlCenter } from './components/views/AdminControlCenter';
import { ExchangeDetailModal } from './components/views/ExchangeDetailModal';
import { SubmissionModal } from './components/modals/SubmissionModal';
import { OfflineStudyPackModal } from './components/modals/OfflineStudyPackModal';
import { AuthModal } from './components/modals/AuthModal';
import { VirtualExchange } from './types/yep';

const MainContent: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, exchanges, selectedExchangeId, setSelectedExchangeId } = useYep();

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [submissionTargetExchange, setSubmissionTargetExchange] = useState<VirtualExchange | null>(null);
  const [offlinePackTargetExchange, setOfflinePackTargetExchange] = useState<VirtualExchange | null>(null);

  const selectedExchange = exchanges.find(e => e.id === selectedExchangeId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Bar Navigation (Clean 3-zone contract, no upper RBAC bar) */}
      <Header />

      {/* Primary View Routing */}
      <main className="flex-1">
        {/* If user is not authenticated or navigated to login, show Login View directly with demo accounts below */}
        {(!currentUser || activeTab === 'login') && (
          <LoginView onOpenRegisterModal={() => setIsRegisterModalOpen(true)} />
        )}

        {/* Authenticated / Public Explorer Views */}
        {currentUser && activeTab === 'landing' && (
          <LandingView
            onSelectExchange={exc => setSelectedExchangeId(exc.id)}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            onOpenOfflinePack={exc => setOfflinePackTargetExchange(exc)}
          />
        )}

        {currentUser && activeTab === 'exchanges' && (
          <ExchangeCatalogView
            onSelectExchange={exc => setSelectedExchangeId(exc.id)}
            onOpenOfflinePack={exc => setOfflinePackTargetExchange(exc)}
          />
        )}

        {currentUser && activeTab === 'dashboard' && (
          <ParticipantDashboard
            onSelectExchange={exc => setSelectedExchangeId(exc.id)}
            onOpenSubmitModal={exc => setSubmissionTargetExchange(exc)}
            onOpenOfflinePack={exc => setOfflinePackTargetExchange(exc)}
          />
        )}

        {currentUser && activeTab === 'mentor' && <MentorWorkspace />}

        {currentUser && (activeTab === 'opportunities' || activeTab === 'partner-manage') && (
          <PartnerOpportunityBoard />
        )}

        {currentUser && activeTab === 'admin' && <AdminControlCenter />}
      </main>

      {/* Exchange Detail View Modal */}
      {selectedExchange && (
        <ExchangeDetailModal
          exchange={selectedExchange}
          isOpen={!!selectedExchange}
          onClose={() => setSelectedExchangeId(null)}
          onOpenSubmitModal={(exc: VirtualExchange) => {
            setSelectedExchangeId(null);
            setSubmissionTargetExchange(exc);
          }}
          onOpenOfflinePackModal={(exc: VirtualExchange) => {
            setOfflinePackTargetExchange(exc);
          }}
        />
      )}

      {/* Project Submission Modal */}
      {submissionTargetExchange && (
        <SubmissionModal
          isOpen={!!submissionTargetExchange}
          exchange={submissionTargetExchange}
          onClose={() => setSubmissionTargetExchange(null)}
        />
      )}

      {/* Low-Bandwidth Offline Study Pack Modal */}
      {offlinePackTargetExchange && (
        <OfflineStudyPackModal
          isOpen={!!offlinePackTargetExchange}
          exchange={offlinePackTargetExchange}
          onClose={() => setOfflinePackTargetExchange(null)}
        />
      )}

      {/* Registration Modal */}
      <AuthModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <YepProvider>
      <MainContent />
    </YepProvider>
  );
}
