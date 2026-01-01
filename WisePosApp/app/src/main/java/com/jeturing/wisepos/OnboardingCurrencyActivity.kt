package com.jeturing.wisepos

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.radiobutton.MaterialRadioButton
import com.jeturing.pay.terminal.databinding.ActivityOnboardingCurrencyBinding
import com.jeturing.pay.terminal.databinding.ItemCurrencyBinding

/**
 * OnboardingCurrencyActivity
 * Currency selection screen - Choose payment currency
 * Synchronized with: React Native OnboardingCurrencyScreen.tsx
 */
class OnboardingCurrencyActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingCurrencyBinding
    private var selectedCurrency = "USD"

    // Currency data
    private val currencies = listOf(
        Currency("USD", "Dólar Estadounidense", "United States"),
        Currency("EUR", "Euro", "European Union"),
        Currency("MXN", "Peso Mexicano", "Mexico"),
        Currency("COP", "Peso Colombiano", "Colombia"),
        Currency("ARS", "Peso Argentino", "Argentina"),
        Currency("BRL", "Real Brasileño", "Brazil"),
        Currency("CLP", "Peso Chileno", "Chile"),
        Currency("PEN", "Sol Peruano", "Peru")
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingCurrencyBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        setupRecyclerView()
        setupClickListeners()
    }

    private fun setupUI() {
        binding.tvProgress.text = "Paso 3 de 4"
        binding.tvTitle.text = "Selecciona tu moneda"
        binding.tvDescription.text = "Elige la moneda en la que deseas recibir pagos"

        // Set USD as default
        selectedCurrency = "USD"
    }

    private fun setupRecyclerView() {
        val adapter = CurrencyAdapter(currencies, "USD") { selectedCode ->
            selectedCurrency = selectedCode
        }
        binding.rvCurrencies.layoutManager = LinearLayoutManager(this)
        binding.rvCurrencies.adapter = adapter
    }

    private fun setupClickListeners() {
        binding.btnSiguiente.setOnClickListener {
            navigateToTapToPaySetup()
        }

        binding.btnAtras.setOnClickListener {
            onBackPressed()
        }
    }

    private fun navigateToTapToPaySetup() {
        val intent = Intent(this, OnboardingTapToPayActivity::class.java)
        // Pass selected currency to next screen
        intent.putExtra("SELECTED_CURRENCY", selectedCurrency)
        
        // Also pass card data if needed
        intent.putExtra("CARD_NUMBER", getIntent().getStringExtra("CARD_NUMBER"))
        intent.putExtra("CARDHOLDER_NAME", getIntent().getStringExtra("CARDHOLDER_NAME"))
        
        startActivity(intent)
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }

    // Data class for currency
    data class Currency(
        val code: String,
        val name: String,
        val country: String
    )
}

/**
 * CurrencyAdapter - RecyclerView adapter for currency list
 */
class CurrencyAdapter(
    private val currencies: List<OnboardingCurrencyActivity.Currency>,
    private val defaultSelected: String,
    private val onSelectionChanged: (String) -> Unit
) : RecyclerView.Adapter<CurrencyAdapter.ViewHolder>() {

    private var selectedPosition = currencies.indexOfFirst { it.code == defaultSelected }

    inner class ViewHolder(private val binding: ItemCurrencyBinding) :
        RecyclerView.ViewHolder(binding.root) {
        
        fun bind(currency: OnboardingCurrencyActivity.Currency, position: Int) {
            binding.tvCurrencyCode.text = currency.code
            binding.tvCurrencyName.text = currency.name
            binding.tvCountry.text = currency.country

            binding.rbCurrency.isChecked = position == selectedPosition
            binding.rbCurrency.setOnCheckedChangeListener { _, isChecked ->
                if (isChecked) {
                    val previousPosition = selectedPosition
                    selectedPosition = position
                    notifyItemChanged(previousPosition)
                    notifyItemChanged(position)
                    onSelectionChanged(currency.code)
                }
            }

            binding.root.setOnClickListener {
                binding.rbCurrency.isChecked = true
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemCurrencyBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(currencies[position], position)
    }

    override fun getItemCount() = currencies.size
}
