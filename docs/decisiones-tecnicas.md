# Decisiones Técnicas

## Stack base seleccionado

- **React Native + Expo + TypeScript** como base tecnológica para desarrollo multiplataforma (Android/iOS), priorizando productividad y mantenibilidad.
- **Expo Router** como sistema de navegación, aprovechando su integración con Expo y soporte para rutas anidadas.

## Enfoque MVP offline-first

- El MVP será funcional sin conexión a internet (offline-first).
- No se implementará backend, login ni microservicios en esta fase.
- Toda la lógica matemática y de negocio estará separada de la UI.

## Persistencia local (planificada)

- Se utilizarán soluciones como **SQLite** y **AsyncStorage/MMKV** para persistencia local en futuras fases.

## Componentización y diseño

- Se prioriza el uso de componentes reutilizables y un sistema de diseño basado en tokens para asegurar consistencia visual y facilidad de mantenimiento.

## Flujo de trabajo

- El desarrollo se realizará en ramas feature, siguiendo el flujo y convenciones documentadas.
- No se realizarán cambios directos en la rama `main`.

## Diferenciación entre realizado y planificado

- Todo lo anterior corresponde a decisiones ya tomadas y lineamientos para el desarrollo futuro.
- No se han implementado funcionalidades, pantallas ni lógica matemática en esta fase.
- La estructura y convenciones están preparadas para soportar el crecimiento del proyecto.
