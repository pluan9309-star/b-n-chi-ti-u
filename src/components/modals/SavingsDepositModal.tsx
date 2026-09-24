import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, History } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { formatVND, parseVND, formatDateVN } from '../../utils/formatters';

interface SavingsDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const SavingsDepositModal: React.FC<SavingsDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { contributeToGoal } = useFinance();

  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !goal) return null;

  const currentAmount = goal.currentAmount;
  const parsedAmt = parseVND(amountStr);
  const projectedAmount =
    type === 'deposit' ? currentAmount + parsedAmt : Math.max(0, currentAmount - parsedAmt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmt <= 0) {
      setError('Số tiền phải lớn hơn 0');
      return;
    }

    if (type === 'withdrawal' && parsedAmt > currentAmount) {
      setError('Số tiền rút không thể lớn hơn số dư hiện có trong quỹ');
      return;
    }

    contributeToGoal(goal.id, parsedAmt, type, note.trim() || undefined);
    setAmountStr('');
    setNote('');
    onClose();
  };

  const handleQuickAdd = (addVal: number) => {
    const curr = parseVND(amountStr);
    setAmountStr((curr + addVal).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {type === 'deposit' ? 'Nạp tiền vào quỹ' : 'Rút tiền từ quỹ'}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[260px]">{goal.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Action Segmented Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'deposit'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight size={14} />
              <span>Nạp thêm tiền (+)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('withdrawal')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'withdrawal'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight size={14} />
              <span>Rút tiền ra (-)</span>
            </button>
          </div>

          {/* Current vs Projected Balance info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Số dư quỹ hiện tại:</span>
              <span className="font-semibold text-slate-900 tabular-nums">{formatVND(currentAmount)}</span>
            </div>
            {parsedAmt > 0 && (
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span>Số dư sau khi thực hiện:</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {formatVND(projectedAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Số tiền giao dịch (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={amountStr ? Number(parseVND(amountStr)).toLocaleString('vi-VN') : ''}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0"
                className="w-full text-xl font-bold tracking-tight text-slate-900 tabular-nums px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                VNĐ
              </span>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[500000, 1000000, 2000000, 5000000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handleQuickAdd(amt)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer tabular-nums"
                >
                  +{formatVND(amt, true)}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Ghi chú nguồn tiền
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={type === 'deposit' ? 'VD: Trích tiền lương tháng 9...' : 'VD: Cần chi trả việc gấp...'}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          {/* History toggle button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              <History size={14} />
              <span>
                {showHistory ? 'Ẩn lịch sử đóng góp' : `Xem lịch sử đóng góp (${goal.contributions.length})`}
              </span>
            </button>

            {showHistory && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5 bg-slate-50">
                {goal.contributions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">Chưa có lịch sử biến động</p>
                ) : (
                  goal.contributions.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-1.5 bg-white rounded-md border border-slate-100 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-700 block">
                          {c.note || (c.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền')}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatDateVN(c.date)}</span>
                      </div>
                      <span
                        className={`font-semibold tabular-nums ${
                          c.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {c.type === 'deposit' ? '+' : '-'}
                        {formatVND(c.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
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
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white rounded-lg shadow-xs transition-colors cursor-pointer ${
                type === 'deposit'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <span>Xác nhận {type === 'deposit' ? 'nạp tiền' : 'rút tiền'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
