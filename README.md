# RentEasy

RentEasy is a rental marketplace for browsing, listing, approving, renting, and tracking rental items. The project is built with a Spring Boot backend, React/Vite web frontend, Android Kotlin mobile app, Supabase PostgreSQL database, and PayMongo checkout integration.

The final implementation supports two account areas:

* Regular users can register, log in with email/password or Google, browse approved listings, view product details, add items to cart, set rental days, submit rental listings, update profile details, and complete checkout through PayMongo.
* Admin users log in through the separate admin account flow and can review pending listings, approve or reject products, delete products, view orders, and manage admin-side product/order pages.

## Project Layout

```text
IT342-Nuevas-RentEasy/
  backend/   Spring Boot REST API
  web/       React/Vite web application
  mobile/    Android Kotlin mobile application
  docs/      System design document and project documentation
```

## Final Feature Summary

### Authentication

* Email/password registration and login for regular users.
* Email/password login for admin accounts.
* Google sign-in for regular users on the web and mobile apps.
* Google ID tokens are verified by the Spring Boot backend before a RentEasy JWT is issued.
* Admin accounts do not use Google sign-in.
* Logout is handled by clearing the saved token on the frontend/mobile side.

### Product Listings

* Approved rental catalog.
* Product detail page with product information and owner details.
* User listing submission.
* New listings start as `PENDING`.
* Admin approval/rejection changes product status.
* My Listings is loaded from `GET /api/products/mine`.
* Product ownership is assigned from the authenticated JWT token, not from a frontend request field.

### Cart, Checkout, and Orders

* Add products to cart.
* View cart items.
* Update rental days.
* Remove cart items.
* Checkout form uses delivery/contact details.
* PayMongo checkout session creation.
* Mobile PayMongo success/cancel redirect support.
* Rental orders and rental order items are stored in the backend database.
* User order history and admin order management are backed by the database.

### Profile

* Backend profile view and update for name and phone.
* Web profile picture change is handled on the frontend.
* Profile picture upload to backend/Supabase Storage is not part of the current implementation.

### Mobile

* Android login and registration.
* Android Google sign-in through Google Play Services Auth.
* Catalog, product detail, cart, listing submission, profile, checkout, order history, and admin area.
* Emulator backend URL uses `http://10.0.2.2:8080/`.

## Technology Stack

### Backend

* Java 21
* Spring Boot 3.5.0
* Spring Web
* Spring Security
* Spring Data JPA
* Hibernate
* PostgreSQL JDBC Driver
* JJWT 0.11.5
* BCrypt
* Maven

### Database

* Supabase PostgreSQL

### Web

* React 19
* Vite 7
* JavaScript/JSX
* React Router
* Tailwind CSS
* Lucide React
* Google Identity Services
* npm

### Mobile

* Android Kotlin
* XML/AppCompat UI
* Material Components
* Retrofit 2.9.0
* Gson Converter
* Kotlin Coroutines
* AndroidX Lifecycle
* Google Play Services Auth
* Gradle

### Payments and Deployment

* PayMongo Checkout API
* Web frontend deployed on Vercel
* Backend deployed on Render
* Database hosted on Supabase
* Mobile distributed as an APK

## Database Tables

```text
users
admins
products
cart_items
rental_orders
rental_order_items
```

Important table notes:

* `users` stores regular customer accounts, including Google-authenticated users.
* `admins` stores administrator accounts separately from regular users.
* `products.owner_id` links a listing to the user who created it.
* `cart_items.cart_item_id` is the cart item primary key.
* `cart_items.days` stores the rental duration.
* `rental_orders` stores checkout/order records and delivery details.
* `rental_order_items` stores ordered product line items.
* Delivery columns use `delivery_*` naming instead of `shipping_*`.

## Environment Setup

### Backend Environment Variables

Set these before running the backend locally or in Render:

