// controllers/viajesControllers.js
import { conectarBDMySql } from "../config/dbMYSQL.js";

// Helper para emitir eventos por Socket.IO (con room opcional)
export const emitir = (req, evento, data, opciones = {}) => {
  const io = req.app.get("io");
  if (!io) return;

  const { room } = opciones;

  if (room) {
    io.to(room).emit(evento, data);
  } else {
    io.emit(evento, data);
  }
};

/**
 * ESTADOS DE VIAJE (según tu BD + nuevos):
 * 1: Asignado
 * 2: En Curso
 * 3: Cancelado
 * 4: Finalizado
 * 5: Buscando
 * 6: En camino al encuentro
 * 7: Esperando pasajero
 */

const ESTADOS = {
  ASIGNADO: 1,
  EN_CURSO: 2,
  CANCELADO: 3,
  FINALIZADO: 4,
  BUSCANDO: 5,
  EN_CAMINO_ENCUENTRO: 6,
  ESPERANDO_PASAJERO: 7,
};

const getEstado = (v) => Number(v?.id_estado ?? v?.estado ?? v?.id_estado_viajes ?? 0);

const numOrNull = (x) => (x == null ? null : Number(x));
const strOrEmpty = (x) => (x == null ? "" : String(x));

const normalizarViajeSocket = (v, fallback = {}) => {
  // fallback puede traer origen_lat/origen_lng/direcciones cuando v es incompleto
  const latDesde = v?.lat_desde ?? fallback.origen_lat ?? fallback.lat_desde;
  const lonDesde = v?.lon_desde ?? fallback.origen_lng ?? fallback.lon_desde;
  const latHasta = v?.lat_hasta ?? fallback.destino_lat ?? fallback.lat_hasta;
  const lonHasta = v?.lon_hasta ?? fallback.destino_lng ?? fallback.lon_hasta;

  const direccionDesde = v?.direccion_desde ?? fallback.direccion_origen ?? "";
  const direccionHasta = v?.direccion_hasta ?? fallback.direccion_destino ?? "";

  const modoCobro = (v?.modo_cobro ?? "PACTADO").toString().toUpperCase();

  // precio fijo: preferimos precio_pactado, y precio_final debe estar congelado en PACTADO
  const precioPactado = numOrNull(v?.precio_pactado);
  const precioFinal = numOrNull(v?.precio_final);
  const precioEstimado = v?.precio_estimado == null ? null : Number(v?.precio_estimado);

  return {
    ...v,

    // ✅ claves nuevas
    modo_cobro: modoCobro,
    precio_pactado: precioPactado,
    precio_final: precioFinal,
    precio_estimado: precioEstimado,

    // ✅ claves estándar (nuevas)
    id_viajes: numOrNull(v?.id_viajes),
    id_pasajero: numOrNull(v?.id_pasajero),
    id_conductor: v?.id_conductor == null ? null : Number(v?.id_conductor),

    direccion_desde: strOrEmpty(direccionDesde),
    direccion_hasta: strOrEmpty(direccionHasta),

    lat_desde: latDesde == null ? null : Number(latDesde),
    lon_desde: lonDesde == null ? null : Number(lonDesde),
    lat_hasta: latHasta == null ? null : Number(latHasta),
    lon_hasta: lonHasta == null ? null : Number(lonHasta),

    // ✅ compat vieja (Flutter viejo/otros listeners)
    latDesde: latDesde == null ? null : Number(latDesde),
    lonDesde: lonDesde == null ? null : Number(lonDesde),
    latHasta: latHasta == null ? null : Number(latHasta),
    lonHasta: lonHasta == null ? null : Number(lonHasta),
    direccionDesde: strOrEmpty(direccionDesde),
    direccionHasta: strOrEmpty(direccionHasta),
  };
};

