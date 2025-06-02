'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { getDateString } from '@/lib/dateUtils';

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // プリセット期間の定義
  const getPresetRanges = (): DateRange[] => {
    const today = new Date();
    const todayStr = getDateString(today);
    
    // 今週の開始日（月曜日）
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay(); // 0=日曜日, 1=月曜日, ..., 6=土曜日
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 日曜日の場合は前週の月曜日
    startOfWeek.setDate(today.getDate() + daysToMonday);
    const startOfWeekStr = getDateString(startOfWeek);
    
    // 今月の開始日
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = getDateString(startOfMonth);
    
    // 先週
    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(startOfWeek);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    
    // 先月
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    return [
      { startDate: todayStr, endDate: todayStr, label: '今日' },
      { startDate: startOfWeekStr, endDate: todayStr, label: '今週' },
      { startDate: startOfMonthStr, endDate: todayStr, label: '今月' },
      { startDate: getDateString(lastWeekStart), endDate: getDateString(lastWeekEnd), label: '先週' },
      { startDate: getDateString(lastMonthStart), endDate: getDateString(lastMonthEnd), label: '先月' },
    ];
  };

  const presetRanges = getPresetRanges();

  const handlePresetSelect = (range: DateRange) => {
    onChange(range);
    setIsOpen(false);
  };

  const handleCustomRangeApply = () => {
    if (customStartDate && customEndDate) {
      const range: DateRange = {
        startDate: customStartDate,
        endDate: customEndDate,
        label: `${customStartDate} ～ ${customEndDate}`
      };
      onChange(range);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium">{value.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">期間を選択</h4>
            
            {/* プリセット期間 */}
            <div className="space-y-2 mb-4">
              {presetRanges.map((range, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(range)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${
                    value.startDate === range.startDate && value.endDate === range.endDate
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <hr className="border-gray-200 mb-4" />

            {/* カスタム期間 */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700">カスタム期間</h5>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">開始日</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">終了日</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCustomRangeApply}
                  disabled={!customStartDate || !customEndDate}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  適用
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 