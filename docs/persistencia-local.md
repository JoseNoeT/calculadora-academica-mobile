# Persistencia Local - Fase Actual

## Decisión de persistencia en esta fase

Se reemplazó la estrategia temporal en memoria por persistencia local real con SQLite usando `expo-sqlite`.

Base local:

- `academic_calculator.db`

## Qué se implementó

- Cliente SQLite en `src/storage/database/sqliteClient.ts`.
- Inicialización de esquema en `src/storage/database/migrations.ts`.
- Tabla `subjects` con estructura:
  - `id TEXT PRIMARY KEY NOT NULL`
  - `name TEXT NOT NULL`
  - `minimum_grade REAL NOT NULL`
  - `color TEXT`
  - `created_at TEXT NOT NULL`
  - `updated_at TEXT NOT NULL`
- Repositorio SQLite para ramos en `src/storage/repositories/subjectRepository.ts` con:
  - `getAllSubjects()`
  - `getSubjectById(id)`
  - `createSubject(input)`
  - `updateSubject(id, input)` (preparado)
  - `deleteSubject(id)` (preparado)
- Integración en feature de ramos:
  - `getSubjects()`
  - `createSubject(input)`
- Flujo UI conectado:
  - `app/subjects/create.tsx` guarda ramos localmente.
  - `app/(tabs)/explore.tsx` lista ramos persistidos y refresca al volver.

## Qué datos persisten actualmente

- ID del ramo
- Nombre del ramo
- Nota mínima de aprobación
- Color identificador
- Fecha de creación
- Fecha de actualización

Estos datos se mantienen al cerrar y volver a abrir la app.

## Qué queda pendiente

- Evaluaciones por ramo
- Edición de ramos
- Eliminación de ramos
- Pantalla de detalle de ramo

## Por qué no se guardan resúmenes calculados

No se persisten resúmenes académicos (promedio, nota necesaria, estado) porque son datos derivados.
Se calcularán dinámicamente desde las evaluaciones para evitar inconsistencias y duplicación de estado.

## Riesgos y mitigaciones

- Riesgo: cambios de esquema futuros rompan datos.
  Mitigación: centralizar migraciones versionadas en `migrations.ts`.
- Riesgo: consultas mal parametrizadas.
  Mitigación: uso de placeholders `?` en todas las consultas con datos de usuario.
- Riesgo: acoplamiento entre UI y storage.
  Mitigación: acceso a SQLite encapsulado en repositorios y servicios.

## Por qué no usamos backend en el MVP

El MVP es offline-first y prioriza disponibilidad local sin internet.
Esto reduce complejidad inicial, acelera validación del producto y permite evolucionar a sincronización remota en fases posteriores.
