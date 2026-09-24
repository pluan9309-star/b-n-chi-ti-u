import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { parseVND, formatVND } from '../../utils/formatters';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoal?: SavingsGoal | null;
}

const PRESET_ICONS = [
  'ShieldCheck',
  'PiggyBank',
  'Bike',
  'Car',
  'Palmtree',
  'Laptop',
  'Smartphone',
  'GraduationCap',
  'Home',
  'HeartPulse',
  'Gift',
  'Briefcase',
];

const PRESET_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#64748B', // Slate
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  initialGoal,
}) => {
  const { addSavingsGoal, updateSavingsGoal } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('PiggyBank');
  const [color, setColor] = useState('#10B981');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setTargetAmountStr(initialGoal.targetAmount.toString());
      setCurrentAmountStr(initialGoal.currentAmount.toString());
      setDeadline(initialGoal.deadline);
      setCategory(initialGoal.category);
      setIcon(initialGoal.icon);
      setColor(initialGoal.color);
      setNotes(initialGoal.notes || '');
    } else {
      setTitle('');
      setTargetAmountStr('20000000');
      setCurrentAmountStr('0');
      // Default deadline 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setDeadline(d.toISOString().split('T')[0]);
      setCategory('Mục tiêu cá nhân');
      setIcon('PiggyBank');
      setColor('#10B981');
      setNotes('');
    }
    setError('');
  }, [initialGoal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = parseVND(targetAmountStr);
    const currAmt = parseVND(currentAmountStr);

    if (!title.trim()) {
      setError('Vui lòng nhập tên mục tiêu tiết kiệm');
      return;
    }

    if (targetAmt <= 0) {
      setError('Số tiền mục tiêu phải lớn hơn 0');
      return;
    }

    if (!deadline) {
      setError('Vui lòng chọn thời hạn mục tiêu');
      return;
    }

    if (initialGoal) {
      updateSavingsGoal(initialGoal.id, {
        title: title.trim(),
        targetAmount: targetAmt,
        currentAmount: currAmt,
        deadline,
        category: category.trim() || 'Tiết kiệm',
        icon,
        color,
        notes: notes.trim(),
      });
    } else {
      addSavingsGoal({
        title: title.trim(),
        targetAmount: targetAmt,
        currentAmount: currAmt,
        deadline,
        category: category.trim() || 'Tiết kiệm',
        icon,
        color,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            {initialGoal ? 'Chỉnh sửa mục tiêu tiết kiệm' : 'Thêm mục tiêu tiết kiệm mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tên khoản tiết kiệm / Mục tiêu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Quỹ khẩn cấp, Mua xe mới, Du lịch Châu Âu..."
              className="w-full text-sm font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          {/* Target Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Số tiền mục tiêu (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={targetAmountStr ? Number(parseVND(targetAmountStr)).toLocaleString('vi-VN') : ''}
                onChange={(e) => setTargetAmountStr(e.target.value)}
                placeholder="0"
                className="w-full text-base font-bold text-slate-900 tabular-nums px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Đã tích lũy ban đầu
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={currentAmountStr ? Number(parseVND(currentAmountStr)).toLocaleString('vi-VN') : ''}
                onChange={(e) => setCurrentAmountStr(e.target.value)}
                placeholder="0"
                className="w-full text-base font-bold text-slate-900 tabular-nums px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick Target Presets */}
          <div className="flex flex-wrap gap-1.5">
            {[10000000, 20000000, 50000000, 100000000].map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setTargetAmountStr(amt.toString())}
                className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer tabular-nums"
              >
                {formatVND(amt, true)}
              </button>
            ))}
          </div>

          {/* Deadline & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Thời hạn hoàn thành
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nhóm phân loại
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="VD: An toàn, Mua sắm, Du lịch..."
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Color & Icon Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Màu sắc hiển thị
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                    color === c ? 'scale-110 border-slate-900 shadow-xs' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Ghi chú thêm
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ghi chú kế hoạch hoặc nguồn tiền trích vào..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          {/* Submit */}
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
              <span>{initialGoal ? 'Lưu mục tiêu' : 'Tạo mục tiêu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
