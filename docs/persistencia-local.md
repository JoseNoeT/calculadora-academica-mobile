# Persistencia Local - Fase Actual

## Decisión de persistencia en esta fase

En esta fase se implementó una estrategia **temporal en memoria** para el módulo de ramos.

Motivo:

- El proyecto no tiene instalada una dependencia de persistencia local (`expo-sqlite` o `@react-native-async-storage/async-storage`).
- Se evitó instalar dependencias sin autorización para respetar el alcance actual.

## Qué se implementó

- Flujo de creación de ramo desde `app/subjects/create.tsx`.
- Validaciones básicas en formulario:
  - nombre obligatorio
  - nota mínima entre 2.0 y 7.0
- Servicio de ramos en `src/features/subjects/services/subjectService.ts` con:
  - `getSubjects()`
  - `createSubject(input)`
- Repositorio temporal en memoria en `src/features/subjects/repositories/subjectRepository.ts`.
- Listado de ramos en `app/(tabs)/explore.tsx`.

## Qué queda pendiente

- Persistencia real en almacenamiento local del dispositivo.
- Mantener datos al cerrar y volver a abrir la app.
- Gestión de evaluación por ramo (crear, editar, eliminar).

## Limitación actual (importante)

La implementación actual **no persiste entre cierres de app**. Los ramos se mantienen solo durante la sesión activa.

## Recomendación técnica para siguiente fase

Implementar persistencia definitiva con `expo-sqlite` para almacenar:

- ramos
- evaluaciones
- configuración académica por asignatura

Alternativa de transición: `@react-native-async-storage/async-storage` para almacenamiento simple, aunque para el modelo académico completo SQLite es más apropiado.

## Por qué no usamos backend en el MVP

El MVP está definido como **offline-first**, por lo que prioriza funcionamiento local sin internet y menor complejidad operativa inicial.

Esto permite:

- validar experiencia y lógica de negocio rápido
- reducir costos y dependencias de infraestructura
- evolucionar a sincronización remota en fases posteriores sin bloquear el avance del producto
