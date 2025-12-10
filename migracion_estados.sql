-- Script de migración para actualizar estados de viajes existentes
-- Ejecutar después de actualizar la estructura de la base de datos

USE `db_faketaxi_prueba`;

-- Actualizar estados de viajes existentes según el mapeo:
-- Estado antiguo 5 (Buscando) -> Estado nuevo 1 (Buscando conductor)
-- Estado antiguo 1 (Asignado) -> Estado nuevo 2 (Asignado) 
-- Estado antiguo 2 (En Curso) -> Estado nuevo 5 (En curso)
-- Estado antiguo 4 (Finalizado) -> Estado nuevo 6 (Finalizado)
-- Estado antiguo 3 (Cancelado) -> Estado nuevo 7 (Cancelado)

UPDATE `viajes` 
SET `id_estado` = 1 
WHERE `id_estado` = 5 AND `id_conductor` IS NULL;

UPDATE `viajes` 
SET `id_estado` = 2 
WHERE `id_estado` = 1 AND `id_conductor` IS NOT NULL;

UPDATE `viajes` 
SET `id_estado` = 5 
WHERE `id_estado` = 2;

UPDATE `viajes` 
SET `id_estado` = 6 
WHERE `id_estado` = 4;

UPDATE `viajes` 
SET `id_estado` = 7 
WHERE `id_estado` = 3;

-- Sincronizar campo estado con id_estado (por compatibilidad)
UPDATE `viajes` 
SET `estado` = `id_estado`;

-- Actualizar fecha_inicio y fecha_fin desde hora_inicio y hora_fin si están nulos
UPDATE `viajes` 
SET `fecha_inicio` = `hora_inicio` 
WHERE `fecha_inicio` IS NULL AND `hora_inicio` IS NOT NULL;

UPDATE `viajes` 
SET `fecha_fin` = `hora_fin` 
WHERE `fecha_fin` IS NULL AND `hora_fin` IS NOT NULL;

