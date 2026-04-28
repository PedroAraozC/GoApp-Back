import { conectarBDMySql } from "../config/dbMYSQL.js";

export const obtenerDeuda = async (req, res) => {
  let connection;
  try {
    const { id_conductor } = req.params;
    if (!id_conductor) {
      return res.status(400).json({ ok: false, message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    const [rows] = await connection.execute(
      `SELECT SUM(monto) as total_deuda FROM deuda_conductor WHERE id_conductor = ? AND estado = 'PENDING'`,
      [id_conductor]
    );

    const saldoAdeudado = Number(rows[0]?.total_deuda ?? 0);

    return res.status(200).json({
      ok: true,
      saldo_adeudado: saldoAdeudado
    });
  } catch (error) {
    console.error("❌ Error en obtenerDeuda:", error);
    return res.status(500).json({ ok: false, message: "Error al obtener deuda: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};

export const pagarDeuda = async (req, res) => {
  let connection;
  try {
    const { id_conductor } = req.body;
    if (!id_conductor) {
      return res.status(400).json({ ok: false, message: "id_conductor es requerido" });
    }

    connection = await conectarBDMySql();

    // Obtener la deuda actual para verificar si hay algo que pagar
    const [rows] = await connection.execute(
      `SELECT SUM(monto) as total_deuda FROM deuda_conductor WHERE id_conductor = ? AND estado = 'PENDING'`,
      [id_conductor]
    );

    const saldoAdeudado = Number(rows[0]?.total_deuda ?? 0);

    if (saldoAdeudado <= 0) {
      return res.status(400).json({ ok: false, message: "No tienes deuda pendiente para pagar." });
    }

    // Actualizar todas las comisiones pendientes a PAID (Pago total)
    await connection.execute(
      `UPDATE deuda_conductor SET estado = 'PAID', fecha_pago = CURRENT_TIMESTAMP WHERE id_conductor = ? AND estado = 'PENDING'`,
      [id_conductor]
    );

    return res.status(200).json({
      ok: true,
      message: "Deuda pagada exitosamente.",
      monto_pagado: saldoAdeudado,
      saldo_restante: 0
    });
  } catch (error) {
    console.error("❌ Error en pagarDeuda:", error);
    return res.status(500).json({ ok: false, message: "Error al pagar deuda: " + error.message });
  } finally {
    if (connection) await connection.end();
  }
};
