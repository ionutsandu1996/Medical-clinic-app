markdown# 🏥 Medical Clinic Management System

A full-stack web application for managing medical clinic appointments, built as a portfolio project to demonstrate modern software engineering and DevOps practices.

## 📋 Overview

This platform allows patients to book appointments with doctors, doctors to manage their schedules and write medical records, and administrators to oversee the entire clinic operation.

## 🚀 Tech Stack

### Application
| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Authentication | Firebase Auth (Google OAuth + Email/Password) |

### DevOps & Infrastructure
| Tool | Purpose |
|---|---|
| Docker | Containerization (multi-stage builds) |
| Kubernetes | Container orchestration |
| Helm | Kubernetes package manager |
| Jenkins | CI/CD Pipeline |
| DockerHub | Container registry |
| Prometheus + Grafana | Monitoring & alerting |

## 🏗️ Architecture
React Frontend
↓
Firebase Auth
↓
Node/Express REST API
↓
PostgreSQL Database

## 👥 User Roles

| Role | Permissions |
|---|---|
| **Admin** | Manage doctors, specializations, view all data |
| **Doctor** | View own appointments, write medical records |
| **Patient** | Book appointments, view own history |

## ✨ Features

- 🔐 Role-based access control (Admin, Doctor, Patient)
- 📅 Appointment booking and management
- 🩺 Medical records per appointment
- 🗓️ Doctor schedule management
- 🔔 Appointment status tracking (pending, confirmed, cancelled, completed)
- 📊 Monitoring dashboard with Prometheus + Grafana

## 🗂️ Project Structure
Medical-clinic-app/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Database & Firebase config
│   │   ├── middleware/       # Auth & role middleware
│   │   ├── routes/           # API routes
│   │   └── controllers/      # Business logic
│   └── Dockerfile
├── frontend/                 # React.js application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Application pages
│   │   └── context/          # React context (auth, etc.)
│   └── Dockerfile
├── helm/                     # Helm charts for Kubernetes
│   └── clinic-app/
│       ├── values-dev.yaml
│       ├── values-uat.yaml
│       └── values-prod.yaml
├── jenkins/                  # CI/CD pipeline
│   └── Jenkinsfile
├── db/                       # Database migrations
│   └── init.sql
└── docker-compose.yml        # Local development setup

## 🛠️ Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Firebase project

### Getting Started

```bash
# Clone the repository
git clone https://github.com/ionutsandu1996/Medical-clinic-app.git
cd Medical-clinic-app

# Copy environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Fill in your environment variables
# (Firebase credentials, PostgreSQL connection, etc.)

# Start all services
docker-compose up -d

# Backend runs on http://localhost:3000
# Frontend runs on http://localhost:5173
# PostgreSQL runs on localhost:5432
```

## 🔄 CI/CD Pipeline
Code Push → Jenkins → Build Docker Image → Push to DockerHub → Helm Deploy → Kubernetes

### Environments
| Environment | Namespace | Purpose |
|---|---|---|
| dev | dev | Development & testing |
| uat | uat | User acceptance testing |
| prod | prod | Production |

## 📡 API Endpoints

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/doctors | Get all doctors |
| GET | /api/doctors/:id | Get doctor by ID |
| POST | /api/doctors | Create doctor (Admin) |
| PUT | /api/doctors/:id | Update doctor (Admin) |
| DELETE | /api/doctors/:id | Delete doctor (Admin) |

### Patients
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/patients | Get all patients (Admin) |
| GET | /api/patients/:id | Get patient by ID |
| POST | /api/patients | Create patient |
| PUT | /api/patients/:id | Update patient |
| DELETE | /api/patients/:id | Delete patient (Admin) |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/appointments | Get all appointments |
| GET | /api/appointments/:id | Get appointment by ID |
| POST | /api/appointments | Create appointment |
| PUT | /api/appointments/:id | Update appointment |
| DELETE | /api/appointments/:id | Cancel appointment |

### Medical Records
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/medical-records/:patientId | Get patient records |
| POST | /api/medical-records | Create record (Doctor) |
| PUT | /api/medical-records/:id | Update record (Doctor) |

## 🗄️ Database Schema
specializations
↑
doctors ←──────────────┐
↓                   │
doctor_schedules    appointments ──→ patients
↓
medical_records

## 📈 Monitoring

- **Prometheus** — metrics collection
- **Grafana** — visualization dashboards
- **Alerts** — configured for pod failures, high CPU/memory

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.