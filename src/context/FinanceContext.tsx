import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Transaction, Category, Budget, SavingsGoal, SavingsContribution } from '../types/finance';
import { DEFAULT_CATEGORIES, INITIAL_BUDGETS, INITIAL_SAVINGS_GOALS, INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'kakeibo_transactions_v1',
  CATEGORIES: 'kakeibo_categories_v1',
  BUDGETS: 'kakeibo_budgets_v1',
  SAVINGS: 'kakeibo_savings_v1',
};

export interface BudgetStatus {
  budget: Budget;
  category: Category;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  selectedMonth: string; // 'YYYY-MM'
  setSelectedMonth: (month: string) => void;
  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  // Budgets
  saveBudget: (categoryId: string, monthlyLimit: number, alertThreshold?: number) => void;
  deleteBudget: (id: string) => void;
  // Savings
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, type: 'deposit' | 'withdrawal', note?: string) => void;
  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  // Computed Data
  getCategory: (id: string) => Category | undefined;
  monthTransactions: Transaction[];
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  monthSavingsRate: number;
  budgetStatuses: BudgetStatus[];
  categoryExpenseBreakdown: { category: Category; amount: number; percentage: number }[];
  // Data actions
  resetData: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;
  exportCSV: () => string;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVINGS);
      return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savingsGoals));
    } catch (e) {
      console.error('Failed to save savings', e);
    }
  }, [savingsGoals]);

  const getCategory = (id: string): Category | undefined => {
    return categories.find((c) => c.id === id);
  };

  // Transactions CRUD
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, tx: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((item) => (item.id === id ? { ...item, ...tx } : item)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  // Budgets CRUD
  const saveBudget = (categoryId: string, monthlyLimit: number, alertThreshold: number = 80) => {
    setBudgets((prev) => {
      const existingIndex = prev.findIndex((b) => b.categoryId === categoryId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          monthlyLimit,
          alertThreshold,
        };
        return updated;
      } else {
        const newBudget: Budget = {
          id: `b-${Date.now()}`,
          categoryId,
          monthlyLimit,
          alertThreshold,
        };
        return [...prev, newBudget];
      }
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Savings CRUD
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: Date.now(),
      contributions: [],
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, goal: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) => prev.map((item) => (item.id === id ? { ...item, ...goal } : item)));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((item) => item.id !== id));
  };

  const contributeToGoal = (goalId: string, amount: number, type: 'deposit' | 'withdrawal', note?: string) => {
    setSavingsGoals((prev) =>
      prev.map((item) => {
        if (item.id !== goalId) return item;
        const newContrib: SavingsContribution = {
          id: `c-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount,
          type,
          note: note || (type === 'deposit' ? 'Nạp tiền vào quỹ' : 'Rút tiền từ quỹ'),
        };
        const delta = type === 'deposit' ? amount : -amount;
        const newTotal = Math.max(0, item.currentAmount + delta);
        return {
          ...item,
          currentAmount: newTotal,
          contributions: [newContrib, ...item.contributions],
        };
      }),
    );
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // Computed transactions for current selectedMonth
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const monthIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const monthExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const monthNet = monthIncome - monthExpense;

  const monthSavingsRate = monthIncome > 0 ? Math.max(0, Math.round((monthNet / monthIncome) * 100)) : 0;

  // Category expense breakdown
  const categoryExpenseBreakdown = useMemo(() => {
    const expenses = monthTransactions.filter((t) => t.type === 'expense');
    const map: Record<string, number> = {};

    for (const tx of expenses) {
      map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
    }

    const total = monthExpense || 1;
    const result: { category: Category; amount: number; percentage: number }[] = [];

    for (const [catId, amt] of Object.entries(map)) {
      const cat = getCategory(catId) || {
        id: catId,
        name: 'Khác',
        icon: 'MoreHorizontal',
        color: '#64748B',
        bgLight: '#F1F5F9',
        type: 'expense',
      };
      result.push({
        category: cat,
        amount: amt,
        percentage: Math.round((amt / total) * 100),
      });
    }

    return result.sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, monthExpense, categories]);

  // Budget status computation
  const budgetStatuses: BudgetStatus[] = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};
    for (const tx of monthTransactions.filter((t) => t.type === 'expense')) {
      expensesByCategory[tx.categoryId] = (expensesByCategory[tx.categoryId] || 0) + tx.amount;
    }

    return budgets.map((b) => {
      const cat = getCategory(b.categoryId) || {
        id: b.categoryId,
        name: 'Chưa phân loại',
        icon: 'MoreHorizontal',
        color: '#64748B',
        bgLight: '#F1F5F9',
        type: 'expense',
      };
      const spent = expensesByCategory[b.categoryId] || 0;
      const remaining = b.monthlyLimit - spent;
      const percentage = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
      const isOverBudget = spent > b.monthlyLimit;
      const isNearLimit = !isOverBudget && percentage >= b.alertThreshold;

      return {
        budget: b,
        category: cat,
        spent,
        remaining,
        percentage,
        isOverBudget,
        isNearLimit,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [budgets, monthTransactions, categories]);

  // Reset data to defaults
  const resetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets(INITIAL_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.SAVINGS);
  };

  // Export/Import JSON
  const exportJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      budgets,
      savingsGoals,
    };
    return JSON.stringify(data, null, 2);
  };

  const importJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (Array.isArray(data.budgets)) setBudgets(data.budgets);
      if (Array.isArray(data.savingsGoals)) setSavingsGoals(data.savingsGoals);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const exportCSV = (): string => {
    const headers = ['Mã GD', 'Loại', 'Số tiền (VND)', 'Danh mục', 'Ngày', 'Hình thức', 'Ghi chú'];
    const rows = transactions.map((t) => {
      const cat = getCategory(t.categoryId)?.name || 'Khác';
      const typeStr = t.type === 'income' ? 'Thu nhập' : 'Chi tiêu';
      return [
        t.id,
        typeStr,
        t.amount,
        `"${cat}"`,
        t.date,
        t.paymentMethod,
        `"${(t.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        savingsGoals,
        selectedMonth,
        setSelectedMonth,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        saveBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        addCategory,
        getCategory,
        monthTransactions,
        monthIncome,
        monthExpense,
        monthNet,
        monthSavingsRate,
        budgetStatuses,
        categoryExpenseBreakdown,
        resetData,
        exportJSON,
        importJSON,
        exportCSV,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
