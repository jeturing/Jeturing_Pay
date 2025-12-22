package com.stripe.example.network

import com.stripe.example.BuildConfig
import com.stripe.example.model.RegistrationResponse
import com.stripe.stripeterminal.external.models.ConnectionTokenException
import okhttp3.OkHttpClient
import retrofit2.Callback
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.IOException

/**
 * The `ApiClient` is a singleton object used to make calls to our backend and return their results
 */
object ApiClient {

    private val client = OkHttpClient.Builder()
        .build()
    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.EXAMPLE_BACKEND_URL)
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    private val service: BackendService = retrofit.create(BackendService::class.java)

    // Store the current connected account ID
    var connectedAccountId: String? = null

    @Throws(ConnectionTokenException::class)
    internal fun createConnectionToken(): String {
        try {
            val result = service.getConnectionToken(connectedAccountId).execute()
            if (result.isSuccessful && result.body() != null) {
                return result.body()!!.secret
            } else {
                throw ConnectionTokenException("Creating connection token failed")
            }
        } catch (e: IOException) {
            throw ConnectionTokenException("Creating connection token failed", e)
        }
    }

    @Throws(Exception::class)
    internal fun registerUser(
        fullName: String,
        email: String,
        phone: String,
        businessName: String
    ): RegistrationResponse {
        try {
            val result = service.registerUser(fullName, email, phone, businessName).execute()
            if (result.isSuccessful && result.body() != null) {
                val response = result.body()!!
                // Store the connected account ID for future API calls
                connectedAccountId = response.stripeAccountId
                return response
            } else {
                throw Exception("User registration failed")
            }
        } catch (e: IOException) {
            throw Exception("User registration failed", e)
        }
    }

    @Throws(Exception::class)
    internal fun createLocation(
        displayName: String,
        line1: String,
        line2: String?,
        city: String?,
        postalCode: String?,
        state: String?,
        country: String,
    ) {
        try {
            val result = service.createLocation(
                displayName,
                line1,
                line2,
                city,
                postalCode,
                state,
                country,
                connectedAccountId
            ).execute()
            if (result.isSuccessful.not()) {
                throw Exception("Creating location failed")
            }
        } catch (e: IOException) {
            throw Exception("Creating location failed", e)
        }
    }

    internal fun capturePaymentIntent(id: String) {
        service.capturePaymentIntent(id, connectedAccountId).execute()
    }

    internal fun cancelPaymentIntent(
        id: String,
        callback: Callback<Void>
    ) {
        service.cancelPaymentIntent(id, connectedAccountId).enqueue(callback)
    }
}
