# RentEasy

## 📌 Project Description

RentEasy is a full-stack web application designed to simplify equipment rental management through a secure and user-friendly platform. Users can register, log in, and access protected features within the system.

The platform focuses on enabling users to rent high-value equipment such as cameras and tools through a seamless digital experience. It supports both customers and administrators, offering features like product browsing, cart management, checkout, and inventory control.

RentEasy demonstrates secure authentication, protected routing, and seamless frontend-backend integration within a scalable web application architecture.

---

## 🚀 Technologies Used

### 🔹 Frontend (Web)

* Vite
* React
* TypeScript

### 🔹 Mobile

* Android Studio
* Kotlin (Jetpack Compose)

### 🔹 Backend

* Spring Boot
* Maven
* Java 17
* Spring Security (JWT Authentication)

### 🔹 Database

* Supabase (PostgreSQL)

### 🔹 Tools & IDEs

* VS Code
* IntelliJ IDEA

---

## ⚙️ Steps to Run Backend

1. Navigate to backend folder:

   ```bash
   cd backend
   ```

2. Build the project:

   ```bash
   mvn clean install
   ```

3. Run the Spring Boot application:

   ```bash
   mvn spring-boot:run
   ```

4. Backend will run on:

   ```
   http://localhost:8080
   ```

---

## 🌐 Steps to Run Web App

1. Navigate to frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run development server:

   ```bash
   npm run dev
   ```

4. Open in browser:

   ```
   http://localhost:5173
   ```

---

## 📱 Steps to Run Mobile App

1. Open the project in **Android Studio**

2. Sync Gradle dependencies

3. Connect an emulator or Android device

4. Click **Run ▶️**

---

## 🔗 API Endpoints

### 🔐 Authentication

* `POST /auth/register` – Register user
* `POST /auth/login` – Login user
* `POST /auth/logout` – Logout user

### 📦 Products

* `GET /products` – Get all products
* `GET /products/{id}` – Get product by ID
* `GET /products/search?query=` – Search products

### 🛒 Cart

* `GET /cart` – Get user cart
* `POST /cart/items` – Add item to cart
* `PUT /cart/items/{id}` – Update cart item
* `DELETE /cart/items/{id}` – Remove item

### 📄 Orders

* `POST /orders` – Place order
* `GET /orders/{id}` – Get order details

### 🛠️ Admin

* `POST /admin/products` – Add product
* `PUT /admin/products/{id}` – Update product
* `DELETE /admin/products/{id}` – Delete product
* `GET /admin/orders` – View all orders

---

## 👨‍💻 Author

**Nuevas, Josh Anton K.**
IT342-G1 – System Integration and Architecture

---

## 📄 Version

* Version: 0.2
* Status: Final
* Date: 02/28/2026

---
