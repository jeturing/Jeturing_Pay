package com.jeturing.pay.terminal

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivityPaymentModeBinding

/**
 * PaymentModeActivity - Selección del modo de pago
 * 
 * Permite al usuario seleccionar entre:
 * - Manual (teclado numérico)
 * - Tap to Pay (NFC)
 * - QR Code
 * - Link de pago
 */
class PaymentModeActivity : AppCompatActivity() {
    private lateinit var binding: ActivityPaymentModeBinding
    private var totalAmount = 0.0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPaymentModeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Obtener monto del intent
        totalAmount = intent.getDoubleExtra("TOTAL_AMOUNT", 0.0)
        
        setupActionButtons()
        updateUI()
    }

    private fun setupActionButtons() {
        binding.apply {
            btnContinue.setOnClickListener {
                // Determinar modo seleccionado según el RadioButton activo
                val selectedMode = when (binding.rbManual.isChecked) {
                    true -> "MANUAL"
                    false -> when (binding.rbTapToPay.isChecked) {
                        true -> "TAP_TO_PAY"
                        false -> when (binding.rbQrCode.isChecked) {
                            true -> "QR_CODE"
                            false -> "PAYMENT_LINK"
                        }
                    }
                }

                when (selectedMode) {
                    "MANUAL" -> {
                        // Ir a pantalla de Tips
                        val intent = Intent(this@PaymentModeActivity, TipsActivity::class.java).apply {
                            putExtra("TOTAL_AMOUNT", totalAmount)
                        }
                        startActivity(intent)
                    }
                    "TAP_TO_PAY" -> {
                        // TODO: Implementar Tap to Pay
                    }
                    "QR_CODE" -> {
                        // TODO: Implementar QR Code payment
                    }
                    "PAYMENT_LINK" -> {
                        // TODO: Implementar Payment Link
                    }
                }
                finish()
            }

            btnCancel.setOnClickListener {
                finish()
            }
        }
    }

    private fun updateUI() {
        binding.tvAmount.text = String.format("$%.2f", totalAmount)
    }
}
