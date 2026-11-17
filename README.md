# Campeonato F1 / WEC

Página web que muestra dos campeonatos de automovilismo con un solo botón para cambiar entre ellos:

- **Fórmula 1**: datos en vivo desde la API pública [Jolpica-F1](https://api.jolpi.ca/ergast/f1/).
- **WEC (Mundial de Resistencia)**: datos desde una base de datos MySQL propia (`lemans`), leídos a través de un backend en Node.js + Express.

## Funcionalidades

- Botón **Ver WEC / Ver F1** que cambia la fuente de datos, los textos y los colores de la página.
- Podio del campeonato, tarjetas de equipos y clasificación completa.
- **Filtros dinámicos (DOM)**:
  - Botones por equipo: muestran sus pilotos, sus autos y los neumáticos de cada categoría.
  - Botones de categoría en WEC (**Todas · Hypercar · GT3**): recalculan podio, equipos y posiciones.
- **Calendario** de carreras con circuito, país, clima y duración; al hacer clic en una carrera se ven sus **resultados**.
- **Estadísticas**: podios por equipo, pilotos más penalizados y vueltas acumuladas.
- Nivel del piloto (Platinum, Gold, Silver, Bronze) y nacionalidad del equipo.
- En F1: botón "Radio check" con audio de cada piloto.

## Tecnologías

| Parte | Tecnologías |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript (fetch, DOM), Bootstrap 5.3 |
| Backend | Node.js, Express, mysql2, cors, dotenv |
| Base de datos | MySQL Server 8 + MySQL Workbench |

## Estructura de carpetas

```
Proyecto/
├── README.md
├── modelo.png               ← modelo gráfico de la base de datos
├── backend/
│   ├── server.js            ← servidor Express y endpoints
│   ├── package.json
│   ├── package-lock.json
│   ├── datos.sql            ← dump de la base de datos "lemans"
│   ├── .env.example         ← plantilla de configuración (copiar como .env)
│   └── .gitignore
└── frontend/
    ├── index.html
    ├── Script.js
    ├── Assets/
    │   └── css/
    │       └── style.css
    ├── Fondos/              ← fondos de F1
    ├── FondosWEC/           ← fondos de WEC
    └── Audio/               ← audios "Radio check" de F1
```

## Requisitos

- [MySQL Server](https://dev.mysql.com/downloads/mysql/) instalado y en ejecución.
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/).
- [Node.js](https://nodejs.org/) (incluye npm).
- Visual Studio Code con la extensión **Live Server**.

## Cómo ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone <URL-del-repositorio>
cd <carpeta-del-proyecto>
```

### 2. Crear la base de datos

1. Abre MySQL Workbench y conéctate a tu servidor local.
2. Abre `backend/datos.sql` (**File → Open SQL Script**).
3. Ejecútalo con el botón del rayo.
4. Actualiza el panel **SCHEMAS**: debe aparecer la base `lemans` con sus 10 tablas.

### 3. Configurar y levantar el backend

En una terminal (Command Prompt), dentro de la carpeta `backend`:

```bash
cd backend
npm install
```

Copia `.env.example` con el nombre `.env` y escribe tu contraseña de MySQL:

```bash
copy .env.example .env
```

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=lemans
DB_USER=root
DB_PASSWORD=TU_CLAVE_MYSQL
FRONTEND_URL=http://127.0.0.1:5500
```

Inicia el servidor:

```bash
npm run dev
```

Debe aparecer `Servidor escuchando en el puerto 3000`. Para comprobarlo, abre <http://localhost:3000/api/wec/pilotos>: debe mostrar un JSON con los pilotos.

### 4. Abrir el frontend

1. En VS Code, abre la carpeta `frontend`.
2. Clic derecho sobre `index.html` → **Open with Live Server**.
3. Se abre `http://127.0.0.1:5500`. La página parte en F1; presiona **Ver WEC** para ver los datos de la base de datos.

> El backend debe seguir corriendo mientras usas la sección WEC.

### Orden de inicio cada vez que trabajes

1. Iniciar MySQL Server.
2. `npm run dev` dentro de `backend`.
3. Live Server sobre `frontend/index.html`.

## Endpoints del backend

| Método | Ruta | Devuelve | Tablas usadas |
| --- | --- | --- | --- |
| GET | `/api/wec/pilotos` | Pilotos con puntos, victorias, nivel y categoría | piloto, equipo, participacion, vehiculo, categoria |
| GET | `/api/wec/vehiculos` | Autos de cada equipo | vehiculo, equipo, categoria |
| GET | `/api/wec/neumaticos` | Neumáticos permitidos por categoría | categoria_neumatico, categoria, neumatico |
| GET | `/api/wec/carreras` | Calendario de carreras | carrera, circuito, clima |
| GET | `/api/wec/carreras/:id/resultados` | Resultados de una carrera | participacion, piloto, equipo, vehiculo |
| GET | `/api/wec/estadisticas` | Podios, penalizaciones y vueltas | participacion, equipo, piloto |

Las consultas usan `INNER JOIN` / `LEFT JOIN`, funciones de agregado (`SUM`, `COUNT`, `MAX`) con `GROUP BY`, y parámetros `?` para evitar inyección SQL.

## Modelo de la base de datos

![Modelo de la base de datos lemans]

| Tabla | Clave primaria | Claves foráneas |
| --- | --- | --- |
| categoria | Categoria_ID | — |
| circuito | Circuito_ID | — |
| clima | Clima_ID | — |
| equipo | Equipo_ID | — |
| neumatico | ID_neumatico | — |
| categoria_neumatico | (FK_Categoria_ID, FK_ID_Neumatico) | → categoria, → neumatico |
| carrera | Carrera_ID | Circuito_ID → circuito, Clima_ID → clima |
| piloto | Piloto_ID | Equipo_ID → equipo |
| vehiculo | Vehiculo_ID | Equipo_ID → equipo, Categoria_ID → categoria |
| participacion | Participacion_ID | Piloto_ID → piloto, Carrera_ID → carrera, Vehiculo_ID → vehiculo, Equipo_ID → equipo |

`categoria_neumatico` es una tabla intermedia que resuelve la relación **muchos a muchos** entre categorías y neumáticos.

## Problemas frecuentes

| Mensaje o síntoma | Qué revisar |
| --- | --- |
| `Access denied for user ''@'localhost' (using password: NO)` | El archivo `.env` no se está leyendo: debe llamarse exactamente `.env` (no `.env.txt`) y estar dentro de `backend`. |
| `Access denied for user 'root'@'localhost' (using password: YES)` | La contraseña de `DB_PASSWORD` no es la de tu MySQL. |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL Server no está iniciado o usa otro puerto. |
| `Unknown database 'lemans'` | Falta ejecutar `datos.sql` en Workbench. |
| En WEC aparece "No se pudo leer la base de datos" | El backend no está corriendo (`npm run dev`). |
| Error de CORS en la consola | Live Server usa un puerto que no está en la lista `origenesPermitidos` de `server.js`. |
