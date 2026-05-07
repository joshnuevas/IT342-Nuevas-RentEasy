FULL REGRESSION TEST REPORT
Project Title: RentEasy
Student Name: Nuevas, Josh Anton K.
Group No.: GroupNo
Course / Section: IT342-G1
Date: May 7, 2026
Refactor Branch: vertical-slice-regression
Repository: https://github.com/joshnuevas/IT342-Nuevas-RentEasy/tree/vertical-slice-regression

1. Project Information
? System Description: RentEasy is a multi-platform equipment rental application that allows users to register, log in, browse approved rental products, list products for rent, manage cart items, and access protected user/admin areas. Admin users can review pending product listings and approve or reject them.
? Architecture: Spring Boot backend, React/Vite web frontend, and Kotlin Android mobile application.
? Testing Scope: Backend automated service tests using JUnit 5 and Mockito; web frontend lint and production build verification; mobile package/manifest refactor verification with Gradle execution noted as environment-blocked by Java 25.

2. Refactoring Summary
The application was refactored from a traditional horizontal/layered structure into a Vertical Slice Architecture grouped by business features.
? Backend (Spring Boot): The old layer-based packages such as controller, service, repository, model, dto, config, and security were reorganized into feature modules: auth, users, listings, cart, admin, and core. Each feature now contains the controller/service/data classes it owns, while shared security and configuration remain in core.
? Web Frontend (React/Vite): The old components folder was replaced by feature modules: auth, listings, cart, admin, shared, and app. Feature API files were added so backend calls are owned by the feature that uses them.
? Mobile Application (Android/Kotlin): Root-level Kotlin files were reorganized into features/auth, features/dashboard, and core/network. Retrofit authentication API definitions and auth models now live inside the auth feature.

3. Updated Project Structure
BACKEND
Before: package-by-layer structure
After: package-by-feature structure

Before
backend/src/main/java/edu/cit/nuevas/renteasy/
  controller/
  service/
  repository/
  model/
  dto/
  config/
  security/

After
backend/src/main/java/edu/cit/nuevas/renteasy/
  admin/
  auth/
  cart/
  core/
    config/
    dto/
    security/
  listings/
  users/

FRONTEND
Before: single components folder
After: feature modules with shared app/core utilities

Before
web/src/
  App.jsx
  components/
    Login.jsx
    Register.jsx
    Home.jsx
    CreateListing.jsx
    MyListings.jsx
    Cart.jsx
    AdminDashboard.jsx
    PendingApproval.jsx
    ProtectedRoute.jsx

After
web/src/
  app/
    App.jsx
  features/
    admin/
    auth/
    cart/
    listings/
  shared/
    apiClient.js
    ProtectedRoute.jsx

MOBILE
Before: all Kotlin files in the root app package
After: feature/core package structure

Before
mobile/app/src/main/java/com/example/it342_mobile_auth/
  ApiService.kt
  Models.kt
  RetrofitClient.kt
  MainActivity.kt
  RegisterActivity.kt
  DashboardActivity.kt

After
mobile/app/src/main/java/com/example/it342_mobile_auth/
  core/network/RetrofitClient.kt
  features/auth/AuthApi.kt
  features/auth/AuthModels.kt
  features/auth/MainActivity.kt
  features/auth/RegisterActivity.kt
  features/dashboard/DashboardActivity.kt

4. Test Plan Documentation
Testing Strategy:
1. Automated Unit Testing: JUnit 5 and Mockito were used to test backend service behavior after refactoring.
2. Web Static/Build Testing: ESLint and Vite production build were used to validate frontend imports, React hooks, routes, and bundle compilation.
3. Mobile Verification: Android manifest and Kotlin package paths were updated and reviewed. Gradle test execution should be rerun using JDK 17 because the current local JDK 25 blocks the Gradle/Kotlin tooling before project compilation.
4. Manual UI Regression: Main web and mobile user flows are documented for manual validation after running the backend and frontend.

