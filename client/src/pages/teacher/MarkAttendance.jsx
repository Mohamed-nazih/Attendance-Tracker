import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Lock, Save, CheckCircle, SunMedium, Sunset, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_CYCLE = { Present: 'Absent', Absent: 'On Duty', 'On Duty': 'Present' };

const STATUS_STYLE = {
  Present: { bg: '#E2FBE9', color: '#0F5132', border: '#000000', dot: '#22C55E' },
  Absent:  { bg: '#FEE2E2', color: '#842029', border: '#000000', dot: '#EF4444' },
  'On Duty': { bg: '#FEF3C7', color: '#664D03', border: '#000000', dot: '#F59E0B' },
};

function HoldToSubmit({ onSubmit }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = React.useRef(null);

  const startHold = () => {
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          onSubmit();
          return 100;
        }
        return prev + 2; // Fills in about 1 second
      });
    }, 20);
  };

  const endHold = () => {
    if (progress < 100) {
      clearInterval(intervalRef.current);
      setProgress(0);
    }
  };

  React.useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <button
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      className="brutal-btn"
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transition: 'transform 0.1s',
        transform: progress > 0 && progress < 100 ? 'scale(0.98)' : 'scale(1)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${progress}%`,
          background: 'rgba(0,0,0,0.15)',
          transition: progress === 0 ? 'width 0.2s ease-out' : 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <Save size={16} /> 
        {progress > 0 && progress < 100 ? 'Hold...' : 'Submit'}
      </div>
    </button>
  );
}

