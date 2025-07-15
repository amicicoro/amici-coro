import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add this function to your existing utils.ts file
export function getImageSizes(containerWidth: number): string {
  return `
    (max-width: 640px) ${Math.round(containerWidth / 2)}px,
    (max-width: 768px) ${Math.round(containerWidth / 3)}px,
    ${Math.round(containerWidth / 4)}px
  `;
}
