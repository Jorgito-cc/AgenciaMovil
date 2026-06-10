// Paleta de colores de la aplicación AgencyClient
export const Colors = {
  // Primarios
  primary: '#5B4BDB',
  primaryDark: '#4338CA',
  primaryLight: '#7C3AED',
  primaryFaded: 'rgba(91, 75, 219, 0.08)',
  primaryFaded15: 'rgba(91, 75, 219, 0.15)',

  // Fondos
  background: '#FFFFFF',
  card: '#F8FAFC',
  cardAlt: '#F1F5F9',

  // Textos
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textWhite: '#FFFFFF',

  // Bordes y separadores
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E2E8F0',

  // Indicadores
  dotActive: '#5B4BDB',
  dotInactive: '#D1D5DB',

  // Estados
  success: '#10B981',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Sombras
  shadow: 'rgba(0, 0, 0, 0.06)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 34,
  display: 42,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  button: {
    shadowColor: '#5B4BDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};
