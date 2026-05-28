# 🏥 Medical Clinic Management System

A full-stack web application for managing medical clinic appointments, built as a portfolio project to demonstrate modern software engineering and DevOps practices.

## 📋 Overview

This platform allows staff to manage appointments and patients, doctors to manage their schedules and write medical records, and administrators to oversee the entire clinic operation.

## 🚀 Tech Stack

### Application
| Layer | Technology |
|---|---|
| Frontend | React.js 18 + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL 15 |
| Authentication | JWT (JSON Web Tokens) + bcryptjs |
| Email | Nodemailer + Gmail |

### DevOps & Infrastructure
| Tool | Purpose |
|---|---|
| Docker | Containerization (multi-stage builds) |
| Kubernetes | Container orchestration |
| Helm | Kubernetes package manager |
| GitHub Actions | CI/CD Pipeline |
| GitHub Container Registry (GHCR) | Container registry |
| Nginx Ingress | Load balancing & routing |
| cert-manager | Automatic TLS certificate management (planned) |

## 🏗️ Architecture

```
Internet
    ↓
LoadBalancer Service
    ↓
Nginx Ingress Controller
    ↓
┌─────────────────┬─────────────────┐
│    Frontend     │     Backend     │
│  React + Nginx  │  Node.js/Express│
└─────────────────┴────────┬────────┘
                           ↓
                   PostgreSQL 15
```

## 👥 User Roles

| Role | Permissions |
|---|---|
| **Superadmin** | Full access + user management + deactivate users |
| **Admin** | Manage doctors, patients, appointments + onboard users |
| **Staff** | Manage patients and appointments |
| **Doctor** | View own appointments & patients, write medical records, add notes |

## ✨ Features

- 🔐 JWT authentication with role-based access control (RBAC)
- 👥 User management with role assignment
- 📅 Appointment booking and management
- 🩺 Medical records per appointment
- 🔔 Appointment status tracking (pending, confirmed, cancelled, completed)
- 🔄 Password reset via email (Nodemailer + Gmail App Password)
- 🏥 Doctor specialization filtering in appointments
- 📱 Responsive UI with collapsible sidebar
- 🐳 Multi-platform Docker images (amd64 + arm64)
- 📦 Automated versioning via GitHub Actions

## 🗺️ Roadmap

| Feature | Status |
|---|---|
| JWT Authentication | ✅ Done |
| Role-based access control | ✅ Done |
| Appointments management | ✅ Done |
| Medical records | ✅ Done |
| Password reset via email | ✅ Done |
| Responsive sidebar UI | ✅ Done |
| Helm chart deployment | ✅ Done |
| GitHub Actions CI/CD | ✅ Done |
| TLS with cert-manager | 🔜 Planned |
| Patient self-booking portal | 🔜 v2.0 |
| Prometheus + Grafana monitoring | 🔜 Planned |
| Multi-environment (dev/uat/prod) | 🔜 Planned |

## 🗂️ Project Structure

```
Medical-clinic-app/
├── backend/                        # Node.js + Express REST API
│   ├── src/
│   │   ├── config/                 # Database config (pool.js)
│   │   ├── middleware/             # auth.js, roles.js
│   │   ├── routes/                 # API routes
│   │   └── controllers/            # Business logic
│   ├── package.json
│   └── Dockerfile
├── frontend/                       # React.js 18 application
│   ├── src/
│   │   ├── api/                    # Axios API layer (interceptors)
│   │   ├── components/             # Sidebar.jsx
│   │   ├── context/                # AuthContext.jsx
│   │   ├── hooks/                  # useRole.js
│   │   └── pages/                  # Doctors, Patients, Appointments,
│   │                               # MedicalRecords, Users, Login,
│   │                               # ResetPassword
│   ├── nginx.conf
│   ├── vite.config.js
│   └── Dockerfile
├── helm/                           # Helm chart for Kubernetes
│   └── clinic-app/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── deployment-backend.yaml
│           ├── deployment-frontend.yaml
│           ├── service-backend.yaml
│           ├── service-frontend.yaml
│           ├── ingress.yaml
│           ├── configmap.yaml
│           └── secret.yaml
├── .github/
│   └── workflows/
│       ├── build-backend.yml       # Build & push backend image
│       └── build-frontend.yml      # Build & push frontend image
├── docker-compose.yml              # Local development setup
├── .env.example                    # Environment variables template
└── README.md
```

## 🛠️ Local Development

### Prerequisites

- Docker Desktop
- Node.js 18+
- kubectl
- helm
- minikube

### Getting Started with Docker Compose

```bash
# Clone the repository
git clone https://github.com/ionutsandu1996/Medical-clinic-app.git
cd Medical-clinic-app

# Copy environment variables
cp .env.example .env

# Edit .env with your values
# (PostgreSQL connection, JWT secret, Gmail credentials)

# Start all services
docker-compose up -d

# Backend:   http://localhost:3001
# Frontend:  http://localhost:5173
# PostgreSQL: localhost:5432
```

