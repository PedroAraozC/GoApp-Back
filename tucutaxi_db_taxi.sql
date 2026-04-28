-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql-tucutaxi.alwaysdata.net
-- Generation Time: Apr 28, 2026 at 08:33 PM
-- Server version: 10.11.15-MariaDB
-- PHP Version: 8.4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tucutaxi_db_taxi`
--

-- --------------------------------------------------------

--
-- Table structure for table `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id_calificacion` int(11) NOT NULL,
  `id_viaje` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_conductor` int(11) NOT NULL,
  `tipo` enum('PASAJERO_A_CONDUCTOR','CONDUCTOR_A_PASAJERO') NOT NULL,
  `calificacion` tinyint(4) NOT NULL,
  `comentario` varchar(255) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conductores`
--

CREATE TABLE `conductores` (
  `id_conductor` int(6) NOT NULL,
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
  `fecha_solicitud` timestamp NOT NULL,
  `habilita` int(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conductores`
--

INSERT INTO `conductores` (`id_conductor`, `id_usuario`, `conectado`, `licencia`, `vencimiento_licencia`, `vencimiento_carnet`, `poliza_seguro`, `vencimiento_seguro`, `id_validacion_conductor`, `foto_vehiculo`, `foto_conductor`, `nro_motor`, `nro_chasis`, `matricula`, `marca_vehiculo`, `modelo_vehiculo`, `año_vehiculo`, `id_tipo_vehiculo`, `fecha_solicitud`, `habilita`) VALUES
(1, 40, 1, '4938', '2025-11-12', '2029-06-12', '50/926671', '2026-07-10', 1, NULL, NULL, '552820597932535', ' 8AP359A02NU157691', 'AE998RM', 'FIAT', 'CRONOS', 2019, 1, '2025-11-11 23:00:00', 1),
(2, 18, 1, '4938', '2025-11-12', '2029-06-12', '50/926671', '2026-07-10', 2, NULL, NULL, '552820597932535', ' 8AP359A02NU157691', 'AE998RM', 'FIAT', 'CRONOS', 2019, 1, '2025-11-11 23:00:00', 1),
(3, 17, 1, '4938', '2025-11-12', '2029-06-12', '50/926671', '2026-07-10', 3, NULL, NULL, '552820597932535', ' 8AP359A02NU157691', 'AE998RM', 'FIAT', 'CRONOS', 2019, 1, '2025-11-11 23:00:00', 1),
(5, 76, 0, '0303456', '2026-01-24', '2026-01-03', '0000009', '2026-01-11', NULL, NULL, NULL, '2', '32', 'AE997RM', 'Mondongo', 'C3p', 2026, 15, '0000-00-00 00:00:00', 1),
(6, 34, 0, '0303456', '2026-01-01', '2026-01-01', '0000009', '2026-01-01', NULL, NULL, NULL, '2', '32', 'asnd9sd', 'Mondongo', 'C3p', 2, 12, '0000-00-00 00:00:00', 1),
(7, 32, 0, '55555', '2026-01-01', '2026-01-01', '123456', '2026-01-01', NULL, NULL, NULL, '4564a874', '6546541326458', '02asd51', 'suzuki', 'fun', 205, 7, '0000-00-00 00:00:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `conductor_imagenes`
--

CREATE TABLE `conductor_imagenes` (
  `id_imagen` int(11) NOT NULL,
  `id_conductor` int(11) NOT NULL,
  `tipo_imagen` enum('perfil','dni_frente','dni_dorso','tarjeta_verde','seguro','vehiculo_frente','vehiculo_lado_izq','vehiculo_lado_der') NOT NULL,
  `nombre_archivo` varchar(150) NOT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `mime_type` varchar(50) DEFAULT NULL,
  `tamaño_bytes` int(11) DEFAULT NULL,
  `fecha_carga` timestamp NULL DEFAULT current_timestamp(),
  `activa` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conductor_imagenes`
--

INSERT INTO `conductor_imagenes` (`id_imagen`, `id_conductor`, `tipo_imagen`, `nombre_archivo`, `ruta_archivo`, `mime_type`, `tamaño_bytes`, `fecha_carga`, `activa`) VALUES
(1, 7, 'perfil', 'perfil_7_1769776744493.png', '\\imagenes\\conductores\\7\\perfil_7_1769776744493.png', 'image/png', 693839, '2026-01-30 12:39:05', 1),
(2, 7, 'dni_frente', 'dni_frente_7_1769776745864.jpg', '\\imagenes\\conductores\\7\\dni_frente_7_1769776745864.jpg', 'image/jpeg', 529118, '2026-01-30 12:39:07', 1),
(3, 7, 'dni_dorso', 'dni_dorso_7_1769776747194.pdf', '\\imagenes\\conductores\\7\\dni_dorso_7_1769776747194.pdf', 'application/pdf', 266611, '2026-01-30 12:39:08', 1),
(4, 7, '', 'licencia_7_1769776748507.pdf', '\\imagenes\\conductores\\7\\licencia_7_1769776748507.pdf', 'application/pdf', 12264, '2026-01-30 12:39:09', 1),
(5, 7, 'seguro', 'seguro_7_1769776749958.png', '\\imagenes\\conductores\\7\\seguro_7_1769776749958.png', 'image/png', 27673, '2026-01-30 12:39:11', 0),
(6, 7, '', 'vehiculo_7_1769776751220.pdf', '\\imagenes\\conductores\\7\\vehiculo_7_1769776751220.pdf', 'application/pdf', 25557, '2026-01-30 12:39:12', 1),
(7, 7, 'seguro', 'seguro_7_1769778968043.pdf', '\\imagenes\\conductores\\7\\seguro_7_1769778968043.pdf', 'application/pdf', 25557, '2026-01-30 13:16:09', 1),
(8, 1, 'perfil', 'perfil_1_1769782625234.jpg', 'conductores\\1\\perfil_1_1769782625234.jpg', 'image/jpeg', 529118, '2026-01-30 14:17:07', 0),
(9, 1, 'perfil', 'perfil_1_1770644580768.jpeg', 'conductores\\1\\perfil_1_1770644580768.jpeg', 'image/jpeg', 205906, '2026-02-09 13:43:01', 1),
(10, 1, 'dni_frente', 'dni_frente_1_1770652272535.pdf', '/home/tucutaxi/imagenes/conductores/1/dni_frente_1_1770652272535.pdf', 'application/pdf', 266611, '2026-02-09 15:51:13', 0),
(11, 1, 'dni_frente', 'dni_frente_1_1770652404312.pdf', '/home/tucutaxi/imagenes/conductores/1/dni_frente_1_1770652404312.pdf', 'application/pdf', 266611, '2026-02-09 15:53:25', 0),
(12, 1, 'dni_frente', 'dni_frente_1_1770652470470.pdf', '/home/tucutaxi/imagenes/conductores/1/dni_frente_1_1770652470470.pdf', 'application/pdf', 266611, '2026-02-09 15:54:31', 0),
(13, 1, 'dni_frente', 'dni_frente_1_1770652531893.pdf', '/home/tucutaxi/imagenes/conductores/1/dni_frente_1_1770652531893.pdf', 'application/pdf', 266611, '2026-02-09 15:55:32', 0),
(14, 1, 'dni_frente', 'dni_frente_1_1770652668301.pdf', '/home/tucutaxi/imagenes/conductores/1/dni_frente_1_1770652668301.pdf', 'application/pdf', 266611, '2026-02-09 15:57:48', 0),
(15, 1, 'dni_frente', 'dni_frente_1_1770652955994.pdf', 'conductores/1/dni_frente_1_1770652955994.pdf', 'application/pdf', 266611, '2026-02-09 16:02:36', 1),
(16, 2, 'perfil', 'perfil_2_1770769224031.png', 'conductores/2/perfil_2_1770769224031.png', 'image/png', 774392, '2026-02-11 00:20:25', 1);

-- --------------------------------------------------------

--
-- Table structure for table `estado_vajes`
--

CREATE TABLE `estado_vajes` (
  `id_estado_viajes` int(11) NOT NULL,
  `nombre_estado_viajes` varchar(50) NOT NULL DEFAULT '""',
  `habilita` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estado_vajes`
--

INSERT INTO `estado_vajes` (`id_estado_viajes`, `nombre_estado_viajes`, `habilita`) VALUES
(1, 'Asignado', 1),
(2, 'En Curso', 1),
(3, 'Cancelado', 1),
(4, 'Finalizado', 1),
(5, 'Buscando', 1),
(6, 'En camino al encuentro', 1),
(7, 'Esperando pasajero', 1);

-- --------------------------------------------------------

--
-- Table structure for table `estado_validacion`
--

CREATE TABLE `estado_validacion` (
  `id_estado_validacion` int(6) NOT NULL,
  `nombre_estado` varchar(50) NOT NULL,
  `habilita` int(2) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estado_validacion`
--

INSERT INTO `estado_validacion` (`id_estado_validacion`, `nombre_estado`, `habilita`) VALUES
(1, 'PENDIENTE', 1),
(2, 'RECHAZADO', 1),
(3, 'APROBADO', 1);

-- --------------------------------------------------------

--
-- Table structure for table `generos`
--

CREATE TABLE `generos` (
  `id_genero` int(2) NOT NULL,
  `nombre_genero` varchar(50) NOT NULL,
  `habilita` int(2) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `generos`
--

INSERT INTO `generos` (`id_genero`, `nombre_genero`, `habilita`) VALUES
(1, 'Femenino', 1),
(2, 'Masculino', 1),
(3, 'No-Binario', 1);

-- --------------------------------------------------------

--
-- Table structure for table `mensajes`
--

CREATE TABLE `mensajes` (
  `id` int(11) NOT NULL,
  `id_viaje` int(11) NOT NULL,
  `id_emisor` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pagos`
--

CREATE TABLE `pagos` (
  `id_pago` int(6) NOT NULL,
  `id_viajes` int(6) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime NOT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `habilita` int(2) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(2) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL,
  `habilita` int(2) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`, `habilita`) VALUES
(1, 'Administrador', 1),
(2, 'Usuario', 1),
(3, 'Conductor', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tarifas`
--

CREATE TABLE `tarifas` (
  `id_tarifa` int(11) NOT NULL,
  `base` decimal(10,2) NOT NULL COMMENT 'Bajada de bandera',
  `por_km` decimal(10,2) NOT NULL COMMENT 'Costo por kilómetro',
  `por_min` decimal(10,2) NOT NULL COMMENT 'Costo por minuto',
  `minimo` decimal(10,2) DEFAULT NULL COMMENT 'Tarifa mínima',
  `activa` tinyint(1) DEFAULT 1 COMMENT '1 = tarifa vigente',
  `fecha_inicio` datetime DEFAULT current_timestamp(),
  `fecha_fin` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tarifas`
--

INSERT INTO `tarifas` (`id_tarifa`, `base`, `por_km`, `por_min`, `minimo`, `activa`, `fecha_inicio`, `fecha_fin`, `created_at`, `updated_at`) VALUES
(1, 0.00, 900.00, 90.00, 1500.00, 1, '2026-02-04 22:36:52', NULL, '2026-02-04 21:36:52', '2026-02-05 00:24:44');

-- --------------------------------------------------------

--
-- Table structure for table `tipos_vehiculo`
--

CREATE TABLE `tipos_vehiculo` (
  `id_tipo_vehiculo` int(11) NOT NULL,
  `nombre_tipo_vehiculo` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `habilita` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tipos_vehiculo`
--

INSERT INTO `tipos_vehiculo` (`id_tipo_vehiculo`, `nombre_tipo_vehiculo`, `descripcion`, `habilita`) VALUES
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

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(6) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `apellido_usuario` varchar(50) NOT NULL,
  `dni` varchar(50) DEFAULT NULL,
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
  `estado` enum('pendiente','activo') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre_usuario`, `apellido_usuario`, `dni`, `fecha_nacimiento`, `id_genero`, `password`, `telefono_usuario`, `email_usuario`, `id_rol`, `fecha_carga`, `habilita`, `google_id`, `foto_perfil`, `auth_provider`, `estado`) VALUES
(2, 'Pedrolo', 'Aráoz', '41061708', '2005-11-10', 2, '1234', '3816817290', 'pedroaraoz@gmail.com', 2, '2025-09-10 12:12:15', 0, NULL, NULL, 'manual', ''),
(11, 'Programación_lab2023', '', NULL, NULL, NULL, NULL, NULL, 'programacionlab76@gmail.com', 1, '2025-10-16 00:07:25', 1, '108599404702524096733', 'https://lh3.googleusercontent.com/a/ACg8ocK9xlPbD-FPEpbKUalKHXQurRVxtdCD01EvFN5-wwhYLnqL5A=s96-c', 'google', NULL),
(14, 'Alejandro', 'Juanves', '43215863', '1999-10-11', 1, NULL, '1163789879', 'allhealthy10@gmail.com', 2, '2025-10-17 00:28:14', 1, '113976294951405386808', 'https://lh3.googleusercontent.com/a/ACg8ocLd-Tk2hZBm6ArW2srxbxH-QpjCPQANs4AjuQRUVuW0blaq=s96-c', 'google', NULL),
(15, 'Fernando', 'Alonso', '45612423', '1998-10-15', 2, 'Elkpo123', '3816430705', 'braiancs37@gmail.com', 1, '2025-10-21 00:10:28', 1, '111056871768323161649', 'https://lh3.googleusercontent.com/a/ACg8ocKrF-6QPKimYAEAPL2ivxDeAJwnzbHlf2GBWhsvS8ik2F_n_a6Y=s96-c', 'google', NULL),
(17, 'Pedro Agustín', 'Aráoz Colombres', '41061709', '2005-03-24', 2, 'bbbbbb', '3816817290', 'pedroaraozc@gmail.com', 2, '2025-10-22 15:12:36', 1, '114048506940675520950', 'https://lh3.googleusercontent.com/a/ACg8ocLySgJ2lrSRvxX08YqDwUAGoDjGMfrU-fNp4V2zYuBut8HAERJH7w=s96-c', 'google', NULL),
(18, 'Braian', 'Barrionuevo', '41313654', '2005-10-16', 2, NULL, '4123155554', 'jugadorbraian1@gmail.com', 3, '2025-10-23 20:58:02', 1, '104307770940450025038', 'https://lh3.googleusercontent.com/a/ACg8ocLarUnF3fTESfaKdANGj0cGofRplOsmpoDZFaSvN0bGoUL7Ig=s96-c', 'google', NULL),
(32, 'Omar Alberto', 'Adra', '40274452', '2005-12-12', 2, NULL, '3816467896', 'adra.omar2@gmail.com', 3, '2025-10-24 05:57:50', 1, '106267537373796568284', 'https://lh3.googleusercontent.com/a/ACg8ocKXvFKSFp4TlITMg-R7jt48_mCYNMRyhWwgKVkojv2DPGW6RQ=s96-c', 'google', NULL),
(34, 'Pedro Agustin', 'Aráoz Colombres', '30345654', '1998-03-24', 2, 'Pedro123', '3816817290', 'pedroaraozdev@gmail.com', 3, '2025-10-31 13:59:54', 1, NULL, NULL, 'google', NULL),
(38, 'Guada', 'Alcaraz', '44028611', '2002-05-29', 1, NULL, '3815681094', 'guadaalcaraz2905@gmail.com', 2, '2025-11-16 23:04:49', 1, '103757754666261090529', 'https://lh3.googleusercontent.com/a/ACg8ocKzZ5PcT0FUyp6RvjZzlp9srf9446o5ttEQCJwnc-rbWokjzg54TQ=s96-c', 'google', NULL),
(39, 'Gisela Aldana', 'Rojas', '45304478', '2003-10-29', 1, NULL, '3815682626', 'rojasgiselaaldana@gmail.com', 2, '2025-11-17 02:35:12', 1, '105355326960342783890', 'https://lh3.googleusercontent.com/a/ACg8ocJ9zBNPaswfzT1ntmnEjJ5Ju0Qw1UAK2ltQTmNxygvdoBZteA0PMw=s96-c', 'google', NULL),
(40, 'Pablo Alejandro', 'Arancibia', '40440488', '1999-11-04', 2, NULL, '3818498798', 'pabloalejandroarancibia@gmail.com', 3, '2025-11-17 04:15:21', 1, '114991335054003996432', 'https://lh3.googleusercontent.com/a/ACg8ocK1GuyFC-KTXf0UeWRoLFoF_rrdEeKoo-tii_xHv9dt8ar5HQ=s96-c', 'google', NULL),
(42, 'Omar Adra', '', NULL, NULL, NULL, NULL, NULL, 'omiisk8nb@gmail.com', 2, '2025-11-28 23:40:06', 1, '106106187169004319715', 'https://lh3.googleusercontent.com/a/ACg8ocJzOHGuSNX2Uog7052iRtZUftWaKAKkddpIh8QemaD0TU0XxBE=s96-c', 'manual', NULL),
(43, 'Liliana Francisca', 'Rios', '16132673', '1972-02-25', 1, NULL, '3812022105', 'lilifrios2@gmail.com', 2, '2025-11-28 23:43:45', 1, '113770952253183226766', 'https://lh3.googleusercontent.com/a/ACg8ocIpgkEjuGG-A6xYPkOiV8-39JNfnxatArlrpydqZ6DKOtQ35A=s96-c', 'google', NULL),
(44, 'Julio Rodriguez', '', NULL, NULL, NULL, NULL, NULL, 'acottjuliorodriguez@gmail.com', 3, '2026-01-20 14:33:44', 1, '111751082179816558146', 'https://lh3.googleusercontent.com/a/ACg8ocJZd98GILlbwOB1Rf5ViIV1DXeRNd6aznWiSmfi0w498XjCPA=s96-c', 'google', NULL),
(45, 'Cristhian exequiel Soria', '', NULL, NULL, NULL, NULL, NULL, 'cristhianexesoria90@gmail.com', 3, '2026-01-21 15:36:44', 1, '100846069487861839133', 'https://lh3.googleusercontent.com/a/ACg8ocKvPoy-h9PBAHl4Eikr8oxjw2FefLaHh-AaqVE43JxXGmd97g=s96-c', 'google', 'activo'),
(47, 'Pedro Agustin', 'Araoz', '2147483647', '2027-02-02', 3, 'Pedro98Araoz', '03816817290', 'pedroraroz@alu.frt.utn.edu.ar', 2, '2026-01-24 16:16:33', 1, NULL, NULL, 'manual', 'activo'),
(76, 'Pedro Agustin', 'Araoz', '20410617081', '2026-01-02', 2, 'OUABODFABOJAFBJOAD', '03816817290', 'pedroraroz+1@alu.frt.utn.edu.ar', 3, '2026-01-28 22:45:21', 1, NULL, NULL, 'manual', 'pendiente'),
(77, 'Miguel', 'Bautista', NULL, NULL, NULL, 'TAXI2026', NULL, 'miguelbautista182@gmail.com', 2, '2026-02-08 23:36:56', 1, NULL, NULL, 'manual', 'pendiente');

-- --------------------------------------------------------

--
-- Table structure for table `validacion_conductor`
--

CREATE TABLE `validacion_conductor` (
  `id_validacion` int(6) NOT NULL,
  `id_usuario` int(6) NOT NULL,
  `fecha_validacion` date NOT NULL,
  `id_estado_validacion` int(6) DEFAULT NULL,
  `observaciones` varchar(250) NOT NULL DEFAULT 'EN ESPERA DE REVISION'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `validacion_conductor`
--

INSERT INTO `validacion_conductor` (`id_validacion`, `id_usuario`, `fecha_validacion`, `id_estado_validacion`, `observaciones`) VALUES
(1, 40, '2025-11-12', 3, 'Tenes vencido el carnet\n'),
(2, 18, '2025-11-12', 3, 'todo ok\n'),
(3, 17, '2025-11-12', 3, 'ok\n'),
(5, 76, '2026-01-28', 1, 'EN ESPERA DE REVISION'),
(6, 34, '2026-01-29', 1, 'EN ESPERA DE REVISION'),
(7, 32, '2026-01-29', 1, 'EN ESPERA DE REVISION');

-- --------------------------------------------------------

--
-- Table structure for table `viajes`
--

CREATE TABLE `viajes` (
  `id_viajes` int(11) NOT NULL,
  `id_pasajero` int(6) DEFAULT NULL,
  `id_conductor` int(6) DEFAULT NULL,
  `direccion_desde` varchar(120) NOT NULL,
  `lat_desde` varchar(120) DEFAULT NULL,
  `lon_desde` varchar(120) DEFAULT NULL,
  `direccion_hasta` varchar(120) NOT NULL,
  `lat_hasta` varchar(120) DEFAULT NULL,
  `lon_hasta` varchar(120) DEFAULT NULL,
  `hora_inicio` timestamp NULL DEFAULT current_timestamp(),
  `hora_fin` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `precio_final` decimal(10,2) DEFAULT NULL,
  `id_estado` int(11) NOT NULL DEFAULT 1,
  `id_tarifa` int(11) DEFAULT NULL,
  `modo_cobro` enum('PACTADO','TAXIMETRO') NOT NULL DEFAULT 'PACTADO',
  `precio_pactado` decimal(10,2) DEFAULT NULL,
  `precio_estimado` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `viajes`
--

INSERT INTO `viajes` (`id_viajes`, `id_pasajero`, `id_conductor`, `direccion_desde`, `lat_desde`, `lon_desde`, `direccion_hasta`, `lat_hasta`, `lon_hasta`, `hora_inicio`, `hora_fin`, `precio_final`, `id_estado`, `id_tarifa`, `modo_cobro`, `precio_pactado`, `precio_estimado`) VALUES
(37, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391113', '-65.2063926', '9 de Julio 64, San Miguel de Tucumán, Tucumán', '-26.831870634637653', '-65.2045638486743', '2025-10-29 11:15:28', '2025-10-29 11:15:28', 3071.10, 5, NULL, 'PACTADO', NULL, NULL),
(38, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391361', '-65.2063989', 'Chacabuco 37 1ero B , San Miguel de Tucumán, Tucumán', '-26.827655429159407', '-65.20007785409689', '2025-10-29 11:30:08', '2025-10-29 11:30:08', 3213.60, 5, NULL, 'PACTADO', NULL, NULL),
(39, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391117', '-65.2063872', 'Combate de San Lorenzo 923, San Miguel de Tucumán, Tucumán', '-26.832214689485262', '-65.21186515688896', '2025-10-29 11:31:00', '2025-10-29 11:31:00', 3138.00, 5, NULL, 'PACTADO', NULL, NULL),
(40, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391117', '-65.2063872', 'Combate de San Lorenzo 923, San Miguel de Tucumán, Tucumán', '-26.832214689485262', '-65.21186515688896', '2025-10-29 11:31:07', '2025-10-29 11:31:07', 3138.00, 5, NULL, 'PACTADO', NULL, NULL),
(41, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391379', '-65.2064135', 'Congreso de Tucumán 798, San Miguel de Tucumán, Tucumán', '-26.842071865679905', '-65.20574200898409', '2025-10-29 11:32:01', '2025-10-29 11:32:01', 2170.80, 5, NULL, 'PACTADO', NULL, NULL),
(42, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391379', '-65.2064135', 'Congreso de Tucumán 798, San Miguel de Tucumán, Tucumán', '-26.842071865679905', '-65.20574200898409', '2025-10-29 11:32:36', '2025-10-29 11:32:36', 2170.80, 5, NULL, 'PACTADO', NULL, NULL),
(43, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391325', '-65.2063857', 'Gral. José de San Martín 1064, San Miguel de Tucumán, Tucumán', '-26.83010516806282', '-65.20748410373926', '2025-10-29 11:36:12', '2025-10-29 11:36:12', 3955.20, 5, NULL, 'PACTADO', NULL, NULL),
(44, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391325', '-65.2063857', 'Gral. José de San Martín 1064, San Miguel de Tucumán, Tucumán', '-26.83010516806282', '-65.20748410373926', '2025-10-29 11:36:14', '2025-10-29 11:36:32', 3955.20, 3, NULL, 'PACTADO', NULL, NULL),
(45, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391333', '-65.2063994', 'Av. Roque Sáenz Peña 381, San Miguel de Tucumán, Tucumán', '-26.837495052338728', '-65.19841153174639', '2025-10-29 11:37:25', '2025-10-29 11:37:28', 2532.30, 3, NULL, 'PACTADO', NULL, NULL),
(46, 2, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391203', '-65.2063989', 'Buenos Aires 340, San Miguel de Tucumán, Tucumán', '-26.835307845219738', '-65.20744387060404', '2025-10-29 15:53:40', '2025-10-29 15:53:40', 1984.20, 5, NULL, 'PACTADO', NULL, NULL),
(47, 2, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391203', '-65.2063989', 'Buenos Aires 340, San Miguel de Tucumán, Tucumán', '-26.835307845219738', '-65.20744387060404', '2025-10-29 15:53:55', '2025-10-29 15:53:55', 1984.20, 5, NULL, 'PACTADO', NULL, NULL),
(48, 2, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391203', '-65.2063989', 'Buenos Aires 340, San Miguel de Tucumán, Tucumán', '-26.835307845219738', '-65.20744387060404', '2025-10-29 15:54:19', '2025-10-29 15:54:19', 1984.20, 5, NULL, 'PACTADO', NULL, NULL),
(49, 2, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391141', '-65.206393', 'Congreso de Tucumán 246, San Miguel de Tucumán, Tucumán', '-26.834818402854413', '-65.20379137247801', '2025-10-29 15:57:18', '2025-10-29 15:57:18', 1743.60, 5, NULL, 'PACTADO', NULL, NULL),
(50, 2, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391141', '-65.206393', 'Congreso de Tucumán 246, San Miguel de Tucumán, Tucumán', '-26.834818402854413', '-65.20379137247801', '2025-10-29 15:57:29', '2025-10-29 15:57:29', 1743.60, 5, NULL, 'PACTADO', NULL, NULL),
(51, 17, NULL, 'Pcia de Mendoza 380, 380, San Miguel de Tucumán, Tucumán', '-26.8287627', '-65.2022944', 'Provincia de Córdoba 500, San Miguel de Tucumán, Tucumán, Argentina', '-26.8268924', '-65.203819', '2025-10-29 23:38:26', '2025-10-29 23:38:26', 2115.60, 5, NULL, 'PACTADO', NULL, NULL),
(52, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390809', '-65.2063944', 'Provincia de Mendoza 490, San Miguel de Tucumán, Tucumán, Argentina', '-26.8284668', '-65.2038711', '2025-10-30 11:07:07', '2025-10-30 11:07:07', 3996.60, 5, NULL, 'PACTADO', NULL, NULL),
(53, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391261', '-65.2064025', 'Gral. José María Paz 843, San Miguel de Tucumán, Tucumán', '-26.834769039662255', '-65.21125461906195', '2025-10-30 14:25:57', '2025-10-30 14:25:57', 2922.90, 5, NULL, 'PACTADO', NULL, NULL),
(54, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390848', '-65.206403', 'IDP, San Miguel de Tucumán, Tucumán', '-26.841848399189118', '-65.20376287400723', '2025-10-30 14:38:35', '2025-10-30 14:38:35', 1504.50, 5, NULL, 'PACTADO', NULL, NULL),
(55, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391326', '-65.2064059', '815, San Miguel de Tucumán, Provincia de Tucumán', '-26.838016194349475', '-65.2113800123334', '2025-10-30 14:39:14', '2025-10-30 14:39:14', 2562.30, 5, NULL, 'PACTADO', NULL, NULL),
(56, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.839108', '-65.2064053', '9 de Julio 836, San Miguel de Tucumán, Tucumán', '-26.84234828145187', '-65.20745795220137', '2025-10-30 14:40:59', '2025-10-30 14:40:59', 2043.90, 5, NULL, 'PACTADO', NULL, NULL),
(57, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391226', '-65.2063956', 'Plaza Los Decididos de Tucumán, San Miguel de Tucumán, Tucumán', '-26.839966416907135', '-65.21100349724293', '2025-10-30 14:43:32', '2025-10-30 14:43:32', 2242.50, 5, NULL, 'PACTADO', NULL, NULL),
(58, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390759', '-65.2063795', 'Batalla de Ayacucho 474, San Miguel de Tucumán, Tucumán', '-26.836434212799126', '-65.210498906672', '2025-10-30 14:46:18', '2025-10-30 14:46:18', 2086.80, 5, NULL, 'PACTADO', NULL, NULL),
(59, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391224', '-65.2064073', 'Hungría 750, San Miguel de Tucumán, Tucumán', '-26.84106940411802', '-65.21135084331036', '2025-10-30 15:10:53', '2025-10-30 15:10:53', 2962.80, 5, NULL, 'PACTADO', NULL, NULL),
(60, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391228', '-65.2063928', 'Pcia de Jujuy 173, San Miguel de Tucumán, Tucumán', '-26.832001674781097', '-65.21159593015909', '2025-10-30 15:18:45', '2025-10-30 15:18:45', 3188.40, 5, NULL, 'PACTADO', NULL, NULL),
(61, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390785', '-65.2063985', 'Combate de San Lorenzo 704, San Miguel de Tucumán, Tucumán', '-26.833046699540745', '-65.20877860486507', '2025-10-30 15:32:49', '2025-10-30 15:35:10', 2794.80, 3, NULL, 'PACTADO', NULL, NULL),
(62, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391263', '-65.2064096', 'Combate de Las Piedras 808, San Miguel de Tucumán, Tucumán', '-26.834265533873218', '-65.21051399409771', '2025-10-30 15:52:23', '2025-10-30 15:52:32', 2393.40, 3, NULL, 'PACTADO', NULL, NULL),
(63, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391125', '-65.2064094', 'Provincia de Mendoza 390, San Miguel de Tucumán, Tucumán, Argentina', '-26.8288601', '-65.2024953', '2025-10-30 15:54:28', '2025-10-30 15:54:28', 3336.60, 5, NULL, 'PACTADO', NULL, NULL),
(64, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390898', '-65.2064065', 'Congreso de Tucumán 171, San Miguel de Tucumán, Tucumán', '-26.833371304467406', '-65.2040870860219', '2025-10-30 15:55:29', '2025-10-30 15:55:29', 2667.00, 5, NULL, 'PACTADO', NULL, NULL),
(65, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391201', '-65.2064022', 'San Lorenzo y Jujuy, San Miguel de Tucumán, Tucumán', '-26.832366671641665', '-65.21206296980381', '2025-10-31 13:31:59', '2025-10-31 13:31:59', 3117.00, 5, NULL, 'PACTADO', NULL, NULL),
(66, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8391201', '-65.2064022', 'San Lorenzo y Jujuy, San Miguel de Tucumán, Tucumán', '-26.832366671641665', '-65.21206296980381', '2025-10-31 13:31:59', '2025-10-31 13:32:46', 3117.00, 3, NULL, 'PACTADO', NULL, NULL),
(67, 15, NULL, '12 de Octubre 741, San Miguel de Tucumán, Tucumán', '-26.8178106', '-65.2173422', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2025-10-31 17:38:36', '2025-10-31 17:38:46', 3068.10, 3, NULL, 'PACTADO', NULL, NULL),
(68, 32, NULL, 'Adolfo de la Vega 473, San Miguel de Tucumán, Tucumán, Argentina', '-26.8268525', '-65.2532196', 'San Miguel de Tucumán, Tucumán, Argentina', '-26.8082848', '-65.2175903', '2025-11-05 03:08:46', '2025-11-05 03:08:58', 7659.60, 3, NULL, 'PACTADO', NULL, NULL),
(69, 32, NULL, 'Av. Adolfo de la Vega 473, San Miguel de Tucumán, Tucumán, Argentina', '-26.8268525', '-65.2532196', 'Paraguay 873, San Miguel de Tucumán, Tucumán, Argentina', '-26.8082747', '-65.20475429999999', '2025-11-14 22:33:45', '2025-11-14 22:34:15', 9403.80, 3, NULL, 'PACTADO', NULL, NULL),
(70, 15, NULL, 'Marcos Paz 1501 4400, San Miguel de Tucumán, Tucumán', '-26.8181318', '-65.2175845', 'Marco Avellaneda 56, San Miguel de Tucumán, Tucumán, Argentina', '-26.8280673', '-65.2157635', '2025-11-15 16:10:10', '2025-11-15 16:13:10', 3410.70, 3, NULL, 'PACTADO', NULL, NULL),
(71, 15, NULL, '12 de Octubre 701, San Miguel de Tucumán, Tucumán', '-26.8181302', '-65.2175607', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-15 16:14:12', '2025-11-15 16:14:25', 4059.00, 3, NULL, 'PACTADO', NULL, NULL),
(72, 15, NULL, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8179083', '-65.2173962', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-15 16:22:02', '2025-11-15 16:22:02', 4028.70, 5, NULL, 'PACTADO', NULL, NULL),
(73, 15, NULL, '12 de Octubre 745, San Miguel de Tucumán, Tucumán', '-26.8176917', '-65.2173467', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:01:34', '2025-11-16 00:01:34', 4000.20, 5, NULL, 'PACTADO', NULL, NULL),
(74, 15, NULL, '12 de Octubre 745, San Miguel de Tucumán, Tucumán', '-26.8176917', '-65.2173467', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:05:16', '2025-11-16 00:05:16', 4000.20, 5, NULL, 'PACTADO', NULL, NULL),
(75, 15, NULL, '12 de Octubre 745, San Miguel de Tucumán, Tucumán', '-26.8176917', '-65.2173467', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:08:08', '2025-11-16 00:08:08', 4000.20, 5, NULL, 'PACTADO', NULL, NULL),
(76, 15, NULL, '12 de Octubre 745, San Miguel de Tucumán, Tucumán', '-26.8176917', '-65.2173467', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:08:51', '2025-11-16 00:08:51', 4000.20, 5, NULL, 'PACTADO', NULL, NULL),
(77, 15, NULL, '12 de Octubre 745, San Miguel de Tucumán, Tucumán', '-26.8176917', '-65.2173467', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:15:08', '2025-11-16 00:15:08', 4000.20, 5, NULL, 'PACTADO', NULL, NULL),
(78, 15, NULL, '12 de Octubre 733, San Miguel de Tucumán, Tucumán', '-26.8178454', '-65.2173199', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 00:18:04', '2025-11-16 00:18:04', 4019.10, 5, NULL, 'PACTADO', NULL, NULL),
(79, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 04:54:14', '2025-11-16 04:55:02', 3377.70, 4, NULL, 'PACTADO', NULL, NULL),
(80, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 06:01:16', '2025-11-16 06:01:16', 3377.70, 5, NULL, 'PACTADO', NULL, NULL),
(81, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 06:07:47', '2025-11-16 06:07:47', 3377.70, 5, NULL, 'PACTADO', NULL, NULL),
(82, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 06:10:11', '2025-11-16 06:10:11', 3377.70, 5, NULL, 'PACTADO', NULL, NULL),
(83, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 07:26:08', '2025-11-16 07:26:08', 3377.70, 5, NULL, 'PACTADO', NULL, NULL),
(84, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 07:26:53', '2025-11-16 07:26:53', 3377.70, 5, NULL, 'PACTADO', NULL, NULL),
(85, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 07:36:28', '2025-11-16 07:36:28', 3377.70, 5, NULL, 'PACTADO', NULL, NULL),
(86, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 17:21:39', '2025-11-16 18:31:05', 3377.70, 3, NULL, 'PACTADO', NULL, NULL),
(88, 2, NULL, 'Plaza Independencia', '-26.83', '-65.2', 'Terminal de Ómnibus', '-26.84', '-65.21', '2025-11-16 20:20:53', '2025-11-16 20:31:25', 1000.00, 3, NULL, 'PACTADO', NULL, NULL),
(89, 15, NULL, '12 de Octubre 733, San Miguel de Tucumán, Tucumán', '-26.8178982', '-65.2173282', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 20:29:09', '2025-11-16 20:29:09', 4026.00, 5, NULL, 'PACTADO', NULL, NULL),
(90, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 91, San Miguel de Tucumán, Tucumán, Argentina', '-26.8217576', '-65.2405014', '2025-11-16 20:33:02', '2025-11-16 20:33:05', 3363.30, 3, NULL, 'PACTADO', NULL, NULL),
(91, 15, NULL, '12 de Octubre 715, San Miguel de Tucumán, Tucumán', '-26.8179442', '-65.2174189', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 20:55:59', '2025-11-16 20:55:59', 4033.80, 5, NULL, 'PACTADO', NULL, NULL),
(92, 15, NULL, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8179084', '-65.2174137', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-16 21:05:10', '2025-11-16 21:05:10', 4028.70, 5, NULL, 'PACTADO', NULL, NULL),
(93, 15, NULL, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8178917', '-65.2173962', 'Provincia de Mendoza 380, San Miguel de Tucumán, Tucumán, Argentina', '-26.828766', '-65.202393', '2025-11-16 21:11:39', '2025-11-16 21:11:39', 4441.80, 5, NULL, 'PACTADO', NULL, NULL),
(94, 15, NULL, '12 de Octubre 715, San Miguel de Tucumán, Tucumán', '-26.8179688', '-65.2173755', 'Maipú 35, San Miguel de Tucumán, Tucumán, Argentina', '-26.8298948', '-65.2076336', '2025-11-16 21:18:13', '2025-11-16 21:18:19', 4059.90, 3, NULL, 'PACTADO', NULL, NULL),
(95, 15, NULL, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8179177', '-65.2174159', 'JGR, 12 de Octubre 880, San Miguel de Tucumán, Tucumán, Argentina', '-26.8158458', '-65.2170581', '2025-11-16 21:24:29', '2025-11-16 21:24:29', 1165.20, 5, NULL, 'PACTADO', NULL, NULL),
(96, 15, NULL, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8178938', '-65.2174029', 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán, Argentina', '-26.8404475', '-65.24768879999999', '2025-11-16 21:28:03', '2025-11-16 21:28:17', 7960.20, 3, NULL, 'PACTADO', NULL, NULL),
(97, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-16 21:28:54', '2025-11-16 21:29:03', 3377.70, 3, NULL, 'PACTADO', NULL, NULL),
(98, 15, NULL, '12 de Octubre 735, San Miguel de Tucumán, Tucumán', '-26.8179416', '-65.2172809', 'Córdoba 45, San Miguel de Tucumán, Comunitat Valenciana, Argentina', '-26.8286596', '-65.2694362', '2025-11-16 21:44:00', '2025-11-16 22:42:27', 9261.00, 5, NULL, 'PACTADO', NULL, NULL),
(99, 15, 2, '12 de Octubre 733, San Miguel de Tucumán, Tucumán', '-26.8179075', '-65.2173119', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2025-11-16 21:46:34', '2025-11-16 22:43:27', 3080.10, 1, NULL, 'PACTADO', NULL, NULL),
(100, 38, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287622', '-65.2022823', 'Raúl Colombres 1044, San Miguel de Tucumán, Tucumán, Argentina', '-26.8168403', '-65.1776318', '2025-11-16 23:10:53', '2025-11-16 23:11:30', 5591.40, 3, NULL, 'PACTADO', NULL, NULL),
(101, 38, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287492', '-65.2022824', 'Bernardo de Monteagudo 695, San Miguel de Tucumán, Tucumán', '-26.82243085788851', '-65.19799444824457', '2025-11-16 23:11:45', '2025-11-16 23:13:22', 2249.70, 3, NULL, 'PACTADO', NULL, NULL),
(102, 38, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287772', '-65.2022849', 'Pcia de Córdoba 836, San Miguel de Tucumán, Tucumán', '-26.82623067877552', '-65.20910549908876', '2025-11-16 23:14:04', '2025-11-16 23:14:04', 2803.50, 5, NULL, 'PACTADO', NULL, NULL),
(103, 17, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287727', '-65.2022837', 'Av. República del Líbano 1848, San Miguel de Tucumán, Tucumán', '-26.803291287819345', '-65.21257292479277', '2025-11-16 23:17:36', '2025-11-16 23:18:43', 6468.90, 3, NULL, 'PACTADO', NULL, NULL),
(104, 17, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287735', '-65.2022773', 'Santiago del Estero 716, San Miguel de Tucumán, Tucumán', '-26.82378953289039', '-65.20647324621677', '2025-11-16 23:18:50', '2025-11-16 23:19:03', 2791.80, 3, NULL, 'PACTADO', NULL, NULL),
(105, 38, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287778', '-65.2022941', 'Balcarce 481, San Miguel de Tucumán, Tucumán', '-26.82579565062326', '-65.19666340202093', '2025-11-16 23:20:58', '2025-11-16 23:20:58', 2801.10, 5, NULL, 'PACTADO', NULL, NULL),
(106, 38, 17, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287914', '-65.2022923', 'Pje. 1º de Mayo 207, San Miguel de Tucumán, Tucumán', '-26.817172234160896', '-65.19009936600924', '2025-11-16 23:29:55', '2025-11-17 00:08:01', 3852.30, 3, NULL, 'PACTADO', NULL, NULL),
(107, 38, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287903', '-65.2022911', 'Pcia de Corrientes 103, San Miguel de Tucumán, Tucumán', '-26.823792824089498', '-65.19699599593878', '2025-11-17 00:07:25', '2025-11-17 00:08:32', 2236.20, 3, NULL, 'PACTADO', NULL, NULL),
(108, 38, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287861', '-65.2022891', 'CAO, San Miguel de Tucumán, Tucumán', '-26.833034134170042', '-65.20643904805183', '2025-11-17 00:08:44', '2025-11-17 00:09:29', 2945.70, 3, NULL, 'PACTADO', NULL, NULL),
(109, 38, 17, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287631', '-65.202263', '25 de Mayo 466, San Miguel de Tucumán, Tucumán', '-26.82478676184972', '-65.20330019295216', '2025-11-17 00:09:42', '2025-11-17 00:10:55', 2506.50, 3, NULL, 'PACTADO', NULL, NULL),
(110, 38, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287767', '-65.2022829', 'Balcarce 649, San Miguel de Tucumán, Tucumán', '-26.823316496822684', '-65.1963472366333', '2025-11-17 00:12:06', '2025-11-17 00:12:12', 2973.30, 3, NULL, 'PACTADO', NULL, NULL),
(111, 38, 17, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287798', '-65.2023079', 'Pcia de Corrientes 311, San Miguel de Tucumán, Tucumán', '-26.823305725579928', '-65.20007986575365', '2025-11-17 00:13:19', '2025-11-17 00:13:28', 2609.40, 3, NULL, 'PACTADO', NULL, NULL),
(112, 38, 17, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287807', '-65.2023171', 'Av. Nicolás Avellaneda 648, San Miguel de Tucumán, Tucumán', '-26.823524441447365', '-65.19563376903534', '2025-11-17 00:13:52', '2025-11-17 00:13:57', 3102.00, 1, NULL, 'PACTADO', NULL, NULL),
(113, 38, 17, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287897', '-65.2023033', 'Av. Nicolás Avellaneda 648, San Miguel de Tucumán, Tucumán', '-26.823519953437913', '-65.1955895125866', '2025-11-17 00:14:40', '2025-11-17 00:15:24', 3097.80, 3, NULL, 'PACTADO', NULL, NULL),
(114, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287797', '-65.2022928', 'Dr, San Miguel de Tucumán, Tucumán', '-26.8224479124874', '-65.19684512168169', '2025-11-17 00:33:15', '2025-11-17 00:33:19', 2917.50, 1, NULL, 'PACTADO', NULL, NULL),
(115, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287858', '-65.2023029', 'Av. Nicolás Avellaneda 431, San Miguel de Tucumán, Tucumán', '-26.826558594352914', '-65.19550669938326', '2025-11-17 00:38:32', '2025-11-17 00:38:36', 2124.60, 1, NULL, 'PACTADO', NULL, NULL),
(116, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287789', '-65.2022837', 'Ste Anne, Ste Anne, Manitoba', '51.01628452513507', '-96.49340037256479', '2025-11-17 00:51:40', '2025-11-17 00:52:06', 900.00, 3, NULL, 'PACTADO', NULL, NULL),
(117, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287716', '-65.2022755', 'Marcos Paz 302, San Miguel de Tucumán, Tucumán', '-26.822153795097808', '-65.19968155771494', '2025-11-17 00:56:26', '2025-11-17 00:56:28', 2499.90, 1, NULL, 'PACTADO', NULL, NULL),
(118, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287734', '-65.2022963', 'San Juan 297, San Miguel de Tucumán, Tucumán', '-26.826131645691', '-65.20037356764078', '2025-11-17 01:16:06', '2025-11-17 01:16:06', 2309.70, 2, NULL, 'PACTADO', NULL, NULL),
(119, 17, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287818', '-65.2022798', 'Pcia de Corrientes 116, San Miguel de Tucumán, Tucumán', '-26.82430176200297', '-65.19742749631405', '2025-11-17 01:18:45', '2025-11-17 01:18:45', 2641.20, 5, NULL, 'PACTADO', NULL, NULL),
(120, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287813', '-65.2022764', 'Pcia de Córdoba 226, San Miguel de Tucumán, Tucumán', '-26.82785528771308', '-65.19974324852228', '2025-11-17 01:19:03', '2025-11-17 01:19:06', 1530.00, 1, NULL, 'PACTADO', NULL, NULL),
(121, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.82877', '-65.2022627', 'Provincia de, San Miguel de Tucumán, Tucumán', '-26.82512066553449', '-65.2070539444685', '2025-11-17 01:22:34', '2025-11-17 01:22:37', 3051.90, 1, NULL, 'PACTADO', NULL, NULL),
(122, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287718', '-65.2022876', 'Marcos Paz 212 5 Piso Of B, San Miguel de Tucumán, Tucumán', '-26.82233092387148', '-65.19830491393805', '2025-11-17 01:24:19', '2025-11-17 01:24:21', 2317.80, 1, NULL, 'PACTADO', NULL, NULL),
(123, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404215', '-65.2476574', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-17 01:25:32', '2025-11-17 01:26:24', 8765.10, 3, NULL, 'PACTADO', NULL, NULL),
(124, 17, 38, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287623', '-65.2022877', 'Pcia de Mendoza 39, San Miguel de Tucumán, Tucumán', '-26.828953007524433', '-65.19703857600689', '2025-11-17 01:26:45', '2025-11-17 01:27:22', 1593.90, 3, NULL, 'PACTADO', NULL, NULL),
(125, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404363', '-65.2476617', 'Bernardino Rivadavia 932, San Miguel de Tucumán, Tucumán, Argentina', '-26.818727', '-65.198805', '2025-11-17 01:27:24', '2025-11-17 01:28:08', 10619.10, 3, NULL, 'PACTADO', NULL, NULL),
(126, 17, 38, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287681', '-65.2022766', 'Pcia de Salta 465, San Miguel de Tucumán, Tucumán', '-26.823460711696466', '-65.20911555737257', '2025-11-17 01:39:53', '2025-11-17 01:39:55', 3186.90, 1, NULL, 'PACTADO', NULL, NULL),
(127, 15, 18, '12 de Octubre 733 1 B, San Miguel de Tucumán, Tucumán', '-26.8178922', '-65.217428', 'Junín 238, San Miguel de Tucumán, Tucumán, Argentina', '-26.826874', '-65.20856429999999', '2025-11-17 02:32:20', '2025-11-17 02:33:11', 4349.10, 3, NULL, 'PACTADO', NULL, NULL),
(128, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 04:01:40', '2025-11-17 04:01:43', 3377.70, 3, NULL, 'PACTADO', NULL, NULL),
(129, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 04:25:00', '2025-11-17 04:25:23', 3377.70, 3, NULL, 'PACTADO', NULL, NULL),
(130, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 04:30:32', '2025-11-17 04:31:11', 3377.70, 3, NULL, 'PACTADO', NULL, NULL),
(131, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 04:42:46', '2025-11-17 04:44:43', 3377.70, 3, NULL, 'PACTADO', NULL, NULL),
(132, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 06:38:00', '2025-11-17 06:38:54', 3377.70, 3, NULL, 'PACTADO', NULL, NULL),
(133, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Provincia de Mendoza 380, San Miguel de Tucumán, Tucumán, Argentina', '-26.828766', '-65.202393', '2025-11-17 06:40:41', '2025-11-17 06:40:49', 900.00, 1, NULL, 'PACTADO', NULL, NULL),
(134, 17, NULL, 'Lavaissé, San Miguel de Tucumán, Tucumán, Argentina', '-26.8490419', '-65.2418943', 'Parque Guillermina, San Miguel de Tucumán, Tucumán', '-26.820158384430325', '-65.25753077119589', '2025-11-17 12:04:36', '2025-11-17 12:04:38', 7392.60, 3, NULL, 'PACTADO', NULL, NULL),
(135, 17, NULL, 'Lavaisse Benjamin Presbitero, San Miguel de Tucumán, Tucumán, Argentina', '-26.8542285', '-65.2170669', 'Parque Guillermina, Avenida Mate de Luna, San Miguel de Tucumán, Tucumán, Argentina', '-26.8240367', '-65.260453', '2025-11-17 12:05:18', '2025-11-17 12:05:22', 9661.50, 3, NULL, 'PACTADO', NULL, NULL),
(136, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 81, San Miguel de Tucumán, Tucumán, Argentina', '-26.8218442', '-65.2405879', '2025-11-17 12:52:30', '2025-11-17 12:52:38', 3377.70, 3, NULL, 'PACTADO', NULL, NULL),
(137, 34, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287594', '-65.2022761', 'Bernardo de Monteagudo 737, San Miguel de Tucumán, Tucumán', '-26.821869251505042', '-65.19748482853174', '2025-11-17 16:18:06', '2025-11-17 16:18:08', 2341.20, 3, NULL, 'PACTADO', NULL, NULL),
(138, 15, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287598', '-65.2022954', 'Av. 24 de Septiembre 154, San Miguel de Tucumán, Tucumán', '-26.832364577400728', '-65.19966311752796', '2025-11-17 16:43:01', '2025-11-17 16:43:05', 1763.10, 3, NULL, 'PACTADO', NULL, NULL),
(139, 15, NULL, 'Laprida 209, San Miguel de Tucumán, Tucumán', '-26.8284045', '-65.2021357', '12 de Octubre 741, San Miguel de Tucumán, Tucumán, Argentina', '-26.8178055', '-65.21727419999999', '2025-11-17 16:43:34', '2025-11-17 16:44:00', 4648.50, 3, NULL, 'PACTADO', NULL, NULL),
(140, 14, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287677', '-65.202296', 'Marco Avellaneda 100, San Miguel de Tucumán, Tucumán', '-26.827386457285883', '-65.21518472582102', '2025-11-17 16:53:54', '2025-11-17 16:53:54', 3193.20, 5, NULL, 'PACTADO', NULL, NULL),
(141, 14, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287692', '-65.2023003', 'Santiago del Estero 628, San Miguel de Tucumán, Tucumán', '-26.823943919946146', '-65.2048521861434', '2025-11-17 16:54:23', '2025-11-17 16:54:27', 2609.10, 3, NULL, 'PACTADO', NULL, NULL),
(142, 14, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287529', '-65.2023756', 'Pcia de Corrientes 637, San Miguel de Tucumán, Tucumán', '-26.82230339712076', '-65.20443510264158', '2025-11-17 16:54:40', '2025-11-17 16:54:59', 3567.60, 3, NULL, 'PACTADO', NULL, NULL),
(143, 14, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287687', '-65.202298', 'Batalla de Chacabuco 83, San Miguel de Tucumán, Tucumán', '-26.831433833064676', '-65.2081000059843', '2025-11-17 16:57:32', '2025-11-17 16:58:02', 2527.20, 3, NULL, 'PACTADO', NULL, NULL),
(144, 15, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287755', '-65.2022989', 'Junín 500, San Miguel de Tucumán, Tucumán, Argentina', '-26.823109', '-65.20761', '2025-11-17 16:59:00', '2025-11-17 16:59:42', 3138.30, 3, NULL, 'PACTADO', NULL, NULL),
(145, 15, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287843', '-65.2022927', '25 de Mayo 250, San Miguel de Tucumán, Tucumán', '-26.827752665775222', '-65.20404350012541', '2025-11-17 16:59:55', '2025-11-17 17:03:16', 2237.40, 3, NULL, 'PACTADO', NULL, NULL),
(146, 15, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287838', '-65.2023173', 'Junín 500, San Miguel de Tucumán, Tucumán, Argentina', '-26.823109', '-65.20761', '2025-11-17 17:03:27', '2025-11-17 17:06:00', 3140.10, 3, NULL, 'PACTADO', NULL, NULL),
(147, 15, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287601', '-65.2022806', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-17 17:07:03', '2025-11-17 17:07:15', 2253.30, 3, NULL, 'PACTADO', NULL, NULL),
(148, 15, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287663', '-65.2022828', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2025-11-17 17:07:49', '2025-11-17 17:08:10', 2253.30, 3, NULL, 'PACTADO', NULL, NULL),
(149, 15, NULL, 'Pcia de Mendoza 370, San Miguel de Tucumán, Tucumán', '-26.8287692', '-65.2022868', 'Maipú 60, Tucumán, Argentina', '-26.814013', '-65.2038645', '2025-11-17 17:10:03', '2025-11-17 17:10:41', 4445.10, 3, NULL, 'PACTADO', NULL, NULL),
(150, 15, NULL, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287653', '-65.2022868', 'Maipú 65, San Miguel de Tucumán, Tucumán, Argentina', '-26.8296368', '-65.2074171', '2025-11-17 17:10:55', '2025-11-17 17:11:47', 2232.30, 3, NULL, 'PACTADO', NULL, NULL),
(151, 15, 17, 'Pcia de Mendoza 380, San Miguel de Tucumán, Tucumán', '-26.8287684', '-65.202297', 'Maipú 70, San Miguel de Tucumán, Tucumán, Argentina', '-26.8294799', '-65.2077546', '2025-11-17 17:16:26', '2025-11-17 17:45:13', 2222.10, 3, NULL, 'PACTADO', NULL, NULL),
(152, 15, 17, 'Bernardo de Monteagudo 149, San Miguel de Tucumán, Tucumán', '-26.8302456', '-65.199485', 'Laprida 500, San Miguel de Tucumán, Tucumán, Argentina', '-26.8246318', '-65.2017348', '2025-11-17 18:11:44', '2025-11-17 18:12:03', 2184.90, 1, NULL, 'PACTADO', NULL, NULL),
(153, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Av. Estado de Israel 1598, San Miguel de Tucumán, Tucumán', '-26.80199880229072', '-65.23601979017258', '2025-11-21 06:37:16', '2025-11-21 06:37:19', 2340.90, 3, NULL, 'PACTADO', NULL, NULL),
(154, 32, NULL, 'Paraguay 873, San Miguel de Tucumán, Tucumán, Argentina', '-26.8082747', '-65.20475429999999', 'Av. Aconquija 655, Yerba Buena, Tucumán, Argentina', '-26.8164155', '-65.2747375', '2025-11-28 22:04:09', '2025-11-28 22:04:09', 11038.80, 5, NULL, 'PACTADO', NULL, NULL),
(155, 32, NULL, 'Paraguay 873, San Miguel de Tucumán, Tucumán, Argentina', '-26.8082747', '-65.20475429999999', 'Av. Aconquija 655, Yerba Buena, Tucumán, Argentina', '-26.8164155', '-65.2747375', '2025-11-28 22:04:12', '2025-11-28 22:04:12', 11038.80, 5, NULL, 'PACTADO', NULL, NULL),
(156, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081316', '-65.2047184', 'Santa Fe 3442, San Miguel de Tucumán, Tucumán, Argentina', '-26.8113852', '-65.246017', '2025-11-29 00:09:08', '2025-11-29 00:09:08', 7095.30, 5, NULL, 'PACTADO', NULL, NULL),
(157, 14, NULL, 'Pje. Ignacio Paz 3818, San Miguel de Tucumán, Tucumán, Argentina', '-26.8107411', '-65.2517688', 'Asunción 150, San Miguel de Tucumán, Tucumán', '-26.824440889253406', '-65.22256281226873', '2025-11-29 20:50:56', '2025-11-29 20:50:56', 5348.40, 5, NULL, 'PACTADO', NULL, NULL),
(158, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081568', '-65.2046793', 'Bolivia 309, San Miguel de Tucumán, Tucumán', '-26.81233797483001', '-65.19731182605028', '2025-12-02 07:21:11', '2025-12-02 07:21:11', 2323.20, 5, NULL, 'PACTADO', NULL, NULL),
(159, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081365', '-65.2047096', 'Junín 1275, San Miguel de Tucumán, Tucumán', '-26.812853846446597', '-65.20476669073105', '2025-12-02 07:22:33', '2025-12-02 07:22:33', 1832.10, 5, NULL, 'PACTADO', NULL, NULL),
(160, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081339', '-65.2047103', 'Junín 1298, San Miguel de Tucumán, Tucumán', '-26.81253217503545', '-65.20518209785223', '2025-12-02 07:24:34', '2025-12-02 07:24:34', 2037.30, 5, NULL, 'PACTADO', NULL, NULL),
(161, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081362', '-65.2047184', 'Pje. Quilmes 1488, San Miguel de Tucumán, Tucumán', '-26.80992974495009', '-65.20414609462023', '2025-12-02 07:25:10', '2025-12-02 07:25:10', 1245.30, 5, NULL, 'PACTADO', NULL, NULL),
(162, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081609', '-65.2046772', 'Junín 1442, San Miguel de Tucumán, Tucumán', '-26.810363337828452', '-65.20483441650867', '2025-12-02 07:35:31', '2025-12-02 07:35:31', 1580.10, 5, NULL, 'PACTADO', NULL, NULL),
(163, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081586', '-65.204676', 'Junín 960, San Miguel, Tucumán', '-26.816922985796246', '-65.20632069557905', '2025-12-02 07:45:51', '2025-12-02 07:45:51', 2017.80, 5, NULL, 'PACTADO', NULL, NULL),
(164, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081341', '-65.2047175', 'Maipú 1198, San Miguel de Tucumán, Tucumán', '-26.813847281693516', '-65.20394459366798', '2025-12-02 07:46:57', '2025-12-02 07:46:57', 1982.10, 5, NULL, 'PACTADO', NULL, NULL),
(165, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081637', '-65.2046837', 'Junín 1466, San Miguel de Tucumán, Tucumán', '-26.810097915745725', '-65.20492661744356', '2025-12-02 07:58:32', '2025-12-02 07:58:32', 1612.50, 5, NULL, 'PACTADO', NULL, NULL),
(166, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081634', '-65.204678', 'Av. República de Siria 1177, San Miguel de Tucumán, Tucumán', '-26.81391490678841', '-65.20680919289589', '2025-12-02 08:00:45', '2025-12-02 08:00:45', 2660.10, 5, NULL, 'PACTADO', NULL, NULL),
(167, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.808136', '-65.2047167', 'Av. República de Siria 1232, San Miguel de Tucumán, Tucumán', '-26.812981317841665', '-65.20683366805315', '2025-12-02 08:01:07', '2025-12-02 08:01:07', 1611.90, 5, NULL, 'PACTADO', NULL, NULL),
(168, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081393', '-65.2047135', 'Junín 1344, San Miguel de Tucumán, Tucumán', '-26.811682359660708', '-65.2051281183958', '2025-12-02 08:13:03', '2025-12-02 08:13:03', 1977.60, 5, NULL, 'PACTADO', NULL, NULL),
(169, 43, 32, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081396', '-65.2047221', 'Av. República de Siria 1175, San Miguel de Tucumán, Tucumán', '-26.813801799306116', '-65.20671028643847', '2025-12-02 08:14:22', '2025-12-02 08:14:29', 2669.70, 1, NULL, 'PACTADO', NULL, NULL),
(170, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081307', '-65.2047148', 'Av. República de Siria 1255, San Miguel de Tucumán, Tucumán', '-26.81279699296127', '-65.20648833364248', '2025-12-02 08:17:55', '2025-12-02 08:17:55', 2178.60, 5, NULL, 'PACTADO', NULL, NULL),
(171, 43, 32, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081599', '-65.2046787', 'Av. República de Siria 1374, San Miguel de Tucumán, Tucumán', '-26.81120508379584', '-65.20630929619074', '2025-12-02 08:19:15', '2025-12-02 08:19:24', 1386.30, 1, NULL, 'PACTADO', NULL, NULL),
(172, 43, 32, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081315', '-65.2047221', 'Chile 894, San Miguel de Tucumán, Tucumán', '-26.81228740492224', '-65.20630963146687', '2025-12-02 08:43:45', '2025-12-02 08:43:49', 2022.30, 1, NULL, 'PACTADO', NULL, NULL),
(173, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081389', '-65.2047205', 'Av. República de Siria 1241, San Miguel de Tucumán, Tucumán', '-26.81161772555464', '-65.20583588629961', '2025-12-02 08:48:19', '2025-12-02 08:48:19', 2135.40, 5, NULL, 'PACTADO', NULL, NULL),
(174, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081357', '-65.2047221', 'Av. República de Siria 1390, San Miguel de Tucumán, Tucumán', '-26.81100190430695', '-65.20628113299608', '2025-12-02 08:48:59', '2025-12-02 08:48:59', 1355.10, 5, NULL, 'PACTADO', NULL, NULL),
(175, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.808137', '-65.2047198', 'Uruguay 869, San Miguel de Tucumán, Tucumán', '-26.813250323906836', '-65.20616445690393', '2025-12-02 08:58:40', '2025-12-02 08:58:40', 1754.10, 5, NULL, 'PACTADO', NULL, NULL),
(176, 43, NULL, 'Paraguay 869, San Miguel de Tucumán, Tucumán', '-26.8081348', '-65.2047276', 'Perú 910, San Miguel de Tucumán, Tucumán', '-26.80953295663942', '-65.20588584244251', '2025-12-02 08:59:59', '2025-12-02 08:59:59', 1182.60, 5, NULL, 'PACTADO', NULL, NULL),
(177, 14, NULL, 'Zuviría 3318, San Miguel de Tucumán, Tucumán', '-26.8072144', '-65.2430169', 'Av. Mate De Luna X Groussac, San Miguel de Tucumán, Tucumán', '-26.82685180273334', '-65.22417582571507', '2025-12-09 17:14:25', '2025-12-09 17:14:25', 6000.90, 5, NULL, 'PACTADO', NULL, NULL),
(178, 14, NULL, 'Zuviría 3318, San Miguel de Tucumán, Tucumán', '-26.8072256', '-65.2430174', 'Plaza Eva Perón, San Miguel de Tucumán, Tucumán', '-26.80994949455824', '-65.23529961705208', '2025-12-09 17:58:41', '2025-12-09 17:58:41', 2345.10, 5, NULL, 'PACTADO', NULL, NULL),
(179, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Pcia de Mendoza 1601, San Miguel de Tucumán, Tucumán', '-26.82469670342934', '-65.22097561508417', '2025-12-09 18:31:06', '2025-12-09 18:31:06', 5370.60, 5, NULL, 'PACTADO', NULL, NULL),
(180, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Pcia de Corrientes 2954, San Miguel de Tucumán, Tucumán', '-26.815233288852816', '-65.2407280728221', '2026-01-27 20:20:39', '2026-01-27 20:23:01', 2965.50, 3, NULL, 'PACTADO', NULL, NULL),
(181, 39, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404236', '-65.2475745', '12 de Octubre 741, San Miguel de Tucumán, Tucumán, Argentina', '-26.8178055', '-65.21727419999999', '2026-01-27 22:49:33', '2026-01-27 22:49:33', 7049.10, 1, NULL, 'PACTADO', NULL, NULL),
(182, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404322', '-65.2475785', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2026-01-27 23:02:22', '2026-01-27 23:02:22', 8732.10, 1, NULL, 'PACTADO', NULL, NULL),
(183, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404054', '-65.2475905', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2026-01-27 23:02:54', '2026-01-27 23:03:07', 8730.30, 3, NULL, 'PACTADO', NULL, NULL),
(184, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Viamonte 5, San Miguel de Tucumán, Tucumán', '-26.823058585117703', '-65.24098757654428', '2026-01-28 01:05:36', '2026-01-28 01:05:36', 4146.00, 1, NULL, 'PACTADO', NULL, NULL),
(185, 17, NULL, 'Raúl Colombres 1052, San Miguel de Tucumán, Tucumán', '-26.8169546', '-65.1776375', 'Provincia de Mendoza 380, San Miguel de Tucumán, Tucumán, Argentina', '-26.828766', '-65.202393', '2026-01-30 23:03:51', '2026-01-30 23:03:51', 5874.00, 1, NULL, 'PACTADO', NULL, NULL),
(186, 17, 18, 'Raúl Colombres 1052, San Miguel de Tucumán, Tucumán', '-26.8169546', '-65.1776375', 'Provincia de Mendoza 380, San Miguel de Tucumán, Tucumán, Argentina', '-26.828766', '-65.202393', '2026-01-30 23:03:52', '2026-01-30 23:04:03', 5874.00, 3, NULL, 'PACTADO', NULL, NULL),
(187, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.840419', '-65.2475729', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-01-30 23:09:34', '2026-01-30 23:09:34', 2278.20, 1, NULL, 'PACTADO', NULL, NULL),
(188, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404633', '-65.2475582', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-01-30 23:10:10', '2026-01-30 23:10:10', 2283.30, 1, NULL, 'PACTADO', NULL, NULL),
(189, 15, 18, '12 de Octubre 902, San Miguel de Tucumán, Tucumán', '-26.815415', '-65.2170133', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-01-30 23:11:51', '2026-01-30 23:11:58', 8010.00, 3, NULL, 'PACTADO', NULL, NULL),
(190, 15, 18, '12 de Octubre 902, San Miguel de Tucumán, Tucumán', '-26.815415', '-65.2170133', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-01-30 23:37:23', '2026-01-30 23:37:29', 8010.00, 3, NULL, 'PACTADO', NULL, NULL),
(191, 15, 18, '12 de Octubre 902, San Miguel de Tucumán, Tucumán', '-26.815415', '-65.2170133', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-01-30 23:59:00', '2026-01-30 23:59:09', 8010.00, 3, NULL, 'PACTADO', NULL, NULL),
(192, 15, 18, '12 de Octubre 902, San Miguel de Tucumán, Tucumán', '-26.815415', '-65.2170133', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-01-31 00:00:05', '2026-01-31 00:00:08', 8010.00, 3, NULL, 'PACTADO', NULL, NULL),
(193, 15, 18, '12 de Octubre 902, San Miguel de Tucumán, Tucumán', '-26.815415', '-65.2170133', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-01-31 00:13:12', '2026-01-31 00:13:22', 8010.00, 3, NULL, 'PACTADO', NULL, NULL),
(194, 15, 18, '12 de Octubre 902, San Miguel de Tucumán, Tucumán', '-26.815415', '-65.2170133', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-01-31 00:29:33', '2026-01-31 00:29:38', 8010.00, 3, NULL, 'PACTADO', NULL, NULL),
(195, 15, NULL, '12 de Octubre 902, San Miguel de Tucumán, Tucumán', '-26.815415', '-65.2170133', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-01-31 00:31:40', '2026-01-31 00:31:40', 8010.00, 1, NULL, 'PACTADO', NULL, NULL),
(196, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.84042', '-65.2475919', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-02-02 22:27:57', '2026-02-02 22:32:00', 2279.10, 4, NULL, 'PACTADO', NULL, NULL),
(197, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán', '-26.840399', '-65.2475961', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-02-03 02:24:23', '2026-02-03 02:25:28', 2276.40, 4, NULL, 'PACTADO', NULL, NULL),
(198, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404033', '-65.2475851', 'Diagonal 930, San Miguel de Tucumán, Tucumán', '-26.835172321353568', '-65.25779161602259', '2026-02-03 23:01:15', '2026-02-03 23:07:38', 3361.80, 4, NULL, 'PACTADO', NULL, NULL),
(199, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404049', '-65.24759', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-02-03 23:19:15', '2026-02-03 23:33:35', 2277.30, 3, NULL, 'PACTADO', NULL, NULL),
(200, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404346', '-65.2475558', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-02-03 23:35:47', '2026-02-03 23:53:15', 2280.60, 4, NULL, 'PACTADO', NULL, NULL),
(201, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8403995', '-65.2475831', 'Supermercados Comodín, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.834853', '-65.2479649', '2026-02-03 23:55:52', '2026-02-03 23:56:12', 1724.10, 3, NULL, 'PACTADO', NULL, NULL),
(202, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404516', '-65.24755', 'Supermercados Comodín, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.834853', '-65.2479649', '2026-02-03 23:57:45', '2026-02-03 23:58:02', 1730.10, 4, NULL, 'PACTADO', NULL, NULL),
(203, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404054', '-65.247579', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297119', '-65.20774589999999', '2026-02-04 00:07:04', '2026-02-04 00:08:00', 8729.40, 4, NULL, 'PACTADO', NULL, NULL),
(204, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404033', '-65.2475801', 'Supermercados Comodín, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.834853', '-65.2479649', '2026-02-04 00:14:21', '2026-02-04 00:14:31', 1725.60, 4, NULL, 'PACTADO', NULL, NULL),
(205, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404071', '-65.2475792', 'Supermercados Comodín, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.834853', '-65.2479649', '2026-02-04 02:36:59', '2026-02-04 02:37:17', 1725.60, 3, NULL, 'PACTADO', NULL, NULL),
(206, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404092', '-65.2475824', 'Supermercados Comodín, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.834853', '-65.2479649', '2026-02-04 20:43:20', '2026-02-04 20:43:58', 1726.50, 3, NULL, 'PACTADO', NULL, NULL),
(207, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404129', '-65.2475856', 'Supermercados Comodín, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.834853', '-65.2479649', '2026-02-04 20:57:56', '2026-02-04 20:58:19', 1726.50, 3, NULL, 'PACTADO', NULL, NULL),
(208, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404061', '-65.2475861', 'Supermercados Comodín, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.834853', '-65.2479649', '2026-02-04 21:00:39', '2026-02-04 21:01:38', 1725.60, 4, NULL, 'PACTADO', NULL, NULL),
(209, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404008', '-65.2475922', 'Hipermercado Libertad, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.83505', '-65.252848', '2026-02-04 21:02:06', '2026-02-04 21:03:13', 2276.40, 3, NULL, 'PACTADO', NULL, NULL),
(210, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404036', '-65.2475831', 'Supermercados Comodín, Avenida General Roca, San Miguel de Tucumán, Tucumán, Argentina', '-26.834853', '-65.2479649', '2026-02-05 00:27:45', '2026-02-05 00:28:14', 1500.00, 4, 1, 'PACTADO', NULL, NULL),
(211, 17, NULL, 'Lavalle 494, San Miguel de Tucumán, Tucumán', '-26.8390798', '-65.2063677', 'Pcia de Córdoba 261, San Miguel de Tucumán, Tucumán', '-26.82704986755683', '-65.20013015717268', '2026-02-05 13:14:44', '2026-02-05 13:16:10', NULL, 3, 1, 'PACTADO', NULL, NULL),
(212, 39, 18, 'San Juan 1400, San Miguel de Tucumán, Tucumán', '-26.8226741', '-65.217052', 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán, Argentina', '-26.8404475', '-65.24768879999999', '2026-02-05 16:20:14', '2026-02-05 16:40:09', 7077.14, 4, 1, 'PACTADO', NULL, NULL),
(213, 14, 40, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Santiago del Estero 3097, San Miguel de Tucumán, Tucumán', '-26.816225207147284', '-65.24143114686012', '2026-02-13 05:05:33', '2026-02-13 05:06:02', NULL, 7, NULL, 'PACTADO', NULL, NULL),
(214, 14, NULL, 'Zuviría 3299, San Miguel de Tucumán, Tucumán', '-26.8069383', '-65.2431317', 'Correa Roque Padre 500, San Miguel de Tucumán, Tucumán', '-26.81750945166414', '-65.24249397218227', '2026-02-13 19:07:28', '2026-02-13 19:08:45', NULL, 3, 1, 'PACTADO', NULL, NULL);
INSERT INTO `viajes` (`id_viajes`, `id_pasajero`, `id_conductor`, `direccion_desde`, `lat_desde`, `lon_desde`, `direccion_hasta`, `lat_hasta`, `lon_hasta`, `hora_inicio`, `hora_fin`, `precio_final`, `id_estado`, `id_tarifa`, `modo_cobro`, `precio_pactado`, `precio_estimado`) VALUES
(215, 15, 18, 'Av. Gral. Roca 3057, San Miguel de Tucumán, Tucumán', '-26.8349467', '-65.247955', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-17 01:02:43', '2026-02-17 01:03:27', 4550.70, 4, 1, 'PACTADO', 4550.70, NULL),
(216, 15, 18, 'Av. Independencia 2777, San Miguel de Tucumán, Tucumán', '-26.8419417', '-65.2444833', 'Av. Mitre & San Juan, San Miguel de Tucumán, Tucumán, Argentina', '-26.8226059', '-65.2170831', '2026-02-17 01:12:59', '2026-02-17 01:14:10', 5667.90, 4, 1, 'PACTADO', 5667.90, NULL),
(217, 15, 18, 'Av. Independencia 2777, San Miguel de Tucumán, Tucumán', '-26.8419417', '-65.2444833', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', NULL, '2026-02-17 01:24:06', NULL, 6, 1, 'PACTADO', 4754.40, NULL),
(218, 15, 18, 'Av. Independencia 2777, San Miguel de Tucumán, Tucumán', '-26.8419417', '-65.2444833', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', NULL, '2026-02-17 01:29:36', NULL, 6, 1, 'PACTADO', 4754.40, NULL),
(219, 15, 18, 'Av. Independencia 2777, San Miguel de Tucumán, Tucumán', '-26.8419417', '-65.2444833', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-17 01:30:46', '2026-02-17 01:31:15', 4754.40, 4, 1, 'PACTADO', 4754.40, NULL),
(220, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.840439', '-65.2475281', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', NULL, '2026-02-18 13:29:50', NULL, 3, 1, 'PACTADO', 4863.30, NULL),
(221, 15, 18, 'Av. Independencia 2777, San Miguel de Tucumán, Tucumán', '-26.8419417', '-65.2444833', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-18 13:52:37', '2026-02-18 13:52:47', 1500.00, 4, 1, 'PACTADO', NULL, 4754.40),
(222, 15, 18, 'Av. Independencia 2777, San Miguel de Tucumán, Tucumán', '-26.8419417', '-65.2444833', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-18 16:19:29', '2026-02-18 16:20:19', 4754.40, 4, 1, 'PACTADO', 4754.40, 4754.40),
(223, 15, 18, 'Av. Independencia 2777, San Miguel de Tucumán, Tucumán', '-26.8419417', '-65.2444833', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-19 22:59:11', '2026-02-19 22:59:25', 4754.40, 4, 1, 'PACTADO', 4754.40, 4754.40),
(224, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404491', '-65.2475246', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-19 23:01:40', '2026-02-19 23:02:12', 4865.70, 3, 1, 'PACTADO', 4865.70, 4865.70),
(225, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404589', '-65.2475648', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-19 23:02:49', '2026-02-19 23:02:49', 4867.50, 5, 1, 'PACTADO', 4867.50, 4867.50),
(226, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404418', '-65.2475388', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-19 23:06:29', '2026-02-19 23:06:46', 4864.20, 4, 1, 'PACTADO', 4864.20, 4864.20),
(227, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404725', '-65.2475278', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-19 23:25:06', '2026-02-19 23:25:15', 4868.40, 4, 1, 'PACTADO', 4868.40, 4868.40),
(228, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404634', '-65.2475391', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-20 00:03:32', '2026-02-20 00:03:51', 4867.50, 3, 1, 'PACTADO', 4867.50, 4867.50),
(229, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404753', '-65.2475501', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-20 00:04:39', '2026-02-20 00:06:39', 4869.30, 4, 1, 'PACTADO', 4869.30, 4869.30),
(230, 15, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404576', '-65.2475768', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-20 00:14:38', '2026-02-20 00:15:14', 4867.50, 3, 1, 'PACTADO', 4867.50, 4867.50),
(231, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404513', '-65.247529', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-20 00:15:58', '2026-02-20 00:16:14', 4866.60, 4, 1, 'PACTADO', 4866.60, 4866.60),
(232, 15, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404555', '-65.2475288', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-20 01:53:31', '2026-02-20 01:53:40', 4866.60, 4, 1, 'PACTADO', 4866.60, 4866.60),
(233, 39, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404848', '-65.2475604', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-28 03:35:38', '2026-02-28 03:36:53', 4870.20, 3, 1, 'PACTADO', 4870.20, 4870.20),
(234, 39, 18, 'A. Lincoln 1240, San Miguel de Tucumán, Tucumán', '-26.8405138', '-65.2476244', 'San Juan 1995, San Miguel de Tucumán, Tucumán, Argentina', '-26.8205856', '-65.2263348', '2026-02-28 03:37:49', '2026-02-28 03:37:53', 4876.20, 4, 1, 'PACTADO', 4876.20, 4876.20),
(235, 15, NULL, 'Av. Independencia 2777, San Miguel de Tucumán, Tucumán', '-26.8419417', '-65.2444833', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297095', '-65.2078215', '2026-04-21 02:31:52', '2026-04-21 02:31:52', 7734.60, 5, 1, 'PACTADO', 7734.60, 7734.60),
(236, 39, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404402', '-65.2475436', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297095', '-65.2078215', '2026-04-21 02:42:57', '2026-04-21 02:46:01', 7812.90, 4, 1, 'PACTADO', 7812.90, 7812.90),
(237, 39, NULL, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404455', '-65.2475483', 'Supermercados Comodín, Avenida Juan B. Justo, San Miguel de Tucumán, Tucumán, Argentina', '-26.8164906', '-65.1930673', '2026-04-22 23:42:28', '2026-04-22 23:42:28', 9597.00, 5, 1, 'PACTADO', 9597.00, 9597.00),
(238, 39, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404455', '-65.2475483', 'Supermercados Comodín, Avenida Juan B. Justo, San Miguel de Tucumán, Tucumán, Argentina', '-26.8164906', '-65.1930673', '2026-04-22 23:44:03', '2026-04-22 23:44:10', 9597.00, 4, 1, 'PACTADO', 9597.00, 9597.00),
(239, 39, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404409', '-65.2475548', 'Comotti Crisostomo Pastas, Pizzas y Postres, Crisóstomo Alvarez, San Miguel de Tucumán, Tucumán, Argentina', '-26.8315222', '-65.2084729', '2026-04-22 23:44:50', '2026-04-22 23:45:02', 6599.10, 6, 1, 'PACTADO', 6599.10, 6599.10),
(240, 39, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404413', '-65.2475764', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297095', '-65.2078215', '2026-04-22 23:47:03', '2026-04-22 23:47:19', 7813.80, 6, 1, 'PACTADO', 7813.80, 7813.80),
(241, 15, NULL, 'Bolivia 1656, San Miguel de Tucumán, Tucumán', '-26.8082848', '-65.2175903', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297095', '-65.2078215', '2026-04-23 00:06:36', '2026-04-23 00:06:57', 4306.80, 3, 1, 'PACTADO', 4306.80, 4306.80),
(242, 15, 18, 'Abraham Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.84232', '-65.24823', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297095', '-65.2078215', '2026-04-23 00:07:53', '2026-04-23 00:08:33', 8068.80, 3, 1, 'PACTADO', 8068.80, 8068.80),
(243, 15, 18, 'Av. Independencia 2977, San Miguel de Tucumán, Tucumán', '-26.8413767', '-65.2476733', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297095', '-65.2078215', '2026-04-23 00:25:58', '2026-04-23 00:50:07', 7980.90, 4, 1, 'PACTADO', 7980.90, 7980.90),
(244, 15, 18, 'Av. Independencia 2977, San Miguel de Tucumán, Tucumán', '-26.8413767', '-65.2476733', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297095', '-65.2078215', '2026-04-23 00:51:42', '2026-04-23 00:52:36', 7980.90, 3, 1, 'PACTADO', 7980.90, 7980.90),
(245, 39, 18, 'A. Lincoln 1252, San Miguel de Tucumán, Tucumán', '-26.8404328', '-65.2475269', 'Maipú 50, San Miguel de Tucumán, Tucumán, Argentina', '-26.8297095', '-65.2078215', '2026-04-24 23:40:30', '2026-04-24 23:41:54', 7811.10, 4, 1, 'PACTADO', 7811.10, 7811.10);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id_calificacion`),
  ADD UNIQUE KEY `uq_calificacion_unica` (`id_viaje`,`tipo`),
  ADD KEY `idx_calif_pasajero` (`id_usuario`,`tipo`),
  ADD KEY `idx_calif_conductor` (`id_conductor`,`tipo`);

--
-- Indexes for table `conductores`
--
ALTER TABLE `conductores`
  ADD PRIMARY KEY (`id_conductor`) USING BTREE,
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `conductores_ibfk_3` (`id_tipo_vehiculo`),
  ADD KEY `id_estado_validacion` (`id_validacion_conductor`) USING BTREE;

--
-- Indexes for table `conductor_imagenes`
--
ALTER TABLE `conductor_imagenes`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `fk_img_conductor` (`id_conductor`);

--
-- Indexes for table `estado_vajes`
--
ALTER TABLE `estado_vajes`
  ADD PRIMARY KEY (`id_estado_viajes`);

--
-- Indexes for table `estado_validacion`
--
ALTER TABLE `estado_validacion`
  ADD PRIMARY KEY (`id_estado_validacion`);

--
-- Indexes for table `generos`
--
ALTER TABLE `generos`
  ADD PRIMARY KEY (`id_genero`);

--
-- Indexes for table `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `fk_pago_viaje` (`id_viajes`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indexes for table `tarifas`
--
ALTER TABLE `tarifas`
  ADD PRIMARY KEY (`id_tarifa`);

--
-- Indexes for table `tipos_vehiculo`
--
ALTER TABLE `tipos_vehiculo`
  ADD PRIMARY KEY (`id_tipo_vehiculo`) USING BTREE;

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `id_genero` (`id_genero`),
  ADD KEY `id_rol` (`id_rol`),
  ADD KEY `idx_usuarios_dni` (`dni`),
  ADD KEY `idx_usuarios_email` (`email_usuario`);

--
-- Indexes for table `validacion_conductor`
--
ALTER TABLE `validacion_conductor`
  ADD PRIMARY KEY (`id_validacion`),
  ADD KEY `id_estado_validacion` (`id_estado_validacion`),
  ADD KEY `idx_validacion_usuario` (`id_usuario`);

--
-- Indexes for table `viajes`
--
ALTER TABLE `viajes`
  ADD PRIMARY KEY (`id_viajes`),
  ADD KEY `idx_viajes_conductor` (`id_conductor`),
  ADD KEY `idx_viajes_pasajero` (`id_pasajero`),
  ADD KEY `idx_viajes_fecha` (`hora_inicio`),
  ADD KEY `id_estado` (`id_estado`),
  ADD KEY `fk_viaje_tarifa` (`id_tarifa`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id_calificacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conductores`
--
ALTER TABLE `conductores`
  MODIFY `id_conductor` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `conductor_imagenes`
--
ALTER TABLE `conductor_imagenes`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `estado_vajes`
--
ALTER TABLE `estado_vajes`
  MODIFY `id_estado_viajes` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `estado_validacion`
--
ALTER TABLE `estado_validacion`
  MODIFY `id_estado_validacion` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `generos`
--
ALTER TABLE `generos`
  MODIFY `id_genero` int(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id_pago` int(6) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tarifas`
--
ALTER TABLE `tarifas`
  MODIFY `id_tarifa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tipos_vehiculo`
--
ALTER TABLE `tipos_vehiculo`
  MODIFY `id_tipo_vehiculo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `validacion_conductor`
--
ALTER TABLE `validacion_conductor`
  MODIFY `id_validacion` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `viajes`
--
ALTER TABLE `viajes`
  MODIFY `id_viajes` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=246;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `fk_calif_viaje` FOREIGN KEY (`id_viaje`) REFERENCES `viajes` (`id_viajes`);

--
-- Constraints for table `conductores`
--
ALTER TABLE `conductores`
  ADD CONSTRAINT `FK_conductores_validacion_conductor` FOREIGN KEY (`id_validacion_conductor`) REFERENCES `validacion_conductor` (`id_validacion`),
  ADD CONSTRAINT `conductores_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `conductores_ibfk_3` FOREIGN KEY (`id_tipo_vehiculo`) REFERENCES `tipos_vehiculo` (`id_tipo_vehiculo`);

--
-- Constraints for table `conductor_imagenes`
--
ALTER TABLE `conductor_imagenes`
  ADD CONSTRAINT `fk_img_conductor` FOREIGN KEY (`id_conductor`) REFERENCES `conductores` (`id_conductor`);

--
-- Constraints for table `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `fk_pago_viaje` FOREIGN KEY (`id_viajes`) REFERENCES `viajes` (`id_viajes`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_genero`) REFERENCES `generos` (`id_genero`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);

--
-- Constraints for table `validacion_conductor`
--
ALTER TABLE `validacion_conductor`
  ADD CONSTRAINT `validacion_conductor_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `validacion_conductor_ibfk_2` FOREIGN KEY (`id_estado_validacion`) REFERENCES `estado_validacion` (`id_estado_validacion`);

--
-- Constraints for table `viajes`
--
ALTER TABLE `viajes`
  ADD CONSTRAINT `fk_viaje_tarifa` FOREIGN KEY (`id_tarifa`) REFERENCES `tarifas` (`id_tarifa`),
  ADD CONSTRAINT `viajes_ibfk_1` FOREIGN KEY (`id_pasajero`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `viajes_ibfk_2` FOREIGN KEY (`id_conductor`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `viajes_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estado_vajes` (`id_estado_viajes`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
