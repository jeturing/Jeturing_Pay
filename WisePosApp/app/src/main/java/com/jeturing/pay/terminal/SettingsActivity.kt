package com.jeturing.pay.terminal

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivitySettingsBinding

class SettingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySettingsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.itemAccount.setOnClickListener {
            openAccountSettings()
        }

        binding.itemTerminal.setOnClickListener {
            openTerminalSettings()
        }

        binding.itemPreferences.setOnClickListener {
            openPreferencesSettings()
        }

        binding.itemAbout.setOnClickListener {
            openAbout()
        }
    }

    private fun openAccountSettings() {
        // TODO: Navigate to account settings
        println("Opening account settings")
    }

    private fun openTerminalSettings() {
        // TODO: Navigate to terminal settings
        println("Opening terminal settings")
    }

    private fun openPreferencesSettings() {
        // TODO: Navigate to app preferences
        println("Opening app preferences")
    }

    private fun openAbout() {
        // TODO: Show about dialog
        println("Opening about")
    }
}
