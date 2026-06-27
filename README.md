# 💊 MediStock Pro Enterprise AI

> **Production-Ready Healthcare Inventory & Pharmacy Management Platform**

![Node.js](https://img.shields.io/badge/Node.js-20-green) ![React](https://img.shields.io/badge/React-18-blue) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange) ![Python](https://img.shields.io/badge/Python-3.11-yellow) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 🌟 Features

| Module | Features |
|---|---|
| 🏥 **Medicine Inventory** | CRUD, barcode, batch tracking, expiry alerts, stock movements |
| 💊 **POS Billing** | Live medicine search, cart, GST, payment, print receipt |
| 📦 **Purchase Orders** | Create POs, receive stock, track payment status |
| 🧑‍⚕️ **Patient Management** | Profiles, medical history, allergy tracking, purchase history |
| 👨‍⚕️ **Doctor Management** | Profiles, specializations, prescriptions |
| 📋 **Prescriptions** | Digital Rx creation, multi-medicine, link to patient/doctor |
| ⚠ **Expiry Management** | Tabbed view: expired, 30d, 60d, 90d with financial risk |
| 📊 **Reports** | Sales, purchases, inventory, expiry — PDF/Excel export |
| 🤖 **AI Analytics** | ML demand forecasting, anomaly detection, smart recommendations |
| 🔔 **Notifications** | System alerts for low stock, expiry, purchase events |
| 🔐 **RBAC Auth** | 6 roles: Super Admin, Hospital Admin, Pharmacist, Doctor, Staff, Viewer |
| 🛡 **Super Admin Portal** | Hidden route, user management, system settings, audit logs |

---

## 🏗️ Architecture

```
medistock-pro/
├── database/           # MySQL schema + seed data
├── backend/            # Node.js + Express API (MVC)
│   └── src/
│       ├── controllers/  # 12 controllers
│       ├── routes/       # 14 route files
│       ├── middleware/   # Auth, RBAC, Error, Audit
│       └── config/       # DB, JWT, Email
├── frontend/           # React 18 + Vite SPA
│   └── src/
│       ├── pages/        # 18+ pages
│       ├── components/   # Layout (Sidebar, Header)
│       ├── context/      # Auth + Theme context
│       └── services/     # Axios API client
├── ai-service/         # Python Flask ML service
│   ├── app.py          # Random Forest + Isolation Forest
│   └── requirements.txt
├── nginx/              # Reverse proxy config
│   └── nginx.conf
└── docker-compose.yml  # One-command deployment
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- MySQL 8.0
- Python 3.11+
- npm / pip

### 1. Database Setup
```bash
mysql -u root -p
CREATE DATABASE medistock_pro;
USE medistock_pro;
SOURCE database/schema.sql;
SOURCE database/seeds.sql;
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # Edit DB credentials
npm install
npm run dev            # Runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # Runs on http://localhost:3000
```

### 4. AI Service (optional)
```bash
cd ai-service
pip install -r requirements.txt
python app.py          # Runs on http://localhost:5001
```

---

## 🐳 Docker Deployment

```bash
# Copy env file
cp .env.example .env

# Start everything
docker-compose up -d

# App available at:
# http://localhost     (Nginx proxy → Frontend)
# http://localhost/api (Nginx proxy → Backend API)
```

---

## 🔐 Default Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@medistock.com | SuperAdmin@123 |
| Hospital Admin | admin@medistock.com | Admin@123 |
| Pharmacist | pharmacist@medistock.com | Pharmacist@123 |
| Doctor | doctor@medistock.com | Doctor@123 |

> ⚠️ **Change all passwords immediately in production!**

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login |
| GET  | /api/dashboard | Dashboard KPIs & charts |
| GET  | /api/medicines | Medicine list with filters |
| POST | /api/sales | Create sale (POS) |
| POST | /api/purchases | Create purchase order |
| GET  | /api/reports/sales | Sales report |
| POST | /api/ai/demand | ML demand forecast |
| GET  | /api/admin/stats | Super admin statistics |

---

## 🎨 Tech Stack

**Frontend:** React 18, Vite, Framer Motion, Chart.js, Lucide Icons, SweetAlert2  
**Backend:** Node.js 20, Express, MySQL2, JWT, Nodemailer, Helmet  
**AI Service:** Python 3.11, Flask, Pandas, NumPy, Scikit-Learn, Gunicorn  
**DevOps:** Docker, Docker Compose, Nginx, GitHub Actions

---

## 📜 License
MIT — Free for personal and commercial use.

---
*Built with ❤️ by the MediStock Pro team*

