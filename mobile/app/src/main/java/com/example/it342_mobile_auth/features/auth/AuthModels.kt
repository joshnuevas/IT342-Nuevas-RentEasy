package com.example.it342_mobile_auth.features.auth

data class LoginRequest(val email: String, val password: String)

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String
)

data class UserDto(
    val userID: Long? = null,
    val email: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val role: String? = null
)

data class ProductDto(
    val productId: Long? = null,
    val name: String? = null,
    val description: String? = null,
    val price: Double? = null,
    val stock: Int? = null,
    val category: String? = null,
    val imageUrl: String? = null,
    val status: String? = null,
    val owner: UserDto? = null
)

data class ProductRequest(
    val name: String,
    val description: String,
    val price: Double,
    val stock: Int,
    val category: String,
    val imageUrl: String,
    val ownerEmail: String
)

data class ProductResponse(val success: Boolean? = null, val product: ProductDto? = null)

data class StatusRequest(val status: String)

data class CartItemDto(
    val id: Long? = null,
    val product: ProductDto? = null,
    val quantity: Int? = null,
    val userEmail: String? = null
)

data class CartAddRequest(val productId: Long, val userEmail: String)

data class QuantityRequest(val quantity: Int)

data class PaymentCheckoutItem(
    val productId: Long?,
    val name: String?,
    val description: String?,
    val price: Double?,
    val quantity: Int,
    val imageUrl: String?
)

data class PaymentShippingDetails(
    val name: String,
    val email: String,
    val phone: String,
    val address: String,
    val city: String,
    val zip: String
)

data class PaymentCheckoutRequest(
    val orderNumber: String,
    val shipping: PaymentShippingDetails,
    val subtotal: Double,
    val serviceFee: Double,
    val total: Double,
    val items: List<PaymentCheckoutItem>
)

data class PaymentCheckoutResponse(
    val checkoutUrl: String? = null,
    val sessionId: String? = null,
    val referenceNumber: String? = null
)
