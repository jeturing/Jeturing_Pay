package com.jeturing.pay.terminal

import android.app.Application
import com.stripe.stripeterminal.TerminalApplicationDelegate

/**
 * Application class para Jeturing Pay Terminal
 * Inicializa el SDK de Stripe Terminal para Apps on Device
 */
class JeturingPayApp : Application() {

    companion object {
        lateinit var instance: JeturingPayApp
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        
        // Inicializar Stripe Terminal Application Delegate
        TerminalApplicationDelegate.onCreate(this)
    }
}
