# Arquitectura Base del Proyecto

## Propósito de la arquitectura

La arquitectura base de Calculadora Académica Mobile busca separar responsabilidades desde el inicio para facilitar mantenimiento, escalabilidad y evolución funcional. El objetivo de esta fase no es implementar pantallas ni lógica matemática completa, sino dejar contratos, entidades y límites claros entre capas.

## Arquitectura por capas

La base se organiza en capas con responsabilidades explícitas:

- Presentación: quedará compuesta por pantallas y composición visual en fases posteriores.
- Componentes reutilizables: encapsulan piezas visuales y tokens de diseño ya definidos en `src/components` y `src/theme`.
- Features: coordinan casos de uso por módulo funcional sin acoplarse a la UI.
- Dominio: concentra entidades, tipos, reglas y validaciones puras.
- Storage: define contratos de persistencia sin atarse aún a SQLite ni a otra implementación concreta.
- Infraestructura futura: será el espacio para adaptadores concretos de almacenamiento local, sincronización o API cuando el producto lo requiera.

## Presentación

La capa de presentación no se modifica en esta fase. Se mantiene intacto el template de Expo y su navegación para evitar romper Expo Router mientras la base interna madura.

## Componentes reutilizables

Los componentes visuales y el sistema de diseño viven fuera de la lógica de negocio. Esto permite reutilizar piezas visuales sin mezclar cálculos académicos, almacenamiento o reglas de validación dentro de la UI.

## Features

Las features agrupan tipos y servicios por capacidad del producto:

- `calculator`: prepara el contrato del cálculo académico sin implementar todavía el motor completo.
- `subjects`: encapsula creación base y validación preliminar de asignaturas.
- `simulator`: deja preparada la estructura para simulaciones futuras.
- `settings`: centraliza configuración funcional de la aplicación.

## Dominio

El dominio contiene la lógica pura del negocio y no depende de React Native. Aquí se definen:

- Entidades: `Subject`, `Evaluation`, `AcademicSummary`, `AcademicStatus`, `AppSettings`.
- Tipos base: notas, porcentajes, estados y resultados de validación.
- Reglas: límites de notas y ponderaciones.
- Validadores: comprobaciones básicas independientes de UI.

## Storage

La capa de storage solo expone interfaces de repositorio. Esto permite que las features consuman contratos estables mientras la implementación concreta de persistencia local se posterga para una fase posterior.

## Infraestructura futura

La arquitectura queda preparada para agregar más adelante:

- Persistencia local con SQLite.
- Preferencias ligeras con AsyncStorage o MMKV.
- Adaptadores de sincronización si una futura versión requiere conectividad.
- Clientes API sin alterar el dominio ni las features existentes.

## Por qué no usamos backend en el MVP

El MVP está planteado como offline-first. La propuesta inicial prioriza que el cálculo académico y la gestión local funcionen sin red, reduciendo complejidad operativa, costos de infraestructura y dependencias innecesarias para validar el producto.

## Por qué no usamos microservicios en el MVP

No existe necesidad técnica ni de negocio para introducir microservicios en una etapa tan temprana. Sería una sobrearquitectura para un producto móvil local, sin autenticación ni colaboración multiusuario en el alcance inicial.

## Preparación para una futura API

Aunque el MVP no tendrá backend, la separación entre dominio, features y storage permite incorporar una API después mediante adaptadores. Los repositorios pueden tener implementaciones locales o remotas sin cambiar las entidades ni la firma de los casos de uso principales.

## Separación entre UI y lógica matemática

La lógica matemática no vive en componentes visuales. Los componentes mostrarán datos ya preparados por servicios o casos de uso. Esto reduce acoplamiento, facilita pruebas y evita que una pantalla termine controlando reglas académicas complejas.

## Estructura de carpetas

```text
src/
  components/
    academic/
    ui/
  domain/
    entities/
    rules/
    types/
    validators/
  features/
    calculator/
      services/
      types/
    settings/
      services/
      types/
    simulator/
      services/
      types/
    subjects/
      repositories/
      services/
      types/
  storage/
    repositories/
  theme/
  utils/
```

## Reglas de escalabilidad

- Mantener el dominio libre de dependencias de UI y framework.
- Evitar que las features importen componentes visuales.
- Usar repositorios como contratos, no como implementaciones concretas dentro del dominio.
- Promover servicios pequeños y orientados a una capacidad clara.
- Incorporar nuevas integraciones mediante adaptadores, no mezclando infraestructura con entidades.

## Riesgos y mitigaciones

- Riesgo: duplicar reglas entre features y dominio.
  Mitigación: centralizar límites, validaciones y tipos en `src/domain`.
- Riesgo: acoplar almacenamiento local con lógica de negocio.
  Mitigación: consumir solo interfaces desde `src/storage/repositories`.
- Riesgo: crecer sin consistencia entre módulos.
  Mitigación: mantener convenciones de carpetas, exports explícitos y responsabilidades acotadas por capa.
- Riesgo: mover demasiado pronto el template de Expo.
  Mitigación: conservar `app/` intacto hasta que la base de arquitectura esté consolidada.
