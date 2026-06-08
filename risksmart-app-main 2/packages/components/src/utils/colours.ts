import theme from '@risk-smart/web-theme';
import chroma from 'chroma-js';

import type {
  RatingOption,
  RatingWithColor,
  RatingWithColorAndRange,
} from '../hooks/types';

const THRESHOLD = 2.5;
const WHITE = '#ffffff';
const LIGHT_TEXT = '#ffffff';
const DARK_TEXT = '#2D2D53';
const GRAY_TEXT = '#8b8ba0';
const DARK_BG = '#fbfbfb';

export const chartLayoutColours = {
  titles: DARK_TEXT,
  axisLabels: GRAY_TEXT,
  unitColour: GRAY_TEXT,
  seriesBorders: LIGHT_TEXT,
};

export const colours = {
  'dark-green': { backgroundColor: '#6DAC3F', color: LIGHT_TEXT },
  'light-green': { backgroundColor: '#8CC862', color: LIGHT_TEXT },
  orange: { backgroundColor: '#F2A041', color: LIGHT_TEXT },
  'light-red': { backgroundColor: '#E37373', color: LIGHT_TEXT },
  'dark-red': { backgroundColor: '#CE1B1B', color: LIGHT_TEXT },
  'charts-yellow-300': { backgroundColor: '#b2911c', color: DARK_TEXT },
  'charts-blue-1-400': { backgroundColor: '#3184c2', color: DARK_TEXT },
  'charts-blue-1-300': { backgroundColor: '#529ccb', color: DARK_TEXT },
  'charts-teal-300': { backgroundColor: '#2ea597', color: DARK_TEXT },
  'charts-grey-450': { backgroundColor: '#5f6b7a', color: DARK_TEXT },
  'light-grey': { backgroundColor: '#E8E8EC', color: '#73738C' },
  'light-gray': { backgroundColor: '#E8E8EC', color: '#73738C' },
  black: { backgroundColor: '#000000', color: DARK_TEXT },
  'darker-green': { backgroundColor: '#048e6b', color: LIGHT_TEXT },
  'light-yellow': { backgroundColor: '#ffe896', color: DARK_TEXT },
  'lighter-orange': { backgroundColor: '#ffa26b', color: DARK_TEXT },
  'darker-orange': { backgroundColor: '#ec8243', color: DARK_TEXT },
  'strong-red': { backgroundColor: '#ff3e68', color: LIGHT_TEXT },
  'blue-100': { backgroundColor: '#f2f8fd', color: DARK_TEXT },
  'blue-200': { backgroundColor: '#d3e7f9', color: DARK_TEXT },
  'blue-300': { backgroundColor: '#b5d6f4', color: DARK_TEXT },
  'blue-400': { backgroundColor: '#89bdee', color: DARK_TEXT },
  'blue-500': { backgroundColor: '#539fe5', color: LIGHT_TEXT },
  'blue-600': { backgroundColor: '#0972d3', color: LIGHT_TEXT },
  'blue-700': { backgroundColor: '#065299', color: LIGHT_TEXT },
  'icon-light': { backgroundColor: '#F9FAFB', color: DARK_TEXT },
  'ai-assistant': { backgroundColor: '#D3349A', color: LIGHT_TEXT },
  'border-light': { backgroundColor: '#e5e5e5', color: DARK_TEXT },
  'icon-default': { backgroundColor: '#495057', color: LIGHT_TEXT },
  'text-muted': { backgroundColor: '#99A1AF', color: LIGHT_TEXT },
  'bg-dark-slate': { backgroundColor: '#475569', color: LIGHT_TEXT },
  'border-menu': { backgroundColor: '#E9EBED', color: DARK_TEXT },
  'secondary-green-700': { backgroundColor: '#A8D08C', color: LIGHT_TEXT },
  'secondary-green-800': { backgroundColor: '#79B250', color: LIGHT_TEXT },
  'secondary-red-800': { backgroundColor: '#D92B2B', color: LIGHT_TEXT },
  'secondary-red-900': { backgroundColor: '#BA2E0F', color: LIGHT_TEXT },
} as const;

// Colours taken from cloudscape recommended palette for generic categorical data
// https://cloudscape.design/foundation/visual-foundation/data-vis-colors/#generic-categorical-palette

export const genericChartColours = [
  theme.colors.teal,
  '#C33D69', // = charts-pink-500
  '#688AE8', // = charts-blue-2-300
  '#8456CE', // = charts-purple-500
  '#E07941', // = charts-orange-300
  '#3759CE', // = charts-blue-2-600
  '#962249', // = charts-pink-800
  '#096F64', // = charts-teal-600
  '#6237A7', // = charts-purple-800
  '#A84401', // = charts-orange-600
  '#273EA5', // = charts-blue-2-900
  '#780D35', // = charts-pink-1100
  '#03524A', // = charts-teal-900
  '#4A238B', // = charts-purple-1100,
  '#7E3103', // = charts-orange-900,
  '#1B2B88', // = charts-blue-2-1200
];

const colorKeys = Object.keys(colours) as (keyof typeof colours)[];

const isColorKey = (key: string): key is keyof typeof colours =>
  colorKeys.includes(key as (typeof colorKeys)[number]);

export const getAccessibleTextColor = (colorName: string) =>
  chroma.contrast(colorName, WHITE) > THRESHOLD ? LIGHT_TEXT : DARK_TEXT;

const DEFAULT = {
  backgroundColor: DARK_BG,
  color: LIGHT_TEXT,
};

export const hasColor = (
  item: unknown
): item is RatingWithColor | RatingWithColorAndRange => {
  return !!(item as RatingOption)?.color;
};

export const getColorStyles = (
  colorName: (typeof colorKeys)[number] | string | undefined
) => {
  if (!colorName) {
    return DEFAULT;
  }

  /* Compare input to lookup table */
  if (isColorKey(colorName)) {
    return {
      backgroundColor: colours[colorName].backgroundColor,
      color: getAccessibleTextColor(colours[colorName].backgroundColor),
    };
  }

  if (chroma.valid(colorName)) {
    const color = getAccessibleTextColor(colorName);
    const backgroundColor = String(chroma(colorName));

    return { backgroundColor, color };
  } else {
    console.error(`Invalid colour ${colorName}`);
  }

  return DEFAULT;
};

// Avatar color system for consistent user avatars
export const avatarColors = [
  '#EF4444', // red-500
  '#F97316', // orange-500
  '#EAB308', // yellow-500
  '#22C55E', // green-500
  '#06B6D4', // cyan-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5A2B', // brown-500
  '#6B7280', // gray-500
] as const;

/**
 * Generate a consistent color based on username for avatar backgrounds
 */
export const getUserAvatarColor = (name: string | undefined): string => {
  if (!name) {
    return colours['bg-dark-slate'].backgroundColor;
  }

  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return avatarColors[Math.abs(hash) % avatarColors.length];
};

export type Colour = keyof typeof colours;
