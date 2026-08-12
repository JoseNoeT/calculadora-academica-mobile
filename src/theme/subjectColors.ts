export type SubjectColor = {
  id: string;
  name: string;
  background: string;
  accent: string;
  softBackground: string;
  textOnColor: string;
};

export const SUBJECT_COLORS: SubjectColor[] = [
  { id: "blue",       name: "Azul",        background: "#2563EB", accent: "#1D4ED8", softBackground: "rgba(37,99,235,0.12)",   textOnColor: "#FFFFFF" },
  { id: "sky",        name: "Cielo",       background: "#0EA5E9", accent: "#0284C7", softBackground: "rgba(14,165,233,0.12)",  textOnColor: "#FFFFFF" },
  { id: "indigo",     name: "Índigo",      background: "#4F46E5", accent: "#4338CA", softBackground: "rgba(79,70,229,0.12)",   textOnColor: "#FFFFFF" },
  { id: "violet",     name: "Violeta",     background: "#7C3AED", accent: "#6D28D9", softBackground: "rgba(124,58,237,0.12)",  textOnColor: "#FFFFFF" },
  { id: "purple",     name: "Púrpura",     background: "#9333EA", accent: "#7E22CE", softBackground: "rgba(147,51,234,0.12)",  textOnColor: "#FFFFFF" },
  { id: "fuchsia",    name: "Fucsia",      background: "#C026D3", accent: "#A21CAF", softBackground: "rgba(192,38,211,0.12)",  textOnColor: "#FFFFFF" },
  { id: "pink",       name: "Rosa",        background: "#EC4899", accent: "#DB2777", softBackground: "rgba(236,72,153,0.12)",  textOnColor: "#FFFFFF" },
  { id: "rose",       name: "Rosado",      background: "#F43F5E", accent: "#E11D48", softBackground: "rgba(244,63,94,0.12)",   textOnColor: "#FFFFFF" },
  { id: "red",        name: "Rojo",        background: "#EF4444", accent: "#DC2626", softBackground: "rgba(239,68,68,0.12)",   textOnColor: "#FFFFFF" },
  { id: "orange",     name: "Naranja",     background: "#F97316", accent: "#EA580C", softBackground: "rgba(249,115,22,0.12)",  textOnColor: "#FFFFFF" },
  { id: "amber",      name: "Ámbar",       background: "#F59E0B", accent: "#D97706", softBackground: "rgba(245,158,11,0.12)",  textOnColor: "#1E293B" },
  { id: "yellow",     name: "Amarillo",    background: "#EAB308", accent: "#CA8A04", softBackground: "rgba(234,179,8,0.12)",   textOnColor: "#1E293B" },
  { id: "lime",       name: "Lima",        background: "#84CC16", accent: "#65A30D", softBackground: "rgba(132,204,22,0.12)",  textOnColor: "#1E293B" },
  { id: "green",      name: "Verde",       background: "#22C55E", accent: "#16A34A", softBackground: "rgba(34,197,94,0.12)",   textOnColor: "#FFFFFF" },
  { id: "emerald",    name: "Esmeralda",   background: "#10B981", accent: "#059669", softBackground: "rgba(16,185,129,0.12)",  textOnColor: "#FFFFFF" },
  { id: "teal",       name: "Teal",        background: "#14B8A6", accent: "#0D9488", softBackground: "rgba(20,184,166,0.12)",  textOnColor: "#FFFFFF" },
  { id: "cyan",       name: "Cian",        background: "#06B6D4", accent: "#0891B2", softBackground: "rgba(6,182,212,0.12)",   textOnColor: "#FFFFFF" },
  { id: "slate-blue", name: "Azul medio",  background: "#3B82F6", accent: "#2563EB", softBackground: "rgba(59,130,246,0.12)",  textOnColor: "#FFFFFF" },
  { id: "deep-blue",  name: "Marino",      background: "#1D4ED8", accent: "#1E3A8A", softBackground: "rgba(29,78,216,0.12)",   textOnColor: "#FFFFFF" },
  { id: "deep-purple",name: "Morado",      background: "#6D28D9", accent: "#5B21B6", softBackground: "rgba(109,40,217,0.12)",  textOnColor: "#FFFFFF" },
  { id: "forest",     name: "Bosque",      background: "#15803D", accent: "#166534", softBackground: "rgba(21,128,61,0.12)",   textOnColor: "#FFFFFF" },
  { id: "ocean",      name: "Océano",      background: "#0369A1", accent: "#075985", softBackground: "rgba(3,105,161,0.12)",   textOnColor: "#FFFFFF" },
  { id: "terracota",  name: "Terracota",   background: "#C2410C", accent: "#9A3412", softBackground: "rgba(194,65,12,0.12)",   textOnColor: "#FFFFFF" },
  { id: "midnight",   name: "Medianoche",  background: "#1E3A8A", accent: "#172554", softBackground: "rgba(30,58,138,0.12)",   textOnColor: "#FFFFFF" },
];

export function getSubjectColorById(id: string): SubjectColor {
  return SUBJECT_COLORS.find((c) => c.id === id) ?? SUBJECT_COLORS[0];
}

export function getSubjectColorByValue(value: string): SubjectColor | undefined {
  return SUBJECT_COLORS.find((c) => c.background === value);
}

export function assignSubjectColor(usedColorValues: string[]): SubjectColor {
  const unused = SUBJECT_COLORS.filter(
    (c) => !usedColorValues.includes(c.background),
  );
  if (unused.length > 0) {
    return unused[0];
  }
  return SUBJECT_COLORS[usedColorValues.length % SUBJECT_COLORS.length];
}
