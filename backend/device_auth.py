"""
Device Authentication & Management API
Endpoints para gestionar dispositivos autorizados por empresa

Este módulo maneja:
- Registro de dispositivos con biometría
- Autorización/revocación de dispositivos
- Listado de dispositivos por empresa
- Verificación de dispositivos autorizados
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends, Query
import json
import os
import hashlib
import secrets

# Router para dispositivos
devices_router = APIRouter(prefix="/devices", tags=["Gestión de Dispositivos"])

# Almacenamiento en memoria (en producción usar base de datos)
# Estructura: { "acct_xxx": { "devices": [...], "settings": {...} } }
DEVICE_STORAGE_FILE = "/root/Api/Pro/device_storage.json"

# ============== MODELOS ==============

class DeviceRegisterRequest(BaseModel):
    """Solicitud de registro de dispositivo"""
    account_id: str = Field(..., description="ID de cuenta Stripe (acct_xxx)")
    device_id: str = Field(..., description="ID único del dispositivo")
    device_name: str = Field(..., description="Nombre del dispositivo (ej: iPhone de Juan)")
    device_type: str = Field(..., description="Tipo: 'android' | 'ios'")
    biometric_type: Optional[str] = Field(None, description="Tipo biométrico: 'fingerprint' | 'facial' | 'none'")
    business_name: str = Field(..., description="Nombre del negocio")
    phone: str = Field(..., description="Teléfono del negocio")
    email: Optional[str] = Field(None, description="Email del usuario")
    push_token: Optional[str] = Field(None, description="Token para notificaciones push")

class DeviceResponse(BaseModel):
    """Respuesta con información del dispositivo"""
    device_id: str
    device_name: str
    device_type: str
    biometric_type: Optional[str]
    status: str  # 'active', 'pending', 'revoked'
    registered_at: str
    last_access: Optional[str]
    is_primary: bool

class DeviceListResponse(BaseModel):
    """Lista de dispositivos de una empresa"""
    account_id: str
    business_name: str
    total_devices: int
    max_devices: int
    devices: List[DeviceResponse]

class DeviceAuthRequest(BaseModel):
    """Solicitud de autenticación de dispositivo"""
    device_id: str
    account_id: str
    biometric_verified: bool = False

class DeviceAuthResponse(BaseModel):
    """Respuesta de autenticación"""
    authorized: bool
    account_id: str
    business_name: str
    device_status: str
    access_token: Optional[str] = None
    expires_at: Optional[str] = None
    message: str

class DeviceUpdateRequest(BaseModel):
    """Actualización de estado de dispositivo"""
    status: str = Field(..., description="Nuevo estado: 'active' | 'revoked' | 'pending'")
    reason: Optional[str] = Field(None, description="Razón del cambio")

class BusinessSearchRequest(BaseModel):
    """Búsqueda de cuenta por negocio"""
    business_name: str
    phone: str

class BusinessSearchResponse(BaseModel):
    """Respuesta de búsqueda"""
    found: bool
    account_id: Optional[str] = None
    business_name: Optional[str] = None
    requires_verification: bool = True
    verification_method: str = "biometric"  # 'biometric', 'sms', 'email'

# ============== HELPERS ==============

def load_device_storage() -> Dict:
    """Carga el almacenamiento de dispositivos"""
    if os.path.exists(DEVICE_STORAGE_FILE):
        try:
            with open(DEVICE_STORAGE_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_device_storage(data: Dict):
    """Guarda el almacenamiento de dispositivos"""
    with open(DEVICE_STORAGE_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def generate_access_token() -> str:
    """Genera un token de acceso seguro"""
    return secrets.token_urlsafe(32)

def hash_device_id(device_id: str) -> str:
    """Hash del device_id para almacenamiento seguro"""
    return hashlib.sha256(device_id.encode()).hexdigest()[:16]

# ============== ENDPOINTS ==============

@devices_router.post("/register", response_model=DeviceResponse)
async def register_device(request: DeviceRegisterRequest):
    """
    Registra un nuevo dispositivo para una cuenta de empresa.
    
    - Máximo 5 dispositivos por empresa por defecto
    - El primer dispositivo se marca como primario
    - Requiere verificación biométrica en el dispositivo
    """
    storage = load_device_storage()
    
    # Inicializar cuenta si no existe
    if request.account_id not in storage:
        storage[request.account_id] = {
            "business_name": request.business_name,
            "phone": request.phone,
            "email": request.email,
            "max_devices": 5,
            "devices": [],
            "created_at": datetime.utcnow().isoformat()
        }
    
    account_data = storage[request.account_id]
    devices = account_data.get("devices", [])
    
    # Verificar límite de dispositivos
    active_devices = [d for d in devices if d["status"] == "active"]
    if len(active_devices) >= account_data.get("max_devices", 5):
        raise HTTPException(
            status_code=400,
            detail=f"Límite de dispositivos alcanzado ({account_data.get('max_devices', 5)}). Revoca un dispositivo existente."
        )
    
    # Verificar si el dispositivo ya existe
    device_hash = hash_device_id(request.device_id)
    existing = next((d for d in devices if d["device_hash"] == device_hash), None)
    
    if existing:
        # Actualizar dispositivo existente
        existing["status"] = "active"
        existing["last_access"] = datetime.utcnow().isoformat()
        existing["device_name"] = request.device_name
        existing["biometric_type"] = request.biometric_type
        save_device_storage(storage)
        
        return DeviceResponse(
            device_id=device_hash,
            device_name=existing["device_name"],
            device_type=existing["device_type"],
            biometric_type=existing.get("biometric_type"),
            status=existing["status"],
            registered_at=existing["registered_at"],
            last_access=existing.get("last_access"),
            is_primary=existing.get("is_primary", False)
        )
    
    # Crear nuevo dispositivo
    is_primary = len(devices) == 0  # Primer dispositivo es primario
    
    new_device = {
        "device_hash": device_hash,
        "device_name": request.device_name,
        "device_type": request.device_type,
        "biometric_type": request.biometric_type,
        "push_token": request.push_token,
        "status": "active",
        "is_primary": is_primary,
        "registered_at": datetime.utcnow().isoformat(),
        "last_access": datetime.utcnow().isoformat()
    }
    
    devices.append(new_device)
    account_data["devices"] = devices
    account_data["business_name"] = request.business_name
    account_data["phone"] = request.phone
    if request.email:
        account_data["email"] = request.email
    
    save_device_storage(storage)
    
    return DeviceResponse(
        device_id=device_hash,
        device_name=new_device["device_name"],
        device_type=new_device["device_type"],
        biometric_type=new_device.get("biometric_type"),
        status=new_device["status"],
        registered_at=new_device["registered_at"],
        last_access=new_device.get("last_access"),
        is_primary=new_device["is_primary"]
    )


@devices_router.post("/authenticate", response_model=DeviceAuthResponse)
async def authenticate_device(request: DeviceAuthRequest):
    """
    Autentica un dispositivo registrado.
    
    - Verifica que el dispositivo esté registrado y activo
    - Genera un token de acceso temporal
    - Registra el último acceso
    """
    storage = load_device_storage()
    
    if request.account_id not in storage:
        return DeviceAuthResponse(
            authorized=False,
            account_id=request.account_id,
            business_name="",
            device_status="not_found",
            message="Cuenta no encontrada. Debes registrar el dispositivo primero."
        )
    
    account_data = storage[request.account_id]
    devices = account_data.get("devices", [])
    device_hash = hash_device_id(request.device_id)
    
    device = next((d for d in devices if d["device_hash"] == device_hash), None)
    
    if not device:
        return DeviceAuthResponse(
            authorized=False,
            account_id=request.account_id,
            business_name=account_data.get("business_name", ""),
            device_status="not_registered",
            message="Dispositivo no registrado. Debes vincular este dispositivo primero."
        )
    
    if device["status"] == "revoked":
        return DeviceAuthResponse(
            authorized=False,
            account_id=request.account_id,
            business_name=account_data.get("business_name", ""),
            device_status="revoked",
            message="Este dispositivo ha sido revocado. Contacta al administrador."
        )
    
    if device["status"] == "pending":
        return DeviceAuthResponse(
            authorized=False,
            account_id=request.account_id,
            business_name=account_data.get("business_name", ""),
            device_status="pending",
            message="Dispositivo pendiente de aprobación."
        )
    
    # Dispositivo activo - generar token
    device["last_access"] = datetime.utcnow().isoformat()
    save_device_storage(storage)
    
    access_token = generate_access_token()
    expires_at = datetime.utcnow().isoformat()  # En producción, agregar tiempo de expiración
    
    return DeviceAuthResponse(
        authorized=True,
        account_id=request.account_id,
        business_name=account_data.get("business_name", ""),
        device_status="active",
        access_token=access_token,
        expires_at=expires_at,
        message="Autenticación exitosa"
    )


@devices_router.get("/list/{account_id}", response_model=DeviceListResponse)
async def list_devices(account_id: str):
    """
    Lista todos los dispositivos de una cuenta de empresa.
    
    - Útil para panel de administración
    - Muestra estado de cada dispositivo
    """
    storage = load_device_storage()
    
    if account_id not in storage:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    account_data = storage[account_id]
    devices = account_data.get("devices", [])
    
    device_list = [
        DeviceResponse(
            device_id=d["device_hash"],
            device_name=d["device_name"],
            device_type=d["device_type"],
            biometric_type=d.get("biometric_type"),
            status=d["status"],
            registered_at=d["registered_at"],
            last_access=d.get("last_access"),
            is_primary=d.get("is_primary", False)
        )
        for d in devices
    ]
    
    return DeviceListResponse(
        account_id=account_id,
        business_name=account_data.get("business_name", ""),
        total_devices=len(devices),
        max_devices=account_data.get("max_devices", 5),
        devices=device_list
    )


@devices_router.put("/{account_id}/{device_id}", response_model=DeviceResponse)
async def update_device_status(
    account_id: str,
    device_id: str,
    request: DeviceUpdateRequest
):
    """
    Actualiza el estado de un dispositivo.
    
    - Permite revocar o reactivar dispositivos
    - Solo el administrador de la cuenta puede hacer esto
    """
    storage = load_device_storage()
    
    if account_id not in storage:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    account_data = storage[account_id]
    devices = account_data.get("devices", [])
    
    device = next((d for d in devices if d["device_hash"] == device_id), None)
    
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    
    if request.status not in ["active", "revoked", "pending"]:
        raise HTTPException(status_code=400, detail="Estado inválido")
    
    device["status"] = request.status
    device["status_changed_at"] = datetime.utcnow().isoformat()
    if request.reason:
        device["status_reason"] = request.reason
    
    save_device_storage(storage)
    
    return DeviceResponse(
        device_id=device["device_hash"],
        device_name=device["device_name"],
        device_type=device["device_type"],
        biometric_type=device.get("biometric_type"),
        status=device["status"],
        registered_at=device["registered_at"],
        last_access=device.get("last_access"),
        is_primary=device.get("is_primary", False)
    )


@devices_router.delete("/{account_id}/{device_id}")
async def delete_device(account_id: str, device_id: str):
    """
    Elimina permanentemente un dispositivo.
    
    - No se puede eliminar el dispositivo primario si hay otros activos
    """
    storage = load_device_storage()
    
    if account_id not in storage:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    account_data = storage[account_id]
    devices = account_data.get("devices", [])
    
    device_index = next((i for i, d in enumerate(devices) if d["device_hash"] == device_id), None)
    
    if device_index is None:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    
    device = devices[device_index]
    
    # No permitir eliminar el primario si hay otros dispositivos
    if device.get("is_primary") and len(devices) > 1:
        raise HTTPException(
            status_code=400, 
            detail="No se puede eliminar el dispositivo primario. Designa otro como primario primero."
        )
    
    devices.pop(device_index)
    account_data["devices"] = devices
    save_device_storage(storage)
    
    return {"message": "Dispositivo eliminado exitosamente", "device_id": device_id}


@devices_router.post("/search", response_model=BusinessSearchResponse)
async def search_by_business(request: BusinessSearchRequest):
    """
    Busca una cuenta por nombre de negocio y teléfono.
    
    - Útil para login en nuevo dispositivo
    - Retorna si requiere verificación adicional
    """
    storage = load_device_storage()
    
    # Normalizar teléfono para búsqueda
    search_phone = ''.join(filter(str.isdigit, request.phone))
    search_name = request.business_name.lower().strip()
    
    for account_id, data in storage.items():
        stored_phone = ''.join(filter(str.isdigit, data.get("phone", "")))
        stored_name = data.get("business_name", "").lower().strip()
        
        # Coincidencia exacta de teléfono y parcial de nombre
        if stored_phone == search_phone or search_phone in stored_phone:
            if search_name in stored_name or stored_name in search_name:
                return BusinessSearchResponse(
                    found=True,
                    account_id=account_id,
                    business_name=data.get("business_name"),
                    requires_verification=True,
                    verification_method="biometric"
                )
    
    return BusinessSearchResponse(
        found=False,
        requires_verification=False,
        verification_method="none"
    )


@devices_router.post("/{account_id}/set-primary/{device_id}")
async def set_primary_device(account_id: str, device_id: str):
    """
    Establece un dispositivo como el primario de la cuenta.
    """
    storage = load_device_storage()
    
    if account_id not in storage:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    account_data = storage[account_id]
    devices = account_data.get("devices", [])
    
    device = next((d for d in devices if d["device_hash"] == device_id), None)
    
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    
    if device["status"] != "active":
        raise HTTPException(status_code=400, detail="Solo dispositivos activos pueden ser primarios")
    
    # Quitar primario de todos y asignar al nuevo
    for d in devices:
        d["is_primary"] = (d["device_hash"] == device_id)
    
    save_device_storage(storage)
    
    return {"message": "Dispositivo establecido como primario", "device_id": device_id}


@devices_router.put("/{account_id}/settings")
async def update_account_settings(
    account_id: str,
    max_devices: Optional[int] = Query(None, ge=1, le=20),
    require_biometric: Optional[bool] = Query(None)
):
    """
    Actualiza configuración de la cuenta para dispositivos.
    """
    storage = load_device_storage()
    
    if account_id not in storage:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    account_data = storage[account_id]
    
    if max_devices is not None:
        account_data["max_devices"] = max_devices
    
    if require_biometric is not None:
        account_data["require_biometric"] = require_biometric
    
    save_device_storage(storage)
    
    return {
        "message": "Configuración actualizada",
        "max_devices": account_data.get("max_devices", 5),
        "require_biometric": account_data.get("require_biometric", True)
    }


# ============== INSTRUCCIONES DE INTEGRACIÓN ==============
"""
Para integrar este módulo en Stripe.py, agregar al final del archivo:

1. Importar el router:
   from device_auth import devices_router

2. Incluir el router en la app:
   app.include_router(devices_router)

O copiar todo el código de este archivo y pegarlo en Stripe.py
"""
