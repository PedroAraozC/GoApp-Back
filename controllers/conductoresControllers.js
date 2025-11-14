import { conectarBDMySql } from "../config/dbMYSQL.js";

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
        c.seguro,
        c.id_estado_validacion
      FROM conductores c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN validacion_conductor v ON c.id_usuario = v.id_usuario
    `);

    res.json({ result });
  } catch (error) {
    console.error("❌ Error al obtener conductores:", error);
    res.status(500).json({ message: "Error al obtener conductores." });
  } finally {
    if (connection) await connection.end();
  }
};

export const obtenerDetalleConductores = async (req, res) => {
  let connection;
  try {
    const { id } = req.params; // id_usuario
    connection = await conectarBDMySql();

    const [result] = await connection.execute(
      `
      SELECT 
        c.id_conductor,
        c.id_usuario,
        c.marca_vehiculo,
        c.modelo_vehiculo,
        c.año_vehiculo,
        u.nombre_usuario,
        u.apellido_usuario,
        u.dni,
        u.email_usuario,
        u.telefono_usuario,
        v.fecha_validacion,
        v.observaciones,
        c.matricula,
        c.nro_motor,
        c.nro_chasis,
        c.licencia,
        c.vencimiento_licencia,
        c.seguro,
        c.id_estado_validacion,
        e.nombre_estado,
        r.nombre_rol,
        t.nombre_tipo
      FROM conductores c
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN validacion_conductor v ON c.id_usuario = v.id_usuario
      LEFT JOIN estado_validacion e ON c.id_estado_validacion = e.id_estado_validacion
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN tipos_vehiculo t ON c.id_tipo_vehiculo = t.id_tipo_vehiculo
      WHERE c.id_usuario = ?
      `,
      [id]
    );

    console.log(result, "chofer");
    if (result.length === 0) {
      return res.status(404).json({ message: "Conductor no encontrado" });
    }

    // 🔧 Convertimos las fechas en formato legible antes de enviar
    const conductor = result[0];
    if (conductor.fecha_validacion) {
      conductor.fecha_validacion = new Date(conductor.fecha_validacion)
        .toISOString()
        .split("T")[0];
    }
    if (conductor.vencimiento_licencia) {
      conductor.vencimiento_licencia = new Date(conductor.vencimiento_licencia)
        .toISOString()
        .split("T")[0];
    }

    res.json({ result: conductor });
  } catch (error) {
    console.error("❌ Error al obtener conductor:", error);
    res.status(500).json({ message: "Error al obtener el conductor." });
  } finally {
    if (connection) await connection.end();
  }
};

export const cambiarEstadoSolicitud = async (req, res) => {
  let connection;
  try {
    const { id_estado_validacion, observaciones } = req.body;
    connection = await conectarBDMySql();

    const [result] = await connection.execute(
      `UPDATE validacion_conductor set id_estado_validacion = ? observaciones = ?`,
      [id_estado_validacion, observaciones]
    );
    console.log(result);
    res.json({ result });
  } catch (error) {
    console.error("❌ Error al cambiar estado de solicitud:", error);
    res.status(500).json({ message: "Error al cambiar estado de solicitud." });
  } finally {
    if (connection) await connection.end();
  }
};
