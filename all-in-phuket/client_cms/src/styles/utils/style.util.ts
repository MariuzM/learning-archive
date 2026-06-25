import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const css = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
