package com.jeturing.pay.terminal

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.jeturing.pay.terminal.databinding.ActivityMainBinding
import com.jeturing.pay.terminal.network.ApiClient
import com.stripe.stripeterminal.Terminal
import com.stripe.stripeterminal.external.callable.ConnectionTokenCallback
import com.stripe.stripeterminal.external.callable.ConnectionTokenProvider
import com.stripe.stripeterminal.external.callable.TerminalListener
import com.stripe.stripeterminal.external.models.ConnectionStatus
import com.stripe.stripeterminal.external.models.ConnectionTokenException
import com.stripe.stripeterminal.external.models.PaymentStatus
import com.stripe.stripeterminal.external.models.Reader
import com.stripe.stripeterminal.log.LogLevel
import kotlinx.coroutines.launch

/**
 * Actividad principal de Jeturing Pay para WisePOS E
 * Apps on Device - La app corre directamente en el terminal
 */
class MainActivity : AppCompatActivity(), TerminalListener, ConnectionTokenProvider {

    private lateinit var binding: ActivityMainBinding
    private var isTerminalInitialized = false

    override fun onCreate(savedInstanceState: Bundle?) {
        // Cambiar del tema splash al tema normal
        setTheme(R.style.Theme_JeturingPayTerminal)
        
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        initializeTerminal()
    }

    private fun setupUI() {
        // Botón de nuevo cobro
        binding.btnNewPayment.setOnClickListener {
            if (isTerminalInitialized) {
                showPaymentDialog()
            } else {
                Toast.makeText(this, "Terminal no inicializado", Toast.LENGTH_SHORT).show()
            }
        }

        // Botón de historial
        binding.btnHistory.setOnClickListener {
            startActivity(Intent(this, HistoryActivity::class.java))
        }

        // Botón de configuración
        binding.btnSettings.setOnClickListener {
            showSettingsDialog()
        }

        // Actualizar estado inicial
        updateConnectionStatus(ConnectionStatus.NOT_CONNECTED)
    }

    private fun initializeTerminal() {
        binding.progressBar.visibility = View.VISIBLE
        binding.tvStatus.text = "Inicializando terminal..."

        try {
            // Para Apps on Device, el Terminal SDK se conecta automáticamente
            // al lector local (WisePOS E)
            if (!Terminal.isInitialized()) {
                Terminal.initTerminal(
                    applicationContext,
                    LogLevel.VERBOSE,
                    this, // ConnectionTokenProvider
                    this  // TerminalListener
                )
            }

            isTerminalInitialized = true
            binding.progressBar.visibility = View.GONE
            binding.tvStatus.text = "Terminal listo"
            updateConnectionStatus(ConnectionStatus.CONNECTED)

        } catch (e: Exception) {
            binding.progressBar.visibility = View.GONE
            binding.tvStatus.text = "Error: ${e.message}"
            Toast.makeText(this@MainActivity, "Error al inicializar: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    // ConnectionTokenProvider - Obtener token del backend
    override fun fetchConnectionToken(callback: ConnectionTokenCallback) {
        lifecycleScope.launch {
            try {
                val response = ApiClient.instance.getConnectionToken()
                callback.onSuccess(response.secret)
            } catch (e: Exception) {
                callback.onFailure(
                    ConnectionTokenException("Error al obtener token: ${e.message}")
                )
            }
        }
    }

    private fun showPaymentDialog() {
        val dialog = PaymentInputDialog(this) { amount, description ->
            processPayment(amount, description)
        }
        dialog.show()
    }

    private fun processPayment(amountCents: Int, description: String) {
        val intent = Intent(this, PaymentActivity::class.java).apply {
            putExtra("amount", amountCents)
            putExtra("description", description)
        }
        startActivity(intent)
    }

    private fun showSettingsDialog() {
        // TODO: Implementar diálogo de configuración
        Toast.makeText(this, "Configuración próximamente", Toast.LENGTH_SHORT).show()
    }

    private fun updateConnectionStatus(status: ConnectionStatus) {
        runOnUiThread {
            when (status) {
                ConnectionStatus.CONNECTED -> {
                    binding.ivConnectionStatus.setImageResource(R.drawable.ic_connected)
                    binding.tvConnectionStatus.text = "Conectado"
                    binding.tvConnectionStatus.setTextColor(getColor(R.color.success_green))
                }
                ConnectionStatus.CONNECTING -> {
                    binding.ivConnectionStatus.setImageResource(R.drawable.ic_connecting)
                    binding.tvConnectionStatus.text = "Conectando..."
                    binding.tvConnectionStatus.setTextColor(getColor(R.color.warning_orange))
                }
                ConnectionStatus.NOT_CONNECTED -> {
                    binding.ivConnectionStatus.setImageResource(R.drawable.ic_disconnected)
                    binding.tvConnectionStatus.text = "Desconectado"
                    binding.tvConnectionStatus.setTextColor(getColor(R.color.error_red))
                }
                else -> {
                    binding.tvConnectionStatus.text = "Estado desconocido"
                }
            }
        }
    }

    // TerminalListener callbacks
    override fun onConnectionStatusChange(status: ConnectionStatus) {
        updateConnectionStatus(status)
    }

    override fun onPaymentStatusChange(status: PaymentStatus) {
        runOnUiThread {
            binding.tvStatus.text = when (status) {
                PaymentStatus.NOT_READY -> "Listo para cobrar"
                PaymentStatus.READY -> "Esperando tarjeta..."
                PaymentStatus.WAITING_FOR_INPUT -> "Inserte o acerque tarjeta"
                PaymentStatus.PROCESSING -> "Procesando pago..."
                else -> "Procesando..."
            }
        }
    }
}
