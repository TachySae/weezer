
// F1  -> API pública (Jolpica)
// WEC -> nuestro backend Express, que lee la base de datos MySQL "lemans"
const URL_API = "https://api.jolpi.ca/ergast/f1/current/driverstandings.json";
const URL_WEC = "http://localhost:3000/api/wec/pilotos";
const URL_WEC_AUTOS = "http://localhost:3000/api/wec/vehiculos";
const URL_WEC_NEUMATICOS = "http://localhost:3000/api/wec/neumaticos";
const URL_WEC_CARRERAS = "http://localhost:3000/api/wec/carreras";
const URL_WEC_STATS = "http://localhost:3000/api/wec/estadisticas";
let todosLosPilotos = [];
let categoriaActual = "";
let carreras = [];
let neumaticos = new Map();
let autos = new Map();

async function cargarNeumaticos() {
  const respuesta = await fetch(URL_WEC_NEUMATICOS);
  if (!respuesta.ok) throw new Error("Error HTTP " + respuesta.status);
  const filas = await respuesta.json();
  neumaticos = new Map();
  filas.forEach(n => {
    if (!neumaticos.has(n.Categoria)) neumaticos.set(n.Categoria, []);
    neumaticos.get(n.Categoria).push(n);
  });
}

// Serie que se está mostrando: "f1" o "wec"
let serie = "f1";

// Textos y colores que cambian según la serie
const CONFIG = {
  f1: { titulo: "Campeonato de Formula 1", boton: "Ver WEC", equipos: "Escuderías", color: "#E10600", fondos: "Fondos/" },
  wec: { titulo: "Campeonato Mundial de Resistencia (WEC)", boton: "Ver F1", equipos: "Equipos", color: "#0090D4", fondos: "FondosWEC/" }
};

// Colores de los equipos WEC. La clave es el nombre del equipo convertido con crearId()
const COLORES_WEC = {
  toyota_gazoo_racing: "#EB0A1E",
  porsche_penske_motorsport: "#D5001C",
  ferrari_af_corse: "#FFEB00",
  peugeot_totalenergies: "#BAFF39",
  cadillac_racing: "#C0C0C0",
  hertz_team_jota: "#FFD200",
  bmw_m_team_wrt: "#1C69D4",
  alpine_elf_endurance_team: "#FF87BC",
  manthey_purerxcing: "#00A19B",
  manthey_ema: "#F7A600"
};

const COLORES = {
  red_bull: "#3671C6",
  ferrari: "#E8002D",
  mercedes: "#27F4D2",
  mclaren: "#FF8000",
  aston_martin: "#229971",
  alpine: "#FF87BC",
  williams: "#64C4FF",
  rb: "#6692FF",
  haas: "#B6BABD",
  sauber: "#52E252",
  audi: "#F50537",
  cadillac: "#C0C0C0"
};

let pilotos = [];
let equipos = new Map();
// Recibe la id de equipo permitiendo su respectivo color, si no encuentra id dejara el color por defecto
// usa la tabla de colores de la serie actual
function colorDeEquipo(id) {
  const tabla = serie === "f1" ? COLORES : COLORES_WEC;
  if (id && !tabla[id]) console.log("Equipo sin color definido:", id);
  return tabla[id] || CONFIG[serie].color;
}

// convierte un nombre en un id simple: "Hertz Team JOTA" -> "hertz_team_jota"
function crearId(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // quita tildes
    .replace(/[^a-z0-9]+/g, "_")                         // espacios y símbolos -> _
    .replace(/^_|_$/g, "");
}

