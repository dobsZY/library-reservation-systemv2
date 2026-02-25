/**
 * Class name utility
 * @description Merge Tailwind classes conditionally
 */

type ClassValue = string | undefined | null | false;

export const cn = (...classes: ClassValue[]): string => {
  return classes.filter(Boolean).join(' ');
};
