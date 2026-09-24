import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import {
  formatVND,
  formatDateVN,
  getDaysRemaining,
  calculateMonthlySavingsRequired,
} from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  Plus,
  PiggyBank,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface SavingsGoalsViewProps {
  onOpenAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onOpenDeposit: (goal: SavingsGoal) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  onOpenAddGoal,
  onEditGoal,
  onOpenDeposit,
}) => {
  const { savingsGoals, deleteSavingsGoal } = useFinance();

  // Aggregate portfolio totals
  const totalTarget = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  }, [savingsGoals]);

  const totalSaved = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  }, [savingsGoals]);

  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const totalRemaining = Math.max(0, totalTarget - totalSaved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ngân sách từng khoản tiết kiệm & Mục tiêu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập kế hoạch phân bổ tiền tích lũy cho quỹ khẩn cấp, mua sắm lớn và dự định tương lai
          </p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={15} />
          <span>Thêm mục tiêu tiết kiệm</span>
        </button>
      </div>

      {/* Portfolio Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <PiggyBank size={22} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Tổng danh mục quỹ tiết kiệm tích lũy
              </h2>
              <p className="text-xs text-slate-500">
                {savingsGoals.length} mục tiêu đang được theo dõi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Đã tích lũy:</span>
              <strong className="text-base font-bold text-emerald-700 tabular-nums">
                {formatVND(totalSaved)}
              </strong>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 block">Tổng mục tiêu:</span>
              <strong className="text-base font-bold text-slate-900 tabular-nums">
                {formatVND(totalTarget)}
              </strong>
            </div>
          </div>
        </div>

        {/* Global Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              Tiến độ hoàn thành danh mục:{' '}
              <strong className="text-slate-900 font-bold tabular-nums">{overallProgress}%</strong>
            </span>
            <span className="text-slate-500 tabular-nums">
              Còn cần tích lũy: <strong className="text-slate-700">{formatVND(totalRemaining)}</strong>
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Goals */}
      {savingsGoals.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <PiggyBank size={24} />
          </div>
          <p className="text-sm font-semibold text-slate-700">Chưa có mục tiêu tiết kiệm nào</p>
          <p className="text-xs text-slate-500">
            Tạo quỹ dự phòng khẩn cấp, quỹ mua sắm hoặc du lịch để bắt đầu tích lũy ngay hôm nay.
          </p>
          <button
            onClick={onOpenAddGoal}
            className="mt-2 inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
          >
            <Plus size={14} />
            <span>Tạo mục tiêu đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savingsGoals.map((goal) => {
            const percent = Math.min(
              100,
              Math.round((goal.currentAmount / goal.targetAmount) * 100),
            );
            const remainingAmt = Math.max(0, goal.targetAmount - goal.currentAmount);
            const timeInfo = getDaysRemaining(goal.deadline);
            const monthlyRequired = calculateMonthlySavingsRequired(
              goal.currentAmount,
              goal.targetAmount,
              goal.deadline,
            );
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-2xs flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${goal.color}18` }}
                      >
                        <CategoryIcon name={goal.icon} color={goal.color} size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate" title={goal.title}>
                          {goal.title}
                        </h3>
                        <span className="text-[11px] text-slate-500">{goal.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Sửa mục tiêu"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => deleteSavingsGoal(goal.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Xóa mục tiêu"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Description note if any */}
                  {goal.notes && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 bg-slate-50 p-2 rounded-lg">
                      {goal.notes}
                    </p>
                  )}

                  {/* Target & Saved Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Đã tích lũy:</span>
                      <span className="text-base font-bold text-slate-900 tabular-nums">
                        {formatVND(goal.currentAmount)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: goal.color }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                      <span className="font-semibold" style={{ color: goal.color }}>
                        {percent}% hoàn thành
                      </span>
                      <span>Mục tiêu: {formatVND(goal.targetAmount)}</span>
                    </div>
                  </div>

                  {/* Deadline & Monthly Requirement */}
                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        <span>Hạn hoàn thành:</span>
                      </div>
                      <span className="font-medium tabular-nums">{formatDateVN(goal.deadline)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Thời gian còn lại:</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          timeInfo.isOverdue ? 'text-rose-600' : 'text-slate-700'
                        }`}
                      >
                        {timeInfo.text}
                      </span>
                    </div>

                    {!isCompleted && monthlyRequired > 0 && (
                      <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-800 bg-emerald-50/70 px-2 py-1 rounded-md">
                        <span className="flex items-center gap-1 font-medium">
                          <TrendingUp size={12} />
                          Cần để dành:
                        </span>
                        <span className="font-bold tabular-nums">
                          {formatVND(monthlyRequired)}/tháng
                        </span>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                        <CheckCircle size={13} />
                        <span>Đã hoàn thành xuất sắc mục tiêu!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-4 mt-2 flex items-center gap-2">
                  <button
                    onClick={() => onOpenDeposit(goal)}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowDownRight size={14} />
                    <span>Nạp tiền</span>
                  </button>
                  <button
                    onClick={() => onOpenDeposit(goal)}
                    className="py-1.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title="Rút tiền từ quỹ"
                  >
                    <ArrowUpRight size={14} />
                    <span>Rút</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
