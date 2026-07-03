import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import StudentToolkit from '../../components/student/Toolkit';
import { AlertTriangle, Backpack } from 'lucide-react';

export default function StudentToolkitPage() {
  const { profile } = useAuth();
  const { students, getStudentStats } = useAttendance();

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

  const stats = getStudentStats(me.id);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Backpack size={24} color="#000000" /> Toolkit
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
          Predict your attendance and calculate your GPA
        </p>
      </div>
      
      {/* The component already handles its own flex column gap layout */}
      <StudentToolkit stats={stats} />
    </div>
  );
}
