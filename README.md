# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

@'
# Calculadora Académica Mobile

Aplicación móvil offline-first para calcular, organizar y proyectar notas académicas desde el celular.

## Objetivo del proyecto

Ayudar a estudiantes a conocer su avance académico, calcular la nota necesaria para aprobar y simular escenarios futuros de manera clara, rápida y confiable.

## Problema que resuelve

Muchos estudiantes calculan sus notas usando calculadora, Excel o estimaciones manuales. Esto puede generar errores, pérdida de tiempo y poca claridad sobre su situación académica real.

Esta app busca responder preguntas como:

- ¿Voy aprobando este ramo?
- ¿Cuánto llevo acumulado?
- ¿Qué ponderación ya rendí?
- ¿Qué ponderación me falta?
- ¿Qué nota necesito para aprobar?
- ¿Qué pasa si me saco cierta nota en la próxima evaluación?

## Funcionalidades MVP

- Calculadora rápida sin guardar datos.
- Gestión de ramos o asignaturas.
- Evaluaciones configurables.
- Nombre, nota y ponderación por evaluación.
- Soporte para notas pendientes.
- Nota mínima configurable.
- Puntos acumulados.
- Ponderación rendida.
- Ponderación pendiente.
- Promedio ponderado actual.
- Nota necesaria para aprobar.
- Estado académico automático.
- Consejos académicos.
- Simulador básico de nota futura.
- Persistencia local.
- Modo claro y oscuro.

## Stack técnico planificado

- React Native
- Expo
- TypeScript
- Expo Router
- SQLite
- AsyncStorage o MMKV
- Jest

## Enfoque de arquitectura

El proyecto se desarrollará con separación de responsabilidades:

- Presentación
- Componentes reutilizables
- Lógica de negocio
- Dominio
- Persistencia local
- Sistema de diseño
- Testing

La lógica matemática estará separada de la interfaz para facilitar pruebas y mantenimiento.

## Estado actual

Proyecto en fase inicial de configuración profesional:

- Repositorio creado.
- Proyecto Expo inicializado.
- Estructura escalable de carpetas creada.
- Documentación funcional en proceso.

## Autor

Jose Miguel Noe Torres

## Licencia

MIT
'@ | Set-Content README.md -Encoding UTF8