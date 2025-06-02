// 時間処理の統一ライブラリ

/**
 * 現在のローカル時間をISO文字列で取得
 * データベース保存用のUTC時間を返す
 */
export const getCurrentISOString = (): string => {
  return new Date().toISOString();
};

/**
 * ISO文字列をdatetime-local input用の形式に変換
 * UTCからローカル時間に変換してZを除去
 */
export const isoToDatetimeLocal = (isoString: string): string => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  // ローカル時間に変換してdatetime-local形式に
  const localISOString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
  return localISOString.slice(0, -1); // 末尾のZを除去
};

/**
 * datetime-local input値をISO文字列に変換
 * ローカル時間として扱われた値をUTCに変換
 */
export const datetimeLocalToISO = (datetimeLocal: string): string => {
  if (!datetimeLocal) return '';
  
  // datetime-localの値は既にローカル時間として扱われているため、
  // そのままnew Dateに渡すとローカル時間として解釈される
  const date = new Date(datetimeLocal);
  return date.toISOString();
};

/**
 * ISO文字列を日本語表示用にフォーマット
 */
export const formatToJapanese = (isoString: string): string => {
  if (!isoString) return '';
  
  return new Date(isoString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * 経過時間を分単位で計算
 */
export const calculateElapsedMinutes = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / 60000);
};

/**
 * 分を時間と分の形式でフォーマット
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}時間${mins}分`;
};

/**
 * 日付文字列（YYYY-MM-DD）を取得
 */
export const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

/**
 * 指定した日付の開始時刻（00:00:00）のISO文字列を取得
 */
export const getStartOfDay = (dateString: string): string => {
  return `${dateString}T00:00:00.000Z`;
};

/**
 * 指定した日付の終了時刻（23:59:59）のISO文字列を取得
 */
export const getEndOfDay = (dateString: string): string => {
  return `${dateString}T23:59:59.999Z`;
};

/**
 * 指定した期間のデータをフィルタリング
 */
export const filterByDateRange = <T extends { start_time: string }>(
  data: T[],
  startDate: string,
  endDate: string
): T[] => {
  const start = getStartOfDay(startDate);
  const end = getEndOfDay(endDate);
  
  return data.filter(item => {
    const itemDate = item.start_time;
    return itemDate >= start && itemDate <= end;
  });
};

/**
 * 期間に応じた工数グラフデータを生成
 */
export const generatePeriodChartData = (
  data: any[],
  startDate: string,
  endDate: string
): { day: string; hours: number; date: string }[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // 期間が7日以下の場合は日別表示
  if (diffDays <= 7) {
    const chartData = [];
    
    for (let i = 0; i < diffDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = getDateString(date);
      
      const dayData = data.filter(t => 
        t.start_time.startsWith(dateStr)
      );
      
      const totalMinutes = dayData.reduce((total, t) => 
        total + (t.elapsed_minutes || 0), 0
      );
      
      chartData.push({
        day: date.toLocaleDateString('ja-JP', { 
          month: 'numeric', 
          day: 'numeric',
          weekday: 'short' 
        }),
        hours: Math.round(totalMinutes / 60 * 10) / 10,
        date: dateStr
      });
    }
    
    return chartData;
  }
  
  // 期間が長い場合は週別表示
  const chartData = [];
  const weekStart = new Date(start);
  const dayOfWeek = weekStart.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(weekStart.getDate() + daysToMonday);
  
  while (weekStart <= end) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekEndCapped = weekEnd > end ? end : weekEnd;
    
    const weekData = data.filter(t => {
      const itemDate = t.start_time.split('T')[0];
      return itemDate >= getDateString(weekStart) && itemDate <= getDateString(weekEndCapped);
    });
    
    const totalMinutes = weekData.reduce((total, t) => 
      total + (t.elapsed_minutes || 0), 0
    );
    
    chartData.push({
      day: `${weekStart.getMonth() + 1}/${weekStart.getDate()}~`,
      hours: Math.round(totalMinutes / 60 * 10) / 10,
      date: getDateString(weekStart)
    });
    
    weekStart.setDate(weekStart.getDate() + 7);
  }
  
  return chartData;
}; 