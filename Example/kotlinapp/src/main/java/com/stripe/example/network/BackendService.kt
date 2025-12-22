package com.stripe.example.network

import com.stripe.example.model.ConnectionToken
import com.stripe.example.model.RegistrationResponse
import retrofit2.Call
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST
import retrofit2.http.Header

/**
 * The `BackendService` interface handles the two simple calls we need to make to our backend.
 */
interface BackendService {

    /**
     * Get a connection token string from the backend
     */
    @POST("connection_token")
    fun getConnectionToken(
        @Header("Stripe-Account") stripeAccount: String? = null
    ): Call<ConnectionToken>

    /**
     * Register a new user for Jeturing Pay
     */
    @FormUrlEncoded
    @POST("register_user")
    fun registerUser(
        @Field("full_name") fullName: String,
        @Field("email") email: String,
        @Field("phone") phone: String,
        @Field("business_name") businessName: String
    ): Call<RegistrationResponse>

    /**
     * Create a new reader location
     */
    @FormUrlEncoded
    @POST("create_location")
    fun createLocation(
        @Field("display_name") displayName: String,
        @Field("address[line1]") line1: String,
        @Field("address[line2]") line2: String?,
        @Field("address[city]") city: String?,
        @Field("address[postal_code]") postalCode: String?,
        @Field("address[state]") state: String?,
        @Field("address[country]") country: String,
        @Header("Stripe-Account") stripeAccount: String? = null
    ): Call<Void>

    /**
     * Capture a specific payment intent on our backend
     */
    @FormUrlEncoded
    @POST("capture_payment_intent")
    fun capturePaymentIntent(
        @Field("payment_intent_id") id: String,
        @Header("Stripe-Account") stripeAccount: String? = null
    ): Call<Void>

    /**
     * Cancel a specific payment intent on our backend
     */
    @FormUrlEncoded
    @POST("cancel_payment_intent")
    fun cancelPaymentIntent(
        @Field("payment_intent_id") id: String,
        @Header("Stripe-Account") stripeAccount: String? = null
    ): Call<Void>
}
