import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatVND, getDaysRemaining, calculateMonthlySavingsRequired } from '../../utils/formatters';
import { DonutChart } from '../charts/DonutChart';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SavingsGoal, Transaction } from '../../types/finance';

interface OverviewViewProps {
  onNavigateToTab: (tab: 'transactions' | 'analytics' | 'budgets' | 'savings') => void;
  onOpenAddTransaction: () => void;
  onOpenDepositGoal: (goal: SavingsGoal) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateToTab,
  onOpenAddTransaction,
  onOpenDepositGoal,
  onEditTransaction,
}) => {
  const {
    transactions,
    selectedMonth,
    setSelectedMonth,
    monthIncome,
    monthExpense,
    monthNet,
    monthSavingsRate,
    categoryExpenseBreakdown,
    budgetStatuses,
    savingsGoals,
    getCategory,
  } = useFinance();

  // Parse current month
  const [year, month] = selectedMonth.split('-').map((v) => parseInt(v, 10));

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    const formatted = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
    setSelectedMonth(formatted);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    const formatted = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
    setSelectedMonth(formatted);
  };

  // Recent transactions in this month
  const recentTransactions = transactions
    .filter((t) => t.date.startsWith(selectedMonth))
    .slice(0, 5);

  // Critical budgets (approaching or exceeding limit)
  const warningBudgets = budgetStatuses.filter((b) => b.isOverBudget || b.isNearLimit);

  // Total saved across goals
  const totalSavedInGoals = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <div className="space-y-6">
      {/* Month Navigator & Greeting bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Tổng quan tài chính cá nhân
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi dòng tiền thu chi, tiến độ ngân sách và quỹ tiết kiệm của bạn
          </p>
        </div>

        {/* Month Picker controls */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-100 text-slate-600 rounded-md transition-colors cursor-pointer"
            title="Tháng trước"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-semibold text-slate-800 px-3 min-w-[110px] text-center tabular-nums">
            Tháng {month}/{year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-100 text-slate-600 rounded-md transition-colors cursor-pointer"
            title="Tháng sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Top 4 Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thu Nhập */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng thu tháng này</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 tabular-nums tracking-tight">
              {formatVND(monthIncome)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Đã ghi nhận trong kỳ</span>
            </div>
          </div>
        </div>

        {/* Chi Tiêu */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng chi tháng này</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 tabular-nums tracking-tight">
              {formatVND(monthExpense)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Hạn ngạch chi tiêu</span>
            </div>
          </div>
        </div>

        {/* Chênh lệch thu - chi (Số dư dòng tiền tháng) */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dòng tiền ròng (Thu - Chi)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-xl font-bold tabular-nums tracking-tight ${
                monthNet >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {monthNet >= 0 ? '+' : ''}
              {formatVND(monthNet)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Tỷ lệ tiết kiệm:</span>
              <strong className="font-semibold text-slate-800 tabular-nums">{monthSavingsRate}%</strong>
            </div>
          </div>
        </div>

        {/* Tổng Quỹ Tiết Kiệm Tích Lũy */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng tích lũy mục tiêu</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 tabular-nums tracking-tight">
              {formatVND(totalSavedInGoals)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>{savingsGoals.length} quỹ mục tiêu đang thực hiện</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Alert if any budget is near or over limit */}
      {warningBudgets.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Cảnh báo hạn mức ngân sách ({warningBudgets.length} danh mục)
                </h4>
                <div className="mt-1 space-y-1">
                  {warningBudgets.map((b) => (
                    <div key={b.budget.id} className="text-xs text-amber-800 flex items-center gap-2">
                      <span className="font-semibold">{b.category.name}:</span>
                      <span>
                        Đã chi <strong className="tabular-nums">{formatVND(b.spent)}</strong> /{' '}
                        {formatVND(b.budget.monthlyLimit)} ({b.percentage}%)
                      </span>
                      {b.isOverBudget && (
                        <span className="text-xs font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded-xs">
                          Vượt mức
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('budgets')}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 shrink-0 underline cursor-pointer"
            >
              <span>Xem chi tiết</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Donut Chart & Category Breakdown */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Phân loại chi tiêu tháng</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cơ cấu theo các danh mục chi trong Tháng {month}/{year}
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Chi tiết biểu đồ</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <DonutChart
            data={categoryExpenseBreakdown}
            totalAmount={monthExpense}
            title={`Chi T${month}`}
          />
        </div>

        {/* Right Column (5 cols): Savings Goals Spotlight */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Khoản tiết kiệm mục tiêu</h2>
                <p className="text-xs text-slate-500 mt-0.5">Tiến độ tích lũy cho các dự định</p>
              </div>
              <button
                onClick={() => onNavigateToTab('savings')}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {savingsGoals.slice(0, 3).map((goal) => {
                const percent = Math.min(
                  100,
                  Math.round((goal.currentAmount / goal.targetAmount) * 100),
                );
                const remainingDays = getDaysRemaining(goal.deadline);
                const requiredPerMonth = calculateMonthlySavingsRequired(
                  goal.currentAmount,
                  goal.targetAmount,
                  goal.deadline,
                );

                return (
                  <div key={goal.id} className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          <CategoryIcon name={goal.icon} color={goal.color} size={15} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">
                            {goal.title}
                          </h4>
                          <span className="text-[11px] text-slate-500">{remainingDays.text}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenDepositGoal(goal)}
                        className="px-2 py-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer shrink-0"
                      >
                        + Nạp tiền
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%`, backgroundColor: goal.color }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                        <span>
                          Đạt <strong className="text-slate-800 font-semibold">{percent}%</strong> (
                          {formatVND(goal.currentAmount, true)})
                        </span>
                        <span>Mục tiêu: {formatVND(goal.targetAmount, true)}</span>
                      </div>
                      {requiredPerMonth > 0 && (
                        <div className="text-[10px] text-slate-400">
                          Cần tiết kiệm: <strong className="text-slate-600">{formatVND(requiredPerMonth, true)}/tháng</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('savings')}
            className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer text-center"
          >
            Quản lý kế hoạch ngân sách tiết kiệm
          </button>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Giao dịch gần đây trong tháng</h2>
            <p className="text-xs text-slate-500 mt-0.5">5 khoản thu chi ghi nhận mới nhất</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddTransaction}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              <Plus size={14} />
              <span>Ghi chép nhanh</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả ({transactions.length})</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Chưa có giao dịch nào trong Tháng {month}/{year}. Bấm "+ Ghi chép mới" để bắt đầu!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const cat = getCategory(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  onClick={() => onEditTransaction(tx)}
                  className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat?.bgLight || '#F1F5F9' }}
                    >
                      <CategoryIcon
                        name={cat?.icon || 'Folder'}
                        color={cat?.color || '#64748B'}
                        size={17}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {cat?.name || 'Khác'}
                        </span>
                        <span className="text-[11px] text-slate-400">·</span>
                        <span className="text-[11px] text-slate-500">{tx.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-sm mt-0.5">
                        {tx.note || 'Không có ghi chú'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatVND(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