// "adaptador". Transforma las filas de MySQL al MISMO formato que entrega
// la API de F1. Así mostrarPrincipal() y mostrarEscuderia() funcionan sin cambios.
function adaptarWec(filas) {
  return filas.map((f, i) => {
    const partes = f.Nombre.split(" ");
    return {
      position: String(i + 1),
      points: String(f.Puntos),
      wins: String(f.Victorias),
      categoria: f.Categoria,      // NUEVO
      Driver: {
        givenName: partes[0],
        familyName: partes.slice(1).join(" "),
        nationality: f.Nacionalidad || "",
        nivel: f.Nivel,
        code: null
      },
      Constructors: [{
        constructorId: crearId(f.Equipo),
        name: f.Equipo,
        nationality: f.Equipo_Nacionalidad
      }]
    };
  });
}
async function cargarAutos() {
  const respuesta = await fetch(URL_WEC_AUTOS);
  if (!respuesta.ok) throw new Error("Error HTTP " + respuesta.status);
  const filas = await respuesta.json();
  autos = new Map();
  filas.forEach(a => {
    const id = crearId(a.Equipo);   // mismo id que usan los equipos de los pilotos
    if (!autos.has(id)) autos.set(id, []);
    autos.get(id).push(a);
  });
}
// Guardas a los pilotos que estan en la API permitiendo que la pagina funcione si algo falla muestra error
// NUEVO: según la serie, pide los datos a la API de F1 o a nuestro backend
async function cargarPilotos() {
  const estado = document.getElementById("estado");
  estado.textContent = "Cargando…";
  document.getElementById("lista").innerHTML = "";
  try {
    const url = serie === "f1" ? URL_API : URL_WEC;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("Error HTTP " + respuesta.status);
    const datos = await respuesta.json();

    if (serie === "f1") {
      const tabla = datos.MRData.StandingsTable;
      pilotos = tabla.StandingsLists[0].DriverStandings;
      document.getElementById("temporada").textContent = "Temporada " + tabla.season;
    } else {
      todosLosPilotos = adaptarWec(datos);
      filtrarCategoria(categoriaActual);
      await cargarAutos();
      await cargarNeumaticos();
      document.getElementById("temporada").textContent = "Datos desde la base de datos lemans (MySQL)";
    }

    armarEquipos();
    estado.textContent = "";
    llenarFiltro();
    mostrarPrincipal();
  } catch (error) {
    estado.textContent = serie === "f1"
      ? "No se pudieron cargar los datos. Revisa tu conexión y recarga la página."
      : "No se pudo leer la base de datos. ¿Está corriendo el backend (npm run dev)?";
  }
}

function filtrarCategoria(categoria) {
  categoriaActual = categoria;
  pilotos = todosLosPilotos
    .filter(p => !categoria || p.categoria === categoria)
    .map((p, i) => ({ ...p, position: String(i + 1) }));
}

// agrupa a los pilotos por equipo
function armarEquipos() {
  equipos = new Map();
  pilotos.forEach(p => {
    const c = p.Constructors[0];
    if (!equipos.has(c.constructorId)) {
      equipos.set(c.constructorId, {
        id: c.constructorId,
        nombre: c.name,
        nacionalidad: c.nationality || "",     // NUEVO
        puntos: 0,
        pilotos: []
      });
    }
    const e = equipos.get(c.constructorId);
    e.puntos += Number(p.points);
    e.pilotos.push(p);
  });

}

// ordena a los equipos por puntos del campeonato
function equiposPorPuntos() {
  return [...equipos.values()].sort((a, b) => b.puntos - a.puntos);
}

// Permite tener botones que guarda a los equipos 
function crearBoton(texto, id) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn btn-outline-light";
  boton.textContent = texto;
  boton.dataset.id = id;
  boton.addEventListener("click", () => elegirEquipo(id));
  return boton;
}

