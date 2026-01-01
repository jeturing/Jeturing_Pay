package com.jeturing.wisepos

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivityOnboardingCardBinding

/**
 * OnboardingCardActivity
 * Card entry screen - Capture card details (number, expiry, CVV, name)
 * Synchronized with: React Native OnboardingCardScreen.tsx
 */
class OnboardingCardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingCardBinding

    // Card input variables
    private var cardNumber = ""
    private var expiryDate = ""
    private var cvv = ""
    private var cardholderName = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingCardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        setupTextWatchers()
        setupClickListeners()
    }

    private fun setupUI() {
        binding.tvProgress.text = "Paso 2 de 4"
        binding.tvTitle.text = "Conecta tu medio de pago"
        binding.tvDescription.text = "Ingresa los datos de tu tarjeta de crédito o débito"

        // Set input hints and keyboard types
        binding.etCardNumber.hint = "1234 5678 9012 3456"
        binding.etCardNumber.inputType = android.text.InputType.TYPE_CLASS_NUMBER

        binding.etExpiryDate.hint = "MM/YY"
        binding.etExpiryDate.inputType = android.text.InputType.TYPE_CLASS_NUMBER

        binding.etCvv.hint = "123"
        binding.etCvv.inputType = android.text.InputType.TYPE_CLASS_NUMBER

        binding.etCardholderName.hint = "Nombre como aparece en la tarjeta"
        binding.etCardholderName.inputType = android.text.InputType.TYPE_CLASS_TEXT

        // Checkbox is unchecked by default
        binding.cbSaveCard.isChecked = false
    }

    private fun setupTextWatchers() {
        // Card number: Format as 1234 5678 9012 3456 (16 digits max)
        binding.etCardNumber.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

            override fun afterTextChanged(s: Editable?) {
                val input = s?.toString()?.replace(" ", "") ?: ""
                if (input.length > 16) {
                    binding.etCardNumber.setText(input.substring(0, 16))
                    binding.etCardNumber.setSelection(16)
                } else {
                    // Format with spaces every 4 digits
                    val formatted = input.chunked(4).joinToString(" ")
                    if (formatted != s?.toString()) {
                        binding.etCardNumber.removeTextChangedListener(this)
                        binding.etCardNumber.setText(formatted)
                        binding.etCardNumber.setSelection(formatted.length)
                        binding.etCardNumber.addTextChangedListener(this)
                    }
                    cardNumber = input
                }
            }
        })

        // Expiry date: Format as MM/YY
        binding.etExpiryDate.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

            override fun afterTextChanged(s: Editable?) {
                val input = s?.toString()?.replace("/", "") ?: ""
                if (input.length > 4) {
                    binding.etExpiryDate.setText(input.substring(0, 4))
                    binding.etExpiryDate.setSelection(4)
                } else if (input.length == 2 && !s.toString().contains("/")) {
                    val formatted = "${input}/"
                    binding.etExpiryDate.removeTextChangedListener(this)
                    binding.etExpiryDate.setText(formatted)
                    binding.etExpiryDate.setSelection(formatted.length)
                    binding.etExpiryDate.addTextChangedListener(this)
                }
                expiryDate = input
            }
        })

        // CVV: 3 digits max
        binding.etCvv.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

            override fun afterTextChanged(s: Editable?) {
                val input = s?.toString() ?: ""
                if (input.length > 3) {
                    binding.etCvv.setText(input.substring(0, 3))
                    binding.etCvv.setSelection(3)
                }
                cvv = input
            }
        })

        // Cardholder name
        binding.etCardholderName.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

            override fun afterTextChanged(s: Editable?) {
                cardholderName = s?.toString() ?: ""
            }
        })
    }

    private fun setupClickListeners() {
        binding.btnSiguiente.setOnClickListener {
            if (validateCardData()) {
                navigateToCurrencySelection()
            }
        }

        binding.btnAtras.setOnClickListener {
            onBackPressed()
        }
    }

    private fun validateCardData(): Boolean {
        // Validate card number (16 digits)
        if (cardNumber.length != 16) {
            Toast.makeText(
                this,
                "Número de tarjeta inválido (16 dígitos requeridos)",
                Toast.LENGTH_SHORT
            ).show()
            return false
        }

        // Validate expiry date (4 digits: MMYY)
        if (expiryDate.length != 4) {
            Toast.makeText(
                this,
                "Fecha de vencimiento inválida (MM/YY requerido)",
                Toast.LENGTH_SHORT
            ).show()
            return false
        }

        // Validate expiry month and year
        val month = expiryDate.substring(0, 2).toIntOrNull() ?: 0
        if (month < 1 || month > 12) {
            Toast.makeText(
                this,
                "Mes de vencimiento inválido (01-12)",
                Toast.LENGTH_SHORT
            ).show()
            return false
        }

        // Validate CVV (3 digits)
        if (cvv.length != 3) {
            Toast.makeText(
                this,
                "CVV inválido (3 dígitos requeridos)",
                Toast.LENGTH_SHORT
            ).show()
            return false
        }

        // Validate cardholder name (not empty)
        if (cardholderName.isBlank()) {
            Toast.makeText(
                this,
                "Nombre del titular requerido",
                Toast.LENGTH_SHORT
            ).show()
            return false
        }

        return true
    }

    private fun navigateToCurrencySelection() {
        val intent = Intent(this, OnboardingCurrencyActivity::class.java)
        // Pass card data to next screen
        intent.putExtra("CARD_NUMBER", cardNumber)
        intent.putExtra("EXPIRY_DATE", expiryDate)
        intent.putExtra("CVV", cvv)
        intent.putExtra("CARDHOLDER_NAME", cardholderName)
        intent.putExtra("SAVE_CARD", binding.cbSaveCard.isChecked)
        startActivity(intent)
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }
}
