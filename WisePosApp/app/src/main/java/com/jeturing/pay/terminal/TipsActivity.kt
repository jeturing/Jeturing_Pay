package com.jeturing.pay.terminal

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivityTipsBinding

class TipsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityTipsBinding
    private var totalAmount: Double = 0.0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTipsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        totalAmount = intent.getDoubleExtra("total_amount", 0.0)
        binding.tvTotal.text = "$${String.format("%.2f", totalAmount)}"

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnTip15.setOnClickListener {
            processTip(0.15)
        }

        binding.btnTip18.setOnClickListener {
            processTip(0.18)
        }

        binding.btnTip20.setOnClickListener {
            processTip(0.20)
        }
    }

    private fun processTip(percentage: Double) {
        val tipAmount = totalAmount * percentage
        val totalWithTip = totalAmount + tipAmount
        // TODO: Process payment with tip
        println("Tip: ${"%.2f".format(tipAmount)}, Total: ${"%.2f".format(totalWithTip)}")
    }
}
