package com.jeturing.wisepos

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivityOnboardingWelcomeBinding

/**
 * OnboardingWelcomeActivity
 * First screen of onboarding - Welcome & Brand introduction
 * Synchronized with: React Native OnboardingWelcomeScreen.tsx
 */
class OnboardingWelcomeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOnboardingWelcomeBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOnboardingWelcomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        setupClickListeners()
    }

    private fun setupUI() {
        // Set progress indicator (Step 1 of 4)
        binding.tvProgress.text = "Paso 1 de 4"

        // Logo is set in XML via ImageView
        // Title and description are set in XML
    }

    private fun setupClickListeners() {
        binding.btnComenzar.setOnClickListener {
            navigateToCardEntry()
        }

        binding.btnAprenderMas.setOnClickListener {
            // Optional: Open help screen or WebView with more info
            showMoreInfo()
        }
    }

    private fun navigateToCardEntry() {
        val intent = Intent(this, OnboardingCardActivity::class.java)
        startActivity(intent)
        // Smooth transition
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }

    private fun showMoreInfo() {
        // TODO: Implement help dialog or info screen
        // For now, just a placeholder
    }
}
