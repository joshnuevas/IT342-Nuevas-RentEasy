package com.example.it342_mobile_auth

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val firstName: String, val lastName: String, val email: String, val password: String)