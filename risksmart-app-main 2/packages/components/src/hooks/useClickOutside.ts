import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle clicks outside a referenced element
 * @param handler - Function to call when clicking outside
 * @param isActive - Whether the click outside detection should be active
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: () => void,
  isActive: boolean = true
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    // Use both mouse and touch events for better mobile support
    document.addEventListener('mousedown', handleClickOutside, {
      passive: true,
    });
    document.addEventListener('touchstart', handleClickOutside, {
      passive: true,
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler, isActive]);

  return ref;
};
