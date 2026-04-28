import type {
    SimulationInput,
    SimulationPreview,
} from "../types/simulator.types";

export function simulateRequiredGrade(
  input: SimulationInput,
): SimulationPreview {
  return {
    requiredGrade: null,
    message: `Simulación pendiente de implementación. Objetivo: ${input.targetGrade} con ${input.remainingWeight}% restante.`,
  };
}
