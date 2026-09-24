import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar, NavTab } from './components/layout/Navbar';
import { OverviewView } from './components/views/OverviewView';
import { TransactionsView } from './components/views/TransactionsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { BudgetsView } from './components/views/BudgetsView';
import { SavingsGoalsView } from './components/views/SavingsGoalsView';
import { TransactionModal } from './components/modals/TransactionModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { SavingsGoalModal } from './components/modals/SavingsGoalModal';
import { SavingsDepositModal } from './components/modals/SavingsDepositModal';
import { DataModal } from './components/modals/DataModal';
import { Transaction, Budget, SavingsGoal } from './types/finance';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenAddBudget = () => {
    setEditingBudget(null);
    setIsBudgetModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenDepositGoal = (goal: SavingsGoal) => {
    setDepositGoal(goal);
    setIsDepositModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Bar Navigation (3-Zone Contract) */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddTransaction={handleOpenAddTx}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <OverviewView
            onNavigateToTab={setActiveTab}
            onOpenAddTransaction={handleOpenAddTx}
            onOpenDepositGoal={handleOpenDepositGoal}
            onEditTransaction={handleEditTx}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenAddTransaction={handleOpenAddTx}
            onEditTransaction={handleEditTx}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'budgets' && (
          <BudgetsView
            onOpenAddBudget={handleOpenAddBudget}
            onEditBudget={handleEditBudget}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsGoalsView
            onOpenAddGoal={handleOpenAddGoal}
            onEditGoal={handleEditGoal}
            onOpenDeposit={handleOpenDepositGoal}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        initialTransaction={editingTx}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        initialBudget={editingBudget}
      />

      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        initialGoal={editingGoal}
      />

      <SavingsDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setDepositGoal(null);
        }}
        goal={depositGoal}
      />

      <DataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />

      {/* Footer (Quiet copyright & links) */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Sổ Thu Chi & Tiết Kiệm</span>
            <span>·</span>
            <span>Ứng dụng quản lý tài chính cá nhân thông minh</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Sao lưu dữ liệu
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('overview')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Trang tổng quan
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
