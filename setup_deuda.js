import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const crearTabla = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.HOST_TAXI,
      user: process.env.USER_TAXI,
      password: process.env.PASSWORD_TAXI,
      database: process.env.DB_TAXI,
    });
    
    await connection.execute(`DROP TABLE IF EXISTS deuda_conductor;`);

    await connection.execute(`
      CREATE TABLE deuda_conductor (
        id_deuda INT AUTO_INCREMENT PRIMARY KEY,
        id_conductor INT NOT NULL, /* Aquí se guarda el id_usuario del conductor, tal como lo hace la tabla viajes */
        id_viaje INT NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        estado ENUM('PENDING', 'PAID') DEFAULT 'PENDING',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_pago TIMESTAMP NULL,
        FOREIGN KEY (id_conductor) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_viaje) REFERENCES viajes(id_viajes)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    console.log("Tabla deuda_conductor creada exitosamente");
    await connection.end();
  } catch (error) {
    console.error("Error al crear tabla:", error);
  }
};

crearTabla();
