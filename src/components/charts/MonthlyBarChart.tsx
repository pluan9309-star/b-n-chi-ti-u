import React, { useState } from 'react';
import { formatVND } from '../../utils/formatters';

interface MonthComparison {
  month: string; // 'YYYY-MM'
  label: string; // 'T7', 'T8', 'T9'
  fullLabel: string; // 'Tháng 09/2026'
  income: number;
  expense: number;
  net: number;
}

interface MonthlyBarChartProps {
  data: MonthComparison[];
  onSelectMonth?: (month: string) => void;
  selectedMonth?: string;
}

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({
  data,
  onSelectMonth,
  selectedMonth,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
        Chưa có dữ liệu so sánh theo tháng
      </div>
    );
  }

  // Find max value to normalize heights
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    10_000_000,
  );

  const chartHeight = 180;

  return (
    <div className="flex flex-col">
      {/* Visual Chart Bars */}
      <div className="relative pt-6 pb-2">
        {/* Horizontal grid lines */}
        <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
          <div className="border-b border-dashed border-slate-300 w-full" />
          <div className="border-b border-dashed border-slate-300 w-full" />
          <div className="border-b border-dashed border-slate-300 w-full" />
        </div>

        <div className="grid grid-flow-col auto-cols-fr gap-3 sm:gap-6 items-end h-[180px] px-2 relative z-10">
          {data.map((d, idx) => {
            const incomeHeight = Math.round((d.income / maxVal) * (chartHeight - 20));
            const expenseHeight = Math.round((d.expense / maxVal) * (chartHeight - 20));
            const isSelected = selectedMonth === d.month;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={d.month}
                className={`flex flex-col items-center cursor-pointer transition-all duration-150 p-2 rounded-lg ${
                  isSelected ? 'bg-slate-100/80 ring-1 ring-emerald-500/30' : 'hover:bg-slate-50'
                }`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectMonth?.(d.month)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-md shadow-lg pointer-events-none whitespace-nowrap">
                    <p className="font-semibold text-slate-200">{d.fullLabel}</p>
                    <div className="flex items-center gap-2 mt-0.5 tabular-nums">
                      <span className="text-emerald-400">+{formatVND(d.income, true)}</span>
                      <span>·</span>
                      <span className="text-rose-400">-{formatVND(d.expense, true)}</span>
                    </div>
                  </div>
                )}

                {/* Bars group */}
                <div className="flex items-end gap-1.5 h-full w-full max-w-[56px] justify-center">
                  {/* Income bar */}
                  <div
                    className="w-4 sm:w-5 bg-emerald-500 rounded-t-sm hover:brightness-110 transition-all"
                    style={{ height: `${Math.max(incomeHeight, 4)}px` }}
                    title={`Thu: ${formatVND(d.income)}`}
                  />
                  {/* Expense bar */}
                  <div
                    className="w-4 sm:w-5 bg-rose-500 rounded-t-sm hover:brightness-110 transition-all"
                    style={{ height: `${Math.max(expenseHeight, 4)}px` }}
                    title={`Chi: ${formatVND(d.expense)}`}
                  />
                </div>

                {/* X-axis label */}
                <span
                  className={`mt-2 text-xs font-semibold tracking-tight transition-colors ${
                    isSelected ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {d.label}
                </span>

                {/* Net indicator */}
                <span
                  className={`text-[10px] tabular-nums font-medium ${
                    d.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {d.net >= 0 ? '+' : ''}
                  {formatVND(d.net, true)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
          <span>Thu nhập</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
          <span>Chi tiêu</span>
        </div>
      </div>
    </div>
  );
};
