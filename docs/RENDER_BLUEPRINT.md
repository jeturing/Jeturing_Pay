# Jeturing Core - Render Blueprint Configuration

## 📋 Información del Blueprint

### Detalles Principales
- **Blueprint Name**: `Jeturing_Core`
- **Branch**: `master`
- **Auto Sync**: `Yes` (Activado)
- **Git Credentials**: `jcarvajal@jeturing.com`

### 🔗 URLs y Endpoints

#### Dashboard
```
https://dashboard.render.com/blueprint/exs-d54elb8gjchc73fqqhsg
```

#### Sync Hook (Privado - Mantener Secreto)
```
https://api.render.com/sync/exs-d54elb8gjchc73fqqhsg?key=KAdgqkoOp-w
```

⚠️ **IMPORTANTE**: No compartir el Sync Hook públicamente. Es una URL privada para triggers.

---

## 🏗️ Arquitectura de Servicios

### Backend API
- **URL Base**: `https://api-001.sajet.us`
- **Puerto**: 81
- **API Key**: `*963.Abcd`

### Endpoints Principales

#### 1. Connection Token (Stripe Terminal)
```http
POST https://api-001.sajet.us/stripe/terminal/connection_token
Headers:
  x-api-key: *963.Abcd
```

#### 2. Payment Intents
```http
POST https://api-001.sajet.us/stripe/payment_intents
Headers:
  x-api-key: *963.Abcd
Body:
  {
    "amount": 1000,
    "currency": "usd",
    "description": "Venta",
    "payment_method_types": ["card_present"],
    "capture_method": "automatic"
  }
```

#### 3. Capture Payment Intent
```http
POST https://api-001.sajet.us/stripe/payment_intents/{id}/capture
Headers:
  x-api-key: *963.Abcd
```

#### 4. Payment History
```http
GET https://api-001.sajet.us/stripe/payments?limit=50
Headers:
  x-api-key: *963.Abcd
```

---

## 🔄 Sincronización Automática

### Auto Sync Activado
El Blueprint está configurado con **Auto Sync = Yes**, lo que significa:

✅ Los cambios en la rama `master` se despliegan automáticamente
✅ No se requiere sincronización manual
✅ Los deploys son continuos (CD)

### Trigger Manual
Si necesitas forzar una sincronización:

```bash
curl -X POST "https://api.render.com/sync/exs-d54elb8gjchc73fqqhsg?key=KAdgqkoOp-w"
```

---

## 🔐 Seguridad y Credenciales

### Git Credentials
- **Usuario**: `jcarvajal@jeturing.com`
- **Tipo**: Personal credentials
- **Acceso**: Repositorio privado

### API Keys
- **Backend API Key**: `*963.Abcd`
- **Stripe Test Key**: `sk_test_51G0K5CB1h7Ho0bBU5bLWYJ57kaHO2aMOdTZMysBOqDh3bWh9PbBDaowkNS7S7ac28sg6SXw4bMjVIVVSyzXaWGrU005iKXElNK`
- **Stripe Account**: `acct_1G0K5CB1h7Ho0bBU` (JETURING, Inc.)

### Gestión de Secretos
```bash
# Variables de entorno recomendadas en Render
BACKEND_API_KEY=*963.Abcd
STRIPE_SECRET_KEY=sk_test_51G0K5CB1h7Ho0bBU...
STRIPE_ACCOUNT_ID=acct_1G0K5CB1h7Ho0bBU
```

---

## 📱 Configuración de Apps

### WisePosApp (Android)
Configurado en `build.gradle.kts`:
```kotlin
buildConfigField("String", "BACKEND_URL", "\"https://api-001.sajet.us\"")
```

Configurado en `ApiClient.kt`:
```kotlin
private const val API_KEY = "*963.Abcd"
```

### JeturingApp (React Native)
Configurado en `app.json`:
```json
{
  "extra": {
    "backendUrl": "https://api-001.sajet.us",
    "backendApiKey": "*963.Abcd"
  }
}
```

---

## 🚀 Proceso de Deploy

### 1. Desarrollo Local
```bash
# Hacer cambios en el código
git add .
git commit -m "feat: nueva funcionalidad"
```

### 2. Push a Master
```bash
git push origin master
```

