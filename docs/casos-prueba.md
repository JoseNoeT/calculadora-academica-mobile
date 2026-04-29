# Casos de Prueba del Motor Académico y Validadores

## 1. Propósito del documento

Este documento define los casos de prueba funcionales y de borde para validar la exactitud del motor de cálculo académico y de los validadores de dominio de **Calculadora Académica Mobile**. Su objetivo es establecer una base de calidad verificable, trazable y reutilizable para pruebas manuales y futuras pruebas automatizadas.

## 2. Alcance de las pruebas

**Incluido en esta fase:**

- Cálculo de puntos acumulados.
- Cálculo de ponderación rendida y pendiente.
- Cálculo de promedio ponderado actual.
- Cálculo de nota final y nota requerida.
- Determinación de estado académico.
- Selección de evaluación pendiente prioritaria.
- Validaciones de nota, ponderación, nombre de evaluación y nombre de ramo.
- Comportamiento de simulación sin mutación de datos originales.

**Fuera de alcance en esta fase:**

- Pruebas de interfaz (UI).
- Pruebas de navegación.
- Pruebas de almacenamiento SQLite.
- Pruebas de integración con backend/API (no existe en MVP).

## 3. Qué se probará ahora

En la fase actual se validará lógica de negocio pura (dominio y servicios de features que delegan al dominio), con foco en consistencia matemática, cumplimiento de reglas académicas y robustez ante casos extremos.

## 4. Qué se probará en fases futuras

- Pruebas unitarias automáticas con framework de testing.
- Pruebas de integración entre dominio, storage local y features.
- Pruebas E2E en flujos reales de usuario.
- Pruebas de regresión visual y de experiencia en Android/iOS.
- Pruebas de rendimiento para escenarios con alta cantidad de evaluaciones.

## 5. Casos de prueba del motor matemático

Se validan los siguientes comportamientos del motor:

- Solo evaluaciones con nota aportan puntos acumulados.
- Solo evaluaciones con nota aportan ponderación rendida.
- Solo evaluaciones sin nota aportan ponderación pendiente.
- El promedio actual se normaliza sobre ponderación rendida, no sobre 100% fijo.
- La nota final solo existe cuando no hay ponderación pendiente.
- La nota requerida se calcula usando nota mínima, puntos acumulados y ponderación pendiente.
- La simulación proyectada no modifica el arreglo original.
- La evaluación prioritaria pendiente debe ser la de mayor ponderación.

## 6. Casos de prueba de estados académicos

Se validan estados:

- `pending`: sin evaluaciones rendidas suficientes.
- `approved`: evaluaciones completas y nota final mayor o igual a la mínima.
- `failed`: evaluaciones completas y nota final menor a la mínima.
- `notAchievable`: nota requerida mayor a 7.0.
- `favorable`: nota requerida menor a 2.0.
- `atRisk`: nota requerida entre 6.0 y 7.0.
- `achievable`: nota requerida entre 2.0 y menor a 6.0.

## 7. Casos de prueba de validadores

Se validan reglas mínimas:

- Nota válida en rango 2.0 a 7.0.
- Ponderación válida en rango 0 a 100.
- Nombre de ramo no vacío.
- Nombre de evaluación no vacío.
- Nota mínima (passing grade) dentro del rango permitido.

## 8. Casos extremos

- Cero evaluaciones.
- Todas las evaluaciones pendientes.
- Ponderación total distinta de 100%.
- Nota requerida muy alta (sobre máximo).
- Nota requerida muy baja (bajo mínimo).
- Valores decimales con potencial error de precisión flotante.
- Entradas inválidas en validadores.

## 9. Matriz de casos de prueba