function crearBotonSeccion(texto, id, mostrar) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn btn-outline-light";
  boton.textContent = texto;
  boton.dataset.id = id;
  boton.addEventListener("click", () => {
    marcarActivo(id);
    cambiarFondo("");
    document.documentElement.style.setProperty("--acento", CONFIG[serie].color);
    mostrar();
    window.scrollTo({ top: 0 });
  });
  return boton;
}
// Permite que se pueda filtrar por equipo 
function llenarFiltro() {
  const contenedor = document.getElementById("filtro");
  contenedor.innerHTML = "";
  contenedor.appendChild(crearBoton("Inicio", ""));
  if (serie === "wec") {
    contenedor.appendChild(crearBotonSeccion("Calendario", "__calendario", mostrarCalendario));
    contenedor.appendChild(crearBotonSeccion("Estadísticas", "__estadisticas", mostrarEstadisticas));
  }
  [...equipos.values()]
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .forEach(e => contenedor.appendChild(crearBoton(e.nombre, e.id)));
  marcarActivo("");
}
function formatearFecha(texto) {
  // "T00:00:00" hace que la fecha se lea en hora local (sin desfase de un día)
  const fecha = new Date(texto + "T00:00:00");
  return {
    dia: fecha.getDate(),
    mes: fecha.toLocaleDateString("es-CL", { month: "short" }).replace(".", ""),
    larga: fecha.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })
  };
}

function formatearDuracion(texto) {
  const [h, m] = texto.split(":").map(Number);   // "06:00:00" -> [6, 0, 0]
  return [h ? h + " h" : "", m ? m + " min" : ""].filter(Boolean).join(" ");
}
// Permite mantener el boton con el equipo seleccionado
function marcarActivo(id) {
  document.querySelectorAll("#filtro .btn").forEach(b => {
    b.classList.toggle("activo", b.dataset.id === id);
  });
}

// muestra el equipo elegido con sus colores
function elegirEquipo(id) {
  cambiarFondo(id);
  marcarActivo(id);
  document.documentElement.style.setProperty("--acento", id ? colorDeEquipo(id) : CONFIG[serie].color);
  if (id) mostrarEscuderia(id);
  else mostrarPrincipal();
  window.scrollTo({ top: 0 });
}

// reinicia la lista de audio 
function limpiarLista() {
  detenerAudio();
  const contenedor = document.getElementById("lista");
  contenedor.innerHTML = "";
  contenedor.style.animation = "none";
  contenedor.offsetHeight;
  contenedor.style.animation = "";
  return contenedor;
}

// Muestra el podio principal y la main page
function mostrarPrincipal() {
  const cont = limpiarLista();
  const orden = [1, 0, 2];
  const top3 = orden.map(i => pilotos[i]).filter(Boolean);

  const podio = top3.map(p => `
    <div class="puesto p${p.position}" style="--acento:${colorDeEquipo(p.Constructors[0].constructorId)}">
      <div class="num">${p.position}</div>
      <p class="nombre">${p.Driver.givenName} <strong>${p.Driver.familyName}</strong></p>
      <p class="equipo">${p.Constructors[0].name}</p>
      <p class="pts">${p.points} pts</p>
    </div>`).join("");

  const tarjetasEquipo = equiposPorPuntos().map((e, i) => `
    <button type="button" class="equipo-card" data-id="${e.id}" style="--acento:${colorDeEquipo(e.id)}">
      <strong>${e.nombre}</strong>
      <span>${i + 1}.º · ${e.puntos} pts</span>
    </button>`).join("");

  const filas = pilotos.map(p => `
    <tr>
      <td>${p.position}</td>
      <td>${p.Driver.givenName} ${p.Driver.familyName}</td>
      <td>${p.Constructors[0].name}</td>
      <td class="text-end">${p.points}</td>
    </tr>`).join("");
  const categorias = serie !== "wec" ? "" : `
    <div class="categorias">
      ${["", "Hypercar", "GT3"].map(c => `
        <button type="button" class="cat ${c === categoriaActual ? "activo" : ""}" data-cat="${c}">
          ${c || "Todas"}
        </button>`).join("")}
    </div>`;

  cont.innerHTML = `
    ${categorias}
    <h2 class="titulo">Podio del campeonato</h2>
    ...el resto igual...`;

  cont.innerHTML = `
    <h2 class="titulo">Podio del campeonato</h2>
    <div class="podio">${podio}</div>

    <h2 class="titulo">${CONFIG[serie].equipos}</h2>
    <div class="equipos">${tarjetasEquipo}</div>

    <details>
      <summary>Clasificación completa</summary>
      <table class="table table-dark table-sm tabla">
        <thead><tr><th>#</th><th>Piloto</th><th>Equipo</th><th class="text-end">Pts</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
    </details>`;

  cont.querySelectorAll(".cat").forEach(b =>
    b.addEventListener("click", () => {
      filtrarCategoria(b.dataset.cat);
      armarEquipos();
      llenarFiltro();
      mostrarPrincipal();
    }));
}

