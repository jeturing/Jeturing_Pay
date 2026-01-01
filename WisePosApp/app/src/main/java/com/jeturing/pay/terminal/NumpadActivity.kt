package com.jeturing.pay.terminal

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivityNumpadBinding

/**
 * NumpadActivity - Captura numérica de monto a cobrar
 * 
 * Permite al usuario ingresar el monto mediante un numpad (teclado numérico)
 * con soporte para decimales y backspace.
 */
class NumpadActivity : AppCompatActivity() {
    private lateinit var binding: ActivityNumpadBinding
    private var currentAmount = ""
    private val maxDecimals = 2

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNumpadBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupNumpadListeners()
        setupActionButtons()
    }

    private fun setupNumpadListeners() {
        binding.apply {
            // Números 0-9
            btnNum0.setOnClickListener { addDigit("0") }
            btnNum1.setOnClickListener { addDigit("1") }
            btnNum2.setOnClickListener { addDigit("2") }
            btnNum3.setOnClickListener { addDigit("3") }
            btnNum4.setOnClickListener { addDigit("4") }
            btnNum5.setOnClickListener { addDigit("5") }
            btnNum6.setOnClickListener { addDigit("6") }
            btnNum7.setOnClickListener { addDigit("7") }
            btnNum8.setOnClickListener { addDigit("8") }
            btnNum9.setOnClickListener { addDigit("9") }

            // Punto decimal
            btnDecimal.setOnClickListener { addDecimal() }

            // Backspace
            btnBackspace.setOnClickListener { deleteLastDigit() }
        }
    }

    private fun setupActionButtons() {
        binding.apply {
            btnContinue.setOnClickListener {
                if (currentAmount.isNotEmpty() && currentAmount != ".") {
                    val amount = currentAmount.toDoubleOrNull() ?: 0.0
                    if (amount > 0) {
                        val intent = Intent(this@NumpadActivity, PaymentModeActivity::class.java).apply {
                            putExtra("TOTAL_AMOUNT", amount)
                        }
                        startActivity(intent)
                        finish()
                    }
                }
            }
        }
    }

    private fun addDigit(digit: String) {
        // Validar que no exceda longitud razonable
        if (currentAmount.length >= 10) return

        // Si comienza con 0 y no hay decimal, reemplazar
        if (currentAmount == "0" && digit != ".") {
            currentAmount = digit
        } else {
            currentAmount += digit
        }
        updateDisplay()
    }

    private fun addDecimal() {
        // Solo permitir un decimal
        if (currentAmount.contains(".")) return
        
        // Si está vacío, comenzar con "0."
        if (currentAmount.isEmpty()) {
            currentAmount = "0."
        } else {
            currentAmount += "."
        }
        updateDisplay()
    }

    private fun deleteLastDigit() {
        if (currentAmount.isNotEmpty()) {
            currentAmount = currentAmount.dropLast(1)
            updateDisplay()
        }
    }

    private fun updateDisplay() {
        // Formato de moneda
        binding.tvAmount.text = if (currentAmount.isEmpty() || currentAmount == ".") {
            "0.00"
        } else {
            val amount = currentAmount.toDoubleOrNull() ?: 0.0
            String.format("%.2f", amount)
        }
    }
}
