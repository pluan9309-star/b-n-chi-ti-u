import React from 'react';
import { Plus, Database, Wallet } from 'lucide-react';

export type NavTab = 'overview' | 'transactions' | 'analytics' | 'budgets' | 'savings';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddTransaction: () => void;
  onOpenDataModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddTransaction,
  onOpenDataModal,
}) => {
  const navItems: { id: NavTab; label: string }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'transactions', label: 'Giao dịch' },
    { id: 'analytics', label: 'Phân tích' },
    { id: 'budgets', label: 'Ngân sách' },
    { id: 'savings', label: 'Mục tiêu tiết kiệm' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Wallet size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Sổ Thu Chi
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links (single-line with subtle states) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-emerald-800 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenDataModal}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Dữ liệu & Sao lưu"
            aria-label="Cài đặt dữ liệu"
          >
            <Database size={18} />
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Ghi chép mới</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        </div>
      </div>
    </header>
  );
};