// Permite mostrar la carta del equipo con su lugar en el campeonato de constructores
function mostrarEscuderia(id) {
  const cont = limpiarLista();
  const e = equipos.get(id);
  const lugar = equiposPorPuntos().findIndex(x => x.id === id) + 1;

  cont.innerHTML = `
    <div class="cabecera-equipo">
      <h2>${e.nombre}</h2>
      <p>${lugar}.º en constructores · ${e.puntos} puntos${e.nacionalidad ? " · " + e.nacionalidad : ""}</p>
    </div>
    <div class="pilotos"></div>}`;


  const caja = cont.querySelector(".pilotos");
  e.pilotos.forEach(p => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "piloto";
    tarjeta.innerHTML = `
      <span class="pos">${p.position}</span>
      <h3>${p.Driver.givenName} ${p.Driver.familyName}</h3>
      ${p.Driver.nivel ? `<span class="nivel nivel-${p.Driver.nivel.toLowerCase()}">${p.Driver.nivel}</span>` : ""}
      <p>${p.points} pts · ${p.wins} victorias</p>
      <p>${p.Driver.nationality}</p>
      ${serie === "f1" ? '<button class="radio" type="button">Radio check</button>' : ""}`;
    const boton = tarjeta.querySelector(".radio");
    if (boton) boton.addEventListener("click", () => alternarAudio(p.Driver.code, boton));
    caja.appendChild(tarjeta);
  });
  if (serie === "wec") mostrarAutos(cont, id);
}


const CARPETA_AUDIO = "audio/";
const AUDIO_RESPALDO = CARPETA_AUDIO + "radio-check.mp3";

let audioActual = null;
let botonActual = null;

function alternarAudio(codigo, boton) {
  if (audioActual && botonActual === boton) {
    detenerAudio();
    return;
  }
  detenerAudio();
  reproducir(CARPETA_AUDIO + codigo + ".mp3", boton, true);
}
// Permite que el boton radio check reproduzca el audio del piloto
function reproducir(ruta, boton, permitirRespaldo) {
  const audio = new Audio(ruta);
  audioActual = audio;
  botonActual = boton;
  boton.textContent = "Detener";
  boton.classList.add("sonando");

  audio.addEventListener("ended", detenerAudio);
  audio.addEventListener("error", () => {
    if (audioActual !== audio) return;
    if (permitirRespaldo) {
      reproducir(AUDIO_RESPALDO, boton, false);
    } else {
      detenerAudio();
      boton.textContent = "Sin audio";
    }
  });
  audio.play().catch(error => console.warn("No se pudo reproducir:", error.message));
}
function detenerAudio() {
  if (audioActual) audioActual.pause();
  if (botonActual) {
    botonActual.textContent = "Radio check";
    botonActual.classList.remove("sonando");
  }
  audioActual = null;
  botonActual = null;
}


