import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { isDemoMode, useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export const ALL_STUDENTS = [
  { id: 'DUMMY001', roll_no: 1,  reg: 'DUMMY001', name: 'Student User', email: 'student@college.edu', june_tw: 21, june_tdp: 18,   june_pct: 85.71 },
  { id: 'DUMMY002', roll_no: 2,  reg: 'DUMMY002', name: 'Alice Johnson', email: 'alice@example.com', june_tw: 21, june_tdp: 19,   june_pct: 90.48 },
  { id: 'DUMMY003', roll_no: 3,  reg: 'DUMMY003', name: 'Bob Smith', email: 'bob@example.com', june_tw: 21, june_tdp: 15,   june_pct: 71.43 },
  { id: 'DUMMY004', roll_no: 4,  reg: 'DUMMY004', name: 'Charlie Brown', email: 'charlie@example.com', june_tw: 21, june_tdp: 21,   june_pct: 100.00 },
  { id: 'DUMMY005', roll_no: 5,  reg: 'DUMMY005', name: 'Diana Prince', email: 'diana@example.com', june_tw: 21, june_tdp: 17.5, june_pct: 83.33 },
  { id: 'DUMMY006', roll_no: 6,  reg: 'DUMMY006', name: 'Ethan Hunt', email: 'ethan@example.com', june_tw: 21, june_tdp: 16,   june_pct: 76.19 },
  { id: 'DUMMY007', roll_no: 7,  reg: 'DUMMY007', name: 'Fiona Gallagher', email: 'fiona@example.com', june_tw: 21, june_tdp: 14.5, june_pct: 69.05 },
  { id: 'DUMMY008', roll_no: 8,  reg: 'DUMMY008', name: 'George Costanza', email: 'george@example.com', june_tw: 21, june_tdp: 10,   june_pct: 47.62 },
  { id: 'DUMMY009', roll_no: 9,  reg: 'DUMMY009', name: 'Hannah Abbott', email: 'hannah@example.com', june_tw: 21, june_tdp: 20,   june_pct: 95.24 },
  { id: 'DUMMY010', roll_no: 10, reg: 'DUMMY010', name: 'Ian Wright', email: 'ian@example.com', june_tw: 21, june_tdp: 18,   june_pct: 85.71 }
];

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState(() => {
    try {
      const saved = window.localStorage.getItem('demo_dailyData');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });
  
  const [students, setStudents] = useState(() => {
    try {
      const saved = window.localStorage.getItem('demo_students');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ALL_STUDENTS;
  });
  
  const [currentSemester, setCurrentSemester] = useState(() => {
    try {
      const saved = window.localStorage.getItem('demo_semester');
      if (saved) return parseInt(saved);
    } catch (e) {}
    return 5;
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.localStorage.setItem('demo_dailyData', JSON.stringify(dailyData));
  }, [dailyData]);

  useEffect(() => {
    window.localStorage.setItem('demo_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    window.localStorage.setItem('demo_semester', currentSemester.toString());
  }, [currentSemester]);

  // Generates default "Present" state for all students based on currently loaded students
  const makeDefault = () => {
    const init = {};
    students.forEach(s => { init[s.id] = 'Present'; });
    return init;
  };

  useEffect(() => {
    if (!user) {
      // Don't clear data so it persists in demo, just ignore.
      return;
    }
  }, [user]);

  // Add a new student (admin feature)
  const addStudent = async (studentData) => {
    const exists = students.find(s => 
      s.reg.toLowerCase() === studentData.reg.toLowerCase() || 
      (s.register_no && s.register_no.toLowerCase() === studentData.reg.toLowerCase())
    );
    if (exists) {
      throw new Error("Student with this Register Number already exists!");
    }

    const newStudent = { id: 'temp-' + Date.now(), ...studentData, june_tw: 0, june_tdp: 0, prev_sem_pct: 0 };
    setStudents(prev => [...prev, newStudent].sort((a, b) => a.roll_no - b.roll_no));
    return newStudent;
  };

  // Remove a student
  const removeStudent = async (studentId) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
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

  const clearAttendance = (dateStr, session) => {
    setDailyData(prev => {
      const day = getFullDayData(prev[dateStr]);
      return {
        ...prev,
        [dateStr]: {
          ...day,
          [session]: {
            ...day[session],
            attendance: makeDefault(),
          },
        },
      };
    });
  };

  const submitSession = async (dateStr, session, submittedBy = 'Class Teacher', overrideAttendanceMap = null) => {
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
            attendance: overrideAttendanceMap || day[session].attendance,
            submittedAt: submittedTime,
            submittedBy,
          },
        },
      };
    });
    
    toast.success(`${session} attendance saved!`);
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
    toast.success(`Started Semester ${currentSemester + 1}`);
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
      clearAttendance,
      submitSession,
      unlockSession,
      getStudentStats,
      getTotalWorkingDays,
      startNewSemester,
      addStudent,
      removeStudent
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export const useAttendance = () => useContext(AttendanceContext);
