import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { TransactionModal } from './components/transactions/TransactionModal';
import { ProfileModal } from './components/common/ProfileModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { ToastContainer } from './components/common/ToastContainer';
import { Transaction } from './types/finance';
import { OverviewTab } from './components/overview/OverviewTab';
import { TransactionsTab } from './components/transactions/TransactionsTab';
import { BudgetPlannerTab } from './components/budget/BudgetPlannerTab';
import { WhatIfLabTab } from './components/whatif/WhatIfLabTab';
import { SavingsGoalsTab } from './components/savings/SavingsGoalsTab';
import { SubscriptionsTab } from './components/subscriptions/SubscriptionsTab';
import { InsightsTab } from './components/insights/InsightsTab';

const MainAppContent: React.FC = () => {
  const { activeTab, resetToDemo } = useFinance();

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleConfirmReset = () => {
    resetToDemo();
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0D0C] text-[#F3F4F3] flex flex-col lg:flex-row font-sans selection:bg-[#C7FF4A] selection:text-black">
      {/* Desktop Sidebar */}
      <Sidebar
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-h-screen pb-16 lg:pb-0">
        {/* Sticky Header */}
        <Header
          onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenAddTx={handleOpenAddTx}
        />

        {/* Dynamic Tab Page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && <OverviewTab onOpenAddTx={handleOpenAddTx} />}
          {activeTab === 'transactions' && (
            <TransactionsTab
              onOpenAddModal={handleOpenAddTx}
              onOpenEditModal={handleOpenEditTx}
            />
          )}
          {activeTab === 'budget' && <BudgetPlannerTab />}
          {activeTab === 'whatif' && <WhatIfLabTab />}
          {activeTab === 'savings' && <SavingsGoalsTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'insights' && <InsightsTab />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Modals and Notifications */}
      <TransactionModal
        isOpen={isTxModalOpen}
        initialTransaction={editingTx}
        onClose={() => setIsTxModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
      />

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Demo Scenario"
        message="This will reset all transactions, category budgets, savings goals, and subscriptions back to the pristine Day 12 baseline (₹10,000 budget, ₹3,250 spent, ₹6,750 balance, ₹375/day safe allowance). Are you sure?"
        confirmLabel="Reset to Baseline"
        danger
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
