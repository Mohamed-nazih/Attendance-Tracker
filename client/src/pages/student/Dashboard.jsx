import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLE = {
  Present: { bg: '#E2FBE9', color: '#0F5132', border: '#000000', dot: '#22C55E' },
  Absent:  { bg: '#FEE2E2', color: '#842029', border: '#000000', dot: '#EF4444' },
  Pending: { bg: '#EBEBEA', color: '#3F3F46', border: '#000000', dot: '#9CA3AF' },
};

function SessionRow({ label, displayStatus, locked }) {
  const s = STATUS_STYLE[displayStatus] || STATUS_STYLE.Pending;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '6px', border: '2px solid #000000',
          background: locked ? s.bg : '#FAF6EE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '1px 1px 0px 0px #000000'
        }}>
          {!locked
            ? <Clock size={16} color="#000000" />
            : displayStatus === 'Present'
              ? <CheckCircle size={16} color="#000000" />
              : <AlertTriangle size={16} color="#000000" />
          }
        </div>
        <span style={{ fontWeight: '700', fontSize: '14px' }}>{label} Session</span>
      </div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 12px', borderRadius: '4px', border: '2px solid #000000',
        fontSize: '12px', fontWeight: '800',
        background: s.bg, color: '#000000',
        boxShadow: '1px 1px 0px 0px #000000',
        fontFamily: 'var(--font-sketch)'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
        {displayStatus}
      </span>
    </div>
  );
}

