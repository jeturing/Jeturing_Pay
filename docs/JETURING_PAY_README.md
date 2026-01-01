# Jeturing Pay

<div align="center">

**Plataforma completa de pagos empresarial con Stripe Terminal**

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey.svg)]()

Sistema multi-canal para procesamiento de pagos en dispositivos físicos, móviles y web

</div>

---

## 🚀 Inicio Rápido

### Para empezar inmediatamente:
1. 📖 Lee el [Resumen Ejecutivo](./DEPLOYMENT_READY.md)
2. 📱 Instala en WisePOS E siguiendo [estas instrucciones](./INSTALL_INSTRUCTIONS.md)
3. 🎨 Revisa la [Guía de Branding](./docs/BRANDING_GUIDE.md)
4. 📚 Consulta la [Guía Maestra del Proyecto](./PROJECT_MASTER_GUIDE.md)

### APK Listo para Instalar
📦 **jeturing-pay-wisepos-v1.0.0.apk** (17 MB)
- Ubicación: `/Users/owner/Desktop/`
- Instalación: `adb install -r jeturing-pay-wisepos-v1.0.0.apk`

---

## 📱 Aplicaciones

### WisePosApp (Android Nativo)
App que corre **dentro** del terminal WisePOS E

```bash
cd WisePosApp
./gradlew assembleDebug
```

**Características**:
- ✅ Procesamiento de pagos NFC/Chip/Banda
- ✅ Animaciones Lottie
- ✅ Logo corporativo
- ✅ Historial de transacciones

[📖 Ver documentación completa →](./WisePosApp/README.md)

---

### JeturingApp (React Native)
App móvil multi-plataforma para iOS y Android

```bash
cd JeturingApp
npm install
npm run android
```

**Características**:
- ✅ Tap to Pay on iPhone
- ✅ Autenticación biométrica
- ✅ Gestión de clientes
- ✅ Feature flags

[📖 Ver documentación completa →](./JeturingApp/)

---

### Stripe App (Dashboard Extension)
Extensión del Dashboard de Stripe

```bash
cd stripe-app
stripe apps upload
```

**Características**:
- ✅ Gestión de terminales
- ✅ Vista de transacciones
- ✅ Configuración de dispositivos

[📖 Ver documentación completa →](./stripe-app/)

---

## 🏗️ Backend API

**URL**: `https://api-001.sajet.us`
**API Key**: `*963.Abcd`

### Endpoints principales:
```bash
# Connection Token
POST /stripe/terminal/connection_token

# Payment Intent
POST /stripe/payment_intents
POST /stripe/payment_intents/{id}/capture

# History
GET /stripe/payments
```

[📖 Ver guía del backend →](./BACKEND_GUIDE.md)

---

## 🎨 Branding

### Logo Jeturing Pay
Círculo + Tarjeta + Flecha = Pago completo

**Colores**:
- 🟢 Verde Azulado: `#00A896`
- 🔵 Azul Profundo: `#0080A8`
- 🟡 Dorado: `#FFD700`
- 🔷 Stripe Blue: `#6772E5`

[📖 Ver guía completa de branding →](./docs/BRANDING_GUIDE.md)

---

## 🔧 Configuración

