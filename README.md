---
<p align="center">
  <img src="https://github.com/aunghein-dev/frontend_stocksManagement/blob/main/public/applogo.png?raw=true" alt="Openware Logo" width="100"/>
</p>

# Openware Stock Manager

Openware Stock Manager is a modern, intuitive, and robust Point-of-Sale (POS) inspired web application designed to streamline inventory management for businesses. Built with a powerful **Next.js** frontend and a secure **Spring Boot** backend, it leverages **PostgreSQL** and **Supabase** for efficient and scalable data management, featuring a multi-tenant architecture with single-database tenancy.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Architecture](#architecture)
  - [Frontend (Next.js)](#frontend-nextjs)
  - [Backend (Spring Boot)](#backend-spring-boot)
  - [Database (PostgreSQL)](#database-postgresql)
  - [Supabase](#supabase)
  - [Tenant Isolation (Single DB Multi-Tenancy)](#tenant-isolation-single-db-multi-tenancy)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
    - [PostgreSQL Database](#postgresql-database)
    - [Supabase](#supabase-1)
    - [Environment Variables (General)](#environment-variables-general)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

### Application Preview

#### 🖥️ Desktop Preview

![Desktop UI Preview](https://github.com/aunghein-dev/frontend_stocksManagement/raw/main/public/desktopPreview.png)
![Desktop UI Preview](https://github.com/aunghein-dev/frontend_stocksManagement/raw/main/public/desktopPreview1.png)
![Desktop UI Preview](https://github.com/aunghein-dev/frontend_stocksManagement/raw/main/public/desktopPreview2.png)

#### 📱 Mobile Preview

<img src="https://github.com/aunghein-dev/frontend_stocksManagement/raw/main/public/mobilePreview.png" alt="Mobile UI Preview" width="300" />

---

## Features

- **Modern POS-style Interface:** Enjoy a clean, user-friendly design inspired by modern Point-of-Sale systems for efficient stock management.
- **Real-time Inventory Tracking:** Keep tabs on stock levels, product movements, and inventory adjustments in real-time.
- **Product Management:** Easily add, edit, and categorize products with detailed information.
- **Order Management:** Create and manage sales orders, track order status, and process transactions seamlessly.
- **User Authentication & Authorization:** Secure access with **JWT-based authentication** for various user roles.
- **Multi-Tenant Architecture:** Benefit from single database tenancy with secure data isolation for each account via unique `account_id` and JWT claims.
- **Search & Filtering:** Quickly find products and orders with powerful search and filtering capabilities.
- **Responsive Design:** Optimized for various devices, from desktops to tablets, ensuring a consistent experience.
- **Scalable Backend:** Rely on a robust **Spring Boot** backend designed for high performance and scalability.
- **Supabase Integration:** Leverage **Supabase** for seamless database interactions and extended authentication features.

---

## Technologies Used

**Frontend:**

- **Next.js:** A powerful React framework for production, offering server-side rendering (SSR) and static site generation (SSG).
- **React:** For building dynamic and responsive user interfaces.
- **Tailwind CSS:** For rapid and consistent styling.
- **React Query:** For efficient data fetching, caching, and synchronization.
- **Formik/Yup:** For streamlined form management and validation.

**Backend:**

- **Spring Boot:** A robust framework for building stand-alone, production-grade Spring-based applications.
- **Java:** The primary programming language.
- **PostgreSQL:** A powerful open-source relational database.
- **Supabase:** A Backend-as-a-Service providing authentication, real-time database, and more.
- **Spring Data JPA:** For easy data access with relational databases.
- **Spring Security:** For comprehensive authentication and authorization with JWT.
- **Lombok:** To reduce boilerplate code.

---

## Architecture

The Openware Stock Manager employs a microservices-inspired architecture with a clear separation of concerns:

- **Frontend (Next.js):** Manages the user interface, routing, and client-side logic. It communicates with the Spring Boot backend via RESTful APIs.
- **Backend (Spring Boot):** Provides the core business logic, data persistence, and API endpoints. It interacts directly with the PostgreSQL database.
- **Database (PostgreSQL):** Stores all application data.
- **Supabase:** Primarily used for its **authentication capabilities**, acting as an identity provider, and potentially for real-time features if integrated. The `account_id` is a crucial element in the JWT, enabling the backend to filter data for the correct tenant within the single PostgreSQL database.

**Tenant Isolation (Single DB Multi-Tenancy):**  
Each customer account has a unique `account_id` embedded within the JWT upon successful authentication. All database queries made by the Spring Boot backend include a filter based on this `account_id`, ensuring strict data isolation between tenants within the same PostgreSQL database.

---

## Getting Started

Follow these instructions to get a copy of the project up and running on local machine for development and testing.

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** or **Yarn**
- **Java Development Kit (JDK)** (Version 17 or higher recommended)
- **Maven** or **Gradle** (for Spring Boot backend)
- **PostgreSQL** database instance
- **Supabase Account** (for authentication and other services)

### Installation

1. **Clone the repositories:**

```bash
git clone https://github.com/aunghein-dev/frontend_stocksManagement.git
git clone https://github.com/aunghein-dev/backend_stocksManagement.git
```

2. **Frontend Installation:**

```bash
cd frontend_stocksManagement
npm install # or yarn install
```

3. **Backend Installation:**

```bash
cd backend_stocksManagement
# If using Maven:
mvn clean install
# If using Gradle:
./gradlew clean build
```

### Configuration

#### PostgreSQL Database

1. Create a new PostgreSQL database for Openware Stock Manager:

```sql
CREATE DATABASE openware_stock_manager;
```

2. Update the database connection details in the backend's `application.properties` (or `application.yml`):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/openware_stock_manager
spring.datasource.username=_pg_username
spring.datasource.password=_pg_password
spring.jpa.hibernate.ddl-auto=update
```

#### Supabase

1. Create a new project in Supabase.
2. Configure authentication settings (e.g., enable email/password login).
3. Get Supabase Project URL and Anon Key.
4. Update the frontend `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=_SUPABASE_ANON_KEY
```

5. Add Supabase JWT secret to backend config:

```properties
app.jwt.supabase-secret=_SUPABASE_JWT_SECRET
```

#### Environment Variables (General)

Make sure to define all required variables in `.env` files for both frontend and backend.

### Running the Application

1. **Start the Backend:**

```bash
cd backend_stocksManagement
mvn spring-boot:run # or ./gradlew bootRun
```

2. **Start the Frontend:**

```bash
cd frontend_stocksManagement
npm run dev # or yarn dev
```

---

## Usage

Open `http://localhost:3000` in browser.

- **Sign Up / Log In:** Auth via Supabase.
- **Manage Products:** Create/edit products.
- **Process Orders:** Use POS-like order flow.

---

## Deployment

- **Frontend:** Deploy via Vercel, Netlify, or server.
- **Backend:** Deploy via Heroku, EC2, Cloud Run, etc.
- **Database:** Use PostgreSQL managed service.
- **Supabase:** Hosted automatically.

**Production Tips:**

- Set `ddl-auto=none` or `validate`
- Configure CORS and secure env vars
- Add logging and monitoring

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/-feature`
3. Make and test changes
4. Commit: `git commit -m "feat:  change"`
5. Push: `git push origin feature/-feature`
6. Open a Pull Request

---

## License

MIT License – see the [LICENSE](LICENSE) file

---

## Contact

- 📧 Email: [aunghein.mailer@gmail.com](mailto:aunghein.mailer@gmail.com)
- 🌐 Website: [https://app.openwaremyanmar.site](https://app.openwaremyanmar.site)
- 🐛 GitHub Issues: [Open an Issue](https://github.com/aunghein-dev/frontend_stocksManagement/issues)
