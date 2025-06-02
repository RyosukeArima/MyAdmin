// データベースモデルの型定義

export interface Timesheet {
  id?: number;
  title: string;
  category: string;
  start_time: string; // ISO datetime string
  end_time?: string; // ISO datetime string
  elapsed_minutes?: number;
}

export interface Todo {
  id?: number;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string; // ISO date string
}

export interface Subscription {
  id?: number;
  service_name: string;
  plan?: string;
  amount?: number;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'daily';
  renewal_date?: string; // ISO date string
  notes?: string;
}

// ナビゲーション関連の型
export type PageId = 'dashboard' | 'timesheet' | 'todo' | 'subscription';

export interface TabInfo {
  icon: string;
  label: string;
  component?: any;
}

// ダッシュボードデータの型
export interface DashboardStats {
  totalTodos: number;
  completedTodos: number;
  totalTimeToday: number; // minutes
  totalSubscriptions: number;
  monthlySubscriptionCost: number;
}

// APIレスポンスの型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// フォームの状態管理用の型
export interface TimesheetFormData {
  title: string;
  category: string;
  start_time: string;
  end_time?: string;
}

export interface TodoFormData {
  title: string;
  status: Todo['status'];
  due_date?: string;
}

export interface SubscriptionFormData {
  service_name: string;
  plan?: string;
  amount?: number;
  frequency: Subscription['frequency'];
  renewal_date?: string;
  notes?: string;
} 