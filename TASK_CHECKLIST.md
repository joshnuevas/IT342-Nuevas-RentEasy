# RentEasy Final Task Checklist

This checklist reflects the current RentEasy implementation across the web app, mobile app, Spring Boot backend, Supabase PostgreSQL database, PayMongo checkout flow, and project documentation.

## Completed

### Project Structure

* [x] Root project folder created
* [x] `web` React/Vite frontend created
* [x] `backend` Spring Boot backend created
* [x] `mobile` Android/Kotlin app created
* [x] `docs` folder created for reports and documentation
* [x] Project README created
* [x] Task checklist updated to match the final implementation

### Backend

* [x] Spring Boot backend configured
* [x] Java 21 and Maven project setup completed
* [x] Supabase PostgreSQL database connection configured
* [x] Spring Security configured with stateless JWT authentication
* [x] BCrypt password hashing implemented
* [x] CORS configured for local and deployed frontend URLs
* [x] User registration endpoint implemented: `POST /api/auth/register`
* [x] User/admin login endpoint implemented: `POST /api/auth/login`
* [x] Google login endpoint implemented for regular users: `POST /api/auth/google`
* [x] Separate `admins` table implemented for admin accounts
* [x] Admin seeding implemented
* [x] Protected user endpoint implemented: `GET /api/user/me`
* [x] User profile view endpoint implemented: `GET /api/user/profile`
* [x] User profile update endpoint implemented: `PUT /api/user/profile`
* [x] Product listing creation endpoint implemented: `POST /api/products`
* [x] Product listing retrieval endpoint implemented: `GET /api/products`
* [x] Approved product retrieval endpoint implemented: `GET /api/products/all-approved`
* [x] Pending product retrieval endpoint implemented: `GET /api/products/pending`
* [x] Authenticated owner listing retrieval implemented: `GET /api/products/mine`
* [x] Product listing ownership is assigned from the authenticated JWT token
* [x] Product approval/rejection endpoint implemented: `PUT /api/products/{id}/status`
* [x] Product deletion endpoint implemented: `DELETE /api/products/{id}`
* [x] Product deletion also removes related cart items
* [x] Cart retrieval endpoint implemented: `GET /api/cart?email=<userEmail>`
* [x] Add to cart endpoint implemented: `POST /api/cart/add`
* [x] Update rental days endpoint implemented: `PUT /api/cart/{cartItemId}/days`
* [x] Remove cart item endpoint implemented: `DELETE /api/cart/{cartItemId}`
* [x] Cart items use `days` instead of `quantity`
* [x] Cart items use `cart_item_id` as the database primary key
* [x] PayMongo checkout endpoint implemented: `POST /api/payments/paymongo/checkout`
* [x] Mobile PayMongo success redirect implemented: `GET /api/payments/paymongo/mobile/success`
* [x] Mobile PayMongo cancel redirect implemented: `GET /api/payments/paymongo/mobile/cancel`
* [x] Backend rental order creation endpoint implemented: `POST /api/orders`
* [x] User order history endpoint implemented: `GET /api/orders/my`
* [x] Admin order list endpoint implemented: `GET /api/orders`
* [x] Admin order status update endpoint implemented: `PUT /api/orders/{orderNumber}/status`
* [x] Delivery fields use `delivery_*` naming instead of `shipping_*`
* [x] Backend tests pass with Maven

### Database

* [x] Supabase PostgreSQL used as the main database
* [x] `users` table stores customer accounts
* [x] `admins` table stores administrator accounts separately from users
* [x] `products` table stores rental listings
* [x] `cart_items` table stores selected rental items and rental days
* [x] `rental_orders` table stores checkout/order records
* [x] `rental_order_items` table stores ordered product line items
* [x] Product listings reference the owner through `owner_id`
* [x] Cart items reference users through `user_id`
* [x] Cart items reference products through `product_id`
* [x] Rental orders reference users through `user_id`
* [x] Rental order items reference orders through `order_id`
* [x] Rental order items reference products through `product_id`
* [x] SQL cleanup scripts added for admin table, cart days, ERD cleanup, delivery fields, and cart item primary key rename