function StatusChip({ status }) {
  const s = STATUS_STYLE[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '800',
      background: s.bg, color: '#000000', border: '2px solid #000000',
      boxShadow: '1px 1px 0px 0px #000000',
      whiteSpace: 'nowrap', fontFamily: 'var(--font-sketch)'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ── Inline Report shown after submit ──────────────────────────────────────────
function AttendanceReport({ report }) {
  const allPresent = report.absent.length === 0 && report.onDuty.length === 0;
  const percent = Math.round((report.present.length / report.total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: '740px', margin: '0 auto' }}
    >
      {/* Header card */}
      <div className="brutal-card" style={{ padding: '28px 32px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '8px', border: '2px solid #000000',
                background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '2px 2px 0px 0px #000000',
              }}>
                <ClipboardList size={18} color="#000000" />
              </div>
              <div>
                <p style={{ fontWeight: '800', fontSize: '18px', margin: 0, fontFamily: 'var(--font-sketch)' }}>Attendance Report</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
                  {report.session} Session · {format(new Date(), 'dd MMMM yyyy')}
                </p>
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '4px', border: '2px solid #000000',
            background: '#E2FBE9', boxShadow: '2px 2px 0px 0px #000000',
            fontFamily: 'var(--font-sketch)', fontWeight: '800', fontSize: '12px'
          }}>
            <CheckCircle size={14} color="#000000" />
            <span>Submitted & Locked</span>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginTop: '24px' }}>
          {[
            { label: 'Total', value: report.total, bg: '#FFFFFF', color: '#000000' },
            { label: 'Present', value: report.present.length, bg: '#E2FBE9', color: '#0F5132' },
            { label: 'Absent', value: report.absent.length, bg: '#FEE2E2', color: '#842029' },
            { label: 'On Duty', value: report.onDuty.length, bg: '#FEF3C7', color: '#664D03' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: '8px', border: '2px solid #000000',
              boxShadow: '2px 2px 0px 0px #000000',
              padding: '14px 12px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '28px', fontWeight: '800', color: '#000000', margin: '0 0 2px', lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Attendance percentage bar */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '700' }}>Class Attendance</span>
            <span style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'var(--font-sketch)' }}>
              {percent}%
            </span>
          </div>
          <div style={{ height: '10px', background: '#FFFFFF', border: '2px solid #000000', borderRadius: '99px', overflow: 'hidden', boxShadow: 'inset 1px 1px 0px rgba(0,0,0,0.1)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              style={{
                height: '100%', borderRadius: '99px', borderRight: '2px solid #000000',
                background: percent >= 75 ? 'var(--primary)' : '#EF4444',
              }}
            />
          </div>
        </div>
      </div>

      {/* All present message */}
      {allPresent && (
        <div className="brutal-card" style={{
          background: '#E2FBE9', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <CheckCircle size={20} color="#000000" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontWeight: '700', color: '#000000', fontSize: '14px', fontFamily: 'var(--font-sketch)' }}>
            All 43 students are present today! 🎉
          </p>
        </div>
      )}

      {/* Absent Students */}
      {report.absent.length > 0 && (
        <div className="brutal-card" style={{ overflow: 'hidden', marginTop: '16px' }}>
          <div style={{
            padding: '12px 24px', borderBottom: '2px solid #000000',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#FEE2E2',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1px solid #000000' }} />
            <span style={{ fontWeight: '800', fontSize: '14px', color: '#000000', fontFamily: 'var(--font-sketch)' }}>
              Absent — {report.absent.length} student{report.absent.length > 1 ? 's' : ''}
            </span>
          </div>
          {report.absent.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 24px',
              borderBottom: i < report.absent.length - 1 ? '2px solid #000000' : 'none',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '24px', fontWeight: '700' }}>
                {s.roll_no.toString().padStart(2, '0')}
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, border: '2px solid #000000',
                background: `hsl(${s.roll_no * 37 % 360}, 75%, 90%)`,
                color: '#000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '800',
              }}>
                {s.name.charAt(0)}
              </div>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>{s.name}</span>
              <span style={{ marginLeft: 'auto' }}><StatusChip status="Absent" /></span>
            </div>
          ))}
        </div>
      )}

      {/* On Duty Students */}
      {report.onDuty.length > 0 && (
        <div className="brutal-card" style={{ overflow: 'hidden', marginTop: '16px' }}>
          <div style={{
            padding: '12px 24px', borderBottom: '2px solid #000000',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#FEF3C7',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', border: '1px solid #000000' }} />
            <span style={{ fontWeight: '800', fontSize: '14px', color: '#000000', fontFamily: 'var(--font-sketch)' }}>
              On Duty — {report.onDuty.length} student{report.onDuty.length > 1 ? 's' : ''} (Counted as Present)
            </span>
          </div>
          {report.onDuty.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 24px',
              borderBottom: i < report.onDuty.length - 1 ? '2px solid #000000' : 'none',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '24px', fontWeight: '700' }}>
                {s.roll_no.toString().padStart(2, '0')}
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0, border: '2px solid #000000',
                background: `hsl(${s.roll_no * 37 % 360}, 75%, 90%)`,
                color: '#000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '800',
              }}>
                {s.name.charAt(0)}
              </div>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>{s.name}</span>
              <span style={{ marginLeft: 'auto' }}><StatusChip status="On Duty" /></span>
            </div>
          ))}
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '20px', fontWeight: '600', fontFamily: 'var(--font-sketch)' }}>
        Submitted at {report.submittedAt ? format(new Date(report.submittedAt), 'hh:mm a') : '—'} · By {report.submittedBy}
      </p>
    </motion.div>
  );
}

