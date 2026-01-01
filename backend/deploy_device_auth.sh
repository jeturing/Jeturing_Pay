#!/bin/bash
# Script para desplegar el módulo de autenticación de dispositivos
# Ejecutar: bash deploy_device_auth.sh

SERVER="root@192.168.1.13"
PASSWORD="123Abcd."
REMOTE_PATH="/root/Api/Pro"

echo "📦 Desplegando módulo de autenticación de dispositivos..."

# Copiar archivo al servidor
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no device_auth.py $SERVER:$REMOTE_PATH/

# Agregar import y router al archivo principal
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'EOF'
cd /root/Api/Pro

# Verificar si ya está integrado
if grep -q "device_auth" Stripe.py; then
    echo "✓ Módulo ya integrado"
else
    echo "Integrando módulo..."
    
    # Agregar import al inicio (después de los otros imports)
    sed -i '/from fastapi.security.api_key import APIKeyHeader/a from device_auth import devices_router' Stripe.py
    
    # Agregar router (antes del final del archivo)
    echo "" >> Stripe.py
    echo "# Dispositivos y autenticación biométrica" >> Stripe.py
    echo "app.include_router(devices_router)" >> Stripe.py
    
    echo "✓ Módulo integrado exitosamente"
fi

# Reiniciar el servicio
echo "Reiniciando servicio..."
systemctl restart stripe-api 2>/dev/null || supervisorctl restart stripe-api 2>/dev/null || echo "Reinicia el servicio manualmente"

echo "✓ Despliegue completado"
EOF

echo "✅ Módulo desplegado. Endpoints disponibles:"
echo "   POST /devices/register - Registrar dispositivo"
echo "   POST /devices/authenticate - Autenticar dispositivo"
echo "   GET  /devices/list/{account_id} - Listar dispositivos"
echo "   PUT  /devices/{account_id}/{device_id} - Actualizar estado"
echo "   DELETE /devices/{account_id}/{device_id} - Eliminar dispositivo"
echo "   POST /devices/search - Buscar por negocio"
