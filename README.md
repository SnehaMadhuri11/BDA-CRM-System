# 🏭 BDA CRM Dashboard - Manufacturing Company

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-brightgreen)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Project Overview

A **full-stack CRM application** designed specifically for **manufacturing companies** to manage their sales pipeline, track leads, manage clients, and monitor BDA (Business Development Associate) team performance. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

### 🎯 Key Features

- ✅ **Role-Based Access Control** (Admin & BDA modules)
- ✅ **Lead Management** with pipeline stages
- ✅ **Client Management** with status tracking
- ✅ **Follow-up Scheduling** with AM/PM time selection
- ✅ **Team Management** (Admin-only view)
- ✅ **Reports & Analytics** with interactive charts
- ✅ **Dark Mode Support** (Global toggle)
- ✅ **Export to CSV** functionality
- ✅ **Responsive Design** (Mobile & Desktop friendly)

---

## 🚀 Live Demo & Access

### 🌐 Live URL
👉 **[Click Here to View the Live App](https://bda-crm-frontend.onrender.com)**

> ⚠️ **Note on Loading Time:** This application is hosted on Render's free tier. If the link has been inactive, the backend cloud server may take **1–2 minutes to spin up** and load the initial login. Once awake, navigation and features run completely smoothly.

### 🔑 Tester Credentials

Please use the pre-configured credentials below to review both sides of the module:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `recruiter@test.com` | `admin09` | Full Dashboard, Team Management, Analytics |
| **BDA Employee** | `priya@gmail.com` | `priya123` | Assigned Leads, Personal Follow-ups |

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI Architecture
- **Tailwind CSS** - Modern Utility Styling
- **Recharts** - Data & Pipeline Visualization
- **Lucide React** - Icon Library
- **Axios** - Async API Requests
- **React Router DOM** - Application Navigation

### Backend
- **Node.js & Express.js** - Server Runtime & Routing
- **MongoDB Atlas** - Cloud Database Storage
- **Mongoose** - Object Data Modeling (ODM)
- **JSON Web Tokens (JWT)** - Secure Authentication
- **Bcryptjs** - Password Encryption Hashing

---

## 📁 Project Structure


```

bda-crm-dashboard/
├── server/                    # Backend Node.js Environment
│   ├── controllers/          # Business logic & API handlers
│   ├── models/               # MongoDB Mongoose Schemas
│   ├── routes/               # Express API Endpoint mappings
│   ├── middleware/           # JWT & Route Authorization guards
│   ├── config/               # Database connection scripts
│   └── server.js             # Main App Entry Point
│
├── client/                   # Frontend React Application
│   ├── src/
│   │   ├── components/       # UI Components (Buttons, Modals, Cards)
│   │   ├── pages/            # View Layouts (Dashboard, Leads, Login)
│   │   ├── context/          # Global Auth & Theme State
│   │   └── App.js            # Router Router Configuration
│   └── package.json
└── README.md

```

---

## 🏃‍♂️ Local Installation & Run Guide

### Prerequisites
- Node.js (v18.x or higher)
- MongoDB Atlas account or Local MongoDB Community Server

### Step 1: Clone the Project
```bash
git clone [https://github.com/yourusername/bda-crm-dashboard.git](https://github.com/yourusername/bda-crm-dashboard.git)
cd bda-crm-dashboard

```

### Step 2: Backend Environment Configuration

1. Navigate to the server folder and install dependencies:

```bash
   cd server
   npm install

```

2. Create a `.env` file inside the `server/` root directory:

```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_string
   JWT_EXPIRE=30d

```

3. Boot the backend server:

```bash
   npm run dev

```

### Step 3: Frontend Client Setup

1. Open a new terminal window, navigate to the client folder, and install packages:

```bash
   cd client
   npm install

```

2. Start the local server:

```bash
   npm start

```

The application will automatically launch on **`http://localhost:3000`**

---

## 📊 API Architecture Matrix

| Method | Endpoint | Description | Token Access |
| --- | --- | --- | --- |
| **POST** | `/api/auth/register` | User Account Sign Up | Public |
| **POST** | `/api/auth/login` | User Authentication Token Issuance | Public |
| **GET** | `/api/leads` | Retrieve Application Leads | Authenticated |
| **POST** | `/api/leads` | Create a New Lead | Authenticated |
| **PUT** | `/api/leads/:id` | Update Lead Sales Stage | Authenticated |
| **GET** | `/api/reports/team-performance` | Access BDA Metrics Tracking | **Admin Only** |

---

## 👥 Module User Permissions

### 👑 Admin Management Scope

* Complete access to all company-wide leads, pipelines, and performance data.
* Ability to dynamically assign incoming corporate leads to specific BDA team members.
* Exclusive access to Team Management to register or offboard BDA staff accounts.

### 💼 Business Development Associate (BDA) Scope

* Streamlined dashboard showing only leads directly assigned to them.
* Operations mapping to update leads through stages (*New Lead → Contacted → Proposal Sent → Won/Lost*).
* Personal follow-up scheduling module with contextual logs.

---

## 🤝 Contact & Support

**Snehamadhuri**

* **GitHub:** [Snehamadhuri11](https://github.com/Snehamadhuri11) 
* **Email:** vakkalagaddasnehamadhuri77@gmail.com

If you run into any issues booting or evaluating the CRM dashboard, please feel free to open a repository issue or reach out directly!

```

