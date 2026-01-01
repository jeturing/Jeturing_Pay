package com.jeturing.pay.terminal

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivityLoginBinding

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnLogin.setOnClickListener {
            val username = binding.etUsername.text.toString()
            val password = binding.etPassword.text.toString()
            
            if (username.isNotEmpty() && password.isNotEmpty()) {
                // TODO: Implement login logic
                println("Login: $username")
            }
        }

        binding.btnSupport.setOnClickListener {
            // TODO: Open support dialog
            println("Support requested")
        }
    }
}
