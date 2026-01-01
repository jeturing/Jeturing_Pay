# Jeturing Pay - Stripe App

Esta carpeta contiene la configuración para la Stripe App de Jeturing Pay.

## Estructura

```
stripe-app/
├── stripe-app.json     # Manifiesto de la aplicación Stripe
├── package.json        # Dependencias para desarrollo de la Stripe App
├── src/
│   └── views/          # Componentes de UI para el Dashboard de Stripe
└── README.md
```

## Instalación

### Prerrequisitos

1. Instalar Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

2. Autenticarse con Stripe:
```bash
stripe login
```

### Subir la App en Modo Test

```bash
cd stripe-app
npm install
stripe apps upload
```

Después de subir:
- Ve a [https://dashboard.stripe.com/test/](https://dashboard.stripe.com/test/)
- La app estará disponible para miembros del equipo

### Instalar en Modo Live (Producción)

1. Ve a la [página de Apps en el Dashboard](https://dashboard.stripe.com/apps)
2. Selecciona "Private to Jeturing-Odoo-MPOS"
3. Elige la versión y haz clic en "Continue"
4. Haz clic en "Install"
5. Refresca el navegador

## Configuración de la App

### Permisos Requeridos

| Permiso | Propósito |
|---------|-----------|
| `connected_account_read` | Leer información de cuentas conectadas |
| `connected_account_write` | Gestionar cuentas conectadas |
| `payment_intent_read` | Leer información de pagos |
| `payment_intent_write` | Procesar pagos |
| `customer_read` | Leer información de clientes |
| `customer_write` | Gestionar clientes |
| `balance_read` | Leer balance de cuenta |
| `refund_write` | Procesar reembolsos |

### URLs Permitidas

- API Backend: `https://api-001.sajet.us`
- Callback móvil: `jeturingpay://callback`

## Desarrollo

Para desarrollar localmente:

```bash
stripe apps start
```

Esto iniciará un servidor de desarrollo y mostrará la app en el Dashboard de Stripe.

## Versionado

Cada vez que hagas cambios:

1. Actualiza la versión en `stripe-app.json`
2. Sube con `stripe apps upload`
3. Instala la nueva versión desde el Dashboard

## Desinstalar

Para cambiar de modo privado a Marketplace:

1. Ve a [Installed Apps](https://dashboard.stripe.com/settings/apps/)
2. Encuentra la app y haz clic en ⋯
3. Selecciona "View app details"
4. Haz clic en "Uninstall app"
