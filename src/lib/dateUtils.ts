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