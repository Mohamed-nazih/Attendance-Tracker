import React, { useMemo, useState } from 'react';
import { Search, Users, Mail, Pencil, Check, X, Key, UserPlus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';

function getPercentColor(percent) {
  if (percent >= 85) return '#22C55E';
  if (percent >= 75) return '#C9F135';
  return '#EF4444';
}

// ── Create Student Modal ───────────────────────────────────────────────────────
function CreateStudentModal({ onSave, onClose, nextRollNo }) {
  const [name, setName] = useState('');
  const [reg, setReg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !reg.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        reg: reg.trim(),
        register_no: reg.trim(),
        email: `roll${nextRollNo}@attendflow.local`, // Auto-generated dummy email
        roll_no: nextRollNo
      });
      toast.success(`Student ${name} created successfully`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create student');
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
          background: '#C7FF2B', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '2px 2px 0px 0px #000000',
        }}>
          <UserPlus size={22} color="#000000" />
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 20px', textAlign: 'center', color: '#000000' }}>
          Create New Student
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={saving}
            className="brutal-input"
          />
          <input
            type="text"
            placeholder="Register Number"
            value={reg}
            onChange={e => setReg(e.target.value)}
            disabled={saving}
            className="brutal-input"
          />
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '700' }}>
            Roll Number: {nextRollNo} (Auto-assigned)
          </p>
        </div>

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
            {saving ? 'Creating...' : 'Create Student'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
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

export default function AdminStudents() {
  const { students: ALL_STUDENTS, getStudentStats, addStudent, removeStudent } = useAttendance();
  const { adminResetUserPassword } = useAuth();
  
  const [search, setSearch] = useState('');
  const [resettingStudent, setResettingStudent] = useState(null);
  const [creatingStudent, setCreatingStudent] = useState(false);

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
          (student.register_no || student.reg || '').toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.roll_no - b.roll_no);
  }, [ALL_STUDENTS, getStudentStats, search]);

  const classAverage = students.length
    ? students.reduce((sum, student) => sum + student.stats.overallPct, 0) / students.length
    : 0;

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
          <div className="brutal-card" style={{ padding: '12px 16px', minWidth: '120px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '700' }}>Class Average</p>
            <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>
              {classAverage.toFixed(2)}%
            </p>
          </div>
          
          <button
            onClick={() => setCreatingStudent(true)}
            className="brutal-btn"
            style={{ padding: '12px 16px', height: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <UserPlus size={18} />
            <span>Create Student</span>
          </button>
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
            placeholder="Search by name, roll number, or register number"
            className="brutal-input"
            style={{ paddingLeft: '42px' }}
          />
        </div>
      </div>

      <div className="brutal-card" style={{ overflowX: 'auto', background: '#FFFFFF' }}>
        <div style={{ minWidth: '860px' }}>
          <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 2fr 1fr 1.2fr 90px',
                gap: '12px',
                padding: '12px 18px',
                borderBottom: '2px solid #000000',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              <span>Roll</span>
              <span>Student</span>
              <span>Present</span>
              <span>Overall %</span>
              <span style={{ textAlign: 'center' }}>Actions</span>
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
                    gridTemplateColumns: '60px 2fr 1fr 1.2fr 90px',
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
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
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
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove ${student.name}?`)) {
                          removeStudent(student.id);
                          toast.success(`Removed ${student.name}`);
                        }
                      }}
                      title="Remove Student"
                      style={{
                        width: 30, height: 30, borderRadius: '6px', border: '2px solid #000000',
                        background: '#FEE2E2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '1px 1px 0px 0px #000000',
                        transition: 'all 0.1s',
                        color: '#EF4444'
                      }}
                    >
                      <Trash2 size={13} color="currentColor" />
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
        {resettingStudent && (
          <ResetPasswordModal
            student={resettingStudent}
            onSave={adminResetUserPassword}
            onClose={() => setResettingStudent(null)}
          />
        )}
        {creatingStudent && (
          <CreateStudentModal
            onSave={addStudent}
            onClose={() => setCreatingStudent(false)}
            nextRollNo={ALL_STUDENTS.length > 0 ? Math.max(...ALL_STUDENTS.map(s => s.roll_no)) + 1 : 1}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
