package com.example.it342_mobile_auth.features.auth

import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface AuthApi {
    @POST("/api/auth/register")
    suspend fun registerUser(@Body request: RegisterRequest): Response<ResponseBody>

    @POST("/api/auth/login")
    suspend fun loginUser(@Body request: LoginRequest): Response<ResponseBody>

    @GET("/api/user/profile")
    suspend fun getProfile(@Header("Authorization") token: String): Response<UserDto>

    @PUT("/api/user/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: UserProfileRequest
    ): Response<UserDto>

    @GET("/api/products/all-approved")
    suspend fun getApprovedProducts(): Response<List<ProductDto>>

    @GET("/api/products")
    suspend fun getAllProducts(@Header("Authorization") token: String): Response<List<ProductDto>>

    @GET("/api/products/pending")
    suspend fun getPendingProducts(@Header("Authorization") token: String): Response<List<ProductDto>>

    @POST("/api/products")
    suspend fun createProduct(
        @Header("Authorization") token: String,
        @Body request: ProductRequest
    ): Response<ProductResponse>

    @PUT("/api/products/{id}/status")
    suspend fun updateProductStatus(
        @Header("Authorization") token: String,
        @Path("id") id: Long,
        @Body request: StatusRequest
    ): Response<ResponseBody>

    @DELETE("/api/products/{id}")
    suspend fun deleteProduct(
        @Header("Authorization") token: String,
        @Path("id") id: Long
    ): Response<ResponseBody>

    @GET("/api/cart")
    suspend fun getCart(
        @Header("Authorization") token: String,
        @Query("email") email: String
    ): Response<List<CartItemDto>>

    @POST("/api/cart/add")
    suspend fun addCartItem(
        @Header("Authorization") token: String,
        @Body request: CartAddRequest
    ): Response<ResponseBody>

    @PUT("/api/cart/{id}/days")
    suspend fun updateCartDays(
        @Header("Authorization") token: String,
        @Path("id") id: Long,
        @Body request: DaysRequest
    ): Response<ResponseBody>

    @DELETE("/api/cart/{id}")
    suspend fun deleteCartItem(
        @Header("Authorization") token: String,
        @Path("id") id: Long
    ): Response<ResponseBody>

    @POST("/api/payments/paymongo/checkout")
    suspend fun createPayMongoCheckout(
        @Header("Authorization") token: String,
        @Body request: PaymentCheckoutRequest
    ): Response<PaymentCheckoutResponse>

    @POST("/api/orders")
    suspend fun createOrder(
        @Header("Authorization") token: String,
        @Body request: PaymentCheckoutRequest
    ): Response<OrderDto>

    @GET("/api/orders/my")
    suspend fun getMyOrders(@Header("Authorization") token: String): Response<List<OrderDto>>

    @GET("/api/orders")
    suspend fun getAllOrders(@Header("Authorization") token: String): Response<List<OrderDto>>

    @PUT("/api/orders/{orderNumber}/status")
    suspend fun updateOrderStatus(
        @Header("Authorization") token: String,
        @Path("orderNumber") orderNumber: String,
        @Body request: OrderStatusRequest
    ): Response<OrderDto>
}
