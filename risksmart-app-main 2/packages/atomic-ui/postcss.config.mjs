import atomicScope from './postcss-atomic-scope.cjs';

export default {
  plugins: [
    // Process @import statements first
    (await import('postcss-import')).default,
    // Tailwind CSS
    (await import('tailwindcss')).default,
    // Scope utilities under .atomic-ui
    atomicScope,
    // Autoprefixer for browser compatibility
    (await import('autoprefixer')).default,
  ],
};
