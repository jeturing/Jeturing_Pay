package com.jeturing.pay.terminal.network

import com.jeturing.pay.terminal.BuildConfig
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

/**
 * Cliente API para comunicación con el backend de Jeturing
 */
interface ApiService {

    @POST("stripe/terminal/connection_token")
    suspend fun getConnectionToken(
        @Header("x-api-key") apiKey: String = "*963.Abcd"
    ): ConnectionTokenResponse

    @POST("stripe/payment_intents")
    suspend fun createPaymentIntent(
        @Header("x-api-key") apiKey: String = "*963.Abcd",
        @Body request: CreatePaymentIntentRequest
    ): PaymentIntentResponse

    @POST("stripe/payment_intents/{id}/capture")
    suspend fun capturePaymentIntent(
        @Header("x-api-key") apiKey: String = "*963.Abcd",
        @Path("id") paymentIntentId: String
    ): PaymentIntentResponse

    @GET("stripe/payments")
    suspend fun getPaymentHistory(
        @Header("x-api-key") apiKey: String = "*963.Abcd",
        @Query("limit") limit: Int = 50
    ): List<PaymentRecord>
}

// Data classes
data class ConnectionTokenResponse(
    val secret: String
)

data class CreatePaymentIntentRequest(
    val amount: Int,
    val currency: String,
    val description: String = "",
    val payment_method_types: List<String> = listOf("card_present"),
    val capture_method: String = "automatic"
)

data class PaymentIntentResponse(
    val id: String,
    val clientSecret: String,
    val amount: Int,
    val currency: String,
    val status: String
)

data class PaymentRecord(
    val id: String,
    val amount: Int,
    val currency: String,
    val status: String,
    val description: String?,
    val created: Long,
    val customerName: String?
)

/**
 * Singleton del cliente API
 */
object ApiClient {

    private const val API_KEY = "*963.Abcd"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val apiKeyInterceptor = Interceptor { chain ->
        val request = chain.request().newBuilder()
            .addHeader("x-api-key", API_KEY)
            .addHeader("Content-Type", "application/json")
            .build()
        chain.proceed(request)
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(apiKeyInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.BACKEND_URL + "/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    private val apiService = retrofit.create(ApiService::class.java)

    val instance: ApiClientWrapper = ApiClientWrapper(apiService)
}

/**
 * Wrapper para simplificar llamadas a la API
 */
class ApiClientWrapper(private val api: ApiService) {

    suspend fun getConnectionToken(): ConnectionTokenResponse {
        return api.getConnectionToken()
    }

    suspend fun createPaymentIntent(
        amount: Int,
        currency: String,
        description: String = ""
    ): PaymentIntentResponse {
        return api.createPaymentIntent(
            request = CreatePaymentIntentRequest(
                amount = amount,
                currency = currency,
                description = description
            )
        )
    }

    suspend fun capturePaymentIntent(paymentIntentId: String): PaymentIntentResponse {
        return api.capturePaymentIntent(paymentIntentId = paymentIntentId)
    }

    suspend fun getPaymentHistory(): List<PaymentRecord> {
        return api.getPaymentHistory()
    }
}
