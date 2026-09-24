import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { DonutChart } from '../charts/DonutChart';
import { MonthlyBarChart } from '../charts/MonthlyBarChart';
import { formatVND } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { Category } from '../../types/finance';
import { Calendar, PieChart, TrendingUp, TrendingDown, Layers, Award } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    transactions,
    selectedMonth,
    setSelectedMonth,
    categoryExpenseBreakdown,
    monthExpense,
    monthIncome,
    monthNet,
    categories,
    getCategory,
  } = useFinance();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Parse available months and monthly aggregations
  const monthlyData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};

    // Group all transactions by month
    transactions.forEach((tx) => {
      if (tx.date.length >= 7) {
        const m = tx.date.substring(0, 7);
        if (!map[m]) {
          map[m] = { income: 0, expense: 0 };
        }
        if (tx.type === 'income') {
          map[m].income += tx.amount;
        } else {
          map[m].expense += tx.amount;
        }
      }
    });

    // Ensure selectedMonth is included
    if (!map[selectedMonth]) {
      map[selectedMonth] = { income: 0, expense: 0 };
    }

    const sortedMonths = Object.keys(map).sort();
    // Take last 6 months
    const recent = sortedMonths.slice(-6);

    return recent.map((m) => {
      const [y, mo] = m.split('-');
      const inc = map[m].income;
      const exp = map[m].expense;
      return {
        month: m,
        label: `T${parseInt(mo, 10)}`,
        fullLabel: `Tháng ${parseInt(mo, 10)}/${y}`,
        income: inc,
        expense: exp,
        net: inc - exp,
      };
    });
  }, [transactions, selectedMonth]);

  // Average daily spending this month
  const dailyAverage = useMemo(() => {
    const today = new Date();
    const [y, m] = selectedMonth.split('-').map((v) => parseInt(v, 10));
    let daysInCount = 30;

    if (today.getFullYear() === y && today.getMonth() + 1 === m) {
      daysInCount = Math.max(1, today.getDate());
    }

    return Math.round(monthExpense / daysInCount);
  }, [monthExpense, selectedMonth]);

  // Daily spending aggregation in selected month
  const dailySpending = useMemo(() => {
    const map: Record<string, number> = {};
    const monthTx = transactions.filter((t) => t.date.startsWith(selectedMonth) && t.type === 'expense');

    monthTx.forEach((t) => {
      const day = t.date.substring(8, 10);
      map[day] = (map[day] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([day, amount]) => ({ day, amount }))
      .sort((a, b) => parseInt(a.day, 10) - parseInt(b.day, 10));
  }, [transactions, selectedMonth]);

  const maxDailySpend = useMemo(() => {
    return Math.max(...dailySpending.map((d) => d.amount), 1);
  }, [dailySpending]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Phân tích & Biểu đồ chi tiêu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trực quan hóa cấu trúc chi tiêu, xu hướng biến động và thói quen tài chính
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Chọn kỳ:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs focus:ring-2 focus:ring-emerald-500"
          >
            {monthlyData.map((d) => (
              <option key={d.month} value={d.month}>
                {d.fullLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Tổng chi trong kỳ</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {formatVND(monthExpense)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Khoản chi thực tế trong tháng
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Trung bình chi mỗi ngày</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {formatVND(dailyAverage)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Mức tiêu dùng bình quân</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">
            Danh mục chi nhiều nhất
          </span>
          <div className="text-lg font-bold text-slate-900 truncate mt-1">
            {categoryExpenseBreakdown[0]?.category.name || 'Chưa có'}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block tabular-nums">
            {categoryExpenseBreakdown[0]
              ? `${formatVND(categoryExpenseBreakdown[0].amount)} (${categoryExpenseBreakdown[0].percentage}%)`
              : '0 ₫'}
          </span>
        </div>
      </div>

      {/* Primary Chart 1: Donut Structure Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <PieChart size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Biểu đồ cơ cấu chi tiêu theo nhóm
              </h2>
              <p className="text-xs text-slate-500">
                Tỷ trọng phần trăm từng danh mục chi tiêu trong tháng đã chọn
              </p>
            </div>
          </div>
        </div>

        <DonutChart
          data={categoryExpenseBreakdown}
          totalAmount={monthExpense}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* Primary Chart 2: Monthly Comparison (Income vs Expense) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Xu hướng biến động thu nhập vs chi tiêu
              </h2>
              <p className="text-xs text-slate-500">
                So sánh cột thu - chi giữa các tháng gần nhất (Bấm vào cột để xem tháng đó)
              </p>
            </div>
          </div>
        </div>

        <MonthlyBarChart
          data={monthlyData}
          selectedMonth={selectedMonth}
          onSelectMonth={(m) => setSelectedMonth(m)}
        />
      </div>

      {/* Daily Expense Distribution in the Month */}
      {dailySpending.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Phân bổ chi tiêu theo các ngày trong tháng
              </h2>
              <p className="text-xs text-slate-500">
                Nhận biết những ngày có phát sinh chi phí lớn nhất
              </p>
            </div>
          </div>

          <div className="h-40 flex items-end gap-1 sm:gap-2 pt-4 px-2 overflow-x-auto">
            {dailySpending.map((item) => {
              const heightPercent = Math.max(8, Math.round((item.amount / maxDailySpend) * 100));
              return (
                <div
                  key={item.day}
                  className="flex-1 min-w-[22px] flex flex-col items-center group relative cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                    Ngày {item.day}: {formatVND(item.amount)}
                  </div>

                  <div
                    className="w-full bg-slate-200 group-hover:bg-emerald-500 rounded-t-sm transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-900 font-medium mt-1">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Expense Ranking Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
            <Award size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Bảng xếp hạng chi tiêu theo nhóm</h2>
            <p className="text-xs text-slate-500">Xếp thứ tự từ khoản chi lớn nhất đến nhỏ nhất</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Hạng</th>
                <th className="py-2.5 px-3">Danh mục</th>
                <th className="py-2.5 px-3 text-right">Số tiền chi</th>
                <th className="py-2.5 px-3 text-right">Tỷ trọng (%)</th>
                <th className="py-2.5 px-3">Thanh tiến độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryExpenseBreakdown.map((item, idx) => (
                <tr key={item.category.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-400 tabular-nums">#{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: item.category.bgLight }}
                      >
                        <CategoryIcon
                          name={item.category.icon}
                          color={item.category.color}
                          size={12}
                        />
                      </div>
                      <span className="font-semibold text-slate-800">{item.category.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                    {formatVND(item.amount)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-500 tabular-nums">
                    {item.percentage}%
                  </td>
                  <td className="py-2.5 px-3 w-40">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.category.color,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
