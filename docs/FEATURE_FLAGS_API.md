# Feature Flags Backend API - Documentación

## Descripción General

La API de Feature Flags permite gestionar dinámicamente las funcionalidades habilitadas en la aplicación móvil Jeturing Pay sin necesidad de publicar una nueva versión.

**Base URL**: `https://api-001.sajet.us`

**Autenticación**: Header `x-api-key` requerido en todas las peticiones

---

## Endpoints

### 1. Listar Feature Flags

Obtiene el estado actual de todos los feature flags configurados.

**Endpoint**: `GET /feature-flags/`

**Headers**:
```
x-api-key: your-api-key-here
```

**Respuesta Exitosa** (200 OK):
```json
{
  "flags": {
    "enableTapToPay": {
      "value": true,
      "description": "Enable Tap to Pay functionality"
    },
    "enablePaymentLinks": {
      "value": true,
      "description": "Enable payment links generation"
    },
    "enableQrPayments": {
      "value": true,
      "description": "Enable QR code payments"
    },
    "enableRecurringPayments": {
      "value": false,
      "description": "Enable subscription/recurring payments"
    },
    "enableTipping": {
      "value": true,
      "description": "Enable tip collection"
    },
    "enableTerminalReaders": {
      "value": true,
      "description": "Enable physical terminal readers"
    },
    "enableSimulatedReaders": {
      "value": false,
      "description": "Enable simulated readers for testing"
    },
    "enableCustomerLookup": {
      "value": true,
      "description": "Enable customer search/lookup"
    },
    "enableCustomerInvoices": {
      "value": true,
      "description": "Enable customer invoice management"
    },
    "enableDarkMode": {
      "value": false,
      "description": "Enable dark mode UI"
    },
    "enableAnimations": {
      "value": true,
      "description": "Enable UI animations"
    },
    "enableBiometricAuth": {
      "value": true,
      "description": "Enable biometric authentication"
    },
    "enableSentry": {
      "value": true,
      "description": "Enable Sentry error tracking"
    },
    "enableAnalytics": {
      "value": true,
      "description": "Enable analytics dashboard"
    },
    "enableCrashReporting": {
      "value": true,
      "description": "Enable crash reporting"
    },
    "enableDebugMode": {
      "value": false,
      "description": "Enable debug panel"
    },
    "enableMockData": {
      "value": false,
      "description": "Use mock data instead of real API"
    },
    "enableApiLogging": {
      "value": false,
      "description": "Enable detailed API request/response logging"
    },
    "enableSelfOnboarding": {
      "value": true,
      "description": "Enable self-service merchant onboarding"
    },
    "enableExpressOnboarding": {
      "value": true,
      "description": "Enable Stripe Express onboarding"
    },
    "enableMposTransactions": {
      "value": true,
      "description": "Enable MPOS transaction processing"
    },
    "enableMposRefunds": {
      "value": true,
      "description": "Enable MPOS refund processing"
    },
    "maintenanceMode": {
      "value": false,
      "description": "Put app in maintenance mode (blocks all users)"
    }
  }
}
```

**Errores**:
- `401 Unauthorized`: API key inválida o faltante
- `500 Internal Server Error`: Error del servidor

---

### 2. Actualizar Feature Flags (Bulk Update)

Actualiza uno o múltiples feature flags simultáneamente.

**Endpoint**: `POST /feature-flags/`

**Headers**:
```
x-api-key: your-api-key-here
Content-Type: application/json
```

**Body**:
```json
{
  "flags": {
    "enableTapToPay": true,
    "maintenanceMode": false,
    "enableDebugMode": false,
    "enableQrPayments": true
  }
}
```

**Respuesta Exitosa** (200 OK):
```json
{
  "success": true,
  "updated": [
    "enableTapToPay",
    "maintenanceMode",
    "enableDebugMode",
    "enableQrPayments"
  ],
  "message": "Feature flags updated successfully"
}
```

**Errores**:
- `400 Bad Request`: Body JSON inválido o flags no reconocidos
- `401 Unauthorized`: API key inválida o faltante
- `500 Internal Server Error`: Error del servidor

---

## Casos de Uso

### 1. Activar Modo Mantenimiento

```bash
curl -X POST https://api-001.sajet.us/feature-flags/ \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "flags": {
      "maintenanceMode": true
    }
  }'
```

**Resultado**: Todas las apps móviles activas mostrarán pantalla de mantenimiento.

---

### 2. Habilitar Nueva Funcionalidad (Beta)

```bash
curl -X POST https://api-001.sajet.us/feature-flags/ \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "flags": {
      "enableRecurringPayments": true
    }
  }'
```

**Resultado**: Los pagos recurrentes estarán disponibles sin publicar nueva versión.

---

### 3. Debug Remoto

```bash
curl -X POST https://api-001.sajet.us/feature-flags/ \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "flags": {
      "enableDebugMode": true,
      "enableApiLogging": true
    }
  }'
```

**Resultado**: Habilita panel de debug y logging detallado en las apps.

---

### 4. Kill Switch - Deshabilitar Funcionalidad Problemática

```bash
curl -X POST https://api-001.sajet.us/feature-flags/ \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "flags": {
      "enableTapToPay": false
    }
  }'
```

**Resultado**: Desactiva Tap to Pay si se detecta un problema crítico.

---

## Comportamiento de Sincronización

