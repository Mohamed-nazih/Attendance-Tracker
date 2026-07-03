import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';

import TeacherDashboard   from './pages/teacher/Dashboard';
import MarkAttendance     from './pages/teacher/MarkAttendance';
import AdminDashboard     from './pages/admin/Dashboard';
import AdminSettings      from './pages/admin/Settings';
import AdminStudents      from './pages/admin/Students';
import AdminAnalytics     from './pages/admin/Analytics';
import AdminTeachers      from './pages/admin/Teachers';
import StudentDashboard   from './pages/student/Dashboard';
import StudentToolkitPage from './pages/student/Toolkit';

const queryClient = new QueryClient();

// Redirect "/" to the correct dashboard based on the user's role
function RootRedirect() {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const map = { student: '/student', teacher: '/teacher', admin: '/admin' };
  return <Navigate to={map[profile?.role] || '/login'} replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AttendanceProvider>
          <Router>
            <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />

                {/* Root redirect */}
                <Route path="/" element={<RootRedirect />} />

                {/* Teacher Routes */}
                <Route path="/teacher" element={
                  <RequireAuth role="teacher"><MainLayout role="teacher" /></RequireAuth>
                }>
                  <Route index element={<TeacherDashboard />} />
                  <Route path="attendance" element={<MarkAttendance />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <RequireAuth role="admin"><MainLayout role="admin" /></RequireAuth>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="teachers" element={<AdminTeachers />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Student Routes */}
                <Route path="/student" element={
                  <RequireAuth role="student"><MainLayout role="student" /></RequireAuth>
                }>
                  <Route index element={<StudentDashboard />} />
                  <Route path="toolkit" element={<StudentToolkitPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-base)',
                    borderRadius: '12px',
                    fontSize: '13px',
                  },
                }}
              />
            </div>
          </Router>
        </AttendanceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
