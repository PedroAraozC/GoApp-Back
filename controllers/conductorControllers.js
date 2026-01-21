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

    const [rows] = await connection.execute(
      `
      SELECT 
        u.nombre_usuario   AS nombre_usuario,
        u.apellido_usuario AS apellido_usuario,
        u.foto_perfil      AS foto_url,

        c.matricula       AS matricula,
        c.marca_vehiculo  AS marca_vehiculo,
        c.modelo_vehiculo AS modelo_vehiculo,

        -- ✅ CAMBIO ACÁ (antes era c.created_at)
        u.fecha_carga AS created_at,

        v.id_estado_validacion AS id_estado_validacion,
        e.nombre_estado AS nombre_estado
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
    console.log("🧾 ROW carnet:", row);

    // Viajes totales (ojo si viajes.id_conductor NO es id_usuario)
    let viajesTotales = 0;
    try {
      const [v] = await connection.execute(
        `SELECT COUNT(*) AS total FROM viajes WHERE id_conductor = ?`,
        [idUsuario]
      );
      viajesTotales = v?.[0]?.total ?? 0;
    } catch (e) {
      console.log("⚠️ Error contando viajes:", e.message);
    }

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
      foto_url: row.foto_url ?? "",
      patente: row.matricula ?? "",
      modelo_vehiculo: row.modelo_vehiculo ?? row.marca_vehiculo ?? "",
      color_vehiculo: "",
      rating: 0,
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
