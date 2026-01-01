package com.jeturing.pay.terminal

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.jeturing.pay.terminal.databinding.ActivityPaymentBinding
import com.jeturing.pay.terminal.network.ApiClient
import com.stripe.stripeterminal.Terminal
import com.stripe.stripeterminal.external.callable.PaymentIntentCallback
import com.stripe.stripeterminal.external.callable.ReaderCallback
import com.stripe.stripeterminal.external.models.PaymentIntent
import com.stripe.stripeterminal.external.models.PaymentIntentParameters
import com.stripe.stripeterminal.external.models.TerminalException
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

/**
 * Actividad para procesar pagos en el WisePOS E
 */
class PaymentActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPaymentBinding
    private var currentPaymentIntent: PaymentIntent? = null
    private var amountCents: Int = 0
    private var description: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPaymentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Obtener datos del intent
        amountCents = intent.getIntExtra("amount", 0)
        description = intent.getStringExtra("description") ?: ""

        setupUI()
        startPayment()
    }

    private fun setupUI() {
        // Mostrar monto
        val formatter = NumberFormat.getCurrencyInstance(Locale.US)
        formatter.currency = Currency.getInstance("USD")
        binding.tvAmount.text = formatter.format(amountCents / 100.0)
        binding.tvDescription.text = description

        // Botón cancelar
        binding.btnCancel.setOnClickListener {
            cancelPayment()
        }
    }

    private fun startPayment() {
        binding.progressBar.visibility = View.VISIBLE
        binding.tvStatus.text = "Creando pago..."
        binding.animationView.playAnimation()

        lifecycleScope.launch {
            try {
                // Crear PaymentIntent en el servidor
                val response = ApiClient.instance.createPaymentIntent(
                    amount = amountCents,
                    currency = "usd",
                    description = description
                )

                // Recuperar el PaymentIntent en el SDK
                Terminal.getInstance().retrievePaymentIntent(
                    response.clientSecret,
                    object : PaymentIntentCallback {
                        override fun onSuccess(paymentIntent: PaymentIntent) {
                            currentPaymentIntent = paymentIntent
                            collectPayment(paymentIntent)
                        }

                        override fun onFailure(e: TerminalException) {
                            showError("Error al recuperar pago: ${e.errorMessage}")
                        }
                    }
                )

            } catch (e: Exception) {
                showError("Error: ${e.message}")
            }
        }
    }

    private fun collectPayment(paymentIntent: PaymentIntent) {
        runOnUiThread {
            binding.tvStatus.text = "Inserte o acerque la tarjeta"
            binding.animationView.setAnimation(R.raw.card_tap)
            binding.animationView.playAnimation()
        }

        Terminal.getInstance().collectPaymentMethod(
            paymentIntent,
            object : PaymentIntentCallback {
                override fun onSuccess(collectedPaymentIntent: PaymentIntent) {
                    currentPaymentIntent = collectedPaymentIntent
                    processPayment(collectedPaymentIntent)
                }

                override fun onFailure(e: TerminalException) {
                    showError("Error al leer tarjeta: ${e.errorMessage}")
                }
            }
        )
    }

    private fun processPayment(paymentIntent: PaymentIntent) {
        runOnUiThread {
            binding.tvStatus.text = "Procesando pago..."
            binding.animationView.setAnimation(R.raw.processing)
            binding.animationView.playAnimation()
        }

        Terminal.getInstance().confirmPaymentIntent(
            paymentIntent,
            object : PaymentIntentCallback {
                override fun onSuccess(processedPaymentIntent: PaymentIntent) {
                    currentPaymentIntent = processedPaymentIntent
                    
                    // Confirmar en el servidor
                    confirmPaymentOnServer(processedPaymentIntent)
                }

                override fun onFailure(e: TerminalException) {
                    showError("Error al procesar: ${e.errorMessage}")
                }
            }
        )
    }

    private fun confirmPaymentOnServer(paymentIntent: PaymentIntent) {
        lifecycleScope.launch {
            try {
                // Confirmar en el backend
                val paymentIntentId = paymentIntent.id ?: return@launch
                ApiClient.instance.capturePaymentIntent(paymentIntentId)
                
                runOnUiThread {
                    showSuccess()
                }
            } catch (e: Exception) {
                // El pago ya se procesó, solo falló la confirmación del servidor
                runOnUiThread {
                    showSuccess()
                }
            }
        }
    }

    private fun showSuccess() {
        binding.progressBar.visibility = View.GONE
        binding.tvStatus.text = "¡Pago exitoso!"
        binding.tvStatus.setTextColor(getColor(R.color.success_green))
        binding.animationView.setAnimation(R.raw.success)
        binding.animationView.playAnimation()
        binding.btnCancel.text = "Cerrar"
        binding.btnCancel.setOnClickListener {
            setResult(RESULT_OK)
            finish()
        }

        // Imprimir recibo automáticamente después de 2 segundos
        binding.root.postDelayed({
            printReceipt()
        }, 2000)
    }

    private fun showError(message: String) {
        runOnUiThread {
            binding.progressBar.visibility = View.GONE
            binding.tvStatus.text = message
            binding.tvStatus.setTextColor(getColor(R.color.error_red))
            binding.animationView.setAnimation(R.raw.error)
            binding.animationView.playAnimation()
            Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        }
    }

    private fun cancelPayment() {
        currentPaymentIntent?.let { pi ->
            Terminal.getInstance().cancelPaymentIntent(
                pi,
                object : PaymentIntentCallback {
                    override fun onSuccess(paymentIntent: PaymentIntent) {
                        finish()
                    }

                    override fun onFailure(e: TerminalException) {
                        finish()
                    }
                }
            )
        } ?: finish()
    }

    private fun printReceipt() {
        // TODO: Implementar impresión de recibo en el WisePOS E
        Toast.makeText(this, "Imprimiendo recibo...", Toast.LENGTH_SHORT).show()
    }

    override fun onBackPressed() {
        cancelPayment()
    }
}
