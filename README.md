# MyTraining - Admin Panel 🖥️

Este es el panel administrativo de MyTraining, diseñado para que entrenadores y administradores gestionen usuarios, dietas y rutinas. Construido con **Angular 21** y **PrimeNG**.

---

## 🚀 Puesta en Marcha

Sigue estos pasos para ejecutar el panel en tu entorno local.

### Requisitos Previos
*   **Node.js** (v18.0.0+)
*   **pnpm** (instalado globalmente: `npm install -g pnpm`)
*   **Angular CLI** (opcional: `npm install -g @angular/cli`)

### Instalación
1.  Entra en la carpeta del proyecto:
    ```bash
    cd Admin/admin-my-training
    ```
2.  Instala las dependencias:
    ```bash
    pnpm install
    ```

### Ejecución
Para iniciar el servidor de desarrollo, ejecuta:
```bash
pnpm start
```
O si prefieres usar el comando nativo de Angular:
```bash
ng serve
```
La aplicación se abrirá en `http://localhost:4200`.

---

## 🏗️ Tecnología y Diseño

*   **Angular 21**: Uso de componentes standalone y señales.
*   **PrimeNG v21**: Biblioteca de componentes de UI profesional.
*   **Tailwind CSS v4**: Utilidades para el diseño y layout.
*   **Chart.js**: Paneles de analíticas y progreso visual.

---

## 📁 Estructura del Proyecto

*   `src/app/features/`: Módulos de negocio (usuarios, rutinas, dietas, dashboard).
*   `src/app/core/`: Servicios esenciales, interceptores y guardia de autenticación.
*   `src/app/shared/`: Componentes, utilidades y servicios compartidos.

---
© 2026 - Proyecto de Fin de Ciclo. Desarrollado por Jose Luis Prieto.
