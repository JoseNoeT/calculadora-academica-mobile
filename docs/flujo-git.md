# Flujo de Trabajo con Git/GitHub

## Rama principal

- `main` es la rama estable del proyecto.
- No se debe trabajar directamente en `main` para desarrollo real.

## Uso de ramas feature

- Cada nueva funcionalidad, módulo o mejora debe desarrollarse en una rama propia (feature branch).
- Ejemplos de nombres de ramas:
  - `feature/design-system-base`
  - `feature/calculator-engine`
  - `feature/subjects-module`
  - `feature/simulator-module`
  - `feature/local-storage`
  - `docs/project-documentation`

## Convención de nombres de ramas

- Prefijo según el tipo de trabajo (`feature/`, `docs/`, etc.).
- Nombre descriptivo y en inglés, separado por guiones.

## Convención de commits

- `chore:` para tareas de mantenimiento o configuración.
- `docs:` para cambios en la documentación.
- `feat:` para nuevas funcionalidades.
- `fix:` para corrección de errores.
- `refactor:` para mejoras internas sin cambiar funcionalidad.
- `test:` para agregar o modificar pruebas.

## ¿Cuándo hacer commit?

- Al cerrar un bloque lógico de trabajo (no por cada cambio mínimo).
- Los commits deben ser atómicos y descriptivos.

## ¿Cuándo hacer push?

- Tras completar un bloque de trabajo y realizar el commit correspondiente.
- No es necesario hacer push tras cada commit, pero sí antes de abrir un Pull Request.

## Ejemplo de flujo de trabajo

```bash
git checkout -b feature/design-system-base
git add .
git commit -m "feat: add base design tokens"
git push origin feature/design-system-base
```
