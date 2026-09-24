import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types/finance';
import { formatVND, parseVND } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  initialBudget,
}) => {
  const { categories, saveBudget, budgets } = useFinance();

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const [categoryId, setCategoryId] = useState<string>('');
  const [limitStr, setLimitStr] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialBudget) {
      setCategoryId(initialBudget.categoryId);
      setLimitStr(initialBudget.monthlyLimit.toString());
      setAlertThreshold(initialBudget.alertThreshold || 80);
    } else {
      // Pick first expense category that doesn't have a budget yet, or first expense category
      const existingCategoryIds = new Set(budgets.map((b) => b.categoryId));
      const unbudgeted = expenseCategories.find((c) => !existingCategoryIds.has(c.id));
      setCategoryId(unbudgeted ? unbudgeted.id : (expenseCategories[0]?.id || ''));
      setLimitStr('3000000');
      setAlertThreshold(80);
    }
    setError('');
  }, [initialBudget, isOpen, budgets, expenseCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericLimit = parseVND(limitStr);

    if (numericLimit <= 0) {
      setError('Hạn mức ngân sách phải lớn hơn 0');
      return;
    }

    if (!categoryId) {
      setError('Vui lòng chọn một danh mục chi tiêu');
      return;
    }

    saveBudget(categoryId, numericLimit, alertThreshold);
    onClose();
  };

  const handleQuickLimit = (amount: number) => {
    setLimitStr(amount.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            {initialBudget ? 'Chỉnh sửa ngân sách' : 'Thiết lập ngân sách tháng'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category selection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Chọn danh mục chi tiêu
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-200 rounded-xl">
              {expenseCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : cat.bgLight,
                      }}
                    >
                      <CategoryIcon
                        name={cat.icon}
                        color={isSelected ? '#ffffff' : cat.color}
                        size={12}
                      />
                    </div>
                    <span className="text-xs font-medium truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monthly limit */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Hạn mức tối đa mỗi tháng (VNĐ)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={limitStr ? Number(parseVND(limitStr)).toLocaleString('vi-VN') : ''}
                onChange={(e) => setLimitStr(e.target.value)}
                placeholder="0"
                className="w-full text-xl font-bold tracking-tight text-slate-900 tabular-nums px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                VNĐ/tháng
              </span>
            </div>

            {/* Quick Limit Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[1000000, 2000000, 3000000, 5000000, 8000000, 10000000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handleQuickLimit(amt)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer tabular-nums"
                >
                  {formatVND(amt, true)}
                </button>
              ))}
            </div>
          </div>

          {/* Alert Threshold */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">Ngưỡng cảnh báo chi tiêu:</span>
              <span className="font-bold text-emerald-700 tabular-nums">{alertThreshold}% hạn mức</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Hệ thống sẽ chuyển sang màu vàng cảnh báo khi mức chi đạt {alertThreshold}% hạn mức.
            </p>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Check size={14} />
              <span>Lưu ngân sách</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
