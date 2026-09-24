import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { formatVND, getPaymentMethodDetails, formatDateVN } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { Search, Plus, Trash2, Edit2, Filter, ArrowDownUp } from 'lucide-react';

interface TransactionsViewProps {
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddTransaction,
  onEditTransaction,
}) => {
  const { transactions, categories, deleteTransaction, getCategory, selectedMonth } = useFinance();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>(selectedMonth);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Extract distinct available months in transaction history
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.date.length >= 7) set.add(t.date.substring(0, 7));
    });
    set.add(selectedMonth);
    return Array.from(set).sort().reverse();
  }, [transactions, selectedMonth]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search
        if (search.trim()) {
          const query = search.toLowerCase();
          const cat = getCategory(t.categoryId);
          const matchNote = t.note?.toLowerCase().includes(query);
          const matchCat = cat?.name.toLowerCase().includes(query);
          if (!matchNote && !matchCat) return false;
        }

        // Type
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // Category
        if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;

        // Period
        if (periodFilter !== 'all' && !t.date.startsWith(periodFilter)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, search, typeFilter, categoryFilter, periodFilter, sortBy, getCategory]);

  // Summary of filtered results
  const summaryIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const summaryExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const summaryNet = summaryIncome - summaryExpense;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sổ giao dịch thu chi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý chi tiết từng khoản thu và chi tiêu của bạn
          </p>
        </div>

        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={15} />
          <span>Thêm giao dịch mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo ghi chú, danh mục..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất cả loại giao dịch</option>
              <option value="expense">Khoản chi tiêu (-)</option>
              <option value="income">Khoản thu nhập (+)</option>
            </select>
          </div>

          {/* Month / Period Filter */}
          <div>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Toàn bộ thời gian</option>
              {availableMonths.map((m) => {
                const [y, mo] = m.split('-');
                return (
                  <option key={m} value={m}>
                    Tháng {parseInt(mo, 10)}/{y}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất cả danh mục ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.type === 'income' ? '[+ Thu]' : '[- Chi]'} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4 text-slate-500">
            <span>
              Tìm thấy: <strong className="text-slate-800 tabular-nums">{filteredTransactions.length}</strong> giao dịch
            </span>
            <span>·</span>
            <span>
              Tổng thu: <strong className="text-emerald-700 tabular-nums">{formatVND(summaryIncome)}</strong>
            </span>
            <span>·</span>
            <span>
              Tổng chi: <strong className="text-rose-700 tabular-nums">{formatVND(summaryExpense)}</strong>
            </span>
            <span>·</span>
            <span>
              Chênh lệch:{' '}
              <strong className={summaryNet >= 0 ? 'text-emerald-700 tabular-nums' : 'text-rose-700 tabular-nums'}>
                {summaryNet >= 0 ? '+' : ''}
                {formatVND(summaryNet)}
              </strong>
            </span>
          </div>

          {/* Sort order */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <ArrowDownUp size={13} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent border-none focus:outline-none font-medium text-slate-700 cursor-pointer"
            >
              <option value="date-desc">Mới nhất trước</option>
              <option value="date-asc">Cũ nhất trước</option>
              <option value="amount-desc">Số tiền lớn nhất</option>
              <option value="amount-asc">Số tiền nhỏ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Filter size={20} />
            </div>
            <p className="text-sm font-semibold text-slate-700">Không tìm thấy giao dịch nào</p>
            <p className="text-xs text-slate-500">
              Hãy thử thay đổi bộ lọc hoặc thêm một giao dịch mới để quản lý.
            </p>
            <button
              onClick={onOpenAddTransaction}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
            >
              <Plus size={14} />
              <span>Ghi chép giao dịch</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ngày</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4">Ghi chú</th>
                  <th className="py-3 px-4">Hình thức</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const cat = getCategory(tx.categoryId);
                  const paymentInfo = getPaymentMethodDetails(tx.paymentMethod);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap tabular-nums text-slate-600 font-medium">
                        {formatDateVN(tx.date)}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: cat?.bgLight || '#F1F5F9' }}
                          >
                            <CategoryIcon
                              name={cat?.icon || 'Folder'}
                              color={cat?.color || '#64748B'}
                              size={13}
                            />
                          </div>
                          <span className="font-semibold text-slate-800">
                            {cat?.name || 'Khác'}
                          </span>
                        </div>
                      </td>

                      {/* Note */}
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {tx.note || <span className="text-slate-300 italic">Không có</span>}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          {paymentInfo.label}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold tabular-nums">
                        <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                          {isIncome ? '+' : '-'}
                          {formatVND(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Sửa giao dịch"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Xóa giao dịch"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
