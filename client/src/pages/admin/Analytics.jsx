import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useAttendance } from '../../context/AttendanceContext';

const PIE_COLORS = ['#C9F135', '#EF4444', '#F59E0B'];

function getSessionPercent(report) {
  if (!report.locked || !report.total) return 0;
  return Math.round(((report.present.length + report.onDuty.length) / report.total) * 100);
}

export default function Analytics() {
  const { getSessionsForDate, students: ALL_STUDENTS } = useAttendance();
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

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
  const selectedReport = morningReport.locked ? morningReport : afternoonReport;

  const pieData = [
    { name: 'Present', value: selectedReport.locked ? selectedReport.present.length : ALL_STUDENTS.length },
    { name: 'Absent', value: selectedReport.locked ? selectedReport.absent.length : 0 },
    { name: 'On Duty', value: selectedReport.locked ? selectedReport.onDuty.length : 0 },
  ];

  const weeklyData = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => {
      const date = subDays(new Date(selectedDate), 4 - index);
      const dateStr = format(date, 'yyyy-MM-dd');
      const morning = generateReport(dateStr, 'Morning');
      const afternoon = generateReport(dateStr, 'Afternoon');
      const lockedReports = [morning, afternoon].filter(report => report.locked);

      const attendance = lockedReports.length
        ? Math.round(lockedReports.reduce((sum, report) => sum + getSessionPercent(report), 0) / lockedReports.length)
        : 0;

      return {
        name: format(date, 'EEE'),
        date: dateStr,
        attendance,
      };
    });
  }, [getSessionsForDate, ALL_STUDENTS, selectedDate]);

  const lockedSessions = [morningReport, afternoonReport].filter(report => report.locked).length;
  const dayPercent = lockedSessions
    ? Math.round((getSessionPercent(morningReport) + getSessionPercent(afternoonReport)) / lockedSessions)
    : 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Analytics
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
            Attendance chart and weekly bar report for BCA Honours A
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#000000" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="brutal-input"
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              width: '160px',
              fontFamily: 'var(--font-sketch)',
              fontWeight: '800',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="brutal-card" style={{ padding: '18px 22px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px', fontWeight: '700' }}>Selected Day</p>
          <p style={{ fontSize: '28px', fontWeight: '800', margin: 0, lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{dayPercent}%</p>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0', fontWeight: '600' }}>
            {lockedSessions ? `${lockedSessions} session(s) marked` : 'No sessions marked'}
          </p>
        </div>
        <div className="brutal-card" style={{ padding: '18px 22px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px', fontWeight: '700' }}>Morning</p>
          <p style={{ fontSize: '28px', fontWeight: '800', margin: 0, lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{getSessionPercent(morningReport)}%</p>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0', fontWeight: '600' }}>
            {morningReport.locked ? 'Submitted session' : 'Awaiting attendance'}
          </p>
        </div>
        <div className="brutal-card" style={{ padding: '18px 22px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px', fontWeight: '700' }}>Afternoon</p>
          <p style={{ fontSize: '28px', fontWeight: '800', margin: 0, lineHeight: 1, fontFamily: 'var(--font-sketch)' }}>{getSessionPercent(afternoonReport)}%</p>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0', fontWeight: '600' }}>
            {afternoonReport.locked ? 'Submitted session' : 'Awaiting attendance'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="brutal-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <PieChartIcon size={18} color="#000000" />
            <h2 style={{ fontWeight: '800', fontSize: '15px', margin: 0, fontFamily: 'var(--font-sketch)' }}>
              Attendance Distribution
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ flex: 1, height: 190 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} stroke="#000000" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '110px' }}>
              {pieData.map((item, index) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[index], border: '1px solid #000000', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1, fontWeight: '700' }}>{item.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'var(--font-sketch)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="brutal-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <BarChart3 size={18} color="#000000" />
            <h2 style={{ fontWeight: '800', fontSize: '15px', margin: 0, fontFamily: 'var(--font-sketch)' }}>
              Weekly Bar Report
            </h2>
          </div>
          <div style={{ height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barSize={28}>
                <XAxis dataKey="name" axisLine={{ stroke: '#000000', strokeWidth: 2 }} tickLine={false} tick={{ fontSize: 11, fill: '#000000', fontWeight: 700 }} />
                <YAxis axisLine={{ stroke: '#000000', strokeWidth: 2 }} tickLine={false} tick={{ fontSize: 11, fill: '#000000', fontWeight: 700 }} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  contentStyle={{ borderRadius: '4px', border: '2px solid #000000', background: '#FFFFFF', fontSize: '12px', fontWeight: '700' }}
                  formatter={(value) => [`${value}%`, 'Attendance']}
                />
                <Bar dataKey="attendance" fill="var(--primary)" stroke="#000000" strokeWidth={2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
