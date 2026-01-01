# Guía de Branding - Jeturing Pay

## Logo Principal

El logo de Jeturing Pay es un símbolo moderno y profesional que representa la innovación en pagos digitales.

### Composición del Logo

#### Elementos visuales:
1. **Círculo principal** (trazo verde azulado)
   - Representa el ciclo completo del pago
   - Simboliza confianza, seguridad y continuidad
   - Proporciona un marco que contiene todos los elementos

2. **Tarjeta de crédito** (centro del círculo)
   - Representa los métodos de pago
   - Incluye chip EMV dorado
   - Banda magnética en la parte superior
   - Líneas que simulan datos de la tarjeta

3. **Flecha de transacción**
   - Indica el movimiento del pago
   - Representa rapidez y eficiencia
   - Dirección hacia la derecha = progreso

4. **Líneas decorativas**
   - Línea superior: Innovación tecnológica
   - Línea inferior: Estabilidad y base sólida

### Paleta de Colores

#### Colores Primarios

**Verde Azulado (Teal)**
- Hex: `#00A896`
- RGB: (0, 168, 150)
- CMYK: (100, 0, 11, 34)
- Uso: Elementos principales, círculo, flecha

**Azul Profundo**
- Hex: `#0080A8`
- RGB: (0, 128, 168)
- CMYK: (100, 24, 0, 34)
- Uso: Líneas decorativas, detalles de tarjeta

**Dorado**
- Hex: `#FFD700`
- RGB: (255, 215, 0)
- CMYK: (0, 16, 100, 0)
- Uso: Chip EMV

**Celeste Claro**
- Hex: `#E8F5F3`
- RGB: (232, 245, 243)
- CMYK: (5, 0, 1, 4)
- Uso: Fondo de tarjeta

#### Colores de UI (Stripe)

**Primary Blue**
- Hex: `#6772E5`
- Uso: Botones principales, acciones primarias

**Success Green**
- Hex: `#32D583`
- Uso: Transacciones exitosas

**Error Red**
- Hex: `#E25950`
- Uso: Errores, cancelaciones

**Background**
- Hex: `#F7FAFC`
- Uso: Fondo general de la app

**Text Primary**
- Hex: `#1A1F36`
- Uso: Texto principal

**Text Secondary**
- Hex: `#697386`
- Uso: Texto secundario, subtítulos

### Espaciado y Proporciones

#### Tamaños recomendados:
- **Ícono de app**: 512x512px (Android), 1024x1024px (iOS)
- **Logo en UI**: 48x48dp a 120x120dp
- **Logo en documentos**: Mínimo 200x200px

#### Área de protección:
- Mantener un espacio libre alrededor del logo equivalente al 10% del ancho total
- No colocar texto u otros elementos dentro del área de protección

### Variaciones del Logo

#### 1. Logo completo (principal)
```xml
res/drawable/logo_jeturing_pay.xml
```
- Incluye círculo, tarjeta, flecha y líneas decorativas
- Uso: Pantallas principales, splash screen

#### 2. Logo compacto (launcher)
```xml
res/drawable/ic_launcher_foreground.xml
```
- Versión simplificada sin líneas decorativas
- Optimizado para íconos pequeños
- Uso: Ícono de aplicación

#### 3. Logo monocromático
- En caso de imprimir en un solo color, usar:
  - Versión en verde azulado sobre fondo blanco
  - Versión en blanco sobre fondo verde azulado
  - Versión en negro sobre fondo blanco (última opción)

### Usos Correctos

✅ **SÍ hacer:**
- Usar el logo en su tamaño mínimo recomendado
- Mantener las proporciones originales
- Usar sobre fondos blancos o muy claros
- Respetar el área de protección
- Usar las versiones vectoriales cuando sea posible

❌ **NO hacer:**
- Distorsionar o estirar el logo
- Cambiar los colores del logo
- Agregar sombras, brillos o efectos 3D
- Usar sobre fondos que dificulten la legibilidad
- Rotar el logo (debe estar siempre horizontal)
- Separar los elementos del logo

### Implementación Técnica

#### Android (XML Vector)
```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="200dp"
    android:height="200dp"
    android:viewportWidth="200"
    android:viewportHeight="200">
    <!-- Ver archivo completo en res/drawable/logo_jeturing_pay.xml -->
</vector>
```

#### React Native (SVG)
```tsx
import { JeturingPayLogo } from './src/components/JeturingPayLogo';

<JeturingPayLogo size={100} color="#00A896" />
```

#### Web (SVG)
```html
<svg width="200" height="200" viewBox="0 0 200 200">
    <!-- Ver archivo completo en assets/logo.svg -->
</svg>
```

### Aplicaciones del Logo

#### App Móvil
- Splash screen al iniciar
- Header en pantalla principal
- Ícono de la aplicación
- Notificaciones push

#### Terminal (WisePOS E)
- Pantalla de inicio
- Header en todas las pantallas
- Recibos impresos

#### Web y Marketing
- Dashboard web
- Documentación
- Materiales de marketing
- Presentaciones corporativas

### Archivos Fuente

```
JeturingPay/
├── WisePosApp/app/src/main/res/
│   ├── drawable/
│   │   ├── logo_jeturing_pay.xml          # Logo vectorial completo
│   │   └── ic_launcher_foreground.xml     # Logo compacto para launcher
│   └── mipmap-*/                          # Iconos rasterizados
│
├── JeturingApp/src/components/
│   └── JeturingPayLogo.tsx                # Componente React Native
│
└── docs/
    ├── logo-jeturing-pay.svg              # Versión SVG web
    └── logo-jeturing-pay.png              # Versión PNG (exportación)
```

### Contacto para Branding

Para preguntas sobre el uso del logo o solicitudes especiales:
- **Email**: branding@jeturing.com
- **Slack**: #branding

---

**Versión**: 1.0
**Última actualización**: Enero 2025
**Aprobado por**: Equipo de Diseño Jeturing
