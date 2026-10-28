// Dark theme (docs/05-decisions.md #15): navy surfaces, white text. It replaces the light navy/white/gray theme (#14) and the teal one (#13).
// Layout values still come from Figma file 0QjYuXdvJ0TeJGcPRi2vdF. Hierarchy comes from the surface level (bg < surface < surfaceRaised),
// not from shadows. Text on any surface is textPrimary or textSecondary; textMuted is for hints and placeholders; disabled for inactive things.
export const colors = {
  navy900: '#0A1A33',
  navy700: '#12294D',
  navy500: '#2A4A7F',
  white: '#FFFFFF',

  bg: '#0A1A33', // page
  surface: '#12294D', // cards, bottom bar, inputs' parent
  surfaceRaised: '#1A3560', // bottom sheet, dropdown, popups, things on a card
  border: 'rgba(255,255,255,0.12)',
  textPrimary: '#FFFFFF',
  textSecondary: '#C5CEDB',
  textMuted: '#8A96A8',
  accent: '#9DB7E8', // selected tab icon, links, small active marks
  disabled: '#4A5870',

  buttonPrimary: '#FFFFFF', // primary button fill
  onButtonPrimary: '#0A1A33', // text on the primary button
  placeholder: '#8A96A8',
  error: '#FFD9D6', // error text and error borders on dark surfaces
  // Risk colors are separate from the brand and only for markers, badges and zone status.
  riskMerah: '#FD0000',
  riskKuning: '#C5B94B',
  riskHijau: '#3E8139',
  statusSuccess: '#3A7D34', // Figma #438C3D; darkened so white text on it reaches 4.5:1
  statusWarning: '#F9E63D',
  statusDanger: '#B3261E',
  statusNeutral: '#000000', // Figma "Masuk Otomatis" pill
  // Navy glass: translucent navy over a blur with a hairline white edge. Text on it is white.
  glass: 'rgba(18,41,77,0.78)',
  glassSheet: 'rgba(18,41,77,0.72)', // bottom sheet of the pre-login screens
  legendFill: 'rgba(10,26,51,0.72)', // map legend glass
} as const;

/** Brand gradient, diagonal: navy900 -> navy700 -> navy500. Used with expo-linear-gradient. */
export const gradients = {
  brand: { colors: ['#0A1A33', '#12294D', '#2A4A7F'], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
} as const;

export const spacing = {
  xs: 6,
  sm: 7,
  md: 16,
  gutter: 30,
  section: 35,
} as const;

export const radius = {
  field: 9,
  button: 13,
} as const;

export const size = {
  field: 45,
  button: 42,
  buttonMinWidth: 122,
  touchMin: 44,
} as const;

export const fontFamily = {
  display: 'CalSans_400Regular',
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const fontSize = {
  display: 40,
  body: 16,
  button: 14,
} as const;

// Design canvas the Figma frames were drawn on.
export const canvas = { width: 412, height: 892 } as const;