### Getting Started with Kubernetes (minikube)

```bash
# Start minikube
minikube start --driver=docker

# Enable ingress addon
minikube addons enable ingress

# Add Bitnami Helm repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Download Helm dependencies
helm dependency update helm/clinic-app

# Deploy to cluster
helm upgrade --install clinic-app helm/clinic-app \
  --namespace clinic \
  --create-namespace \
  --set secret.DB_PASSWORD=yourpassword \
  --set secret.POSTGRES_PASSWORD=yourpassword \
  --set secret.JWT_SECRET=yourjwtsecret \
  --set secret.GMAIL_USER=youremail@gmail.com \
  --set secret.GMAIL_APP_PASSWORD=yourgmailapppassword

# Access the application
kubectl port-forward service/clinic-app-frontend 8080:80 -n clinic
# Open http://localhost:8080
```

### First Time Setup

After deployment, create the superadmin user:

```bash
# Connect to PostgreSQL
kubectl exec -it clinic-app-postgresql-0 -- psql -U clinic_user -d clinic_db -W

# Generate bcrypt hash for your password (run locally)
node -e "const b=require('bcryptjs');b.hash('YourPassword123!',10).then(h=>console.log(h))"

# Insert superadmin
INSERT INTO users (email, password_hash, role)
VALUES ('admin@yourclinic.com', 'HASH_HERE', 'superadmin');
```

## 🔄 CI/CD Pipeline

```
git push (main)
    ↓
GitHub Actions triggered (path filter)
    ↓
Build multi-platform Docker image (amd64 + arm64)
    ↓
Push to GHCR with version tags
    ↓
Increment version in GitHub Variables
    ↓
Build summary report
```

### Workflows

| Workflow | Trigger | Description |
|---|---|---|
| `build-backend.yml` | Push to `main/backend/**` | Build & push backend image |
| `build-frontend.yml` | Push to `main/frontend/**` | Build & push frontend image |

### Image Versioning

Versions are stored as GitHub Variables (`BACKEND_VERSION`, `FRONTEND_VERSION`) and auto-incremented on each build.

```
ghcr.io/ionutsandu1996/medical-clinic-app/clinic-backend:latest
ghcr.io/ionutsandu1996/medical-clinic-app/clinic-backend:v1.0.x
ghcr.io/ionutsandu1996/medical-clinic-app/clinic-backend:abc1234

ghcr.io/ionutsandu1996/medical-clinic-app/clinic-frontend:latest
ghcr.io/ionutsandu1996/medical-clinic-app/clinic-frontend:v1.0.x
ghcr.io/ionutsandu1996/medical-clinic-app/clinic-frontend:abc1234
```

## 📡 API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login with email & password |
| GET | /api/auth/me | Get current user info |
| POST | /api/auth/reset-password | Reset password with token |

### Users (Admin+)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/users | Get all users |
| POST | /api/users | Create new user |
| PUT | /api/users/:id | Update user role |
| DELETE | /api/users/:id | Deactivate user (Superadmin) |
| POST | /api/users/:id/reset-password | Send password reset email |

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/doctors | Get all active doctors |
| GET | /api/doctors/:id | Get doctor by ID |
| POST | /api/doctors | Create doctor (Admin+) |
| PUT | /api/doctors/:id | Update doctor (Admin+) |
| DELETE | /api/doctors/:id | Deactivate doctor (Admin+) |

### Patients
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/patients | Get patients (doctors see only theirs) |
| GET | /api/patients/:id | Get patient by ID |
| POST | /api/patients | Create patient (Staff+) |
| PUT | /api/patients/:id | Update patient (Staff+) |
| DELETE | /api/patients/:id | Delete patient (Staff+) |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/appointments | Get appointments (doctors see only theirs) |
| GET | /api/appointments/:id | Get appointment by ID |
| POST | /api/appointments | Create appointment (Staff+) |
| PUT | /api/appointments/:id | Update (doctors can update notes only) |
| DELETE | /api/appointments/:id | Cancel appointment (Staff+) |

### Medical Records
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/medical-records/patient/:id | Get patient records |
| GET | /api/medical-records/:id | Get record by ID |
| POST | /api/medical-records | Create record (Doctor+) |
| PUT | /api/medical-records/:id | Update (doctors update notes only) |

### Specializations
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/specializations | Get all specializations |

## 🗄️ Database Schema

```
specializations
      ↑
   doctors ←──────────────────────┐
      │                           │
      ↓                           │
doctor_schedules             appointments ──→ patients
                                  ↓
                            medical_records

users (authentication)
  └── doctor_id (optional FK → doctors)
```

## 🔐 Authentication Flow

```
1. Login (email + password)
2. Backend verifies bcrypt hash
3. JWT token generated (12h expiry)
4. Token stored in localStorage
5. Axios interceptor adds Bearer token to every request
6. Backend middleware validates token on protected routes
7. Role middleware checks permissions per endpoint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.