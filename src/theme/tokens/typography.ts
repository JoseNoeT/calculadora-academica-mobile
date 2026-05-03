export const fontFamilies = {
  display: "Syne_800ExtraBold",
  heading: "Syne_700Bold",
  subheading: "Syne_600SemiBold",
  body: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  bold: "DMSans_700Bold",
} as const;

export const fontSizes = {
  caption: 12,
  navSubtitle: 12,
  body: 15,
  button: 15,
  bodyStrong: 15,
  h3: 17,
  navTitle: 18,
  h2: 20,
  h1Compact: 24,
  h1: 30,
} as const;

export const lineHeights = {
  caption: 16,
  navSubtitle: 16,
  body: 22,
  button: 20,
  bodyStrong: 22,
  h3: 22,
  navTitle: 24,
  h2: 25,
  h1Compact: 28,
  h1: 34,
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export type FontSizeKey = keyof typeof fontSizes;
export type FontWeightKey = keyof typeof fontWeights;
export type FontFamilyKey = keyof typeof fontFamilies;
