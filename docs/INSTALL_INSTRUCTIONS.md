# 🚀 Instalación Rápida - Jeturing Pay para WisePOS E

## 📦 APK Generado

**Archivo**: `jeturing-pay-wisepos-v1.0.0.apk`
**Ubicación**: `/Users/owner/Desktop/`
**Tamaño**: 17 MB
**Versión**: 1.0.0 (Build 1)

---

## 📱 Método 1: Instalación por ADB (Desarrollo)

### Prerrequisitos
- Android Debug Bridge (ADB) instalado
- WisePOS E conectado a la misma red WiFi

### Pasos:

1. **Verificar que ADB esté instalado**
   ```bash
   adb version
   ```
   Si no está instalado:
   ```bash
   brew install android-platform-tools
   ```

2. **Habilitar ADB en el WisePOS E**
   - En el WisePOS E, ir a: Configuración → Acerca del dispositivo
   - Tocar 7 veces en "Número de compilación"
   - Volver y entrar a "Opciones de desarrollador"
   - Activar "Depuración USB" y "Depuración por red"

3. **Conectar por ADB**
   ```bash
   adb connect 192.168.2.225
   ```
   
   Deberías ver: `connected to 192.168.2.225:5555`

4. **Instalar el APK**
   ```bash
   cd /Users/owner/Desktop
   adb install -r jeturing-pay-wisepos-v1.0.0.apk
   ```
   
   El parámetro `-r` reinstala si ya existe

5. **Verificar instalación**
   ```bash
   adb shell pm list packages | grep jeturing
   ```
   
   Deberías ver: `package:com.jeturing.pay.terminal`

6. **Abrir la app**
   ```bash
   adb shell am start -n com.jeturing.pay.terminal/.MainActivity
   ```

---

## 📱 Método 2: Instalación por USB (Si ADB WiFi no funciona)

1. **Conectar WisePOS E por USB-C**
   
2. **Habilitar depuración USB** (mismo proceso del Método 1)

3. **Verificar conexión**
   ```bash
   adb devices
   ```
   
4. **Instalar**
   ```bash
   adb install -r /Users/owner/Desktop/jeturing-pay-wisepos-v1.0.0.apk
   ```

---

## 📱 Método 3: Transferencia manual (Sin ADB)

1. **Copiar APK al WisePOS E**
   - Usar un servicio de nube (Google Drive, Dropbox)
   - O transferir vía USB como archivo
   
2. **En el WisePOS E**
   - Abrir el administrador de archivos
   - Navegar al APK descargado
   - Tocar el archivo
   - Aceptar permisos de "Fuentes desconocidas" si se solicita
   - Instalar

---

## 🏢 Método 4: Stripe Apps on Device (Producción)

### Este es el método recomendado para producción

1. **Contactar a Stripe**
   - Email: terminal-support@stripe.com
   - Solicitar acceso al programa "Apps on Device"
   
2. **Una vez habilitado:**
   - Ir a Dashboard → Terminal → Apps
   - Upload APK firmado
   - Assign a tus dispositivos
   - Deploy remotamente

---

## 🔧 Troubleshooting

### ❌ Error: "device unauthorized"
```bash
# Desconectar y reconectar
adb kill-server
adb start-server
adb connect 192.168.2.225

# Aceptar el diálogo de autorización en el WisePOS E
```

### ❌ Error: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
```bash
# Desinstalar la versión anterior primero
adb uninstall com.jeturing.pay.terminal

# Luego reinstalar
adb install jeturing-pay-wisepos-v1.0.0.apk
```

### ❌ Error: "cannot connect to daemon"
```bash
# Reiniciar el servidor ADB
adb kill-server
adb start-server
```

### ❌ Error: "offline"
```bash
# Verificar la IP del dispositivo
# Puede haber cambiado si se reconectó al WiFi

# Reintentar con la IP correcta
adb connect <nueva-ip>:5555
```

### ❌ WisePOS E no aparece en modo desarrollador
- El WisePOS E puede tener el firmware bloqueado
- Contactar al proveedor del dispositivo
- O usar el método de Stripe Apps on Device

---

## ✅ Post-Instalación

1. **Verificar que la app inicie**
   - Buscar "Jeturing Pay" en el app drawer
   - Abrir y verificar que aparezca el splash screen con logo
   
2. **Verificar permisos**
   - La app solicitará permisos de Internet, Ubicación
   - Aceptar todos los permisos

3. **Configurar backend**
   - La app está preconfigurada para: `https://api-001.sajet.us`
   - API Key: `*963.Abcd`
   - Stripe Account: `acct_1G0K5CB1h7Ho0bBU`

4. **Probar un pago de prueba**
   - Tap en "Nuevo Cobro"
   - Ingresar $1.00
   - Usar una tarjeta de prueba de Stripe

---

## 📊 Información del Build

```
Application ID: com.jeturing.pay.terminal
Version Name: 1.0.0
Version Code: 1
Min SDK: 26 (Android 8.0)
Target SDK: 34 (Android 14)
Compiled: 2025-01-01 04:07 UTC

Dependencies:
- Stripe Terminal SDK: 4.7.3
- Stripe Handoff Client: 4.7.3
- Lottie: 6.3.0
- Retrofit: 2.9.0
```

---

## 🔐 Para Producción

Antes de publicar en producción:

1. **Generar APK firmado**
   ```bash
   cd WisePosApp
   ./gradlew assembleRelease
   ```

2. **Firmar con tu keystore**
   ```bash
   jarsigner -verbose -sigalg SHA256withRSA \
     -digestalg SHA-256 -keystore jeturing-release.keystore \
     app-release-unsigned.apk jeturing-key
   ```

3. **Optimizar con zipalign**
   ```bash
   zipalign -v 4 app-release-unsigned.apk \
     jeturing-pay-wisepos-v1.0.0-signed.apk
   ```

4. **Subir a Stripe Dashboard**

---

## 📞 Soporte

Si tienes problemas:
- **Email**: support@jeturing.com
- **Slack**: #jeturing-pay-support
- **Documentación**: Ver `WisePosApp/README.md`

---

<div align="center">

**APK generado el 1 de enero de 2025**

✨ Incluye el nuevo logo de Jeturing Pay ✨

</div>
