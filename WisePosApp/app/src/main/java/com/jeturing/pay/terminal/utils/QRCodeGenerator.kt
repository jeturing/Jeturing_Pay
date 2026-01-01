package com.jeturing.pay.terminal.utils

import android.graphics.Bitmap
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import java.util.EnumMap

/**
 * QRCodeGenerator - Generador de códigos QR
 * 
 * Utiliza ZXing para generar códigos QR a partir de texto.
 * Útil para recibos, transacciones y enlaces de pago.
 */
object QRCodeGenerator {
    
    /**
     * Genera un código QR a partir de un texto
     * 
     * @param text Texto/contenido para codificar en QR
     * @param size Tamaño del QR en píxeles (default 512x512)
     * @return Bitmap con el código QR generado
     */
    fun generateQRCode(text: String, size: Int = 512): Bitmap? {
        return try {
            val hints: MutableMap<EncodeHintType, Any> = EnumMap(EncodeHintType::class.java)
            hints[EncodeHintType.MARGIN] = 2 // Margen de 2 píxeles

            val writer = QRCodeWriter()
            val bitMatrix = writer.encode(text, BarcodeFormat.QR_CODE, size, size, hints)
            
            val width = bitMatrix.width
            val height = bitMatrix.height
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)

            for (x in 0 until width) {
                for (y in 0 until height) {
                    bitmap.setPixel(x, y, if (bitMatrix[x, y]) -0x1000000 else -0x1)
                }
            }

            bitmap
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Genera un QR para una transacción
     * 
     * @param transactionId ID de la transacción
     * @param amount Monto de la transacción
     * @param receiptUrl URL del recibo digital
     * @return Bitmap con el código QR
     */
    fun generateTransactionQR(
        transactionId: String,
        amount: Double,
        receiptUrl: String
    ): Bitmap? {
        val qrData = "TXN:$transactionId|AMOUNT:$amount|RECEIPT:$receiptUrl"
        return generateQRCode(qrData, 512)
    }

    /**
     * Genera un QR para un enlace de pago
     * 
     * @param paymentLink URL del enlace de pago
     * @return Bitmap con el código QR
     */
    fun generatePaymentLinkQR(paymentLink: String): Bitmap? {
        return generateQRCode(paymentLink, 512)
    }
}
