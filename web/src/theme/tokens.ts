// Dark theme shared with mobile (docs/05-decisions.md #15; mobile/src/theme/tokens.ts). Layout values come from Figma
// file 0QjYuXdvJ0TeJGcPRi2vdF (web canvas 1440x1024); Figma colors are NOT used. Hierarchy comes from the surface
// level (bg < surface < surfaceRaised), not shadows. Every color in the app goes through these tokens, either as a
// CSS variable (see cssVars.ts) or, where CSS cannot reach (chart canvas, Leaflet paths), by importing them directly.
export const colors = {
  navy900: '#0A1A33',
  navy700: '#12294D',
  navy500: '#2A4A7F',
  white: '#FFFFFF',

  bg: '#0A1A33', // page
  surface: '#12294D', // cards, navbar
  surfaceRaised: '#1A3560', // popups, dropdowns, dialogs, inputs and rows on a card
  border: 'rgba(255,255,255,0.12)',
  textPrimary: '#FFFFFF',
  textSecondary: '#C5CEDB',
  textMuted: '#8A96A8', // hints and placeholders on bg or surface only
  accent: '#9DB7E8', // active nav item, links, chart line, focus ring
  disabled: '#4A5870',

  buttonPrimary: '#FFFFFF',
  onButtonPrimary: '#0A1A33',
  error: '#FFD9D6', // error text and error borders on dark surfaces
  // Risk colors only for risk category: markers, dots, category charts. Never as a text color or text background.
  riskMerah: '#FD0000',
  riskKuning: '#C5B94B',
  riskHijau: '#3E8139',
  // Report status pills (not risk): same values as mobile. White text on success/danger, navy text on warning.
  statusSuccess: '#3A7D34',
  statusWarning: '#F9E63D',
  statusDanger: '#B3261E',
  overlay: 'rgba(5,13,26,0.72)', // behind dialogs
  glass: 'rgba(18,41,77,0.78)', // map legend and attribution glass (small text over map tiles)
  gridLine: 'rgba(255,255,255,0.08)', // chart grid
  rowDivider: 'rgba(255,255,255,0.12)', // rules between table rows
  mapPin: '#12294D', // the one-place pin on the light basemap (white edge); a place, not a risk category
  mapAreaCasing: 'rgba(10,26,51,0.4)', // thin dark edge under a zone area so a yellow outline stays visible on the light map
  // Account popup: a solid surfaceRaised panel so it never blends into the page behind it.
  menuBorder: 'rgba(255,255,255,0.18)',
  menuDivider: 'rgba(255,255,255,0.2)', // 1px rule between Profil akun and Keluar
  menuItemHover: 'rgba(255,255,255,0.10)',
  menuDanger: '#FFB4AB', // soft red for Keluar: 7.2:1 on surfaceRaised, >= 4.5:1 under the hover tint
  menuShadowColor: 'rgba(0,0,0,0.5)',
  // Phone frame of the mobile preview (MobilePreviewPage): near-black body with a thin light rim, as a real handset.
  deviceBody: '#05080F',
  deviceRim: 'rgba(255,255,255,0.22)',
  deviceShadow: 'rgba(0,0,0,0.55)',

  // Page background (AppBackground), from docs/design/glass-reference.html: navy base with soft light.
  pageTop: '#0f2447',
  pageBottom: '#08142a',
  pageGlowTop: 'rgba(150,178,222,0.55)', // soft light, top centre
  pageGlowCorner: 'rgba(42,74,127,0.75)', // bluer bottom-right corner
  pageGlowSide: 'rgba(42,74,127,0.55)', // bluer left middle

  // Glass (index.css .glass / .glass-in), same reference. Outer layer = white tint over a real blur; inner layer = tint
  // and edge only, no blur. Fallbacks are solid navy where backdrop-filter is missing.
  glassFrom: 'rgba(255,255,255,0.16)',
  glassTo: 'rgba(255,255,255,0.05)',
  glassEdge: 'rgba(255,255,255,0.20)',
  glassShine: 'rgba(255,255,255,0.28)', // 1px highlight along the top edge
  glassShadow: 'rgba(2,8,20,0.45)',
  glassFallback: '#16315C',
  // App shell after login (docs/design/prototype-web-cards.html): every block of a page is its own glass card on a
  // transparent page, under a header and a sticky pill nav. Login keeps the glass above.
  cardFrom: 'rgba(255,255,255,0.15)',
  cardTo: 'rgba(255,255,255,0.06)',
  // A thin navy layer under the white gradient: where a card sits over the batik, its text stays at 4.5:1 or more
  // (measured from rendered pixels: without it the lightest spots gave 4.2 to 4.5). The edge, blur and white gradient are the prototype's.
  cardUnder: 'rgba(10,26,51,0.2)',
  cardEdge: 'rgba(255,255,255,0.28)',
  cardEdgeHover: 'rgba(255,255,255,0.5)', // grid cards under the pointer
  navBar: 'rgba(10,26,51,0.55)', // the pill nav bar
  chipFill: 'rgba(10,26,51,0.45)', // the account chip in the header
  navMuted: '#D7DEEA', // inactive nav pills (>= 5.6:1 on the nav bar)
  rowRule: 'rgba(255,255,255,0.22)', // rule above every table row
  // Reject/delete buttons: outline in soft red. The text is a little lighter than the prototype's #FFB4AC so it keeps
  // 4.5:1 on the lightest corner of a card (about 4.8:1; #FFB4AC is about 4.1:1 there).
  dangerSoft: '#FFCBC5',
  dangerSoftEdge: 'rgba(255,180,172,0.7)',
  glassInFrom: 'rgba(255,255,255,0.12)',
  glassInTo: 'rgba(255,255,255,0.04)',
  glassInEdge: 'rgba(255,255,255,0.16)',
  glassInShine: 'rgba(255,255,255,0.18)',
  // Text on glass. The reference light makes textSecondary (#C5CEDB) drop to 3.5:1 inside .glass-in and accent and
  // error below 4.5:1, so inside any glass these replace them (index.css). Checked at the lightest spot: >= 4.59:1.
  textSecondaryOnGlass: '#E4EAF2',
  accentOnGlass: '#E2EAFB',
  errorOnGlass: '#FFE8E6',
  navItem: 'rgba(255,255,255,0.07)', // inactive navbar pill
  navItemEdge: 'rgba(255,255,255,0.14)',
  activeShadow: 'rgba(0,0,0,0.35)', // under the white active pill
  // Form fields: placeholder (>= 4.5:1 on the field fill, which is bg) and the 3px ring around a focused input.
  placeholder: '#9AA6B8',
  focusRing: 'rgba(157,183,232,0.3)',
  // Loading skeleton: the base block and the moving highlight.
  // Selected row of a list (command palette) and the off track of a Switch.
  selection: 'rgba(157,183,232,0.18)',
  switchOff: 'rgba(255,255,255,0.14)',
  skeleton: 'rgba(255,255,255,0.08)',
  skeletonShine: 'rgba(255,255,255,0.18)',
} as const;

