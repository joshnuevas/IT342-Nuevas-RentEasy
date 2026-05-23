# RentEasy Final Submission Checklist

This checklist reflects the final RentEasy implementation across the Spring Boot backend, React web frontend, Android Kotlin mobile app, Supabase PostgreSQL database, PayMongo checkout flow, and System Design Document.

## Project Setup

* [x] Root repository created.
* [x] `backend` Spring Boot project completed.
* [x] `web` React/Vite project completed.
* [x] `mobile` Android Kotlin project completed.
* [x] `docs` folder used for the final SDD PDF.
* [x] README updated for final setup and feature documentation.
* [x] Task checklist updated for final submission.

## Backend

### Authentication and Security

* [x] Spring Security configured with stateless JWT authentication.
* [x] BCrypt password hashing implemented.
* [x] User registration implemented: `POST /api/auth/register`.
* [x] User/admin email-password login implemented: `POST /api/auth/login`.
* [x] Google login for regular users implemented: `POST /api/auth/google`.
* [x] Google ID token verification added in the backend.
* [x] Google sign-in blocked for admin accounts.
* [x] JWT expiration configured.
* [x] CORS configured for local and deployed frontend URLs.
* [x] Frontend/mobile logout handled by clearing saved token.

### Users and Admins

* [x] Regular users stored in `users`.
* [x] Admin accounts stored separately in `admins`.
* [x] Admin seed data implemented.
* [x] User profile view implemented: `GET /api/user/profile`.
* [x] User profile update implemented: `PUT /api/user/profile`.
* [x] Protected user endpoint implemented: `GET /api/user/me`.

### Products and Listings

* [x] Product listing creation implemented: `POST /api/products`.
* [x] Product owner is assigned from the authenticated JWT token.
* [x] All products endpoint implemented: `GET /api/products`.
* [x] Approved products endpoint implemented: `GET /api/products/all-approved`.
* [x] Pending products endpoint implemented: `GET /api/products/pending`.
* [x] Authenticated owner listings endpoint implemented: `GET /api/products/mine`.
* [x] Admin product approval/rejection implemented: `PUT /api/products/{id}/status`.
* [x] Product deletion implemented: `DELETE /api/products/{id}`.
* [x] Product deletion removes related cart items.

### Cart

* [x] Cart retrieval implemented: `GET /api/cart?email=<userEmail>`.
* [x] Add item to cart implemented: `POST /api/cart/add`.
* [x] Rental days update implemented: `PUT /api/cart/{cartItemId}/days`.
* [x] Cart item removal implemented: `DELETE /api/cart/{cartItemId}`.
* [x] Cart uses `days` instead of `quantity`.
* [x] Cart primary key renamed/documented as `cart_item_id`.

### Orders and Payments

* [x] PayMongo checkout endpoint implemented: `POST /api/payments/paymongo/checkout`.
* [x] PayMongo mobile success redirect implemented: `GET /api/payments/paymongo/mobile/success`.
* [x] PayMongo mobile cancel redirect implemented: `GET /api/payments/paymongo/mobile/cancel`.
* [x] Rental order creation implemented: `POST /api/orders`.
* [x] User order history implemented: `GET /api/orders/my`.
* [x] Admin order list implemented: `GET /api/orders`.
* [x] Admin order status update implemented: `PUT /api/orders/{orderNumber}/status`.
* [x] Delivery fields use `delivery_*` naming.

### Backend Verification

* [x] Maven tests pass.
* [x] Backend builds with Java 21.
* [x] Render environment variable list documented.

## Database

* [x] Supabase PostgreSQL used as the hosted database.
* [x] `users` table stores regular and Google-authenticated users.
* [x] `admins` table stores admin accounts separately.
* [x] `products` table stores rental listings.
* [x] `products.owner_id` references the listing owner.
* [x] `cart_items` table stores selected products and rental days.
* [x] `cart_items.user_id` references `users`.
* [x] `cart_items.product_id` references `products`.
* [x] `rental_orders` table stores completed rental transactions.
* [x] `rental_orders.user_id` references `users`.
* [x] `rental_order_items` table stores order line items.
* [x] `rental_order_items.order_id` references `rental_orders`.
* [x] `rental_order_items.product_id` references `products`.
* [x] SQL cleanup scripts documented for admins, cart days, ERD cleanup, delivery fields, and cart item primary key rename.

## Web App

### User Area

