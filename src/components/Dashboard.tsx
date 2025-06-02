'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckSquare, CreditCard, TrendingUp } from 'lucide-react';
import { DashboardStats } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTodos: 0,
    completedTodos: 0,
    totalTimeToday: 0,
    totalSubscriptions: 0,
    monthlySubscriptionCost: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // 一時的にモックデータを使用（API未実装のため）
      await new Promise(resolve => setTimeout(resolve, 500)); // ローディング時間をシミュレート
      
      // モックデータ
      const mockTodos = [
        { id: 1, title: 'プロジェクト資料作成', status: 'completed' },
        { id: 2, title: 'ミーティング準備', status: 'in_progress' },
        { id: 3, title: 'メール返信', status: 'pending' },
        { id: 4, title: 'レポート作成', status: 'completed' },
        { id: 5, title: 'データベース設計', status: 'pending' },
      ];

      const mockTimesheets = [
        { id: 1, title: 'コーディング', elapsed_minutes: 120, start_time: new Date().toISOString() },
        { id: 2, title: 'ミーティング', elapsed_minutes: 60, start_time: new Date().toISOString() },
        { id: 3, title: '設計書作成', elapsed_minutes: 90, start_time: new Date().toISOString() },
      ];

      const mockSubscriptions = [
        { id: 1, service_name: 'Netflix', amount: 1980, frequency: 'monthly' },
        { id: 2, service_name: 'Spotify', amount: 980, frequency: 'monthly' },
        { id: 3, service_name: 'Adobe Creative Cloud', amount: 5680, frequency: 'monthly' },
        { id: 4, service_name: 'AWS', amount: 3500, frequency: 'monthly' },
      ];

      // 統計を計算
      const totalTimeToday = mockTimesheets.reduce((acc, timesheet) => 
        acc + timesheet.elapsed_minutes, 0
      );

      const monthlySubscriptionCost = mockSubscriptions
        .filter((sub) => sub.frequency === 'monthly')
        .reduce((acc, sub) => acc + sub.amount, 0);

      setStats({
        totalTodos: mockTodos.length,
        completedTodos: mockTodos.filter((todo) => todo.status === 'completed').length,
        totalTimeToday,
        totalSubscriptions: mockSubscriptions.length,
        monthlySubscriptionCost,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // エラー時のフォールバック
      setStats({
        totalTodos: 0,
        completedTodos: 0,
        totalTimeToday: 0,
        totalSubscriptions: 0,
        monthlySubscriptionCost: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins}分`;
  };

  const statCards = [
    {
      title: 'ToDo タスク',
      value: `${stats.completedTodos}/${stats.totalTodos}`,
      subtitle: '完了/総数',
      icon: CheckSquare,
      color: 'bg-green-500',
    },
    {
      title: '今日の作業時間',
      value: formatTime(stats.totalTimeToday),
      subtitle: '累計時間',
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      title: 'サブスクリプション',
      value: stats.totalSubscriptions.toString(),
      subtitle: '契約中のサービス',
      icon: CreditCard,
      color: 'bg-purple-500',
    },
    {
      title: '月額費用',
      value: `¥${stats.monthlySubscriptionCost.toLocaleString()}`,
      subtitle: '月間合計',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
        <button
          onClick={fetchDashboardStats}
          className="button-primary text-sm"
        >
          更新
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 最近のアクティビティ */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">概要</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• 工数管理では作業時間の記録と集計ができます</p>
          <p>• ToDo管理ではタスクの作成・進捗管理ができます</p>
          <p>• サブスク管理では契約サービスの費用と更新日を管理できます</p>
          <p>• 各機能は上部のナビゲーションから切り替えできます</p>
        </div>
      </div>
    </div>
  );
} 