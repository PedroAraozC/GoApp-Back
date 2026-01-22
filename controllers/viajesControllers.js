// controllers/viajesControllers.js
const { conectarBDMySql } = require("../config/dbMYSQL");

// Helper para emitir eventos por Socket.IO (con room opcional)
const emitir = (req, evento, data, opciones = {}) => {
  const io = req.app.get("io");
  if (!io) return;

  const { room } = opciones;

  if (room) {
    // Emitir solo a un room (ej: "conductores", "pasajero_1", etc.)
    io.to(room).emit(evento, data);
  } else {
    // Emitir a todos
    io.emit(evento, data);
  }
};

/**
 * ESTADOS DE VIAJE:
 * 1: "Buscando conductor" - El pasajero solicitó el viaje
 * 2: "Asignado" - El conductor aceptó el viaje
 * 3: "En camino al encuentro" - El conductor va al punto de encuentro
 * 4: "Esperando pasajero" - El conductor llegó al punto de encuentro
 * 5: "En curso" - El viaje comenzó
 * 6: "Finalizado" - El viaje terminó
 * 7: "Cancelado" - El viaje fue cancelado
 */

/** POST /viajes/iniciarViaje */
const iniciarViaje = async (req, res) => {
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
      precio_estimado = null,
    } = req.body;

    if (!id_usuario || origen_lat == null || origen_lng == null) {
      return res.status(400).json({
        message:
          "Faltan datos obligatorios (id_usuario, origen_lat, origen_lng)",
      });
    }

    connection = await conectarBDMySql();

    // 1) Insertar el viaje en la BD con estado 1 (Buscando conductor)
    const [result] = await connection.execute(
      `INSERT INTO viajes
       (id_pasajero,
        lat_desde, lon_desde,
        lat_hasta, lon_hasta,
        direccion_desde, direccion_hasta,
        valor, id_estado)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        id_usuario,
        origen_lat,
        origen_lng,
        destino_lat,
        destino_lng,
        direccion_origen,
        direccion_destino,
        precio_estimado,
        1, // 1 = "Buscando conductor"
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

    // 3) Normalizar el objeto que se envía por socket
    // IMPORTANTE: Usar nombres que coincidan con el modelo IncomingRide del frontend
    const payloadSocket = {
      id_viajes: v.id_viajes ?? id_viajes,
      id_pasajero: v.id_pasajero ?? id_usuario,
      id_conductor: v.id_conductor ?? null,

      direccion_desde: v.direccion_desde ?? direccion_origen ?? "",
      lat_desde: Number(v.lat_desde ?? origen_lat),
      lon_desde: Number(v.lon_desde ?? origen_lng),

      direccion_hasta: v.direccion_hasta ?? direccion_destino ?? "",
      lat_hasta: Number(
        v.lat_hasta ?? destino_lat ?? v.lat_desde ?? origen_lat
      ),
      lon_hasta: Number(
        v.lon_hasta ?? destino_lng ?? v.lon_desde ?? origen_lng
      ),

      hora_inicio: v.hora_inicio ?? v.fecha_inicio ?? null,
      hora_fin: v.hora_fin ?? v.fecha_fin ?? null,

      valor: Number(v.valor ?? v.precio_final ?? precio_estimado ?? 0),
      id_estado: v.id_estado ?? v.estado ?? 1,
      
      // Campos adicionales para compatibilidad
      latDesde: Number(v.lat_desde ?? origen_lat),
      lonDesde: Number(v.lon_desde ?? origen_lng),
      latHasta: Number(
        v.lat_hasta ?? destino_lat ?? v.lat_desde ?? origen_lat
      ),
      lonHasta: Number(
        v.lon_hasta ?? destino_lng ?? v.lon_desde ?? origen_lng
      ),
      direccionDesde: v.direccion_desde ?? direccion_origen ?? "",
      direccionHasta: v.direccion_hasta ?? direccion_destino ?? "",
    };

    // 4) Verificar conductores conectados y disponibles antes de emitir
    const io = req.app.get("io");
    if (io) {
      // Obtener todos los sockets en el room "conductores"
      const conductoresRoom = io.sockets.adapter.rooms.get("conductores");
      const cantidadConductores = conductoresRoom ? conductoresRoom.size : 0;
      
      console.log(`📢 [iniciarViaje] Emitiendo viaje_creado a ${cantidadConductores} conductores conectados`);
      console.log(`📢 [iniciarViaje] Payload:`, JSON.stringify(payloadSocket, null, 2));
      
      // Emitir SOLO a conductores conectados y disponibles (room "conductores")
      emitir(req, "viaje_creado", payloadSocket, { room: "conductores" });
      
      if (cantidadConductores === 0) {
        console.log("⚠️ [iniciarViaje] No hay conductores conectados en el room 'conductores'");
        console.log("⚠️ [iniciarViaje] Rooms disponibles:", Array.from(io.sockets.adapter.rooms.keys()));
      } else {
        console.log(`✅ [iniciarViaje] Viaje ${id_viajes} emitido exitosamente a ${cantidadConductores} conductores`);
      }
    } else {
      console.log("❌ [iniciarViaje] Socket.IO no está disponible");
    }

    // 5) Notificar al pasajero que su viaje está buscando conductor
    emitir(req, "viaje_buscando_conductor", payloadSocket, {
      room: `pasajero_${id_usuario}`,
    });

    // 6) Responder al pasajero
    res.status(201).json({
      result: v,
      message: "Viaje iniciado en estado 'buscando conductor'.",
    });
  } catch (error) {
    console.error("❌ iniciarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al iniciar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/aceptar (asignarConductor) */
const asignarConductor = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // este id es id_viajes
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return res
        .status(400)
        .json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    // Verificar que el viaje esté en estado "Buscando conductor" (1)
    const [viajeAntes] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    if (!viajeAntes || viajeAntes.length === 0) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const viaje = viajeAntes[0];
    if (viaje.id_estado !== 1 && viaje.estado !== 1) {
      return res.status(400).json({
        message: "El viaje no está en estado 'Buscando conductor'",
      });
    }

    // Actualizar el viaje: asignar conductor y cambiar estado a 2 (Asignado)
    await connection.execute(
      "UPDATE viajes SET id_conductor = ?, id_estado = 2 WHERE id_viajes = ?",
      [id_conductor, id]
    );

    // Cambiar automáticamente a estado 3 (En camino al encuentro)
    await connection.execute(
      "UPDATE viajes SET id_estado = 3 WHERE id_viajes = ?",
      [id]
    );

    // Traer el viaje actualizado
    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = rows[0];

    // Notificar al pasajero que el conductor aceptó
    emitir(req, "viaje_asignado", v, {
      room: `pasajero_${v.id_pasajero}`,
    });

    // Notificar al conductor
    emitir(req, "viaje_aceptado", v, {
      room: `conductor_${id_conductor}`,
    });

    // Notificar a todos los conductores que este viaje ya fue tomado
    emitir(
      req,
      "viaje_tomado",
      { id_viajes: id },
      { room: "conductores" }
    );

    res.json({
      result: v,
      message: "Conductor asignado. Viaje en camino al encuentro.",
    });
  } catch (error) {
    console.error("❌ asignarConductor:", error);
    res
      .status(500)
      .json({ message: "Error al asignar conductor: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/rechazar - Rechazar viaje por parte del conductor */
const rechazarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return res
        .status(400)
        .json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    // Verificar que el viaje esté en estado "Buscando conductor" (1)
    const [viajeAntes] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    if (!viajeAntes || viajeAntes.length === 0) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const viaje = viajeAntes[0];
    if (viaje.id_estado !== 1 && viaje.estado !== 1) {
      return res.status(400).json({
        message: "El viaje no está en estado 'Buscando conductor'",
      });
    }

    // El viaje sigue en estado 1 (Buscando conductor), solo notificamos
    // No cambiamos el estado, solo emitimos evento para que otros conductores lo vean
    emitir(req, "viaje_rechazado", { id_viajes: id, id_conductor }, {
      room: "conductores",
    });

    res.json({
      message: "Viaje rechazado. Sigue disponible para otros conductores.",
    });
  } catch (error) {
    console.error("❌ rechazarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al rechazar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/actualizarUbicacion - Actualizar ubicación en tiempo real */
const actualizarUbicacion = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes
    const { lat, lng, id_usuario, tipo } = req.body; // tipo: "conductor" o "pasajero"

    if (!lat || !lng || !id_usuario || !tipo) {
      return res.status(400).json({
        message: "Faltan datos: lat, lng, id_usuario, tipo",
      });
    }

    connection = await conectarBDMySql();

    // Verificar que el viaje existe
    const [rows] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const viaje = rows[0];

    // Emitir ubicación actualizada según el tipo
    const payloadUbicacion = {
      id_viajes: id,
      lat: Number(lat),
      lng: Number(lng),
      id_usuario,
      tipo,
      timestamp: new Date().toISOString(),
    };

    // Si es conductor, notificar al pasajero
    if (tipo === "conductor" && viaje.id_pasajero) {
      emitir(req, "ubicacion_conductor_actualizada", payloadUbicacion, {
        room: `pasajero_${viaje.id_pasajero}`,
      });
    }

    // Si es pasajero, notificar al conductor
    if (tipo === "pasajero" && viaje.id_conductor) {
      emitir(req, "ubicacion_pasajero_actualizada", payloadUbicacion, {
        room: `conductor_${viaje.id_conductor}`,
      });
    }

    res.json({
      message: "Ubicación actualizada",
      ubicacion: payloadUbicacion,
    });
  } catch (error) {
    console.error("❌ actualizarUbicacion:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar ubicación: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/llegarEncuentro - Cuando el conductor llega al punto de encuentro */
const llegarEncuentro = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return res
        .status(400)
        .json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    // Verificar que el viaje existe y está asignado a este conductor
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

    // Verificar que el viaje esté en estado 3 (En camino al encuentro)
    if (viaje.id_estado !== 3 && viaje.estado !== 3) {
      return res.status(400).json({
        message: "El viaje no está en estado 'En camino al encuentro'",
      });
    }

    // Cambiar estado a 4 (Esperando pasajero)
    await connection.execute(
      "UPDATE viajes SET id_estado = 4 WHERE id_viajes = ?",
      [id]
    );

    // Traer el viaje actualizado
    const [viajeActualizado] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = viajeActualizado[0];

    // Notificar al pasajero que el conductor llegó
    emitir(req, "conductor_llego_encuentro", v, {
      room: `pasajero_${v.id_pasajero}`,
    });

    // Notificar al conductor
    emitir(req, "llegaste_encuentro", v, {
      room: `conductor_${id_conductor}`,
    });

    res.json({
      result: v,
      message: "Conductor llegó al punto de encuentro. Esperando pasajero.",
    });
  } catch (error) {
    console.error("❌ llegarEncuentro:", error);
    res
      .status(500)
      .json({ message: "Error al registrar llegada: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/comenzar - Comenzar el viaje (solo cuando el conductor llegó al encuentro) */
const comenzarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes
    const { id_conductor } = req.body;

    if (!id_conductor) {
      return res
        .status(400)
        .json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    // Verificar que el viaje existe y está asignado a este conductor
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

    // Verificar que el viaje esté en estado 4 (Esperando pasajero)
    if (viaje.id_estado !== 4 && viaje.estado !== 4) {
      return res.status(400).json({
        message: "El viaje debe estar en estado 'Esperando pasajero' para comenzar",
      });
    }

    // Cambiar estado a 5 (En curso) y registrar fecha de inicio
    await connection.execute(
      "UPDATE viajes SET id_estado = 5, fecha_inicio = NOW() WHERE id_viajes = ?",
      [id]
    );

    // Traer el viaje actualizado
    const [viajeActualizado] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = viajeActualizado[0];

    // Notificar al pasajero
    emitir(req, "viaje_en_curso", v, {
      room: `pasajero_${v.id_pasajero}`,
    });

    // Notificar al conductor
    emitir(req, "viaje_comenzado", v, {
      room: `conductor_${id_conductor}`,
    });

    res.json({ result: v, message: "Viaje en curso" });
  } catch (error) {
    console.error("❌ comenzarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al comenzar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/finalizar - Finalizar el viaje */
const finalizarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes
    const {
      id_conductor,
      precio_final = null,
      distancia_km = null,
      duracion_min = null,
    } = req.body;

    if (!id_conductor) {
      return res
        .status(400)
        .json({ message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    // Verificar que el viaje existe y está asignado a este conductor
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

    // Verificar que el viaje esté en estado 5 (En curso)
    if (viaje.id_estado !== 5 && viaje.estado !== 5) {
      return res.status(400).json({
        message: "El viaje debe estar en curso para finalizarlo",
      });
    }

    // Actualizar el viaje: estado 6 (Finalizado) y datos finales
    await connection.execute(
      `UPDATE viajes
       SET id_estado = 6,
           fecha_fin = NOW(),
           precio_final = COALESCE(?, precio_final),
           distancia_km = COALESCE(?, distancia_km),
           duracion_min = COALESCE(?, duracion_min)
       WHERE id_viajes = ?`,
      [precio_final, distancia_km, duracion_min, id]
    );

    // Actualizar el conductor a disponible
    await connection.execute(
      "UPDATE conductores SET conectado = 1 WHERE id_usuario = ?",
      [id_conductor]
    );

    // Traer el viaje actualizado
    const [viajeActualizado] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = viajeActualizado[0];

    // Notificar al pasajero que el viaje finalizó
    emitir(req, "viaje_finalizado", v, {
      room: `pasajero_${v.id_pasajero}`,
    });

    // Notificar al conductor
    emitir(req, "viaje_completado", v, {
      room: `conductor_${id_conductor}`,
    });

    // Notificar que el conductor está disponible nuevamente
    emitir(
      req,
      "conductor_disponible",
      { id_conductor, conectado: true },
      { room: "conductores" }
    );

    res.json({
      result: v,
      message: "Viaje finalizado. Conductor disponible nuevamente.",
    });
  } catch (error) {
    console.error("❌ finalizarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al finalizar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/** PUT /viajes/:id/cancelar - Cancelar viaje (por pasajero o conductor) */
const cancelarViaje = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_viajes
    const { id_usuario, tipo } = req.body; // tipo: "pasajero" o "conductor"

    if (!id_usuario || !tipo) {
      console.log(`❌ [cancelarViaje] Faltan datos: id_usuario=${id_usuario}, tipo=${tipo}`);
      return res.status(400).json({
        message: "id_usuario y tipo (pasajero/conductor) son requeridos",
      });
    }

    console.log(`🔄 [cancelarViaje] Cancelando viaje ${id} - Usuario: ${id_usuario}, Tipo: ${tipo}`);

    connection = await conectarBDMySql();

    // 1) Traer el viaje antes de actualizar para conocer su estado anterior
    const [rowsAntes] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    if (!rowsAntes || rowsAntes.length === 0) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    const vAntes = rowsAntes[0];
    const estadoAnterior = vAntes.id_estado ?? vAntes.estado;

    // Validar permisos según el tipo
    if (tipo === "pasajero" && vAntes.id_pasajero !== id_usuario) {
      return res.status(403).json({
        message: "No tienes permiso para cancelar este viaje",
      });
    }

    if (tipo === "conductor" && vAntes.id_conductor !== id_usuario) {
      return res.status(403).json({
        message: "No tienes permiso para cancelar este viaje",
      });
    }

    // No permitir cancelar si el viaje ya está finalizado o cancelado
    if (estadoAnterior === 6 || estadoAnterior === 7) {
      return res.status(400).json({
        message: "No se puede cancelar un viaje finalizado o ya cancelado",
      });
    }

    // 2) Actualizar el estado a 7 (Cancelado)
    const [updateResult] = await connection.execute(
      `UPDATE viajes
       SET id_estado = 7,
           fecha_fin = NOW() 
       WHERE id_viajes = ?`,
      [id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        message: "Viaje no encontrado o no se pudo actualizar",
      });
    }

    // 3) Volvemos a leer el viaje ya cancelado
    const [rowsDespues] = await connection.execute(
      "SELECT * FROM viajes WHERE id_viajes = ?",
      [id]
    );

    const v = rowsDespues[0];

    // 4) Lógica según quién cancela y el estado anterior
    if (tipo === "pasajero") {
      // Si el pasajero cancela antes de que un conductor acepte (estado 1)
      if (estadoAnterior === 1) {
        // Notificar a todos los conductores que el viaje fue cancelado
        emitir(
          req,
          "viaje_cancelado_busqueda",
          { id_viajes: id },
          { room: "conductores" }
        );
      } else if (estadoAnterior >= 2 && estadoAnterior <= 4) {
        // Si el pasajero cancela después de que el conductor aceptó
        // Notificar al conductor que el viaje fue cancelado
        if (v.id_conductor) {
          emitir(req, "viaje_cancelado_pasajero", v, {
            room: `conductor_${v.id_conductor}`,
          });
          // Hacer que el conductor vuelva a estar disponible
          await connection.execute(
            "UPDATE conductores SET conectado = 1 WHERE id_usuario = ?",
            [v.id_conductor]
          );
          emitir(
            req,
            "conductor_disponible",
            { id_conductor: v.id_conductor, conectado: true },
            { room: "conductores" }
          );
        }
      }
      // Notificar al pasajero
      emitir(req, "viaje_cancelado", v, {
        room: `pasajero_${v.id_pasajero}`,
      });
    } else if (tipo === "conductor") {
      // Si el conductor cancela
      if (estadoAnterior >= 2 && estadoAnterior <= 4) {
        // El viaje vuelve a estado 1 (Buscando conductor) y se quita el conductor
        await connection.execute(
          "UPDATE viajes SET id_estado = 1, id_conductor = NULL WHERE id_viajes = ?",
          [id]
        );

        // Traer el viaje actualizado
        const [viajeActualizado] = await connection.execute(
          "SELECT * FROM viajes WHERE id_viajes = ?",
          [id]
        );

        const vActualizado = viajeActualizado[0];

        // Notificar al pasajero que vuelve a buscar conductor
        emitir(req, "viaje_buscando_conductor", vActualizado, {
          room: `pasajero_${vActualizado.id_pasajero}`,
        });

        // Notificar a todos los conductores que el viaje está disponible nuevamente
        emitir(req, "viaje_creado", vActualizado, {
          room: "conductores",
        });

        // Hacer que el conductor vuelva a estar disponible
        await connection.execute(
          "UPDATE conductores SET conectado = 1 WHERE id_usuario = ?",
          [id_usuario]
        );
        emitir(
          req,
          "conductor_disponible",
          { id_conductor: id_usuario, conectado: true },
          { room: "conductores" }
        );

        res.json({
          message: "Viaje cancelado por conductor. Vuelve a estado 'Buscando conductor'.",
          viaje: vActualizado,
        });
        return;
      }
    }

    res.json({ message: "Viaje cancelado exitosamente", viaje: v });
  } catch (error) {
    console.error("❌ cancelarViaje:", error);
    res
      .status(500)
      .json({ message: "Error al cancelar viaje: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  iniciarViaje,
  asignarConductor,
  rechazarViaje,
  actualizarUbicacion,
  llegarEncuentro,
  comenzarViaje,
  finalizarViaje,
  cancelarViaje,
};