### Cliente Móvil

1. **Inicialización**: Al abrir la app, carga flags desde:
   - Variables de entorno (.env) → `EXPO_PUBLIC_FF_*`
   - AsyncStorage cache (última sincronización)
   - API remota (background)

2. **Sincronización Automática**: Cada 5 minutos
   - Fetch silencioso de `/feature-flags/`
   - Actualiza cache local
   - Notifica componentes suscritos

3. **Prioridad** (mayor a menor):
   1. API remota (última actualización)
   2. AsyncStorage cache
   3. Variables de entorno
   4. Defaults hardcodeados

4. **Offline**: Usa último valor cacheado en AsyncStorage

---

## Flags Disponibles

| Flag | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `enableTapToPay` | boolean | `true` | Pagos Tap to Pay |
| `enablePaymentLinks` | boolean | `true` | Enlaces de pago |
| `enableQrPayments` | boolean | `true` | Pagos QR |
| `enableRecurringPayments` | boolean | `false` | Pagos recurrentes |
| `enableTipping` | boolean | `true` | Propinas |
| `enableTerminalReaders` | boolean | `true` | Terminales físicas |
| `enableSimulatedReaders` | boolean | `false` | Terminales simuladas |
| `enableCustomerLookup` | boolean | `true` | Búsqueda de clientes |
| `enableCustomerInvoices` | boolean | `true` | Facturación |
| `enableDarkMode` | boolean | `false` | Modo oscuro |
| `enableAnimations` | boolean | `true` | Animaciones UI |
| `enableBiometricAuth` | boolean | `true` | Face ID / Touch ID |
| `enableSentry` | boolean | `true` | Error tracking |
| `enableAnalytics` | boolean | `true` | Analytics |
| `enableCrashReporting` | boolean | `true` | Crash reports |
| `enableDebugMode` | boolean | `false` | Panel debug |
| `enableMockData` | boolean | `false` | Mock data |
| `enableApiLogging` | boolean | `false` | API logging |
| `enableSelfOnboarding` | boolean | `true` | Onboarding automático |
| `enableExpressOnboarding` | boolean | `true` | Stripe Express |
| `enableMposTransactions` | boolean | `true` | Transacciones MPOS |
| `enableMposRefunds` | boolean | `true` | Reembolsos MPOS |
| `maintenanceMode` | boolean | `false` | Modo mantenimiento |

---

## Implementación Backend (Express)

### Estructura de Datos (In-Memory)

```typescript
const featureFlags = new Map<string, { value: boolean; description: string }>();

// Inicialización con defaults
featureFlags.set('enableTapToPay', { 
  value: true, 
  description: 'Enable Tap to Pay functionality' 
});
// ... más flags
```

### Endpoint GET

```typescript
app.get('/feature-flags/', requireAuth, (req, res) => {
  const flags: Record<string, { value: boolean; description: string }> = {};
  
  featureFlags.forEach((data, key) => {
    flags[key] = data;
  });
  
  res.json({ flags });
});
```

### Endpoint POST

```typescript
app.post('/feature-flags/', requireAuth, (req, res) => {
  const { flags } = req.body;
  
  if (!flags || typeof flags !== 'object') {
    return res.status(400).json({ 
      error: 'Invalid request body. Expected { flags: {...} }' 
    });
  }
  
  const updated: string[] = [];
  
  for (const [key, value] of Object.entries(flags)) {
    if (featureFlags.has(key) && typeof value === 'boolean') {
      const existing = featureFlags.get(key)!;
      featureFlags.set(key, { ...existing, value });
      updated.push(key);
    }
  }
  
  res.json({ 
    success: true, 
    updated,
    message: 'Feature flags updated successfully' 
  });
});
```

---

## Seguridad

### Autenticación

- **Requerida**: Header `x-api-key` en todas las peticiones
- **Validación**: Middleware `requireAuth` verifica API key
- **401 Unauthorized**: Si key inválida o faltante

### Rate Limiting

Se recomienda implementar rate limiting:

```typescript
import rateLimit from 'express-rate-limit';

const flagsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Too many requests to feature flags API'
});

app.use('/feature-flags/', flagsLimiter);
```

### Auditoria

Registrar cambios en logs:

```typescript
app.post('/feature-flags/', requireAuth, (req, res) => {
  // ... código de actualización
  
  console.log(`[AUDIT] Feature flags updated by ${req.apiKey}:`, {
    timestamp: new Date().toISOString(),
    flags: updated,
    ip: req.ip
  });
});
```

---

## Monitoreo

### Métricas Recomendadas

1. **Tasa de sincronización exitosa** (mobile → API)
2. **Tiempo de propagación** (API update → mobile applied)
3. **Flags más cambiados** (frecuencia de toggle)
4. **Uso de maintenanceMode** (activaciones)

### Health Check

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    featureFlagsCount: featureFlags.size,
    timestamp: new Date().toISOString()
  });
});
```

---

## Versionado

**Versión actual**: 2.5.0

### Compatibilidad

- Mobile apps >= 1.0.0 son compatibles
- Flags desconocidos son ignorados (safe)
- Nuevos flags default a `false` si no especificados

---

## Soporte

**Issues**: Contactar equipo de backend si:
- API no responde
- Flags no se sincronizan
- Errores 500 persistentes

**Logs**: Revisar `/var/log/jeturing-api/` en servidor
