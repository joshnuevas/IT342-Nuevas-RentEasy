package com.example.it342_mobile_auth.features.auth

import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("/api/auth/register")
    suspend fun registerUser(@Body request: RegisterRequest): Response<ResponseBody>

    @POST("/api/auth/login")
    suspend fun loginUser(@Body request: LoginRequest): Response<ResponseBody>
}
