package com.stripe.example.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.stripe.example.NavigationListener
import com.stripe.example.R
import com.stripe.example.model.OfflineBehaviorSelection
import java.text.NumberFormat
import java.util.Locale

/**
 * The `SimplePaymentFragment` provides a simplified payment interface for Jeturing Pay
 */
class SimplePaymentFragment : Fragment() {

    companion object {
        const val TAG = "com.stripe.example.fragment.SimplePaymentFragment"
    }

    private var selectedAmountCents: Long = 0
    private lateinit var selectedAmountValue: TextView
    private lateinit var customAmountLayout: TextInputLayout
    private lateinit var customAmountInput: TextInputEditText
    private lateinit var processPaymentButton: MaterialButton

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_simple_payment, container, false)

        selectedAmountValue = view.findViewById(R.id.selected_amount_value)
        customAmountLayout = view.findViewById(R.id.custom_amount_layout)
        customAmountInput = view.findViewById(R.id.custom_amount_input)
        processPaymentButton = view.findViewById(R.id.process_payment_button)

        // Setup preset amount buttons
        view.findViewById<MaterialButton>(R.id.amount_5).setOnClickListener {
            selectPresetAmount(500) // $5 = 500 cents
        }

        view.findViewById<MaterialButton>(R.id.amount_10).setOnClickListener {
            selectPresetAmount(1000) // $10 = 1000 cents
        }

        view.findViewById<MaterialButton>(R.id.amount_20).setOnClickListener {
            selectPresetAmount(2000) // $20 = 2000 cents
        }

        view.findViewById<MaterialButton>(R.id.amount_50).setOnClickListener {
            selectPresetAmount(5000) // $50 = 5000 cents
        }

        view.findViewById<MaterialButton>(R.id.amount_100).setOnClickListener {
            selectPresetAmount(10000) // $100 = 10000 cents
        }

        // Custom amount button
        view.findViewById<MaterialButton>(R.id.amount_custom).setOnClickListener {
            customAmountLayout.visibility = View.VISIBLE
            customAmountInput.requestFocus()
        }

        // Custom amount input handling
        customAmountInput.doAfterTextChanged { editable ->
            val text = editable?.toString() ?: ""
            if (text.isNotEmpty()) {
                try {
                    val dollars = text.toDouble()
                    selectPresetAmount((dollars * 100).toLong())
                } catch (e: NumberFormatException) {
                    // Invalid input, do nothing
                }
            }
        }

        // Process payment button
        processPaymentButton.setOnClickListener {
            if (selectedAmountCents > 0) {
                (activity as? NavigationListener)?.onRequestPayment(
                    selectedAmountCents,
                    "USD",
                    skipTipping = true,
                    extendedAuth = false,
                    incrementalAuth = false,
                    offlineBehaviorSelection = OfflineBehaviorSelection.DEFAULT
                )
            }
        }

        // Home button
        view.findViewById<MaterialButton>(R.id.home_button_simple).setOnClickListener {
            (activity as? NavigationListener)?.onRequestExitWorkflow()
        }

        return view
    }

    private fun selectPresetAmount(amountCents: Long) {
        selectedAmountCents = amountCents
        val formatted = NumberFormat.getCurrencyInstance(Locale.US).format(amountCents / 100.0)
        selectedAmountValue.text = formatted
        processPaymentButton.isEnabled = true
    }
}
