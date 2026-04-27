export const cancelarAlta = async (req, res) => {
  const { id_usuario, sessionId } = req.body;

  // DB
  await connection.execute("DELETE FROM conductores WHERE id_usuario = ?", [id_usuario]);
  await connection.execute("DELETE FROM usuarios WHERE id_usuario = ?", [id_usuario]);

  // FS
  fs.rmSync(`uploads/temp/session_${sessionId}`, { recursive: true, force: true });
  fs.rmSync(`uploads/conductores/${id_usuario}`, { recursive: true, force: true });

  res.json({ message: "Alta cancelada y rollback realizado" });
};
