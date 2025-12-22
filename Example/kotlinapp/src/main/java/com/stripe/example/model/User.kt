package com.stripe.example.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

/**
 * User data model for Jeturing Pay registration
 */
@Parcelize
data class User(
    val fullName: String,
    val email: String,
    val phone: String,
    val businessName: String,
    val stripeAccountId: String? = null
) : Parcelable
