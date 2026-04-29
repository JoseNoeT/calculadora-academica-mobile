export const MIN_GRADE = 2.0;
export const MAX_GRADE = 7.0;
export const DEFAULT_PASSING_GRADE = 4.0;

export const gradeRules = {
  min: MIN_GRADE,
  max: MAX_GRADE,
  defaultPassingGrade: DEFAULT_PASSING_GRADE,
} as const;
