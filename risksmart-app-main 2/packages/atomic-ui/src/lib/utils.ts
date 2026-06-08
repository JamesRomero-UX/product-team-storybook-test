import chroma from 'chroma-js';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx('atomic-ui', ...inputs));
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word: string) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

const CONTRAST_THRESHOLD = 2.5;
const LIGHT_TEXT = '#ffffff'; // bg-neutral - todo: what do we do with this re theming?
const DARK_TEXT = '#14143A'; // bg-primary - todo: what do we do with this re theming?

/**
 * Get an accessible text color (light or dark) based on background color.
 * Uses WCAG contrast ratio to determine the best text color for readability.
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  if (!chroma.valid(backgroundColor)) {
    return DARK_TEXT;
  }

  return chroma.contrast(backgroundColor, LIGHT_TEXT) > CONTRAST_THRESHOLD
    ? LIGHT_TEXT
    : DARK_TEXT;
}
