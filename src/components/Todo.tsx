'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckSquare, Square, Calendar, Clock, Edit2, Trash2, Filter } from 'lucide-react';
import { todoStorage } from '@/lib/storage';
import { Todo as TodoType } from '@/types';

export default function Todo() {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoType[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoType | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    status: 'pending' as TodoType['status'],
    due_date: ''
  });

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    filterTodos();
  }, [todos, statusFilter]);

  const loadTodos = () => {
    const data = todoStorage.getAll();
    setTodos(data.sort((a, b) => {
      // 期限順、その後作成日順
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      return (b.id || 0) - (a.id || 0);
    }));
  };

  const filterTodos = () => {
    if (statusFilter === 'all') {
      setFilteredTodos(todos);
    } else {
      setFilteredTodos(todos.filter(todo => todo.status === statusFilter));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.title) {
      const todo: TodoType = {
        title: formData.title,
        status: formData.status,
        due_date: formData.due_date || undefined
      };
      
      if (editingItem && editingItem.id) {
        todo.id = editingItem.id;
      }
      
      todoStorage.save(todo);
      setShowAddForm(false);
      setEditingItem(null);
      setFormData({ title: '', status: 'pending', due_date: '' });
      loadTodos();
    }
  };

  const updateStatus = (id: number, status: TodoType['status']) => {
    const todo = todoStorage.getById(id);
    if (todo) {
      todoStorage.save({ ...todo, status });
      loadTodos();
    }
  };

  const deleteTodo = (id: number) => {
    if (window.confirm('このタスクを削除しますか？')) {
      todoStorage.delete(id);
      loadTodos();
    }
  };

  const startEdit = (todo: TodoType) => {
    setEditingItem(todo);
    setFormData({
      title: todo.title,
      status: todo.status,
      due_date: todo.due_date || ''
    });
    setShowAddForm(true);
  };

  const getStatusColor = (status: TodoType['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: TodoType['status']) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'in_progress':
        return '進行中';
      default:
        return '未着手';
    }
  };

  const getDueDateColor = (due_date?: string) => {
    if (!due_date) return 'text-gray-500';
    
    const today = new Date();
    const dueDate = new Date(due_date);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600'; // 期限切れ
    if (diffDays <= 1) return 'text-orange-600'; // 明日まで
    if (diffDays <= 3) return 'text-yellow-600'; // 3日以内
    return 'text-gray-600';
  };

  const completedCount = todos.filter(t => t.status === 'completed').length;
  const inProgressCount = todos.filter(t => t.status === 'in_progress').length;
  const pendingCount = todos.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ToDo管理</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="button-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>新規タスク</span>
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="text-center">
            <p className="text-sm text-blue-700">全タスク</p>
            <p className="text-2xl font-bold text-blue-900">{todos.length}</p>
          </div>
        </div>
        <div className="card bg-gray-50 border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-700">未着手</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          </div>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <p className="text-sm text-yellow-700">進行中</p>
            <p className="text-2xl font-bold text-yellow-900">{inProgressCount}</p>
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-sm text-green-700">完了</p>
            <p className="text-2xl font-bold text-green-900">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="input-field w-auto"
        >
          <option value="all">すべて</option>
          <option value="pending">未着手</option>
          <option value="in_progress">進行中</option>
          <option value="completed">完了</option>
        </select>
      </div>

      {/* 新規追加・編集フォーム */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? 'タスクを編集' : '新しいタスク'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タスク名
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field w-full"
                placeholder="タスク名を入力してください"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TodoType['status'] })}
                  className="input-field w-full"
                >
                  <option value="pending">未着手</option>
                  <option value="in_progress">進行中</option>
                  <option value="completed">完了</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  期限日
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="button-primary">
                {editingItem ? '更新' : '追加'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  setFormData({ title: '', status: 'pending', due_date: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* タスクリスト */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">タスク一覧</h3>
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {statusFilter === 'all' 
                ? 'まだタスクがありません。新規タスクを追加してください。'
                : `${getStatusText(statusFilter as TodoType['status'])}のタスクがありません。`
              }
            </p>
          ) : (
            filteredTodos.map((todo) => (
              <div 
                key={todo.id} 
                className={`border rounded-lg p-4 hover:bg-gray-50 ${
                  todo.status === 'completed' ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={() => {
                        const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
                        updateStatus(todo.id!, newStatus);
                      }}
                      className="flex-shrink-0"
                    >
                      {todo.status === 'completed' ? (
                        <CheckSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${
                        todo.status === 'completed' 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-900'
                      }`}>
                        {todo.title}
                      </h4>
                      
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(todo.status)}`}>
                          {getStatusText(todo.status)}
                        </span>
                        
                        {todo.due_date && (
                          <div className={`flex items-center space-x-1 text-sm ${getDueDateColor(todo.due_date)}`}>
                            <Calendar className="w-4 h-4" />
                            <span>
                              期限: {new Date(todo.due_date).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {todo.status !== 'completed' && (
                      <button
                        onClick={() => {
                          const newStatus = todo.status === 'pending' ? 'in_progress' : 'pending';
                          updateStatus(todo.id!, newStatus);
                        }}
                        className={`px-2 py-1 text-xs rounded ${
                          todo.status === 'in_progress' 
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
                        }`}
                      >
                        {todo.status === 'in_progress' ? '一時停止' : '開始'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => startEdit(todo)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id!)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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