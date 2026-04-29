# Lógica Matemática del Motor Académico

## Propósito del motor de cálculo

El motor de cálculo académico concentra reglas y fórmulas puras para evaluar el estado de una asignatura sin depender de React Native, navegación, componentes visuales ni almacenamiento. Su propósito es entregar resultados consistentes, testeables y reutilizables desde cualquier feature.

## Fórmulas usadas

Las fórmulas base del motor son las siguientes:

- Puntos acumulados: suma de `nota * (ponderación / 100)` solo en evaluaciones con nota.
- Ponderación rendida: suma de ponderaciones solo en evaluaciones con nota.
- Ponderación pendiente: suma de ponderaciones solo en evaluaciones sin nota.
- Promedio ponderado actual: `puntos acumulados / (ponderación rendida / 100)`.
- Nota final: `puntos acumulados / (ponderación total rendida / 100)` cuando ya no existen evaluaciones pendientes.
- Nota necesaria: `(nota mínima - puntos acumulados) / (ponderación pendiente / 100)`.

## Puntos acumulados

Los puntos acumulados representan el avance real obtenido hasta el momento. Una evaluación pendiente no aporta puntos ni se trata como cero, por lo que no castiga artificialmente el promedio parcial.

## Ponderación rendida

La ponderación rendida considera únicamente las evaluaciones que ya tienen una nota válida registrada. Esta decisión permite normalizar el promedio parcial sobre lo realmente evaluado.

## Ponderación pendiente

La ponderación pendiente agrupa las evaluaciones aún sin nota. Esta cifra es clave para calcular la nota necesaria restante y determinar si el escenario sigue siendo alcanzable.

## Promedio ponderado actual

El promedio actual no se divide por 100 directamente salvo que ese 100 ya haya sido efectivamente rendido. En cambio, se normaliza sobre la ponderación rendida para reflejar el desempeño real hasta el momento.

## Nota necesaria

La nota necesaria estima cuánto se debe obtener en la ponderación pendiente para alcanzar la nota mínima configurada del ramo.

Interpretación general:

- Si la nota necesaria es mayor a 7.0, el escenario es no alcanzable.
- Si la nota necesaria es menor a 2.0, el escenario es favorable.
- Si está entre 6.0 y 7.0, el escenario es de riesgo.
- Si está entre 2.0 y menor a 6.0, el escenario sigue siendo alcanzable.

## Estados académicos

El motor devuelve uno de los siguientes estados:

- `pending`: no hay evaluaciones suficientes rendidas para calcular un escenario real.
- `approved`: todas las evaluaciones están cerradas y la nota final cumple la mínima.
- `failed`: todas las evaluaciones están cerradas y la nota final queda bajo la mínima.
- `achievable`: la aprobación aún es posible con una nota requerida razonable.
- `atRisk`: la aprobación aún es posible, pero exige una nota alta.
- `notAchievable`: la nota necesaria supera el máximo permitido.
- `favorable`: incluso un resultado cercano al mínimo sigue manteniendo un escenario positivo.

## Casos extremos considerados

- Sin evaluaciones: el estado es `pending`.
- Con evaluaciones, pero sin notas registradas: el estado es `pending`.
- Evaluaciones pendientes: no se calculan como cero.
- Nota requerida negativa o menor a 2.0: el escenario pasa a `favorable`.
- Nota requerida superior a 7.0: el estado es `notAchievable`.
- Cálculos decimales: se redondean de forma controlada para evitar ruido por precisión flotante.

## Ejemplos simples

Ejemplo 1:

- Evaluaciones: 5.5 con 30%, 6.0 con 20%, una pendiente de 50%.
- Puntos acumulados: `5.5 * 0.30 + 6.0 * 0.20 = 2.85`.
- Ponderación rendida: `50%`.
- Promedio actual: `2.85 / 0.50 = 5.7`.
- Para aprobar con 4.0, la nota necesaria es `(4.0 - 2.85) / 0.50 = 2.3`.
- Estado: `achievable`.

Ejemplo 2:

- Evaluaciones: 3.0 con 60%, una pendiente de 40%.
- Puntos acumulados: `1.8`.
- Nota necesaria para aprobar con 4.0: `(4.0 - 1.8) / 0.40 = 5.5`.
- Estado: `achievable`.

Ejemplo 3:

- Evaluaciones: 2.5 con 80%, una pendiente de 20%.
- Puntos acumulados: `2.0`.
- Nota necesaria para aprobar con 4.0: `(4.0 - 2.0) / 0.20 = 10.0`.
- Estado: `notAchievable`.

## Separación entre lógica y UI

La lógica matemática vive en `src/domain/calculators` y puede ser usada por services o futuras pruebas automatizadas sin depender de la interfaz. La UI solo debe consumir resultados ya calculados, evitando duplicar reglas o fórmulas en componentes visuales.
