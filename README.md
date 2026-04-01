# 🎧 HelpDesk Pro — Enterprise IT Support System

A full-stack enterprise IT helpdesk system with role-based access control, real-time notifications, AI chatbot support, and SLA monitoring.

🔗 **Live Demo:** [https://it-helpdesk-ifu2zo9jy-sravanip2165-9382s-projects.vercel.app](https://it-helpdesk-ifu2zo9jy-sravanip2165-9382s-projects.vercel.app)

---

## 🚀 Features

### 👤 Three Role System
- **Admin** — Manage users, assets, incidents, and view reports
- **Engineer** — Handle assigned tickets, SLA monitoring, knowledge base
- **Employee** — Raise incidents, track status, chat with AI assistant

### ⚡ Core Functionality
- **Real-time updates** — Live incident status changes and comments via Socket.io
- **Smart Auto-Assignment** — Tickets assigned to engineers based on skills and workload
- **SLA Monitoring** — Track SLA compliance with breach detection and performance metrics
- **AI Chatbot** — Google Gemini powered IT support assistant for employees
- **Knowledge Base** — IT troubleshooting guides and articles for engineers
- **Reports & Analytics** — Export incident reports as PDF and Excel
- **Asset Management** — Track company IT assets and assignments
- **Notifications** — Real-time bell notifications for all roles

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| React.js | UI framework |
| Redux Toolkit | State management |
| Tailwind CSS | Styling |
| Socket.io Client | Real-time communication |
| Lucide React | Modern icon library |
| Recharts | Data visualization |
| Axios | HTTP requests |

### Backend
| Technology | Usage |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time events |
| JWT | Authentication |
| Google Gemini API | AI Chatbot |
| PDFKit + ExcelJS | Report generation |

### DevOps
| Technology | Usage |
|---|---|
| MongoDB Atlas | Cloud database |
| Render | Backend hosting |
| Vercel | Frontend hosting |
| GitHub | Version control |

---

## 📁 Project Structure

```
it-helpdesk/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Seed data
│   └── server.js        # Entry point
├── frontend/
│   └── src/
│       ├── api/         # Socket client
│       ├── components/  # Layout, ChatBot
│       ├── features/    # Redux slices
│       ├── pages/
│       │   ├── admin/   # Admin pages
│       │   ├── employee/# Employee pages
│       │   ├── engineer/# Engineer pages
│       │   ├── auth/    # Login, Register
│       │   └── shared/  # Incident detail, Profile
│       └── routes/      # Protected routes
└── README.md
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@helpdesk.com | admin123 |
| Engineer | engineer@helpdesk.com | engineer123 |
| Employee | employee@helpdesk.com | employee123 |

> You can also register a new account as Employee.

---

## 💻 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### 1. Clone the repository
```bash
git clone https://github.com/Sravanip2165/it-helpdesk.git
cd it-helpdesk
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:
```bash
node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm start
```

The app will run at `http://localhost:3000`

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://it-helpdesk-ifu2zo9jy-sravanip2165-9382s-projects.vercel.app |
| Backend | Render | https://it-helpdesk-ee86.onrender.com |
| Database | MongoDB Atlas | Cluster0 |

---

## 📸 Pages Overview

| Page | Role | Description |
|------|------|-------------|
| Dashboard | All | Role-specific overview with stats |
| Incidents | All | Create, view, and manage incidents |
| Incident Detail | All | Real-time comments and status updates |
| SLA Monitor | Engineer | Track SLA compliance and breaches |
| Knowledge Base | Engineer | IT troubleshooting articles |
| Manage Users | Admin | Create and manage user accounts |
| Manage Assets | Admin | Track IT assets |
| Reports | Admin | Export PDF/Excel reports |
| AI Chatbot | Employee | Gemini-powered IT support assistant |
| Profile | All | View account details |

---




