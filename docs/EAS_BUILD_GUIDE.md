# EAS Production Build Guide

## Requisitos Previos

### iOS
1. Apple Developer Account ($99/año)
2. Certificados de distribución configurados
3. App ID registrado en Apple Developer Portal
4. Provisioning Profile de distribución

### Android
1. Google Play Developer Account ($25 una vez)
2. Keystore para firmar la aplicación
3. Service Account JSON para upload automático

## Configuración de Secretos

### Variables de Entorno en EAS

```bash
# Configurar secretos (no se guardan en código)
eas secret:create --scope project --name STRIPE_SECRET_KEY --value "sk_live_xxx"
eas secret:create --scope project --name SENTRY_DSN --value "https://xxx@sentry.io/xxx"
eas secret:create --scope project --name APPLE_ID --value "developer@jeturing.com"
eas secret:create --scope project --name ASC_APP_ID --value "1234567890"
eas secret:create --scope project --name APPLE_TEAM_ID --value "TEAMID123"
```

### Archivo de Service Account (Android)

1. Ir a Google Cloud Console → IAM & Admin → Service Accounts
2. Crear cuenta de servicio con rol "Service Account User"
3. Crear y descargar clave JSON
4. Renombrar a `google-service-account.json`
5. Colocar en la raíz del proyecto

⚠️ **IMPORTANTE**: Agregar a `.gitignore`:
```
google-service-account.json
*.keystore
*.jks
```

## Comandos de Build

### Development (con desarrollo cliente)
```bash
npm run build:dev
# o específico por plataforma:
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Preview (distribución interna)
```bash
npm run build:preview
# Genera APK para Android y build interno para iOS
```

### Production
```bash
# Ambas plataformas
npm run build:production

# Solo Android (App Bundle para Play Store)
npm run build:android

# Solo Android (APK para distribución directa)
npm run build:android:apk

# Solo iOS
npm run build:ios
```

## Submit a Stores

### iOS App Store
```bash
npm run submit:ios
```

Requisitos:
- Build de producción completado
- App Store Connect configurado
- Información de la app completa

### Google Play Store
```bash
npm run submit:android
```

Requisitos:
- Build de producción (app-bundle)
- Service Account configurada
- App listada en Play Console

### Ambos stores
```bash
npm run submit:all
```

## Updates OTA (Over-The-Air)

Para actualizaciones que no requieren nuevo build nativo:

```bash
# Preview channel
npm run update:preview "Descripción del update"

# Production channel
npm run update:production "Descripción del update"
```

## Estructura de Profiles

| Profile | Uso | Distribución |
|---------|-----|--------------|
| development | Desarrollo con hot reload | Internal (Dev) |
| preview | Testing interno | Internal (QA) |
| production | App Store/Play Store | Store |
| production-apk | Distribución directa APK | Manual |

## Checklist Pre-Producción

### Código
- [ ] Todas las pruebas pasan (`npm test`)
- [ ] TypeScript sin errores (`npm run typecheck`)
- [ ] ESLint sin warnings (`npm run lint`)
- [ ] Versión actualizada en `app.json`

### Configuración
- [ ] `STRIPE_SECRET_KEY` es clave de producción
- [ ] URLs de API apuntan a producción
- [ ] Sentry configurado para producción
- [ ] Permisos de app correctos

### Assets
- [ ] Icono de app (1024x1024)
- [ ] Splash screen
- [ ] Screenshots para stores
- [ ] Descripción y metadata

### Seguridad
- [ ] Secrets configurados en EAS
- [ ] ProGuard habilitado (Android)
- [ ] Certificate Pinning (opcional)

## Troubleshooting

### Error: "No credentials configured"
```bash
eas credentials
# Seguir el wizard para configurar
```

### Error: "Build failed - Provisioning profile"
1. Verificar Apple Developer Portal
2. Regenerar provisioning profile
3. Limpiar credentials: `eas credentials --platform ios`

### Error: "Keystore not found"
```bash
# Generar nuevo keystore
eas credentials --platform android
```

### Build toma mucho tiempo
- Los primeros builds son más lentos (cache frío)
- Usar `resourceClass: m-medium` o `large` para builds más rápidos
- Revisar dependencias innecesarias

## Monitoreo Post-Release

1. **Sentry**: Monitorear crashes y errores
2. **Analytics**: Revisar adopción de nuevas versiones
3. **Store Reviews**: Responder a feedback de usuarios
4. **Stripe Dashboard**: Verificar transacciones

## Rollback

Si hay problemas en producción:

```bash
# Revertir a update anterior
eas update:rollback --branch production

# O publicar fix urgente
eas update --branch production --message "Hotfix: descripción"
```
