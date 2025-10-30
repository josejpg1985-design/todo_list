# Lista de Tareas (To-Do List)

Una aplicación web Full-Stack simple pero robusta para gestionar una lista de tareas personal. Este proyecto fue construido siguiendo un [Decálogo Holístico](decalogo.txt) con la asistencia de un agente de IA autónomo.

## ✨ Características (Features)

-   ✅ **Autenticación de Usuarios:** Sistema seguro de registro e inicio de sesión con email/contraseña.
-   🔐 **Seguridad por Diseño:** Las tareas de cada usuario son privadas gracias a las políticas de Row Level Security (RLS) de PostgreSQL.
-   📝 **Gestión de Tareas (CRUD):** Funcionalidad completa para Crear, Leer, Actualizar (marcar como completada) y Eliminar tareas.
-   🌗 **Selector de Tema:** Interfaz con modo claro y oscuro, con persistencia de la preferencia del usuario.
-   🎨 **Diseño Moderno:** Interfaz limpia y responsiva construida con un sistema de diseño basado en tokens.

## 🚀 Stack Tecnológico

-   **Frontend:**
    -   React 19 (con TypeScript)
    -   Vite (entorno de desarrollo y bundler)
-   **Backend (BaaS):**
    -   Supabase
-   **Base de Datos:**
    -   PostgreSQL (a través de Supabase)
-   **Autenticación:**
    -   Supabase GoTrue
-   **Estilos:**
    -   CSS plano con variables (Tokens)

## 🏁 Cómo Empezar (Getting Started)

Sigue estos pasos para ejecutar el proyecto en tu máquina local.

### Prerrequisitos

-   Node.js (v18 o superior)
-   npm
-   Docker Desktop (debe estar ejecutándose)

### Pasos de Instalación

1.  **Clona el repositorio (o descarga el código fuente).**

2.  **Inicia los servicios de Supabase:**
    *   Este comando descargará las imágenes de Docker necesarias la primera vez y aplicará las migraciones de la base de datos.
    ```bash
    # Desde la raíz del proyecto
    npx --prefix backend supabase start
    ```

3.  **Instala las dependencias del Frontend:**
    ```bash
    # Navega a la carpeta del frontend
    cd frontend

    # Instala los paquetes
    npm install
    ```

4.  **Inicia el servidor de desarrollo del Frontend:**
    ```bash
    # Desde la carpeta 'frontend'
    npm run dev
    ```

5.  **¡Abre la aplicación!**
    *   Abre tu navegador y visita `http://localhost:5173` (o la URL que indique Vite en tu terminal).

¡Y listo! Ahora puedes registrarte y empezar a usar la aplicación.