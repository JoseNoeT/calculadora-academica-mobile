import type { Subject } from "../entities";
import type { ValidationError, ValidationResult } from "../types";
import { validatePassingGrade } from "./gradeValidators";

function buildError(
  field: string,
  message: string,
  code: string,
): ValidationError {
  return { field, message, code };
}

export function validateSubjectName(name: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name.trim()) {
    errors.push(
      buildError(
        "name",
        "El nombre del ramo no puede estar vacío.",
        "subject.name_required",
      ),
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSubject(subject: Subject): ValidationResult {
  const errors: ValidationError[] = [];

  errors.push(...validateSubjectName(subject.name).errors);
  errors.push(...validatePassingGrade(subject.passingGrade).errors);

  if (typeof subject.targetGrade === "number") {
    errors.push(...validatePassingGrade(subject.targetGrade).errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
