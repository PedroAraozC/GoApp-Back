# Cambios Implementados - GoApp

## 📋 Resumen de Cambios

Se ha implementado un flujo completo de viajes con seguimiento en tiempo real y estados intermedios detallados.

---

## 🗄️ Base de Datos

### Cambios en `Bdd_Prueba.sql`

#### 1. Tabla `estado_vajes` - Estados Actualizados

**Estados anteriores:**
- 1: Asignado
- 2: En Curso
- 3: Cancelado
- 4: Finalizado
- 5: Buscando

**Nuevos estados:**
- **1**: "Buscando conductor" - El pasajero solicitó el viaje
- **2**: "Asignado" - El conductor aceptó el viaje (transitorio)
- **3**: "En camino al encuentro" - El conductor va al punto de encuentro
- **4**: "Esperando pasajero" - El conductor llegó al punto de encuentro
- **5**: "En curso" - El viaje comenzó
- **6**: "Finalizado" - El viaje terminó
- **7**: "Cancelado" - El viaje fue cancelado

#### 2. Tabla `viajes` - Campos Agregados

Se agregaron los siguientes campos:
- `fecha_inicio` (datetime) - Fecha de inicio del viaje
- `fecha_fin` (datetime) - Fecha de finalización del viaje
- `precio_final` (decimal) - Precio final del viaje
- `distancia_km` (decimal) - Distancia recorrida en kilómetros
- `duracion_min` (int) - Duración del viaje en minutos
- `estado` (int) - Campo adicional para compatibilidad

### Script de Migración

Se creó el archivo `migracion_estados.sql` para actualizar los datos existentes según los nuevos estados.

**Ejecutar después de actualizar la estructura:**
```sql
-- Ejecutar migracion_estados.sql en tu base de datos
```

---

## 🔧 Backend (Node.js)

### Nuevos Endpoints

#### Rutas de Viajes (`/viajes`)

1. **POST `/iniciarViaje`** - Iniciar un nuevo viaje
   - Estado resultante: 1 (Buscando conductor)

2. **PUT `/:id/aceptar`** - Conductor acepta el viaje
   - Body: `{ "id_conductor": number }`
   - Estados: 1 → 2 → 3 (automático)

3. **PUT `/:id/rechazar`** - Conductor rechaza el viaje
   - Body: `{ "id_conductor": number }`
   - El viaje sigue disponible para otros conductores

4. **PUT `/:id/actualizarUbicacion`** - Actualizar ubicación en tiempo real
   - Body: `{ "lat": number, "lng": number, "id_usuario": number, "tipo": "conductor" | "pasajero" }`

5. **PUT `/:id/llegarEncuentro`** - Conductor llegó al punto de encuentro
   - Body: `{ "id_conductor": number }`
   - Estado: 3 → 4

6. **PUT `/:id/comenzar`** - Comenzar el viaje
   - Body: `{ "id_conductor": number }`
   - Estado: 4 → 5

7. **PUT `/:id/finalizar`** - Finalizar el viaje
   - Body: `{ "id_conductor": number, "precio_final"?: number, "distancia_km"?: number, "duracion_min"?: number }`
   - Estado: 5 → 6
   - El conductor vuelve a estar disponible

8. **PUT `/:id/cancelar`** - Cancelar viaje
   - Body: `{ "id_usuario": number, "tipo": "pasajero" | "conductor" }`
   - Estado: → 7 (o vuelve a 1 si cancela conductor)

### Eventos Socket.IO

#### Eventos Emitidos por el Servidor

