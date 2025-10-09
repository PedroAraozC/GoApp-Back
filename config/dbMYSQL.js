const mysql = require("mysql2/promise");

const conectarBDMySql = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.HOST_TAXI,
      port: process.env.PORT_TAXI,
      user: process.env.USER_TAXI,
      password: process.env.PASSWORD_TAXI,
      database: process.env.DB_TAXI,
      dateStrings: true,
    });
    console.log("Conexión a la base de datos MySQL establecida");
    return connection;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { conectarBDMySql };