const getPerfilPublicoPasajero = async (connection, idPasajero) => {
  const pasajeroId = Number(idPasajero);

  // 1️⃣ Viajes completados
  const [countRows] = await connection.execute(
    `SELECT COUNT(*) AS viajes_totales
     FROM viajes
     WHERE id_pasajero = ? AND id_estado = 4`,
    [pasajeroId]
  );

  const viajesTotales = Number(countRows?.[0]?.viajes_totales ?? 0);

  // 2️⃣ Nombre y apellido (tu tabla real)
  const [userRows] = await connection.execute(
    `SELECT nombre_usuario, apellido_usuario
     FROM usuarios
     WHERE id_usuario = ?
     LIMIT 1`,
    [pasajeroId]
  );

  const u = userRows?.[0] ?? {};

  // 3️⃣ Rating promedio (si todavía no tenés tabla, queda 0)
  let rating = 0;

  try {
    const [ratingRows] = await connection.execute(
      `SELECT AVG(calificacion) AS rating
       FROM calificaciones
       WHERE id_pasajero = ?`,
      [pasajeroId]
    );

    rating = Number(ratingRows?.[0]?.rating ?? 0);
  } catch (e) {
    // Si todavía no existe la tabla calificaciones
    rating = 0;
  }

  return {
    nombre: String(u.nombre_usuario ?? ""),
    apellido: String(u.apellido_usuario ?? ""),
    rating: Number(rating.toFixed(1)),
    viajes_totales: viajesTotales,
  };
};
/** POST /viajes/iniciarViaje */
export const iniciarViaje = async (req, res) => {
  let connection;
  try {
    const {
      id_usuario,
      origen_lat,
      origen_lng,
      destino_lat = null,
      destino_lng = null,
      direccion_origen = null,
      direccion_destino = null,
      precio_estimado = null, // lo seguimos recibiendo igual
    } = req.body;

    if (!id_usuario || origen_lat == null || origen_lng == null) {
      return res.status(400).json({
        message: "Faltan datos obligatorios (id_usuario, origen_lat, origen_lng)",
      });
    }

    connection = await conectarBDMySql();

    // ✅ 0) Buscar tarifa vigente
    const [tarRows] = await connection.execute(
      `SELECT id_tarifa, base, por_km, por_min, minimo, fecha_inicio
       FROM tarifas
       WHERE activa = 1
       ORDER BY fecha_inicio DESC, id_tarifa DESC
       LIMIT 1`
    );

    if (!tarRows || tarRows.length === 0) {
      return res.status(404).json({
        message: "No hay tarifa vigente activa. No se puede iniciar el viaje.",
      });
    }

    const tarifa = tarRows[0];
    const id_tarifa = tarifa.id_tarifa;

    // ✅ Normalizar precios
    const precioPactado = Number(precio_estimado ?? 0);
    const modoCobro = "PACTADO";

    // ✅ 1) Insertar viaje (estado BUSCANDO)
    // 🔥 Ahora guardamos: modo_cobro + precio_pactado + precio_final congelado
    const [result] = await connection.execute(
      `INSERT INTO viajes
       (id_pasajero,
        id_conductor,
        direccion_desde, lat_desde, lon_desde,
        direccion_hasta, lat_hasta, lon_hasta,
        id_estado,
        id_tarifa,
        modo_cobro,
        precio_pactado,
        precio_estimado,
        precio_final)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id_usuario,
        null, // conductor todavía no asignado
        direccion_origen,
        origen_lat,
        origen_lng,
        direccion_destino,
        destino_lat,
        destino_lng,
        ESTADOS.BUSCANDO, // 5
        id_tarifa,
        modoCobro,        // ✅ PACTADO
        precioPactado,    // ✅ precio_pactado
        precioPactado, // ⚠️ tu columna precio_estimado es varchar(20), lo guardamos como string
        precioPactado,    // ✅ precio_final congelado desde el inicio
      ]
    );

    const id_viajes = result.insertId;

    // 2) Traer el registro completo recién creado
    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id_viajes]
    );

    if (!rows || rows.length === 0) {
      return res.status(500).json({
        message: "No se encontró el viaje recién insertado.",
      });
    }

    const v = rows[0];

    // ✅ Traer info pública del pasajero
const pasajeroInfo = await getPerfilPublicoPasajero(connection, v.id_pasajero ?? id_usuario);

    // ✅ Seguridad extra por si algo vino null
    const precioPactadoSeguro = Number(v.precio_pactado ?? precioPactado ?? 0);
    const precioFinalSeguro =
      v.precio_final == null ? precioPactadoSeguro : Number(v.precio_final);

    // 3) Normalizar payload socket (manteniendo compatibilidad)
    const payloadSocket = {
      id_viajes: v.id_viajes ?? id_viajes,
      id_pasajero: v.id_pasajero ?? id_usuario,
      id_conductor: v.id_conductor ?? null,

      direccion_desde: v.direccion_desde ?? direccion_origen ?? "",
      lat_desde: Number(v.lat_desde ?? origen_lat),
      lon_desde: Number(v.lon_desde ?? origen_lng),

      direccion_hasta: v.direccion_hasta ?? direccion_destino ?? "",
      lat_hasta: v.lat_hasta == null ? null : Number(v.lat_hasta),
      lon_hasta: v.lon_hasta == null ? null : Number(v.lon_hasta),

      hora_inicio: v.hora_inicio ?? v.fecha_inicio ?? null,
      hora_fin: v.hora_fin ?? v.fecha_fin ?? null,

      // ✅ NUEVO: lo que te interesa para precio fijo
      modo_cobro: v.modo_cobro ?? modoCobro,
      precio_pactado: precioPactadoSeguro,
      precio_final: precioFinalSeguro,

      // ✅ COMPAT: seguimos enviando "precio_estimado"
      // (si el pasajero todavía muestra "estimado", ahora puede usar precio_pactado)
      precio_estimado: Number(v.precio_estimado ?? precioPactadoSeguro ?? 0),

      id_estado: v.id_estado ?? ESTADOS.BUSCANDO,
      id_tarifa: v.id_tarifa ?? id_tarifa,

      // Compat keys viejas
      latDesde: Number(v.lat_desde ?? origen_lat),
      lonDesde: Number(v.lon_desde ?? origen_lng),
      latHasta: v.lat_hasta == null ? null : Number(v.lat_hasta),
      lonHasta: v.lon_hasta == null ? null : Number(v.lon_hasta),
      direccionDesde: v.direccion_desde ?? direccion_origen ?? "",
      direccionHasta: v.direccion_hasta ?? direccion_destino ?? "",

            // ✅ Info pasajero para el conductor
      pasajero: pasajeroInfo,

      // ✅ Compat plano (por si algún front lo espera sin "pasajero")
      nombre: pasajeroInfo.nombre,
      apellido: pasajeroInfo.apellido,
      rating: pasajeroInfo.rating,
      viajes_totales: pasajeroInfo.viajes_totales,
    };

    // 4) Emitir SOLO a room conductores
    const io = req.app.get("io");
    if (io) {
      const conductoresRoom = io.sockets.adapter.rooms.get("conductores");
      const cantidadConductores = conductoresRoom ? conductoresRoom.size : 0;

      console.log(
        `📢 [iniciarViaje] Emitiendo viaje_creado a ${cantidadConductores} conductores`
      );
      emitir(req, "viaje_creado", payloadSocket, { room: "conductores" });
    }

    // 5) Notificar al pasajero
    emitir(req, "viaje_buscando_conductor", payloadSocket, {
      room: `pasajero_${id_usuario}`,
    });

    // 6) Responder al pasajero
    return res.status(201).json({
      ok: true,
      result: v,
      tarifa_vigente: tarifa,
      message: "Viaje iniciado en estado 'Buscando'.",
    });
  } catch (error) {
    console.error("❌ iniciarViaje:", error);
    return res
      .status(500)
      .json({ message: "Error al iniciar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};



/** PUT /viajes/:id/aceptar (asignarConductor) */
export const asignarConductor = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return res.status(400).json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    // ✅ UPDATE ATÓMICO: solo asigna si sigue libre y en estado 5 (Buscando)
    const [update] = await connection.execute(
      `UPDATE viajes
       SET id_conductor = ?, id_estado = ?
       WHERE id_viajes = ?
         AND id_estado = ?
         AND (id_conductor IS NULL OR id_conductor = 0)`,
      [id_conductor, ESTADOS.ASIGNADO, id, ESTADOS.BUSCANDO]
    );

    if (!update || update.affectedRows === 0) {
      const [rows] = await connection.execute(
        "SELECT id_conductor, id_pasajero, id_estado FROM viajes WHERE id_viajes = ?",
        [id]
      );

      const v = rows?.[0];

      emitir(
        req,
        "viaje_ya_tomado",
        {
          id_viajes: Number(id),
          id_conductor_ganador: v?.id_conductor ?? null,
          id_estado: v?.id_estado ?? null,
        },
        { room: `conductor_${id_conductor}` }
      );

      return res.status(409).json({
        ok: false,
        code: "TAKEN",
        message: "Otro conductor ya aceptó este viaje.",
      });
    }

    // ✅ OK: asignado
    const [rows2] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

   const vFinal = rows2?.[0];

// ✅ Info pública del pasajero
const pasajeroInfo = await getPerfilPublicoPasajero(connection, vFinal.id_pasajero);

const payload = {
  ...normalizarViajeSocket(vFinal),
  pasajero: pasajeroInfo,
  nombre: pasajeroInfo.nombre,
  apellido: pasajeroInfo.apellido,
  rating: pasajeroInfo.rating,
  viajes_totales: pasajeroInfo.viajes_totales,
};

// Notificar al pasajero
emitir(req, "viaje_asignado", payload, {
  room: `pasajero_${vFinal.id_pasajero}`,
});

// Notificar al conductor ganador
emitir(req, "viaje_aceptado", payload, {
  room: `conductor_${id_conductor}`,
});

    // Notificar a todos que ya fue tomado
    emitir(
      req,
      "viaje_tomado",
      { id_viajes: Number(id), id_conductor_ganador: Number(id_conductor) },
      { room: "conductores" }
    );

    return res.json({
      ok: true,
      result: vFinal,
      message: "Conductor asignado. Viaje en estado 'Asignado'.",
    });
  } catch (error) {
    console.error("❌ asignarConductor:", error);
    return res
      .status(500)
      .json({ message: "Error al asignar conductor: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/rechazar - Rechazar viaje por parte del conductor */
export const rechazarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return res.status(400).json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    const [viajeAntes] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    if (!viajeAntes || viajeAntes.length === 0) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const viaje = viajeAntes[0];
    const estado = getEstado(viaje);

    // Solo puede rechazarse si está buscando
    if (estado !== ESTADOS.BUSCANDO) {
      return res.status(400).json({
        message: "El viaje no está en estado 'Buscando'",
      });
    }

    emitir(req, "viaje_rechazado", { id_viajes: Number(id), id_conductor }, {
      room: "conductores",
    });

    return res.json({
      message: "Viaje rechazado. Sigue disponible para otros conductores.",
    });
  } catch (error) {
    console.error("❌ rechazarViaje:", error);
    return res
      .status(500)
      .json({ message: "Error al rechazar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/actualizarUbicacion */
export const actualizarUbicacion = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { lat, lng, id_usuario, tipo } = req.body;

    if (lat == null || lng == null || !id_usuario || !tipo) {
      return res.status(400).json({
        message: "Faltan datos: lat, lng, id_usuario, tipo",
      });
    }

    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const viaje = rows[0];

    const payloadUbicacion = {
      id_viajes: Number(id),
      lat: Number(lat),
      lng: Number(lng),
      id_usuario,
      tipo,
      timestamp: new Date().toISOString(),
    };

    // ✅ Recomendación: unificar eventos a "ubicacion_en_tiempo_real"
    // para que tu frontend no tenga dos listeners distintos.
    // Emitimos al room del otro participante.
    if (tipo === "conductor" && viaje.id_pasajero) {
      emitir(req, "ubicacion_en_tiempo_real", payloadUbicacion, {
        room: `pasajero_${viaje.id_pasajero}`,
      });
      // Mantengo compat (si ya lo usás):
      emitir(req, "ubicacion_conductor_actualizada", payloadUbicacion, {
        room: `pasajero_${viaje.id_pasajero}`,
      });
    }

    if (tipo === "pasajero" && viaje.id_conductor) {
      emitir(req, "ubicacion_en_tiempo_real", payloadUbicacion, {
        room: `conductor_${viaje.id_conductor}`,
      });
      // Compat:
      emitir(req, "ubicacion_pasajero_actualizada", payloadUbicacion, {
        room: `conductor_${viaje.id_conductor}`,
      });
    }

    return res.json({
      message: "Ubicación actualizada",
      ubicacion: payloadUbicacion,
    });
  } catch (error) {
    console.error("❌ actualizarUbicacion:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar ubicación: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/enCamino - Conductor en camino al encuentro */
// controllers/viajesControllers.js (o donde lo tengas)

// import { getEstado, ESTADOS } from "../utils/estados.js"; // ejemplo

// ✅ Estados (solo muestro los que nos importan acá)
// Dejá tus otros estados tal cual los tengas.

export const enCaminoAlEncuentro = async (req, res) => {
  let connection;
  try {
    const idViaje = Number(req.params.id);
    const { id_conductor } = req.body;

    if (!Number.isFinite(idViaje) || idViaje <= 0) {
      return res.status(400).json({ ok: false, message: "id de viaje inválido" });
    }

    const conductorId = Number(id_conductor);
    if (!Number.isFinite(conductorId) || conductorId <= 0) {
      return res.status(400).json({ ok: false, message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    // Verifico que el viaje exista y esté asignado a este conductor
    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ? AND id_conductor = ? LIMIT 1",
      [idViaje, conductorId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Viaje no encontrado o no asignado a este conductor",
      });
    }

    const viaje = rows[0];

    // ✅ Si vos ya tenés getEstado(viaje) usalo.
    // Si no, normalmente se usa viaje.id_estado directo:
    const estadoActual = Number(viaje.id_estado);

    // Solo si está ASIGNADO
    if (estadoActual !== ESTADOS.ASIGNADO) {
      return res.status(400).json({
        ok: false,
        message: "El viaje debe estar en estado 'Asignado' para pasar a 'En camino'",
      });
    }

    // ✅ Paso a estado 6
    await connection.execute(
      "UPDATE viajes SET id_estado = ? WHERE id_viajes = ?",
      [ESTADOS.EN_CAMINO_ENCUENTRO, idViaje]
    );

    const [viajeActualizadoRows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ? LIMIT 1",
      [idViaje]
    );

    const v = viajeActualizadoRows?.[0];

    // ✅ Emitir eventos (si tenés la función emitir)
    // Pasajero
    emitir(req, "conductor_en_camino", v, { room: `pasajero_${v.id_pasajero}` });
    // Conductor
    // emitir(req, "vas_al_encuentro", v, { room: `conductor_${conductorId}` });

    return res.json({
      ok: true,
      message: "Conductor en camino al encuentro",
      data: v,
    });
  } catch (error) {
    console.error("❌ enCaminoAlEncuentro:", error);
    return res.status(500).json({ ok: false, message: "Error: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};


/** PUT /viajes/:id/llegarEncuentro - Conductor llegó al punto */
export const llegarEncuentro = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return res.status(400).json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ? AND id_conductor = ?",
      [id, id_conductor]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Viaje no encontrado o no asignado a este conductor",
      });
    }

    const viaje = rows[0];
    const estado = getEstado(viaje);

    // Debe estar en camino (6)
    if (estado !== ESTADOS.EN_CAMINO_ENCUENTRO) {
      return res.status(400).json({
        message: "El viaje no está en estado 'En camino al encuentro'",
      });
    }

    // Cambiar a esperando pasajero (7)
    await connection.execute(
      "UPDATE viajes SET id_estado = ? WHERE id_viajes = ?",
      [ESTADOS.ESPERANDO_PASAJERO, id]
    );

    const [viajeActualizado] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = viajeActualizado[0];

    const payload = normalizarViajeSocket(v);
emitir(req, "conductor_llego_encuentro", payload, { room: `pasajero_${v.id_pasajero}` });
emitir(req, "llegaste_encuentro", payload, { room: `conductor_${id_conductor}` });

    return res.json({
      result: v,
      message: "Conductor llegó al punto de encuentro. Esperando pasajero.",
    });
  } catch (error) {
    console.error("❌ llegarEncuentro:", error);
    return res
      .status(500)
      .json({ message: "Error al registrar llegada: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/comenzar - Comenzar viaje (solo cuando está esperando pasajero) */
export const comenzarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return res.status(400).json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ? AND id_conductor = ?",
      [id, id_conductor]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Viaje no encontrado o no asignado a este conductor",
      });
    }

    const viaje = rows[0];
    const estado = getEstado(viaje);

    // Debe estar esperando pasajero (7)
    if (estado !== ESTADOS.ESPERANDO_PASAJERO) {
      return res.status(400).json({
        message: "El viaje debe estar en estado 'Esperando pasajero' para comenzar",
      });
    }

    await connection.execute(
      "UPDATE viajes SET id_estado = ?, hora_inicio = NOW() WHERE id_viajes = ?",
      [ESTADOS.EN_CURSO, id]
    );

    const [viajeActualizado] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = viajeActualizado[0];

    const payload = normalizarViajeSocket(v);

// ✅ agregar compat extra
const payloadEnCurso = {
  ...payload,
  id_viaje: Number(v.id_viajes ?? id),   // <-- clave que muchos front usan
  id_viajes: Number(v.id_viajes ?? id),
  id_estado: Number(v.id_estado ?? ESTADOS.EN_CURSO),
};

const roomViaje = `viaje_${Number(v.id_viajes ?? id)}`;
const roomPasajero = `pasajero_${v.id_pasajero}`;

console.log("▶️ [comenzarViaje] emitiendo viaje_en_curso a:", roomPasajero, roomViaje);
emitir(req, "viaje_en_curso", payloadEnCurso, { room: roomPasajero });
emitir(req, "viaje_en_curso", payloadEnCurso, { room: roomViaje });
emitir(req, "viaje_en_curso", payloadEnCurso, { room: `conductor_${id_conductor}` });




    return res.json({ result: v, message: "Viaje en curso" });
  } catch (error) {
    console.error("❌ comenzarViaje:", error);
    return res
      .status(500)
      .json({ message: "Error al comenzar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/finalizar - Finalizar viaje */
export const finalizarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { id_conductor, precio_final = null } = req.body;

    if (!id_conductor) {
      return res.status(400).json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ? AND id_conductor = ?",
      [id, id_conductor]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Viaje no encontrado o no asignado a este conductor",
      });
    }

    const viaje = rows[0];
    const estado = getEstado(viaje);

    // Debe estar EN CURSO (2)
    if (estado !== ESTADOS.EN_CURSO) {
      return res.status(400).json({
        message: "El viaje debe estar en curso para finalizarlo",
      });
    }

    const modoCobro = (viaje.modo_cobro ?? "PACTADO").toString().toUpperCase();

    // ✅ Regla: si es PACTADO, el precio final queda fijo = precio_pactado
    // ✅ Si es TAXIMETRO, precio_final es obligatorio y lo setea el taxímetro
    let precioFinalASetear = null;

    if (modoCobro === "PACTADO") {
      // si no hay precio_pactado por algún motivo, caemos a lo que ya tenga precio_final/estimado
      const pactado = Number(viaje.precio_pactado ?? 0);
      const existente = Number(viaje.precio_final ?? 0);

      // Preferimos precio_pactado. Si está 0/null, mantenemos el existente.
      precioFinalASetear = pactado > 0 ? pactado : (existente > 0 ? existente : 0);
    } else {
      // TAXIMETRO
      const pf = Number(precio_final);
      if (!Number.isFinite(pf) || pf <= 0) {
        return res.status(400).json({
          message: "precio_final es requerido y debe ser > 0 para viajes TAXIMETRO",
        });
      }
      precioFinalASetear = pf;
    }

    await connection.execute(
      `
      UPDATE viajes
      SET id_estado = ?,
          hora_fin = NOW(),
          precio_final = ?
      WHERE id_viajes = ?
      `,
      [ESTADOS.FINALIZADO, precioFinalASetear, id]
    );

    // conductor disponible
    await connection.execute(
      "UPDATE conductores SET conectado = 1 WHERE id_usuario = ?",
      [id_conductor]
    );

    const [viajeActualizado] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = viajeActualizado[0];

    // ✅ Payload normalizado (sin romper compatibilidad)
    const payload = {
      ...v,

      // nuevos “claros”
      modo_cobro: v.modo_cobro ?? modoCobro,
      precio_pactado: v.precio_pactado == null ? null : Number(v.precio_pactado),
      precio_final: v.precio_final == null ? null : Number(v.precio_final),
      precio_estimado: v.precio_estimado == null ? null : Number(v.precio_estimado),

      // compat vieja (si tus pantallas escuchan estas keys)
      id_viajes: v.id_viajes,
      id_pasajero: v.id_pasajero,
      direccion_desde: v.direccion_desde,
      direccion_hasta: v.direccion_hasta,
      lat_desde: v.lat_desde == null ? null : Number(v.lat_desde),
      lon_desde: v.lon_desde == null ? null : Number(v.lon_desde),
      lat_hasta: v.lat_hasta == null ? null : Number(v.lat_hasta),
      lon_hasta: v.lon_hasta == null ? null : Number(v.lon_hasta),

      latDesde: v.lat_desde == null ? null : Number(v.lat_desde),
      lonDesde: v.lon_desde == null ? null : Number(v.lon_desde),
      latHasta: v.lat_hasta == null ? null : Number(v.lat_hasta),
      lonHasta: v.lon_hasta == null ? null : Number(v.lon_hasta),
      direccionDesde: v.direccion_desde ?? "",
      direccionHasta: v.direccion_hasta ?? "",
    };

    emitir(req, "viaje_finalizado", payload, { room: `pasajero_${v.id_pasajero}` });
    emitir(req, "viaje_completado", payload, { room: `conductor_${id_conductor}` });

    emitir(
      req,
      "conductor_disponible",
      { id_conductor, conectado: true },
      { room: "conductores" }
    );

    return res.json({
      result: v,
      message: "Viaje finalizado. Conductor disponible nuevamente.",
    });
  } catch (error) {
    console.error("❌ finalizarViaje:", error);
    return res
      .status(500)
      .json({ message: "Error al finalizar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};


/** PUT /viajes/:id/cancelar - Cancelar viaje (pasajero o conductor) */
export const cancelarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { id_usuario, tipo } = req.body;

    if (!id_usuario || !tipo) {
      return res.status(400).json({
        message: "id_usuario y tipo (pasajero/conductor) son requeridos",
      });
    }

    connection = await conectarBDMySql();

    const [rowsAntes] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    if (!rowsAntes || rowsAntes.length === 0) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const vAntes = rowsAntes[0];
    const estadoAnterior = getEstado(vAntes);

    // permisos
    if (tipo === "pasajero" && Number(vAntes.id_pasajero) !== Number(id_usuario)) {
      return res.status(403).json({ message: "No tienes permiso para cancelar este viaje" });
    }
    if (tipo === "conductor" && Number(vAntes.id_conductor) !== Number(id_usuario)) {
      return res.status(403).json({ message: "No tienes permiso para cancelar este viaje" });
    }

    // no cancelar si finalizado o cancelado
    if (estadoAnterior === ESTADOS.FINALIZADO || estadoAnterior === ESTADOS.CANCELADO) {
      return res.status(400).json({
        message: "No se puede cancelar un viaje finalizado o ya cancelado",
      });
    }

    // si cancela pasajero => cancelar y avisar
    if (tipo === "pasajero") {
      await connection.execute(
        `UPDATE viajes SET id_estado = ?, hora_fin = NOW() WHERE id_viajes = ?`,
        [ESTADOS.CANCELADO, id]
      );

      const [rowsDespues] = await connection.execute(
        "SELECT * FROM viajes WHERE id_viajes = ?",
        [id]
      );
      const v = rowsDespues[0];
      const payload = normalizarViajeSocket(v);
      // si estaba buscando (5) => avisar conductores para quitarlo
      if (estadoAnterior === ESTADOS.BUSCANDO) {
        emitir(req, "viaje_cancelado_busqueda", { id_viajes: Number(id) }, { room: "conductores" });
      } else {
        // si ya había conductor, avisarle y liberarlo
        if (v.id_conductor) {
          emitir(req, "viaje_cancelado_pasajero", payload, { room: `conductor_${v.id_conductor}` });

          await connection.execute(
            "UPDATE conductores SET conectado = 1 WHERE id_usuario = ?",
            [payload.id_conductor]
          );
          emitir(req, "conductor_disponible", { id_conductor: payload.id_conductor, conectado: true }, { room: "conductores" });
        }
      }

      // avisar pasajero
      emitir(req, "viaje_cancelado", payload, { room: `pasajero_${v.id_pasajero}` });

      return res.json({ ok: true, message: "Viaje cancelado por pasajero", viaje: v });
    }

    // si cancela conductor:
    if (tipo === "conductor") {
      // si estaba asignado/en camino/esperando => vuelve a buscar conductor
      if (
        estadoAnterior === ESTADOS.ASIGNADO ||
        estadoAnterior === ESTADOS.EN_CAMINO_ENCUENTRO ||
        estadoAnterior === ESTADOS.ESPERANDO_PASAJERO
      ) {
        await connection.execute(
          `UPDATE viajes
           SET id_estado = ?, id_conductor = NULL
           WHERE id_viajes = ?`,
          [ESTADOS.BUSCANDO, id]
        );

        const [viajeActualizado] = await connection.execute(
          "SELECT * FROM viajes WHERE id_viajes = ?",
          [id]
        );
        const vActualizado = viajeActualizado[0];

        // avisar pasajero
        emitir(req, "viaje_buscando_conductor", normalizarViajeSocket(vActualizado), {
          room: `pasajero_${vActualizado.id_pasajero}`,
        });

        // avisar a conductores
        emitir(req, "viaje_creado", normalizarViajeSocket(vActualizado), { room: "conductores" });

        // liberar conductor
        await connection.execute(
          "UPDATE conductores SET conectado = 1 WHERE id_usuario = ?",
          [id_usuario]
        );
        emitir(req, "conductor_disponible", { id_conductor: id_usuario, conectado: true }, { room: "conductores" });

        return res.json({
          ok: true,
          message: "Conductor canceló. Viaje vuelve a 'Buscando'.",
          viaje: vActualizado,
        });
      }

      // si estaba en curso (2) y cancela conductor => lo cancelamos (3)
      if (estadoAnterior === ESTADOS.EN_CURSO) {
        await connection.execute(
          `UPDATE viajes SET id_estado = ?, hora_fin = NOW() WHERE id_viajes = ?`,
          [ESTADOS.CANCELADO, id]
        );

        const [rowsDespues] = await connection.execute(
          "SELECT * FROM viajes WHERE id_viajes = ?",
          [id]
        );
        const v = rowsDespues[0];

        emitir(req, "viaje_cancelado", v, { room: `pasajero_${v.id_pasajero}` });
        emitir(req, "viaje_cancelado_conductor", v, { room: `conductor_${id_usuario}` });

        // liberar conductor
        await connection.execute(
          "UPDATE conductores SET conectado = 1 WHERE id_usuario = ?",
          [id_usuario]
        );
        emitir(req, "conductor_disponible", { id_conductor: id_usuario, conectado: true }, { room: "conductores" });

        return res.json({ ok: true, message: "Viaje cancelado en curso por conductor", viaje: v });
      }
    }

    return res.status(400).json({ ok: false, message: "No se pudo cancelar con el estado actual" });
  } catch (error) {
    console.error("❌ cancelarViaje:", error);
    return res.status(500).json({ message: "Error al cancelar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** GET /viajes/activo/:tipo/:id_usuario */
export const getViajeActivo = async (req, res) => {
  let connection;
  try {
    const { tipo, id_usuario } = req.params;

    const idUsuario = Number(id_usuario);
    if (!idUsuario || Number.isNaN(idUsuario)) {
      return res.status(400).json({ ok: false, message: "id_usuario inválido" });
    }

    if (tipo !== "pasajero" && tipo !== "conductor") {
      return res.status(400).json({ ok: false, message: "tipo debe ser 'pasajero' o 'conductor'" });
    }

    connection = await conectarBDMySql();

    // Estados activos = no finalizado ni cancelado
    const estadosActivos = [
      ESTADOS.BUSCANDO,             // 5
      ESTADOS.ASIGNADO,             // 1
      ESTADOS.EN_CAMINO_ENCUENTRO,  // 6
      ESTADOS.ESPERANDO_PASAJERO,   // 7
      ESTADOS.EN_CURSO,             // 2
    ];

    let sql = "";
    let params = [];

    if (tipo === "pasajero") {
      sql = `
        SELECT *
        FROM viajes
        WHERE id_pasajero = ?
          AND id_estado IN (${estadosActivos.map(() => "?").join(",")})
        ORDER BY id_viajes DESC
        LIMIT 1
      `;
      params = [idUsuario, ...estadosActivos];
    } else {
      sql = `
        SELECT *
        FROM viajes
        WHERE id_conductor = ?
          AND id_estado IN (${estadosActivos.map(() => "?").join(",")})
        ORDER BY id_viajes DESC
        LIMIT 1
      `;
      params = [idUsuario, ...estadosActivos];
    }

    const [rows] = await connection.execute(sql, params);

    if (!rows || rows.length === 0) {
      return res.json({ ok: true, data: null });
    }

    return res.json({ ok: true, data: normalizarViajeSocket(rows[0]) });
  } catch (error) {
    console.error("❌ getViajeActivo:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** GET /viajes/historial/:id_usuario  (Historial pasajero) */
export const getHistorialViajesUsuario = async (req, res) => {
  let connection;
  try {
    const idUsuario = Number(req.params.id_usuario);

    if (!Number.isFinite(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({ ok: false, message: "id_usuario inválido" });
    }

    connection = await conectarBDMySql();

    const sql = `
      SELECT
        v.id_viajes,
        v.id_pasajero,
        v.id_conductor,

        v.direccion_desde  AS direccion_origen,
        v.lat_desde        AS origen_lat,
        v.lon_desde        AS origen_lng,

        v.direccion_hasta  AS direccion_destino,
        v.lat_hasta        AS destino_lat,
        v.lon_hasta        AS destino_lng,

        v.hora_inicio,
        v.hora_fin,
        
        v.modo_cobro,
        v.precio_pactado,

        v.id_estado,
        CASE v.id_estado
          WHEN 1 THEN 'asignado'
          WHEN 2 THEN 'en curso'
          WHEN 3 THEN 'cancelado'
          WHEN 4 THEN 'finalizado'
          WHEN 5 THEN 'buscando'
          WHEN 6 THEN 'en camino al encuentro'
          WHEN 7 THEN 'esperando pasajero'
          ELSE 'desconocido'
        END AS estado,

        v.id_tarifa,
        v.precio_estimado,
        v.precio_final,

        -- ✅ Datos conductor (si existe)
        u.nombre_usuario    AS conductor_nombre,
        u.apellido_usuario  AS conductor_apellido,
        u.telefono_usuario  AS telefono_conductor,
        u.email_usuario     AS email_conductor,
        u.foto_perfil       AS foto_perfil_conductor,

        c.id_conductor,
        c.matricula         AS patente,
        c.marca_vehiculo,
        c.modelo_vehiculo,
        c.foto_conductor    AS foto_conductor,
        c.foto_vehiculo     AS foto_vehiculo

      FROM viajes v
      LEFT JOIN usuarios u
        ON u.id_usuario = v.id_conductor
      LEFT JOIN conductores c
        ON c.id_usuario = v.id_conductor

      WHERE v.id_pasajero = ?
      ORDER BY v.id_viajes DESC
      LIMIT 200
    `;

    const [rows] = await connection.execute(sql, [idUsuario]);

    return res.json({ ok: true, data: rows || [] });
  } catch (error) {
    console.error("❌ getHistorialViajesUsuario:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** GET /viajes/historialConductor/:id_usuario  (Historial conductor) */
export const getHistorialViajesConductor = async (req, res) => {
  let connection;
  try {
    const idUsuario = Number(req.params.id_usuario);

    if (!Number.isFinite(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({ ok: false, message: "id_usuario inválido" });
    }

    connection = await conectarBDMySql();

    const sql = `
      SELECT
        v.id_viajes,
        v.id_pasajero,
        v.id_conductor,

        v.direccion_desde  AS direccion_origen,
        v.lat_desde        AS origen_lat,
        v.lon_desde        AS origen_lng,

        v.direccion_hasta  AS direccion_destino,
        v.lat_hasta        AS destino_lat,
        v.lon_hasta        AS destino_lng,

        v.hora_inicio,
        v.hora_fin,

        v.id_estado,
        CASE v.id_estado
          WHEN 1 THEN 'asignado'
          WHEN 2 THEN 'en curso'
          WHEN 3 THEN 'cancelado'
          WHEN 4 THEN 'finalizado'
          WHEN 5 THEN 'buscando'
          WHEN 6 THEN 'en camino al encuentro'
          WHEN 7 THEN 'esperando pasajero'
          ELSE 'desconocido'
        END AS estado,

        v.id_tarifa,
        v.precio_estimado,
        v.precio_final,

        -- ✅ Datos del pasajero (usuarios)
        u.nombre_usuario    AS pasajero_nombre,
        u.apellido_usuario  AS pasajero_apellido,
        u.telefono_usuario  AS pasajero_telefono,
        u.email_usuario     AS pasajero_email,
        u.foto_perfil       AS pasajero_foto

      FROM viajes v
      LEFT JOIN usuarios u
        ON u.id_usuario = v.id_pasajero

      WHERE v.id_conductor = ?
      ORDER BY v.id_viajes DESC
      LIMIT 200
    `;

    const [rows] = await connection.execute(sql, [idUsuario]);

    return res.json({ ok: true, data: rows || [] });
  } catch (error) {
    console.error("❌ getHistorialViajesConductor:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** GET /viajes/:id/detalle  (detalle + conductor/pasajero) */
export const getDetalleViaje = async (req, res) => {
  let connection;
  try {
    const idViaje = Number(req.params.id);
    if (!Number.isFinite(idViaje) || idViaje <= 0) {
      return res.status(400).json({ ok: false, message: "id inválido" });
    }

    connection = await conectarBDMySql();

    // Trae viaje + nombre/apellido del pasajero y conductor (si existe)
    const [rows] = await connection.execute(
      `
      SELECT
        v.*,

        up.nombre_usuario   AS pasajero_nombre,
        up.apellido_usuario AS pasajero_apellido,

        uc.nombre_usuario   AS conductor_nombre,
        uc.apellido_usuario AS conductor_apellido

      FROM viajes v
      LEFT JOIN usuarios up ON up.id_usuario = v.id_pasajero
      LEFT JOIN usuarios uc ON uc.id_usuario = v.id_conductor
      WHERE v.id_viajes = ?
      LIMIT 1
      `,
      [idViaje]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Viaje no encontrado" });
    }

    const r = rows[0];

    return res.json({
      ok: true,
      data: {
        ...normalizarViajeSocket(r),
        pasajero: {
          id_usuario: r.id_pasajero,
          nombre: r.pasajero_nombre ?? "",
          apellido: r.pasajero_apellido ?? "",
        },
        conductor: r.id_conductor
          ? {
              id_usuario: r.id_conductor,
              nombre: r.conductor_nombre ?? "",
              apellido: r.conductor_apellido ?? "",
            }
          : null,
      },
    });
  } catch (e) {
    console.error("❌ getDetalleViaje:", e);
    return res.status(500).json({ ok: false, message: e.message });
  } finally {
    if (connection) await connection.end();
  }
};