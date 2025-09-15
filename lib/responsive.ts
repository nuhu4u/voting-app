import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions for design (iPhone 12 Pro)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Responsive scaling functions
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Font scaling
export const scaleFont = (size: number): number => {
  const newSize = scale(size);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Check if screen is small
export const isSmallScreen = (): boolean => {
  return SCREEN_WIDTH < breakpoints.sm;
};

// Check if screen is medium
export const isMediumScreen = (): boolean => {
  return SCREEN_WIDTH >= breakpoints.sm && SCREEN_WIDTH < breakpoints.lg;
};

// Check if screen is large
export const isLargeScreen = (): boolean => {
  return SCREEN_WIDTH >= breakpoints.lg;
};

// Get responsive value based on screen size
export const getResponsiveValue = <T>(values: {
  sm?: T;
  md?: T;
  lg?: T;
  default: T;
}): T => {
  if (isSmallScreen() && values.sm !== undefined) {
    return values.sm;
  }
  if (isMediumScreen() && values.md !== undefined) {
    return values.md;
  }
  if (isLargeScreen() && values.lg !== undefined) {
    return values.lg;
  }
  return values.default;
};

// Safe area helpers
export const getSafeAreaInsets = () => {
  // In a real app, you would use react-native-safe-area-context
  // For now, return default values
  return {
    top: 44, // Status bar height
    bottom: 34, // Home indicator height
    left: 0,
    right: 0,
  };
};

// Touch target size (minimum 44x44 points)
export const TOUCH_TARGET_SIZE = 44;

// Common spacing values
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
} as const;

// Common font sizes
export const fontSize = {
  xs: scaleFont(12),
  sm: scaleFont(14),
  md: scaleFont(16),
  lg: scaleFont(18),
  xl: scaleFont(20),
  xxl: scaleFont(24),
  xxxl: scaleFont(32),
} as const;
