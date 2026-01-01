package com.jeturing.pay.terminal

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.jeturing.pay.terminal.network.PaymentRecord
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

/**
 * Adaptador para la lista de historial de pagos
 */
class PaymentHistoryAdapter : ListAdapter<PaymentRecord, PaymentHistoryAdapter.PaymentViewHolder>(PaymentDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PaymentViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_payment, parent, false)
        return PaymentViewHolder(view)
    }

    override fun onBindViewHolder(holder: PaymentViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class PaymentViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvAmount: TextView = itemView.findViewById(R.id.tvAmount)
        private val tvDescription: TextView = itemView.findViewById(R.id.tvDescription)
        private val tvDate: TextView = itemView.findViewById(R.id.tvDate)
        private val tvStatus: TextView = itemView.findViewById(R.id.tvStatus)

        private val currencyFormatter = NumberFormat.getCurrencyInstance(Locale.US)
        private val dateFormatter = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())

        fun bind(payment: PaymentRecord) {
            // Monto
            tvAmount.text = currencyFormatter.format(payment.amount / 100.0)
            
            // Descripción
            tvDescription.text = payment.description ?: payment.customerName ?: "Pago"
            
            // Fecha
            tvDate.text = dateFormatter.format(Date(payment.created * 1000))
            
            // Estado
            tvStatus.text = when (payment.status) {
                "succeeded" -> "Completado"
                "pending" -> "Pendiente"
                "canceled" -> "Cancelado"
                else -> payment.status
            }
            
            val statusColor = when (payment.status) {
                "succeeded" -> R.color.success_green
                "pending" -> R.color.warning_orange
                else -> R.color.error_red
            }
            tvStatus.setTextColor(itemView.context.getColor(statusColor))
        }
    }

    class PaymentDiffCallback : DiffUtil.ItemCallback<PaymentRecord>() {
        override fun areItemsTheSame(oldItem: PaymentRecord, newItem: PaymentRecord): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: PaymentRecord, newItem: PaymentRecord): Boolean {
            return oldItem == newItem
        }
    }
}
