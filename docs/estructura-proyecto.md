# Estructura Actual del Proyecto

## Estructura de carpetas

```
calculadora-academica-mobile/
├── app/
├── assets/
├── components/
├── constants/
├── docs/
├── hooks/
├── scripts/
├── src/
│   ├── components/
│   │   ├── academic/
│   │   └── ui/
│   ├── constants/
│   ├── domain/
│   │   ├── calculators/
│   │   ├── entities/
│   │   ├── rules/
│   │   └── validators/
│   ├── features/
│   │   ├── calculator/
│   │   ├── settings/
│   │   ├── simulator/
│   │   └── subjects/
│   ├── storage/
│   │   └── database/
│   ├── tests/
│   ├── theme/
│   │   ├── themes/
│   │   └── tokens/
│   └── utils/
```

## Diferencia entre carpetas generadas por Expo y carpetas propias

- **Generadas por Expo:**
  - `app/`, `components/`, `constants/`, `hooks/`.
  - Estas carpetas se mantienen para asegurar la compatibilidad con Expo Router y el funcionamiento correcto del template base.
- **Carpetas propias del proyecto:**
  - Todo el contenido dentro de `src/`.
  - `src/` será la base para una arquitectura escalable y desacoplada.

## Propósito de carpetas clave

- **app/**: Navegación y rutas principales (Expo Router). No modificar ni eliminar en esta fase.
- **components/**: Componentes globales y utilitarios generados por Expo. Se mantienen para compatibilidad.
- **constants/**: Constantes globales del template Expo.
- **hooks/**: Hooks personalizados del template Expo.
- **src/**: Carpeta raíz para la arquitectura escalable del proyecto.
  - **src/components/ui/**: Componentes de interfaz reutilizables (botones, inputs, layouts, etc.).
  - **src/components/academic/**: Componentes específicos del dominio académico.
  - **src/features/calculator/**: Lógica y vistas relacionadas con la calculadora académica.
  - **src/features/subjects/**: Gestión de materias y asignaturas.
  - **src/features/simulator/**: Simulador académico (planificado).
  - **src/features/settings/**: Configuración y preferencias de usuario.
  - **src/domain/entities/**: Definición de entidades del dominio académico.
  - **src/domain/rules/**: Reglas de negocio y validaciones.
  - **src/domain/validators/**: Validadores reutilizables.
  - **src/domain/calculators/**: Lógica matemática y motores de cálculo (separados de la UI).
  - **src/storage/**: Persistencia y acceso a datos locales.
  - **src/theme/**: Sistema de diseño, temas y tokens de estilo.
  - **src/constants/**: Constantes específicas del dominio del proyecto.
  - **src/utils/**: Utilidades y funciones auxiliares.
  - **src/tests/**: Pruebas unitarias y de integración.

## Uso de archivos .gitkeep

Para versionar carpetas vacías y mantener la estructura en el repositorio, se utiliza el archivo `.gitkeep` dentro de carpetas que aún no contienen archivos. Esto facilita la colaboración y asegura que la estructura base esté disponible para todos los desarrolladores.
