-- --------------------------------------------------------
-- Host:                         186.123.85.22
-- Versión del servidor:         10.4.32-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para db_faketaxi
CREATE DATABASE IF NOT EXISTS `db_faketaxi_prueba` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `db_faketaxi_prueba`;

-- Volcando estructura para tabla db_faketaxi.calificaciones
CREATE TABLE IF NOT EXISTS `calificaciones` (
  `id_calificacion` int(6) NOT NULL AUTO_INCREMENT,
  `id_viajes` int(6) NOT NULL,
  `id_usuario` int(6) NOT NULL,
  `puntuacion` int(2) NOT NULL,
  `comentario` varchar(250) DEFAULT NULL,
  `habilita` int(2) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_calificacion`),
  KEY `fk_calificacion_viaje` (`id_viajes`),
  KEY `fk_calificacion_usuario` (`id_usuario`),
  CONSTRAINT `fk_calificacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_calificacion_viaje` FOREIGN KEY (`id_viajes`) REFERENCES `viajes` (`id_viajes`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.calificaciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla db_faketaxi.conductores
CREATE TABLE IF NOT EXISTS `conductores` (
  `id_conductor` int(6) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(6) NOT NULL,
  `conectado` int(11) NOT NULL DEFAULT 0,
  `licencia` varchar(50) NOT NULL,
  `vencimiento_licencia` date NOT NULL,
  `vencimiento_carnet` date NOT NULL,
  `poliza_seguro` varchar(50) DEFAULT NULL,
  `vencimiento_seguro` date NOT NULL,
  `id_validacion_conductor` int(6) DEFAULT NULL,
  `foto_vehiculo` longblob DEFAULT NULL,
  `foto_conductor` longblob DEFAULT NULL,
  `nro_motor` varchar(50) DEFAULT NULL,
  `nro_chasis` varchar(50) DEFAULT NULL,
  `matricula` varchar(20) DEFAULT NULL,
  `marca_vehiculo` varchar(100) DEFAULT NULL,
  `modelo_vehiculo` varchar(100) DEFAULT NULL,
  `año_vehiculo` int(4) DEFAULT NULL,
  `id_tipo_vehiculo` int(6) DEFAULT NULL,
  `fecha_solicitud` date NOT NULL,
  `habilita` int(1) DEFAULT 1,
  PRIMARY KEY (`id_conductor`) USING BTREE,
  KEY `id_usuario` (`id_usuario`),
  KEY `conductores_ibfk_3` (`id_tipo_vehiculo`),
  KEY `id_estado_validacion` (`id_validacion_conductor`) USING BTREE,
  CONSTRAINT `FK_conductores_validacion_conductor` FOREIGN KEY (`id_validacion_conductor`) REFERENCES `validacion_conductor` (`id_validacion`),
  CONSTRAINT `conductores_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `conductores_ibfk_3` FOREIGN KEY (`id_tipo_vehiculo`) REFERENCES `tipos_vehiculo` (`id_tipo_vehiculo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.conductores: ~3 rows (aproximadamente)
INSERT INTO `conductores` (`id_conductor`, `id_usuario`, `conectado`, `licencia`, `vencimiento_licencia`, `vencimiento_carnet`, `poliza_seguro`, `vencimiento_seguro`, `id_validacion_conductor`, `foto_vehiculo`, `foto_conductor`, `nro_motor`, `nro_chasis`, `matricula`, `marca_vehiculo`, `modelo_vehiculo`, `año_vehiculo`, `id_tipo_vehiculo`, `fecha_solicitud`, `habilita`) VALUES
	(1, 40, 1, '4938', '2025-11-12', '2029-06-12', '50/926671', '2026-07-10', 1, NULL, NULL, '552820597932535', ' 8AP359A02NU157691', 'AE998RM', 'FIAT', 'CRONOS', 2019, 1, '2025-11-12', 1),
	(2, 18, 0, '4938', '2025-11-12', '2029-06-12', '50/926671', '2026-07-10', 2, NULL, NULL, '552820597932535', ' 8AP359A02NU157691', 'AE998RM', 'FIAT', 'CRONOS', 2019, 1, '2025-11-12', 1),
	(3, 17, 1, '4938', '2025-11-12', '2029-06-12', '50/926671', '2026-07-10', 3, NULL, NULL, '552820597932535', ' 8AP359A02NU157691', 'AE998RM', 'FIAT', 'CRONOS', 2019, 1, '2025-11-12', 1);

-- Volcando estructura para tabla db_faketaxi.estado_vajes
CREATE TABLE IF NOT EXISTS `estado_vajes` (
  `id_estado_viajes` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_estado_viajes` varchar(50) NOT NULL DEFAULT '""',
  `habilita` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_estado_viajes`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.estado_vajes: ~7 rows (aproximadamente)
INSERT INTO `estado_vajes` (`id_estado_viajes`, `nombre_estado_viajes`, `habilita`) VALUES
	(1, 'Buscando conductor', 1),
	(2, 'Asignado', 1),
	(3, 'En camino al encuentro', 1),
	(4, 'Esperando pasajero', 1),
	(5, 'En curso', 1),
	(6, 'Finalizado', 1),
	(7, 'Cancelado', 1);

-- Volcando estructura para tabla db_faketaxi.estado_validacion
CREATE TABLE IF NOT EXISTS `estado_validacion` (
  `id_estado_validacion` int(6) NOT NULL AUTO_INCREMENT,
  `nombre_estado` varchar(50) NOT NULL,
  `habilita` int(2) DEFAULT 1,
  PRIMARY KEY (`id_estado_validacion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.estado_validacion: ~3 rows (aproximadamente)
INSERT INTO `estado_validacion` (`id_estado_validacion`, `nombre_estado`, `habilita`) VALUES
	(1, 'PENDIENTE', 1),
	(2, 'RECHAZADO', 1),
	(3, 'APROBADO', 1);

-- Volcando estructura para tabla db_faketaxi.generos
CREATE TABLE IF NOT EXISTS `generos` (
  `id_genero` int(2) NOT NULL AUTO_INCREMENT,
  `nombre_genero` varchar(50) NOT NULL,
  `habilita` int(2) DEFAULT 1,
  PRIMARY KEY (`id_genero`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.generos: ~3 rows (aproximadamente)
INSERT INTO `generos` (`id_genero`, `nombre_genero`, `habilita`) VALUES
	(1, 'Femenino', 1),
	(2, 'Masculino', 1),
	(3, 'No-Binario', 1);

-- Volcando estructura para tabla db_faketaxi.mensajes
CREATE TABLE IF NOT EXISTS `mensajes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_viaje` int(11) NOT NULL,
  `id_emisor` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.mensajes: ~0 rows (aproximadamente)

-- Volcando estructura para tabla db_faketaxi.pagos
CREATE TABLE IF NOT EXISTS `pagos` (
  `id_pago` int(6) NOT NULL AUTO_INCREMENT,
  `id_viajes` int(6) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime NOT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `habilita` int(2) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_pago`),
  KEY `fk_pago_viaje` (`id_viajes`),
  CONSTRAINT `fk_pago_viaje` FOREIGN KEY (`id_viajes`) REFERENCES `viajes` (`id_viajes`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.pagos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla db_faketaxi.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol` int(2) NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  `habilita` int(2) DEFAULT 1,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.roles: ~3 rows (aproximadamente)
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `habilita`) VALUES
	(1, 'Administrador', 1),
	(2, 'Usuario', 1),
	(3, 'Conductor', 1);

-- Volcando estructura para tabla db_faketaxi.tipos_vehiculo
CREATE TABLE IF NOT EXISTS `tipos_vehiculo` (
  `id_tipo_vehiculo` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_tipo` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `habilita` int(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_tipo_vehiculo`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.tipos_vehiculo: ~16 rows (aproximadamente)
INSERT INTO `tipos_vehiculo` (`id_tipo_vehiculo`, `nombre_tipo`, `descripcion`, `habilita`) VALUES
	(1, 'Sedan', 'Auto estándar de 4 puertas para pasajeros', 1),
	(2, 'Hatchback', 'Compacto, con puerta trasera que se abre hacia arriba', 1),
	(3, 'SUV', 'Vehículo utilitario deportivo, más alto y espacioso', 1),
	(4, 'Pickup / Camioneta', 'Vehículo con caja trasera para carga', 1),
	(5, 'Van', 'Vehículo de gran capacidad, usado para transporte de grupos', 1),
	(6, 'Minivan', 'Van pequeña, ideal para familias o traslados grupales', 1),
	(7, 'Coupe', 'Auto de 2 puertas, diseño deportivo', 1),
	(8, 'Convertible', 'Auto con techo retráctil', 1),
	(9, 'Station Wagon', 'Auto familiar con gran espacio trasero', 1),
	(10, 'Eléctrico Compacto', 'Auto pequeño 100% eléctrico', 1),
	(11, 'SUV Premium', 'SUV de lujo, más amplio y con mejores prestaciones', 1),
	(12, 'Camioneta Doble Cabina', 'Pickup con dos filas de asientos', 1),
	(13, 'Auto Accesible', 'Vehículo adaptado para personas con movilidad reducida', 1),
	(14, 'Auto Ejecutivo', 'Vehículo de alta gama para transporte corporativo', 1),
	(15, 'Furgón de Carga', 'Vehículo cerrado para transporte de mercadería', 1),
	(16, 'Microbus / Minibus', 'Vehículo mediano con varias filas de asientos', 1),
	(17, 'Sin Informar', 'No se informa tipo de vehiculo', 1);

-- Volcando estructura para tabla db_faketaxi.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(6) NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) NOT NULL,
  `apellido_usuario` varchar(50) NOT NULL,
  `dni` int(12) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `id_genero` int(2) DEFAULT NULL,
  `password` varchar(70) DEFAULT NULL,
  `telefono_usuario` varchar(30) DEFAULT NULL,
  `email_usuario` varchar(70) DEFAULT NULL,
  `id_rol` int(2) NOT NULL DEFAULT 2,
  `fecha_carga` timestamp NOT NULL DEFAULT current_timestamp(),
  `habilita` int(2) DEFAULT 1,
  `google_id` varchar(150) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `auth_provider` enum('manual','google') DEFAULT 'manual',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `dni` (`dni`),
  KEY `id_genero` (`id_genero`),
  KEY `id_rol` (`id_rol`),
  KEY `idx_usuarios_dni` (`dni`),
  KEY `idx_usuarios_email` (`email_usuario`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_genero`) REFERENCES `generos` (`id_genero`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.usuarios: ~13 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `nombre_usuario`, `apellido_usuario`, `dni`, `fecha_nacimiento`, `id_genero`, `password`, `telefono_usuario`, `email_usuario`, `id_rol`, `fecha_carga`, `habilita`, `google_id`, `foto_perfil`, `auth_provider`) VALUES
	(2, 'Pedro', 'Aráoz', 41061708, '2005-11-10', 2, '1234', '3816817290', 'pedroaraoz@gmail.com', 2, '2025-09-10 12:12:15', 0, NULL, NULL, 'manual'),
	(11, 'Programación_lab2023', '', NULL, NULL, NULL, NULL, NULL, 'programacionlab76@gmail.com', 1, '2025-10-16 00:07:25', 1, '108599404702524096733', 'https://lh3.googleusercontent.com/a/ACg8ocK9xlPbD-FPEpbKUalKHXQurRVxtdCD01EvFN5-wwhYLnqL5A=s96-c', 'google'),
	(14, 'Alejandro', 'Juanves', 43215863, '1999-10-11', 1, NULL, '1163789879', 'allhealthy10@gmail.com', 2, '2025-10-17 00:28:14', 1, '113976294951405386808', 'https://lh3.googleusercontent.com/a/ACg8ocLd-Tk2hZBm6ArW2srxbxH-QpjCPQANs4AjuQRUVuW0blaq=s96-c', 'google'),
	(15, 'Braian', ' Barrionuevo', 41373844, '1998-11-02', 2, 'Elkpo123', '3816430705', 'braiancs37@gmail.com', 1, '2025-10-21 00:10:28', 1, '111056871768323161649', 'https://lh3.googleusercontent.com/a/ACg8ocKrF-6QPKimYAEAPL2ivxDeAJwnzbHlf2GBWhsvS8ik2F_n_a6Y=s96-c', 'google'),
	(17, 'Pedro Agustín', 'Aráoz Colombres', 41061709, '2005-03-24', 2, 'bbbbbb', '3816817290', 'pedroaraozc@gmail.com', 3, '2025-10-22 15:12:36', 1, '114048506940675520950', 'https://lh3.googleusercontent.com/a/ACg8ocLySgJ2lrSRvxX08YqDwUAGoDjGMfrU-fNp4V2zYuBut8HAERJH7w=s96-c', 'google'),
	(18, 'Braian', 'Barrionuevo', 41313654, '2005-10-16', 2, NULL, '4123155554', 'jugadorbraian1@gmail.com', 3, '2025-10-23 20:58:02', 1, '104307770940450025038', 'https://lh3.googleusercontent.com/a/ACg8ocLarUnF3fTESfaKdANGj0cGofRplOsmpoDZFaSvN0bGoUL7Ig=s96-c', 'google'),
	(32, 'Omar Alberto', 'Adra', 40274452, '2005-12-12', 2, NULL, '3816467896', 'adra.omar2@gmail.com', 3, '2025-10-24 05:57:50', 1, '106267537373796568284', 'https://lh3.googleusercontent.com/a/ACg8ocKXvFKSFp4TlITMg-R7jt48_mCYNMRyhWwgKVkojv2DPGW6RQ=s96-c', 'google'),
	(34, 'Pedro Agustin', 'Aráoz Colombres', 30345654, '1998-03-24', 2, 'Pedro123', '3816817290', 'pedroaraozdev@gmail.com', 2, '2025-10-31 13:59:54', 1, NULL, NULL, 'google'),
	(38, 'Guada', 'Alcaraz', 44028611, '2002-05-29', 1, NULL, '3815681094', 'guadaalcaraz2905@gmail.com', 2, '2025-11-16 23:04:49', 1, '103757754666261090529', 'https://lh3.googleusercontent.com/a/ACg8ocKzZ5PcT0FUyp6RvjZzlp9srf9446o5ttEQCJwnc-rbWokjzg54TQ=s96-c', 'google'),
	(39, 'Gisela Aldana', 'Rojas', 45304478, '2003-10-29', 1, NULL, '3815682626', 'rojasgiselaaldana@gmail.com', 2, '2025-11-17 02:35:12', 1, '105355326960342783890', 'https://lh3.googleusercontent.com/a/ACg8ocJ9zBNPaswfzT1ntmnEjJ5Ju0Qw1UAK2ltQTmNxygvdoBZteA0PMw=s96-c', 'google'),
	(40, 'Pablo Alejandro', 'Arancibia', 40440488, '1999-11-04', 2, NULL, '3818498798', 'pabloalejandroarancibia@gmail.com', 3, '2025-11-17 04:15:21', 1, '114991335054003996432', 'https://lh3.googleusercontent.com/a/ACg8ocK1GuyFC-KTXf0UeWRoLFoF_rrdEeKoo-tii_xHv9dt8ar5HQ=s96-c', 'google'),
	(42, 'Omar Adra', '', NULL, NULL, NULL, NULL, NULL, 'omiisk8nb@gmail.com', 2, '2025-11-28 23:40:06', 1, '106106187169004319715', 'https://lh3.googleusercontent.com/a/ACg8ocJzOHGuSNX2Uog7052iRtZUftWaKAKkddpIh8QemaD0TU0XxBE=s96-c', 'manual'),
	(43, 'Liliana Francisca', 'Rios', 16132673, '1972-02-25', 1, NULL, '3812022105', 'lilifrios2@gmail.com', 2, '2025-11-28 23:43:45', 1, '113770952253183226766', 'https://lh3.googleusercontent.com/a/ACg8ocIpgkEjuGG-A6xYPkOiV8-39JNfnxatArlrpydqZ6DKOtQ35A=s96-c', 'google');

-- Volcando estructura para tabla db_faketaxi.validacion_conductor
CREATE TABLE IF NOT EXISTS `validacion_conductor` (
  `id_validacion` int(6) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(6) NOT NULL,
  `fecha_validacion` date NOT NULL,
  `id_estado_validacion` int(6) DEFAULT NULL,
  `observaciones` varchar(250) NOT NULL DEFAULT 'EN ESPERA DE REVISION',
  PRIMARY KEY (`id_validacion`),
  KEY `id_estado_validacion` (`id_estado_validacion`),
  KEY `idx_validacion_usuario` (`id_usuario`),
  CONSTRAINT `validacion_conductor_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `validacion_conductor_ibfk_2` FOREIGN KEY (`id_estado_validacion`) REFERENCES `estado_validacion` (`id_estado_validacion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.validacion_conductor: ~3 rows (aproximadamente)
INSERT INTO `validacion_conductor` (`id_validacion`, `id_usuario`, `fecha_validacion`, `id_estado_validacion`, `observaciones`) VALUES
	(1, 40, '2025-11-12', 3, 'Tenes vencido el carnet\n'),
	(2, 18, '2025-11-12', 3, 'todo ok\n'),
	(3, 17, '2025-11-12', 3, 'ok\n');

-- Volcando estructura para tabla db_faketaxi.viajes
CREATE TABLE IF NOT EXISTS `viajes` (
  `id_viajes` int(11) NOT NULL AUTO_INCREMENT,
  `id_pasajero` int(6) DEFAULT NULL,
  `id_conductor` int(6) DEFAULT NULL,
  `direccion_desde` varchar(120) NOT NULL,
  `lat_desde` varchar(120) DEFAULT NULL,
  `lon_desde` varchar(120) DEFAULT NULL,
  `direccion_hasta` varchar(120) NOT NULL,
  `lat_hasta` varchar(120) DEFAULT NULL,
  `lon_hasta` varchar(120) DEFAULT NULL,
  `hora_inicio` timestamp NULL DEFAULT NULL,
  `hora_fin` timestamp NULL DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `valor` decimal(10,2) DEFAULT NULL,
  `precio_final` decimal(10,2) DEFAULT NULL,
  `distancia_km` decimal(10,2) DEFAULT NULL,
  `duracion_min` int(11) DEFAULT NULL,
  `id_estado` int(11) NOT NULL DEFAULT 1,
  `estado` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_viajes`),
  KEY `idx_viajes_conductor` (`id_conductor`),
  KEY `idx_viajes_pasajero` (`id_pasajero`),
  KEY `idx_viajes_fecha` (`fecha_inicio`),
  KEY `id_estado` (`id_estado`),
  CONSTRAINT `viajes_ibfk_1` FOREIGN KEY (`id_pasajero`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `viajes_ibfk_2` FOREIGN KEY (`id_conductor`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `viajes_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estado_vajes` (`id_estado_viajes`)
) ENGINE=InnoDB AUTO_INCREMENT=180 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla db_faketaxi.viajes: ~142 rows (aproximadamente)
INSERT INTO `viajes` (`id_viajes`, `id_pasajero`, `id_conductor`, `direccion_desde`, `lat_desde`, `lon_desde`, `direccion_hasta`, `lat_hasta`, `lon_hasta`, `hora_inicio`, `hora_fin`, `valor`, `id_estado`) VALUES
	(37, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391113', '-65.2063926', '9 de Julio 64, San Miguel de Tucumán, Tucumán', '-26.831870634637653', '-65.2045638486743', '2025-10-29 11:15:28', '2025-10-29 11:15:28', 3071.10, 5),
	(38, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391361', '-65.2063989', 'Chacabuco 37 1ero B , San Miguel de Tucumán, Tucumán', '-26.827655429159407', '-65.20007785409689', '2025-10-29 11:30:08', '2025-10-29 11:30:08', 3213.60, 5),
	(39, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391117', '-65.2063872', 'Combate de San Lorenzo 923, San Miguel de Tucumán, Tucumán', '-26.832214689485262', '-65.21186515688896', '2025-10-29 11:31:00', '2025-10-29 11:31:00', 3138.00, 5),
	(40, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391117', '-65.2063872', 'Combate de San Lorenzo 923, San Miguel de Tucumán, Tucumán', '-26.832214689485262', '-65.21186515688896', '2025-10-29 11:31:07', '2025-10-29 11:31:07', 3138.00, 5),
	(41, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391379', '-65.2064135', 'Congreso de Tucumán 798, San Miguel de Tucumán, Tucumán', '-26.842071865679905', '-65.20574200898409', '2025-10-29 11:32:01', '2025-10-29 11:32:01', 2170.80, 5),
	(42, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391379', '-65.2064135', 'Congreso de Tucumán 798, San Miguel de Tucumán, Tucumán', '-26.842071865679905', '-65.20574200898409', '2025-10-29 11:32:36', '2025-10-29 11:32:36', 2170.80, 5),
	(43, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391325', '-65.2063857', 'Gral. José de San Martín 1064, San Miguel de Tucumán, Tucumán', '-26.83010516806282', '-65.20748410373926', '2025-10-29 11:36:12', '2025-10-29 11:36:12', 3955.20, 5),
	(44, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391325', '-65.2063857', 'Gral. José de San Martín 1064, San Miguel de Tucumán, Tucumán', '-26.83010516806282', '-65.20748410373926', '2025-10-29 11:36:14', '2025-10-29 11:36:32', 3955.20, 3),
	(45, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391333', '-65.2063994', 'Av. Roque Sáenz Peña 381, San Miguel de Tucumán, Tucumán', '-26.837495052338728', '-65.19841153174639', '2025-10-29 11:37:25', '2025-10-29 11:37:28', 2532.30, 3),
	(46, 2, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391203', '-65.2063989', 'Buenos Aires 340, San Miguel de Tucumán, Tucumán', '-26.835307845219738', '-65.20744387060404', '2025-10-29 15:53:40', '2025-10-29 15:53:40', 1984.20, 5),
	(47, 2, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391203', '-65.2063989', 'Buenos Aires 340, San Miguel de Tucumán, Tucumán', '-26.835307845219738', '-65.20744387060404', '2025-10-29 15:53:55', '2025-10-29 15:53:55', 1984.20, 5),
	(48, 2, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391203', '-65.2063989', 'Buenos Aires 340, San Miguel de Tucumán, Tucumán', '-26.835307845219738', '-65.20744387060404', '2025-10-29 15:54:19', '2025-10-29 15:54:19', 1984.20, 5),
	(49, 2, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391141', '-65.206393', 'Congreso de Tucumán 246, San Miguel de Tucumán, Tucumán', '-26.834818402854413', '-65.20379137247801', '2025-10-29 15:57:18', '2025-10-29 15:57:18', 1743.60, 5),
	(50, 2, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391141', '-65.206393', 'Congreso de Tucumán 246, San Miguel de Tucumán, Tucumán', '-26.834818402854413', '-65.20379137247801', '2025-10-29 15:57:29', '2025-10-29 15:57:29', 1743.60, 5),
	(51, 17, NULL, 'Pcia de Mendoza 380, 380, San Miguel de Tucumán, Tucumán', '-26.8287627', '-65.2022944', 'Provincia de Córdoba 500, San Miguel de Tucumán, Tucumán, Argentina', '-26.8268924', '-65.203819', '2025-10-29 23:38:26', '2025-10-29 23:38:26', 2115.60, 5),
	(52, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390809', '-65.2063944', 'Provincia de Mendoza 490, San Miguel de Tucumán, Tucumán, Argentina', '-26.8284668', '-65.2038711', '2025-10-30 11:07:07', '2025-10-30 11:07:07', 3996.60, 5),
	(53, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391261', '-65.2064025', 'Gral. José María Paz 843, San Miguel de Tucumán, Tucumán', '-26.834769039662255', '-65.21125461906195', '2025-10-30 14:25:57', '2025-10-30 14:25:57', 2922.90, 5),
	(54, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390848', '-65.206403', 'IDP, San Miguel de Tucumán, Tucumán', '-26.841848399189118', '-65.20376287400723', '2025-10-30 14:38:35', '2025-10-30 14:38:35', 1504.50, 5),
	(55, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391326', '-65.2064059', '815, San Miguel de Tucumán, Provincia de Tucumán', '-26.838016194349475', '-65.2113800123334', '2025-10-30 14:39:14', '2025-10-30 14:39:14', 2562.30, 5),
	(56, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.839108', '-65.2064053', '9 de Julio 836, San Miguel de Tucumán, Tucumán', '-26.84234828145187', '-65.20745795220137', '2025-10-30 14:40:59', '2025-10-30 14:40:59', 2043.90, 5),
	(57, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391226', '-65.2063956', 'Plaza Los Decididos de Tucumán, San Miguel de Tucumán, Tucumán', '-26.839966416907135', '-65.21100349724293', '2025-10-30 14:43:32', '2025-10-30 14:43:32', 2242.50, 5),
	(58, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390759', '-65.2063795', 'Batalla de Ayacucho 474, San Miguel de Tucumán, Tucumán', '-26.836434212799126', '-65.210498906672', '2025-10-30 14:46:18', '2025-10-30 14:46:18', 2086.80, 5),
	(59, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391224', '-65.2064073', 'Hungría 750, San Miguel de Tucumán, Tucumán', '-26.84106940411802', '-65.21135084331036', '2025-10-30 15:10:53', '2025-10-30 15:10:53', 2962.80, 5),
	(60, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391228', '-65.2063928', 'Pcia de Jujuy 173, San Miguel de Tucumán, Tucumán', '-26.832001674781097', '-65.21159593015909', '2025-10-30 15:18:45', '2025-10-30 15:18:45', 3188.40, 5),
	(61, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390785', '-65.2063985', 'Combate de San Lorenzo 704, San Miguel de Tucumán, Tucumán', '-26.833046699540745', '-65.20877860486507', '2025-10-30 15:32:49', '2025-10-30 15:35:10', 2794.80, 3),
	(62, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391263', '-65.2064096', 'Combate de Las Piedras 808, San Miguel de Tucumán, Tucumán', '-26.834265533873218', '-65.21051399409771', '2025-10-30 15:52:23', '2025-10-30 15:52:32', 2393.40, 3),
	(63, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391125', '-65.2064094', 'Provincia de Mendoza 390, San Miguel de Tucumán, Tucumán, Argentina', '-26.8288601', '-65.2024953', '2025-10-30 15:54:28', '2025-10-30 15:54:28', 3336.60, 5),
	(64, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390898', '-65.2064065', 'Congreso de Tucumán 171, San Miguel de Tucumán, Tucumán', '-26.833371304467406', '-65.2040870860219', '2025-10-30 15:55:29', '2025-10-30 15:55:29', 2667.00, 5),
	(65, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391201', '-65.2064022', 'San Lorenzo y Jujuy, San Miguel de Tucumán, Tucumán', '-26.832366671641665', '-65.21206296980381', '2025-10-31 13:31:59', '2025-10-31 13:31:59', 3117.00, 5),
	(66, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391201', '-65.2064022', 'San Lorenzo y Jujuy, San Miguel de Tucumán, Tucumán', '-26.832366671641665', '-65.21206296980381', '2025-10-31 13:31:59', '2025-10-31 13:32:46', 3117.00, 3),
	(67, 15, NULL, '12 de Octubre 741, San Miguel de Tucumán, Tucumán', '-26.8178106', '-65.2173422', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2025-10-31 17:38:36', '2025-10-31 17:38:46', 3068.10, 3),
	(68, 32, NULL, 'Adolfo de la Vega 473, San Miguel de Tucumán, Tucumán, Argentina', '-26.8268525', '-65.2532196', 'San Miguel de Tucumán, Tucumán, Argentina', '-26.8082848', '-65.2175903', '2025-11-05 03:08:46', '2025-11-05 03:08:58', 7659.60, 3),
	(69, 32, NULL, 'Av. Adolfo de la Vega 473, San Miguel de Tucumán, Tucumán, Argentina', '-26.8268525', '-65.2532196', 'Paraguay 873, San Miguel de Tucumán, Tucumán, Argentina', '-26.8082747', '-65.20475429999999', '2025-11-14 22:33:45', '2025-11-14 22:34:15', 9403.80, 3),
	(70, 15, NULL, 'Marcos Paz 1501 4400, San Miguel de Tucumán, Tucumán', '-26.8181318', '-65.2175845', 'Marco Avellaneda 56, San Miguel de Tucumán, Tucumán, Argentina', '-26.8280673', '-65.2157635', '2025-11-15 16:10:10', '2025-11-15 16:13:10', 3410.70, 3),
	(71, 15, NULL, '12 de Octubre 701, San Miguel de Tucumán, Tucumán', '-26.8181302', '-65.2175607', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-15 16:14:12', '2025-11-15 16:14:25', 4059.00, 3),
	(72, 15, NULL, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8179083', '-65.2173962', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-15 16:22:02', '2025-11-15 16:22:02', 4028.70, 5),
	(73, 15, NULL, '12 de Octubre 745, San Miguel de Tucumán, Tucumán', '-26.8176917', '-65.2173467', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:01:34', '2025-11-16 00:01:34', 4000.20, 5),
	(74, 15, NULL, '12 de Octubre 745, San Miguel de Tucumán, Tucumán', '-26.8176917', '-65.2173467', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:05:16', '2025-11-16 00:05:16', 4000.20, 5),
	(75, 15, NULL, '12 de Octubre 745, San Miguel de Tucumán, Tucumán', '-26.8176917', '-65.2173467', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:08:08', '2025-11-16 00:08:08', 4000.20, 5),
	(76, 15, NULL, '12 de Octubre 745, San Miguel de Tucumán, Tucumán', '-26.8176917', '-65.2173467', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:08:51', '2025-11-16 00:08:51', 4000.20, 5),
	(77, 15, NULL, '12 de Octubre 745, San Miguel de Tucumán, Tucumán', '-26.8176917', '-65.2173467', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:15:08', '2025-11-16 00:15:08', 4000.20, 5),
	(78, 15, NULL, '12 de Octubre 733, San Miguel de Tucumán, Tucumán', '-26.8178454', '-65.2173199', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:18:04', '2025-11-16 00:18:04', 4019.10, 5),
	(79, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 04:54:14', '2025-11-16 04:55:02', 3377.70, 4),
	(80, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 06:01:16', '2025-11-16 06:01:16', 3377.70, 5),
	(81, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 06:07:47', '2025-11-16 06:07:47', 3377.70, 5),
	(82, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 06:10:11', '2025-11-16 06:10:11', 3377.70, 5),
	(83, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 07:26:08', '2025-11-16 07:26:08', 3377.70, 5),
	(84, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 07:26:53', '2025-11-16 07:26:53', 3377.70, 5),
	(85, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 07:36:28', '2025-11-16 07:36:28', 3377.70, 5),
	(86, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 17:21:39', '2025-11-16 18:31:05', 3377.70, 3),
	(88, 2, NULL, 'Plaza Independencia', '-26.83', '-65.2', 'Terminal de Ómnibus', '-26.84', '-65.21', '2025-11-16 20:20:53', '2025-11-16 20:31:25', 1000.00, 3),
	(89, 15, NULL, '12 de Octubre 733, San Miguel de Tucumán, Tucumán', '-26.8178982', '-65.2173282', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 20:29:09', '2025-11-16 20:29:09', 4026.00, 5),
	(90, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 91, San Miguel de Tucumán, Tucumán, Argentina', '-26.8217576', '-65.2405014', '2025-11-16 20:33:02', '2025-11-16 20:33:05', 3363.30, 3),
	(91, 15, NULL, '12 de Octubre 715, San Miguel de Tucumán, Tucumán', '-26.8179442', '-65.2174189', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 20:55:59', '2025-11-16 20:55:59', 4033.80, 5),
	(92, 15, NULL, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8179084', '-65.2174137', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 21:05:10', '2025-11-16 21:05:10', 4028.70, 5),
	(93, 15, NULL, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8178917', '-65.2173962', 'Provincia de Mendoza 380, San Miguel de Tucumán, Tucumán, Argentina', '-26.828766', '-65.202393', '2025-11-16 21:11:39', '2025-11-16 21:11:39', 4441.80, 5),
	(94, 15, NULL, '12 de Octubre 715, San Miguel de Tucumán, Tucumán', '-26.8179688', '-65.2173755', 'Maipú 35, San Miguel de Tucumán, Tucumán, Argentina', '-26.8298948', '-65.2076336', '2025-11-16 21:18:13', '2025-11-16 21:18:19', 4059.90, 3),
	(95, 15, NULL, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8179177', '-65.2174159', 'JGR, 12 de Octubre 880, San Miguel de Tucumán, Tucumán, Argentina', '-26.8158458', '-65.2170581', '2025-11-16 21:24:29', '2025-11-16 21:24:29', 1165.20, 5),
	(96, 15, NULL, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8178938', '-65.2174029', 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán, Argentina', '-26.8404475', '-65.24768879999999', '2025-11-16 21:28:03', '2025-11-16 21:28:17', 7960.20, 3),
	(97, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 21:28:54', '2025-11-16 21:29:03', 3377.70, 3),
	(98, 15, NULL, '12 de Octubre 735, San Miguel de Tucumán, Tucumán', '-26.8179416', '-65.2172809', 'Córdoba 45, San Miguel de Tucumán, Comunitat Valenciana, Argentina', '-26.8286596', '-65.2694362', '2025-11-16 21:44:00', '2025-11-16 22:42:27', 9261.00, 5),
	(99, 15, 2, '12 de Octubre 733, San Miguel de Tucumán, Tucumán', '-26.8179075', '-65.2173119', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2025-11-16 21:46:34', '2025-11-16 22:43:27', 3080.10, 1),
	(100, 38, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287622', '-65.2022823', 'Raúl Colombres 1044, San Miguel de Tucumán, Tucumán, Argentina', '-26.8168403', '-65.1776318', '2025-11-16 23:10:53', '2025-11-16 23:11:30', 5591.40, 3),
	(101, 38, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287492', '-65.2022824', 'Bernardo de Monteagudo 695, San Miguel de Tucumán, Tucumán', '-26.82243085788851', '-65.19799444824457', '2025-11-16 23:11:45', '2025-11-16 23:13:22', 2249.70, 3),
	(102, 38, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287772', '-65.2022849', 'Pcia de Córdoba 836, San Miguel de Tucumán, Tucumán', '-26.82623067877552', '-65.20910549908876', '2025-11-16 23:14:04', '2025-11-16 23:14:04', 2803.50, 5),
	(103, 17, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287727', '-65.2022837', 'Av. República del Líbano 1848, San Miguel de Tucumán, Tucumán', '-26.803291287819345', '-65.21257292479277', '2025-11-16 23:17:36', '2025-11-16 23:18:43', 6468.90, 3),
	(104, 17, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287735', '-65.2022773', 'Santiago del Estero 716, San Miguel de Tucumán, Tucumán', '-26.82378953289039', '-65.20647324621677', '2025-11-16 23:18:50', '2025-11-16 23:19:03', 2791.80, 3),
	(105, 38, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287778', '-65.2022941', 'Balcarce 481, San Miguel de Tucumán, Tucumán', '-26.82579565062326', '-65.19666340202093', '2025-11-16 23:20:58', '2025-11-16 23:20:58', 2801.10, 5),
	(106, 38, 17, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287914', '-65.2022923', 'Pje. 1º de Mayo 207, San Miguel de Tucumán, Tucumán', '-26.817172234160896', '-65.19009936600924', '2025-11-16 23:29:55', '2025-11-17 00:08:01', 3852.30, 3),
	(107, 38, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287903', '-65.2022911', 'Pcia de Corrientes 103, San Miguel de Tucumán, Tucumán', '-26.823792824089498', '-65.19699599593878', '2025-11-17 00:07:25', '2025-11-17 00:08:32', 2236.20, 3),
	(108, 38, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287861', '-65.2022891', 'CAO, San Miguel de Tucumán, Tucumán', '-26.833034134170042', '-65.20643904805183', '2025-11-17 00:08:44', '2025-11-17 00:09:29', 2945.70, 3),
	(109, 38, 17, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287631', '-65.202263', '25 de Mayo 466, San Miguel de Tucumán, Tucumán', '-26.82478676184972', '-65.20330019295216', '2025-11-17 00:09:42', '2025-11-17 00:10:55', 2506.50, 3),
	(110, 38, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287767', '-65.2022829', 'Balcarce 649, San Miguel de Tucumán, Tucumán', '-26.823316496822684', '-65.1963472366333', '2025-11-17 00:12:06', '2025-11-17 00:12:12', 2973.30, 3),
	(111, 38, 17, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287798', '-65.2023079', 'Pcia de Corrientes 311, San Miguel de Tucumán, Tucumán', '-26.823305725579928', '-65.20007986575365', '2025-11-17 00:13:19', '2025-11-17 00:13:28', 2609.40, 3),
	(112, 38, 17, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287807', '-65.2023171', 'Av. Nicolás Avellaneda 648, San Miguel de Tucumán, Tucumán', '-26.823524441447365', '-65.19563376903534', '2025-11-17 00:13:52', '2025-11-17 00:13:57', 3102.00, 1),
	(113, 38, 17, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287897', '-65.2023033', 'Av. Nicolás Avellaneda 648, San Miguel de Tucumán, Tucumán', '-26.823519953437913', '-65.1955895125866', '2025-11-17 00:14:40', '2025-11-17 00:15:24', 3097.80, 3),
	(114, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287797', '-65.2022928', 'Dr, San Miguel de Tucumán, Tucumán', '-26.8224479124874', '-65.19684512168169', '2025-11-17 00:33:15', '2025-11-17 00:33:19', 2917.50, 1),
	(115, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287858', '-65.2023029', 'Av. Nicolás Avellaneda 431, San Miguel de Tucumán, Tucumán', '-26.826558594352914', '-65.19550669938326', '2025-11-17 00:38:32', '2025-11-17 00:38:36', 2124.60, 1),
	(116, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287789', '-65.2022837', 'Ste Anne, Ste Anne, Manitoba', '51.01628452513507', '-96.49340037256479', '2025-11-17 00:51:40', '2025-11-17 00:52:06', 900.00, 3),
	(117, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287716', '-65.2022755', 'Marcos Paz 302, San Miguel de Tucumán, Tucumán', '-26.822153795097808', '-65.19968155771494', '2025-11-17 00:56:26', '2025-11-17 00:56:28', 2499.90, 1),
	(118, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287734', '-65.2022963', 'San Juan 297, San Miguel de Tucumán, Tucumán', '-26.826131645691', '-65.20037356764078', '2025-11-17 01:16:06', '2025-11-17 01:16:06', 2309.70, 2),
	(119, 17, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287818', '-65.2022798', 'Pcia de Corrientes 116, San Miguel de Tucumán, Tucumán', '-26.82430176200297', '-65.19742749631405', '2025-11-17 01:18:45', '2025-11-17 01:18:45', 2641.20, 5),
	(120, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287813', '-65.2022764', 'Pcia de Córdoba 226, San Miguel de Tucumán, Tucumán', '-26.82785528771308', '-65.19974324852228', '2025-11-17 01:19:03', '2025-11-17 01:19:06', 1530.00, 1),
	(121, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.82877', '-65.2022627', 'Provincia de, San Miguel de Tucumán, Tucumán', '-26.82512066553449', '-65.2070539444685', '2025-11-17 01:22:34', '2025-11-17 01:22:37', 3051.90, 1),
	(122, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287718', '-65.2022876', 'Marcos Paz 212 5 Piso Of B, San Miguel de Tucumán, Tucumán', '-26.82233092387148', '-65.19830491393805', '2025-11-17 01:24:19', '2025-11-17 01:24:21', 2317.80, 1),
	(123, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404215', '-65.2476574', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-17 01:25:32', '2025-11-17 01:26:24', 8765.10, 3),
	(124, 17, 38, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287623', '-65.2022877', 'Pcia de Mendoza 39, San Miguel de Tucumán, Tucumán', '-26.828953007524433', '-65.19703857600689', '2025-11-17 01:26:45', '2025-11-17 01:27:22', 1593.90, 3),
	(125, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404363', '-65.2476617', 'Bernardino Rivadavia 932, San Miguel de Tucumán, Tucumán, Argentina', '-26.818727', '-65.198805', '2025-11-17 01:27:24', '2025-11-17 01:28:08', 10619.10, 3),
	(126, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287681', '-65.2022766', 'Pcia de Salta 465, San Miguel de Tucumán, Tucumán', '-26.823460711696466', '-65.20911555737257', '2025-11-17 01:39:53', '2025-11-17 01:39:55', 3186.90, 1),
	(127, 15, 18, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8178922', '-65.217428', 'Junín 238, San Miguel de Tucumán, Tucumán, Argentina', '-26.826874', '-65.20856429999999', '2025-11-17 02:32:20', '2025-11-17 02:33:11', 4349.10, 3),
	(128, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 04:01:40', '2025-11-17 04:01:43', 3377.70, 3),
	(129, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 04:25:00', '2025-11-17 04:25:23', 3377.70, 3),
	(130, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 04:30:32', '2025-11-17 04:31:11', 3377.70, 3),
	(131, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 04:42:46', '2025-11-17 04:44:43', 3377.70, 3),
	(132, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 06:38:00', '2025-11-17 06:38:54', 3377.70, 3),
	(133, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Provincia de Mendoza 380, San Miguel de Tucumán, Tucumán, Argentina', '-26.828766', '-65.202393', '2025-11-17 06:40:41', '2025-11-17 06:40:49', 900.00, 1),
	(134, 17, NULL, 'Lavaissé, San Miguel de Tucumán, Tucumán, Argentina', '-26.8490419', '-65.2418943', 'Parque Guillermina, San Miguel de Tucumán, Tucumán', '-26.820158384430325', '-65.25753077119589', '2025-11-17 12:04:36', '2025-11-17 12:04:38', 7392.60, 3),
	(135, 17, NULL, 'Lavaisse Benjamin Presbitero, San Miguel de Tucumán, Tucumán, Argentina', '-26.8542285', '-65.2170669', 'Parque Guillermina, Avenida Mate de Luna, San Miguel de Tucumán, Tucumán, Argentina', '-26.8240367', '-65.260453', '2025-11-17 12:05:18', '2025-11-17 12:05:22', 9661.50, 3),
	(136, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 12:52:30', '2025-11-17 12:52:38', 3377.70, 3),
	(137, 34, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287594', '-65.2022761', 'Bernardo de Monteagudo 737, San Miguel de Tucumán, Tucumán', '-26.821869251505042', '-65.19748482853174', '2025-11-17 16:18:06', '2025-11-17 16:18:08', 2341.20, 3),
	(138, 15, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287598', '-65.2022954', 'Av. 24 de Septiembre 154, San Miguel de Tucumán, Tucumán', '-26.832364577400728', '-65.19966311752796', '2025-11-17 16:43:01', '2025-11-17 16:43:05', 1763.10, 3),
	(139, 15, NULL, 'Laprida 209, San Miguel de Tucumán, Tucumán', '-26.8284045', '-65.2021357', '12 de Octubre 741, San Miguel de Tucumán, Tucumán, Argentina', '-26.8178055', '-65.21727419999999', '2025-11-17 16:43:34', '2025-11-17 16:44:00', 4648.50, 3),
	(140, 14, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287677', '-65.202296', 'Marco Avellaneda 100, San Miguel de Tucumán, Tucumán', '-26.827386457285883', '-65.21518472582102', '2025-11-17 16:53:54', '2025-11-17 16:53:54', 3193.20, 5),
	(141, 14, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287692', '-65.2023003', 'Santiago del Estero 628, San Miguel de Tucumán, Tucumán', '-26.823943919946146', '-65.2048521861434', '2025-11-17 16:54:23', '2025-11-17 16:54:27', 2609.10, 3),
	(142, 14, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287529', '-65.2023756', 'Pcia de Corrientes 637, San Miguel de Tucumán, Tucumán', '-26.82230339712076', '-65.20443510264158', '2025-11-17 16:54:40', '2025-11-17 16:54:59', 3567.60, 3),
	(143, 14, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287687', '-65.202298', 'Batalla de Chacabuco 83, San Miguel de Tucumán, Tucumán', '-26.831433833064676', '-65.2081000059843', '2025-11-17 16:57:32', '2025-11-17 16:58:02', 2527.20, 3),
	(144, 15, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287755', '-65.2022989', 'Junín 500, San Miguel de Tucumán, Tucumán, Argentina', '-26.823109', '-65.20761', '2025-11-17 16:59:00', '2025-11-17 16:59:42', 3138.30, 3),
	(145, 15, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287843', '-65.2022927', '25 de Mayo 250, San Miguel de Tucumán, Tucumán', '-26.827752665775222', '-65.20404350012541', '2025-11-17 16:59:55', '2025-11-17 17:03:16', 2237.40, 3),
	(146, 15, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287838', '-65.2023173', 'Junín 500, San Miguel de Tucumán, Tucumán, Argentina', '-26.823109', '-65.20761', '2025-11-17 17:03:27', '2025-11-17 17:06:00', 3140.10, 3),
	(147, 15, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287601', '-65.2022806', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-17 17:07:03', '2025-11-17 17:07:15', 2253.30, 3),
	(148, 15, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287663', '-65.2022828', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-17 17:07:49', '2025-11-17 17:08:10', 2253.30, 3),
	(149, 15, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287692', '-65.2022868', 'Maipú 60, Tucumán, Argentina', '-26.814013', '-65.2038645', '2025-11-17 17:10:03', '2025-11-17 17:10:41', 4445.10, 3),
	(150, 15, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287653', '-65.2022868', 'Maipú 65, San Miguel de Tucumán, Tucumán, Argentina', '-26.8296368', '-65.2074171', '2025-11-17 17:10:55', '2025-11-17 17:11:47', 2232.30, 3),
	(151, 15, 17, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287684', '-65.202297', 'Maipú 70, San Miguel de Tucumán, Tucumán, Argentina', '-26.8294799', '-65.2077546', '2025-11-17 17:16:26', '2025-11-17 17:45:13', 2222.10, 3),
	(152, 15, 17, 'Bernardo de Monteagudo 149, San Miguel de Tucumán, Tucumán', '-26.8302456', '-65.199485', 'Laprida 500, San Miguel de Tucumán, Tucumán, Argentina', '-26.8246318', '-65.2017348', '2025-11-17 18:11:44', '2025-11-17 18:12:03', 2184.90, 1),
	(153, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Av. Estado de Israel 1598, San Miguel de Tucumán, Tucumán', '-26.80199880229072', '-65.23601979017258', '2025-11-21 06:37:16', '2025-11-21 06:37:19', 2340.90, 3),
	(154, 32, NULL, 'Paraguay 873, San Miguel de Tucumán, Tucumán, Argentina', '-26.8082747', '-65.20475429999999', 'Av. Aconquija 655, Yerba Buena, Tucumán, Argentina', '-26.8164155', '-65.2747375', '2025-11-28 22:04:09', '2025-11-28 22:04:09', 11038.80, 5),
	(155, 32, NULL, 'Paraguay 873, San Miguel de Tucumán, Tucumán, Argentina', '-26.8082747', '-65.20475429999999', 'Av. Aconquija 655, Yerba Buena, Tucumán, Argentina', '-26.8164155', '-65.2747375', '2025-11-28 22:04:12', '2025-11-28 22:04:12', 11038.80, 5),
	(156, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081316', '-65.2047184', 'Santa Fe 3442, San Miguel de Tucumán, Tucumán, Argentina', '-26.8113852', '-65.246017', '2025-11-29 00:09:08', '2025-11-29 00:09:08', 7095.30, 5),
	(157, 14, NULL, 'Pje. Ignacio Paz 3818, San Miguel de Tucumán, Tucumán, Argentina', '-26.8107411', '-65.2517688', 'Asunción 150, San Miguel de Tucumán, Tucumán', '-26.824440889253406', '-65.22256281226873', '2025-11-29 20:50:56', '2025-11-29 20:50:56', 5348.40, 5),
	(158, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081568', '-65.2046793', 'Bolivia 309, San Miguel de Tucumán, Tucumán', '-26.81233797483001', '-65.19731182605028', '2025-12-02 07:21:11', '2025-12-02 07:21:11', 2323.20, 5),
	(159, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081365', '-65.2047096', 'Junín 1275, San Miguel de Tucumán, Tucumán', '-26.812853846446597', '-65.20476669073105', '2025-12-02 07:22:33', '2025-12-02 07:22:33', 1832.10, 5),
	(160, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081339', '-65.2047103', 'Junín 1298, San Miguel de Tucumán, Tucumán', '-26.81253217503545', '-65.20518209785223', '2025-12-02 07:24:34', '2025-12-02 07:24:34', 2037.30, 5),
	(161, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081362', '-65.2047184', 'Pje. Quilmes 1488, San Miguel de Tucumán, Tucumán', '-26.80992974495009', '-65.20414609462023', '2025-12-02 07:25:10', '2025-12-02 07:25:10', 1245.30, 5),
	(162, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081609', '-65.2046772', 'Junín 1442, San Miguel de Tucumán, Tucumán', '-26.810363337828452', '-65.20483441650867', '2025-12-02 07:35:31', '2025-12-02 07:35:31', 1580.10, 5),
	(163, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081586', '-65.204676', 'Junín 960, San Miguel, Tucumán', '-26.816922985796246', '-65.20632069557905', '2025-12-02 07:45:51', '2025-12-02 07:45:51', 2017.80, 5),
	(164, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081341', '-65.2047175', 'Maipú 1198, San Miguel de Tucumán, Tucumán', '-26.813847281693516', '-65.20394459366798', '2025-12-02 07:46:57', '2025-12-02 07:46:57', 1982.10, 5),
	(165, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081637', '-65.2046837', 'Junín 1466, San Miguel de Tucumán, Tucumán', '-26.810097915745725', '-65.20492661744356', '2025-12-02 07:58:32', '2025-12-02 07:58:32', 1612.50, 5),
	(166, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081634', '-65.204678', 'Av. República de Siria 1177, San Miguel de Tucumán, Tucumán', '-26.81391490678841', '-65.20680919289589', '2025-12-02 08:00:45', '2025-12-02 08:00:45', 2660.10, 5),
	(167, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.808136', '-65.2047167', 'Av. República de Siria 1232, San Miguel de Tucumán, Tucumán', '-26.812981317841665', '-65.20683366805315', '2025-12-02 08:01:07', '2025-12-02 08:01:07', 1611.90, 5),
	(168, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081393', '-65.2047135', 'Junín 1344, San Miguel de Tucumán, Tucumán', '-26.811682359660708', '-65.2051281183958', '2025-12-02 08:13:03', '2025-12-02 08:13:03', 1977.60, 5),
	(169, 43, 32, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081396', '-65.2047221', 'Av. República de Siria 1175, San Miguel de Tucumán, Tucumán', '-26.813801799306116', '-65.20671028643847', '2025-12-02 08:14:22', '2025-12-02 08:14:29', 2669.70, 1),
	(170, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081307', '-65.2047148', 'Av. República de Siria 1255, San Miguel de Tucumán, Tucumán', '-26.81279699296127', '-65.20648833364248', '2025-12-02 08:17:55', '2025-12-02 08:17:55', 2178.60, 5),
	(171, 43, 32, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081599', '-65.2046787', 'Av. República de Siria 1374, San Miguel de Tucumán, Tucumán', '-26.81120508379584', '-65.20630929619074', '2025-12-02 08:19:15', '2025-12-02 08:19:24', 1386.30, 1),
	(172, 43, 32, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081315', '-65.2047221', 'Chile 894, San Miguel de Tucumán, Tucumán', '-26.81228740492224', '-65.20630963146687', '2025-12-02 08:43:45', '2025-12-02 08:43:49', 2022.30, 1),
	(173, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081389', '-65.2047205', 'Av. República de Siria 1241, San Miguel de Tucumán, Tucumán', '-26.81161772555464', '-65.20583588629961', '2025-12-02 08:48:19', '2025-12-02 08:48:19', 2135.40, 5),
	(174, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081357', '-65.2047221', 'Av. República de Siria 1390, San Miguel de Tucumán, Tucumán', '-26.81100190430695', '-65.20628113299608', '2025-12-02 08:48:59', '2025-12-02 08:48:59', 1355.10, 5),
	(175, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.808137', '-65.2047198', 'Uruguay 869, San Miguel de Tucumán, Tucumán', '-26.813250323906836', '-65.20616445690393', '2025-12-02 08:58:40', '2025-12-02 08:58:40', 1754.10, 5),
	(176, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081348', '-65.2047276', 'Perú 910, San Miguel de Tucumán, Tucumán', '-26.80953295663942', '-65.20588584244251', '2025-12-02 08:59:59', '2025-12-02 08:59:59', 1182.60, 5),
	(177, 14, NULL, 'Zuviría 3318, San Miguel de Tucumán, Tucumán', '-26.8072144', '-65.2430169', 'Av. Mate De Luna X Groussac, San Miguel de Tucumán, Tucumán', '-26.82685180273334', '-65.22417582571507', '2025-12-09 17:14:25', '2025-12-09 17:14:25', 6000.90, 5),
	(178, 14, NULL, 'Zuviría 3318, San Miguel de Tucumán, Tucumán', '-26.8072256', '-65.2430174', 'Plaza Eva Perón, San Miguel de Tucumán, Tucumán', '-26.80994949455824', '-65.23529961705208', '2025-12-09 17:58:41', '2025-12-09 17:58:41', 2345.10, 5),
	(179, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Pcia de Mendoza 1601, San Miguel de Tucumán, Tucumán', '-26.82469670342934', '-65.22097561508417', '2025-12-09 18:31:06', '2025-12-09 18:31:06', 5370.60, 5);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
