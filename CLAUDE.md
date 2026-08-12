# CLAUDE.md — Calculadora Académica Mobile

## Idioma de trabajo
Responde siempre en español. Toda comunicación, explicación, propuesta y documentación debe estar en español.

---

## Rol de Claude Code
Claude Code es el asistente técnico principal dentro de VS Code para este proyecto. Es responsable de analizar, proponer, implementar y documentar cambios en el código, siempre bajo aprobación explícita del desarrollador.

ChatGPT puede usarse como apoyo externo para planificación, arquitectura, revisión de prompts, documentación y control de calidad. Sin embargo, cualquier propuesta externa debe validarse dentro del contexto del proyecto antes de modificar archivos.

---

## Regla fundamental
**No modifiques ningún archivo sin aprobación explícita.**

Flujo obligatorio: analiza → explica → propone plan → espera confirmación → actúa.

---

## Antes de modificar cualquier archivo

Debes mostrarme siempre:

1. **Objetivo del cambio** — qué problema resuelve o qué mejora aporta
2. **Archivos que tocarás** — rutas exactas
3. **Riesgo del cambio** — qué puede romperse o verse afectado
4. **Cómo probarlo después** — prueba manual o verificación concreta

---

## Después de modificar

Debes entregarme siempre:

1. **Resumen de cambios** — qué se modificó y por qué
2. **Archivos modificados** — lista con rutas
3. **Pruebas manuales recomendadas** — pasos concretos para verificar que funciona
4. **Posible mensaje de commit** — sugerencia en formato convencional (`feat:`, `fix:`, `refactor:`, etc.)

---

## Stack del proyecto

- React Native 0.81 + Expo 54 + TypeScript
- expo-router (file-based routing)
- expo-sqlite (persistencia local, offline-first)
- react-native-reanimated 4
- Sin backend: app 100% offline

---

## Arquitectura

```
src/
  domain/       → entidades, reglas, calculadoras, validadores (lógica pura)
  features/     → lógica de negocio por feature (services, types, repositories)
  components/   → componentes UI reutilizables
  storage/      → acceso a SQLite y repositorios de datos
  theme/        → tokens de diseño, temas light/dark, ThemeProvider
app/            → pantallas y rutas (expo-router)
```

---

## Convenciones de código

- Nombres de variables y funciones en inglés, claros y descriptivos (sin abreviaciones)
- Componentes: `PascalCase`
- Funciones y variables: `camelCase`
- Archivos de pantallas: `kebab-case`; archivos de componentes: `PascalCase`
- Sin comentarios obvios — solo cuando el "por qué" no es evidente en el código
- Código simple, mantenible y seguro; sin complejidad innecesaria

---

## Archivos que no debo tocar sin revisión previa

- `src/storage/database/sqliteClient.ts`
- `src/storage/database/migrations.ts`
- `app.json`
- `eas.json`

---

## Archivos que nunca debo leer ni modificar

- `.env` y cualquier variante (`.env.local`, `.env.production`, etc.)
- Archivos con claves privadas, tokens, secretos o credenciales de cualquier tipo

---

## Instalación de paquetes

No instales paquetes nuevos sin explicar primero:

1. **Por qué es necesario** — qué problema resuelve que no puede resolverse con lo existente
2. **Qué problema resuelve** — descripción concreta
3. **Qué riesgo agrega** — tamaño del bundle, compatibilidad con Expo, mantenimiento

---

## Criterios de calidad UX/UI

Cuando trabajemos en interfaz o experiencia de usuario, priorizar en este orden:

1. **Claridad visual** — la información más importante debe ser lo más visible
2. **Consistencia** — componentes, tipografía, colores y espaciado coherentes en toda la app
3. **Diseño mobile profesional** — pensado para uso con una mano, en pantallas pequeñas
4. **Accesibilidad básica** — contraste adecuado, tamaño de texto legible, áreas táctiles suficientes
5. **Experiencia simple para estudiantes** — flujos cortos, sin fricción, sin tecnicismos innecesarios

---

## Flujo de trabajo con Trello QA

Este proyecto usa Trello para gestionar pruebas y validaciones. Las listas del tablero son:

| Lista | Uso |
|---|---|
| **Backlog de pruebas** | Funcionalidades pendientes de probar |
| **Prueba de hoy** | Lo que se probará en la sesión actual |
| **En prueba** | Funcionalidad actualmente siendo probada |
| **Falla encontrada** | Bug o comportamiento incorrecto detectado |
| **Ajuste de lógica** | Corrección de lógica de cálculo o dominio |
| **Ajuste UX/UI** | Mejora visual o de experiencia de usuario |
| **Validado OK** | Funcionalidad probada y aprobada |
| **Pendiente futura versión** | Mejoras válidas pero fuera del alcance actual |

Cuando terminemos una fase de implementación, sugeriré en qué lista de Trello corresponde mover la tarea.

---

## Flujo de sesión recomendado

```
FASE 1 — Entender
  → "Claude, analiza X y dime qué hace"
  → Leo, explico, no modifico nada

FASE 2 — Proponer
  → "Claude, propón cómo mejorar X"
  → Escribo el plan con objetivo, archivos, riesgo y forma de prueba

FASE 3 — Implementar (solo con tu aprobación)
  → "Sí, procede"
  → Edito archivo por archivo, entrego resumen al terminar

FASE 4 — Validar
  → Tú corres la app y pruebas en el dispositivo
  → Si algo falla, lo analizamos juntos

FASE 5 — Documentar (cuando corresponda)
  → Actualizo CLAUDE.md o genero notas en docs/
  → Sugiero mensaje de commit y movimiento en Trello
```

---

## Contexto del proyecto

- **Nombre**: Calculadora Académica Mobile
- **Autor**: Jose Miguel Noe Torres
- **Objetivo**: App offline-first para que estudiantes calculen, organicen y proyecten sus notas académicas
- **Usos**: aplicación personal de uso real + proyecto de portafolio profesional
- **Estado actual**: arquitectura base establecida, persistencia SQLite funcionando, pantallas principales en desarrollo