### Web App

* [x] React/Vite web frontend implemented
* [x] Tailwind CSS styling implemented
* [x] Brown RentEasy visual theme applied
* [x] Login page implemented
* [x] Google sign-in button added to the web login page
* [x] Register page implemented
* [x] Frontend logout implemented by clearing saved session data
* [x] Protected user routes implemented
* [x] Admin and regular user access separated
* [x] Catalog page displays approved listings from the backend
* [x] Product cards show image, name, category, price, and cart actions
* [x] Product detail page implemented
* [x] Product detail page shows owner name, owner email, and owner phone when available
* [x] Frontend search/filtering implemented using loaded product data
* [x] Create listing page implemented
* [x] My Listings page implemented
* [x] Listings start as pending until admin approval
* [x] Cart page implemented
* [x] Cart add, remove, and rental day update implemented
* [x] Cart totals and service fee calculation implemented
* [x] Checkout page implemented with delivery/contact fields
* [x] PayMongo checkout redirect implemented
* [x] Order confirmation page implemented
* [x] Paid/rented items are removed from the approved catalog display
* [x] Profile page implemented
* [x] Profile name and phone update through backend implemented
* [x] Profile picture change handled on the frontend
* [x] User order history shown from backend order records
* [x] Admin dashboard implemented
* [x] Admin product management implemented
* [x] Admin pending approval implemented
* [x] Admin order management implemented
* [x] Admin user summary view implemented
* [x] Admin product detail page stays inside the admin section
* [x] Web production build passes

### Mobile App

* [x] Android/Kotlin mobile app implemented
* [x] Retrofit client configured for backend API calls
* [x] Login screen implemented
* [x] Google sign-in button added to the mobile login screen
* [x] Mobile Google sign-in configured with Google Play Services Auth
* [x] Android OAuth client setup documented with package name and SHA-1 requirement
* [x] Register screen implemented
* [x] Customer dashboard/catalog implemented
* [x] Product detail view implemented
* [x] Product detail view shows owner information when available
* [x] Add to cart implemented
* [x] Cart view implemented
* [x] Rental days update implemented
* [x] Cart item removal implemented
* [x] Listing submission implemented
* [x] Image selection support added for mobile listing submission
* [x] User profile screen implemented
* [x] Mobile checkout request implemented
* [x] PayMongo checkout opens from mobile
* [x] Mobile PayMongo deep link redirect configured
* [x] Mobile order history loads from backend order records
* [x] Admin mobile area limited to admin features
* [x] Android unit tests pass

### Documentation

* [x] System Design Document updated
* [x] API contract updated to match actual backend endpoints
* [x] Google authentication endpoint and owner listings endpoint documented
* [x] Functional requirements updated to match implemented features
* [x] Non-functional requirements updated without unsupported performance claims
* [x] Technology stack updated to match the codebase
* [x] ERD updated with current tables and relationships
* [x] Database table summary updated with exact column names
* [x] Component diagram updated
* [x] UI/UX screenshots added
* [x] Project timeline updated
* [x] Table of contents page numbers corrected

### Deployment

* [x] Web frontend prepared for Vercel deployment
* [x] Backend prepared for Render deployment
* [x] Supabase PostgreSQL used for hosted database
* [x] PayMongo test checkout integration configured through environment variables

## Current Out of Scope

These items are not part of the current final implementation.

* Backend logout endpoint
* Backend search endpoint
* Forgot password flow
* Third-party login for admin accounts
* Email notifications
* Wishlist or saved items
* Product edit form for existing listings
* Backend profile image upload endpoint
* Supabase Storage file upload integration
* PayMongo webhook verification
* Advanced analytics dashboard
* Real-time chat
* Multi-language support

## Final Status

* [x] Backend tests verified
* [x] Web build verified
* [x] Mobile tests verified
* [x] Documentation aligned with final implementation
* [x] Ready for final submission
