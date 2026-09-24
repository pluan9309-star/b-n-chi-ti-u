import React, { useState } from 'react';
import { formatVND } from '../../utils/formatters';
import { Category } from '../../types/finance';

interface DonutSlice {
  category: Category;
  amount: number;
  percentage: number;
}

interface DonutChartProps {
  data: DonutSlice[];
  totalAmount: number;
  title?: string;
  onSelectCategory?: (category: Category | null) => void;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  totalAmount,
  title = 'Cơ cấu chi tiêu',
  onSelectCategory,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0 || totalAmount === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-xl text-center">
        <p className="text-sm font-medium text-slate-500">Chưa có dữ liệu chi tiêu trong kỳ này</p>
        <p className="text-xs text-slate-400 mt-1">Thêm giao dịch chi tiêu để xem biểu đồ cơ cấu</p>
      </div>
    );
  }

  // Generate SVG arcs
  const size = 260;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeAngle = 0;
  const slices = data.map((item, idx) => {
    const sliceAngle = (item.amount / totalAmount) * 360;
    const strokeDasharray = `${(sliceAngle / 360) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativeAngle / 360) * circumference);
    cumulativeAngle += sliceAngle;

    return {
      ...item,
      idx,
      strokeDasharray,
      strokeDashoffset,
      color: item.category.color,
    };
  });

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {/* Data slices */}
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.idx;
            return (
              <circle
                key={slice.category.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => {
                  setHoveredIndex(slice.idx);
                  onSelectCategory?.(slice.category);
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  onSelectCategory?.(null);
                }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-xs font-medium text-slate-500 max-w-[120px] truncate">
            {activeItem ? activeItem.category.name : title}
          </span>
          <span className="text-lg font-bold text-slate-900 tabular-nums tracking-tight mt-0.5">
            {activeItem ? formatVND(activeItem.amount, true) : formatVND(totalAmount, true)}
          </span>
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            {activeItem ? `${activeItem.percentage}% tổng chi` : '100%'}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="w-full flex-1 max-h-64 overflow-y-auto pr-1 divide-y divide-slate-100">
        {data.map((item, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <div
              key={item.category.id}
              className={`py-2 px-2 flex items-center justify-between gap-3 rounded-lg transition-colors cursor-pointer ${
                isHovered ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}
              onMouseEnter={() => {
                setHoveredIndex(idx);
                onSelectCategory?.(item.category);
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                onSelectCategory?.(null);
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-xs shrink-0"
                  style={{ backgroundColor: item.category.color }}
                />
                <span className="text-sm font-medium text-slate-700 truncate">
                  {item.category.name}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {formatVND(item.amount)}
                </span>
                <span className="text-xs font-semibold text-slate-500 w-10 text-right tabular-nums">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