export default function StudentDashboard() {
  const { profile } = useAuth();
  const { getSessionsForDate, getStudentStats, currentSemester, students, dailyData } = useAttendance();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const daySessions = getSessionsForDate(todayStr);
  const morningSession = daySessions.Morning || {};
  const afternoonSession = daySessions.Afternoon || {};

  // Resolve logged in student from profile's register_no or email
  const myStudentId = profile?.register_no || null;
  const myEmail = profile?.email || null;

  const me = (myStudentId || myEmail) ? students.find(s => 
    (myStudentId && (s.id === myStudentId || s.register_no === myStudentId || s.reg === myStudentId)) ||
    (myEmail && s.email && s.email.toLowerCase() === myEmail.toLowerCase())
  ) : null;
  if (!me) return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div className="brutal-card" style={{ maxWidth: '420px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{
          width: 58, height: 58, borderRadius: '14px', border: '3px solid #000000',
          background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '3px 3px 0px 0px #000000',
        }}>
          <AlertTriangle size={25} color="#000000" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 8px', color: '#000000' }}>
          Record Not Found
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55, fontWeight: '650' }}>
          Your student record could not be found in the class list. Please contact your class teacher.
        </p>
      </div>
    </div>
  );

  // Resolve dynamic stats using context
  const stats = getStudentStats(me.id);

  const isMorningAbsent  = morningSession.attendance && morningSession.attendance[me.id] === 'Absent';
  const isAfternoonAbsent = afternoonSession.attendance && afternoonSession.attendance[me.id] === 'Absent';

  const myMorningStatus   = morningSession.submittedAt ? (isMorningAbsent  ? 'Absent' : 'Present') : 'Pending';
  const myAfternoonStatus = afternoonSession.submittedAt ? (isAfternoonAbsent ? 'Absent' : 'Present') : 'Pending';

  const circleR       = 80;
  const circumference = 2 * Math.PI * circleR;
  const strokeOffset  = circumference - (circumference * stats.overallPct) / 100;
  const strokeColor   = stats.overallPct >= 75 ? 'var(--primary)' : '#EF4444';

  const greetingHour = new Date().getHours();
  const greeting     = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          {greeting}, {me.name} 👋
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
          Roll No: {String(me.roll_no).padStart(2, '0')} · {me.reg} · BCA Honours A
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-[18px] items-start">

        {/* ── Left ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* June circular progress */}
          <div className="brutal-card" style={{ padding: '28px 32px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', margin: '0 0 20px', fontFamily: 'var(--font-sketch)' }}>
              Semester {currentSemester} Attendance
            </p>

            <div style={{ position: 'relative', width: '170px', height: '170px', margin: '0 auto 24px' }}>
              <svg width="170" height="170" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="85" cy="85" r={circleR} stroke="#FFFFFF" strokeWidth="12" fill="transparent" style={{ stroke: '#FFFFFF', strokeWidth: '12px', filter: 'drop-shadow(0px 0px 1px #000)' }} />
                <motion.circle
                  cx="85" cy="85" r={circleR}
                  stroke={strokeColor} strokeWidth="12" fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeOffset }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay: 0.15 }}
                  strokeLinecap="round"
                  style={{ stroke: strokeColor, strokeWidth: '12px' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '32px', fontWeight: '850', lineHeight: 1, letterSpacing: '-1px', color: '#000000', fontFamily: 'var(--font-sketch)' }}>
                  {stats.overallPct.toFixed(1)}%
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '700' }}>
                  {stats.presentCount} / {stats.totalWorkingDays} days
                </span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '2px solid #000000', paddingTop: '18px', gap: '8px' }}>
              {[
                { label: 'Days Present', value: stats.presentCount, bg: '#E2FBE9', color: '#0F5132' },
                { label: 'Days Absent',  value: (stats.totalWorkingDays - stats.presentCount).toFixed(1).replace('.0',''), bg: '#FEE2E2', color: '#842029' },
                { label: 'Working Days', value: stats.totalWorkingDays, bg: '#FFFFFF', color: '#000000' },
              ].map(s => (
                <div key={s.label} style={{
                  background: s.bg, border: '2px solid #000000', borderRadius: '6px',
                  boxShadow: '1px 1px 0px 0px #000000', padding: '6px 4px'
                }}>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: '#000000', margin: '0 0 3px', lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{s.value}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {stats.overallPct > 0 && stats.overallPct < 75 && (
              <div className="brutal-card" style={{
                marginTop: '16px', padding: '10px 14px', background: '#FEE2E2',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <AlertTriangle size={14} color="#000000" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: '#000000', margin: 0, fontWeight: '700', fontFamily: 'var(--font-sketch)' }}>
                  Below 75% threshold — attendance shortage risk!
                </p>
              </div>
            )}
          </div>

          {/* Today's sessions */}
          <div className="brutal-card" style={{ padding: '18px 22px' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sketch)' }}>
              <Calendar size={14} color="#000000" /> Today — {format(new Date(), 'dd MMMM yyyy')}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 12px', fontWeight: '600' }}>
              On Duty is counted as Present in your record
            </p>
            <div style={{ borderTop: '2px solid #000000' }}>
              <SessionRow label="Morning" displayStatus={myMorningStatus} locked={!!morningSession.submittedAt} />
              <div style={{ height: '2px', background: '#000000', margin: '0 0' }} />
              <SessionRow label="Afternoon" displayStatus={myAfternoonStatus} locked={!!afternoonSession.submittedAt} />
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Overall & monthly breakdown */}
          <div className="brutal-card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sketch)' }}>
              <TrendingUp size={14} color="#000000" /> Overall Stats & Monthly Breakdown
            </p>

            {(() => {
              const months = {};
              if (me.june_tw > 0) {
                months['June'] = { present: Number(me.june_tdp || 0), working: Number(me.june_tw || 0) };
              }
              Object.entries(dailyData || {}).forEach(([dateStr, day]) => {
                const morningSub = day.Morning?.submittedAt;
                const afternoonSub = day.Afternoon?.submittedAt;
                if (morningSub || afternoonSub) {
                  let p = 0;
                  if (morningSub) {
                    const st = day.Morning.attendance[me.id];
                    if (st === 'Present' || st === 'On Duty') p += 0.5;
                  }
                  if (afternoonSub) {
                    const st = day.Afternoon.attendance[me.id];
                    if (st === 'Present' || st === 'On Duty') p += 0.5;
                  }
                  const mName = format(new Date(dateStr), 'MMMM');
                  if (!months[mName]) months[mName] = { present: 0, working: 0 };
                  months[mName].working += 1;
                  months[mName].present += p;
                }
              });
              
              const monthlyRows = Object.entries(months).map(([name, data]) => ({
                label: name,
                pct: data.working === 0 ? 0 : (data.present / data.working) * 100,
                note: `${data.present} / ${data.working} days`
              }));

              return [
                ...monthlyRows,
                { label: `Overall Total`, pct: stats.overallPct, active: true, note: 'Semester ' + currentSemester },
              ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '2px solid #000000',
              }}>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '750' }}>{row.label}</span>
                  {row.note && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '6px', fontStyle: 'italic', fontWeight: '700' }}>
                      ({row.note})
                    </span>
                  )}
                </div>
                <span style={{
                  fontWeight: '800', fontSize: '14px', fontFamily: 'var(--font-sketch)',
                  color: row.pct >= 75 ? '#0F5132' : '#842029',
                }}>{Number(row.pct).toFixed(2)}%</span>
              </div>
            ))})()}

            {/* Total */}
            <div style={{ paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'var(--font-sketch)' }}>Semester {currentSemester} Total</span>
                <span style={{
                  fontSize: '22px', fontWeight: '900', fontFamily: 'var(--font-sketch)',
                  color: stats.overallPct >= 75 ? '#000000' : '#EF4444',
                }}>{stats.overallPct.toFixed(2)}%</span>
              </div>
              <div style={{ height: '10px', background: '#FFFFFF', border: '2px solid #000000', borderRadius: '99px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stats.overallPct, 100)}%` }}
                  transition={{ duration: 1.1, delay: 0.3 }}
                  style={{
                    height: '100%', borderRadius: '99px',
                    background: stats.overallPct >= 75 ? 'var(--primary)' : '#EF4444',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>0%</span>
                <span style={{
                  fontSize: '10px', fontWeight: '800',
                  color: stats.overallPct >= 75 ? '#0F5132' : '#EF4444',
                  fontFamily: 'var(--font-sketch)'
                }}>
                  {stats.overallPct >= 75 ? '✓ Safe' : '⚠ Warning'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>100%</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="brutal-card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-sketch)' }}>
              <Bell size={14} color="#000000" /> Notifications
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {morningSession.submittedAt ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', border: '1px solid #000000', marginTop: '5px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '13px', margin: '0 0 2px', fontFamily: 'var(--font-sketch)' }}>Morning Marked</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
                      You are marked <strong style={{ color: isMorningAbsent ? '#EF4444' : '#0F5132' }}>{myMorningStatus}</strong> for morning session.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', border: '1px solid #000000', marginTop: '5px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '13px', margin: '0 0 2px', fontFamily: 'var(--font-sketch)' }}>Morning Pending</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
                      Morning session hasn't been submitted yet.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Register number card */}
          <div className="brutal-card" style={{
            background: 'var(--primary)',
            padding: '16px 20px', color: '#000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}>
            <p style={{ fontSize: '11px', fontWeight: '800', opacity: 0.7, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-sketch)' }}>
              Register Number
            </p>
            <p style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '0.5px', fontFamily: 'var(--font-sketch)' }}>{me.register_no || me.reg}</p>
            <p style={{ fontSize: '12px', opacity: 0.8, margin: 0, fontWeight: '700' }}>BCA Honours A · 2025-26</p>
          </div>
        </div>
      </div>
    </div>
  );
}