```powershell
$env:DATABASE_URL="your_supabase_database_url"
$env:DB_USERNAME="your_database_username"
$env:DB_PASSWORD="your_database_password"
$env:PAYMONGO_SECRET_KEY="your_paymongo_test_secret_key"
$env:PAYMONGO_PAYMENT_METHODS="card,gcash"
$env:APP_FRONTEND_URL="http://localhost:5173"
$env:GOOGLE_CLIENT_IDS="your_web_client_id.apps.googleusercontent.com"
```

`GOOGLE_CLIENT_IDS` must contain the web OAuth client ID that the web and mobile apps use when requesting Google ID tokens.

### Web Environment Variables

Create `web/.env` locally:

```text
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
```

For Vercel, add the same values in the Vercel Environment Variables page, using the deployed backend URL for `VITE_API_BASE_URL`.

### Mobile Google Sign-In Setup

The Android app must keep the web client ID in:

```text
mobile/app/src/main/res/values/strings.xml
```

```xml
<string name="google_web_client_id">your_web_client_id.apps.googleusercontent.com</string>
```

In Google Cloud, create an Android OAuth client with:

```text
Package name: com.example.it342_mobile_auth
SHA-1: your Android debug or release signing certificate fingerprint
```

Use this command to get the debug SHA-1:

```powershell
cd mobile
.\gradlew.bat signingReport
```

The Android OAuth client is used by Google to verify the installed app. The app still uses the web client ID in `google_web_client_id`.

## Running the Project

### Backend

```bash
cd backend
mvn clean test
mvn spring-boot:run
```

Local backend:

```text
http://localhost:8080
```

Production backend:

```text
https://it342-nuevas-renteasy-1.onrender.com
```

### Web

```bash
cd web
npm install
npm run dev
```

Local web app:

```text
http://localhost:5173
```

Production build:

```bash
npm run build
```

### Mobile

1. Open the `mobile` folder in Android Studio.
2. Sync Gradle.
3. Start an emulator.
4. Run the `app` configuration.

For a clean Google sign-in test, uninstall the app from the emulator before rerunning after OAuth changes.

## API Endpoints

Base URL for local development:

```text
http://localhost:8080
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
```

### User Profile

```text
GET /api/user/me
GET /api/user/profile
PUT /api/user/profile
```

### Products

```text
GET /api/products
GET /api/products/all-approved
GET /api/products/pending
GET /api/products/mine
POST /api/products
PUT /api/products/{id}/status
DELETE /api/products/{id}
```

`GET /api/products/mine` returns only listings owned by the authenticated user.

`POST /api/products` assigns `owner_id` from the authenticated JWT token.

### Cart

```text
GET /api/cart?email=<userEmail>
POST /api/cart/add
PUT /api/cart/{cartItemId}/days
DELETE /api/cart/{cartItemId}
```

### Orders

```text
POST /api/orders
GET /api/orders/my
GET /api/orders
PUT /api/orders/{orderNumber}/status
```

### Payments

```text
POST /api/payments/paymongo/checkout
GET /api/payments/paymongo/mobile/success
GET /api/payments/paymongo/mobile/cancel
```

The mobile PayMongo redirect endpoints are public because PayMongo/browser redirects do not include the user's JWT token.

## Documentation

The final System Design Document is stored at:

```text
docs/SDD_RentEasy_Nuevas.pdf
```

The SDD includes the updated requirements, API contract, database design, ERD, component diagram, UI/UX screenshots, project timeline, Google authentication notes, and corrected table of contents.

## Current Out of Scope

These are not part of the final implementation:

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

## Verification

The project has been verified with:

```bash
cd backend
mvn clean test
```

```bash
cd web
npm run build
```

```bash
cd mobile
.\gradlew.bat testDebugUnitTest
```

## Author

Josh Anton K. Nuevas  
IT342-G1 - System Integration and Architecture

## Version

* Version: 0.3
* Status: Final
* Date: 05/20/2026
