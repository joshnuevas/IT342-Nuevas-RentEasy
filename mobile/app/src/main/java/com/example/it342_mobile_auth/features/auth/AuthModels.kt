package com.example.it342_mobile_auth.features.auth

import com.google.gson.annotations.SerializedName

data class LoginRequest(val email: String, val password: String)

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String,
    val phone: String? = null
)

data class UserDto(
    val userID: Long? = null,
    val email: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val phone: String? = null,
    val role: String? = null
)

data class UserProfileRequest(
    val firstName: String,
    val lastName: String,
    val phone: String
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
    @SerializedName("days")
    val days: Int? = null,
    val userEmail: String? = null
)

data class CartAddRequest(val productId: Long, val userEmail: String)

data class DaysRequest(val days: Int)

data class PaymentCheckoutItem(
    val productId: Long?,
    val name: String?,
    val description: String?,
    val price: Double?,
    val days: Int,
    val imageUrl: String?
)

data class PaymentDeliveryDetails(
    val name: String,
    val email: String,
    val phone: String,
    val address: String,
    val city: String,
    val zip: String
)

data class PaymentCheckoutRequest(
    val orderNumber: String,
    val delivery: PaymentDeliveryDetails,
    val subtotal: Double,
    val serviceFee: Double,
    val total: Double,
    val items: List<PaymentCheckoutItem>,
    val successUrl: String? = null,
    val cancelUrl: String? = null
)

data class PaymentCheckoutResponse(
    val checkoutUrl: String? = null,
    val sessionId: String? = null,
    val referenceNumber: String? = null
)

data class OrderItemDto(
    val productId: Long? = null,
    val productName: String? = null,
    val price: Double? = null,
    val days: Int? = null
)

data class OrderDto(
    val orderNumber: String? = null,
    val subtotal: Double? = null,
    val serviceFee: Double? = null,
    val total: Double? = null,
    val status: String? = null,
    val customerEmail: String? = null,
    val createdAt: String? = null,
    val items: List<OrderItemDto>? = null
)

data class OrderStatusRequest(val status: String)