### 3. Auto Deploy
- Render detecta el push a `master`
- Inicia build automático
- Despliega si el build es exitoso
- Notifica por email/Slack

### 4. Verificación
```bash
# Verificar que el backend responda
curl -H "x-api-key: *963.Abcd" \
  https://api-001.sajet.us/health
```

---

## 🔧 Configuración del Blueprint

### Archivo: `render.yaml`
El Blueprint se configura mediante un archivo `render.yaml` en el repositorio:

```yaml
services:
  - type: web
    name: jeturing-api
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_ACCOUNT_ID
        value: acct_1G0K5CB1h7Ho0bBU
      - key: API_KEY
        sync: false
```

---

## 🌐 Dominios y URLs

### Producción
- **Backend API**: `https://api-001.sajet.us`
- **Puerto Alternativo**: `:81`

### Staging (si existe)
- **Backend Staging**: `https://api-staging.jeturing.com` (configurar si es necesario)

### Configuración de DNS
Si necesitas configurar un dominio personalizado:

1. **En Render Dashboard**:
   - Settings → Custom Domains
   - Agregar: `api.jeturing.com`

2. **En tu proveedor DNS**:
   ```
   CNAME api.jeturing.com → jeturing-api.onrender.com
   ```

---

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real
```bash
# Desde Render Dashboard
# Events → View Logs
```

### Métricas Importantes
- **Uptime**: Target 99.9%
- **Response Time**: < 200ms promedio
- **Error Rate**: < 1%

### Alertas Configuradas
- ❌ Deploy fallido
- ⚠️ High memory usage (> 80%)
- 🔴 Service down

---

## 🐛 Troubleshooting

### Deploy Falla
```bash
# 1. Verificar logs en Render Dashboard
# 2. Verificar que render.yaml sea válido
# 3. Verificar variables de entorno

# Trigger deploy manual
curl -X POST "https://api.render.com/sync/exs-d54elb8gjchc73fqqhsg?key=KAdgqkoOp-w"
```

### API No Responde
```bash
# Verificar estado del servicio
curl -I https://api-001.sajet.us

# Verificar API key
curl -H "x-api-key: *963.Abcd" \
  https://api-001.sajet.us/stripe/terminal/connection_token
```

### Auto Sync No Funciona
1. Verificar que Auto Sync esté en "Yes"
2. Verificar permisos de Git
3. Revisar logs de sync en Dashboard
4. Usar el Sync Hook para trigger manual

---

## 📝 Checklist de Configuración

### Inicial
- [x] Blueprint creado: `Jeturing_Core`
- [x] Auto Sync habilitado
- [x] Rama `master` configurada
- [x] Git credentials vinculadas
- [x] Sync Hook generado

### Backend
- [x] Backend API desplegado
- [x] API Key configurada
- [x] Stripe integrado
- [x] CORS configurado

### Apps
- [x] WisePosApp apuntando al backend
- [x] JeturingApp configurado
- [x] API Keys en los clientes

### Pendiente
- [ ] Configurar dominio personalizado (opcional)
- [ ] Setup de staging environment
- [ ] Configurar alertas por email
- [ ] Documentar rollback process

---

## 📞 Contacto y Soporte

### Render Support
- **Email**: support@render.com
- **Docs**: https://render.com/docs

### Jeturing Team
- **Email**: `jcarvajal@jeturing.com`
- **Dashboard**: https://dashboard.render.com

---

## 🔄 Workflow Recomendado

### Para Cambios en Backend
```bash
# 1. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y testear localmente
# ...

# 3. Commit y push
git add .
git commit -m "feat: descripción"
git push origin feature/nueva-funcionalidad

# 4. Crear PR a master
# En GitHub/GitLab

# 5. Merge a master → Auto deploy
```

### Para Cambios en Apps
```bash
# Las apps se compilan localmente
# Solo actualizar si cambian los endpoints del backend

# WisePosApp
cd WisePosApp
./gradlew assembleDebug

# JeturingApp
cd JeturingApp
npm run build
```

---

<div align="center">

**Blueprint Configurado y Activo**

✨ Jeturing Core está listo para recibir deploys automáticos ✨

**Última actualización**: 1 de enero de 2025

</div>
