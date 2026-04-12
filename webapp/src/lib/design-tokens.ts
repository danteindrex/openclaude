export const designTokens = {
  colors: {
    background: "#f6f9ff",
    surface: "#f6f9ff",
    surfaceBright: "#f6f9ff",
    surfaceDim: "#d5dae1",
    surfaceContainer: "#e9eef5",
    surfaceContainerLow: "#eff4fb",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerHigh: "#e4e9f0",
    surfaceContainerHighest: "#dee3ea",
    primary: "#0040df",
    primaryContainer: "#2d5bff",
    secondary: "#4959a3",
    secondaryContainer: "#9fafff",
    tertiary: "#993100",
    tertiaryContainer: "#c24100",
    error: "#ba1a1a",
    errorContainer: "#ffdad6",
    outline: "#747688",
    outlineVariant: "#c4c5d9",
    onBackground: "#171c21",
    onSurface: "#171c21",
    onSurfaceVariant: "#434656",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#efefff",
    onSecondary: "#ffffff",
    onSecondaryContainer: "#2e4088",
  },
  radii: {
    card: "1.5rem",
    hero: "2rem",
    pill: "9999px",
  },
  shadows: {
    raised:
      "-6px -6px 12px rgba(255, 255, 255, 0.95), 6px 6px 12px rgba(0, 0, 0, 0.08)",
    inset:
      "inset 4px 4px 8px rgba(0, 0, 0, 0.05), inset -4px -4px 8px rgba(255, 255, 255, 0.95)",
    soft: "0 18px 40px rgba(23, 28, 33, 0.06)",
  },
  gradients: {
    primary: "linear-gradient(135deg, #0040df 0%, #2d5bff 100%)",
    softGlow: "radial-gradient(circle at top left, rgba(45, 91, 255, 0.18), transparent 52%)",
    bannerWash: "linear-gradient(135deg, rgba(0, 64, 223, 0.14), rgba(45, 91, 255, 0.35))",
    bannerWashAlt: "linear-gradient(135deg, rgba(73, 89, 163, 0.16), rgba(159, 175, 255, 0.42))",
    heroTint:
      "linear-gradient(135deg, rgba(0, 0, 0, 0.24), rgba(0, 0, 0, 0.64)), linear-gradient(135deg, rgba(0, 64, 223, 0.16), rgba(45, 91, 255, 0.38))",
  },
  fonts: {
    headline: "ui-sans-serif, system-ui, sans-serif",
    body: "ui-sans-serif, system-ui, sans-serif",
    label: "ui-sans-serif, system-ui, sans-serif",
  },
  iconMarks: {
    add: "+",
    adminPanelSettings: "A",
    analytics: "A",
    arrowBack: "<",
    arrowForward: ">",
    bolt: "!",
    cloudDone: "100",
    cloud_done: "100",
    code: "<>",
    dashboard: "D",
    dns: "N",
    help: "?",
    localFireDepartment: "12",
    local_fire_department: "12",
    login: "->",
    offlineBolt: "O",
    person: "U",
    psychology: "P",
    school: "C",
    search: "/",
    searchOff: "x",
    search_off: "x",
    security: "S",
    settings: "gear",
    smartToy: "AI",
    smart_toy: "AI",
    translate: "T",
    verified: "v",
    wifiOff: "OFF",
    wifi_off: "OFF",
    workspacePremium: "75",
    workspace_premium: "75",
    accountCircle: "U",
  },
} as const;

export const shellClassNames = {
  page: "min-h-screen bg-surface text-on-surface font-body",
  sidebar: "bg-surface-container-low shadow-neumorphic-soft",
  card: "rounded-tactileLg bg-surface-container-lowest shadow-neumorphic-raised",
  raised: "rounded-tactileLg bg-surface-container-lowest shadow-neumorphic-raised",
  inset: "rounded-tactile bg-surface-container-low shadow-neumorphic-inset",
  pill: "rounded-full bg-surface-container-lowest shadow-neumorphic-raised",
  surfacePanel: "rounded-[2.5rem] bg-surface-container-low p-10 shadow-neumorphic-inset",
  bannerTint: "absolute inset-0",
  primaryAction:
    "rounded-tactile bg-primary-gradient text-white shadow-neumorphic-raised transition-transform hover:scale-[1.02] active:scale-95",
  fabAction:
    "rounded-full bg-primary-gradient text-white shadow-[0_20px_45px_rgba(0,64,223,0.3)] transition-transform hover:scale-110 active:scale-95",
  heroCard:
    "rounded-tactileLg bg-surface-container-lowest p-2 shadow-[0_18px_40px_rgba(23,28,33,0.12)]",
  iconBadge:
    "inline-flex items-center justify-center rounded-2xl bg-surface-container-low px-3 py-2 text-xs font-black text-primary shadow-neumorphic-raised",
  iconBadgeSmall:
    "inline-flex h-8 w-8 items-center justify-center rounded-xl bg-surface-container-lowest text-[0.65rem] font-black text-primary shadow-neumorphic-raised",
} as const;

export type RoutePath =
  | "/welcome"
  | "/role"
  | "/login"
  | "/dashboard"
  | "/catalog"
  | "/tutor";
