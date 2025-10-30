# Arquitectura del Proyecto: "Lista de Tareas TO DO"

Este documento describe la arquitectura general del sistema, siguiendo los principios del [Decálogo Holístico](decalogo.txt).

## Diagrama General

```
+----------------+      +-------------------------+      +---------------------+
|                |      |                         |      |                     |
|   Frontend     |----->|   Supabase (Backend)    |----->|  PostgreSQL DB      |
| (React, Vite)  |      |   (Auto-generado)       |      |  (con RLS)          |
|                |      |                         |      |                     |
+----------------+      +-------------------------+      +---------------------+
       |                        ^
       |                        |
       +------------------------+
       |
       v
+----------------+
|                |
|  Usuario Final |
|                |
+----------------+
```

## Componentes Principales

### 1. Frontend

-   **Framework:** React 19 con TypeScript.
-   **Bundler:** Vite.
-   **Comunicación con Backend:** Se realiza directamente desde el cliente al backend de Supabase a través de la librería `supabase-js`. No hay un servidor de backend tradicional (Node.js) intermedio para las operaciones CRUD.
-   **Autenticación:** Gestionada en el lado del cliente con `@supabase/auth-ui-react`, que interactúa con el servicio de autenticación de Supabase.
-   **Estructura:**
    -   `main.tsx`: Punto de entrada de la aplicación.
    -   `App.tsx`: Componente raíz que gestiona la sesión del usuario y decide si mostrar el login o la lista de tareas.
    -   `TodoList.tsx`: Componente principal que muestra las tareas y gestiona su estado (CRUD).
    -   `ThemeToggle.tsx`: Componente para cambiar entre modo claro y oscuro.
    -   `supabaseClient.ts`: Módulo centralizado para inicializar y exportar el cliente de Supabase.

### 2. Backend (Backend as a Service - BaaS)

-   **Plataforma:** Supabase.
-   **Lógica de Negocio:** En lugar de un servidor Node.js con lógica explícita, aprovechamos las APIs auto-generadas de Supabase. La autorización y las reglas de negocio se imponen directamente en la base de datos a través de **Políticas de Row Level Security (RLS)**.
-   **Carpeta `backend/`:** Actualmente, esta carpeta solo contiene una configuración mínima de `package.json` para gestionar dependencias de desarrollo del lado del servidor, como la propia `supabase-cli`. No ejecuta un servidor activo.

### 3. Base de Datos

-   **Motor:** PostgreSQL, gestionado por Supabase.
-   **Esquema:**
    -   La tabla `public.tasks` almacena las tareas.
    -   Está directamente vinculada a `auth.users` para la relación con los usuarios.
-   **Seguridad:** **RLS está activado por defecto**. Las políticas definidas aseguran que un usuario solo puede ejecutar operaciones (SELECT, INSERT, UPDATE, DELETE) sobre sus propias tareas.
-   **Migraciones:** La estructura de la base de datos y las políticas de seguridad están versionadas en el código dentro de la carpeta `supabase/migrations/`, siguiendo las mejores prácticas de la CLI de Supabase.

### 4. Diseño y Estilos (Styling)

-   **Metodología:** Sistema de diseño atómico basado en "tokens".
-   **`design/tokens.css`:** Archivo central que define las variables CSS (colores, fuentes, radios) para los temas claro y oscuro.
-   **`index.css`:** Importa los tokens y aplica estilos globales base.
-   **`App.css`:** Contiene los estilos específicos de los componentes, utilizando las variables definidas en los tokens.

### 5. Flujo de Autenticación

1.  El usuario llega a la aplicación. `App.tsx` comprueba si existe una sesión.
2.  Si no hay sesión, se muestra el componente `<Auth>` de `@supabase/auth-ui-react`.
3.  El usuario se registra o inicia sesión a través del formulario.
4.  Supabase Auth verifica las credenciales, crea una sesión y devuelve un JWT (JSON Web Token) al cliente.
5.  La librería `supabase-js` almacena este JWT de forma segura.
6.  El listener `onAuthStateChange` en `App.tsx` detecta el cambio de estado, actualiza la sesión en el estado de React y renderiza el componente `TodoList`.
7.  En cada petición posterior a la API de Supabase (ej. para obtener tareas), la librería `supabase-js` adjunta automáticamente el JWT.
8.  La base de datos utiliza este JWT para identificar al usuario (`auth.uid()`) y aplicar las políticas RLS correspondientes.