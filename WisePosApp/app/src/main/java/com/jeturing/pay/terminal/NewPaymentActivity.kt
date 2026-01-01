package com.jeturing.pay.terminal

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivityNewPaymentBinding

/**
 * NewPaymentActivity - Inicio de nuevo pago
 * 
 * Pantalla inicial para crear un nuevo pago.
 * Permite:
 * - Seleccionar monto rápido ($10, $25, $50)
 * - Ingresar monto personalizado
 * - Usar transacción del historial
 */
class NewPaymentActivity : AppCompatActivity() {
    private lateinit var binding: ActivityNewPaymentBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNewPaymentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupQuickAmounts()
        setupActionButtons()
    }

    private fun setupQuickAmounts() {
        binding.apply {
            // Monto rápido $10
            btn10.setOnClickListener {
                proceedToPayment(10.0)
            }

            // Monto rápido $25
            btn25.setOnClickListener {
                proceedToPayment(25.0)
            }

            // Monto rápido $50
            btn50.setOnClickListener {
                proceedToPayment(50.0)
            }
        }
    }

    private fun setupActionButtons() {
        binding.apply {
            // Monto personalizado → Numpad
            btnCustomAmount.setOnClickListener {
                val intent = Intent(this@NewPaymentActivity, NumpadActivity::class.java)
                startActivity(intent)
                finish()
            }

            // Desde historial → HistoryActivity
            btnFromHistory.setOnClickListener {
                val intent = Intent(this@NewPaymentActivity, HistoryActivity::class.java)
                startActivity(intent)
                finish()
            }

            // Cancelar
            btnCancel.setOnClickListener {
                finish()
            }
        }
    }

    private fun proceedToPayment(amount: Double) {
        val intent = Intent(this@NewPaymentActivity, PaymentModeActivity::class.java).apply {
            putExtra("TOTAL_AMOUNT", amount)
        }
        startActivity(intent)
        finish()
    }
}
