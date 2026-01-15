// controllers/conductorControllers.js
const { conectarBDMySql } = require("../config/dbMYSQL");

// Helper para emitir por socket (con o sin room)
const emitir = (req, evento, data, room = null) => {
  const io = req.app.get("io");
  if (!io) return;

  if (room) {
    io.to(room).emit(evento, data);
  } else {
    io.emit(evento, data);
  }
};

const obtenerConductores = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();
    const [rows] = await connection.execute("SELECT * FROM conductores");
    return res.json({ result: rows });
  } catch (error) {
    console.error("❌ Hubo un error en obtenerConductores:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener conductores: " + error.message });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

/**
 * PUT /conductores/cambiarEstado
 * Body esperado desde el front:
 *  {
 *    "id_conductor": 123,
 *    "conectado": true  // o 1 para conectado, false/0 para desconectado
 *  }
 */
const cambiarEstadoConductor = async (req, res) => {
  let connection;
  try {
    const { id_usuario, conectado } = req.body;

    if (!id_usuario) {
      return res
        .status(400)
        .json({ message: "id_usuario es requerido en el body" });
    }

    // Normalizamos el valor a 0/1
    const valorConectado =
      conectado === true ||
      conectado === 1 ||
      conectado === "1" ||
      conectado === "true"
        ? 1
        : 0;

    connection = await conectarBDMySql();

    const [result] = await connection.execute(
      "UPDATE conductores SET conectado = ? WHERE id_usuario = ?",
      [valorConectado, id_usuario]
    );

    // Podés consultar el registro actualizado si querés devolverlo
    const [rows] = await connection.execute(
      "SELECT * FROM conductores WHERE id_usuario = ?",
      [id_usuario]
    );

    const conductorActualizado = rows[0] || null;

    // 🔊 Emitimos evento por socket:
    //   - A todos en la room "conductores" (por ejemplo, panel admin o monitores)
    //   - También podrías emitir globalmente si querés que lo vean pasajeros, etc.
    emitir(
      req,
      "conductor_estado_actualizado",
      {
        id_usuario,
        conectado: valorConectado === 1,
        conductor: conductorActualizado,
      },
      "conductores" // room donde están conectados los choferes
    );

    return res.json({
      message: "Estado del conductor actualizado",
      result: conductorActualizado,
    });
  } catch (error) {
    console.error("❌ Hubo un error en cambiarEstadoConductor:", error);
    return res
      .status(500)
      .json({ message: "Error al cambiar estado: " + error.message });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// GET /conductores/:idUsuario/carnet
const obtenerCarnetConductor = async (req, res) => {
  let connection;
  try {
    const { idUsuario } = req.params;

    if (!idUsuario) {
      return res.status(400).json({ message: "idUsuario es requerido" });
    }

    connection = await conectarBDMySql();

    // Ajustado a los campos que se ven en tu conductoresControllers.js (plural):
    // - usuarios: nombre_usuario, apellido_usuario
    // - conductores: modelo_vehiculo / marca_vehiculo / matricula (según tu DB)
    const [rows] = await connection.execute(
      `
      SELECT 
        u.nombre_usuario,
        u.apellido_usuario,
        c.matricula,
        c.marca_vehiculo,
        c.modelo_vehiculo,
        v.id_estado_validacion,
        e.nombre_estado,
        u.created_at
      FROM conductores c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN validacion_conductor v ON c.id_usuario = v.id_usuario
      LEFT JOIN estado_validacion e ON v.id_estado_validacion = e.id_estado_validacion
      WHERE c.id_usuario = ?
      LIMIT 1
      `,
      [idUsuario]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Conductor no encontrado" });
    }

    const row = rows[0];

    // Viajes totales (si tu viajes.id_conductor guarda id_usuario)
    let viajesTotales = 0;
    try {
      const [v] = await connection.execute(
        `SELECT COUNT(*) AS total FROM viajes WHERE id_conductor = ?`,
        [idUsuario]
      );
      viajesTotales = v?.[0]?.total ?? 0;
    } catch (_) {}

    // Verificado: ajustá si tu tabla usa otro valor
    const estadoTxt = (row.nombre_estado || "").toString().toLowerCase();
    const verificado =
      row.id_estado_validacion === 2 ||
      estadoTxt.includes("aprob") ||
      estadoTxt.includes("valid") ||
      estadoTxt.includes("acept");

    const fechaIngreso = row.created_at
      ? new Date(row.created_at).toISOString().split("T")[0]
      : "";

    const data = {
      nombre: row.nombre_usuario ?? "",
      apellido: row.apellido_usuario ?? "",
      foto_url: "", // si tenés foto en usuarios, poné el campo acá
      patente: row.matricula ?? "", // en tu DB lo vi como matricula
      modelo_vehiculo: row.modelo_vehiculo ?? row.marca_vehiculo ?? "",
      color_vehiculo: "", // si no existe, queda vacío y Flutter lo normaliza
      rating: 0, // si no tenés tabla de calificaciones, queda 0
      viajes_totales: viajesTotales,
      fecha_ingreso: fechaIngreso,
      verificado,
    };

    return res.json({ ok: true, data });
  } catch (error) {
    console.error("❌ Error en obtenerCarnetConductor:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener carnet: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};



module.exports = {
  obtenerConductores,
  cambiarEstadoConductor,
  obtenerCarnetConductor,
};
