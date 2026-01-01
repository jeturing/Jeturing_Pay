package com.jeturing.pay.terminal

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivityPaymentStatusBinding

class PaymentStatusActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPaymentStatusBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPaymentStatusBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        simulatePaymentProcessing()
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener {
            finish()
        }
    }

    private fun simulatePaymentProcessing() {
        // Simulate payment processing
        Handler(Looper.getMainLooper()).postDelayed({
            binding.tvStatus.text = "Pago Exitoso"
            binding.tvDetails.text = "Tu pago se ha procesado correctamente"
            binding.ivStatus.setImageResource(R.drawable.ic_check_circle)
        }, 3000)
    }
}
