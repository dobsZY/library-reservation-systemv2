/**
 * Date utilities
 * @description Helper functions for date formatting and manipulation
 */

const LOCALE = 'tr-TR';

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatTimeShort = (date: Date): string => {
  return date.toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const getRelativeTime = (endTime: string): string => {
  const end = new Date(endTime);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Süre doldu';
  
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (hours > 0) {
    return `${hours}s ${mins}dk kaldı`;
  }
  return `${mins}dk kaldı`;
};

