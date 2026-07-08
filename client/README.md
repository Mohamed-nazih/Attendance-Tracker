<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/calendar-check.svg" alt="AttendFlow Logo" width="80" height="80" />
  <h1>AttendFlow</h1>
  <p><strong>A modern, role-based attendance management system built with React.</strong></p>

  [![React](https://img.shields.io/badge/React-18.0-blue.svg?style=flat&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

<br />

> **Live Demo:** [attendance-tracker-five-weld.vercel.app](https://attendance-tracker-five-weld.vercel.app/)

AttendFlow is a high-fidelity frontend prototype designed to streamline college attendance tracking. It replaces clunky manual spreadsheets with a seamless, digital experience featuring strict role-based access control (RBAC), real-time attendance analytics, and a striking, brutalist-inspired UI.

---

## ✨ Key Features

### 🔐 Strict Role-Based Access Control (RBAC)
- **Admin Dashboard:** Add/remove students, reset student passwords, edit historical attendance records, and oversee class averages.
- **Teacher Dashboard:** Mark morning and afternoon attendance, generate printable reports, and track overall student metrics.
- **Student Dashboard:** View real-time attendance status, calculate GPA, and predict future attendance percentages using the custom toolkit.

### ⚡ Optimistic UI Updates & Race Condition Safety
Built to be lightning-fast. Attendance marking happens instantly on the UI while state updates process asynchronously. Custom "Hold-to-Submit" buttons prevent accidental submissions using safely decoupled React `useEffect` hooks.

### 📊 Real-Time Analytics Engine
Calculates working days, session attendances (Present/Absent/On-Duty), and semester-over-semester percentages instantly on the client side using the React Context API.

---

## 🛠 Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **State Management:** React Context API (Simulating relational database schemas)
- **Styling:** Custom CSS (Brutalist aesthetic)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Data Persistence:** LocalStorage (Prototype mode)

---

## 🚀 Getting Started

To run AttendFlow locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/Mohamed-nazih/Attendance-Tracker.git
cd Attendance-Tracker/client
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Start the development server
```bash
npm run dev
# or
yarn dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📖 Usage Guide & Default Demo Accounts

Since the application runs in a prototype mode (`isDemoMode = true`), it relies on local storage to mock a backend database. You can log in using the following default accounts, or create a new student account via the registration portal.

### Admin Account
- **Username / Email:** `admin@attendflow.com`
- **Password:** `admin123`

### Teacher Account
- **Username / Email:** `teacher@attendflow.com`
- **Password:** `teacher123`

*(Note: Teachers can also register new accounts, but they require admin approval before accessing the dashboard.)*

### Student Registration
To test the student workflow:
1. Log in as an **Admin**.
2. Click **Create Student** and assign a name and register number.
3. Log out, go to the **Login** page, and click **Create an account**.
4. Select the **Student** role, enter your assigned Roll Number, and set your password.

---

## 📂 Project Structure

```text
client/
├── src/
│   ├── components/      # Reusable UI components (Modals, Inputs, Loaders)
│   ├── context/         # State management (AuthContext, AttendanceContext)
│   ├── pages/           # Role-based views
│   │   ├── admin/       # Admin dashboards and student management
│   │   ├── teacher/     # Attendance marking and reporting
│   │   └── student/     # Student statistics and toolkit
│   ├── constants/       # Global constants and dummy data
│   ├── App.jsx          # App routing and protection logic
│   └── index.css        # Global brutalist CSS tokens
└── package.json
```

---

## 🧠 Architectural Decisions

- **Why LocalStorage?** AttendFlow was built rapidly to validate UI/UX assumptions and state management logic. By utilizing LocalStorage alongside a robust Context API, the app achieves backend-like persistence without external dependencies.
- **Why no UI Framework (Tailwind/MUI)?** To maintain full control over the specific, high-contrast brutalist aesthetic without battling framework overrides.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