### Render Blueprint
- **Nombre**: Jeturing_Core
- **Branch**: master
- **Auto Sync**: ✅ Activado
- **Dashboard**: [Ver Blueprint](https://dashboard.render.com/blueprint/exs-d54elb8gjchc73fqqhsg)

[📖 Ver configuración de Render →](./RENDER_BLUEPRINT.md)

---

### Stripe
- **Account**: `acct_1G0K5CB1h7Ho0bBU` (JETURING, Inc.)
- **WisePOS E**: Demo_Mpos (192.168.2.225)
- **Dashboard**: [Ver Terminal](https://dashboard.stripe.com/terminal/readers/tmr_Demo_Mpos)

---

## 📊 Arquitectura

```
┌──────────────────────────────────┐
│        Jeturing Pay              │
│   (Multi-channel Payment)        │
└───────┬─────────┬────────┬──────┘
        │         │        │
   ┌────▼───┐ ┌──▼───┐ ┌─▼────┐
   │WisePosE│ │Mobile│ │Stripe│
   │  App   │ │  App │ │ App  │
   └────┬───┘ └──┬───┘ └─┬────┘
        │        │       │
        └────────┼───────┘
                 │
            ┌────▼────┐
            │ Backend │
            │   API   │
            └────┬────┘
                 │
          ┌──────┼──────┐
          │      │      │
       ┌──▼─┐ ┌─▼──┐ ┌─▼──┐
       │Stripe│DB│ │Render│
       └─────┘ └───┘ └────┘
```

---

## 📚 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| [PROJECT_MASTER_GUIDE.md](./PROJECT_MASTER_GUIDE.md) | 🎯 Guía maestra completa |
| [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) | ✅ Resumen ejecutivo |
| [INSTALL_INSTRUCTIONS.md](./INSTALL_INSTRUCTIONS.md) | 📦 Cómo instalar |
| [LOGO_UPDATE_SUMMARY.md](./LOGO_UPDATE_SUMMARY.md) | 🎨 Cambios de logo |
| [RENDER_BLUEPRINT.md](./RENDER_BLUEPRINT.md) | 🏗️ Configuración Render |
| [docs/BRANDING_GUIDE.md](./docs/BRANDING_GUIDE.md) | 🎨 Guía de branding |
| [WisePosApp/README.md](./WisePosApp/README.md) | 📱 App Android |

---

## 🚀 Deploy

### WisePosApp
```bash
cd WisePosApp
./gradlew clean assembleDebug
adb connect 192.168.2.225
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Backend (Auto-deploy)
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin master
# Render despliega automáticamente
```

---

## 🧪 Testing

```bash
# WisePosApp
cd WisePosApp && ./gradlew test

# JeturingApp
cd JeturingApp && npm test

# Backend
pytest  # o npm test
```

---

## 📊 Estado del Proyecto

| Componente | Estado | Versión |
|------------|--------|---------|
| WisePosApp | ✅ Listo | v1.0.0 |
| JeturingApp | ✅ Funcional | v1.0.0 |
| Stripe App | ✅ Deployado | v1.0.0 |
| Backend API | ✅ Activo | - |
| Documentación | ✅ Completa | - |

---

## 🐛 Troubleshooting

### Error: No conecta al backend
```bash
curl -H "x-api-key: *963.Abcd" https://api-001.sajet.us/health
```

### Error: Terminal no inicializa
Verificar en [Stripe Dashboard](https://dashboard.stripe.com/terminal/readers/tmr_Demo_Mpos)

### Error: Deploy falla
Ver logs en [Render Dashboard](https://dashboard.render.com/blueprint/exs-d54elb8gjchc73fqqhsg)

---

## 📞 Soporte

### Contacto
- **Email**: jcarvajal@jeturing.com
- **Render**: [Dashboard](https://dashboard.render.com/blueprint/exs-d54elb8gjchc73fqqhsg)
- **Stripe**: [Terminal Dashboard](https://dashboard.stripe.com/terminal)

### Recursos
- [Stripe Terminal Docs](https://stripe.com/docs/terminal)
- [Render Docs](https://render.com/docs)
- [React Native Docs](https://reactnative.dev)

---

## 📄 Licencia

**Copyright © 2025 Jeturing, Inc.**

Este software es propietario y confidencial.

---

## 🎯 Próximos Pasos

1. ✅ Logo aplicado globalmente
2. ✅ APK compilado y listo
3. ✅ Backend configurado en Render
4. ⏳ **Instalar en WisePOS E** ← Estás aquí
5. ⏳ Testing en producción
6. ⏳ Lanzamiento oficial

---

<div align="center">

**¿Listo para instalar?**

[📦 Ver instrucciones de instalación →](./INSTALL_INSTRUCTIONS.md)

---

*Última actualización: 1 de enero de 2025*

**Proyecto completado y documentado** ✨

</div>
