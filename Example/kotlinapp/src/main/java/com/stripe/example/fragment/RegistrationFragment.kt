package com.stripe.example.fragment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.stripe.example.NavigationListener
import com.stripe.example.R
import com.stripe.example.network.ApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * The `RegistrationFragment` handles user registration for Jeturing Pay
 */
class RegistrationFragment : Fragment() {

    companion object {
        const val TAG = "com.stripe.example.fragment.RegistrationFragment"
    }

    private lateinit var fullNameInput: TextInputEditText
    private lateinit var emailInput: TextInputEditText
    private lateinit var phoneInput: TextInputEditText
    private lateinit var businessNameInput: TextInputEditText
    private lateinit var registerButton: MaterialButton
    private lateinit var progressBar: ProgressBar

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_registration, container, false)

        fullNameInput = view.findViewById(R.id.full_name_input)
        emailInput = view.findViewById(R.id.email_input)
        phoneInput = view.findViewById(R.id.phone_input)
        businessNameInput = view.findViewById(R.id.business_name_input)
        registerButton = view.findViewById(R.id.register_button)
        progressBar = view.findViewById(R.id.registration_progress)

        registerButton.setOnClickListener {
            handleRegistration()
        }

        return view
    }

    private fun handleRegistration() {
        val fullName = fullNameInput.text?.toString()?.trim() ?: ""
        val email = emailInput.text?.toString()?.trim() ?: ""
        val phone = phoneInput.text?.toString()?.trim() ?: ""
        val businessName = businessNameInput.text?.toString()?.trim() ?: ""

        // Validate inputs
        if (fullName.isEmpty() || email.isEmpty() || phone.isEmpty() || businessName.isEmpty()) {
            Toast.makeText(requireContext(), "Please fill in all fields", Toast.LENGTH_SHORT).show()
            return
        }

        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            Toast.makeText(requireContext(), "Please enter a valid email", Toast.LENGTH_SHORT).show()
            return
        }

        // Show progress and disable button
        progressBar.visibility = View.VISIBLE
        registerButton.isEnabled = false

        // Perform registration
        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.registerUser(fullName, email, phone, businessName)
                }

                if (response.success) {
                    Toast.makeText(
                        requireContext(),
                        "Registration successful! Welcome to Jeturing Pay",
                        Toast.LENGTH_LONG
                    ).show()

                    // Navigate to the main terminal screen
                    (activity as? NavigationListener)?.onRequestExitWorkflow()
                } else {
                    Toast.makeText(
                        requireContext(),
                        "Registration failed: ${response.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    requireContext(),
                    "Registration failed: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            } finally {
                progressBar.visibility = View.GONE
                registerButton.isEnabled = true
            }
        }
    }
}
