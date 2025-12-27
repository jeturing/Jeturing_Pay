# Sistema de Feature Flags - Jeturing Pay

## Descripción

El sistema de Feature Flags permite habilitar/deshabilitar funcionalidades de la aplicación de forma dinámica, tanto en tiempo de compilación como en tiempo de ejecución.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FUENTES DE FLAGS                          │
├─────────────────────────────────────────────────────────────────┤
│  1. app.json (defaults)  →  Valores por defecto en compilación  │
│  2. .env / Build Config  →  Override en tiempo de compilación   │
│  3. API Remota           →  Override dinámico en runtime        │
│  4. AsyncStorage         →  Cache local + overrides manuales    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FeatureFlagService                           │
│  - Carga defaults de app.json                                    │
│  - Sincroniza con API cada 5 minutos                            │
│  - Gestiona cache en AsyncStorage                                │
│  - EventEmitter para notificar cambios                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               FeatureFlagsProvider (React Context)               │
│  - Inicializa el servicio                                        │
│  - Maneja estado de carga                                        │
│  - Modo mantenimiento global                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        useFeatureFlag    FeatureGate    withFeatureGate
          (Hook)          (Component)       (HOC)
```

## Flags Disponibles

| Flag | Descripción | Default |
|------|-------------|---------|
| `enableTapToPay` | Habilita pagos Tap to Pay | `true` |
| `enablePaymentLinks` | Habilita enlaces de pago | `true` |
| `enableQRPayments` | Habilita pagos por QR | `true` |
| `enableRefunds` | Habilita reembolsos | `true` |
| `enableAnalytics` | Habilita dashboard de analíticas | `true` |
| `enableMPOS` | Habilita modo MPOS | `false` |
| `enableTerminal` | Habilita terminales físicas | `false` |
| `showDebugInfo` | Muestra información de debug | `false` |
| `maintenanceMode` | Modo mantenimiento (bloquea app) | `false` |
| `enableBetaFeatures` | Habilita funciones beta | `false` |

## Uso en Componentes

### 1. Hook `useFeatureFlag`

```tsx
import { useFeatureFlag } from '../hooks/useFeatureFlag';

function PaymentScreen() {
  const tapToPayEnabled = useFeatureFlag('enableTapToPay');
  const showDebug = useFeatureFlag('showDebugInfo');

  return (
    <View>
      {tapToPayEnabled && <TapToPayButton />}
      {showDebug && <DebugPanel />}
    </View>
  );
}
```

### 2. Componente `FeatureGate`

```tsx
import { FeatureGate } from '../components/FeatureGate';

function PaymentScreen() {
  return (
    <View>
      {/* Mostrar solo si está habilitado */}
      <FeatureGate flag="enableTapToPay">
        <TapToPayButton />
      </FeatureGate>

      {/* Con fallback */}
      <FeatureGate 
        flag="enableQRPayments" 
        fallback={<Text>QR no disponible</Text>}
      >
        <QRPaymentSection />
      </FeatureGate>

      {/* Invertir condición (mostrar cuando está OFF) */}
      <FeatureGate flag="enableBetaFeatures" not>
        <StableFeatureNotice />
      </FeatureGate>
    </View>
  );
}
```

### 3. HOC `withFeatureGate`

```tsx
import { withFeatureGate } from '../components/FeatureGate';

const TapToPayScreen = ({ route }) => {
  // Tu componente
};

// Exportar componente gated
export default withFeatureGate(TapToPayScreen, 'enableTapToPay');

// Con fallback
export default withFeatureGate(TapToPayScreen, 'enableTapToPay', DisabledScreen);
```

## Configuración

### 1. Defaults en `app.json`

```json
{
  "expo": {
    "extra": {
      "featureFlags": {
        "enableTapToPay": true,
        "enablePaymentLinks": true,
        "enableQRPayments": true,
        "enableRefunds": true,
        "enableAnalytics": true,
        "enableMPOS": false,
        "enableTerminal": false,
        "showDebugInfo": false,
        "maintenanceMode": false,
        "enableBetaFeatures": false
      }
    }
  }
}
```

### 2. Variables de Entorno (Build Time)

Crear archivo `.env` en la raíz de `JeturingApp/`:

```bash
# Feature Flags - Override defaults at build time
EXPO_PUBLIC_FF_ENABLE_TAP_TO_PAY=true
EXPO_PUBLIC_FF_ENABLE_PAYMENT_LINKS=true
EXPO_PUBLIC_FF_ENABLE_QR_PAYMENTS=true
EXPO_PUBLIC_FF_ENABLE_REFUNDS=true
EXPO_PUBLIC_FF_ENABLE_ANALYTICS=true
EXPO_PUBLIC_FF_ENABLE_MPOS=false
EXPO_PUBLIC_FF_ENABLE_TERMINAL=false
EXPO_PUBLIC_FF_SHOW_DEBUG_INFO=false
EXPO_PUBLIC_FF_MAINTENANCE_MODE=false
EXPO_PUBLIC_FF_ENABLE_BETA_FEATURES=false
```

### 3. API Remota (Runtime)

#### GET `/feature-flags/` - Listar flags

```bash
curl -X GET https://api-001.sajet.us/feature-flags/ \
  -H "x-api-key: your-api-key"
