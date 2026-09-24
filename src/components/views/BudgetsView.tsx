import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { BudgetProgressBar } from '../charts/BudgetProgressBar';
import { Budget } from '../../types/finance';
import { formatVND } from '../../utils/formatters';
import { Plus, Target, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BudgetsViewProps {
  onOpenAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  onOpenAddBudget,
  onEditBudget,
}) => {
  const { budgetStatuses, deleteBudget, selectedMonth } = useFinance();

  const [filterState, setFilterState] = useState<'all' | 'warning' | 'safe'>('all');

  // Total budgeted vs Total spent in budgeted categories
  const totalBudgeted = useMemo(() => {
    return budgetStatuses.reduce((s, b) => s + b.budget.monthlyLimit, 0);
  }, [budgetStatuses]);

  const totalSpentInBudgeted = useMemo(() => {
    return budgetStatuses.reduce((s, b) => s + b.spent, 0);
  }, [budgetStatuses]);

  const totalRemaining = totalBudgeted - totalSpentInBudgeted;
  const overallPercentage =
    totalBudgeted > 0 ? Math.round((totalSpentInBudgeted / totalBudgeted) * 100) : 0;

  // Filter list
  const filteredStatuses = useMemo(() => {
    if (filterState === 'warning') {
      return budgetStatuses.filter((b) => b.isOverBudget || b.isNearLimit);
    }
    if (filterState === 'safe') {
      return budgetStatuses.filter((b) => !b.isOverBudget && !b.isNearLimit);
    }
    return budgetStatuses;
  }, [budgetStatuses, filterState]);

  const overCount = budgetStatuses.filter((b) => b.isOverBudget).length;
  const warningCount = budgetStatuses.filter((b) => b.isNearLimit).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản lý hạn mức ngân sách
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thiết lập giới hạn chi tiêu từng danh mục để kiểm soát tài chính chủ động
          </p>
        </div>

        <button
          onClick={onOpenAddBudget}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={15} />
          <span>Thêm hạn mức ngân sách</span>
        </button>
      </div>

      {/* Aggregate Budget Health Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Target size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Tổng quan hạn mức chi tiêu tháng {selectedMonth}
              </h2>
              <span className="text-xs text-slate-500">
                Áp dụng cho {budgetStatuses.length} nhóm danh mục đã đặt hạn mức
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {overCount > 0 && (
              <span className="flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md font-semibold">
                <ShieldAlert size={14} />
                {overCount} nhóm vượt mức
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-semibold">
                <AlertTriangle size={14} />
                {warningCount} nhóm cận giới hạn
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar & Financial stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Tổng đã chi:{' '}
              <strong className="text-slate-900 font-bold tabular-nums">
                {formatVND(totalSpentInBudgeted)}
              </strong>
            </span>
            <span>
              Tổng hạn mức:{' '}
              <strong className="text-slate-900 font-bold tabular-nums">
                {formatVND(totalBudgeted)}
              </strong>
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                overallPercentage > 100
                  ? 'bg-rose-500'
                  : overallPercentage > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 tabular-nums">
              Đã dùng: <strong className="text-slate-800 font-semibold">{overallPercentage}%</strong>
            </span>
            <span
              className={`font-semibold tabular-nums ${
                totalRemaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {totalRemaining >= 0
                ? `Còn lại an toàn: ${formatVND(totalRemaining)}`
                : `Vượt hạn ngạch: ${formatVND(Math.abs(totalRemaining))}`}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterState === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({budgetStatuses.length})
          </button>
          <button
            onClick={() => setFilterState('warning')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterState === 'warning' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cảnh báo / Vượt mức ({overCount + warningCount})
          </button>
          <button
            onClick={() => setFilterState('safe')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              filterState === 'safe' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            An toàn ({budgetStatuses.length - overCount - warningCount})
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Chỉ số tự động cập nhật theo giao dịch tháng này
        </span>
      </div>

      {/* Grid of Budgets */}
      {filteredStatuses.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2">
          <p className="text-sm font-semibold text-slate-700">Chưa có ngân sách nào phù hợp</p>
          <p className="text-xs text-slate-500">
            Bạn có thể tạo ngân sách mới cho các danh mục như Ăn uống, Mua sắm, Di chuyển...
          </p>
          <button
            onClick={onOpenAddBudget}
            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
          >
            <Plus size={14} />
            <span>Thêm ngân sách</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStatuses.map((status) => (
            <BudgetProgressBar
              key={status.budget.id}
              status={status}
              onEdit={() => onEditBudget(status.budget)}
              onDelete={() => deleteBudget(status.budget.id)}
            />
          ))}
        </div>
      )}

      {/* Budgeting Knowledge Card */}
      <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-600">
        <div className="p-1 bg-emerald-600 text-white rounded-md shrink-0 mt-0.5">
          <CheckCircle2 size={16} />
        </div>
        <div>
          <span className="font-bold text-slate-900 block">
            Mẹo quản lý theo quy tắc Kakeibo & 50/30/20:
          </span>
          <p className="mt-0.5 leading-relaxed text-slate-600">
            Phân bổ 50% thu nhập cho chi phí thiết yếu (Nhà ở, điện nước, ăn uống cơ bản), 30% cho chi tiêu linh hoạt (Giải trí, mua sắm đồ dùng cá nhân), và tối thiểu 20% đều đặn cho các khoản tiết kiệm mục tiêu và quỹ khẩn cấp.
          </p>
        </div>
      </div>
    </div>
  );
};
