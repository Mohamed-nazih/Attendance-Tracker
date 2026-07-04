import React, { useMemo, useState } from 'react';
import { Search, Users, Mail, Pencil, Check, X, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';

function getPercentColor(percent) {
  if (percent >= 85) return '#22C55E';
  if (percent >= 75) return '#C9F135';
  return '#EF4444';
}



// ── Reset Password Modal ───────────────────────────────────────────────────────
function ResetPasswordModal({ student, onSave, onClose }) {
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await onSave(student.email || student.register_no || student.reg, password);
      toast.success(`Password reset for ${student.name}`);
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
          Reset Student Password
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 20px', fontWeight: '700' }}>
          Roll {String(student.roll_no).padStart(2, '0')} — {student.name}
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

// ── Email Edit Modal ──────────────────────────────────────────────────────────
function EmailEditModal({ student, onSave, onClose }) {
  const [email, setEmail] = useState(student.email || '');

  const handleSave = () => {
    const trimmed = email.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Please enter a valid email address');
      return;
    }
    onSave(student.id, trimmed);
    toast.success(`Email ${trimmed ? 'updated' : 'cleared'} for ${student.name}`);
    onClose();
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
          background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '2px 2px 0px 0px #000000',
        }}>
          <Mail size={22} color="#000000" />
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 4px', textAlign: 'center', color: '#000000' }}>
          Edit Student Email
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 20px', fontWeight: '700' }}>
          Roll {String(student.roll_no).padStart(2, '0')} — {student.name}
        </p>

        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <Mail size={16} style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: '#000000', pointerEvents: 'none', zIndex: 1,
          }} />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="student@example.com"
            autoFocus
            className="brutal-input"
            style={{ paddingLeft: '42px' }}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="brutal-btn brutal-btn-secondary"
            style={{ width: '100%' }}
          >
            <X size={14} /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="brutal-btn"
            style={{ width: '100%' }}
          >
            <Check size={14} /> Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminStudents() {
  const { students: ALL_STUDENTS, getStudentStats, updateStudentEmail } = useAttendance();
  const { adminResetUserPassword } = useAuth();
  
  const [search, setSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [resettingStudent, setResettingStudent] = useState(null);

  const students = useMemo(() => {
    return ALL_STUDENTS
      .map(student => ({
        ...student,
        stats: getStudentStats(student.id),
      }))
      .filter(student => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
          (student.name || '').toLowerCase().includes(query) ||
          (student.register_no || student.reg || '').toLowerCase().includes(query) ||
          (student.roll_no?.toString() || '').includes(query) ||
          (student.email && student.email.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => a.roll_no - b.roll_no);
  }, [ALL_STUDENTS, getStudentStats, search]);

  const classAverage = students.length
    ? students.reduce((sum, student) => sum + student.stats.overallPct, 0) / students.length
    : 0;

  const emailCount = ALL_STUDENTS.filter(s => s.email).length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Students
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
            Student list with total attendance percentage
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="brutal-card" style={{ padding: '12px 16px', minWidth: '150px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '700' }}>Emails Set</p>
            <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>
              {emailCount}<span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '700' }}> / {ALL_STUDENTS.length}</span>
            </p>
          </div>
          <div className="brutal-card" style={{ padding: '12px 16px', minWidth: '150px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '700' }}>Class Average</p>
            <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>
              {classAverage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <div className="brutal-card" style={{ padding: '16px', marginBottom: '18px', background: '#FFFFFF' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#000000',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search by name, roll number, register number, or email"
            className="brutal-input"
            style={{ paddingLeft: '42px' }}
          />
        </div>
      </div>

      <div className="brutal-card" style={{ overflowX: 'auto', background: '#FFFFFF' }}>
        <div style={{ minWidth: '860px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1.4fr 1.2fr 0.9fr 1fr 90px',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '3px solid #000000',
            background: '#FAF6EE',
            fontSize: '12px',
            fontWeight: '900',
            fontFamily: 'var(--font-sketch)',
          }}>
            <span>Roll</span>
            <span>Name</span>
            <span>Email</span>
            <span>Total Days</span>
            <span>Total %</span>
            <span></span>
          </div>

          {students.length === 0 ? (
            <div style={{ padding: '42px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '700' }}>
              No students found.
            </div>
          ) : (
            students.map(student => {
              const percent = student.stats.overallPct;
              return (
                <div
                  key={student.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1.4fr 1.2fr 0.9fr 1fr 90px',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '12px 18px',
                    borderBottom: '2px solid #000000',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'var(--font-sketch)' }}>
                    {student.roll_no.toString().padStart(2, '0')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      border: '2px solid #000000',
                      background: `hsl(${student.roll_no * 37 % 360}, 75%, 90%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '11px',
                      fontWeight: '900',
                    }}>
                      {student.name.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {student.name}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        {student.register_no || student.reg}
                      </span>
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    {student.email ? (
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {student.email}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', fontStyle: 'italic' }}>
                        Not set
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '800' }}>
                    {student.stats.presentCount.toFixed(1)} / {student.stats.totalWorkingDays}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      flex: 1,
                      height: 8,
                      border: '2px solid #000000',
                      borderRadius: '999px',
                      background: '#FFFFFF',
                      overflow: 'hidden',
                      minWidth: 50,
                    }}>
                      <div style={{
                        width: `${Math.min(percent, 100)}%`,
                        height: '100%',
                        background: getPercentColor(percent),
                      }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '900', fontFamily: 'var(--font-sketch)', minWidth: 50, textAlign: 'right' }}>
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setEditingStudent(student)}
                      title="Edit email"
                      style={{
                        width: 30, height: 30, borderRadius: '6px', border: '2px solid #000000',
                        background: student.email ? '#DBEAFE' : '#FEF3C7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '1px 1px 0px 0px #000000',
                        transition: 'all 0.1s',
                      }}
                    >
                      <Pencil size={13} color="#000000" />
                    </button>
                    <button
                      onClick={() => setResettingStudent(student)}
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700' }}>
        <Users size={15} color="#000000" />
        Showing {students.length} of {ALL_STUDENTS.length} students
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editingStudent && (
          <EmailEditModal
            student={editingStudent}
            onSave={updateStudentEmail}
            onClose={() => setEditingStudent(null)}
          />
        )}
        {resettingStudent && (
          <ResetPasswordModal
            student={resettingStudent}
            onSave={adminResetUserPassword}
            onClose={() => setResettingStudent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
