package com.jeturing.pay.terminal

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.Window
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import java.text.NumberFormat
import java.util.Locale

/**
 * Diálogo para ingresar el monto del cobro
 */
class PaymentInputDialog(
    context: Context,
    private val onConfirm: (amountCents: Int, description: String) -> Unit
) : Dialog(context) {

    private lateinit var etAmount: EditText
    private lateinit var etDescription: EditText
    private lateinit var tvAmountDisplay: TextView
    private lateinit var btnConfirm: Button
    private lateinit var btnCancel: Button

    private var currentAmountCents = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        setContentView(R.layout.dialog_payment_input)

        setupViews()
        setupListeners()
    }

    private fun setupViews() {
        etAmount = findViewById(R.id.etAmount)
        etDescription = findViewById(R.id.etDescription)
        tvAmountDisplay = findViewById(R.id.tvAmountDisplay)
        btnConfirm = findViewById(R.id.btnConfirm)
        btnCancel = findViewById(R.id.btnCancel)

        updateAmountDisplay()
    }

    private fun setupListeners() {
        // Listener para formatear el monto mientras se escribe
        etAmount.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val text = s?.toString()?.replace("[^0-9]".toRegex(), "") ?: ""
                currentAmountCents = text.toIntOrNull() ?: 0
                updateAmountDisplay()
            }
        })

        btnConfirm.setOnClickListener {
            if (currentAmountCents > 0) {
                val description = etDescription.text.toString().ifEmpty { "Venta" }
                onConfirm(currentAmountCents, description)
                dismiss()
            }
        }

        btnCancel.setOnClickListener {
            dismiss()
        }
    }

    private fun updateAmountDisplay() {
        val formatter = NumberFormat.getCurrencyInstance(Locale.US)
        tvAmountDisplay.text = formatter.format(currentAmountCents / 100.0)
        btnConfirm.isEnabled = currentAmountCents > 0
    }
}
