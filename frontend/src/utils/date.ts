import { format, formatDistance, addHours, differenceInMinutes, isAfter, isBefore } from 'date-fns';
import { tr } from 'date-fns/locale';

export const formatTime = (date: string | Date): string => {
  return format(new Date(date), 'HH:mm', { locale: tr });
};

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'd MMMM yyyy', { locale: tr });
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'd MMMM yyyy HH:mm', { locale: tr });
};

export const formatTimeRange = (start: string | Date, end: string | Date): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

export const getRelativeTime = (date: string | Date): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: tr });
};

export const getRemainingMinutes = (endTime: string | Date): number => {
  return differenceInMinutes(new Date(endTime), new Date());
};

export const getRemainingTimeText = (endTime: string | Date): string => {
  const minutes = getRemainingMinutes(endTime);
  
  if (minutes <= 0) return 'Süre doldu';
  if (minutes < 60) return `${minutes} dakika`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  if (remainingMins === 0) return `${hours} saat`;
  return `${hours} saat ${remainingMins} dakika`;
};

export const getTimeSlots = (openingHour: number = 8, closingHour: number = 23): string[] => {
  const slots: string[] = [];
  for (let hour = openingHour; hour < closingHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

export const isWithinOperatingHours = (
  time: Date,
  openingHour: number = 8,
  closingHour: number = 23
): boolean => {
  const hour = time.getHours();
  return hour >= openingHour && hour < closingHour;
};

export const canExtendReservation = (endTime: string | Date): boolean => {
  const minutes = getRemainingMinutes(endTime);
  return minutes <= 30 && minutes > 0;
};

export { addHours, differenceInMinutes, isAfter, isBefore };

