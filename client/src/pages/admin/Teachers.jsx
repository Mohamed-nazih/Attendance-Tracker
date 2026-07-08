import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Search, UserCheck, Users, Key, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

function StatusBadge({ approved }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '4px',
      border: '2px solid #000000',
      background: approved ? '#E2FBE9' : '#FEF3C7',
      boxShadow: '1px 1px 0px 0px #000000',
      fontSize: '12px',
      fontWeight: '900',
      fontFamily: 'var(--font-sketch)',
      whiteSpace: 'nowrap',
    }}>
      {approved ? 'Approved' : 'Pending'}
    </span>
  );
}

// ── Reset Password Modal ───────────────────────────────────────────────────────
function ResetPasswordModal({ user, onSave, onClose }) {
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await onSave(user.email || user.name, password);
      toast.success(`Password reset for ${user.name}`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        className="brutal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '440px', width: '100%', padding: '28px 24px', background: '#FFFFFF' }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: '10px', border: '3px solid #000000',
          background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '2px 2px 0px 0px #000000',
        }}>
          <Key size={22} color="#000000" />
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 4px', textAlign: 'center', color: '#000000' }}>
          Reset Teacher Password
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 20px', fontWeight: '700' }}>
          {user.name}
        </p>

        <input
          type="text"
          placeholder="New password (min 6 chars)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={saving}
          className="brutal-input"
          style={{ marginBottom: '20px' }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="brutal-btn"
            style={{ flex: 1, background: '#F3F4F6' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="brutal-btn"
            style={{ flex: 1, background: 'var(--primary)' }}
          >
            {saving ? 'Saving...' : 'Reset Password'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Teachers() {
  const { listTeachers, approveTeacher, rejectTeacher, adminResetUserPassword, accountsVersion } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [resettingTeacher, setResettingTeacher] = useState(null);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTeachers();
      setTeachers(data);
    } catch (error) {
      toast.error(error.message || 'Could not load teachers');
    } finally {
      setLoading(false);
    }
  }, [listTeachers]);

  useEffect(() => {
    loadTeachers();
  }, [accountsVersion, loadTeachers]);

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return teachers;
    return teachers.filter(teacher =>
      teacher.name?.toLowerCase().includes(query) ||
      teacher.email?.toLowerCase().includes(query)
    );
  }, [search, teachers]);

  const approvedCount = teachers.filter(teacher => teacher.approved === true).length;
  const pendingCount = teachers.length - approvedCount;

  const handleApprove = async (teacher) => {
    setApprovingId(teacher.id);
    try {
      await approveTeacher(teacher.id);
      toast.success(`${teacher.name} approved as teacher`);
      await loadTeachers();
    } catch (error) {
      toast.error(error.message || 'Could not approve teacher');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (teacher) => {
    if (!window.confirm(`Are you sure you want to reject and delete the account for ${teacher.name}?`)) return;
    setRejectingId(teacher.id);
    try {
      await rejectTeacher(teacher.id);
      toast.success(`${teacher.name} has been rejected`);
      await loadTeachers();
    } catch (error) {
      toast.error(error.message || 'Could not reject teacher');
    } finally {
      setRejectingId(null);
    }
  };


  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Teachers
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
            Review teacher accounts and approve access to attendance tools
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '18px' }}>
        <div className="brutal-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={22} color="#000000" />
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '700' }}>Total Teachers</p>
            <p style={{ fontSize: '24px', fontWeight: '900', margin: 0, lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{teachers.length}</p>
          </div>
        </div>
        <div className="brutal-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '12px', background: '#E2FBE9' }}>
          <UserCheck size={22} color="#000000" />
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '700' }}>Approved</p>
            <p style={{ fontSize: '24px', fontWeight: '900', margin: 0, lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{approvedCount}</p>
          </div>
        </div>
        <div className="brutal-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '12px', background: '#FEF3C7' }}>
          <UserCheck size={22} color="#000000" />
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '700' }}>Pending</p>
            <p style={{ fontSize: '24px', fontWeight: '900', margin: 0, lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="brutal-card" style={{ padding: '16px', marginBottom: '18px', background: '#FFFFFF' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: '#000000', pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search teachers by name or username"
            className="brutal-input"
            style={{ paddingLeft: '42px' }}
          />
        </div>
      </div>

      <div className="brutal-card" style={{ overflowX: 'auto', background: '#FFFFFF' }}>
        <div style={{ minWidth: '720px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 150px 150px', gap: '12px',
            padding: '14px 18px', borderBottom: '3px solid #000000', background: '#FAF6EE',
            fontSize: '12px', fontWeight: '900', fontFamily: 'var(--font-sketch)',
          }}>
            <span>Name</span>
            <span>Username</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {loading ? (
            <div style={{ padding: '42px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '700' }}>
              Loading teachers...
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div style={{ padding: '42px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '700' }}>
              No teachers found.
            </div>
          ) : (
            filteredTeachers.map(teacher => {
              const username = teacher.email?.split('@')[0] || teacher.name;
              return (
                <div
                  key={teacher.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 150px 150px', gap: '12px',
                    alignItems: 'center', padding: '14px 18px', borderBottom: '2px solid #000000',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', border: '2px solid #000000',
                      background: teacher.approved ? '#DBEAFE' : '#FEF3C7', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      fontSize: '12px', fontWeight: '900',
                    }}>
                      {(teacher.name || username || 'T').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {teacher.name || 'Teacher'}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '800' }}>{username}</span>
                  <StatusBadge approved={teacher.approved === true} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {teacher.approved !== true && (
                      <button
                        type="button"
                        onClick={() => handleApprove(teacher)}
                        disabled={approvingId === teacher.id || rejectingId === teacher.id}
                        className="brutal-btn"
                        title="Approve"
                        style={{ padding: '7px 10px', fontSize: '12px', whiteSpace: 'nowrap', background: '#E2FBE9', color: '#0F5132' }}
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleReject(teacher)}
                      disabled={rejectingId === teacher.id || approvingId === teacher.id}
                      className="brutal-btn brutal-btn-secondary"
                      title={teacher.approved ? "Delete" : "Reject"}
                      style={{ padding: '7px 10px', fontSize: '12px', background: '#FEE2E2', color: '#EF4444' }}
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => setResettingTeacher(teacher)}
                      title="Reset Password"
                      style={{
                        width: 30, height: 30, borderRadius: '6px', border: '2px solid #000000',
                        background: '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '1px 1px 0px 0px #000000',
                        transition: 'all 0.1s',
                      }}
                    >
                      <Key size={13} color="#000000" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {resettingTeacher && (
          <ResetPasswordModal
            user={resettingTeacher}
            onSave={adminResetUserPassword}
            onClose={() => setResettingTeacher(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}