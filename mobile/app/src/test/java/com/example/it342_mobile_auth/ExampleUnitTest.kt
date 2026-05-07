package com.example.it342_mobile_auth

import org.junit.Test

import org.junit.Assert.*
import com.example.it342_mobile_auth.features.auth.LoginRequest
import com.example.it342_mobile_auth.features.auth.RegisterRequest

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
    @Test
    fun authModelsKeepSubmittedCredentials() {
        val login = LoginRequest("ana@example.com", "secret")
        val registration = RegisterRequest("Ana", "Santos", "ana@example.com", "secret")

        assertEquals("ana@example.com", login.email)
        assertEquals("secret", login.password)
        assertEquals("Ana", registration.firstName)
        assertEquals("Santos", registration.lastName)
    }
}
