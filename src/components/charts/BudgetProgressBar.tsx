import React from 'react';
import { formatVND } from '../../utils/formatters';
import { BudgetStatus } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { AlertCircle, AlertTriangle, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

interface BudgetProgressBarProps {
  status: BudgetStatus;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  status,
  onEdit,
  onDelete,
}) => {
  const { category, budget, spent, remaining, percentage, isOverBudget, isNearLimit } = status;

  // Determine status color
  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let StatusIcon = CheckCircle2;
  let statusText = 'An toàn';

  if (isOverBudget) {
    barColor = 'bg-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
    StatusIcon = AlertCircle;
    statusText = `Vượt ${formatVND(Math.abs(remaining))}`;
  } else if (isNearLimit) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    StatusIcon = AlertTriangle;
    statusText = `Cảnh báo (${percentage}%)`;
  }

  const fillWidth = Math.min(percentage, 100);

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
      {/* Header: Category & Action */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.bgLight }}
          >
            <CategoryIcon name={category.icon} color={category.color} size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{category.name}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Hạn mức:</span>
              <span className="font-semibold text-slate-700 tabular-nums">
                {formatVND(budget.monthlyLimit)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Status badge */}
          <div className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-md ${badgeColor}`}>
            <StatusIcon size={12} />
            <span className="tabular-nums">{statusText}</span>
          </div>

          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Chỉnh sửa ngân sách"
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Xóa ngân sách"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          {/* Filled bar */}
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${fillWidth}%` }}
          />

          {/* Threshold marker */}
          {budget.alertThreshold > 0 && budget.alertThreshold < 100 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-400/70 z-10"
              style={{ left: `${budget.alertThreshold}%` }}
              title={`Ngưỡng cảnh báo: ${budget.alertThreshold}%`}
            />
          )}
        </div>

        {/* Figures row */}
        <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
          <div className="flex items-center gap-1">
            <span>Đã chi:</span>
            <span className="font-semibold text-slate-900">{formatVND(spent)}</span>
            <span className="text-slate-400">({percentage}%)</span>
          </div>

          <div>
            {isOverBudget ? (
              <span className="font-semibold text-rose-600">
                Âm {formatVND(Math.abs(remaining))}
              </span>
            ) : (
              <span>
                Còn lại: <strong className="font-semibold text-slate-800">{formatVND(remaining)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
