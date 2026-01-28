// controllers/conductorControllers.js
import conectarBDMySql from "../config/dbMYSQL.js";

// Helper para emitir por socket (con o sin room)
export const emitir = (req, evento, data, room = null) => {
  const io = req.app.get("io");
  if (!io) return;

  if (room) {
    io.to(room).emit(evento, data);
  } else {
    io.emit(evento, data);
  }
};

export const obtenerConductores = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();

    const [result] = await connection.execute(`
      SELECT 
        c.id_usuario,
        u.nombre_usuario,
        u.apellido_usuario,
        v.fecha_validacion,
        v.observaciones,
        c.matricula,
        c.id_conductor,
        c.nro_motor,
        c.licencia,
        c.vencimiento_licencia,
        c.poliza_seguro,
        e.nombre_estado
      FROM conductores c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN validacion_conductor v ON c.id_usuario = v.id_usuario
      LEFT JOIN estado_validacion e ON v.id_estado_validacion = e.id_estado_validacion
    `);

    res.json({ result });
  } catch (error) {
    console.error("âŒ Error al obtener conductores:", error);
    res.status(500).json({ message: "Error al obtener conductores." });
  } finally {
    if (connection) await connection.end();
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
export const cambiarEstadoConductor = async (req, res) => {
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
      [valorConectado, id_usuario],
    );

    // Podés consultar el registro actualizado si querés devolverlo
    const [rows] = await connection.execute(
      "SELECT * FROM conductores WHERE id_usuario = ?",
      [id_usuario],
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
      "conductores", // room donde están conectados los choferes
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
export const obtenerCarnetConductor = async (req, res) => {
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
      [idUsuario],
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
        [idUsuario],
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

export const subirImagenConductor = async (req, res) => {
  let connection;

  try {
    const { id_conductor, tipo_imagen } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No se envió ninguna imagen" });
    }

    connection = await conectarBDMySql();

    const rutaRelativa = file.path.replace(process.cwd(), "");

    await connection.execute(
      `INSERT INTO conductor_imagenes
       (id_conductor, tipo_imagen, nombre_archivo, ruta_archivo, mime_type, tamaño_bytes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_conductor,
        tipo_imagen,
        file.filename,
        rutaRelativa,
        file.mimetype,
        file.size,
      ],
    );

    res.json({
      status: "OK",
      message: "Imagen cargada correctamente",
      ruta: rutaRelativa,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

export const getImagenesConductor = async (req, res) => {
  let connection;

  try {
    const { id_conductor } = req.params;

    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      `SELECT tipo_imagen, ruta_archivo
       FROM conductor_imagenes
       WHERE id_conductor = ?
         AND activa = 1`,
      [id_conductor],
    );

    // Normalizamos a objeto clave → valor
    const imagenes = {};
    rows.forEach((img) => {
      imagenes[img.tipo_imagen] = img.ruta_archivo;
    });

    res.json({
      status: "OK",
      id_conductor,
      imagenes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

export const crearChofer = async (req, res) => {
  let connection;

  try {
    const {
      id_usuario,
      licencia,
      vencimientoLicencia,
      vencimientoCarnet,
      poliza,
      vencimientoSeguro,
      numeroMotor,
      numeroChassis,
      patente,
      marca,
      modelo,
      anio,
      tipoVehiculo,
    } = req.body;

    if (!id_usuario || !licencia || !patente) {
      return res.status(400).json({
        message: "Faltan datos obligatorios para crear el chofer",
      });
    }

    connection = await conectarBDMySql();
    await connection.beginTransaction();

    // 1️⃣ Insertar en conductores
    const [result] = await connection.execute(
      `
      INSERT INTO conductores
      (
        id_usuario,
        licencia,
        vencimiento_licencia,
        vencimiento_carnet,
        poliza_seguro,
        vencimiento_seguro,
        nro_motor,
        nro_chasis,
        matricula,
        marca_vehiculo,
        modelo_vehiculo,
        anio_vehiculo,
        id_tipo_vehiculo,
        conectado,
        habilita
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
      `,
      [
        id_usuario,
        licencia,
        vencimientoLicencia || null,
        vencimientoCarnet || null,
        poliza || null,
        vencimientoSeguro || null,
        numeroMotor || null,
        numeroChassis || null,
        patente,
        marca || null,
        modelo || null,
        anio || null,
        tipoVehiculo || null,
      ],
    );

    const id_conductor = result.insertId;

    // 2️⃣ Cambiar rol del usuario a CONDUCTOR (id_rol = 3)
    await connection.execute(
      `UPDATE usuarios SET id_rol = 3 WHERE id_usuario = ?`,
      [id_usuario],
    );

    // 3️⃣ Crear validación inicial (PENDIENTE = 1)
    await connection.execute(
      `
      INSERT INTO validacion_conductor
      (id_usuario, fecha_validacion, id_estado_validacion)
      VALUES (?, CURDATE(), 1)
      `,
      [id_usuario],
    );

    await connection.commit();

    return res.json({
      status: "OK",
      message: "Chofer creado correctamente",
      id_conductor,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error en crearChofer:", error);

    return res.status(500).json({
      message: "Error al crear chofer: " + error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};