| ID | Entrada | Acción | Resultado esperado | Prioridad |
|---|---|---|---|---|
| TC-001 | Lista de evaluaciones vacía | Calcular resumen académico | Estado `pending`, puntos 0, ponderación rendida 0, ponderación pendiente 0, sin nota final | Alta |
| TC-002 | Evaluaciones con `grade = null` en todos los ítems | Calcular resumen académico | Estado `pending`, puntos 0, ponderación rendida 0, ponderación pendiente igual a suma de pesos | Alta |
| TC-003 | Una evaluación con nota y una pendiente | Calcular resumen académico | Puntos y promedio calculados solo con evaluación rendida; pendiente no cuenta como cero | Alta |
| TC-004 | Todas las evaluaciones con nota | Calcular resumen académico | Nota final calculada; sin ponderación pendiente; estado `approved` o `failed` según nota mínima | Alta |
| TC-005 | Ponderaciones completas (suman 100%) | Calcular final y requerido | Coherencia de final y requerido; sin inconsistencias por peso faltante | Media |
| TC-006 | Ponderaciones incompletas (suman < 100%) | Calcular resumen académico | Cálculo se realiza sobre ponderación efectivamente rendida; valores consistentes | Alta |
| TC-007 | Escenario con nota requerida > 7.0 | Obtener estado académico | Estado `notAchievable` | Alta |
| TC-008 | Escenario con nota requerida < 2.0 | Obtener estado académico | Estado `favorable` | Alta |
| TC-009 | Nota mínima inválida (ej. 1.5 o 7.5) | Ejecutar validador de nota mínima | Resultado inválido con error de rango | Alta |
| TC-010 | Nota ingresada menor a 2.0 | Ejecutar validador de nota | Resultado inválido con error de rango | Alta |
| TC-011 | Nota ingresada mayor a 7.0 | Ejecutar validador de nota | Resultado inválido con error de rango | Alta |
| TC-012 | Evaluación pendiente coexistiendo con notas rendidas | Calcular puntos y promedio actual | Pendiente no suma puntos ni se trata como 0.0 | Alta |
| TC-013 | Ponderación rendida parcial (ej. 40%) | Calcular promedio ponderado actual | Promedio normalizado por 40% rendido, no por 100% | Alta |
| TC-014 | Simulación de nota futura por `evaluationId` | Ejecutar simulación | Devuelve resumen proyectado sin mutar arreglo original | Alta |
| TC-015 | Varias evaluaciones pendientes con distintos pesos | Buscar evaluación prioritaria | Retorna evaluación pendiente de mayor ponderación | Media |
| TC-016 | Todas completas con nota final >= mínima | Obtener estado académico | Estado `approved` | Alta |
| TC-017 | Todas completas con nota final < mínima | Obtener estado académico | Estado `failed` | Alta |
| TC-018 | Nota requerida entre 6.0 y 7.0 | Obtener estado académico | Estado `atRisk` | Alta |
| TC-019 | Nota requerida entre 2.0 y < 6.0 | Obtener estado académico | Estado `achievable` | Alta |
| TC-020 | Nombre de ramo vacío o espacios | Ejecutar validador de ramo | Resultado inválido por nombre requerido | Media |
| TC-021 | Nombre de evaluación vacío o espacios | Ejecutar validador de evaluación | Resultado inválido por nombre requerido | Media |
| TC-022 | Ponderación fuera de rango (ej. -10 o 120) | Ejecutar validador de ponderación | Resultado inválido por rango de ponderación | Alta |

## 10. Casos mínimos obligatorios cubiertos

Los casos mínimos obligatorios solicitados quedan cubiertos por la matriz:

- Ninguna nota ingresada: `TC-001`.
- Todas las notas pendientes: `TC-002`.
- Una nota ingresada y otra pendiente: `TC-003`.
- Todas las notas completas: `TC-004`.
- Ponderaciones suman 100%: `TC-005`.
- Ponderaciones incompletas: `TC-006`.
- Nota necesaria mayor a 7.0: `TC-007`.
- Nota necesaria menor a 2.0: `TC-008`.
- Nota mínima inválida: `TC-009`.
- Nota menor a 2.0: `TC-010`.
- Nota mayor a 7.0: `TC-011`.
- Nota pendiente no cuenta como cero: `TC-012`.
- Promedio ponderado actual normalizado por ponderación rendida: `TC-013`.
- Simulación no muta arreglo original: `TC-014`.
- Evaluación pendiente de mayor ponderación: `TC-015`.

## 11. Recomendación futura para pruebas automáticas

Para una siguiente fase, se recomienda configurar pruebas unitarias con **Jest** o **jest-expo** según estrategia del proyecto. Prioridad inicial de automatización:

- `src/domain/calculators` (motor matemático).
- `src/domain/validators` (reglas de entrada).
- `src/features/calculator/services` y `src/features/simulator/services` (orquestación sin UI).

Estrategia sugerida:

- Comenzar por casos críticos de alta prioridad (TC-001 a TC-014).
- Añadir pruebas de regresión por cada ajuste de fórmula.
- Mantener fixtures de evaluaciones representativas (pendientes, completas, mixtas).

## 12. Checklist QA

- [x] Se documentó el alcance real de la fase actual.
- [x] Se diferenció claramente lo actual vs. lo futuro.
- [x] Se cubrieron reglas de notas, ponderaciones y estados académicos.
- [x] Se incluyeron casos extremos y criterios de borde.
- [x] Se incluyeron casos mínimos obligatorios solicitados.
- [x] Se definió matriz trazable con ID, entrada, acción, resultado y prioridad.
- [x] Se mantuvo la separación entre lógica y UI.
- [x] No se propusieron dependencias ni cambios de configuración en esta fase.