export const gradients = {
  /** Brand gradient, diagonal: navy900 -> navy700 -> navy500 (mobile splash; kept for parity). */
  brand: `linear-gradient(135deg, ${colors.navy900} 0%, ${colors.navy700} 55%, ${colors.navy500} 100%)`,
  /** Layered page background of AppBackground (glass-reference.html). */
  page: [
    `radial-gradient(900px 520px at 50% -6%, ${colors.pageGlowTop}, transparent 70%)`,
    `radial-gradient(700px 600px at 100% 100%, ${colors.pageGlowCorner}, transparent 70%)`,
    `radial-gradient(600px 500px at 0% 55%, ${colors.pageGlowSide}, transparent 70%)`,
    `linear-gradient(160deg, ${colors.pageTop} 0%, ${colors.navy900} 55%, ${colors.pageBottom} 100%)`,
  ].join(', '),
  glass: `linear-gradient(135deg, ${colors.glassFrom} 0%, ${colors.glassTo} 100%)`,
  glassIn: `linear-gradient(135deg, ${colors.glassInFrom}, ${colors.glassInTo})`,
  /** Glass card of the app shell (KPI, tables, grid cards, forms). */
  card: `linear-gradient(150deg, ${colors.cardFrom}, ${colors.cardTo}), linear-gradient(${colors.cardUnder}, ${colors.cardUnder})`,
} as const;

