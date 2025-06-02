'use client';

import { useState, useEffect } from 'react';
import { Plus, CreditCard, Calendar, DollarSign, Edit2, Trash2, AlertCircle, TrendingUp } from 'lucide-react';
import { subscriptionStorage } from '@/lib/storage';
import { Subscription as SubscriptionType } from '@/types';

export default function Subscription() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SubscriptionType | null>(null);
  
  const [formData, setFormData] = useState({
    service_name: '',
    plan: '',
    amount: '',
    frequency: 'monthly' as SubscriptionType['frequency'],
    renewal_date: '',
    notes: ''
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = () => {
    const data = subscriptionStorage.getAll();
    setSubscriptions(data.sort((a, b) => {
      // 更新日順
      if (a.renewal_date && b.renewal_date) {
        return new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime();
      }
      if (a.renewal_date && !b.renewal_date) return -1;
      if (!a.renewal_date && b.renewal_date) return 1;
      return a.service_name.localeCompare(b.service_name);
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.service_name && formData.frequency) {
      const subscription: SubscriptionType = {
        service_name: formData.service_name,
        plan: formData.plan || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        frequency: formData.frequency,
        renewal_date: formData.renewal_date || undefined,
        notes: formData.notes || undefined
      };
      
      if (editingItem && editingItem.id) {
        subscription.id = editingItem.id;
      }
      
      subscriptionStorage.save(subscription);
      setShowAddForm(false);
      setEditingItem(null);
      setFormData({
        service_name: '',
        plan: '',
        amount: '',
        frequency: 'monthly',
        renewal_date: '',
        notes: ''
      });
      loadSubscriptions();
    }
  };

  const deleteSubscription = (id: number) => {
    if (window.confirm('このサブスクリプションを削除しますか？')) {
      subscriptionStorage.delete(id);
      loadSubscriptions();
    }
  };

  const startEdit = (subscription: SubscriptionType) => {
    setEditingItem(subscription);
    setFormData({
      service_name: subscription.service_name,
      plan: subscription.plan || '',
      amount: subscription.amount?.toString() || '',
      frequency: subscription.frequency,
      renewal_date: subscription.renewal_date || '',
      notes: subscription.notes || ''
    });
    setShowAddForm(true);
  };

  const getFrequencyText = (frequency: SubscriptionType['frequency']) => {
    switch (frequency) {
      case 'daily':
        return '日次';
      case 'weekly':
        return '週次';
      case 'monthly':
        return '月次';
      case 'yearly':
        return '年次';
    }
  };

  const getRenewalColor = (renewal_date?: string) => {
    if (!renewal_date) return 'text-gray-500';
    
    const today = new Date();
    const renewalDate = new Date(renewal_date);
    const diffDays = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600'; // 期限切れ
    if (diffDays <= 7) return 'text-orange-600'; // 1週間以内
    if (diffDays <= 30) return 'text-yellow-600'; // 1ヶ月以内
    return 'text-gray-600';
  };

  const calculateTotalCost = (frequency: SubscriptionType['frequency'], amount: number) => {
    switch (frequency) {
      case 'daily':
        return amount * 30; // 月換算
      case 'weekly':
        return amount * 4.33; // 月換算
      case 'monthly':
        return amount;
      case 'yearly':
        return amount / 12; // 月換算
    }
  };

  const monthlyCost = subscriptions.reduce((total, sub) => {
    if (sub.amount) {
      return total + calculateTotalCost(sub.frequency, sub.amount);
    }
    return total;
  }, 0);

  const yearlyCost = monthlyCost * 12;

  const upcomingRenewals = subscriptions
    .filter(sub => sub.renewal_date)
    .map(sub => ({
      ...sub,
      daysLeft: Math.ceil((new Date(sub.renewal_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }))
    .filter(sub => sub.daysLeft <= 30 && sub.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">サブスクリプション管理</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="button-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>新規サービス</span>
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">登録サービス数</p>
              <p className="text-2xl font-bold text-blue-900">{subscriptions.length}</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">月額合計</p>
              <p className="text-2xl font-bold text-green-900">
                ¥{Math.round(monthlyCost).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">年額合計</p>
              <p className="text-2xl font-bold text-purple-900">
                ¥{Math.round(yearlyCost).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* 更新日が近いサービス */}
      {upcomingRenewals.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">更新日が近いサービス</h3>
          </div>
          <div className="space-y-3">
            {upcomingRenewals.map((sub) => (
              <div
                key={sub.id}
                className={`p-3 rounded-lg border-l-4 ${
                  sub.daysLeft <= 3
                    ? 'border-red-500 bg-red-50'
                    : sub.daysLeft <= 7
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{sub.service_name}</p>
                    <p className="text-sm text-gray-600">
                      更新日: {new Date(sub.renewal_date!).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      sub.daysLeft <= 3
                        ? 'text-red-800 bg-red-200'
                        : sub.daysLeft <= 7
                        ? 'text-orange-800 bg-orange-200'
                        : 'text-yellow-800 bg-yellow-200'
                    }`}
                  >
                    あと{sub.daysLeft}日
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 新規追加・編集フォーム */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? 'サブスクリプションを編集' : '新しいサブスクリプション'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  サービス名 *
                </label>
                <input
                  type="text"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Netflix, Spotify など"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プラン
                </label>
                <input
                  type="text"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="input-field w-full"
                  placeholder="Premium, Basic など"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  料金
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field w-full"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  請求頻度 *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as SubscriptionType['frequency'] })}
                  className="input-field w-full"
                  required
                >
                  <option value="daily">日次</option>
                  <option value="weekly">週次</option>
                  <option value="monthly">月次</option>
                  <option value="yearly">年次</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                次回更新日
              </label>
              <input
                type="date"
                value={formData.renewal_date}
                onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メモ
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field w-full"
                rows={3}
                placeholder="契約内容や注意事項など"
              />
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
                  setFormData({
                    service_name: '',
                    plan: '',
                    amount: '',
                    frequency: 'monthly',
                    renewal_date: '',
                    notes: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* サブスクリプション一覧 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">登録サービス一覧</h3>
        <div className="space-y-3">
          {subscriptions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              まだサブスクリプションが登録されていません。新規サービスを追加してください。
            </p>
          ) : (
            subscriptions.map((subscription) => (
              <div key={subscription.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900 text-lg">
                        {subscription.service_name}
                      </h4>
                      {subscription.plan && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {subscription.plan}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      {subscription.amount && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            ¥{subscription.amount.toLocaleString()} / {getFrequencyText(subscription.frequency)}
                            <span className="text-xs text-gray-500 ml-2">
                              (月換算: ¥{Math.round(calculateTotalCost(subscription.frequency, subscription.amount)).toLocaleString()})
                            </span>
                          </span>
                        </div>
                      )}
                      
                      {subscription.renewal_date && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className={`text-sm ${getRenewalColor(subscription.renewal_date)}`}>
                            次回更新: {new Date(subscription.renewal_date).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      )}
                      
                      {subscription.notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          {subscription.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEdit(subscription)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSubscription(subscription.id!)}
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