const capas = [document.getElementById("fondoA"), document.getElementById("fondoB")];
let capaActiva = -1;
// Precarga el fondo para permitir la animacion
function cambiarFondo(id) {
  const ruta = CONFIG[serie].fondos + (id || "main") + ".jpg";   // NUEVO: carpeta según la serie
  const img = new Image();
  img.onload = () => {
    const entrante = capas[capaActiva === 0 ? 1 : 0];
    const saliente = capas[capaActiva];
    entrante.style.backgroundImage = `url("${ruta}")`;
    entrante.classList.add("activa");
    if (saliente) saliente.classList.remove("activa");
    capaActiva = capaActiva === 0 ? 1 : 0;
  };
  img.onerror = () => {
    console.warn("No se encontró", ruta);
    // NUEVO: si no hay imagen, se quita el fondo anterior (para no dejar uno de F1 en WEC)
    if (capas[capaActiva]) capas[capaActiva].classList.remove("activa");
  };
  img.src = ruta;
}

// ===== NUEVO: botón que cambia entre F1 y WEC =====
function cambiarSerie() {
  serie = serie === "f1" ? "wec" : "f1";
  categoriaActual = "";
  const conf = CONFIG[serie];
  document.getElementById("titulo").textContent = conf.titulo;
  document.getElementById("cambiarSerie").textContent = conf.boton;
  document.title = conf.titulo;
  document.documentElement.style.setProperty("--acento", conf.color);
  document.getElementById("filtro").innerHTML = "";
  detenerAudio();
  cambiarFondo("");
  cargarPilotos();
}

document.getElementById("cambiarSerie").addEventListener("click", cambiarSerie);