/** Whole CSS values that are not a single color or length. */
export const effects = {
  glassFilter: 'blur(22px) saturate(140%)',
  glassShadow: `0 10px 36px ${colors.glassShadow}, inset 0 1px 0 ${colors.glassShine}`,
  glassInShadow: `inset 0 1px 0 ${colors.glassInShine}`,
  activeShadow: `0 6px 18px ${colors.activeShadow}`,
  menuShadow: `0 12px 32px ${colors.menuShadowColor}`,
  // Hover lift of cards and buttons.
  cardHoverShadow: `0 10px 24px ${colors.glassShadow}`,
  buttonHoverShadow: `0 4px 12px ${colors.activeShadow}`,
  cardFilter: 'blur(16px)', // app-shell cards
  barFilter: 'blur(14px)', // pill nav and account chip
} as const;

/** Motion (src/motion.css), written as --ease, --dur-fast, --dur-base and --dur-enter. */
export const motion = {
  ease: 'cubic-bezier(.2,.8,.2,1)',
  durFast: '120ms',
  durBase: '200ms',
  durEnter: '500ms',
} as const;

export const opacity = {
  batik: 0.08, // batik clusters at the screen edges (6-10%), Login
  batikShell: 0.3, // batik corner clusters behind the app shell
  batikShellSide: 0.2, // the extra right-middle cluster of the app shell
} as const;

// px
export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  page: 48, // horizontal page gutter on the 1440 canvas
} as const;

export const radius = {
  field: 9,
  button: 13,
  card: 16,
  pill: 18, // navbar items, inner cards (glass-reference.html)
  chip: 22, // account chip
  nav: 26, // navbar bar
  tile: 28, // stat tiles
  sheet: 40, // the rounded top edge of the login panel
  panel: 64, // the old page panel; the app shell no longer draws one
  glassCard: 20, // every glass card of the app shell
  navBar: 22, // the pill nav bar
  navPill: 15, // one pill of the nav
  phone: 54, // outer corner of the mobile preview handset (PhoneFrame)
} as const;

export const size = {
  touchMin: 44,
  avatar: 44,
  field: 42,
  button: 40,
  buttonMinWidth: 116,
  formWidth: 420, // form column of the centred cards (403 page); the Login card itself is 400 max
  contentMax: 1280,
  // Mobile preview: the app screen at its Figma size (412x892), the status bar drawn by the frame above it, the bezel around it.
  phoneScreenWidth: 412,
  phoneScreenHeight: 892,
  phoneStatusBar: 34,
  phoneBezel: 12,
} as const;

export const fontFamily = {
  display: "'Cal Sans', 'Plus Jakarta Sans', system-ui, sans-serif",
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
} as const;

export const fontSize = {
  display: 28, // Login title
  brand: 28, // the wordmark top-left
  h1: 30, // page titles
  h2: 20,
  body: 15,
  small: 13,
  caption: 12,
  // App shell (prototype-web-cards.html)
  wordmark: 40,
  navPill: 17,
  pageTitle: 26,
  pageSubtitle: 14,
  kpi: 46,
  kpiLabel: 14,
} as const;

/** Fluid sizes (clamp with the maxima above); they replace the fixed --text-* of the same name in cssVars.ts. */
export const fluidFontSize = {
  display: 'clamp(24px, 1.2vw + 14px, 28px)',
  brand: 'clamp(22px, 1vw + 14px, 28px)',
  h1: 'clamp(22px, 1.3vw + 13px, 30px)',
  h2: 'clamp(17px, 0.6vw + 12px, 20px)',
  greeting: 'clamp(26px, 1.6vw + 12px, 34px)', // Beranda greeting
} as const;

export const fontWeight = {
  regular: 400,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;
