package com.example.it342_mobile_auth.features.dashboard

import android.animation.LayoutTransition
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.InputType
import android.text.TextWatcher
import android.util.Base64
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.HorizontalScrollView
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.example.it342_mobile_auth.core.network.RetrofitClient
import com.example.it342_mobile_auth.features.auth.CartAddRequest
import com.example.it342_mobile_auth.features.auth.CartItemDto
import com.example.it342_mobile_auth.features.auth.OrderDto
import com.example.it342_mobile_auth.features.auth.OrderStatusRequest
import com.example.it342_mobile_auth.features.auth.PaymentCheckoutItem
import com.example.it342_mobile_auth.features.auth.PaymentCheckoutRequest
import com.example.it342_mobile_auth.features.auth.PaymentDeliveryDetails
import com.example.it342_mobile_auth.features.auth.ProductDto
import com.example.it342_mobile_auth.features.auth.ProductRequest
import com.example.it342_mobile_auth.features.auth.DaysRequest
import com.example.it342_mobile_auth.features.auth.StatusRequest
import com.example.it342_mobile_auth.features.auth.UserDto
import com.example.it342_mobile_auth.features.auth.UserProfileRequest
import com.example.it342_mobile_auth.features.auth.MainActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.net.URL
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DashboardActivity : AppCompatActivity() {
    private lateinit var prefs: SharedPreferences
    private lateinit var root: LinearLayout
    private lateinit var navRow: LinearLayout
    private lateinit var content: LinearLayout
    private var activeTab = "catalog"
    private var selectedListingImageDataUrl = ""
    private var listingImagePreview: ImageView? = null
    private var listingImageStatus: TextView? = null

    private val api = RetrofitClient.instance
    private val categories = listOf("Cameras", "Tools", "Audio", "Outdoor", "Events")
    private val peso = NumberFormat.getCurrencyInstance(Locale("en", "PH"))

    private val brown = Color.rgb(74, 52, 40)
    private val ink = Color.rgb(62, 43, 34)
    private val caramel = Color.rgb(140, 106, 72)
    private val canvas = Color.rgb(245, 242, 240)
    private val coffee = Color.rgb(111, 77, 55)
    private val mocha = Color.rgb(176, 138, 104)
    private val line = Color.rgb(231, 217, 200)
    private val soft = Color.rgb(251, 247, 242)
    private val danger = Color.rgb(190, 60, 52)

    private val token: String
        get() = prefs.getString("jwt_token", "") ?: ""

    private val email: String
        get() = prefs.getString("user_email", "") ?: ""

    private val listingImagePicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri == null) return@registerForActivityResult
        lifecycleScope.launch {
            val result = withContext(Dispatchers.IO) { loadPickedImage(uri) }
            if (result == null) {
                Toast.makeText(this@DashboardActivity, "Image could not be loaded", Toast.LENGTH_SHORT).show()
                return@launch
            }

            selectedListingImageDataUrl = result.dataUrl
            listingImagePreview?.apply {
                setImageBitmap(result.bitmap)
                visibility = View.VISIBLE
            }
            listingImageStatus?.text = "Photo selected and compressed"
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE)
        if (token.isBlank()) {
            goToLogin()
            return
        }

        buildShell()
        if (handlePaymentReturn(intent)) return
        if (isAdmin()) showAdmin("dashboard") else showCatalog()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handlePaymentReturn(intent)
    }

    private fun buildShell() {
        root = LinearLayout(this).apply {
            id = View.generateViewId()
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(canvas)
        }

        setContentView(root)
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        root.addView(buildHeader())
        root.addView(buildNav())

        val scrollView = ScrollView(this).apply {
            isFillViewport = false
            layoutParams = LinearLayout.LayoutParams(match, 0, 1f)
        }
        content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutTransition = LayoutTransition()
            setPadding(dp(16), dp(14), dp(16), dp(24))
        }
        scrollView.addView(content, FrameLayout.LayoutParams(match, wrap))
        root.addView(scrollView)
    }

    private fun buildHeader(): View {
        return LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(16), dp(12), dp(16), dp(10))
            setBackgroundColor(Color.WHITE)

            addView(TextView(context).apply {
                text = "R"
                gravity = Gravity.CENTER
                textSize = 16f
                setTypeface(Typeface.DEFAULT, Typeface.BOLD)
                setTextColor(Color.WHITE)
                background = rounded(brown, dp(11), mocha, 1)
            }, LinearLayout.LayoutParams(dp(38), dp(38)).apply {
                rightMargin = dp(10)
            })

            addView(LinearLayout(context).apply {
                orientation = LinearLayout.VERTICAL
                addView(TextView(context).apply {
                    text = "RentEasy"
                    textSize = 18f
                    setTypeface(Typeface.DEFAULT, Typeface.BOLD)
                    setTextColor(brown)
                })
                addView(TextView(context).apply {
                    text = "Rental workspace"
                    textSize = 12f
                    setTextColor(caramel)
                })
            }, LinearLayout.LayoutParams(0, wrap, 1f))

            addView(Button(context).apply {
                text = "Logout"
                setAllCaps(false)
                textSize = 13f
                minHeight = 0
                minWidth = 0
                setPadding(dp(14), 0, dp(14), 0)
                setTextColor(Color.WHITE)
                background = rounded(brown, dp(12))
                setOnClickListener {
                    prefs.edit().clear().apply()
                    goToLogin()
                }
            }, LinearLayout.LayoutParams(wrap, dp(40)))
        }
    }

    private fun buildNav(): View {
        navRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(dp(14), dp(8), dp(14), dp(10))
            setBackgroundColor(Color.WHITE)
        }

        val scroll = HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            addView(navRow)
        }
        renderNav()
        return scroll
    }

    private fun renderNav() {
        navRow.removeAllViews()
        val tabs = if (isAdmin()) {
            listOf(
                "dashboard" to "Dashboard",
                "products" to "Products",
                "pending" to "Pending",
                "orders" to "Orders",
                "users" to "Users"
            )
        } else {
            listOf(
                "catalog" to "Catalog",
                "mine" to "My Listings",
                "create" to "List Item",
                "cart" to "Cart",
                "profile" to "Profile"
            )
        }

        tabs.forEach { (id, label) ->
            navRow.addView(chip(label, id == activeTab) {
                if (isAdmin()) {
                    showAdmin(id)
                } else {
                    when (id) {
                        "catalog" -> showCatalog()
                        "mine" -> showMyListings()
                        "create" -> showCreateListing()
                        "cart" -> showCart()
                        "profile" -> showProfile()
                    }
                }
            })
        }
    }

    private fun setTab(tab: String) {
        activeTab = tab
        renderNav()
    }

    private fun showCatalog() {
        setTab("catalog")
        showLoading("Loading products...")
        lifecycleScope.launch {
            try {
                val productsResponse = api.getApprovedProducts()
                val products = productsResponse.body().orEmpty()
                val cart = loadCartSafely()
                renderCatalog(products, cart)
            } catch (exception: Exception) {
                showError("Products could not be loaded. Start the backend and try again.")
            }
        }
    }

    private fun renderCatalog(products: List<ProductDto>, cart: List<CartItemDto>) {
        clearContent()
        val cartIds = cart.mapNotNull { it.product?.productId }.toSet()
        val listContainer = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        val searchInput = input("Search", "Search rentals", "")

        titleCard("RentEasy Catalog", "Product Listing", "${products.count { isCatalogVisible(it) }} items")
        content.addView(searchInput)
        content.addView(spacer(12))
        content.addView(listContainer)

        fun fillList(query: String) {
            listContainer.removeAllViews()
            val visible = products
                .filter { isCatalogVisible(it) }
                .filter {
                    query.isBlank() ||
                        listOf(it.name, it.description, it.category).joinToString(" ").lowercase().contains(query.lowercase())
                }

            if (visible.isEmpty()) {
                listContainer.addView(emptyCard("No approved listings found."))
                return
            }

            visible.forEach { product ->
                listContainer.addView(productCard(product, cartIds.contains(product.productId)))
            }
        }

        searchInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                fillList(s?.toString().orEmpty())
            }
            override fun afterTextChanged(s: Editable?) = Unit
        })

        fillList("")
    }

    private fun productCard(product: ProductDto, inCart: Boolean): View {
        return card().apply {
            addImage(this, product.imageUrl, product.name.orEmpty(), 150)
            addView(TextView(context).apply {
                text = product.name.orEmpty()
                textSize = 17f
                setTypeface(Typeface.DEFAULT, Typeface.BOLD)
                setTextColor(brown)
            })
            addView(TextView(context).apply {
                text = product.category.orEmpty()
                setTextColor(coffee)
                textSize = 12f
                setTypeface(Typeface.DEFAULT, Typeface.BOLD)
                setPadding(0, dp(6), 0, dp(4))
            })
            addView(TextView(context).apply {
                text = "${money(product.price)} / day"
                setTextColor(ink)
                textSize = 15f
                setTypeface(Typeface.DEFAULT, Typeface.BOLD)
            })
            addView(rowButtons(
                button("View Details", false) { showProductDetail(product) },
                button(if (inCart) "In Cart" else "Add to Cart", true) {
                    if (!inCart) addToCart(product)
                }.apply { isEnabled = !inCart }
            ))
        }
    }

    private fun showProductDetail(
        product: ProductDto,
        backAction: () -> Unit = { showCatalog() },
        adminMode: Boolean = false
    ) {
        clearContent()
        val isOwner = ownerEmail(product) == email.lowercase()
        content.addView(button("Back", false) { backAction() }, fullWidthButtonParams())
        content.addView(spacer(8))
        content.addView(card().apply {
            addImage(this, product.imageUrl, product.name.orEmpty(), 205)
            addView(label(product.category.orEmpty(), coffee))
            addView(title(product.name.orEmpty(), 23f))
            addView(body(product.description.orEmpty()))
            addView(infoRow("Price", "${money(product.price)} / day"))
            addView(infoRow("Stock", product.stock?.toString() ?: "0"))
            addView(infoRow("Status", product.status ?: "APPROVED"))
            addView(infoRow("Added by", ownerName(product)))
            addView(infoRow("Owner phone", ownerPhone(product)))
            addView(infoRow("Owner email", ownerDisplayEmail(product)))
            if (!adminMode) {
                addView(rowButtons(
                    button(if (isOwner) "Owned Listing" else "Add to Cart", true) {
                        if (!isOwner) addToCart(product)
                    }.apply { isEnabled = !isOwner },
                    button("Go to Cart", false) { showCart() }
                ))
            }
        })
    }

    private fun addToCart(product: ProductDto) {
        val productId = product.productId ?: return
        lifecycleScope.launch {
            try {
                val response = api.addCartItem(authHeader(), CartAddRequest(productId, email))
                if (response.isSuccessful) {
                    Toast.makeText(this@DashboardActivity, "Added to cart", Toast.LENGTH_SHORT).show()
                    showCart()
                } else {
                    Toast.makeText(this@DashboardActivity, "Could not add item", Toast.LENGTH_SHORT).show()
                }
            } catch (exception: Exception) {
                Toast.makeText(this@DashboardActivity, "Cart error: ${exception.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showMyListings() {
        setTab("mine")
        showLoading("Loading your listings...")
        lifecycleScope.launch {
            try {
                val response = api.getMyProducts(authHeader())
                val listings = response.body().orEmpty()
                renderMyListings(listings)
            } catch (exception: Exception) {
                showError("Your listings could not be loaded.")
            }
        }
    }

    private fun renderMyListings(listings: List<ProductDto>) {
        clearContent()
        titleCard("Owner Center", "My Listings", "${listings.size} items")
        content.addView(button("New Listing", true) { showCreateListing() }, fullWidthButtonParams())
        content.addView(spacer(10))

        if (listings.isEmpty()) {
            content.addView(emptyCard("No listings yet."))
            return
        }

        listings.forEach { product ->
            content.addView(card().apply {
                addImage(this, product.imageUrl, product.name.orEmpty(), 150)
                addView(label(product.status ?: "PENDING", caramel))
                addView(title(product.name.orEmpty(), 18f))
                addView(body(product.description.orEmpty()))
                addView(infoRow("Price", "${money(product.price)} / day"))
                addView(rowButtons(
                    button("View", false) { showProductDetail(product, backAction = { showMyListings() }) },
                    button("Remove", false, danger) { deleteProduct(product) }
                ))
            })
        }
    }

    private fun deleteProduct(product: ProductDto, afterDelete: () -> Unit = { showMyListings() }) {
        val id = product.productId ?: return
        lifecycleScope.launch {
            try {
                val response = api.deleteProduct(authHeader(), id)
                Toast.makeText(
                    this@DashboardActivity,
                    if (response.isSuccessful) "Listing removed" else "Remove failed",
                    Toast.LENGTH_SHORT
                ).show()
                afterDelete()
            } catch (exception: Exception) {
                Toast.makeText(this@DashboardActivity, "Remove error: ${exception.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showCreateListing() {
        setTab("create")
        clearContent()
        selectedListingImageDataUrl = ""
        listingImagePreview = null
        listingImageStatus = null
        titleCard("Owner Listing", "List a Product for Rent")

        val name = input("Product Name", "Enter product name", "")
        val category = Spinner(this).apply {
            adapter = ArrayAdapter(this@DashboardActivity, android.R.layout.simple_spinner_item, categories).apply {
                setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            }
            setPadding(dp(16), 0, dp(48), 0)
            background = rounded(Color.WHITE, dp(12), line, 1)
        }
        val price = input("Rental Price (per day)", "Enter price per day", "", InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL)
        val stock = input("Stock", "Enter available stock", "1", InputType.TYPE_CLASS_NUMBER)
        val description = input("Description", "Describe condition, inclusions, and pickup notes", "")
        description.minLines = 4
        description.gravity = Gravity.TOP or Gravity.START
        description.setPadding(dp(14), dp(12), dp(14), dp(12))
        description.layoutParams = LinearLayout.LayoutParams(match, dp(112)).apply {
            bottomMargin = dp(10)
        }

        content.addView(formCard().apply {
            addView(fieldLabel("Product name"))
            addView(name)
            addView(fieldLabel("Category"))
            addView(category, fieldParams())
            addView(fieldLabel("Rental price"))
            addView(price)
            addView(fieldLabel("Stock"))
            addView(stock)
            addView(fieldLabel("Product photo"))
            addView(imagePickerField())
            addView(fieldLabel("Description"))
            addView(description)
            addView(button("Submit for Approval", true) {
                val selectedCategory = category.selectedItem?.toString().orEmpty()
                createListing(
                    name.text.toString(),
                    selectedCategory,
                    price.text.toString(),
                    stock.text.toString(),
                    selectedListingImageDataUrl,
                    description.text.toString()
                )
            }, fullWidthButtonParams())
        })
    }

    private fun imagePickerField(): View {
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(14), dp(14), dp(14), dp(14))
            background = rounded(soft, dp(12), line, 1)
            layoutParams = LinearLayout.LayoutParams(match, wrap).apply {
                bottomMargin = dp(10)
            }

            val preview = ImageView(context).apply {
                scaleType = ImageView.ScaleType.CENTER_CROP
                visibility = View.GONE
            }
            listingImagePreview = preview
            addView(preview, LinearLayout.LayoutParams(match, dp(140)).apply {
                bottomMargin = dp(10)
            })

            listingImageStatus = TextView(context).apply {
                text = "No photo selected"
                textSize = 13f
                setTextColor(caramel)
                setPadding(0, 0, 0, dp(10))
            }
            addView(listingImageStatus)

            addView(rowButtons(
                button("Choose Photo", true) { listingImagePicker.launch("image/*") },
                button("Clear", false, danger) {
                    selectedListingImageDataUrl = ""
                    listingImagePreview?.visibility = View.GONE
                    listingImageStatus?.text = "No photo selected"
                }
            ))
        }
    }

    private fun createListing(name: String, category: String, price: String, stock: String, imageUrl: String, description: String) {
        if (name.isBlank() || category.isBlank() || price.isBlank() || stock.isBlank() || description.isBlank()) {
            Toast.makeText(this, "Please fill in all listing fields", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            try {
                val request = ProductRequest(
                    name = name.trim(),
                    description = description.trim(),
                    price = price.toDoubleOrNull() ?: 0.0,
                    stock = stock.toIntOrNull() ?: 1,
                    category = category,
                    imageUrl = imageUrl.trim(),
                    ownerEmail = email
                )
                val response = api.createProduct(authHeader(), request)
                if (response.isSuccessful) {
                    Toast.makeText(this@DashboardActivity, "Listing submitted for approval", Toast.LENGTH_SHORT).show()
                    showMyListings()
                } else {
                    Toast.makeText(
                        this@DashboardActivity,
                        listingSubmitError(response.code(), response.errorBody()?.string()),
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (exception: Exception) {
                Toast.makeText(this@DashboardActivity, "Listing error: ${exception.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showCart() {
        setTab("cart")
        showLoading("Loading cart...")
        lifecycleScope.launch {
            try {
                renderCart(loadCartSafely())
            } catch (exception: Exception) {
                showError("Cart could not be loaded.")
            }
        }
    }

    private fun renderCart(items: List<CartItemDto>) {
        clearContent()
        titleCard("Rental Cart", "Shopping Cart", "${items.size} items")

        if (items.isEmpty()) {
            content.addView(emptyCard("No items in cart."))
            content.addView(button("Browse Products", true) { showCatalog() }, fullWidthButtonParams())
            return
        }

        items.forEach { item ->
            val product = item.product
            content.addView(card().apply {
                addView(title(product?.name.orEmpty(), 19f))
                addView(body("${money(product?.price)} / day"))
                val days = cartDays(item)
                addView(infoRow("Rental days", days.toString()))
                addView(rowButtons(
                    button("-", false) { updateCartDays(item, days - 1) },
                    button("+", false) { updateCartDays(item, days + 1) },
                    button("Remove", false, danger) { removeCartItem(item) }
                ))
            })
        }

        val subtotal = cartSubtotal(items)
        val serviceFee = if (items.isNotEmpty()) Math.round(subtotal * 0.05).toDouble() else 0.0
        val total = subtotal + serviceFee
        content.addView(card().apply {
            addView(title("Order Summary", 20f))
            addView(infoRow("Subtotal", money(subtotal)))
            addView(infoRow("Service Fee", money(serviceFee)))
            addView(infoRow("Total", money(total)))
            addView(button("Proceed to Checkout", true) { showCheckout(items) }, fullWidthButtonParams())
        })
    }

    private fun updateCartDays(item: CartItemDto, days: Int) {
        val id = item.id ?: return
        if (days < 1) return
        lifecycleScope.launch {
            try {
                api.updateCartDays(authHeader(), id, DaysRequest(days))
                showCart()
            } catch (exception: Exception) {
                Toast.makeText(this@DashboardActivity, "Rental days update failed", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun removeCartItem(item: CartItemDto) {
        val id = item.id ?: return
        lifecycleScope.launch {
            try {
                api.deleteCartItem(authHeader(), id)
                showCart()
            } catch (exception: Exception) {
                Toast.makeText(this@DashboardActivity, "Remove failed", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showCheckout(items: List<CartItemDto>) {
        clearContent()
        titleCard("Payment", "Checkout")

        val profile = currentProfile()
        val name = input("Full Name", "Enter full name", profile.name)
        val emailInput = input("Email", "Enter email address", profile.email, InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
        val phone = input("Phone", "Enter phone number", profile.phone, InputType.TYPE_CLASS_PHONE)
        val city = input("City", "Enter city", profile.city)
        val address = input("Complete Address", "Enter complete address", profile.address)
        val zip = input("ZIP Code", "Enter ZIP code", profile.zip, InputType.TYPE_CLASS_NUMBER)

        val subtotal = cartSubtotal(items)
        val serviceFee = Math.round(subtotal * 0.05).toDouble()
        val total = subtotal + serviceFee

        content.addView(formCard().apply {
            addView(name)
            addView(emailInput)
            addView(phone)
            addView(city)
            addView(address)
            addView(zip)
        })

        content.addView(card().apply {
            addView(title("Order Summary", 20f))
            items.forEach {
                val days = cartDays(it)
                addView(infoRow("${it.product?.name} x $days days", money((it.product?.price ?: 0.0) * days)))
            }
            addView(infoRow("Total", money(total)))
            addView(button("Pay with PayMongo", true) {
                startPayMongoCheckout(items, name, emailInput, phone, address, city, zip, subtotal, serviceFee, total)
            }, fullWidthButtonParams())
        })
    }

    private fun startPayMongoCheckout(
        items: List<CartItemDto>,
        name: EditText,
        emailInput: EditText,
        phone: EditText,
        address: EditText,
        city: EditText,
        zip: EditText,
        subtotal: Double,
        serviceFee: Double,
        total: Double
    ) {
        val fields = listOf(name, emailInput, phone, address, city, zip)
        if (fields.any { it.text.toString().trim().isBlank() }) {
            Toast.makeText(this, "Please complete checkout details", Toast.LENGTH_SHORT).show()
            return
        }

        val orderNumber = "RE-${SimpleDateFormat("yyyy", Locale.US).format(Date())}-${System.currentTimeMillis().toString().takeLast(5)}"
        val request = PaymentCheckoutRequest(
            orderNumber = orderNumber,
            delivery = PaymentDeliveryDetails(
                name = name.text.toString().trim(),
                email = emailInput.text.toString().trim(),
                phone = phone.text.toString().trim(),
                address = address.text.toString().trim(),
                city = city.text.toString().trim(),
                zip = zip.text.toString().trim()
            ),
            subtotal = subtotal,
            serviceFee = serviceFee,
            total = total,
            items = items.map {
                PaymentCheckoutItem(
                    productId = it.product?.productId,
                    name = it.product?.name,
                    description = it.product?.description,
                    price = it.product?.price,
                    days = cartDays(it),
                    imageUrl = it.product?.imageUrl
                )
            },
            successUrl = RetrofitClient.mobilePaymentReturnUrl("success", orderNumber),
            cancelUrl = RetrofitClient.mobilePaymentReturnUrl("cancel", orderNumber)
        )

        lifecycleScope.launch {
            try {
                val response = api.createPayMongoCheckout(authHeader(), request)
                val checkout = response.body()
                if (response.isSuccessful && checkout?.checkoutUrl != null) {
                    try {
                        api.createOrder(authHeader(), request)
                    } catch (_: Exception) {
                        // Local order history remains as a fallback if the order API is briefly unavailable.
                    }
                    saveOrder(
                        orderNumber,
                        total,
                        "Awaiting PayMongo payment",
                        items.mapNotNull { it.product?.productId }
                    )
                    Toast.makeText(this@DashboardActivity, "Opening PayMongo checkout", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(checkout.checkoutUrl)))
                } else {
                    Toast.makeText(this@DashboardActivity, "PayMongo checkout could not be started", Toast.LENGTH_SHORT).show()
                }
            } catch (exception: Exception) {
                Toast.makeText(this@DashboardActivity, "Payment error: ${exception.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showProfile() {
        setTab("profile")
        clearContent()
        titleCard("Account", "User Profile")
        val profile = currentProfile()

        val name = input("Name", "Enter full name", profile.name)
        val profileEmail = input("Email", "Enter email address", profile.email)
        val phone = input("Phone", "Enter phone number", profile.phone)
        val address = input("Address", "Enter complete address", profile.address)
        val city = input("City", "Enter city", profile.city)
        val zip = input("ZIP Code", "Enter ZIP code", profile.zip)

        lifecycleScope.launch {
            val remoteProfile = loadRemoteProfile()
            if (remoteProfile != null) {
                val remoteName = ownerName(ProductDto(owner = remoteProfile))
                if (remoteName != "Not provided") name.setText(remoteName)
                remoteProfile.email?.let { profileEmail.setText(it) }
                remoteProfile.phone?.let { phone.setText(it) }
            }
        }

        content.addView(formCard().apply {
            addView(name)
            addView(profileEmail)
            addView(phone)
            addView(address)
            addView(city)
            addView(zip)
            addView(button("Save Profile", true) {
                prefs.edit()
                    .putString("profile_name", name.text.toString())
                    .putString("profile_email", profileEmail.text.toString())
                    .putString("profile_phone", phone.text.toString())
                    .putString("profile_address", address.text.toString())
                    .putString("profile_city", city.text.toString())
                    .putString("profile_zip", zip.text.toString())
                    .apply()
                saveRemoteProfile(name.text.toString(), phone.text.toString())
                Toast.makeText(this@DashboardActivity, "Profile saved", Toast.LENGTH_SHORT).show()
            }, fullWidthButtonParams())
        })

        val orderCard = card()
        renderOrderHistory(orderCard, loadOrders(), "No mobile orders yet.")
        content.addView(orderCard)

        lifecycleScope.launch {
            val remoteOrders = loadRemoteOrders()
            if (remoteOrders != null) {
                cacheOrders(remoteOrders)
                renderOrderHistory(orderCard, remoteOrders, "No orders found in the database yet.")
            }
        }
    }

    private fun showAdmin(section: String) {
        setTab(section)
        showLoading("Loading admin workspace...")
        lifecycleScope.launch {
            try {
                val products = api.getAllProducts(authHeader()).body().orEmpty()
                val pending = api.getPendingProducts(authHeader()).body().orEmpty()
                renderAdmin(section, products, pending)
            } catch (exception: Exception) {
                showError("Admin data could not be loaded.")
            }
        }
    }

    private fun renderAdmin(section: String, products: List<ProductDto>, pending: List<ProductDto>) {
        clearContent()
        titleCard("Admin Workspace", when (section) {
            "products" -> "Products"
            "pending" -> "Pending Approval"
            "orders" -> "Orders"
            "users" -> "Users"
            else -> "Dashboard Overview"
        })

        when (section) {
            "products" -> renderAdminProducts(products)
            "pending" -> renderAdminPending(pending)
            "orders" -> renderAdminOrders()
            "users" -> renderAdminUsers()
            else -> renderAdminDashboard(products, pending)
        }
    }

    private fun renderAdminDashboard(products: List<ProductDto>, pending: List<ProductDto>) {
        val orders = loadOrders()
        content.addView(card().apply {
            addView(infoRow("Products", products.size.toString()))
            addView(infoRow("Pending", pending.size.toString()))
            addView(infoRow("Mobile Orders", orders.size.toString()))
            addView(infoRow("Mobile Revenue", money(orders.sumOf { it.total })))
        })
    }

    private fun renderAdminProducts(products: List<ProductDto>) {
        if (products.isEmpty()) {
            content.addView(emptyCard("No products found."))
            return
        }
        products.forEach { product ->
            content.addView(card().apply {
                addView(label(product.status ?: "PENDING", caramel))
                addView(title(product.name.orEmpty(), 20f))
                addView(infoRow("Price", money(product.price)))
                addView(infoRow("Stock", product.stock?.toString() ?: "0"))
                addView(rowButtons(
                    button("View", false) { showProductDetail(product, { showAdmin("products") }, adminMode = true) },
                    button("Remove", false, danger) { deleteProduct(product) { showAdmin("products") } }
                ))
            })
        }
    }

    private fun renderAdminPending(pending: List<ProductDto>) {
        if (pending.isEmpty()) {
            content.addView(emptyCard("No listings awaiting review."))
            return
        }
        pending.forEach { product ->
            content.addView(card().apply {
                addView(title(product.name.orEmpty(), 20f))
                addView(body("Owner: ${product.owner?.firstName.orEmpty()} ${product.owner?.lastName.orEmpty()}"))
                addView(infoRow("Price", money(product.price)))
                addView(rowButtons(
                    button("Approve", true) { reviewProduct(product, "APPROVED") },
                    button("Reject", false, danger) { reviewProduct(product, "REJECTED") }
                ))
            })
        }
    }

    private fun reviewProduct(product: ProductDto, status: String) {
        val id = product.productId ?: return
        lifecycleScope.launch {
            try {
                val response = api.updateProductStatus(authHeader(), id, StatusRequest(status))
                Toast.makeText(
                    this@DashboardActivity,
                    if (response.isSuccessful) "Listing ${status.lowercase()}" else "Review failed",
                    Toast.LENGTH_SHORT
                ).show()
                showAdmin("pending")
            } catch (exception: Exception) {
                Toast.makeText(this@DashboardActivity, "Review error: ${exception.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun renderAdminOrders() {
        val holder = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.addView(holder)
        renderAdminOrderList(holder, loadOrders())

        lifecycleScope.launch {
            val remoteOrders = loadRemoteAllOrders()
            if (remoteOrders != null) {
                renderAdminOrderList(holder, remoteOrders)
            }
        }
    }

    private fun renderAdminOrderList(holder: LinearLayout, orders: List<MobileOrder>) {
        holder.removeAllViews()
        if (orders.isEmpty()) {
            holder.addView(emptyCard("No database orders yet."))
            return
        }
        orders.forEach { order ->
            holder.addView(card().apply {
                addView(title(order.orderNumber, 20f))
                addView(infoRow("Total", money(order.total)))
                addView(infoRow("Status", order.status))
            })
        }
    }

    private fun renderAdminUsers() {
        content.addView(card().apply {
            addView(title("Admin Account", 20f))
            addView(infoRow("Email", email))
            addView(infoRow("Role", "ADMIN"))
        })
    }

    private suspend fun loadCartSafely(): List<CartItemDto> {
        return try {
            api.getCart(authHeader(), email).body().orEmpty()
        } catch (exception: Exception) {
            emptyList()
        }
    }

    private fun cartSubtotal(items: List<CartItemDto>): Double {
        return items.sumOf { (it.product?.price ?: 0.0) * cartDays(it) }
    }

    private fun ownerEmail(product: ProductDto): String {
        return product.owner?.email.orEmpty().lowercase()
    }

    private fun isCatalogVisible(product: ProductDto): Boolean {
        return ownerEmail(product) != email.lowercase() &&
            (product.status ?: "APPROVED") == "APPROVED" &&
            (product.stock ?: 0) > 0
    }

    private fun ownerDisplayEmail(product: ProductDto): String {
        return product.owner?.email.orEmpty().ifBlank { "Not provided" }
    }

    private fun ownerPhone(product: ProductDto): String {
        return product.owner?.phone.orEmpty().ifBlank { "Not provided" }
    }

    private fun ownerName(product: ProductDto): String {
        return listOf(product.owner?.firstName.orEmpty(), product.owner?.lastName.orEmpty())
            .filter { it.isNotBlank() }
            .joinToString(" ")
            .ifBlank { "Not provided" }
    }

    private suspend fun loadRemoteProfile(): UserDto? {
        return try {
            val response = api.getProfile(authHeader())
            if (response.isSuccessful) response.body() else null
        } catch (_: Exception) {
            null
        }
    }

    private fun saveRemoteProfile(name: String, phone: String) {
        lifecycleScope.launch {
            val parts = name.trim().split(Regex("\\s+")).filter { it.isNotBlank() }
            val request = UserProfileRequest(
                firstName = parts.firstOrNull().orEmpty(),
                lastName = parts.drop(1).joinToString(" "),
                phone = phone.trim()
            )

            try {
                api.updateProfile(authHeader(), request)
            } catch (_: Exception) {
                Toast.makeText(
                    this@DashboardActivity,
                    "Saved on phone, but database profile was not updated",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun cartDays(item: CartItemDto): Int = (item.days ?: 1).coerceAtLeast(1)

    private fun markOrderProductsRented(reference: String) {
        val productIds = findOrderProductIds(reference)
        if (productIds.isEmpty()) return

        lifecycleScope.launch {
            productIds.distinct().forEach { productId ->
                try {
                    api.updateProductStatus(authHeader(), productId, StatusRequest("RENTED"))
                } catch (_: Exception) {
                    // Payment is already complete; hiding can be retried by opening the app again.
                }
            }
        }
    }

    private fun findOrderProductIds(reference: String): List<Long> {
        val orders = JSONArray(prefs.getString("mobile_orders", "[]"))
        for (index in 0 until orders.length()) {
            val item = orders.getJSONObject(index)
            if (reference.isNotBlank() && item.optString("orderNumber") == reference) {
                return jsonLongList(item.optJSONArray("productIds"))
            }
        }
        return emptyList()
    }

    private fun jsonLongList(array: JSONArray?): List<Long> {
        if (array == null) return emptyList()
        return (0 until array.length()).mapNotNull { index ->
            array.optLong(index).takeIf { it > 0 }
        }
    }

    private fun isAdmin(): Boolean {
        return email.equals("admin1@renteasy.com", ignoreCase = true) ||
            email.equals("admin2@renteasy.com", ignoreCase = true)
    }

    private fun authHeader(): String = "Bearer $token"

    private fun currentProfile(): MobileProfile {
        val fallbackName = email.substringBefore("@").replace(".", " ").replace("-", " ")
            .split(" ")
            .filter { it.isNotBlank() }
            .joinToString(" ") { it.replaceFirstChar { char -> char.titlecase(Locale.US) } }
            .ifBlank { "RentEasy User" }
        return MobileProfile(
            name = prefs.getString("profile_name", fallbackName) ?: fallbackName,
            email = prefs.getString("profile_email", email) ?: email,
            phone = prefs.getString("profile_phone", "") ?: "",
            address = prefs.getString("profile_address", "") ?: "",
            city = prefs.getString("profile_city", "Cebu City") ?: "Cebu City",
            zip = prefs.getString("profile_zip", "") ?: ""
        )
    }

    private fun saveOrder(orderNumber: String, total: Double, status: String, productIds: List<Long> = emptyList()) {
        val orders = JSONArray(prefs.getString("mobile_orders", "[]"))
        orders.put(JSONObject().apply {
            put("orderNumber", orderNumber)
            put("total", total)
            put("status", status)
            put("date", SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date()))
            put("productIds", JSONArray(productIds))
        })
        prefs.edit().putString("mobile_orders", orders.toString()).apply()
    }

    private fun loadOrders(): List<MobileOrder> {
        val array = JSONArray(prefs.getString("mobile_orders", "[]"))
        return (0 until array.length()).map { index ->
            val item = array.getJSONObject(index)
            MobileOrder(
                orderNumber = item.optString("orderNumber"),
                total = item.optDouble("total"),
                status = item.optString("status"),
                date = item.optString("date"),
                productIds = jsonLongList(item.optJSONArray("productIds"))
            )
        }.reversed()
    }

    private suspend fun loadRemoteOrders(): List<MobileOrder>? {
        return try {
            val response = api.getMyOrders(authHeader())
            if (!response.isSuccessful) return null
            response.body().orEmpty().map { it.toMobileOrder() }
        } catch (_: Exception) {
            null
        }
    }

    private suspend fun loadRemoteAllOrders(): List<MobileOrder>? {
        return try {
            val response = api.getAllOrders(authHeader())
            if (!response.isSuccessful) return null
            response.body().orEmpty().map { it.toMobileOrder() }
        } catch (_: Exception) {
            null
        }
    }

    private fun renderOrderHistory(target: LinearLayout, orders: List<MobileOrder>, emptyMessage: String) {
        target.removeAllViews()
        target.addView(title("Order History", 20f))
        if (orders.isEmpty()) {
            target.addView(body(emptyMessage))
            return
        }

        orders.forEach { order ->
            target.addView(infoRow(order.orderNumber, "${money(order.total)} - ${order.status}"))
        }
    }

    private fun cacheOrders(orders: List<MobileOrder>) {
        val array = JSONArray()
        orders.reversed().forEach { order ->
            array.put(JSONObject().apply {
                put("orderNumber", order.orderNumber)
                put("total", order.total)
                put("status", order.status)
                put("date", order.date)
                put("productIds", JSONArray(order.productIds))
            })
        }
        prefs.edit().putString("mobile_orders", array.toString()).apply()
    }

    private fun OrderDto.toMobileOrder(): MobileOrder {
        return MobileOrder(
            orderNumber = orderNumber.orEmpty(),
            total = total ?: 0.0,
            status = status.orEmpty().ifBlank { "Processing" },
            date = createdAt?.take(10).orEmpty(),
            productIds = items.orEmpty().mapNotNull { it.productId }
        )
    }

    private fun handlePaymentReturn(intent: Intent?): Boolean {
        val uri = intent?.data ?: return false
        if (uri.scheme != "renteasy" || uri.host != "paymongo") return false

        val payment = uri.getQueryParameter("payment") ?: uri.lastPathSegment.orEmpty()
        val reference = uri.getQueryParameter("reference").orEmpty()

        if (payment == "success") {
            updateOrderStatus(reference, "Paid via PayMongo")
            updateRemoteOrderStatus(reference, "Paid via PayMongo")
            markOrderProductsRented(reference)
            clearCartAfterPayment()
            Toast.makeText(this, "Payment received", Toast.LENGTH_LONG).show()
            showProfile()
        } else {
            updateOrderStatus(reference, "Payment cancelled")
            updateRemoteOrderStatus(reference, "Payment cancelled")
            Toast.makeText(this, "Payment cancelled", Toast.LENGTH_LONG).show()
            showCart()
        }

        intent.data = null
        return true
    }

    private fun updateOrderStatus(reference: String, status: String) {
        val orders = JSONArray(prefs.getString("mobile_orders", "[]"))
        var found = false
        for (index in 0 until orders.length()) {
            val item = orders.getJSONObject(index)
            if (reference.isNotBlank() && item.optString("orderNumber") == reference) {
                item.put("status", status)
                found = true
            }
        }

        if (!found && reference.isNotBlank()) {
            orders.put(JSONObject().apply {
                put("orderNumber", reference)
                put("total", 0.0)
                put("status", status)
                put("date", SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date()))
            })
        }

        prefs.edit().putString("mobile_orders", orders.toString()).apply()
    }

    private fun updateRemoteOrderStatus(reference: String, status: String) {
        if (reference.isBlank()) return

        lifecycleScope.launch {
            try {
                api.updateOrderStatus(authHeader(), reference, OrderStatusRequest(status))
            } catch (_: Exception) {
                // Local status is already updated; the database can be retried on the next return.
            }
        }
    }

    private fun clearCartAfterPayment() {
        lifecycleScope.launch {
            loadCartSafely().forEach { item ->
                item.id?.let { id ->
                    try {
                        api.deleteCartItem(authHeader(), id)
                    } catch (_: Exception) {
                        // Keep the return flow smooth even if a cart cleanup request fails.
                    }
                }
            }
        }
    }

    private fun loadPickedImage(uri: Uri): PickedListingImage? {
        val type = contentResolver.getType(uri).orEmpty()
        if (type.isNotBlank() && !type.startsWith("image/")) return null

        val decoded = contentResolver.openInputStream(uri)?.use { stream ->
            BitmapFactory.decodeStream(stream)
        } ?: return null

        val bitmap = scaledBitmap(decoded, 760)
        val output = ByteArrayOutputStream()
        var quality = 74

        do {
            output.reset()
            bitmap.compress(Bitmap.CompressFormat.JPEG, quality, output)
            quality -= 8
        } while (output.size() > 350 * 1024 && quality >= 50)

        val base64 = Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP)
        return PickedListingImage(bitmap, "data:image/jpeg;base64,$base64")
    }

    private fun listingSubmitError(statusCode: Int, details: String?): String {
        if (statusCode >= 500) {
            return "Listing image could not be saved. In Supabase, set products.image_url to text."
        }

        return details
            ?.substringAfter("\"detail\":\"", "")
            ?.substringBefore("\"")
            ?.takeIf { it.isNotBlank() }
            ?: "Listing could not be submitted"
    }

    private fun scaledBitmap(source: Bitmap, maxSide: Int): Bitmap {
        val longest = maxOf(source.width, source.height)
        if (longest <= maxSide) return source

        val scale = maxSide.toFloat() / longest.toFloat()
        val width = (source.width * scale).toInt().coerceAtLeast(1)
        val height = (source.height * scale).toInt().coerceAtLeast(1)
        return Bitmap.createScaledBitmap(source, width, height, true)
    }

    private fun addImage(parent: LinearLayout, imageUrl: String?, label: String, heightDp: Int) {
        val holder = FrameLayout(this).apply {
            background = rounded(soft, dp(14), line, 1)
            clipToOutline = true
        }
        val image = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            visibility = View.GONE
        }
        val fallback = TextView(this).apply {
            text = label.take(1).uppercase().ifBlank { "R" }
            gravity = Gravity.CENTER
            textSize = 34f
            setTypeface(Typeface.DEFAULT, Typeface.BOLD)
            setTextColor(brown)
        }
        holder.addView(fallback, FrameLayout.LayoutParams(match, match))
        holder.addView(image, FrameLayout.LayoutParams(match, match))
        parent.addView(holder, LinearLayout.LayoutParams(match, dp(heightDp)).apply {
            bottomMargin = dp(14)
        })

        val url = imageUrl?.trim().orEmpty()
        if (url.isBlank()) return

        lifecycleScope.launch {
            val bitmap = withContext(Dispatchers.IO) {
                try {
                    if (url.startsWith("data:image", ignoreCase = true)) {
                        val bytes = Base64.decode(url.substringAfter(","), Base64.DEFAULT)
                        BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    } else {
                        URL(url).openStream().use { BitmapFactory.decodeStream(it) }
                    }
                } catch (exception: Exception) {
                    null
                }
            }
            if (bitmap != null) {
                image.setImageBitmap(bitmap)
                image.visibility = View.VISIBLE
            }
        }
    }

    private fun titleCard(kicker: String, heading: String, meta: String? = null) {
        content.addView(LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(0, dp(4), 0, dp(12))
            addView(label(kicker, coffee))
            addView(LinearLayout(context).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                addView(title(heading, 24f), LinearLayout.LayoutParams(0, wrap, 1f))
                if (meta != null) {
                    addView(TextView(context).apply {
                        text = meta
                        gravity = Gravity.CENTER
                        textSize = 12f
                        setTypeface(Typeface.DEFAULT, Typeface.BOLD)
                        setTextColor(coffee)
                        background = rounded(soft, dp(18), line, 1)
                        setPadding(dp(12), 0, dp(12), 0)
                    }, LinearLayout.LayoutParams(wrap, dp(34)))
                }
            })
        }, LinearLayout.LayoutParams(match, wrap))
    }

    private fun clearContent() {
        content.removeAllViews()
    }

    private fun showLoading(message: String) {
        clearContent()
        content.gravity = Gravity.CENTER_HORIZONTAL
        content.addView(ProgressBar(this))
        content.addView(TextView(this).apply {
            text = message
            setTextColor(caramel)
            setTypeface(Typeface.DEFAULT, Typeface.BOLD)
            setPadding(0, dp(12), 0, 0)
        })
        content.gravity = Gravity.NO_GRAVITY
    }

    private fun showError(message: String) {
        clearContent()
        content.addView(emptyCard(message))
    }

    private fun card(): LinearLayout = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(dp(16), dp(16), dp(16), dp(16))
        background = rounded(Color.WHITE, dp(16), line, 1)
        elevation = dp(1).toFloat()
        layoutParams = LinearLayout.LayoutParams(match, wrap).apply {
            bottomMargin = dp(12)
        }
    }

    private fun formCard(): LinearLayout = card()

    private fun emptyCard(message: String): View = card().apply {
        gravity = Gravity.CENTER
        addView(title(message, 16f))
    }

    private fun title(text: String, size: Float): TextView = TextView(this).apply {
        this.text = text
        textSize = size
        setTypeface(Typeface.DEFAULT, Typeface.BOLD)
        setTextColor(brown)
        setPadding(0, 0, 0, dp(6))
    }

    private fun label(text: String, color: Int): TextView = TextView(this).apply {
        this.text = text.uppercase()
        textSize = 11f
        setTypeface(Typeface.DEFAULT, Typeface.BOLD)
        setTextColor(color)
        letterSpacing = 0.04f
        setPadding(0, 0, 0, dp(6))
    }

    private fun body(text: String): TextView = TextView(this).apply {
        this.text = text
        textSize = 13f
        setTextColor(caramel)
        setLineSpacing(4f, 1f)
        setPadding(0, 0, 0, dp(10))
    }

    private fun infoRow(label: String, value: String): View {
        return LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(7), 0, dp(7))
            addView(TextView(context).apply {
                text = label
                setTextColor(caramel)
                textSize = 13f
            }, LinearLayout.LayoutParams(0, wrap, 1f))
            addView(TextView(context).apply {
                text = value
                setTextColor(brown)
                textSize = 13f
                setTypeface(Typeface.DEFAULT, Typeface.BOLD)
                gravity = Gravity.END
            }, LinearLayout.LayoutParams(0, wrap, 1f))
        }
    }

    private fun input(label: String, hint: String, value: String, inputType: Int = InputType.TYPE_CLASS_TEXT): EditText {
        return EditText(this).apply {
            this.hint = if (hint.isBlank() || hint == label) label else hint
            setText(value)
            this.inputType = inputType
            setTextColor(brown)
            setHintTextColor(mocha)
            textSize = 14f
            background = rounded(Color.WHITE, dp(12), line, 1)
            setPadding(dp(14), 0, dp(14), 0)
            minHeight = dp(48)
            layoutParams = fieldParams()
            tag = label
        }
    }

    private fun fieldLabel(text: String): TextView = TextView(this).apply {
        this.text = text
        setTextColor(brown)
        textSize = 13f
        setTypeface(Typeface.DEFAULT, Typeface.BOLD)
        setPadding(0, dp(10), 0, dp(6))
    }

    private fun rowButtons(vararg buttons: Button): View {
        return LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, dp(12), 0, 0)
            buttons.forEach { btn ->
                addView(btn, LinearLayout.LayoutParams(0, dp(42), 1f).apply {
                    leftMargin = dp(4)
                    rightMargin = dp(4)
                })
            }
        }
    }

    private fun button(text: String, filled: Boolean, color: Int = brown, action: () -> Unit): Button {
        return Button(this).apply {
            this.text = text
            setAllCaps(false)
            setTypeface(Typeface.DEFAULT, Typeface.BOLD)
            textSize = 13f
            minHeight = 0
            minWidth = 0
            setPadding(dp(10), 0, dp(10), 0)
            setTextColor(if (filled) Color.WHITE else color)
            background = if (filled) rounded(color, dp(12)) else rounded(Color.TRANSPARENT, dp(12), color, 1)
            setOnClickListener { action() }
        }
    }

    private fun chip(text: String, selected: Boolean, action: () -> Unit): Button {
        return button(text, selected, if (selected) brown else line, action).apply {
            if (!selected) setTextColor(brown)
            background = if (selected) rounded(brown, dp(18)) else rounded(soft, dp(18), line, 1)
            layoutParams = LinearLayout.LayoutParams(wrap, dp(38)).apply {
                rightMargin = dp(8)
            }
        }
    }

    private fun rounded(fill: Int, radius: Int, stroke: Int? = null, strokeWidth: Int = 0): GradientDrawable {
        return GradientDrawable().apply {
            setColor(fill)
            cornerRadius = radius.toFloat()
            if (stroke != null && strokeWidth > 0) setStroke(dp(strokeWidth), stroke)
        }
    }

    private fun fullWidthButtonParams(): LinearLayout.LayoutParams {
        return LinearLayout.LayoutParams(match, dp(44)).apply {
            topMargin = dp(8)
            bottomMargin = dp(4)
        }
    }

    private fun fieldParams(): LinearLayout.LayoutParams {
        return LinearLayout.LayoutParams(match, dp(48)).apply {
            bottomMargin = dp(10)
        }
    }

    private fun spacer(height: Int): View = View(this).apply {
        layoutParams = LinearLayout.LayoutParams(match, dp(height))
    }

    private fun money(value: Double?): String = peso.format(value ?: 0.0)

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    private fun goToLogin() {
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    private val match = ViewGroup.LayoutParams.MATCH_PARENT
    private val wrap = ViewGroup.LayoutParams.WRAP_CONTENT

    data class MobileProfile(
        val name: String,
        val email: String,
        val phone: String,
        val address: String,
        val city: String,
        val zip: String
    )

    data class MobileOrder(
        val orderNumber: String,
        val total: Double,
        val status: String,
        val date: String,
        val productIds: List<Long>
    )

    data class PickedListingImage(
        val bitmap: Bitmap,
        val dataUrl: String
    )
}
