# Sistema de Diseño Base

## Propósito del sistema de diseño

El sistema de diseño define una base visual y de componentes reutilizables para **Calculadora Académica Mobile**. Su objetivo es garantizar consistencia, escalabilidad y velocidad de implementación en futuras fases, sin mezclar reglas visuales con lógica de negocio.

## Alcance de esta fase

En esta fase se preparó únicamente la base de diseño:

- Tokens visuales globales.
- Temas claro/oscuro.
- Proveedor de tema y hook de consumo.
- Componentes UI reutilizables.
- Componentes académicos visuales reutilizables.

No se implementaron pantallas completas, lógica matemática, backend ni navegación adicional.

## Tokens definidos

Se definieron tokens en `src/theme/tokens` para evitar hardcodeo de estilos:

- `colors.ts`: paleta base, colores de tema y colores semánticos académicos.
- `spacing.ts`: escala consistente de espaciado.
- `typography.ts`: tamaños de fuente, pesos y line heights.
- `radius.ts`: radios de borde reutilizables.
- `shadows.ts`: sombras suaves para elevación visual.

## Colores semánticos académicos

Se incorporaron estados académicos con semántica explícita:

- `pendiente`
- `aprobado`
- `alcanzable`
- `en riesgo`
- `no alcanzable`
- `reprobado`

Estos estados existen en modo claro y oscuro para asegurar legibilidad en ambos contextos.

## Temas definidos

Se crearon dos temas base:

- `lightTheme.ts`
- `darkTheme.ts`

Ambos exponen las propiedades:

- `background`
- `surface`
- `surfaceElevated`
- `textPrimary`
- `textSecondary`
- `border`
- `primary`
- `secondary`
- `success`
- `warning`
- `danger`
- `info`
- `pending`

## Componentes UI creados

Ubicación: `src/components/ui`

- `AppScreen`
- `AppText`
- `AppCard`
- `AppButton`
- `AppInput`
- `AppBadge`
- `AppProgressBar`
- `AppModal`
- `EmptyState`

Todos están orientados a reutilización, usan TypeScript, componentes nativos de React Native, `StyleSheet` y consumo de tema/tokens.

## Componentes académicos creados

Ubicación: `src/components/academic`

- `StatusBadge`
- `AcademicSummaryCard`
- `RequiredGradeCard`
- `AdviceCard`
- `EvaluationCard`
- `SubjectCard`

Estos componentes son visuales y reciben datos por props. No contienen cálculos matemáticos ni reglas de negocio.

## Reglas de uso

- No hardcodear colores si existe token equivalente.
- Centralizar cambios visuales en `tokens` y `themes`.
- Mantener los componentes desacoplados de lógica matemática.
- Reutilizar primero un componente existente antes de crear uno nuevo.
- Priorizar props simples y explícitas.

## Decisiones visuales

- Contraste alto para legibilidad en mobile.
- Escala de espaciado uniforme para ritmo visual estable.
- Jerarquía tipográfica clara para títulos, subtítulos y contenido.
- Sombras suaves para separar superficies sin ruido visual.
- Estados semánticos orientados al contexto académico.

## Relación con UX mobile first

El sistema está diseñado para uso en pantallas pequeñas:

- Componentes con tamaños táctiles adecuados.
- Jerarquía visual rápida de escanear.
- Patrón de tarjetas y badges para contenido resumido.
- Preparación para modo claro/oscuro sin duplicar componentes.

## Escalabilidad

Esta base permite crecer sin deuda visual:

- Los tokens evitan inconsistencias al aumentar pantallas.
- Los temas permiten expansión a branding futuro.
- Los componentes UI y académicos separan presentación de negocio.
- La arquitectura favorece mantenimiento y evolución incremental.
