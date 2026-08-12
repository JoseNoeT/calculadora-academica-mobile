# Calculadora Académica Mobile

Aplicación móvil offline-first para calcular, organizar y proyectar notas académicas desde el celular.

## Descripción

Calculadora Académica Mobile centraliza el seguimiento de asignaturas, evaluaciones, notas y ponderaciones en una aplicación móvil. Su lógica académica permite conocer el avance de cada asignatura y proyectar distintos escenarios antes de completar todas las evaluaciones.

La aplicación responde a preguntas habituales del seguimiento académico, como cuánto se lleva acumulado, qué porcentaje de la asignatura ya fue evaluado, cuánto falta por rendir y qué nota se necesita para alcanzar la aprobación.

## Funcionalidades

- Calculadora académica rápida.
- Gestión de asignaturas.
- Gestión de evaluaciones.
- Registro de notas y ponderaciones.
- Evaluaciones pendientes.
- Nota mínima configurable.
- Cálculo de puntos acumulados.
- Ponderación rendida y pendiente.
- Promedio ponderado.
- Cálculo de nota necesaria para aprobar.
- Estado académico automático.
- Simulación de escenarios académicos.
- Indicadores académicos.
- Persistencia local.
- Perfiles de configuración académica.
- Modo claro y oscuro.

## Tecnologías

El proyecto está desarrollado con React Native, Expo y TypeScript. Utiliza Expo Router para la navegación, SQLite y almacenamiento local para la persistencia de información, y Jest para las pruebas automatizadas.

## Arquitectura

La aplicación mantiene separadas las responsabilidades de interfaz, componentes, dominio, lógica de negocio, servicios, repositorios y persistencia.

Los cálculos académicos se encuentran desacoplados de la interfaz, permitiendo validar la lógica de manera independiente y reutilizarla en distintas partes de la aplicación.

La estructura incluye:

- presentación e interfaz;
- componentes reutilizables;
- dominio académico;
- calculadoras y reglas académicas;
- servicios de asignaturas y evaluaciones;
- repositorios;
- persistencia local;
- sistema de diseño;
- pruebas automatizadas.

## Persistencia

La información académica se almacena localmente en el dispositivo. La aplicación utiliza una capa de repositorios y migraciones para mantener separada la persistencia de la lógica de negocio.

Este enfoque permite que las funciones principales puedan utilizarse sin depender permanentemente de una conexión a Internet.

## Lógica académica

El dominio contempla el cálculo de:

- promedio ponderado;
- puntos acumulados;
- porcentaje evaluado;
- porcentaje pendiente;
- nota necesaria para aprobar;
- estado académico;
- proyecciones basadas en evaluaciones futuras.

También existen perfiles y reglas de configuración que permiten adaptar los cálculos a diferentes condiciones académicas.

## Calidad y pruebas

La lógica principal cuenta con pruebas automatizadas para cálculos académicos, perfiles, reglas de configuración, asignaturas, evaluaciones, repositorios, almacenamiento y migraciones de base de datos.

En la validación realizada sobre la versión actual se ejecutaron:

- 14 suites de pruebas;
- 143 pruebas;
- 143 pruebas aprobadas;
- 0 pruebas fallidas.

El análisis estático del proyecto se ejecuta mediante ESLint. La revisión actual no presenta errores de lint, aunque mantiene algunas advertencias menores pendientes de normalización.

## Documentación

El proyecto dispone de documentación técnica complementaria sobre arquitectura, estructura, lógica matemática, persistencia, sistema de diseño, decisiones técnicas, flujo de trabajo Git y casos de prueba.

## Ejecución local

Dependencias:

    npm install

Inicio del proyecto:

    npx expo start

Pruebas automatizadas:

    npm test -- --runInBand

Análisis estático:

    npm run lint

## Estado del proyecto

La aplicación cuenta con un MVP funcional y una base técnica consolidada. La versión actual incluye gestión académica, persistencia local, cálculos y proyecciones, perfiles académicos y pruebas automatizadas.

El proyecto continúa en evolución para ampliar y perfeccionar la experiencia de uso.

## Autor

José Miguel Noé Torres

## Licencia

MIT
