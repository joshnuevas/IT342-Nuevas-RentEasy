package com.example.it342_mobile_auth.core.network

import com.example.it342_mobile_auth.features.auth.AuthApi
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    const val BASE_URL = "http://10.0.2.2:8080/" // Emulator localhost

    fun mobilePaymentReturnUrl(status: String, reference: String): String {
        return "${BASE_URL}api/payments/paymongo/mobile/$status?reference=$reference"
    }

    val instance: AuthApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }
}