Functional Requirements Coverage
| Feature Module | Requirement Description | Target Platform | Test Case ID |
| Authentication | User registration, login, JWT token generation, and protected access | Backend, Web, Mobile | TC-AUTH-01 |
| User Access | Protected user endpoint access | Backend | TC-USER-01 |
| Listings | Create product listing with owner, price, stock, category, description, and image | Backend, Web | TC-LIST-01 |
| Listings | Browse approved product listings | Backend, Web | TC-LIST-02 |
| Admin | View pending listings and approve/reject status | Backend, Web | TC-ADMIN-01 |
| Cart | Add product to cart and increment duplicate item quantity | Backend, Web | TC-CART-01 |
| Cart | Update and remove cart items | Backend, Web | TC-CART-02 |
| Mobile Auth | Android login/register through Retrofit and local token storage | Mobile, Backend | TC-MOB-01 |

Test Cases and Test Scripts (Manual Testing)
TC-AUTH-01: Authentication
? TS-AUTH-01: User Registration and Login
  Test Steps: 1. Open Register page. 2. Enter valid first name, last name, email, and password. 3. Submit the form. 4. Log in using the registered credentials.
  Expected Result: Account is created, login succeeds, JWT token is stored in localStorage, and the user is redirected to Home.
? TS-AUTH-02: Protected Route Validation
  Test Steps: 1. Clear browser localStorage. 2. Visit /home or /cart directly.
  Expected Result: User is redirected to /login.

TC-LIST-01: Listing Management
? TS-LIST-01: Create Product Listing
  Test Steps: 1. Log in. 2. Open Create Listing. 3. Enter product name, category, price, stock, description, and image. 4. Submit for approval.
  Expected Result: Product is saved with the current user as owner and starts in PENDING status.
? TS-LIST-02: Browse Approved Listings
  Test Steps: 1. Open Home page. 2. Load approved products. 3. Review product cards.
  Expected Result: Approved products appear with image, name, price, and cart action.

TC-ADMIN-01: Admin Management
? TS-ADMIN-01: Approve or Reject Pending Listing
  Test Steps: 1. Log in using an admin email ending in @renteasy.com. 2. Open Admin Dashboard. 3. Select Pending Approval. 4. Click Approve or Reject.
  Expected Result: Product status updates and the item is removed from the pending queue.

TC-CART-01: Cart Management
? TS-CART-01: Add Item to Cart
  Test Steps: 1. Log in as a user. 2. Browse approved listings. 3. Click Add to Cart.
  Expected Result: Product is added to the logged-in user's cart. If already present, quantity increments.
? TS-CART-02: Update and Remove Cart Item
  Test Steps: 1. Open Cart. 2. Increase/decrease item quantity. 3. Remove item.
  Expected Result: Quantity updates correctly and removed item disappears from the cart.

TC-MOB-01: Mobile Authentication
? TS-MOB-01: Android Login/Register Flow
  Test Steps: 1. Open Android app. 2. Register a user. 3. Log in with valid credentials. 4. Confirm dashboard navigation.
  Expected Result: Retrofit sends auth requests to the backend, token is saved to SharedPreferences, and DashboardActivity opens after login.

Automated Test Cases
| Automated Test | Coverage |
| UserServiceTest.registerCreatesUserWhenEmailIsAvailable | Registration mapping and password encoding |
| UserServiceTest.registerRejectsDuplicateEmail | Duplicate email validation |
| UserServiceTest.loginReturnsJwtForValidCredentials | Valid login and token generation |
| UserServiceTest.loginRejectsInvalidCredentials | Invalid password rejection |
| ProductServiceTest.addProductMapsListingPayloadAndOwner | Listing payload-to-entity mapping and owner assignment |
| CartServiceTest.addItemToCartCreatesNewCartItemWhenProductIsNotYetInCart | New cart item creation |
| CartServiceTest.addItemToCartIncrementsExistingQuantity | Existing cart item quantity increment |
| CartServiceTest.updateQuantityPersistsChangedQuantity | Cart quantity update behavior |
| BackendApplicationTests.applicationEntryPointCanBeLoaded | Backend application entry point load |

5. Regression Test Results (Manual & Automated)
Following the vertical slice refactor, regression verification was performed for backend service logic and web frontend build correctness. Manual test scripts are prepared for final UI evidence screenshots.

5.1 Automated Test Execution Results (Backend)
| Metric | Result |
| Total Tests Run | 9 |
| Passed | 9 |
| Failed | 0 |
| Errors | 0 |
| Skipped | 0 |
| Coverage Scope | Auth, listings, cart, and backend application entry point |

