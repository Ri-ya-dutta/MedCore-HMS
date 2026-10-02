# MedCore HMS 🏥

MedCore HMS is a full-stack Hospital Management System designed to manage core hospital workflows including patients, doctors, appointments, medical records, prescriptions, laboratory operations, billing, and administrative management.

The project is being developed with a focus on **secure authentication, role-based access control, structured healthcare workflows, REST APIs, and production deployment**.

---

## 🚀 Project Status

**Current milestone: Backend MVP deployed and production-verified**

The core backend foundation and initial hospital-management modules have been implemented, tested, and deployed to Render.

The React frontend and remaining clinical/business modules are currently under development.

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* PostgreSQL
* `pg` (node-postgres)
* JWT
* bcryptjs
* REST APIs

### Frontend

* React
* Vite
* Axios *(API integration phase)*

### Deployment

* Render Web Service
* Render PostgreSQL
* GitHub

---

## 👥 User Roles

MedCore HMS is designed around four primary roles:

* **Admin**
* **Doctor**
* **Receptionist**
* **Patient**

Role-based authorization is implemented on protected backend routes.

---

## ✅ Implemented Backend Modules

### Authentication & Authorization

* User registration
* User login
* Password hashing with bcrypt
* JWT-based authentication
* Authenticated user profile endpoint
* Role-based authorization
* Active/inactive account handling

### Admin Management

* Hospital management
* Department management
* User management
* User role management
* User activation/deactivation
* Doctor management
* Patient account linking

### Patient Management

* Create patient
* View patient
* Update patient
* Patient listing
* Patient search
* Patient self-profile
* Patient ownership authorization

### Appointment Management

* Create appointments
* View appointments
* Update appointments
* Appointment status management
* Doctor ownership authorization
* Patient ownership authorization
* Double-booking prevention
* Cancelled-slot reuse

---

## 🗄️ Database

The application uses **PostgreSQL** as its relational database.

The current database schema contains the following core tables:

* `user`
* `hospital`
* `department`
* `doctor`
* `patient`
* `appointment`
* `encounter`
* `vitals`
* `prescription`
* `prescriptionItem`
* `labOrder`
* `labResult`
* `invoice`
* `invoiceItem`

The production database schema is maintained in:

```text
server/database/schema.sql
```

Local development and production use separate PostgreSQL databases.

---

## 🔐 Security

The backend currently includes:

* JWT authentication
* Password hashing using bcrypt
* Role-based authorization
* Protected API routes
* Resource ownership checks
* Patient account linking validation
* Doctor appointment ownership checks
* Active user validation
* Parameterized PostgreSQL queries
* Environment-based configuration

Sensitive credentials such as database connection strings and JWT secrets are stored through environment variables and are not committed to the repository.

---

## 🌐 Production Deployment

The backend has been deployed to **Render**.

### Production architecture

```text
GitHub
   │
   │ feature/migrate-to-pg
   ▼
Render Web Service
   │
   │ Internal Database URL
   ▼
Render PostgreSQL
```

### Production verification completed

* `GET /` → API health verified
* `GET /pg-test` → PostgreSQL connection verified
* Production Admin login → verified
* JWT authentication → verified
* `GET /api/auth/me` → verified

The production database was initialized using the project's schema without copying local development/test data.

---

## 📁 Backend Structure

```text
server/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── app.js
├── database/
│   └── schema.sql
├── .env
├── package.json
└── server.js
```

Environment variables are kept in `.env` and excluded from Git.

---

## 🔄 Core Hospital Workflow

The planned clinical workflow is:

```text
Patient
   ↓
Appointment
   ↓
Doctor
   ↓
Encounter
   ↓
Vitals + Diagnosis + Clinical Notes
   ↓
Prescription / Laboratory
   ↓
Invoice
```

The system is designed so that an **Encounter represents the actual clinical visit**, while an Appointment represents the scheduled visit.

---

## ⏳ Upcoming Modules

The following modules are planned for the next development phases:

* Encounter / Medical Records
* Vitals
* Diagnosis and Clinical Notes
* Prescription Management
* Laboratory Management
* Billing and Invoices
* React Frontend
* API Integration with Axios
* Role-specific dashboards
* Admin Dashboard
* Validation and security hardening
* Full end-to-end testing
* Final production deployment

---

## 🌿 Current Development Branch

The current backend deployment work is being developed on:

```text
feature/migrate-to-pg
```

The `main` branch is being kept separate until the current development milestone is fully stabilized.

---

## 📌 Development Approach

The project is developed incrementally using the following workflow:

```text
BUILD
  ↓
TEST
  ↓
VERIFY
  ↓
GIT STATUS / DIFF
  ↓
COMMIT
  ↓
PUSH
  ↓
DOCUMENT
  ↓
NEXT CHECKPOINT
```

This approach is used to keep the implementation testable, traceable, and deployment-ready throughout development.

---

## 🎯 Final Goal

The final MVP aims to provide a complete hospital workflow covering:

```text
Authentication
      ↓
Patient Management
      ↓
Appointment Management
      ↓
Doctor Management
      ↓
Encounter / Medical Records
      ↓
Vitals / Diagnosis
      ↓
Prescription / Laboratory
      ↓
Billing
      ↓
Admin Dashboard
```

with:

**Authentication + RBAC + Validation + Error Handling + Testing + Production Deployment**
