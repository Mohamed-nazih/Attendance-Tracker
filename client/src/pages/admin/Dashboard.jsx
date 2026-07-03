import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, AlertTriangle, CalendarCheck, Lock, CheckCircle, Clock,
  Pencil, X, Check, Calendar, PlusCircle, UserCheck, RefreshCcw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLE = {
  Present: { bg: '#E2FBE9', color: '#0F5132', border: '#000000', dot: '#22C55E' },
  Absent:  { bg: '#FEE2E2', color: '#842029', border: '#000000', dot: '#EF4444' },
  'On Duty': { bg: '#FEF3C7', color: '#664D03', border: '#000000', dot: '#F59E0B' },
};

function StatusChip({ status, small }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Present;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: small ? '2px 8px' : '3px 10px',
      borderRadius: '4px', fontSize: small ? '11px' : '12px', fontWeight: '800',
      background: s.bg, color: '#000000', border: '2px solid #000000',
      boxShadow: '1px 1px 0px 0px #000000',
      whiteSpace: 'nowrap', fontFamily: 'var(--font-sketch)'
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ── Admin Edit / Add Attendance Modal ──────────────────────────────────────────
function EditAttendancePanel({ dateStr, session, onClose }) {
  const { students: ALL_STUDENTS, getSessionsForDate, updateAttendance, submitSession } = useAttendance();
  const { profile } = useAuth();
  
  const dayData = getSessionsForDate(dateStr);
  const report = dayData[session] || { attendance: {} };
  
  // Local edit map. If empty, default all to 'Present'
  const [editMap, setEditMap] = useState(() => {
    const init = {};
    ALL_STUDENTS.forEach(s => {
      init[s.id] = report.attendance ? report.attendance[s.id] || 'Present' : 'Present';
    });
    return init;
  });
  
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = ALL_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_no.toString().includes(search)
  );

  const cycleStatus = (studentId) => {
    setEditMap(prev => {
      const cur = prev[studentId];
      const next = cur === 'Present' ? 'Absent' : cur === 'Absent' ? 'On Duty' : 'Present';
      return { ...prev, [studentId]: next };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    Object.entries(editMap).forEach(([studentId, status]) => {
      updateAttendance(dateStr, session, studentId, status);
    });
    // Submit / lock the session for that date
    submitSession(dateStr, session, profile?.name || 'Class Teacher');
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    toast.success(`${session} attendance updated & locked for ${dateStr}!`);
    onClose();
  };

  const stats = {
    present: Object.values(editMap).filter(v => v === 'Present').length,
    absent: Object.values(editMap).filter(v => v === 'Absent').length,
    onDuty: Object.values(editMap).filter(v => v === 'On Duty').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="brutal-card"
        style={{
          width: '100%', maxWidth: '640px', maxHeight: '85vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: '#FFFFFF',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '3px solid #000000',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontWeight: '800', fontSize: '18px', margin: '0 0 2px', fontFamily: 'var(--font-sketch)' }}>
              Edit {session} Attendance
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
              Date: {dateStr} · Click a student to cycle status
            </p>
          </div>
          <button
            onClick={onClose}
            className="brutal-btn"
            style={{ padding: '6px', minWidth: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Stats */}
        <div style={{ padding: '12px 24px', borderBottom: '3px solid #000000', display: 'flex', gap: '12px', bg: '#FAF6EE' }}>
          {[
            { label: 'Present', value: stats.present, bg: '#E2FBE9', color: '#0F5132' },
            { label: 'Absent', value: stats.absent, bg: '#FEE2E2', color: '#842029' },
            { label: 'On Duty', value: stats.onDuty, bg: '#FEF3C7', color: '#664D03' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: s.bg, borderRadius: '6px', border: '2px solid #000000',
              boxShadow: '2px 2px 0px 0px #000000', padding: '8px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#000000', margin: '0 0 1px', lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: '12px 24px', borderBottom: '2px solid #000000' }}>
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="brutal-input"
          />
        </div>

        {/* Student List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {filtered.map((student, idx) => {
            const status = editMap[student.id];
            return (
              <div
                key={student.id}
                onClick={() => cycleStatus(student.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                  border: '2px solid transparent',
                  marginBottom: '2px', transition: 'all 0.1s', userSelect: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#000000'; e.currentTarget.style.background = '#FAF6EE'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '22px', fontWeight: '700' }}>
                    {student.roll_no.toString().padStart(2, '0')}
                  </span>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0, border: '2px solid #000000',
                    background: `hsl(${student.roll_no * 37 % 360}, 75%, 90%)`,
                    color: '#000000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '800',
                  }}>{student.name.charAt(0)}</div>
                  <span style={{ fontWeight: '700', fontSize: '13px' }}>{student.name}</span>
                </div>
                <StatusChip status={status} small />
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px', borderTop: '3px solid #000000',
          display: 'flex', gap: '10px', justifyContent: 'flex-end',
          background: '#FAF6EE'
        }}>
          <button
            onClick={onClose}
            className="brutal-btn brutal-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="brutal-btn"
          >
            <Check size={15} />
            {saving ? 'Saving...' : 'Save & Lock'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Session Report Card for Admin ─────────────────────────────────────────────
function SessionReportCard({ dateStr, report, onEdit }) {
  const { session, submittedAt, submittedBy, locked, present, absent, onDuty, total } = report;
  const percent = total ? Math.round((present.length / total) * 100) : 0;

  if (!locked) {
    return (
      <div className="brutal-card" style={{
        padding: '18px 22px',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '6px', border: '2px solid #000000',
          background: '#FAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Clock size={17} color="#000000" />
        </div>
        <div>
          <p style={{ fontWeight: '800', fontSize: '15px', margin: '0 0 2px', fontFamily: 'var(--font-sketch)' }}>{session} Session</p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>No attendance submitted yet</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onEdit(session)}
            className="brutal-btn"
            style={{
              padding: '6px 14px', fontSize: '12px', gap: '4px', background: 'var(--brutal-yellow)'
            }}
          >
            <PlusCircle size={12} /> Add Attendance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="brutal-card" style={{ overflow: 'hidden' }}>
      {/* Session header */}
      <div style={{
        padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid #000000', background: 'rgba(0,0,0,0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <p style={{ fontWeight: '800', fontSize: '15px', margin: 0, fontFamily: 'var(--font-sketch)' }}>{session} Session</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} color="#22C55E" />
            <span style={{ fontSize: '11px', color: '#22C55E', fontWeight: '800', fontFamily: 'var(--font-sketch)' }}>Locked</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            {submittedAt ? format(parseISO(submittedAt), 'hh:mm a') : ''} · {submittedBy}
          </span>
          <span style={{
            fontSize: '15px', fontWeight: '800', fontFamily: 'var(--font-sketch)',
            color: percent >= 75 ? '#0F5132' : '#842029',
          }}>
            {percent}%
          </span>
          <button
            onClick={() => onEdit(session)}
            className="brutal-btn"
            style={{
              padding: '4px 10px', fontSize: '12px', gap: '4px',
            }}
          >
            <Pencil size={11} /> Edit
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '2px solid #000000' }}>
        {[
          { label: 'Total', value: total, bg: '#FFFFFF' },
          { label: 'Present', value: present.length, bg: '#E2FBE9' },
          { label: 'Absent', value: absent.length, bg: '#FEE2E2' },
          { label: 'On Duty', value: onDuty.length, bg: '#FEF3C7' },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '12px 16px', textAlign: 'center', background: s.bg,
            borderRight: i < 3 ? '2px solid #000000' : 'none',
          }}>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#000000', margin: '0 0 2px', lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{s.value}</p>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Absent + On Duty lists */}
      {absent.length === 0 && onDuty.length === 0 ? (
        <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={15} color="#22C55E" />
          <span style={{ fontSize: '13px', color: '#166534', fontWeight: '700', fontFamily: 'var(--font-sketch)' }}>All students are present!</span>
        </div>
      ) : (
        <div style={{ padding: '14px 22px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {absent.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#EF4444', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-sketch)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', border: '1px solid #000000', display: 'inline-block' }} />
                Absent · {absent.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {absent.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0, border: '2px solid #000000',
                      background: `hsl(${s.roll_no * 37 % 360}, 75%, 90%)`,
                      color: '#000000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '800',
                    }}>{s.name.charAt(0)}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>{s.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Roll {s.roll_no.toString().padStart(2, '0')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {onDuty.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#F59E0B', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-sketch)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', border: '1px solid #000000', display: 'inline-block' }} />
                On Duty · {onDuty.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {onDuty.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0, border: '2px solid #000000',
                      background: `hsl(${s.roll_no * 37 % 360}, 75%, 90%)`,
                      color: '#000000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '800',
                    }}>{s.name.charAt(0)}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>{s.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Roll {s.roll_no.toString().padStart(2, '0')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="brutal-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{
        padding: '10px', borderRadius: '8px', border: '2px solid #000000',
        background: iconBg, flexShrink: 0, boxShadow: '2px 2px 0px 0px #000000'
      }}>
        <Icon size={20} color="#000000" />
      </div>
      <div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 3px', fontWeight: '700' }}>{label}</p>
        <p style={{ fontSize: '24px', fontWeight: '800', margin: 0, lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{value}</p>
        {sub && <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '3px 0 0', fontWeight: '600' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
function TeacherApprovalPanel() {
  const { listPendingTeachers, approveTeacher, rejectTeacher, accountsVersion } = useAuth();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPendingTeachers();
      setPendingTeachers(data);
    } catch (error) {
      toast.error(error.message || 'Could not load teacher approvals');
    } finally {
      setLoading(false);
    }
  }, [listPendingTeachers]);

  useEffect(() => {
    loadPending();
  }, [accountsVersion, loadPending]);

  const handleApprove = async (teacher) => {
    setApprovingId(teacher.id);
    try {
      await approveTeacher(teacher.id);
      toast.success(`${teacher.name} approved as teacher`);
      await loadPending();
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
      await loadPending();
    } catch (error) {
      toast.error(error.message || 'Could not reject teacher');
    } finally {
      setRejectingId(null);
    }
  };


  return (
    <div className="brutal-card" style={{ padding: '18px 22px', marginBottom: '24px', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: pendingTeachers.length ? '14px' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '8px', border: '2px solid #000000',
            background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '2px 2px 0px 0px #000000',
          }}>
            <UserCheck size={18} color="#000000" />
          </div>
          <div>
            <p style={{ fontWeight: '800', fontSize: '16px', margin: 0, fontFamily: 'var(--font-sketch)' }}>Teacher Account Approvals</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
              {loading ? 'Checking new teacher accounts...' : pendingTeachers.length ? `${pendingTeachers.length} teacher account(s) waiting` : 'No teacher accounts waiting for approval'}
            </p>
          </div>
        </div>
      </div>

      {pendingTeachers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pendingTeachers.map(teacher => (
            <div key={teacher.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              padding: '12px 14px', border: '2px solid #000000', borderRadius: '8px', background: '#FAF6EE',
            }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '800' }}>{teacher.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>{teacher.email}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleApprove(teacher)}
                  disabled={approvingId === teacher.id || rejectingId === teacher.id}
                  className="brutal-btn"
                  style={{ padding: '7px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  <Check size={13} />
                  {approvingId === teacher.id ? 'Approving...' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(teacher)}
                  disabled={rejectingId === teacher.id || approvingId === teacher.id}
                  className="brutal-btn brutal-btn-secondary"
                  title="Reject"
                  style={{ padding: '7px 14px', fontSize: '12px', background: '#FEE2E2', color: '#EF4444', whiteSpace: 'nowrap' }}
                >
                  <X size={16} />
                  {rejectingId === teacher.id ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default function AdminDashboard() {
  const { getSessionsForDate, students: ALL_STUDENTS, currentSemester, startNewSemester, getTotalWorkingDays } = useAttendance();
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [editingSession, setEditingSession] = useState(null);
  const [confirmNewSem, setConfirmNewSem] = useState(false);

  const generateReport = (dateStr, session) => {
    const dayData = getSessionsForDate(dateStr);
    const sessionData = dayData[session] || { attendance: {}, submittedAt: null, submittedBy: 'Class Teacher' };
    const present = [];
    const absent = [];
    const onDuty = [];
    ALL_STUDENTS.forEach(s => {
      const status = sessionData.attendance[s.id] || 'Present';
      if (status === 'Present') present.push(s);
      if (status === 'Absent') absent.push(s);
      if (status === 'On Duty') onDuty.push(s);
    });
    return {
      session,
      submittedAt: sessionData.submittedAt,
      submittedBy: sessionData.submittedBy,
      locked: !!sessionData.submittedAt,
      present,
      absent,
      onDuty,
      total: ALL_STUDENTS.length
    };
  };

  const morningReport = generateReport(selectedDate, 'Morning');
  const afternoonReport = generateReport(selectedDate, 'Afternoon');

  // Today/Selected Date Stats calculation
  const totalStudents = ALL_STUDENTS.length;
  const isMorningLocked = morningReport.locked;
  const isAfternoonLocked = afternoonReport.locked;

  // Working day check for overall percent
  const sessionsLockedCount = (isMorningLocked ? 1 : 0) + (isAfternoonLocked ? 1 : 0);
  
  // Calculate average percentage for the selected day
  let dayPercent = 100; // If nothing locked yet
  if (sessionsLockedCount > 0) {
    const totalPresentSessions = (isMorningLocked ? morningReport.present.length : 0) + 
                                 (isAfternoonLocked ? afternoonReport.present.length : 0);
    dayPercent = Math.round((totalPresentSessions / (totalStudents * sessionsLockedCount)) * 100);
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
            Class: BCA Honours A · Semester {currentSemester}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* New Semester Button */}
          <button
            onClick={() => setConfirmNewSem(true)}
            className="brutal-btn"
            style={{
              padding: '8px 16px', fontSize: '12px', gap: '6px',
              background: '#FEE2E2', borderColor: '#000000',
            }}
          >
            <RefreshCcw size={14} /> New Semester
          </button>

          {/* Date Selector input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#000000" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="brutal-input"
              style={{
                padding: '8px 12px', fontSize: '13px', width: '160px',
                fontFamily: 'var(--font-sketch)', fontWeight: '800',
              }}
            />
          </div>
        </div>
      </div>

      {/* New Semester Confirmation Modal */}
      <AnimatePresence>
        {confirmNewSem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
            }}
            onClick={() => setConfirmNewSem(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 14 }}
              className="brutal-card"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '420px', width: '100%', padding: '28px 24px', background: '#FFFFFF' }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%', border: '3px solid #000000',
                background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', boxShadow: '3px 3px 0px 0px #000000',
              }}>
                <RefreshCcw size={24} color="#000000" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 8px', textAlign: 'center', fontFamily: 'var(--font-sketch)' }}>
                Start New Semester?
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5, fontWeight: '600' }}>
                This will <strong>clear all current attendance data</strong> and start Semester {currentSemester + 1}. 
                All new attendance taken by teachers will go into the new semester. This action cannot be undone.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => setConfirmNewSem(false)}
                  className="brutal-btn brutal-btn-secondary"
                  style={{ width: '100%' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    startNewSemester();
                    setConfirmNewSem(false);
                    toast.success(`Semester ${currentSemester + 1} started! All attendance data cleared.`, { icon: '🎓' });
                  }}
                  className="brutal-btn"
                  style={{ width: '100%', background: '#FEE2E2' }}
                >
                  Start New Sem
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TeacherApprovalPanel />

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        <StatCard icon={Users} iconBg="var(--primary)" iconColor="#000000" label="Total Students" value={totalStudents} />
        <StatCard icon={Calendar} iconBg="#DBEAFE" iconColor="#1E40AF" label="Total Working Days" value={getTotalWorkingDays()} sub={`Semester ${currentSemester}`} />
        <StatCard icon={CalendarCheck} iconBg="#E2FBE9" iconColor="#0F5132" label="Selected Day's Attendance" value={`${dayPercent}%`} sub={sessionsLockedCount > 0 ? `${sessionsLockedCount} session(s) marked` : 'Awaiting markings'} />
        <StatCard icon={AlertTriangle} iconBg="#FEE2E2" iconColor="#842029" label="Absent Today" value={isMorningLocked ? morningReport.absent.length : 0} sub="Morning session" />
        <StatCard icon={AlertTriangle} iconBg="#FEF3C7" iconColor="#664D03" label="On Duty Today" value={isMorningLocked ? morningReport.onDuty.length : 0} sub="Counted as present" />
      </div>

      {/* Today's Report */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 2px', fontFamily: 'var(--font-sketch)' }}>
              Report for {selectedDate}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
              Add/Edit attendance records for any selected date above
            </p>
          </div>
          <div style={{
            padding: '4px 12px', borderRadius: '4px', border: '2px solid #000000', background: '#E2FBE9',
            fontSize: '11px', fontWeight: '800', color: '#000000',
            boxShadow: '1px 1px 0px 0px #000000',
            display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sketch)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0F5132', display: 'inline-block' }} />
            Active Date
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SessionReportCard dateStr={selectedDate} report={morningReport} onEdit={setEditingSession} />
          <SessionReportCard dateStr={selectedDate} report={afternoonReport} onEdit={setEditingSession} />
        </div>
      </div>

      {/* Edit/Add Attendance Modal */}
      <AnimatePresence>
        {editingSession && (
          <EditAttendancePanel
            dateStr={selectedDate}
            session={editingSession}
            onClose={() => setEditingSession(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
