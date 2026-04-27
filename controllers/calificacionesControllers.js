import { conectarBDMySql } from "../config/dbMYSQL.js";

// helper emitir (si querés usar sockets igual que en viajesControllers)
const emitir = (req, evento, data, opciones = {}) => {
  const io = req.app.get("io");
  if (!io) return;
  const { room } = opciones;
  if (room) io.to(room).emit(evento, data);
  else io.emit(evento, data);
};

const TIPOS = new Set(["PASAJERO_A_CONDUCTOR", "CONDUCTOR_A_PASAJERO"]);

export const crearCalificacion = async (req, res) => {
  let connection;
  try {
    const {
      id_viaje,
      id_calificador,
      tipo,
      calificacion,
      comentario = null,
    } = req.body;

    const idViaje = Number(id_viaje);
    const idCalificador = Number(id_calificador);
    const estrellas = Number(calificacion);

    if (!Number.isFinite(idViaje) || idViaje <= 0) {
      return res.status(400).json({ ok: false, message: "id_viaje inválido" });
    }
    if (!Number.isFinite(idCalificador) || idCalificador <= 0) {
      return res.status(400).json({ ok: false, message: "id_calificador inválido" });
    }
    if (!TIPOS.has(String(tipo))) {
      return res.status(400).json({ ok: false, message: "tipo inválido" });
    }
    if (!Number.isFinite(estrellas) || estrellas < 1 || estrellas > 5) {
      return res.status(400).json({ ok: false, message: "calificacion debe ser 1..5" });
    }

    connection = await conectarBDMySql();

    // 1) Traer viaje y validar finalizado
    const [viajeRows] = await connection.execute(
      `SELECT id_viajes, id_pasajero, id_conductor, id_estado
       FROM viajes
       WHERE id_viajes = ?
       LIMIT 1`,
      [idViaje]
    );

    const v = viajeRows?.[0];
    if (!v) {
      return res.status(404).json({ ok: false, message: "Viaje no encontrado" });
    }

    // Finalizado = 4 (según tu enum ESTADOS)
    if (Number(v.id_estado) !== 4) {
      return res.status(400).json({
        ok: false,
        message: "El viaje debe estar FINALIZADO para calificar",
      });
    }

    const idPasajero = Number(v.id_pasajero);
    const idConductor = Number(v.id_conductor);

    if (!idPasajero || !idConductor) {
      return res.status(400).json({
        ok: false,
        message: "El viaje debe tener pasajero y conductor asignados",
      });
    }

    // 2) Validar quién puede calificar según tipo
    if (tipo === "CONDUCTOR_A_PASAJERO" && idCalificador !== idConductor) {
      return res.status(403).json({
        ok: false,
        message: "Solo el conductor del viaje puede calificar al pasajero",
      });
    }
    if (tipo === "PASAJERO_A_CONDUCTOR" && idCalificador !== idPasajero) {
      return res.status(403).json({
        ok: false,
        message: "Solo el pasajero del viaje puede calificar al conductor",
      });
    }

    // 3) Insert (evita duplicados con UNIQUE)
    try {
      const [ins] = await connection.execute(
        `INSERT INTO calificaciones
         (id_viaje, id_pasajero, id_conductor, tipo, calificacion, comentario)
         VALUES (?,?,?,?,?,?)`,
        [idViaje, idPasajero, idConductor, tipo, estrellas, comentario]
      );

      // 4) Calcular promedio del calificado (para mostrar en UI)
      // - si conductor califica pasajero => rating pasajero
      // - si pasajero califica conductor => rating conductor
      const ratingSQL =
        tipo === "CONDUCTOR_A_PASAJERO"
          ? `SELECT AVG(calificacion) AS rating
             FROM calificaciones
             WHERE id_pasajero = ? AND tipo = 'CONDUCTOR_A_PASAJERO'`
          : `SELECT AVG(calificacion) AS rating
             FROM calificaciones
             WHERE id_conductor = ? AND tipo = 'PASAJERO_A_CONDUCTOR'`;

      const ratingParam = tipo === "CONDUCTOR_A_PASAJERO" ? idPasajero : idConductor;
      const [avgRows] = await connection.execute(ratingSQL, [ratingParam]);
      const rating = Number(avgRows?.[0]?.rating ?? 0);

      const payload = {
        ok: true,
        id_calificacion: ins.insertId,
        id_viaje: idViaje,
        tipo,
        calificacion: estrellas,
        comentario,
        rating_promedio: Number(rating.toFixed(2)),
      };

      // 5) (Opcional) Emitir por socket para disparar UI / actualizar perfil
      // Aviso al otro participante y al calificador
      emitir(req, "calificacion_guardada", payload, { room: `pasajero_${idPasajero}` });
      emitir(req, "calificacion_guardada", payload, { room: `conductor_${idConductor}` });

      return res.status(201).json(payload);
    } catch (err) {
      // Duplicado (uq_calificacion_unica)
      if (err?.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          ok: false,
          code: "DUPLICATE",
          message: "Ya existe una calificación para este viaje y tipo",
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("❌ crearCalificacion:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};