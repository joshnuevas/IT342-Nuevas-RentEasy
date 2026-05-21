package com.example.it342_mobile_auth.features.auth

import android.content.Intent
import android.os.Bundle
import android.util.Base64
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.example.it342_mobile_auth.R
import com.example.it342_mobile_auth.core.network.RetrofitClient
import com.example.it342_mobile_auth.features.dashboard.DashboardActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import kotlinx.coroutines.launch
import org.json.JSONObject

class MainActivity : AppCompatActivity() {
    private lateinit var googleClient: GoogleSignInClient

    private val googleLoginLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            val idToken = account.idToken
            if (idToken.isNullOrBlank()) {
                Toast.makeText(this, "Google client ID is not configured correctly", Toast.LENGTH_SHORT).show()
                return@registerForActivityResult
            }
            loginWithGoogleToken(idToken, account.email.orEmpty())
        } catch (exception: ApiException) {
            Toast.makeText(this, "Google sign-in cancelled or failed", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val etEmail = findViewById<EditText>(R.id.etLoginEmail)
        val etPass = findViewById<EditText>(R.id.etLoginPassword)
        val btnLogin = findViewById<Button>(R.id.btnLogin)
        val btnGoogleLogin = findViewById<Button>(R.id.btnGoogleLogin)
        val btnRegister = findViewById<TextView>(R.id.btnGoToRegister)
        val googleOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestIdToken(getString(R.string.google_web_client_id))
            .build()
        googleClient = GoogleSignIn.getClient(this, googleOptions)

        btnRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPass.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this@MainActivity, "Please enter your email and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    val response = RetrofitClient.instance.loginUser(LoginRequest(email, password))
                    if (response.isSuccessful && response.body() != null) {
                        val token = response.body()!!.string()
                        val prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE)
                        prefs.edit()
                            .putString("jwt_token", token)
                            .putString("user_email", email)
                            .apply()

                        startActivity(Intent(this@MainActivity, DashboardActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(this@MainActivity, "Login Failed", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@MainActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        btnGoogleLogin.setOnClickListener {
            googleClient.signOut().addOnCompleteListener {
                googleLoginLauncher.launch(googleClient.signInIntent)
            }
        }
    }

    private fun loginWithGoogleToken(idToken: String, email: String) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.loginWithGoogle(GoogleAuthRequest(idToken))
                if (response.isSuccessful && response.body() != null) {
                    val token = response.body()!!.string()
                    val savedEmail = emailFromJwt(token).ifBlank { email }
                    getSharedPreferences("AppPrefs", MODE_PRIVATE)
                        .edit()
                        .putString("jwt_token", token)
                        .putString("user_email", savedEmail)
                        .apply()

                    startActivity(Intent(this@MainActivity, DashboardActivity::class.java))
                    finish()
                } else {
                    val message = response.errorBody()?.string()?.ifBlank { "Google login failed" } ?: "Google login failed"
                    Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
                }
            } catch (exception: Exception) {
                Toast.makeText(this@MainActivity, "Error: ${exception.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun emailFromJwt(token: String): String {
        return try {
            val payload = token.split(".").getOrNull(1).orEmpty()
            if (payload.isBlank()) return ""
            val decoded = Base64.decode(payload, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
            JSONObject(String(decoded, Charsets.UTF_8)).optString("sub", "")
        } catch (exception: Exception) {
            ""
        }
    }
}
