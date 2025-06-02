'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Timesheet as TimesheetType } from '@/types';
import { timesheetStorage } from '@/lib/storage';

interface TimerContextType {
  activeTimer: TimesheetType | null;
  currentTime: Date;
  startTimer: (title: string, category: string) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  getElapsedTime: () => string;
  isTimerActive: boolean;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState<TimesheetType | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 現在時刻を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // アプリ起動時にアクティブタイマーを復元
  useEffect(() => {
    const timesheets = timesheetStorage.getAll();
    const activeTimerRecord = timesheets.find(t => !t.end_time);
    if (activeTimerRecord) {
      setActiveTimer(activeTimerRecord);
    }
  }, []);

  const startTimer = useCallback((title: string, category: string) => {
    const newTimesheet: TimesheetType = {
      title,
      category,
      start_time: new Date().toISOString(),
    };
    
    const saved = timesheetStorage.save(newTimesheet);
    setActiveTimer(saved);
  }, []);

  const stopTimer = useCallback(() => {
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
    }
  }, [activeTimer]);

  const pauseTimer = useCallback(() => {
    if (activeTimer) {
      stopTimer();
    }
  }, [activeTimer, stopTimer]);

  const getElapsedTime = useCallback(() => {
    if (!activeTimer) return '00:00:00';
    
    const start = new Date(activeTimer.start_time);
    const elapsed = Math.floor((currentTime.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [activeTimer, currentTime]);

  const isTimerActive = activeTimer !== null;

  const value: TimerContextType = {
    activeTimer,
    currentTime,
    startTimer,
    stopTimer,
    pauseTimer,
    getElapsedTime,
    isTimerActive,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}; 