import { Timesheet, Todo, Subscription } from '@/types';

// ローカルストレージキー
const STORAGE_KEYS = {
  TIMESHEETS: 'my-admin-timesheets',
  TODOS: 'my-admin-todos',
  SUBSCRIPTIONS: 'my-admin-subscriptions',
} as const;

// 基本的なCRUD操作クラス
class LocalStorage<T extends { id?: number }> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  // 全データ取得
  getAll(): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  // IDで取得
  getById(id: number): T | undefined {
    return this.getAll().find(item => item.id === id);
  }

  // データ保存
  save(item: T): T {
    const items = this.getAll();
    
    if (item.id) {
      // 更新
      const index = items.findIndex(i => i.id === item.id);
      if (index !== -1) {
        items[index] = item;
      }
    } else {
      // 新規作成
      const newId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1;
      item = { ...item, id: newId };
      items.push(item);
    }

    this.saveAll(items);
    return item;
  }

  // データ削除
  delete(id: number): boolean {
    const items = this.getAll();
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return false; // 削除対象が見つからない
    }

    this.saveAll(filteredItems);
    return true;
  }

  // 全データ保存
  private saveAll(items: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  // 全データクリア
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.key);
  }
}

// 各エンティティ用のストレージインスタンス
export const timesheetStorage = new LocalStorage<Timesheet>(STORAGE_KEYS.TIMESHEETS);
export const todoStorage = new LocalStorage<Todo>(STORAGE_KEYS.TODOS);
export const subscriptionStorage = new LocalStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);

// 統計データ取得用のヘルパー関数
export const getStats = () => {
  const timesheets = timesheetStorage.getAll();
  const todos = todoStorage.getAll();
  const subscriptions = subscriptionStorage.getAll();

  // 今日の日付
  const today = new Date().toISOString().split('T')[0];
  
  // 今日の工数時間を計算
  const todayTimesheets = timesheets.filter(t => 
    t.start_time.startsWith(today)
  );
  const totalTimeToday = todayTimesheets.reduce((total, t) => 
    total + (t.elapsed_minutes || 0), 0
  );

  // 完了済みToDo数
  const completedTodos = todos.filter(t => t.status === 'completed').length;

  // 月額サブスクリプション費用
  const monthlySubscriptionCost = subscriptions
    .filter(s => s.frequency === 'monthly')
    .reduce((total, s) => total + (s.amount || 0), 0);

  return {
    totalTodos: todos.length,
    completedTodos,
    totalTimeToday,
    totalSubscriptions: subscriptions.length,
    monthlySubscriptionCost,
  };
}; 