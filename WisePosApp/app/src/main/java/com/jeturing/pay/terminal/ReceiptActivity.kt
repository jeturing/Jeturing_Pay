package com.jeturing.pay.terminal

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.jeturing.pay.terminal.databinding.ActivityReceiptBinding
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ReceiptActivity : AppCompatActivity() {

    private lateinit var binding: ActivityReceiptBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityReceiptBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        displayReceipt()
    }

    private fun setupUI() {
        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnSendEmail.setOnClickListener {
            sendReceiptEmail()
        }

        binding.btnDone.setOnClickListener {
            finish()
        }
    }

    private fun displayReceipt() {
        val total = intent.getDoubleExtra("total", 0.0)
        val currentDate = SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())

        binding.tvTotal.text = "$${String.format("%.2f", total)}"
        binding.tvDate.text = currentDate

        // TODO: Generate QR code
        // binding.ivQrCode.setImageBitmap(generateQRCode(receiptData))
    }

    private fun sendReceiptEmail() {
        // TODO: Send receipt via email
        println("Sending receipt email...")
    }
}
