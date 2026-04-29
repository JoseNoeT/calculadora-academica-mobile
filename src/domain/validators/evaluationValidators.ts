import type { Evaluation } from "../entities";
import { MAX_WEIGHT, MIN_WEIGHT } from "../rules";
import type { ValidationError, ValidationResult } from "../types";
import { validateGradeValue } from "./gradeValidators";

function buildError(
  field: string,
  message: string,
  code: string,
): ValidationError {
  return { field, message, code };
}

export function validateWeight(
  value: number,
  field = "weight",
): ValidationResult {
  const errors: ValidationError[] = [];

  if (Number.isNaN(value)) {
    errors.push(
      buildError(
        field,
        "La ponderación debe ser numérica.",
        "weight.invalid_number",
      ),
    );
  }

  if (value < MIN_WEIGHT || value > MAX_WEIGHT) {
    errors.push(
      buildError(
        field,
        `La ponderación debe estar entre ${MIN_WEIGHT} y ${MAX_WEIGHT}.`,
        "weight.out_of_range",
      ),
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateEvaluation(evaluation: Evaluation): ValidationResult {
  const errors: ValidationError[] = [];

  if (!evaluation.name.trim()) {
    errors.push(
      buildError(
        "name",
        "El nombre de la evaluación es obligatorio.",
        "evaluation.name_required",
      ),
    );
  }

  errors.push(...validateWeight(evaluation.weight).errors);

  if (evaluation.grade !== null) {
    errors.push(...validateGradeValue(evaluation.grade).errors);
  }

  errors.push(
    ...validateGradeValue(evaluation.minimumGrade, "minimumGrade").errors,
  );

  return {
    isValid: errors.length === 0,
    errors,
  };
}