- `viaje_creado` - Nuevo viaje disponible (solo a conductores)
- `viaje_buscando_conductor` - Notifica al pasajero que está buscando
- `viaje_asignado` - Viaje asignado a un conductor (al pasajero)
- `viaje_aceptado` - Conductor aceptó el viaje (al conductor)
- `viaje_tomado` - Viaje tomado por otro conductor (a todos los conductores)
- `viaje_rechazado` - Viaje rechazado por un conductor
- `conductor_llego_encuentro` - Conductor llegó al punto de encuentro (al pasajero)
- `llegaste_encuentro` - Notifica al conductor que llegó
- `viaje_en_curso` - Viaje comenzó (a ambos usuarios)
- `viaje_comenzado` - Notifica al conductor que comenzó
- `viaje_finalizado` - Viaje finalizado (al pasajero)
- `viaje_completado` - Notifica al conductor que completó
- `viaje_cancelado` - Viaje cancelado
- `viaje_cancelado_pasajero` - Pasajero canceló (al conductor)
- `viaje_cancelado_busqueda` - Viaje cancelado antes de aceptar (a conductores)
- `conductor_disponible` - Conductor disponible nuevamente
- `ubicacion_conductor_actualizada` - Ubicación del conductor (al pasajero)
- `ubicacion_pasajero_actualizada` - Ubicación del pasajero (al conductor)
- `ubicacion_en_tiempo_real` - Ubicación actualizada (en room del viaje)

#### Eventos Recibidos por el Servidor

- `usuario_conectado` - Usuario se conecta (`{ id_usuario, tipo }`)
- `usuario_desconectado` - Usuario se desconecta
- `join_viaje` - Unirse a room de viaje
- `leave_viaje` - Salir de room de viaje
- `ubicacion_actualizada` - Cliente envía su ubicación
- `join_chat` - Unirse a chat del viaje
- `send_message` - Enviar mensaje en chat

---

## 📱 Frontend (Flutter)

### Servicios Actualizados

#### `api_service.dart`

**Nuevos métodos agregados:**

1. `rechazarViaje(int idViaje, int idConductor)` - Rechazar un viaje
2. `actualizarUbicacion(...)` - Actualizar ubicación en tiempo real
3. `llegarEncuentro(int idViaje, int idConductor)` - Notificar llegada al encuentro
4. `comenzarViaje(int idViaje, int idConductor)` - Comenzar viaje (actualizado)
5. `finalizarViaje(...)` - Finalizar viaje (actualizado con id_conductor)
6. `cancelarViaje(...)` - Cancelar viaje (actualizado con tipo)

**Métodos actualizados:**
- `acceptRide()` - Ahora usa `id_conductor` en lugar de `id_usuario`
- `comenzarViaje()` - Ahora requiere `id_conductor`
- `finalizarViaje()` - Ahora requiere `id_conductor`
- `cancelarViaje()` - Ahora requiere `tipo` (pasajero/conductor)

#### `socket_service.dart`

**Nuevos métodos agregados:**

1. `unirseAViaje(int idViaje, int userId, String tipo)` - Unirse a room de viaje
2. `salirDeViaje(int idViaje, int userId)` - Salir de room de viaje
3. `enviarUbicacion(...)` - Enviar ubicación en tiempo real

**Nuevos listeners:**

1. `onViajeCreado()` - Escuchar nuevos viajes (conductores)
2. `onViajeAsignado()` - Escuchar asignación (pasajero)
3. `onViajeAceptado()` - Escuchar aceptación (conductor)
4. `onConductorLlegoEncuentro()` - Escuchar llegada al encuentro
5. `onViajeEnCurso()` - Escuchar inicio de viaje
6. `onViajeFinalizado()` - Escuchar finalización
7. `onViajeCancelado()` - Escuchar cancelación
8. `onViajeBuscandoConductor()` - Escuchar cuando vuelve a buscar
9. `onUbicacionEnTiempoReal()` - Escuchar ubicaciones actualizadas
10. `onViajeTomado()` - Escuchar cuando otro conductor tomó el viaje
11. `onViajeRechazado()` - Escuchar rechazos
12. `onConductorDisponible()` - Escuchar disponibilidad

---

## 🔄 Flujo Completo de Viaje

### Flujo Exitoso

1. **Pasajero solicita viaje**
   - `POST /viajes/iniciarViaje`
   - Estado: 1 (Buscando conductor)
   - Evento: `viaje_creado` → conductores

2. **Conductor acepta**
   - `PUT /viajes/:id/aceptar`
   - Estados: 1 → 2 → 3 (automático)
   - Eventos: `viaje_asignado` → pasajero, `viaje_aceptado` → conductor

