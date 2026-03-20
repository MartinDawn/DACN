// Design System Documentation
// Modern UI improvements for DACN project

// ===== COLOR PALETTE =====
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#5a2dff',
    600: '#3c1cd6',
    900: '#05001a'
  },

  // Secondary Colors
  secondary: {
    emerald: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',
      600: '#059669'
    },
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706'
    },
    indigo: {
      50: '#eef2ff',
      100: '#e0e7ff',
      500: '#6366f1',
      600: '#4f46e5'
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#8b5cf6',
      600: '#7c3aed'
    }
  },

  // Neutral Colors
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

// ===== SPACING SYSTEM =====
export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem'    // 96px
};

// ===== TYPOGRAPHY =====
export const typography = {
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'   // 36px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};

// ===== BORDER RADIUS =====
export const borderRadius = {
  sm: '0.25rem',     // 4px
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px
  xl: '1rem',        // 16px
  '2xl': '1.5rem',   // 24px
  '3xl': '2rem',     // 32px
  full: '9999px'
};

// ===== SHADOWS =====
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  colored: '0 12px 30px rgba(90, 45, 255, 0.25)'
};

// ===== COMPONENT STYLES =====
export const components = {
  // Button Styles
  button: {
    base: `
      inline-flex items-center justify-center gap-2 rounded-xl
      font-bold text-sm transition-all duration-200
      focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed
    `,

    primary: `
      bg-gradient-to-r from-[#5a2dff] to-[#3c1cd6] text-white
      hover:shadow-lg hover:shadow-[#5a2dff]/25 hover:scale-105
      focus:ring-indigo-100
    `,

    secondary: `
      border-2 border-gray-200 bg-white text-gray-700
      hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105
      focus:ring-indigo-100
    `,

    danger: `
      bg-red-500 text-white
      hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105
      focus:ring-red-100
    `,

    sizes: {
      sm: 'px-4 py-2',
      md: 'px-5 py-3',
      lg: 'px-6 py-4'
    }
  },

  // Card Styles
  card: {
    base: `
      rounded-3xl border border-slate-200 shadow-lg shadow-slate-900/5
      transition-all duration-200
    `,

    gradient: `
      bg-gradient-to-r from-white to-slate-50
    `,

    hover: `
      hover:shadow-xl hover:shadow-slate-900/10 hover:scale-[1.02]
    `
  },

  // Input Styles
  input: {
    base: `
      block w-full rounded-xl border-2 border-slate-200 bg-white
      px-4 py-3 text-sm font-medium transition-all duration-200
      focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
      hover:border-slate-300
    `
  },

  // Icon Wrapper Styles
  iconWrapper: {
    base: 'rounded-full p-2 transition-all duration-200',
    colors: {
      indigo: 'bg-indigo-100 text-indigo-600 border border-indigo-200',
      emerald: 'bg-emerald-100 text-emerald-600 border border-emerald-200',
      amber: 'bg-amber-100 text-amber-600 border border-amber-200',
      red: 'bg-red-100 text-red-600 border border-red-200'
    }
  }
};

// ===== ANIMATIONS =====
export const animations = {
  // Hover Effects
  scaleHover: 'hover:scale-105 transition-transform duration-200',
  shadowHover: 'hover:shadow-xl hover:shadow-slate-900/10 transition-shadow duration-200',

  // Loading States
  pulse: 'animate-pulse',
  spin: 'animate-spin',

  // Micro-interactions
  buttonPress: 'active:scale-95 transition-transform duration-100',
  iconHover: 'group-hover:scale-110 transition-transform duration-200',

  // Slide Effects
  slideLeft: 'group-hover:-translate-x-1 transition-transform duration-200',
  slideUp: 'group-hover:-translate-y-1 transition-transform duration-200'
};

// ===== LAYOUT UTILITIES =====
export const layout = {
  container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
  section: 'py-12 lg:py-16',
  grid: {
    responsive: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    cards: 'grid gap-8 lg:grid-cols-2'
  }
};

// ===== USAGE EXAMPLES =====
export const examples = {
  modernButton: `
    <button className="${components.button.base} ${components.button.primary} ${components.button.sizes.md}">
      <PlusIcon className="h-5 w-5" />
      Add New
    </button>
  `,

  gradientCard: `
    <div className="${components.card.base} ${components.card.gradient} ${components.card.hover} p-6">
      Card content
    </div>
  `,

  iconWithWrapper: `
    <div className="${components.iconWrapper.base} ${components.iconWrapper.colors.indigo}">
      <StarIcon className="h-5 w-5" />
    </div>
  `
};

// Export default design system object
export const designSystem = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  components,
  animations,
  layout,
  examples
};

export default designSystem;