Command Used:
mvn.cmd test

5.2 Web Test Execution Results
| Test / Command | Status | Execution Remarks |
| npm.cmd run lint | PASS | ESLint completed with 0 errors and 0 warnings. |
| npm.cmd run build | PASS | Vite production build completed successfully. |

5.3 Manual Regression Test Matrix
| Test Script ID | Feature Scope | Status | Remarks / Observations |
| TS-AUTH-01 | Web Login & Registration | READY FOR SCREENSHOT | Execute with backend running on localhost:8080. |
| TS-AUTH-02 | Protected Routes | READY FOR SCREENSHOT | Clear localStorage and verify redirect to login. |
| TS-LIST-01 | Create Listing | READY FOR SCREENSHOT | Submit a listing and verify PENDING status behavior. |
| TS-LIST-02 | Browse Listings | READY FOR SCREENSHOT | Verify approved products display on Home page. |
| TS-ADMIN-01 | Admin Pending Approval | READY FOR SCREENSHOT | Use admin email and approve/reject a product. |
| TS-CART-01 | Add to Cart | READY FOR SCREENSHOT | Add approved product to cart. |
| TS-CART-02 | Update/Remove Cart | READY FOR SCREENSHOT | Change item quantity and remove item. |
| TS-MOB-01 | Mobile Authentication | READY FOR SCREENSHOT | Rerun using JDK 17-compatible Android Gradle environment. |

6. Issues Found & Fixes Applied
Issue 1: Backend import/package errors after moving files.
? Bug Encountered: Java files initially referenced old packages such as controller, service, repository, model, dto, config, and security after being moved.
? Root Cause: Vertical slice movement changed package ownership.
? Fix Applied: Updated package declarations and imports to auth, users, listings, cart, admin, and core packages.

Issue 2: Frontend API calls were embedded directly in components.
? Bug Encountered: Web structure was still partly horizontal because network logic stayed inside components.
? Root Cause: Components owned both UI and raw fetch implementation.
? Fix Applied: Added feature API files: auth.api.js, listings.api.js, cart.api.js, and admin.api.js. Components now call feature API modules.

Issue 3: React hook lint warning in PendingApproval.
? Bug Encountered: ESLint reported a missing useEffect dependency.
? Root Cause: The fetch function was not stable inside the hook dependency list.
? Fix Applied: Wrapped the fetch function in useCallback and added it to useEffect dependencies. Lint now passes cleanly.

Issue 4: Android Gradle test blocked by Java 25.
? Bug Encountered: Gradle failed before compiling source code with java.lang.IllegalArgumentException: 25.
? Root Cause: Installed Java version is Java 25, which the current Gradle/Kotlin tooling does not support.
? Fix Applied: Source code does not require a fix. Re-run mobile tests using JDK 17 or upgrade Android Gradle/Kotlin tooling to versions that support Java 25.

7. Automated Test Evidence
Screenshots are intentionally not embedded in this PDF. The student will add screenshots separately.

Evidence to add:
? Screenshot of backend mvn.cmd test result showing BUILD SUCCESS and 9 tests passed.
? Screenshot of backend surefire reports folder or test class result list.
? Screenshot of web npm.cmd run lint passing with no errors.
? Screenshot of web npm.cmd run build passing.
? Screenshot of web login/register flow.
? Screenshot of listing creation and browsing flow.
? Screenshot of cart add/update/remove flow.
? Screenshot of admin pending approval flow.
? Screenshot of Android Gradle/mobile run after switching to JDK 17.

Automated evidence files already generated in the repository:
backend/target/surefire-reports/
docs/AutomatedTestEvidence_RentEasy.md

8. Submission Checklist
| Requirement | Status |
| Refactor branch created | Done: vertical-slice-regression |
| Backend vertical slice refactor | Done |
| Web vertical slice refactor | Done |
| Mobile vertical slice refactor | Done |
| Test plan documentation | Done |
| Backend automated tests | Done: 9 passed |
| Web lint/build verification | Done |
| Mobile verification | Source refactor done; Gradle rerun requires JDK 17 |
| Full regression test report PDF | Done |
| Screenshots | To be added by student |
