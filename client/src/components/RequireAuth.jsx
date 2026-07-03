import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Spinner shown while session loads

function Spinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--border-base)',
        borderTopColor: 'var(--primary)',
        animation: 'spin 0.75s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * Wrap a route with this to require authentication + optional role check.
 * Usage:
 *   <RequireAuth role="teacher"><MarkAttendance /></RequireAuth>
 */
export default function RequireAuth({ children, role }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role === 'teacher' && profile?.role === 'teacher' && profile.approved !== true) {
    return <Navigate to="/login" state={{ pendingApproval: true }} replace />;
  }

  // Role mismatch → send to the correct dashboard
  if (role && profile?.role && profile.role !== role) {
    const redirects = { student: '/student', teacher: '/teacher', admin: '/admin' };
    return <Navigate to={redirects[profile.role] || '/login'} replace />;
  }

  return children;
}