3. **Seguimiento en tiempo real**
   - `PUT /viajes/:id/actualizarUbicacion` (periódico)
   - Evento: `ubicacion_en_tiempo_real` → ambos usuarios

4. **Conductor llega al encuentro**
   - `PUT /viajes/:id/llegarEncuentro`
   - Estado: 3 → 4
   - Evento: `conductor_llego_encuentro` → pasajero

5. **Viaje comienza**
   - `PUT /viajes/:id/comenzar`
   - Estado: 4 → 5
   - Evento: `viaje_en_curso` → ambos

6. **Viaje finaliza**
   - `PUT /viajes/:id/finalizar`
   - Estado: 5 → 6
   - Evento: `viaje_finalizado` → pasajero
   - Conductor vuelve a estar disponible

### Flujo de Cancelación

#### Cancelación por Pasajero

- **Antes de aceptación (estado 1):**
  - `PUT /viajes/:id/cancelar` con `tipo: "pasajero"`
  - Estado: → 7
  - Evento: `viaje_cancelado_busqueda` → conductores

- **Después de aceptación (estados 2-4):**
  - `PUT /viajes/:id/cancelar` con `tipo: "pasajero"`
  - Estado: → 7
  - Evento: `viaje_cancelado_pasajero` → conductor
  - Conductor vuelve a estar disponible

#### Cancelación por Conductor

- `PUT /viajes/:id/cancelar` con `tipo: "conductor"`
- Estado: → 1 (Buscando conductor)
- Se quita la asignación del conductor
- Evento: `viaje_creado` → conductores
- Conductor vuelve a estar disponible

---

## 📝 Notas Importantes

1. **Instalación de dependencias:**
   ```bash
   # Backend
   npm install socket.io
   
   # Frontend (ya debería estar instalado)
   # socket_io_client en pubspec.yaml
   ```

2. **Variables de entorno:**
   - Backend: Asegúrate de tener `API_URL` configurado
   - Frontend: Asegúrate de tener `API_URL` en `.env`

3. **Migración de base de datos:**
   - Ejecutar `Bdd_Prueba.sql` actualizado
   - Ejecutar `migracion_estados.sql` para actualizar datos existentes

4. **Seguimiento en tiempo real:**
   - El frontend debe enviar ubicaciones periódicamente usando `enviarUbicacion()`
   - Recomendado: cada 2-5 segundos durante el viaje
   - Unirse al room del viaje usando `unirseAViaje()` antes de enviar ubicaciones

---

## ✅ Checklist de Implementación Frontend

- [ ] Actualizar pantallas de pasajero para usar nuevos endpoints
- [ ] Actualizar pantallas de conductor para usar nuevos endpoints
- [ ] Implementar seguimiento en tiempo real con mapas
- [ ] Agregar botón "Llegué al encuentro" para conductor
- [ ] Agregar botón "Comenzar viaje" para conductor (solo cuando estado = 4)
- [ ] Agregar botón "Finalizar viaje" deslizable para conductor
- [ ] Implementar cancelación con tipo (pasajero/conductor)
- [ ] Agregar listeners de Socket.IO en las pantallas correspondientes
- [ ] Implementar envío periódico de ubicación durante viajes
- [ ] Mostrar mensaje de "Viaje finalizado" y opción de puntuar al pasajero

---

## 🐛 Troubleshooting

### El socket no se conecta
- Verificar que `API_URL` esté configurado correctamente
- Verificar que el servidor esté corriendo
- Verificar que Socket.IO esté instalado en el backend

### Los estados no coinciden
- Ejecutar `migracion_estados.sql`
- Verificar que la tabla `estado_vajes` tenga los 7 estados correctos

### Las ubicaciones no se actualizan
- Verificar que se esté llamando a `unirseAViaje()` antes de enviar ubicaciones
- Verificar que se esté enviando ubicación periódicamente
- Verificar que el listener `onUbicacionEnTiempoReal()` esté registrado

