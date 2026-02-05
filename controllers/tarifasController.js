// controllers/tarifasControllers.js
import { conectarBDMySql } from "../config/dbMYSQL.js";

/**
 * GET /tarifas
 * Lista todas las tarifas
 */
export const listarTarifas = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      `SELECT id_tarifa, base, por_km, por_min, minimo, activa, fecha_inicio, fecha_fin, created_at, updated_at
       FROM tarifas
       ORDER BY fecha_inicio DESC, id_tarifa DESC`
    );

    return res.json({ ok: true, data: rows });
  } catch (error) {
    console.error("❌ listarTarifas:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * GET /tarifas/vigente
 * Trae tarifa activa (vigente)
 */
export const obtenerTarifaVigente = async (req, res) => {
  let connection;
  try {
    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      `SELECT id_tarifa, base, por_km, por_min, minimo, fecha_inicio
       FROM tarifas
       WHERE activa = 1
       ORDER BY fecha_inicio DESC, id_tarifa DESC
       LIMIT 1`
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ ok: false, message: "No hay tarifa vigente" });
    }

    return res.json({ ok: true, data: rows[0] });
  } catch (error) {
    console.error("❌ obtenerTarifaVigente:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * GET /tarifas/:id
 */
export const obtenerTarifaPorId = async (req, res) => {
  let connection;
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: "id inválido" });
    }

    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      `SELECT id_tarifa, base, por_km, por_min, minimo, activa, fecha_inicio, fecha_fin, created_at, updated_at
       FROM tarifas
       WHERE id_tarifa = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Tarifa no encontrada" });
    }

    return res.json({ ok: true, data: rows[0] });
  } catch (error) {
    console.error("❌ obtenerTarifaPorId:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * POST /tarifas
 * body: { base, por_km, por_min, minimo?, activa? }
 * Si activa=true, desactiva la anterior y activa esta (con transacción)
 */
export const crearTarifa = async (req, res) => {
  let connection;
  try {
    const { base, por_km, por_min, minimo = null, activa = false } = req.body;

    const baseN = Number(base);
    const kmN = Number(por_km);
    const minN = Number(por_min);
    const minimoN =
      minimo === null || minimo === undefined || minimo === "" ? null : Number(minimo);

    if (!Number.isFinite(baseN) || baseN < 0) {
      return res.status(400).json({ ok: false, message: "base inválida" });
    }
    if (!Number.isFinite(kmN) || kmN < 0) {
      return res.status(400).json({ ok: false, message: "por_km inválido" });
    }
    if (!Number.isFinite(minN) || minN < 0) {
      return res.status(400).json({ ok: false, message: "por_min inválido" });
    }
    if (minimoN !== null && (!Number.isFinite(minimoN) || minimoN < 0)) {
      return res.status(400).json({ ok: false, message: "minimo inválido" });
    }

    connection = await conectarBDMySql();
    await connection.beginTransaction();

    const wantActive = activa === true || activa === 1;

    // si se crea activa => desactivar la vigente
    if (wantActive) {
      await connection.execute(
        `UPDATE tarifas
         SET activa = 0, fecha_fin = NOW()
         WHERE activa = 1`
      );
    }

    const [result] = await connection.execute(
      `INSERT INTO tarifas (base, por_km, por_min, minimo, activa, fecha_inicio, fecha_fin)
       VALUES (?, ?, ?, ?, ?, NOW(), NULL)`,
      [baseN, kmN, minN, minimoN, wantActive ? 1 : 0]
    );

    await connection.commit();

    return res.status(201).json({
      ok: true,
      message: "Tarifa creada",
      data: { id_tarifa: result.insertId, activa: wantActive ? 1 : 0 },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ crearTarifa:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * PUT /tarifas/:id
 * Actualiza montos (NO activa/desactiva)
 */
export const actualizarTarifa = async (req, res) => {
  let connection;
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: "id inválido" });
    }

    const { base, por_km, por_min, minimo } = req.body ?? {};

    // update parcial
    const fields = [];
    const params = [];

    if (base !== undefined) {
      const n = Number(base);
      if (!Number.isFinite(n) || n < 0)
        return res.status(400).json({ ok: false, message: "base inválida" });
      fields.push("base = ?");
      params.push(n);
    }

    if (por_km !== undefined) {
      const n = Number(por_km);
      if (!Number.isFinite(n) || n < 0)
        return res.status(400).json({ ok: false, message: "por_km inválido" });
      fields.push("por_km = ?");
      params.push(n);
    }

    if (por_min !== undefined) {
      const n = Number(por_min);
      if (!Number.isFinite(n) || n < 0)
        return res.status(400).json({ ok: false, message: "por_min inválido" });
      fields.push("por_min = ?");
      params.push(n);
    }

    if (minimo !== undefined) {
      const n = (minimo === null || minimo === "" ? null : Number(minimo));
      if (n !== null && (!Number.isFinite(n) || n < 0))
        return res.status(400).json({ ok: false, message: "minimo inválido" });
      fields.push("minimo = ?");
      params.push(n);
    }

    if (fields.length === 0) {
      return res.status(400).json({ ok: false, message: "No hay campos para actualizar" });
    }

    connection = await conectarBDMySql();

    params.push(id);

    const [r] = await connection.execute(
      `UPDATE tarifas SET ${fields.join(", ")} WHERE id_tarifa = ?`,
      params
    );

    if (!r || r.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "Tarifa no encontrada" });
    }

    return res.json({ ok: true, message: "Tarifa actualizada" });
  } catch (error) {
    console.error("❌ actualizarTarifa:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * PATCH /tarifas/:id/activar
 * Activa esta tarifa y desactiva la anterior (transacción)
 */
export const activarTarifa = async (req, res) => {
  let connection;
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: "id inválido" });
    }

    connection = await conectarBDMySql();
    await connection.beginTransaction();

    const [exist] = await connection.execute(
      `SELECT id_tarifa FROM tarifas WHERE id_tarifa = ?`,
      [id]
    );

    if (!exist || exist.length === 0) {
      await connection.rollback();
      return res.status(404).json({ ok: false, message: "Tarifa no encontrada" });
    }

    // desactivar vigente
    await connection.execute(
      `UPDATE tarifas
       SET activa = 0, fecha_fin = NOW()
       WHERE activa = 1 AND id_tarifa <> ?`,
      [id]
    );

    // activar esta
    await connection.execute(
      `UPDATE tarifas
       SET activa = 1, fecha_inicio = NOW(), fecha_fin = NULL
       WHERE id_tarifa = ?`,
      [id]
    );

    await connection.commit();
    return res.json({ ok: true, message: "Tarifa activada" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ activarTarifa:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * PATCH /tarifas/:id/desactivar
 */
export const desactivarTarifa = async (req, res) => {
  let connection;
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: "id inválido" });
    }

    connection = await conectarBDMySql();

    const [r] = await connection.execute(
      `UPDATE tarifas SET activa = 0, fecha_fin = NOW() WHERE id_tarifa = ?`,
      [id]
    );

    if (!r || r.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: "Tarifa no encontrada" });
    }

    return res.json({ ok: true, message: "Tarifa desactivada" });
  } catch (error) {
    console.error("❌ desactivarTarifa:", error);
    return res.status(500).json({ ok: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
};
