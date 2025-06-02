'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Clock, Calendar, Edit2, Trash2 } from 'lucide-react';
import { timesheetStorage } from '@/lib/storage';
import { Timesheet as TimesheetType } from '@/types';

export default function Timesheet() {
  const [timesheets, setTimesheets] = useState<TimesheetType[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimesheetType | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TimesheetType | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    start_time: '',
    end_time: ''
  });

  const categories = ['開発', 'ミーティング', '学習', 'ドキュメント作成', '管理業務', 'その他'];

  useEffect(() => {
    loadTimesheets();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTimesheets = () => {
    const data = timesheetStorage.getAll();
    setTimesheets(data.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
  };

  const startTimer = (title: string, category: string) => {
    const newTimesheet: TimesheetType = {
      title,
      category,
      start_time: new Date().toISOString(),
    };
    
    const saved = timesheetStorage.save(newTimesheet);
    setActiveTimer(saved);
    setShowAddForm(false);
    setFormData({ title: '', category: '', start_time: '', end_time: '' });
    loadTimesheets();
  };

  const stopTimer = () => {
    if (activeTimer && activeTimer.id) {
      const endTime = new Date().toISOString();
      const startTime = new Date(activeTimer.start_time);
      const elapsed = Math.round((new Date().getTime() - startTime.getTime()) / 60000);
      
      const updated: TimesheetType = {
        ...activeTimer,
        end_time: endTime,
        elapsed_minutes: elapsed
      };
      
      timesheetStorage.save(updated);
      setActiveTimer(null);
      loadTimesheets();
    }
  };

  const pauseTimer = () => {
    if (activeTimer) {
      stopTimer();
    }
  };

  const deleteTimesheet = (id: number) => {
    if (window.confirm('この工数記録を削除しますか？')) {
      timesheetStorage.delete(id);
      loadTimesheets();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.title && formData.category) {
      if (formData.start_time && formData.end_time) {
        // 手動入力の場合
        const startTime = new Date(formData.start_time);
        const endTime = new Date(formData.end_time);
        const elapsed = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
        
        const timesheet: TimesheetType = {
          title: formData.title,
          category: formData.category,
          start_time: formData.start_time,
          end_time: formData.end_time,
          elapsed_minutes: elapsed
        };
        
        if (editingItem && editingItem.id) {
          timesheet.id = editingItem.id;
        }
        
        timesheetStorage.save(timesheet);
        setShowAddForm(false);
        setEditingItem(null);
        setFormData({ title: '', category: '', start_time: '', end_time: '' });
        loadTimesheets();
      } else {
        // タイマー開始
        startTimer(formData.title, formData.category);
      }
    }
  };

  const startEdit = (timesheet: TimesheetType) => {
    setEditingItem(timesheet);
    setFormData({
      title: timesheet.title,
      category: timesheet.category,
      start_time: timesheet.start_time ? timesheet.start_time.slice(0, -1) : '',
      end_time: timesheet.end_time ? timesheet.end_time.slice(0, -1) : ''
    });
    setShowAddForm(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}時間${mins}分`;
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('ja-JP');
  };

  const getElapsedTime = () => {
    if (!activeTimer) return '00:00:00';
    
    const start = new Date(activeTimer.start_time);
    const elapsed = Math.floor((currentTime.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const todayTotal = timesheets
    .filter(t => t.start_time.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((total, t) => total + (t.elapsed_minutes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">工数管理</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="button-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>新規記録</span>
        </button>
      </div>

      {/* アクティブタイマー */}
      {activeTimer && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">{activeTimer.title}</h3>
              <p className="text-blue-700">{activeTimer.category}</p>
              <p className="text-sm text-blue-600">
                開始: {formatTime(activeTimer.start_time)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {getElapsedTime()}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={pauseTimer}
                  className="flex items-center space-x-1 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  <Pause className="w-4 h-4" />
                  <span>一時停止</span>
                </button>
                <button
                  onClick={stopTimer}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Square className="w-4 h-4" />
                  <span>終了</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 今日の合計時間 */}
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-center space-x-3">
          <Clock className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-green-700">今日の合計工数時間</p>
            <p className="text-2xl font-bold text-green-900">
              {formatDuration(todayTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* 新規追加・編集フォーム */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? '工数記録を編集' : '新しい工数記録'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作業内容
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field w-full"
                placeholder="作業内容を入力してください"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="">カテゴリを選択</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始時間（手動入力の場合）
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了時間（手動入力の場合）
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="button-primary">
                {editingItem ? '更新' : formData.start_time && formData.end_time ? '保存' : 'タイマー開始'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setFormData({ title: '', category: '', start_time: '', end_time: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 工数記録リスト */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">工数記録履歴</h3>
        <div className="space-y-3">
          {timesheets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              まだ工数記録がありません。新規記録を開始してください。
            </p>
          ) : (
            timesheets.map((timesheet) => (
              <div key={timesheet.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{timesheet.title}</h4>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {timesheet.category}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>開始: {formatTime(timesheet.start_time)}</p>
                      {timesheet.end_time && (
                        <p>終了: {formatTime(timesheet.end_time)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {timesheet.elapsed_minutes ? (
                      <div className="text-right">
                        <p className="font-semibold text-lg text-blue-600">
                          {formatDuration(timesheet.elapsed_minutes)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-green-600 font-medium">実行中</span>
                    )}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEdit(timesheet)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTimesheet(timesheet.id!)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 