```

Respuesta:
```json
{
  "flags": {
    "enableTapToPay": { "value": true, "description": "Enable Tap to Pay" },
    "enableMPOS": { "value": false, "description": "Enable MPOS mode" }
  }
}
```

#### POST `/feature-flags/` - Actualizar flags

```bash
curl -X POST https://api-001.sajet.us/feature-flags/ \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "flags": {
      "enableTapToPay": true,
      "maintenanceMode": false,
      "showDebugInfo": true
    }
  }'
```

## Override Local (Debug)

El servicio permite overrides locales para testing:

```tsx
import { featureFlagService } from '../services/featureFlags';

// En un panel de debug
async function enableDebugMode() {
  await featureFlagService.setLocalOverride('showDebugInfo', true);
  await featureFlagService.setLocalOverride('enableBetaFeatures', true);
}

// Limpiar overrides
async function resetFlags() {
  // Los flags volverán a usar remote/defaults
  await AsyncStorage.removeItem('@jeturing/feature-flags-local');
}
```

## Orden de Prioridad

Los flags se resuelven en este orden (mayor a menor prioridad):

1. **Local Override** - `setLocalOverride()` para testing
2. **API Remota** - Valores del servidor
3. **Environment Variables** - `.env` en build
4. **app.json defaults** - Valores por defecto

## Modo Mantenimiento

Cuando `maintenanceMode: true`, el `FeatureFlagsProvider` muestra automáticamente una pantalla de mantenimiento que bloquea toda la aplicación:

```tsx
// Activar desde API
POST /feature-flags/
{
  "flags": {
    "maintenanceMode": true
  }
}
```

La app mostrará:
```
┌─────────────────────────────┐
│                             │
│    🔧 Mantenimiento         │
│                             │
│    Estamos mejorando        │
│    la aplicación.           │
│    Vuelve pronto.           │
│                             │
└─────────────────────────────┘
```

## Agregar Nuevos Flags

### 1. Definir el flag

En `src/services/featureFlags.ts`:

```typescript
export type FeatureFlagKey =
  | 'enableTapToPay'
  | 'enablePaymentLinks'
  // ... otros flags
  | 'miNuevoFlag'; // <-- Agregar aquí

const DEFAULT_FLAGS: Record<FeatureFlagKey, boolean> = {
  // ... otros
  miNuevoFlag: false, // <-- Valor default
};
```

### 2. Agregar a app.json

```json
{
  "extra": {
    "featureFlags": {
      "miNuevoFlag": false
    }
  }
}
```

### 3. Agregar variable de entorno (opcional)

```bash
EXPO_PUBLIC_FF_MI_NUEVO_FLAG=false
```

### 4. Usar en componentes

```tsx
const enabled = useFeatureFlag('miNuevoFlag');
```

## Testing

Para testing, puedes mockear el hook:

```tsx
// __mocks__/useFeatureFlag.ts
export const useFeatureFlag = jest.fn((flag: string) => {
  const mockFlags = {
    enableTapToPay: true,
    enableMPOS: false,
    // ...
  };
  return mockFlags[flag] ?? false;
});
```

## Estructura de Archivos

```
JeturingApp/
├── app.json                          # Defaults de flags
├── .env                              # Variables de entorno
├── src/
│   ├── services/
│   │   └── featureFlags.ts           # Servicio principal
│   ├── hooks/
│   │   └── useFeatureFlag.ts         # Hook React
│   └── components/
│       ├── FeatureFlagsProvider.tsx  # Context Provider
│       └── FeatureGate.tsx           # Componente gate

backend/
└── src/
    └── server.ts                      # Endpoints /feature-flags/
```

## Diagramas

### Flujo de Carga

```
App Init
    │
    ▼
FeatureFlagsProvider
    │
    ├── 1. Cargar defaults de app.json
    │
    ├── 2. Cargar cache de AsyncStorage
    │
    ├── 3. Fetch flags remotos (API)
    │         │
    │         ├── Success → Actualizar flags + cache
    │         │
    │         └── Error → Usar cache/defaults
    │
    └── 4. Ready → Render children
```

### Flujo de Actualización

```
API Update (POST /feature-flags/)
    │
    ▼
Cada 5 min: refreshFromRemote()
    │
    ▼
Comparar con flags actuales
    │
    ├── Sin cambios → No action
    │
    └── Cambios detectados
            │
            ├── Actualizar AsyncStorage
            │
            └── EventEmitter.emit('flagsChanged')
                    │
                    ▼
            useFeatureFlag re-render
```

## Soporte

Para problemas con Feature Flags, revisar:

1. Console logs del servicio
2. AsyncStorage con key `@jeturing/feature-flags-local`
3. Response de API `/feature-flags/`
4. Network tab para errores de fetch
