package com.jeturing.pay.terminal

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivityCancelPaymentBinding

/**
 * CancelPaymentActivity - Cancelación de pago en proceso
 * 
 * Permite al usuario cancelar un pago que está en procesamiento
 * con confirmación y advertencias sobre posibles cargos.
 */
class CancelPaymentActivity : AppCompatActivity() {
    private lateinit var binding: ActivityCancelPaymentBinding
    private var totalAmount = 0.0
    private var transactionId = ""
    private var transactionTime = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCancelPaymentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Obtener datos del intent
        totalAmount = intent.getDoubleExtra("AMOUNT", 0.0)
        transactionId = intent.getStringExtra("TXN_ID") ?: "N/A"
        transactionTime = intent.getStringExtra("TIME") ?: "N/A"

        setupUI()
        setupActionButtons()
    }

    private fun setupUI() {
        binding.apply {
            tvAmount.text = String.format("$%.2f", totalAmount)
            tvTime.text = transactionTime
            tvTransactionId.text = transactionId
        }
    }

    private fun setupActionButtons() {
        binding.apply {
            // Confirmar cancelación
            btnConfirmCancel.setOnClickListener {
                // TODO: Llamar a API para cancelar pago
                // En caso de éxito:
                val intent = Intent(this@CancelPaymentActivity, HistoryActivity::class.java)
                startActivity(intent)
                finish()
            }

            // Continuar con el pago
            btnContinuePayment.setOnClickListener {
                finish()
            }
        }
    }
}
