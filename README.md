# CivicEase — Public Service & Grievance Redressal Portal

**Every Citizen Matters. Every Request Counts.**

Accessible Digital Public Service & Grievance Redressal Portal for all citizens.

---

## 🌐 Live Website Links

| Page / Feature | Live URL | Description |
| :--- | :--- | :--- |
| **Citizen Home Portal** | [Open Portal](https://hskruthika814.github.io/Public-Services-Within-Everyone-s-Reach/) | Main public landing page, category overview, accessibility toolbar. |
| **Submit Service Request** | [Submit Request](https://hskruthika814.github.io/Public-Services-Within-Everyone-s-Reach/#/submit) | Multi-step request submission with automatic priority detection & contact capture. |
| **Track Request (with Audio)** | [Track Request](https://hskruthika814.github.io/Public-Services-Within-Everyone-s-Reach/#/track) | Real-time status tracker, submitter info, and **🔊 Read Status Aloud**. |
| **Create Account** | [Create Account](https://hskruthika814.github.io/Public-Services-Within-Everyone-s-Reach/#/login) | Citizen account registration with Name and Mail ID. |
| **Complaint Tracker Dashboard** | [Review Dashboard](https://hskruthika814.github.io/Public-Services-Within-Everyone-s-Reach/#/dashboard) | Review console showing submitted complaints, status review, & voice readout. |
| **Unified Single-Page Portal** | [Unified Portal](https://hskruthika814.github.io/Public-Services-Within-Everyone-s-Reach/portal.html) | Standalone all-in-one portal with submit, track, and demo login. |

> 💻 **Local Development Server:** If running locally, the dev server runs at `http://localhost:5173/`.

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@civicease.demo` | `Admin@123` | Full portal oversight across all departments |
| **Supervisor** | `supervisor@civicease.demo` | `Super@123` | Department supervisor access & escalation review |
| **Electrical Dept Staff** | `staff.elec@civicease.demo` | `Staff@123` | Electricity & Power Department queue |
| **Citizen Account** | `citizen1@civicease.demo` | `Citizen@123` | Pre-registered citizen account with request history |

---

## ✨ Key Features

1. **Brand Identity & Modern Interface**:
   - Official **CivicEase** branding with civic arch emblem, golden beacon star, and dynamic blue bridge swoosh.
   - Contrast modes (Normal & High Contrast), adjustable font sizes (A, A+, A++), keyboard-accessible design.

2. **🔊 Text-to-Speech Voice Status Readout**:
   - Web Speech API integration that speaks out the Tracking ID, Submitter Name, Issue Title, Current Status, Assigned Department, and Resolution Remarks.

3. **📋 Complaint Tracker & Review Dashboard**:
   - Dedicated review console at `/dashboard` displaying all citizen & guest requests.
   - Explicit Submitter Information displayed for every complaint:
     - 👤 **Full Name**
     - ✉️ **Email Address**
     - 📞 **Phone Number**
   - Quick status update selector (`Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`).
   - "Review & Notes" modal to record investigation updates and resolution remarks.
   - Instant search and multi-criteria filtering.

4. **Smart Routing & Safety Priority Engine**:
   - Keyword safety analyzer scans requests for emergencies (e.g. *live wire*, *gas leak*, *pipe burst*).
   - Automatically escalates emergencies to **Critical Priority** with a strict 4-hour SLA.
   - Deterministic rule engine routes complaints directly to responsible municipal departments.

---

## 💻 Tech Stack & Architecture

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Web Speech API.
* **Backend**: Python 3, Flask, SQLAlchemy, SQLite, Flask-JWT-Extended, Flask-Limiter.
* **Architecture**: Decoupled REST architecture with support for both Vite dev port (5173) and Flask unified static bundle (5000).

---

## 🚀 Running Locally

### Backend Server
```bash
cd backend
python app.py
# Runs at http://localhost:5000
```

### Frontend Server
```bash
cd frontend
npm run dev
# Runs at http://localhost:5173
```
