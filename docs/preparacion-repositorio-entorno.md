# Preparación del Repositorio y Entorno

## Propósito de esta fase

Esta fase tiene como objetivo establecer una base profesional y robusta para el desarrollo de la aplicación móvil **Calculadora Académica Mobile**. Se busca garantizar que el repositorio, el entorno de desarrollo y la estructura inicial sean consistentes, reproducibles y alineados con buenas prácticas de ingeniería de software.

## Estado inicial del repositorio

- Repositorio GitHub creado: `calculadora-academica-mobile`.
- Proyecto Expo inicializado con plantilla TypeScript.
- Rama `main` estable y protegida para despliegues.
- Estructura base creada para soportar una arquitectura escalable.

## Comandos utilizados

```bash
git clone <url-del-repositorio>
npx create-expo-app@latest . --template default
npm run web
git add .
git commit -m "chore: proyecto base Expo inicializado"
git push origin main
```

## ¿Por qué se probó primero en web?

Se ejecutó `npm run web` para validar que la configuración inicial del proyecto Expo funciona correctamente en un entorno controlado y rápido de probar. Esto permite detectar errores básicos de configuración antes de probar en dispositivos físicos o emuladores, acelerando el ciclo de feedback y evitando problemas de entorno específicos de Android/iOS.

## ¿Por qué NO se ejecutó `npm audit fix --force`?

No se ejecutó `npm audit fix --force` porque puede forzar actualizaciones de dependencias que rompan la compatibilidad con Expo o React Native. Es preferible mantener las versiones recomendadas por Expo y resolver vulnerabilidades de manera controlada, siguiendo las guías oficiales y evitando riesgos innecesarios en la fase inicial.

## Explicación de los warnings LF/CRLF en Windows

Durante la inicialización y commits, pueden aparecer advertencias relacionadas con los finales de línea (LF/CRLF) en sistemas Windows. Esto es normal y ocurre por diferencias entre sistemas operativos. No afecta la funcionalidad del proyecto, pero se recomienda mantener la configuración por defecto de Git para evitar cambios innecesarios en los archivos.

## Resultado esperado de esta fase

- Repositorio inicializado y funcional.
- Proyecto Expo ejecutando correctamente en web.
- Estructura base lista para comenzar el desarrollo.
- Rama `main` limpia y estable.

## Checklist de validación

- [x] El repositorio se clonó correctamente.
- [x] El proyecto Expo se inicializó sin errores.
- [x] El comando `npm run web` ejecuta la app en navegador.
- [x] Se realizó el primer commit en la rama `main`.
- [x] No se forzaron actualizaciones inseguras de dependencias.
- [x] Se documentaron advertencias relevantes (LF/CRLF).