// ── Main MarkAttendance Component ─────────────────────────────────────────────
export default function MarkAttendance() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { students: ALL_STUDENTS, getSessionsForDate, updateAttendance, clearAttendance, submitSession, unlockSession } = useAttendance();
  const { profile } = useAuth();
  const [session, setSession] = useState('Morning');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReport, setShowReport] = useState(false);

  const daySessions = getSessionsForDate(todayStr);
  const currentSession = daySessions[session];
  const isLocked = !!currentSession.submittedAt;

  const handleCycle = (id) => {
    if (isLocked) return;
    const cur = currentSession.attendance[id];
    updateAttendance(todayStr, session, id, STATUS_CYCLE[cur]);
  };

  const handleSubmit = () => {
    submitSession(todayStr, session, profile?.name || 'Teacher', currentSession.attendance);
    setShowReport(true);
    toast.success(`${session} attendance submitted & locked!`, { icon: '🔒' });
  };

  const handleEdit = () => {
    if (window.confirm(`Are you sure you want to unlock and edit ${session} attendance?`)) {
      unlockSession(todayStr, session);
      setShowReport(false);
      toast('Session unlocked for editing', { icon: '🔓' });
    }
  };

  const handleClear = () => {
    if (window.confirm(`Are you sure you want to reset all students to Present for the ${session} session?`)) {
      clearAttendance(todayStr, session);
      toast.success('Attendance cleared', { icon: '🧹' });
    }
  };

  const filtered = ALL_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roll_no.toString().includes(searchQuery)
  );

  const att = currentSession.attendance;
  const stats = {
    present: ALL_STUDENTS.filter(s => att[s.id] === 'Present').length,
    absent: ALL_STUDENTS.filter(s => att[s.id] === 'Absent').length,
    onDuty: ALL_STUDENTS.filter(s => att[s.id] === 'On Duty').length,
  };
  const absentList = ALL_STUDENTS.filter(s => att[s.id] === 'Absent');
  const onDutyList = ALL_STUDENTS.filter(s => att[s.id] === 'On Duty');
  
  const report = {
    present: ALL_STUDENTS.filter(s => (att[s.id] || 'Present') === 'Present'),
    absent: absentList,
    onDuty: onDutyList,
    total: ALL_STUDENTS.length,
    submittedAt: currentSession.submittedAt,
    submittedBy: currentSession.submittedBy
  };

  // Show report view after submit
  if (showReport && isLocked) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              {session} Report
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
              {format(new Date(), 'EEEE, dd MMMM yyyy')} · Locked
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowReport(false)}
              className="brutal-btn brutal-btn-secondary"
              style={{ fontSize: '13px' }}
            >
              ← Back
            </button>
            <button
              onClick={handleEdit}
              className="brutal-btn"
              style={{ fontSize: '13px', background: '#FEF3C7' }}
            >
              Edit Attendance
            </button>
            <button
              onClick={() => { setSession(session === 'Morning' ? 'Afternoon' : 'Morning'); setShowReport(false); }}
              className="brutal-btn"
              style={{ fontSize: '13px' }}
            >
              Mark {session === 'Morning' ? 'Afternoon' : 'Morning'} →
            </button>
          </div>
        </div>
        <AttendanceReport report={report} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start max-w-[1200px] mx-auto w-full">

      {/* ── LEFT: Student List ── */}
      <div style={{ flex: 1, minWidth: 0 }} className="w-full">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              Mark Attendance
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
              {format(new Date(), 'EEEE, dd MMMM yyyy')} · BCA · {ALL_STUDENTS.length} students
            </p>
          </div>

          {/* Session Toggle */}
          <div style={{ display: 'flex', background: '#FFFFFF', border: '2px solid #000000', borderRadius: '8px', padding: '4px', gap: '4px', boxShadow: '2px 2px 0px 0px #000000' }}>
            {['Morning', 'Afternoon'].map(s => {
              const locked = !!getSessionsForDate(todayStr)[s].submittedAt;
              return (
                <button
                  key={s}
                  onClick={() => { setSession(s); setShowReport(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '4px', border: 'none',
                    fontSize: '13px', fontWeight: '800', cursor: 'pointer',
                    background: session === s ? 'var(--primary)' : 'transparent',
                    color: '#000000',
                    border: session === s ? '2px solid #000000' : '2px solid transparent',
                    fontFamily: 'var(--font-sketch)',
                    transition: 'all 0.1s',
                  }}
                >
                  {s === 'Morning' ? <SunMedium size={14} /> : <Sunset size={14} />}
                  {s}
                  {locked && <CheckCircle size={12} color="#000000" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Locked banner */}
        {isLocked && (
          <div className="brutal-card" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 20px', background: '#E2FBE9',
            marginBottom: '16px',
          }}>
            <Lock size={14} color="#000000" />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#000000', fontFamily: 'var(--font-sketch)' }}>
              {session} attendance is locked.
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button
                onClick={handleEdit}
                className="brutal-btn brutal-btn-secondary"
                style={{
                  padding: '4px 12px', fontSize: '11px', height: '28px', background: '#FEF3C7'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="brutal-btn"
                style={{
                  padding: '4px 12px', fontSize: '11px', height: '28px'
                }}
              >
                View Report →
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#000000' }} />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="brutal-input"
            style={{
              paddingLeft: '40px',
            }}
          />
        </div>

        {/* Student List */}
        <div className="brutal-card" style={{ overflow: 'hidden' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>No students found.</div>
          )}
          {filtered.map((student, idx) => (
            <motion.div
              key={student.id}
              whileTap={!isLocked ? { scale: 0.995 } : {}}
              onClick={() => handleCycle(student.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px',
                borderBottom: idx < filtered.length - 1 ? '2px solid #000000' : 'none',
                cursor: isLocked ? 'default' : 'pointer',
                transition: 'background 0.15s', userSelect: 'none',
              }}
              onMouseEnter={e => { if (!isLocked) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ width: '28px', fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
                  {student.roll_no.toString().padStart(2, '0')}
                </span>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0, border: '2px solid #000000',
                  background: `hsl(${student.roll_no * 37 % 360}, 75%, 90%)`,
                  color: '#000000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '800',
                }}>
                  {student.name.charAt(0)}
                </div>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>{student.name}</span>
              </div>
              <StatusChip status={att[student.id]} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Summary Panel ── */}
      <div className="w-full lg:w-[290px] lg:sticky lg:top-5 flex-shrink-0">

        {/* Stats */}
        <div className="brutal-card" style={{ padding: '20px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', margin: '0 0 16px', fontFamily: 'var(--font-sketch)' }}>
            Live Summary
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Present', value: stats.present, bg: '#E2FBE9', color: '#0F5132' },
              { label: 'Absent', value: stats.absent, bg: '#FEE2E2', color: '#842029' },
              { label: 'On Duty', value: stats.onDuty, bg: '#FEF3C7', color: '#664D03' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, borderRadius: '6px', border: '2px solid #000000',
                boxShadow: '1px 1px 0px 0px #000000',
                padding: '10px 4px', textAlign: 'center'
              }}>
                <p style={{ fontSize: '22px', fontWeight: '800', color: '#000000', margin: '0 0 2px', fontFamily: 'var(--font-sketch)' }}>{s.value}</p>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {absentList.length > 0 && (
            <div style={{ marginBottom: onDutyList.length > 0 ? '12px' : 0 }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#EF4444', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-sketch)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', border: '1px solid #000000', display: 'inline-block' }} />
                Absent ({absentList.length})
              </p>
              {absentList.map(s => (
                <div key={s.id} style={{ display: 'flex', gap: '8px', padding: '3px 0', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)', minWidth: '22px', fontWeight: '700' }}>{s.roll_no.toString().padStart(2, '0')}</span>
                  <span style={{ fontWeight: '700' }}>{s.name}</span>
                </div>
              ))}
            </div>
          )}

          {absentList.length > 0 && onDutyList.length > 0 && (
            <div style={{ height: '2px', background: '#000000', margin: '12px 0' }} />
          )}

          {onDutyList.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#F59E0B', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-sketch)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', border: '1px solid #000000', display: 'inline-block' }} />
                On Duty ({onDutyList.length})
              </p>
              {onDutyList.map(s => (
                <div key={s.id} style={{ display: 'flex', gap: '8px', padding: '3px 0', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)', minWidth: '22px', fontWeight: '700' }}>{s.roll_no.toString().padStart(2, '0')}</span>
                  <span style={{ fontWeight: '700' }}>{s.name}</span>
                </div>
              ))}
            </div>
          )}

          {stats.present === ALL_STUDENTS.length && (
            <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', background: '#E2FBE9', borderRadius: '6px', border: '2px solid #000000', marginTop: '4px' }}>
              <CheckCircle size={16} color="#000000" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '12px', color: '#000000', margin: 0, fontWeight: '700', fontFamily: 'var(--font-sketch)' }}>All 43 students are present.</p>
            </div>
          )}
        </div>

        {/* Submit / View Report Button */}
        {isLocked ? (
          <button
            onClick={() => setShowReport(true)}
            className="brutal-btn"
            style={{ width: '100%', background: 'var(--primary)', border: '3px solid #000000' }}
          >
            <ClipboardList size={16} /> View Report
          </button>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '8px', marginBottom: '10px' }}>
              <HoldToSubmit onSubmit={handleSubmit} />
              <button
                onClick={handleClear}
                className="brutal-btn brutal-btn-secondary"
                style={{ width: '100%', padding: '10px', color: '#EF4444' }}
              >
                Clear
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: '700', fontFamily: 'var(--font-sketch)' }}>
              <Lock size={11} /> Will be locked after submission
            </p>
          </>
        )}
      </div>
    </div>
  );
}
