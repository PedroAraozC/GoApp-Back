const { conectarBDMySql } = require("../config/dbMYSQL");

const getMessages = async (req, res) => {
    let connection;
    try {
        const { idViaje } = req.params;
        connection = await conectarBDMySql();
        
        const [rows] = await connection.execute(
            "SELECT id_emisor, mensaje, fecha FROM mensajes WHERE id_viaje = ? ORDER BY fecha ASC",
            [idViaje]
        );

        res.json(rows);
    } catch (error) {
        console.error("❌ Error al obtener mensajes:", error);
        res.status(500).json({ message: "Error al obtener mensajes" });
    } finally {
        if (connection) await connection.end();
    }
};

const guardarMensaje = async (idViaje, idEmisor, mensaje) => {
    let connection;
    try {
        connection = await conectarBDMySql();
        
        const [result] = await connection.execute(
            "INSERT INTO mensajes (id_viaje, id_emisor, mensaje) VALUES (?, ?, ?)",
            [idViaje, idEmisor, mensaje]
        );

        console.log("💾 Mensaje guardado ID:", result.insertId);
        return result;
    } catch (error) {
        console.error("❌ Error guardando mensaje:", error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
};

module.exports = {
    getMessages,
    guardarMensaje
};
