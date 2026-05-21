# RentEasy

RentEasy is a rental marketplace system for browsing, listing, approving, renting, and tracking rental items through a React web app, Android Kotlin mobile app, Spring Boot backend, Supabase PostgreSQL database, and PayMongo checkout integration.

The project supports regular users and administrators. Regular users can register, log in, browse approved listings, view product details, add products to a cart, set rental days, submit listings for approval, update profile information, and complete checkout through PayMongo. Administrators use a separate admin account flow to review pending listings, approve or reject products, remove products, view orders, and manage admin-side product/order views.

## Project Structure

```text
IT342-Nuevas-RentEasy/
  backend/   Spring Boot REST API
  web/       React/Vite web frontend
  mobile/    Android Kotlin mobile app
  docs/      Documentation and test evidence
```

## Feature Organization

The codebase is organized around feature areas.

Backend packages:

```text
auth
users
admin
listings
cart
orders
payments
core
```

Web feature folders:

```text
features/auth
features/listings
features/cart
features/checkout
features/profile
features/admin
shared
app
```

Mobile feature folders:

```text
features/auth
features/dashboard
core/network
```

## Main Features

### User Features

* User registration and login
* Google sign-in for regular user accounts
* JWT-based protected pages and backend endpoints
* Approved rental catalog
* Product detail view with owner information
* Frontend product search/filtering
* Product listing submission
* My Listings page
* Cart add, view, remove, and rental days update
* Checkout form with delivery/contact details
* PayMongo checkout redirect
* Order confirmation and order history
* Profile name and phone update through backend
* Frontend profile picture change

### Admin Features

* Separate admin accounts stored in the `admins` table
* Admin dashboard
* Product management
* Pending listing approval/rejection
* Product deletion
* Admin product detail view
* Rental order viewing
* Order status update
* User/admin summary view

### Mobile Features

* Android login and registration
* Google sign-in from the mobile login screen
* Customer catalog/dashboard
* Product detail view
* Add to cart
* Cart rental day update and item removal
* Listing submission with mobile image selection support
* Profile view/update
* PayMongo checkout request and mobile return redirect
* Backend order history
* Admin mobile area limited to admin features

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
* BCrypt password hashing
* Maven

### Database

* Supabase PostgreSQL

### Web Frontend

* React 19
* Vite 7
* JavaScript/JSX
* React Router
* Tailwind CSS
* Lucide React
* npm

### Mobile App

* Android native app
* Kotlin
* XML/AppCompat-based Android UI
* Material Components
* Retrofit 2.9.0
* Gson Converter
* Kotlin Coroutines
* AndroidX Lifecycle
* Gradle

### Payments

* PayMongo Checkout API

### Google Authentication

* Google Identity Services for web login
* Google Sign-In for Android login

### Deployment

* Web frontend: Vercel
* Backend: Render
* Database: Supabase PostgreSQL
* Mobile: APK build/distribution

## Database Tables

```text
users
admins
products
cart_items
rental_orders
rental_order_items
```

Key table notes:

* `users` stores regular customer accounts.
* `admins` stores administrator accounts separately from regular users.
* `products` stores rental listings and references the owner through `owner_id`.
* `cart_items` stores selected products per user and uses `days` for rental duration.
* `cart_items` uses `cart_item_id` as its primary key.
* `rental_orders` stores checkout/order records and delivery details.
* `rental_order_items` stores individual products included in an order.
* Delivery columns use `delivery_*` naming instead of `shipping_*`.

## Backend Environment Variables

The backend requires these environment variables:

```powershell
$env:DATABASE_URL="your_supabase_database_url"
$env:DB_USERNAME="your_database_username"
$env:DB_PASSWORD="your_database_password"
$env:PAYMONGO_SECRET_KEY="your_paymongo_test_secret_key"
$env:APP_FRONTEND_URL="http://localhost:5173"
$env:GOOGLE_CLIENT_IDS="your_web_client_id.apps.googleusercontent.com"
```

Optional:

```powershell
$env:PAYMONGO_PAYMENT_METHODS="card,gcash"
```

## Run the Backend

```bash
cd backend
mvn clean test
mvn spring-boot:run
```

Local backend URL:

```text
http://localhost:8080
```

Production backend URL:

```text
https://it342-nuevas-renteasy-1.onrender.com
```

## Run the Web App

```bash
cd web
npm install
npm run dev
```

For Google sign-in on the web app, create a `.env` file in the `web` folder and set:

```text
VITE_GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
```

Local web URL:

```text
http://localhost:5173
```

Build for production:

```bash
npm run build
```

## Run the Mobile App

1. Open the `mobile` folder in Android Studio.
2. Sync Gradle dependencies.
3. Start an emulator or connect an Android device.
4. Run the app module.

The emulator backend base URL is configured as:

```text
http://10.0.2.2:8080/
```

This points the Android emulator to the backend running on the host machine.

For Google sign-in on Android, replace the placeholder value in:

```text
mobile/app/src/main/res/values/strings.xml
```

with your Google web client ID:

```xml
<string name="google_web_client_id">your_web_client_id.apps.googleusercontent.com</string>
```

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

Google sign-in is available for regular user accounts only. Admin login remains email/password only. Logout is handled on the frontend/mobile side by clearing the saved token. There is no backend logout endpoint in the current implementation.

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
POST /api/products
PUT /api/products/{id}/status
DELETE /api/products/{id}
```

Search/filtering is handled on the frontend using loaded catalog data. There is no backend search endpoint in the current implementation.

### Cart

```text
GET /api/cart?email=<userEmail>
POST /api/cart/add
PUT /api/cart/{cartItemId}/days
DELETE /api/cart/{cartItemId}
```

The API response field `id` represents the `cart_item_id` primary key in the database.

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

The mobile PayMongo return endpoints are public redirect endpoints because PayMongo/browser redirects do not send the user's JWT token.

## Current Out of Scope

These features are not part of the current final implementation:

* Backend logout endpoint
* Backend search endpoint
* Forgot password flow
* Social login
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
