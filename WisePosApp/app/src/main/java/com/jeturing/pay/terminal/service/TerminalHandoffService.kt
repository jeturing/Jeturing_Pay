package com.jeturing.pay.terminal.service

import android.app.Service
import android.content.Intent
import android.os.IBinder

/**
 * Servicio para manejar la integración con Apps on Device de Stripe
 * Este servicio permite que la app se ejecute como una app nativa en el WisePOS E
 */
class TerminalHandoffService : Service() {

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        // Inicializar el servicio
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Manejar comandos del servicio
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        // Limpiar recursos
    }
}
