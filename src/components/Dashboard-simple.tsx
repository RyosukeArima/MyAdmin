'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, CheckSquare, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { getStats, timesheetStorage, todoStorage, subscriptionStorage } from '@/lib/storage';
import { DashboardStats } from '@/types';
import DateRangePicker, { DateRange } from './DateRangePicker';
import { getDateString, formatDuration, generatePeriodChartData } from '@/lib/dateUtils';

export default function DashboardSimple() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTodos: 0,
    completedTodos: 0,
    totalTimeToday: 0,
    totalSubscriptions: 0,
    monthlySubscriptionCost: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // 期間選択の状態
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    startDate: getDateString(),
    endDate: getDateString(),
    label: '今日'
  });

  useEffect(() => {
    // コンポーネントがマウントされたことを記録
    setMounted(true);
    
    // 統計データを取得
    const currentStats = getStats();
    setStats(currentStats);

    // 期限が近いタスクを取得
    const deadlines = getUpcomingDeadlines();
    setUpcomingDeadlines(deadlines);
  }, []);

  // 期間変更時に統計データとグラフデータを更新
  useEffect(() => {
    if (mounted) {
      const currentStats = getStats(selectedDateRange.startDate, selectedDateRange.endDate);
      setStats(currentStats);
      
      // 期間に応じた工数グラフデータを生成
      const timesheets = timesheetStorage.getAll();
      const periodChartData = generatePeriodChartData(
        timesheets,
        selectedDateRange.startDate,
        selectedDateRange.endDate
      );
      setChartData(periodChartData);
    }
  }, [selectedDateRange, mounted]);



  const getUpcomingDeadlines = () => {
    const todos = todoStorage.getAll();
    const today = new Date();
    const upcoming = todos
      .filter(todo => todo.due_date && todo.status !== 'completed')
      .map(todo => ({
        ...todo,
        daysLeft: Math.ceil((new Date(todo.due_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      }))
      .filter(todo => todo.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    return upcoming;
  };

  const todoStatusData = [
    { name: '完了', value: stats.completedTodos, color: '#10B981' },
    { name: '未完了', value: stats.totalTodos - stats.completedTodos, color: '#F59E0B' },
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins}分`;
  };

  // SSR中は空の状態を返してハイドレーションエラーを防ぐ
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <div className="text-sm text-gray-500">
            Loading...
          </div>
        </div>
        {/* ローディング状態のプレースホルダー */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <div className="flex items-center space-x-4">
          <DateRangePicker 
            value={selectedDateRange} 
            onChange={setSelectedDateRange} 
          />
          <div className="text-sm text-gray-500">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {selectedDateRange.startDate === selectedDateRange.endDate ? '工数時間' : '期間工数時間'}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatDuration(selectedDateRange.startDate === selectedDateRange.endDate ? stats.totalTimeToday : (stats as any).totalTimeInPeriod || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{selectedDateRange.label}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ToDo進捗</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completedTodos}/{stats.totalTodos}
              </p>
            </div>
            <CheckSquare className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">月額サブスク費用</p>
              <p className="text-2xl font-bold text-purple-600">
                ¥{stats.monthlySubscriptionCost.toLocaleString()}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">登録サービス数</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.totalSubscriptions}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* グラフセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 期間工数グラフ */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDateRange.label}の工数時間
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}時間`, '工数時間']} />
              <Bar dataKey="hours" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ToDo状況円グラフ */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ToDo進捗状況</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={todoStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {todoStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 期限が近いタスク */}
      {upcomingDeadlines.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">期限が近いタスク</h3>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border-l-4 ${
                  task.daysLeft <= 1
                    ? 'border-red-500 bg-red-50'
                    : task.daysLeft <= 3
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">
                      期限: {new Date(task.due_date).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      task.daysLeft <= 1
                        ? 'text-red-800 bg-red-200'
                        : task.daysLeft <= 3
                        ? 'text-orange-800 bg-orange-200'
                        : 'text-yellow-800 bg-yellow-200'
                    }`}
                  >
                    {task.daysLeft <= 0 ? '期限切れ' : `あと${task.daysLeft}日`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 