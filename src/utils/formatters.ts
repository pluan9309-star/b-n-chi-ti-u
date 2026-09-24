/**
 * Utilities for formatting currency, dates, and calculations
 */

export function formatVND(amount: number, compact: boolean = false): string {
  if (isNaN(amount)) return '0 ₫';

  if (compact) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 1_000_000_000) {
      return `${sign}${(abs / 1_000_000_000).toFixed(1).replace('.0', '')} tỷ ₫`;
    }
    if (abs >= 1_000_000) {
      return `${sign}${(abs / 1_000_000).toFixed(1).replace('.0', '')} tr ₫`;
    }
    if (abs >= 1_000) {
      return `${sign}${(abs / 1_000).toFixed(0)}k ₫`;
    }
    return `${sign}${abs.toLocaleString('vi-VN')} ₫`;
  }

  return `${amount.toLocaleString('vi-VN')} ₫`;
}

export function parseVND(value: string): number {
  if (!value) return 0;
  // Remove non-digit characters except negative sign
  const cleaned = value.replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function formatMonthVN(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const [year, month] = yearMonthStr.split('-');
  return `Tháng ${parseInt(month, 10)}/${year}`;
}

export function getRelativeDateLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Hôm nay';
  if (dateStr === yesterdayStr) return 'Hôm qua';

  return formatDateVN(dateStr);
}

export function getDaysRemaining(deadlineStr: string): { days: number; text: string; isOverdue: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), text: `Đã quá hạn ${Math.abs(diffDays)} ngày`, isOverdue: true };
  }
  if (diffDays === 0) {
    return { days: 0, text: 'Hôm nay là hạn chót', isOverdue: false };
  }
  if (diffDays <= 30) {
    return { days: diffDays, text: `Còn ${diffDays} ngày`, isOverdue: false };
  }
  const months = Math.floor(diffDays / 30);
  const remDays = diffDays % 30;
  return {
    days: diffDays,
    text: remDays > 0 ? `Còn khoảng ${months} tháng ${remDays} ngày` : `Còn ${months} tháng`,
    isOverdue: false,
  };
}

export function calculateMonthlySavingsRequired(current: number, target: number, deadlineStr: string): number {
  const remaining = Math.max(0, target - current);
  if (remaining === 0) return 0;

  const today = new Date();
  const deadline = new Date(deadlineStr);
  const diffMonths = (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth());

  if (diffMonths <= 0) return remaining;
  return Math.ceil(remaining / diffMonths);
}

export function getPaymentMethodDetails(method: string): { label: string; icon: string } {
  switch (method) {
    case 'bank':
      return { label: 'Tài khoản Ngân hàng', icon: 'Building2' };
    case 'e-wallet':
      return { label: 'Ví MoMo / ZaloPay', icon: 'Smartphone' };
    case 'card':
      return { label: 'Thẻ Tín dụng / Ghi nợ', icon: 'CreditCard' };
    case 'cash':
    default:
      return { label: 'Tiền mặt', icon: 'Banknote' };
  }
}
