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
        .json({ message: "id_conductor es requerido en el body" });
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
        id_conductor,
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

module.exports = {
  obtenerConductores,
  cambiarEstadoConductor,
};
