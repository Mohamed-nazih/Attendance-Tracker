import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import { isDemoMode } from './AuthContext';
import toast from 'react-hot-toast';

export const ALL_STUDENTS = [
  { id: 'NIAYBCA001', roll_no: 1,  reg: 'NIAYBCA001', name: 'Abel Biju', email: '', june_tw: 21, june_tdp: 18,   june_pct: 85.71 },
  { id: 'NIAYBCA002', roll_no: 2,  reg: 'NIAYBCA002', name: 'Abhaygovind P B', email: '', june_tw: 21, june_tdp: 13.5, june_pct: 64.29 },
  { id: 'NIAYBCA003', roll_no: 3,  reg: 'NIAYBCA003', name: 'Abhinav A J', email: '', june_tw: 21, june_tdp: 7,    june_pct: 33.33 },
  { id: 'NIAYBCA004', roll_no: 4,  reg: 'NIAYBCA004', name: 'Abin Benny', email: '', june_tw: 21, june_tdp: 16.5, june_pct: 78.57 },
  { id: 'NIAYBCA006', roll_no: 5,  reg: 'NIAYBCA006', name: 'Adhith Ouseph Varughese', email: '', june_tw: 21, june_tdp: 18,   june_pct: 85.71 },
  { id: 'NIAYBCA008', roll_no: 6,  reg: 'NIAYBCA008', name: 'Adithyan N A', email: '', june_tw: 21, june_tdp: 14.5, june_pct: 69.05 },
  { id: 'NIAYBCA009', roll_no: 7,  reg: 'NIAYBCA009', name: 'Airin Simi Varghese', email: '', june_tw: 21, june_tdp: 16,   june_pct: 76.19 },
  { id: 'NIAYBCA010', roll_no: 8,  reg: 'NIAYBCA010', name: 'Aiswarya Lalson', email: '', june_tw: 21, june_tdp: 18,   june_pct: 85.71 },
  { id: 'NIAYBCA012', roll_no: 9,  reg: 'NIAYBCA012', name: 'Ajin Pauly', email: '', june_tw: 21, june_tdp: 15,   june_pct: 71.43 },
  { id: 'NIAYBCA013', roll_no: 10, reg: 'NIAYBCA013', name: 'Ajwin Johnson', email: '', june_tw: 21, june_tdp: 17,   june_pct: 80.95 },
  { id: 'NIAYBCA014', roll_no: 11, reg: 'NIAYBCA014', name: 'Akshay Thankachan', email: '', june_tw: 21, june_tdp: 16.5, june_pct: 78.57 },
  { id: 'NIAYBCA015', roll_no: 12, reg: 'NIAYBCA015', name: 'Alan Augusty', email: '', june_tw: 21, june_tdp: 18,   june_pct: 85.71 },
  { id: 'NIAYBCA017', roll_no: 13, reg: 'NIAYBCA017', name: 'Aleena Jose', email: '', june_tw: 21, june_tdp: 17.5, june_pct: 83.33 },
  { id: 'NIAYBCA018', roll_no: 14, reg: 'NIAYBCA018', name: 'Aleena Joy', email: '', june_tw: 21, june_tdp: 19,   june_pct: 90.48 },
  { id: 'NIAYBCA019', roll_no: 15, reg: 'NIAYBCA019', name: 'Alosh C Majo', email: '', june_tw: 21, june_tdp: 20,   june_pct: 95.24 },
  { id: 'NIAYBCA024', roll_no: 16, reg: 'NIAYBCA024', name: 'Anupama Anna Antony', email: '', june_tw: 21, june_tdp: 14.5, june_pct: 69.05 },
  { id: 'NIAYBCA025', roll_no: 17, reg: 'NIAYBCA025', name: 'Archana N B', email: '', june_tw: 21, june_tdp: 21,   june_pct: 100.00 },
  { id: 'NIAYBCA026', roll_no: 18, reg: 'NIAYBCA026', name: 'Ardra Krishna A G', email: '', june_tw: 21, june_tdp: 20,   june_pct: 95.24 },
  { id: 'NIAYBCA027', roll_no: 19, reg: 'NIAYBCA027', name: 'Arjun Ajith', email: '', june_tw: 21, june_tdp: 17.5, june_pct: 83.33 },
  { id: 'NIAYBCA029', roll_no: 20, reg: 'NIAYBCA029', name: 'Ashley R Joseph', email: '', june_tw: 21, june_tdp: 20,   june_pct: 95.24 },
  { id: 'NIAYBCA031', roll_no: 21, reg: 'NIAYBCA031', name: 'Athuljith Siju', email: '', june_tw: 21, june_tdp: 15.5, june_pct: 73.81 },
  { id: 'NIAYBCA033', roll_no: 22, reg: 'NIAYBCA033', name: 'Balu K B', email: '', june_tw: 21, june_tdp: 16,   june_pct: 76.19 },
  { id: 'NIAYBCA034', roll_no: 23, reg: 'NIAYBCA034', name: 'Binil Balakrishnan', email: '', june_tw: 21, june_tdp: 14,   june_pct: 66.67 },
  { id: 'NIAYBCA036', roll_no: 24, reg: 'NIAYBCA036', name: 'Celin Baiju M', email: '', june_tw: 21, june_tdp: 18.5, june_pct: 88.10 },
  { id: 'NIAYBCA041', roll_no: 25, reg: 'NIAYBCA041', name: 'Edric Laiju', email: '', june_tw: 21, june_tdp: 18,   june_pct: 85.71 },
  { id: 'NIAYBCA044', roll_no: 26, reg: 'NIAYBCA044', name: 'Gowtham Krishna T V', email: '', june_tw: 21, june_tdp: 20,   june_pct: 95.24 },
  { id: 'NIAYBCA047', roll_no: 27, reg: 'NIAYBCA047', name: 'Jans Thomas', email: '', june_tw: 21, june_tdp: 16.5, june_pct: 78.57 },
  { id: 'NIAYBCA048', roll_no: 28, reg: 'NIAYBCA048', name: 'Jees Johnson', email: '', june_tw: 21, june_tdp: 17,   june_pct: 80.95 },
  { id: 'NIAYBCA049', roll_no: 29, reg: 'NIAYBCA049', name: 'Jeevan Paul', email: '', june_tw: 21, june_tdp: 17,   june_pct: 80.95 },
  { id: 'NIAYBCA058', roll_no: 30, reg: 'NIAYBCA058', name: 'Joseph Varghese', email: '', june_tw: 21, june_tdp: 11,   june_pct: 52.38 },
  { id: 'NIAYBCA060', roll_no: 31, reg: 'NIAYBCA060', name: 'Joyal Benny', email: '', june_tw: 21, june_tdp: 14.5, june_pct: 69.05 },
  { id: 'NIAYBCA061', roll_no: 32, reg: 'NIAYBCA061', name: 'Joyal Thomas', email: '', june_tw: 21, june_tdp: 17,   june_pct: 80.95 },
  { id: 'NIAYBCA062', roll_no: 33, reg: 'NIAYBCA062', name: 'Justin J Kallarackal', email: '', june_tw: 21, june_tdp: 14.5, june_pct: 69.05 },
  { id: 'NIAYBCA063', roll_no: 34, reg: 'NIAYBCA063', name: 'K M Mohammed Rizwan Mather', email: '', june_tw: 21, june_tdp: 18,   june_pct: 85.71 },
  { id: 'NIAYBCA065', roll_no: 35, reg: 'NIAYBCA065', name: 'Lanson Thomas', email: '', june_tw: 21, june_tdp: 20.5, june_pct: 97.62 },
  { id: 'NIAYBCA066', roll_no: 36, reg: 'NIAYBCA066', name: 'Leen Bhasi P', email: '', june_tw: 21, june_tdp: 8,    june_pct: 38.10 },
  { id: 'NIAYBCA069', roll_no: 37, reg: 'NIAYBCA069', name: 'Mariya Thomas', email: '', june_tw: 21, june_tdp: 19,   june_pct: 90.48 },
  { id: 'NIAYBCA071', roll_no: 38, reg: 'NIAYBCA071', name: 'Merin Antony', email: '', june_tw: 21, june_tdp: 18.5, june_pct: 88.10 },
  { id: 'NIAYBCA072', roll_no: 39, reg: 'NIAYBCA072', name: 'Mohamed Nazih', email: '', june_tw: 21, june_tdp: 16.5, june_pct: 78.57 },
  { id: 'NIAYBCA074', roll_no: 40, reg: 'NIAYBCA074', name: 'Noyal Geo', email: '', june_tw: 21, june_tdp: 17,   june_pct: 80.95 },
  { id: 'NIAYBCA075', roll_no: 41, reg: 'NIAYBCA075', name: 'Pavithra Baiju', email: '', june_tw: 21, june_tdp: 20.5, june_pct: 97.62 },
  { id: 'NIAYBCA081', roll_no: 42, reg: 'NIAYBCA081', name: 'Sreerag C Nair', email: '', june_tw: 21, june_tdp: 18,   june_pct: 85.71 },
  { id: 'NIAYBCA083', roll_no: 43, reg: 'NIAYBCA083', name: 'Vinayak M Thoppil', email: '', june_tw: 21, june_tdp: 16,   june_pct: 76.19 }
];

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const [dailyData, setDailyData] = useState({});
  const [students, setStudents] = useState(isDemoMode ? ALL_STUDENTS : []);
  const [currentSemester, setCurrentSemester] = useState(5);
  const [loading, setLoading] = useState(!isDemoMode);

  // Generates default "Present" state for all students based on currently loaded students
  const makeDefault = () => {
    const init = {};
    const source = isDemoMode ? ALL_STUDENTS : students;
    source.forEach(s => { init[s.id] = 'Present'; });
    return init;
  };

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }

    async function loadBackendData() {
      try {
        // 1. Fetch current semester settings
        let sem = 5;
        const { data: settings } = await supabase.from('settings').select('*').single();
        if (settings) {
          sem = settings.current_semester;
          setCurrentSemester(sem);
        } else {
          await supabase.from('settings').insert({ id: 1, current_semester: 5 });
        }

        // 2. Fetch or initialize students
        const { data: studentsData } = await supabase.from('students').select('*').order('roll_no');
        let activeStudents = studentsData;
        
        if (!studentsData || studentsData.length === 0) {
          // Initialize students in DB if completely empty
          const mapped = ALL_STUDENTS.map(s => ({
            roll_no: s.roll_no,
            register_no: s.reg,
            name: s.name,
            email: s.email,
            june_tw: s.june_tw,
            june_tdp: s.june_tdp,
            prev_sem_pct: s.june_pct
          }));
          const { data: inserted } = await supabase.from('students').insert(mapped).select();
          activeStudents = inserted || [];
        }
        setStudents(activeStudents);

        // 3. Fetch attendance for this semester
        const { data: attendanceData } = await supabase.from('attendance').select('*').eq('semester', sem);
        
        const newDailyData = {};
        if (attendanceData) {
          attendanceData.forEach(row => {
            if (!newDailyData[row.date]) newDailyData[row.date] = {};
            if (!newDailyData[row.date][row.session]) {
              newDailyData[row.date][row.session] = { attendance: {}, submittedAt: row.submitted_at, submittedBy: 'Teacher' };
            }
            newDailyData[row.date][row.session].attendance[row.student_id] = row.status;
          });
        }
        setDailyData(newDailyData);

        // 4. Setup Realtime Subscription for attendance changes
        const attendanceSubscription = supabase
          .channel('attendance_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'attendance' },
            (payload) => {
              const { new: newRow, eventType } = payload;
              if (eventType === 'INSERT' || eventType === 'UPDATE') {
                setDailyData(prev => {
                  const day = prev[newRow.date] || {};
                  const sessionData = day[newRow.session] || { attendance: {}, submittedAt: null, submittedBy: 'Teacher' };
                  
                  return {
                    ...prev,
                    [newRow.date]: {
                      ...day,
                      [newRow.session]: {
                        ...sessionData,
                        attendance: {
                          ...sessionData.attendance,
                          [newRow.student_id]: newRow.status,
                        },
                        submittedAt: newRow.hasOwnProperty('submitted_at') ? newRow.submitted_at : sessionData.submittedAt,
                      }
                    }
                  };
                });
              }
            }
          )
          .subscribe();

        // Cleanup subscription when component unmounts
        return () => {
          supabase.removeChannel(attendanceSubscription);
        };
      } catch (err) {
        console.error("Failed to load backend data:", err);
        toast.error("Failed to load attendance data.");
      } finally {
        setLoading(false);
      }
    }

    const cleanup = loadBackendData();
    
    return () => {
      cleanup.then(fn => { if (typeof fn === 'function') fn(); });
    };
  }, []);

  // Update a student's email (admin feature)
  const updateStudentEmail = async (studentId, newEmail) => {
    if (!isDemoMode) {
      await supabase.from('students').update({ email: newEmail }).eq('id', studentId);
    }
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, email: newEmail } : s));
  };

  // Add a new student (admin feature)
  const addStudent = async (studentData) => {
    if (!isDemoMode) {
      const { data, error } = await supabase.from('students').insert([studentData]).select();
      if (error) throw error;
      setStudents(prev => [...prev, data[0]].sort((a, b) => a.roll_no - b.roll_no));
      return data[0];
    } else {
      const newStudent = { id: 'temp-' + Date.now(), ...studentData, june_tw: 0, june_tdp: 0, prev_sem_pct: 0 };
      setStudents(prev => [...prev, newStudent].sort((a, b) => a.roll_no - b.roll_no));
      return newStudent;
    }
  };

  // Helper to ensure both sessions always exist for a given day object
  const getFullDayData = (dayObj) => {
    return {
      Morning: dayObj?.Morning || { attendance: makeDefault(), submittedAt: null, submittedBy: 'Class Teacher' },
      Afternoon: dayObj?.Afternoon || { attendance: makeDefault(), submittedAt: null, submittedBy: 'Class Teacher' },
    };
  };

  // Retrieve sessions for a given date
  const getSessionsForDate = (dateStr) => {
    return getFullDayData(dailyData[dateStr]);
  };

  const updateAttendance = (dateStr, session, studentId, status) => {
    setDailyData(prev => {
      const day = getFullDayData(prev[dateStr]);
      return {
        ...prev,
        [dateStr]: {
          ...day,
          [session]: {
            ...day[session],
            attendance: { ...day[session].attendance, [studentId]: status },
          },
        },
      };
    });
  };

  const submitSession = async (dateStr, session, submittedBy = 'Class Teacher') => {
    const submittedTime = new Date().toISOString();
    
    // Optimistic UI update
    setDailyData(prev => {
      const day = getFullDayData(prev[dateStr]);
      return {
        ...prev,
        [dateStr]: {
          ...day,
          [session]: {
            ...day[session],
            submittedAt: submittedTime,
            submittedBy,
          },
        },
      };
    });

    if (!isDemoMode) {
      try {
        const currentData = dailyData[dateStr]?.[session]?.attendance || makeDefault();
        const rowsToUpsert = students.map(s => ({
          student_id: s.id,
          semester: currentSemester,
          date: dateStr,
          session: session,
          status: currentData[s.id] || 'Present',
          submitted_at: submittedTime
        }));
        
        await supabase.from('attendance').upsert(rowsToUpsert, { onConflict: 'student_id, date, session' });
        toast.success(`${session} attendance saved!`);
      } catch (err) {
        console.error("Error saving attendance", err);
        toast.error("Failed to save to database");
      }
    }
  };

  const unlockSession = async (dateStr, session) => {
    // Optimistic UI update
    setDailyData(prev => {
      const day = getFullDayData(prev[dateStr]);
      return {
        ...prev,
        [dateStr]: {
          ...day,
          [session]: { ...day[session], submittedAt: null },
        }
      };
    });

    if (!isDemoMode) {
      try {
        await supabase.from('attendance')
          .update({ submitted_at: null })
          .match({ date: dateStr, session: session, semester: currentSemester });
      } catch (err) {
        console.error("Error unlocking session", err);
      }
    }
  };

  // Start a new semester — archives stats and increments semester
  const startNewSemester = async () => {
    const updatedStudents = students.map(student => {
      const stats = getStudentStats(student.id);
      return {
        ...student,
        prev_sem_pct: stats.overallPct,
        june_tdp: 0,
        june_tw: 0,
        june_pct: 0
      };
    });

    // Update UI immediately
    setStudents(updatedStudents);
    setDailyData({});
    setCurrentSemester(prev => prev + 1);

    if (!isDemoMode) {
      try {
        // Bulk update students using map and Promises
        await Promise.all(updatedStudents.map(s => 
          supabase.from('students').update({
            prev_sem_pct: s.prev_sem_pct,
            june_tdp: 0,
            june_tw: 0
          }).eq('id', s.id)
        ));
        
        // Update global settings
        await supabase.from('settings').update({ current_semester: currentSemester + 1 }).eq('id', 1);
        toast.success(`Started Semester ${currentSemester + 1}`);
      } catch (err) {
        console.error("Failed to start new semester", err);
        toast.error("Database error while starting new semester");
      }
    }
  };

  // Get total working days (current sem + legacy june TW)
  const getTotalWorkingDays = () => {
    let total = 0;
    Object.values(dailyData).forEach(day => {
      const morningSub = day.Morning?.submittedAt;
      const afternoonSub = day.Afternoon?.submittedAt;
      if (morningSub || afternoonSub) {
        total += 1;
      }
    });
    const legacyTw = students.length > 0 ? Number(students[0].june_tw || 0) : 0;
    return total + legacyTw;
  };

  // Calculate stats for a single student based on working days
  const getStudentStats = (studentId) => {
    let presentCount = 0;
    let absentCount = 0;
    let onDutyCount = 0;
    let totalWorkingDays = 0;

    Object.values(dailyData).forEach(day => {
      let isWorkingDay = false;
      const morningSub = day.Morning?.submittedAt;
      const afternoonSub = day.Afternoon?.submittedAt;
      
      if (morningSub || afternoonSub) {
        isWorkingDay = true;
        totalWorkingDays += 1;
      }

      if (isWorkingDay) {
        let p = 0, a = 0, o = 0;
        if (morningSub) {
          const st = day.Morning.attendance[studentId];
          if (st === 'Present') p += 0.5;
          else if (st === 'Absent') a += 0.5;
          else if (st === 'On Duty') o += 0.5;
        }
        if (afternoonSub) {
          const st = day.Afternoon.attendance[studentId];
          if (st === 'Present') p += 0.5;
          else if (st === 'Absent') a += 0.5;
          else if (st === 'On Duty') o += 0.5;
        }
        presentCount += p;
        absentCount += a;
        onDutyCount += o;
      }
    });

    const student = students.find(s => s.id === studentId);
    
    // Add archived stats from previous terms (June fixed stats)
    const juneTDP = student?.june_tdp || 0;
    const juneTW = student?.june_tw || 0;
    
    const combinedWorkingDays = totalWorkingDays + juneTW;
    const combinedPresentCount = presentCount + juneTDP;

    const overallPct = combinedWorkingDays === 0 ? 0 : 
      Number(((combinedPresentCount / combinedWorkingDays) * 100).toFixed(2));

    return {
      presentCount: combinedPresentCount,
      absentCount,
      onDutyCount,
      totalWorkingDays: combinedWorkingDays,
      overallPct
    };
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sketch)' }}>Loading Classroom Data...</div>;
  }

  return (
    <AttendanceContext.Provider value={{
      dailyData,
      students,
      currentSemester,
      getSessionsForDate,
      updateAttendance,
      submitSession,
      unlockSession,
      getStudentStats,
      getTotalWorkingDays,
      startNewSemester,
      updateStudentEmail,
      addStudent
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export const useAttendance = () => useContext(AttendanceContext);
