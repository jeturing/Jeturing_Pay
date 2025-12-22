package com.stripe.example.model

/**
 * Response from the registration endpoint
 */
data class RegistrationResponse(
    val success: Boolean,
    val message: String,
    val userId: String?,
    val stripeAccountId: String?
)
