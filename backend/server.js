require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

const origenesPermitidos = [
    process.env.FRONTEND_URL,
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501"
].filter(Boolean);

app.use(cors({
    origin: function (origen, callback) {
        if (!origen || origenesPermitidos.includes(origen)) {
            return callback(null, true);
        }
        return callback(new Error("Origen no permitido por CORS"));
    }
}));

app.use(express.json());

// Pool de conexiones a TU base de datos (lemans), los datos salen del .env
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get("/", (req, res) => {
    res.send("Backend WEC (base lemans) funcionando.");
});

// Clasificación de pilotos WEC
app.get("/api/wec/pilotos", async (req, res) => {
    try {
        const consulta = `
            SELECT
                p.Piloto_ID,
                p.Nombre,
                p.Nacionalidad,
                p.Nivel,
                e.Equipo_ID,
                e.Nombre AS Equipo,
                e.Nacionalidad AS Equipo_Nacionalidad,
                MAX(cat.Nombre) AS Categoria,
                COALESCE(SUM(CASE CAST(pa.Posicion_final AS UNSIGNED)
                    WHEN 1  THEN 25
                    WHEN 2  THEN 18
                    WHEN 3  THEN 15
                    WHEN 4  THEN 12
                    WHEN 5  THEN 10
                    WHEN 6  THEN 8
                    WHEN 7  THEN 6
                    WHEN 8  THEN 4
                    WHEN 9  THEN 2
                    WHEN 10 THEN 1
                    ELSE 0
                END), 0) AS Puntos,
                COALESCE(SUM(CAST(pa.Posicion_final AS UNSIGNED) = 1), 0) AS Victorias
            FROM piloto AS p
            INNER JOIN equipo AS e
                ON p.Equipo_ID = e.Equipo_ID
            LEFT JOIN participacion AS pa
                ON pa.Piloto_ID = p.Piloto_ID
            LEFT JOIN vehiculo AS v
                ON pa.Vehiculo_ID = v.Vehiculo_ID
            LEFT JOIN categoria AS cat
                ON v.Categoria_ID = cat.Categoria_ID
            GROUP BY p.Piloto_ID, e.Equipo_ID
            ORDER BY Puntos DESC, Victorias DESC, p.Nombre`;

        const [filas] = await pool.query(consulta);
        res.json(filas);
    } catch (error) {
        console.error("Error al consultar pilotos WEC:", error.message);
        res.status(500).json({ mensaje: "Error al consultar la base de datos." });
    }
});
// Autos de cada equipo con su categoría
app.get("/api/wec/vehiculos", async (req, res) => {
    try {
        const consulta = `
            SELECT
                v.Vehiculo_ID, v.Nombre, v.Marca, v.Modelo, v.Motor, v.Potencia,
                c.Nombre AS Categoria,
                e.Nombre AS Equipo
            FROM vehiculo AS v
            INNER JOIN equipo AS e ON v.Equipo_ID = e.Equipo_ID
            INNER JOIN categoria AS c ON v.Categoria_ID = c.Categoria_ID
            ORDER BY v.Categoria_ID, v.Nombre;
        `;
        const [filas] = await pool.query(consulta);
        res.json(filas);
    } catch (error) {
        console.error("Error al consultar vehículos:", error.message);
        res.status(500).json({ mensaje: "Error al consultar la base de datos." });
    }
});
// Calendario: carrera + circuito + clima
app.get("/api/wec/carreras", async (req, res) => {
    try {
        const consulta = `
            SELECT
                c.Carrera_ID,
                c.Nombre,
                DATE_FORMAT(c.Fecha, '%Y-%m-%d') AS Fecha,
                c.Duracion,
                c.Estado,
                ci.Nombre_circuito AS Circuito,
                ci.Pais,
                ci.Longitud,
                cl.Tipo_clima AS Clima,
                cl.Temperatura,
                cl.Humedad
            FROM carrera AS c
            INNER JOIN circuito AS ci
                ON c.Circuito_ID = ci.Circuito_ID
            INNER JOIN clima AS cl
                ON c.Clima_ID = cl.Clima_ID
            ORDER BY c.Fecha;
        `;
        const [filas] = await pool.query(consulta);
        res.json(filas);
    } catch (error) {
        console.error("Error al consultar carreras:", error.message);
        res.status(500).json({ mensaje: "Error al consultar la base de datos." });
    }
});
// Resultados de una carrera (:id = Carrera_ID)
app.get("/api/wec/carreras/:id/resultados", async (req, res) => {
    try {
        const consulta = `
            SELECT
                pa.Posicion_final,
                p.Nombre AS Piloto,
                e.Nombre AS Equipo,
                v.Nombre AS Auto,
                pa.Vueltas,
                pa.Tiempo_total,
                pa.Penalizacion,
                pa.Combustible_restante
            FROM participacion AS pa
            INNER JOIN piloto AS p ON pa.Piloto_ID = p.Piloto_ID
            INNER JOIN equipo AS e ON pa.Equipo_ID = e.Equipo_ID
            INNER JOIN vehiculo AS v ON pa.Vehiculo_ID = v.Vehiculo_ID
            WHERE pa.Carrera_ID = ?
            ORDER BY
                pa.Posicion_final LIKE '%LMGT3%',
                CAST(pa.Posicion_final AS UNSIGNED),
                pa.Tiempo_total;
        `;
        // El "?" se reemplaza de forma segura por el valor del arreglo
        const [filas] = await pool.query(consulta, [req.params.id]);
        res.json(filas);
    } catch (error) {
        console.error("Error al consultar resultados:", error.message);
        res.status(500).json({ mensaje: "Error al consultar la base de datos." });
    }
});
// Estadísticas: podios, penalizaciones y vueltas
app.get("/api/wec/estadisticas", async (req, res) => {
    try {
        const consultaPodios = `
            SELECT e.Nombre AS Nombre,
                   COUNT(DISTINCT pa.Carrera_ID, pa.Vehiculo_ID) AS Total
            FROM participacion AS pa
            INNER JOIN equipo AS e ON pa.Equipo_ID = e.Equipo_ID
            WHERE CAST(pa.Posicion_final AS UNSIGNED) BETWEEN 1 AND 3
            GROUP BY e.Equipo_ID
            ORDER BY Total DESC, e.Nombre
            LIMIT 5;
        `;
        const consultaPenalizaciones = `
            SELECT p.Nombre AS Nombre, COUNT(*) AS Total
            FROM participacion AS pa
            INNER JOIN piloto AS p ON pa.Piloto_ID = p.Piloto_ID
            WHERE pa.Penalizacion <> 'Ninguna'
            GROUP BY p.Piloto_ID
            ORDER BY Total DESC, p.Nombre
            LIMIT 5;
        `;
        const consultaVueltas = `
            SELECT p.Nombre AS Nombre, SUM(CAST(pa.Vueltas AS UNSIGNED)) AS Total
            FROM participacion AS pa
            INNER JOIN piloto AS p ON pa.Piloto_ID = p.Piloto_ID
            GROUP BY p.Piloto_ID
            ORDER BY Total DESC, p.Nombre
            LIMIT 5;
        `;
        const [[podios], [penalizaciones], [vueltas]] = await Promise.all([
            pool.query(consultaPodios),
            pool.query(consultaPenalizaciones),
            pool.query(consultaVueltas)
        ]);
        res.json({ podios, penalizaciones, vueltas });
    } catch (error) {
        console.error("Error al consultar estadísticas:", error.message);
        res.status(500).json({ mensaje: "Error al consultar la base de datos." });
    }
});
// Neumáticos permitidos por categoría
app.get("/api/wec/neumaticos", async (req, res) => {
    try {
        const consulta = `
            SELECT
                c.Nombre AS Categoria,
                n.Marca,
                n.Tipo,
                n.Durabilidad,
                n.Agarre
            FROM categoria_neumatico AS cn
            INNER JOIN categoria AS c
                ON cn.FK_Categoria_ID = c.Categoria_ID
            INNER JOIN neumatico AS n
                ON cn.FK_ID_Neumatico = n.ID_neumatico
            ORDER BY c.Nombre, n.Agarre DESC;
        `;
        const [filas] = await pool.query(consulta);
        res.json(filas);
    } catch (error) {
        console.error("Error al consultar neumáticos:", error.message);
        res.status(500).json({ mensaje: "Error al consultar la base de datos." });
    }
});
app.listen(PORT, () => {
    console.log("Servidor escuchando en el puerto " + PORT);
});

