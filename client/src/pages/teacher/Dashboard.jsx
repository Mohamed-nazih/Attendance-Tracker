import React from 'react';
import { ClipboardList, Users, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { format } from 'date-fns';
import { useAttendance } from '../../context/AttendanceContext';

export default function TeacherDashboard() {
  const { getSessionsForDate, students: ALL_STUDENTS } = useAttendance();
  const sessions = getSessionsForDate(format(new Date(), 'yyyy-MM-dd'));

  const morningLocked = !!(sessions.Morning && sessions.Morning.submittedAt);
  const afternoonLocked = !!(sessions.Afternoon && sessions.Afternoon.submittedAt);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Teacher Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
          {format(new Date(), 'EEEE, dd MMMM yyyy')} · Class: BCA
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          {
            label: 'Morning Session',
            status: morningLocked ? 'Submitted ✓' : 'Awaiting Submission ⚡',
            bg: morningLocked ? '#E2FBE9' : '#FEF3C7',
            desc: morningLocked ? 'Locked & sent to admin' : 'Action required'
          },
          {
            label: 'Afternoon Session',
            status: afternoonLocked ? 'Submitted ✓' : 'Pending...',
            bg: afternoonLocked ? '#E2FBE9' : '#FAF6EE',
            desc: afternoonLocked ? 'Locked & sent to admin' : 'Mark after 1:00 PM'
          },
          {
            label: 'Total Students',
            status: `${ALL_STUDENTS.length} Active`,
            bg: 'var(--primary)',
            desc: 'BCA Honours class'
          },
        ].map(item => (
          <div key={item.label} className="brutal-card" style={{ padding: '20px', background: item.bg }}>
            <p style={{ fontSize: '11px', fontWeight: '800', uppercase: true, color: 'var(--text-secondary)', margin: '0 0 4px', letterSpacing: '0.05em' }}>
              {item.label}
            </p>
            <p style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px', fontFamily: 'var(--font-sketch)' }}>
              {item.status}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', fontFamily: 'var(--font-sketch)' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <NavLink to="/teacher/attendance" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="brutal-card" style={{
              display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
              background: '#FFFFFF', cursor: 'pointer'
            }}>
              <div style={{
                padding: '12px', borderRadius: '8px', border: '2px solid #000000',
                background: 'var(--primary)', boxShadow: '2px 2px 0px 0px #000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ClipboardList size={22} color="#000000" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '800', fontSize: '15px', margin: '0 0 2px', fontFamily: 'var(--font-sketch)' }}>Mark Daily Attendance</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>Mark, submit, and lock today's sessions</p>
              </div>
              <ArrowRight size={18} color="#000000" />
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