* [x] React/Vite web frontend implemented.
* [x] Brown RentEasy visual theme applied.
* [x] Login page implemented.
* [x] Register page implemented.
* [x] Google sign-in button implemented.
* [x] Web Google sign-in uses `VITE_GOOGLE_CLIENT_ID`.
* [x] Protected user routes implemented.
* [x] User/admin route separation implemented.
* [x] Catalog displays approved listings from the backend.
* [x] Catalog hides the logged-in user's own approved products.
* [x] Product detail page implemented.
* [x] Product detail page shows owner name, email, and phone when available.
* [x] Frontend search/filtering implemented using loaded data.
* [x] Create listing page implemented.
* [x] My Listings page uses `GET /api/products/mine`.
* [x] Cart page implemented.
* [x] Cart add, remove, and rental day update implemented.
* [x] Checkout page implemented with delivery/contact details.
* [x] PayMongo checkout redirect implemented.
* [x] Order confirmation page implemented.
* [x] Order history loads from backend records.
* [x] Profile page implemented.
* [x] Profile name and phone update through backend implemented.
* [x] Profile picture change handled on the frontend.

### Admin Area

* [x] Admin dashboard implemented.
* [x] Admin product management implemented.
* [x] Admin pending approval implemented.
* [x] Admin order management implemented.
* [x] Admin user summary view implemented.
* [x] Admin product detail page remains inside the admin section.
* [x] Admin login remains email/password only.

### Web Verification

* [x] Production build passes with `npm run build`.
* [x] Vercel deployment setup documented.

## Mobile App

### User Area

* [x] Android/Kotlin mobile app implemented.
* [x] Retrofit client configured.
* [x] Login screen implemented.
* [x] Register screen implemented.
* [x] Google sign-in button implemented.
* [x] Google Play Services Auth dependency added.
* [x] Android OAuth setup documented with package name and SHA-1.
* [x] Mobile app keeps the web OAuth client ID in `google_web_client_id`.
* [x] Customer dashboard/catalog implemented.
* [x] Product detail view implemented.
* [x] Product detail owner information shown when available.
* [x] Add to cart implemented.
* [x] Cart view implemented.
* [x] Rental days update implemented.
* [x] Cart item removal implemented.
* [x] Listing submission implemented.
* [x] Mobile image selection support added for listing submission.
* [x] User profile view/update implemented.
* [x] Mobile checkout request implemented.
* [x] PayMongo checkout opens from mobile.
* [x] Mobile PayMongo deep link/return handling configured.
* [x] Mobile order history loads from backend records.

### Admin Area

* [x] Admin mobile area limited to admin features.
* [x] Admin product views implemented on mobile.
* [x] Admin pending approval flow available on mobile.
* [x] Admin order view available on mobile.

### Mobile Verification

* [x] Android unit tests pass with `testDebugUnitTest`.
* [x] Emulator backend URL documented as `http://10.0.2.2:8080/`.

## Documentation

* [x] Final SDD PDF updated in `docs/SDD_RentEasy_Nuevas.pdf`.
* [x] Revision history updated.
* [x] Executive summary updated.
* [x] Functional requirements updated.
* [x] Non-functional requirements updated without unsupported performance claims.
* [x] API contract updated to match implemented endpoints.
* [x] Google authentication endpoint documented.
* [x] Owner listings endpoint documented.
* [x] Product ownership behavior documented.
* [x] Error handling updated for Google and PayMongo cases.
* [x] ERD and database relationships updated.
* [x] Database table summary updated with current column names.
* [x] Component diagram updated.
* [x] Technology stack updated.
* [x] UI/UX screenshots added.
* [x] Table of contents page numbers corrected.
* [x] Project timeline updated.

## Deployment

* [x] Web frontend prepared for Vercel.
* [x] Backend prepared for Render.
* [x] Supabase PostgreSQL used for hosted data.
* [x] PayMongo test keys configured through environment variables.
* [x] Google web client ID documented for web, backend, and mobile.
* [x] Android OAuth client setup documented for Google mobile sign-in.

## Out of Scope

These features are intentionally not included in the final implementation:

* [ ] Backend logout endpoint.
* [ ] Backend search endpoint.
* [ ] Forgot password flow.
* [ ] Third-party login for admin accounts.
* [ ] Email notifications.
* [ ] Wishlist or saved items.
* [ ] Product edit form for existing listings.
* [ ] Backend profile image upload endpoint.
* [ ] Supabase Storage file upload integration.
* [ ] PayMongo webhook verification.
* [ ] Advanced analytics dashboard.
* [ ] Real-time chat.
* [ ] Multi-language support.

## Final Verification Commands

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

## Final Status

* [x] Backend verified.
* [x] Web build verified.
* [x] Mobile tests verified.
* [x] Database schema documented.
* [x] SDD finalized.
* [x] README finalized.
* [x] Task checklist finalized.
* [x] Ready for final submission.
