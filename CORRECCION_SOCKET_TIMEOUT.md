# Corrección: Timeout al Conectar Socket.IO

## 🔧 Problema Identificado

El conductor no podía conectarse al socket, mostrando el error:
```
❌ No se pudo establecer conexión con el socket: Exception: ⏱️ Timeout al conectar con el socket.
```

## ✅ Correcciones Aplicadas

### 1. **Backend - Configuración Socket.IO Mejorada** (`socket.js`)

**Cambios:**
- ✅ Agregado soporte para múltiples transportes (`websocket` y `polling`)
- ✅ Aumentado `pingTimeout` a 60 segundos
- ✅ Aumentado `pingInterval` a 25 segundos
- ✅ Agregado `allowEIO3: true` para compatibilidad
- ✅ Agregado `credentials: true` en CORS
- ✅ Log de confirmación cuando Socket.IO está listo

```javascript
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});
```

### 2. **Frontend - Manejo de Conexión Mejorado** (`socket_service.dart`)

**Cambios principales:**

#### a) Timeout Aumentado
- ✅ Timeout aumentado de 5 a 20 segundos
- ✅ El socket puede continuar intentando en segundo plano aunque haya timeout

#### b) Manejo de Errores No Bloqueante
- ✅ Si hay timeout, no lanza excepción que bloquee la UI
- ✅ El socket sigue intentando reconectar automáticamente
- ✅ Permite que la app continúe funcionando mientras el socket se conecta

#### c) Sistema de Registro Pendiente
- ✅ Si el socket no está conectado cuando se intenta registrar un usuario, guarda el registro
- ✅ Cuando el socket se conecta, automáticamente re-emite el registro
- ✅ Asegura que el conductor se registre incluso si la conexión tarda

#### d) Configuración de Socket Mejorada
- ✅ Permite ambos transportes (`websocket` y `polling`)
- ✅ Timeout de conexión aumentado a 20 segundos
- ✅ Reintentos automáticos mejorados
- ✅ Limpieza de URL (remover trailing slashes)

### 3. **Frontend - Flujo del Conductor Mejorado** (`driver_map_screen.dart`)

**Cambios:**
- ✅ Manejo de errores mejorado en `_goOnline()`
- ✅ No bloquea si el socket no se conecta inmediatamente
- ✅ Muestra mensaje informativo: "Conectando al servidor... (puede tardar unos segundos)"
- ✅ Permite que el proceso continúe aunque haya errores temporales

## 🔍 Cómo Verificar que Funciona

### Paso 1: Verificar Servidor
1. Iniciar el servidor backend
2. Verificar en los logs: `🔌 Socket.IO configurado y listo para conexiones`
3. Verificar: `Servidor escuchando en http://localhost:3000 🚕🔥`

### Paso 2: Conectar Conductor
1. Abrir la app del conductor
2. Presionar "CONECTARSE" o "ONLINE"
3. **Logs esperados en el frontend:**
   ```
   🔌 [Driver] Conectando conductor X...
   🔌 [Socket] Intentando conectar a: http://tu-servidor
   ✅ [Socket] Conectado al servidor Socket.IO exitosamente
   ✅ [Driver] Socket conectado exitosamente
   🧍 [Socket] Evento usuario_conectado emitido
   ✅ [Driver] Conductor X registrado en socket
   ```

4. **Logs esperados en el backend:**
   ```
   🟢 Cliente conectado: [socket-id]
   🚕 Conductor X unido a salas "conductores" y "conductor_X"
   📌 [Socket] Rooms del conductor X: [rooms]
   ```

### Paso 3: Verificar Estado
- El botón debería cambiar a "DESCONECTARSE" o "OFFLINE"
- El conductor debería estar listo para recibir viajes

## 🐛 Si Aún Hay Problemas

### Verificar URL del Servidor
1. Verificar que `API_URL` en el `.env` del frontend sea correcta
2. Debe ser la URL base del servidor (ej: `http://192.168.1.100:3000` o `http://localhost:3000`)
3. **NO debe tener** `/socket.io` al final
4. **NO debe tener** trailing slash (`/`)

### Verificar Conectividad de Red
1. Verificar que el dispositivo pueda alcanzar el servidor
2. Si usas IP local, verificar que esté en la misma red
3. Verificar firewall/antivirus que no bloquee la conexión

### Verificar Logs
1. **Frontend:** Buscar logs que empiecen con `[Socket]` o `[Driver]`
2. **Backend:** Buscar logs que empiecen con `🟢` o `🚕`
3. Si ves `⏱️ Timeout`, el socket seguirá intentando en segundo plano

### Verificar Puerto
1. Verificar que el puerto en el backend coincida con el de la URL
2. Verificar que el puerto no esté bloqueado por firewall

## 📋 Checklist de Verificación

- [ ] Servidor backend está corriendo
- [ ] Socket.IO se inicializa correctamente (ver log: `🔌 Socket.IO configurado`)
- [ ] La URL en `.env` es correcta (sin `/socket.io`, sin trailing slash)
- [ ] El dispositivo puede alcanzar el servidor (misma red, firewall abierto)
- [ ] Al presionar "CONECTARSE", aparecen logs de conexión
- [ ] El conductor se une al room "conductores" (ver logs del backend)
- [ ] El botón cambia a "DESCONECTARSE" o "OFFLINE"
- [ ] El conductor puede recibir viajes

## 🔄 Comportamiento Esperado

### Conexión Exitosa (Normal)
1. Usuario presiona "CONECTARSE"
2. Socket se conecta en 1-3 segundos
3. Usuario se registra automáticamente
4. Conductor está listo para recibir viajes

### Conexión Lenta (Red Lenta)
1. Usuario presiona "CONECTARSE"
2. Socket intenta conectar (puede tardar hasta 20 segundos)
3. Mientras tanto, muestra mensaje: "Conectando al servidor..."
4. Cuando se conecta, registra automáticamente al usuario
5. Conductor está listo para recibir viajes

### Conexión Fallida Temporalmente
1. Usuario presiona "CONECTARSE"
2. Timeout después de 20 segundos
3. **NO bloquea la UI**
4. Socket sigue intentando en segundo plano
5. Cuando se conecta (automáticamente), registra al usuario
6. Conductor está listo para recibir viajes

## 📝 Notas Importantes

1. **El socket ahora es más tolerante a errores**: No bloquea la UI si hay problemas de conexión
2. **Reconexión automática**: Si se desconecta, intenta reconectar automáticamente
3. **Registro pendiente**: Si intentas registrar un usuario antes de que el socket se conecte, se guarda y se emite cuando se conecte
4. **Logs detallados**: Todos los pasos están logueados para facilitar debugging

## 🚀 Próximos Pasos

Una vez que el conductor pueda conectarse:
1. Verificar que recibe viajes cuando un pasajero los solicita
2. Verificar que puede aceptar/rechazar viajes
3. Verificar seguimiento en tiempo real
4. Implementar pantalla de calificación

