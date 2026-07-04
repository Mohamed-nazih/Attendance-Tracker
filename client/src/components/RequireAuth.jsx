import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, XCircle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

function PendingApprovalScreen({ user }) {
  const { signOut } = useAuth();
  const [status, setStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected'

  useEffect(() => {
    // Listen for realtime updates on the 'users' table for this specific user
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new && payload.new.approved === true) {
            setStatus('approved');
            // Wait 2 seconds for the toast to be seen, then reload so AuthContext picks up the new profile
            setTimeout(() => window.location.reload(), 1500);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        () => {
          setStatus('rejected');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '24px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="brutal-card" style={{ maxWidth: '420px', width: '100%', padding: '36px 24px', textAlign: 'center', background: '#FFFFFF' }}
      >
        <AnimatePresence mode="wait">
          {status === 'pending' && (
            <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '16px', border: '3px solid #000000',
                background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '4px 4px 0px 0px #000000',
              }}>
                <Clock size={32} color="#000000" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 12px', color: '#000000', fontFamily: 'var(--font-sketch)' }}>
                Approval Pending
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 28px', lineHeight: 1.6, fontWeight: '600' }}>
                Your teacher account has been created successfully. The Class Teacher must review and approve it before you can access the dashboard.
              </p>
            </motion.div>
          )}

          {status === 'approved' && (
            <motion.div key="approved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '16px', border: '3px solid #000000',
                background: '#E2FBE9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '4px 4px 0px 0px #000000',
              }}>
                <CheckCircle size={32} color="#0F5132" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 12px', color: '#0F5132', fontFamily: 'var(--font-sketch)' }}>
                Approved!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 28px', lineHeight: 1.6, fontWeight: '600' }}>
                Your account was just approved. Redirecting you to the dashboard...
              </p>
            </motion.div>
          )}

          {status === 'rejected' && (
            <motion.div key="rejected" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '16px', border: '3px solid #000000',
                background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '4px 4px 0px 0px #000000',
              }}>
                <XCircle size={32} color="#842029" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 12px', color: '#842029', fontFamily: 'var(--font-sketch)' }}>
                Approval Rejected
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 28px', lineHeight: 1.6, fontWeight: '600' }}>
                Sorry, your request to join as a teacher was declined.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={signOut}
          className="brutal-btn brutal-btn-secondary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <LogOut size={16} /> Back to Login
        </button>
      </motion.div>
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

  // Not logged in or missing profile → send to login
  if (!user || (!profile && !loading)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Teacher pending approval
  if (role === 'teacher' && profile?.role === 'teacher' && profile.approved !== true) {
    return <PendingApprovalScreen user={user} />;
  }

  // Role mismatch → send to the correct dashboard
  if (role && profile?.role && profile.role !== role) {
    const redirects = { student: '/student', teacher: '/teacher', admin: '/admin' };
    return <Navigate to={redirects[profile.role] || '/login'} replace />;
  }

  return children;
}
