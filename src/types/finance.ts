export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash' | 'bank' | 'e-wallet' | 'card';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or identifier
  color: string; // Hex or Tailwind color class
  bgLight: string;
  type: TransactionType;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // in VND
  categoryId: string;
  date: string; // YYYY-MM-DD
  note: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  alertThreshold: number; // percentage, e.g., 80
}

export interface SavingsContribution {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'deposit' | 'withdrawal';
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  icon: string;
  color: string;
  notes?: string;
  contributions: SavingsContribution[];
  createdAt: number;
}

export interface FilterState {
  searchQuery: string;
  type: 'all' | 'expense' | 'income';
  categoryId: string;
  period: 'all' | 'this-month' | 'last-month' | 'last-3-months' | 'this-year' | 'custom';
  startDate?: string;
  endDate?: string;
}
