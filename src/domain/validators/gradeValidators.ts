import { DEFAULT_PASSING_GRADE, MAX_GRADE, MIN_GRADE } from "../rules";
import type { GradeValue, ValidationError, ValidationResult } from "../types";

function buildError(
  field: string,
  message: string,
  code: string,
): ValidationError {
  return { field, message, code };
}

export function validateGradeValue(
  value: GradeValue,
  field = "grade",
): ValidationResult {
  const errors: ValidationError[] = [];

  if (Number.isNaN(value)) {
    errors.push(
      buildError(
        field,
        "La nota debe ser un número válido.",
        "grade.invalid_number",
      ),
    );
  }

  if (value < MIN_GRADE || value > MAX_GRADE) {
    errors.push(
      buildError(
        field,
        `La nota debe estar entre ${MIN_GRADE} y ${MAX_GRADE}.`,
        "grade.out_of_range",
      ),
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePassingGrade(
  value: GradeValue = DEFAULT_PASSING_GRADE,
): ValidationResult {
  return validateGradeValue(value, "passingGrade");
}
