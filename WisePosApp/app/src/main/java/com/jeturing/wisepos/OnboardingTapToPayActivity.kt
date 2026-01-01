package com.jeturing.wisepos

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.switchmaterial.SwitchMaterial
import com.jeturing.pay.terminal.databinding.ActivityOnboardingTapToPayBinding

/**
 * OnboardingTapToPayActivity
 * Tap to Pay setup screen - Enable/disable NFC contactless payments
 * Synchronized with: React Native OnboardingTapToPayScreen.tsx
 */
class OnboardingTapToPayActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingTapToPayBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingTapToPayBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        setupClickListeners()
    }

    private fun setupUI() {
        binding.tvProgress.text = "Paso 4 de 4"
        binding.tvTitle.text = "Configurar Tap to Pay"
        binding.tvDescription.text = "Permite que tus clientes paguen acercando sus tarjetas"

        // Tap to Pay toggle (OFF by default)
        binding.switchTapToPay.isChecked = false

        // Setup permission items
        setupPermissionsList()
    }

    private fun setupPermissionsList() {
        // Required permissions for NFC
        val permissions = listOf(
            "NFC (Near Field Communication)",
            "Bluetooth (para conectar lectores)",
            "Ubicación (para análisis de transacciones)",
            "Acceso a cámara (para códigos QR)"
        )

        // In a real implementation, this would be populated dynamically
        // For now, we'll just show them in the description
        val permissionsText = permissions.joinToString("\n• ", "Permisos requeridos:\n• ")
        binding.tvPermissions.text = permissionsText
    }

    private fun setupClickListeners() {
        binding.switchTapToPay.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                // Request NFC permissions if needed
                requestNFCPermissions()
            }
        }

        binding.btnCompletarOnboarding.setOnClickListener {
            completeOnboarding()
        }

        binding.btnAtras.setOnClickListener {
            onBackPressed()
        }
    }

    private fun requestNFCPermissions() {
        // TODO: Implement NFC permission request
        // In Android 12+, NFC is handled via AndroidManifest
        // For now, just acknowledge in UI
    }

    private fun completeOnboarding() {
        // Get data from intent
        val selectedCurrency = intent.getStringExtra("SELECTED_CURRENCY") ?: "USD"
        val cardNumber = intent.getStringExtra("CARD_NUMBER") ?: ""
        val cardholderName = intent.getStringExtra("CARDHOLDER_NAME") ?: ""
        val tapToPayEnabled = binding.switchTapToPay.isChecked

        // TODO: Save onboarding data to local database or SharedPreferences
        // For now, navigate to main app

        // Mark onboarding as completed
        val sharedPref = getSharedPreferences("JETURING_PREFS", MODE_PRIVATE)
        sharedPref.edit().apply {
            putBoolean("ONBOARDING_COMPLETED", true)
            putString("SELECTED_CURRENCY", selectedCurrency)
            putString("CARDHOLDER_NAME", cardholderName)
            putBoolean("TAP_TO_PAY_ENABLED", tapToPayEnabled)
            apply()
        }

        // Navigate to main app (NewPaymentActivity or Dashboard)
        val intent = Intent(this, NewPaymentActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }
}