cambiarFondo("");
cargarPilotos();
function mostrarAutos(cont, id) {
  const lista = autos.get(id) || [];
  if (lista.length === 0) return;

  const tarjetas = lista.map(a => `
    <div class="auto">
      <span class="categoria">${a.Categoria}</span>
      <h3>${a.Nombre}</h3>
      <ul>
        <li><span>Marca</span>${a.Marca}</li>
        <li><span>Modelo</span>${a.Modelo}</li>
        <li><span>Motor</span>${a.Motor}</li>
        <li><span>Potencia</span>${a.Potencia}</li>
      </ul>
      ${htmlNeumaticos(a.Categoria)}
    </div>`).join("");

  cont.insertAdjacentHTML("beforeend", `
    <h2 class="titulo">Autos del equipo</h2>
    <div class="autos">${tarjetas}</div>`);
}
function htmlNeumaticos(categoria) {
  const lista = neumaticos.get(categoria) || [];
  if (lista.length === 0) return "";
  const filas = lista.map(n => `
    <li>
      <span>${n.Marca} · ${n.Tipo}</span>
      <span class="agarre" title="Agarre ${n.Agarre}/10 · Durabilidad ${n.Durabilidad}">
        <span style="width:${n.Agarre * 10}%"></span>
      </span>
    </li>`).join("");
  return `<p class="sub">Neumáticos</p><ul class="neumaticos">${filas}</ul>`;
}
async function mostrarCalendario() {
  const cont = limpiarLista();
  cont.innerHTML = `<p>Cargando calendario…</p>`;
  try {
    const respuesta = await fetch(URL_WEC_CARRERAS);
    if (!respuesta.ok) throw new Error("Error HTTP " + respuesta.status);
    carreras = await respuesta.json();
  } catch (error) {
    cont.innerHTML = `<p>No se pudo cargar el calendario.</p>`;
    cont.querySelectorAll(".carrera").forEach(b =>
      b.addEventListener("click", () => mostrarResultados(Number(b.dataset.id))));
    return;
  }

  const tarjetas = carreras.map(c => {
    const f = formatearFecha(c.Fecha);
    const terminada = c.Estado === "Terminada";
    return `
      <button type="button" class="carrera ${terminada ? "" : "pendiente"}" data-id="${c.Carrera_ID}">
        <div class="fecha"><span class="dia">${f.dia}</span><span class="mes">${f.mes}</span></div>
        <div class="info">
          <strong>${c.Nombre}</strong>
          <span>${c.Circuito} · ${c.Pais} · ${c.Longitud}</span>
          <span>${c.Clima} · ${c.Temperatura} · Humedad ${c.Humedad} · ${formatearDuracion(c.Duracion)}</span>
        </div>
        <span class="estado">${c.Estado}</span>
      </button>`;
  }).join("");

  cont.innerHTML = `
    <h2 class="titulo">Calendario</h2>
    <div class="calendario">${tarjetas}</div>`;
}
async function mostrarResultados(id) {
  const carrera = carreras.find(c => c.Carrera_ID === id);
  const cont = limpiarLista();
  cont.innerHTML = `<p>Cargando resultados…</p>`;

  let filas;
  try {
    const respuesta = await fetch(`${URL_WEC_CARRERAS}/${id}/resultados`);
    if (!respuesta.ok) throw new Error("Error HTTP " + respuesta.status);
    filas = await respuesta.json();
  } catch (error) {
    cont.innerHTML = `<p>No se pudieron cargar los resultados.</p>`;
    console.error(error);
    return;
  }

  const cuerpo = filas.length === 0
    ? `<tr><td colspan="8">Esta carrera todavía no tiene resultados.</td></tr>`
    : filas.map(f => `
      <tr class="${f.Penalizacion !== "Ninguna" ? "penalizado" : ""}">
        <td>${f.Posicion_final}</td>
        <td>${f.Piloto}</td>
        <td>${f.Equipo}</td>
        <td>${f.Auto}</td>
        <td>${f.Vueltas}</td>
        <td>${f.Tiempo_total}</td>
        <td>${f.Penalizacion}</td>
        <td>${f.Combustible_restante}</td>
      </tr>`).join("");

  cont.innerHTML = `
    <button type="button" class="volver">← Volver al calendario</button>
    <div class="cabecera-equipo">
      <h2>${carrera.Nombre}</h2>
      <p>${carrera.Circuito} · ${formatearFecha(carrera.Fecha).larga} · ${carrera.Clima}</p>
    </div>
    <div class="table-responsive">
      <table class="table table-dark table-sm tabla resultados">
        <thead><tr>
          <th>Pos</th><th>Piloto</th><th>Equipo</th><th>Auto</th>
          <th>Vueltas</th><th>Tiempo</th><th>Penalización</th><th>Combustible</th>
        </tr></thead>
        <tbody>${cuerpo}</tbody>
      </table>
    </div>`;

  cont.querySelector(".volver").addEventListener("click", mostrarCalendario);
}
function htmlRanking(titulo, filas) {
  const maximo = Math.max(...filas.map(f => Number(f.Total)), 1);
  const items = filas.map(f => `
    <li>
      <div class="fila"><span>${f.Nombre}</span><strong>${f.Total}</strong></div>
      <div class="barra"><span style="width:${Number(f.Total) / maximo * 100}%"></span></div>
    </li>`).join("");
  return `<div class="ranking"><h3>${titulo}</h3><ol>${items}</ol></div>`;
}

async function mostrarEstadisticas() {
  const cont = limpiarLista();
  cont.innerHTML = `<p>Cargando estadísticas…</p>`;
  try {
    const respuesta = await fetch(URL_WEC_STATS);
    if (!respuesta.ok) throw new Error("Error HTTP " + respuesta.status);
    const datos = await respuesta.json();
    cont.innerHTML = `
      <h2 class="titulo">Estadísticas</h2>
      <div class="rankings">
        ${htmlRanking("Podios por equipo", datos.podios)}
        ${htmlRanking("Pilotos más penalizados", datos.penalizaciones)}
        ${htmlRanking("Vueltas acumuladas", datos.vueltas)}
      </div>`;
  } catch (error) {
    cont.innerHTML = `<p>No se pudieron cargar las estadísticas.</p>`;
    console.error(error);
  }
}
