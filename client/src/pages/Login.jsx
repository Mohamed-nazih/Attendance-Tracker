import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, Mail, Lock, User, Hash, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth, isDemoMode } from '../context/AuthContext';
import { DEFAULT_CLASS_TEACHER, usernameToEmail } from '../constants/auth';
import { useAttendance } from '../context/AttendanceContext';
import logo from '../assets/logo.svg';

function Input({ icon: Icon, type = 'text', placeholder, value, onChange, onToggle, showToggle, disabled, ...rest }) {
  return (
    <div style={{ position: 'relative' }}>
      {Icon && (
        <Icon size={16} style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          color: '#000000', pointerEvents: 'none', zIndex: 1,
        }} />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete="off"
        className="brutal-input"
        {...rest}
        style={{
          paddingLeft: Icon ? '42px' : '14px',
          paddingRight: showToggle ? '40px' : '14px',
        }}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
            color: '#000000',
          }}
        >
          {type === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      )}
    </div>
  );
}

function Btn({ children, loading, disabled, onClick, type = 'button', secondary }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`brutal-btn ${secondary ? 'brutal-btn-secondary' : ''}`}
      style={{ width: '100%', marginTop: '6px' }}
    >
      {loading && <Loader2 size={16} style={{ animation: 'spin 0.75s linear infinite' }} />}
      {children}
    </motion.button>
  );
}

// ── View: Login ───────────────────────────────────────────────────────────────
function LoginView({ onSwitch }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { signIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const data = await signIn({ username, password });
      
      toast.success('Welcome back!');
      
      // Navigate directly based on the user's role to prevent RootRedirect race conditions
      if (data?.user) {
        const finalRole = data.user.role || 'student';
        const redirects = { student: '/student', teacher: '/teacher', admin: '/admin' };
        navigate(from || redirects[finalRole] || '/', { replace: true });
      } else {
        navigate(from || '/', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input icon={User} placeholder="Register No (Student) / Username (Teacher)" value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
      <Input
        icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password"
        value={password} onChange={e => setPassword(e.target.value)}
        showToggle onToggle={() => setShowPw(p => !p)} disabled={loading}
      />

      <Btn type="submit" loading={loading}>Sign In →</Btn>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', fontWeight: '600' }}>
        New student or teacher?{' '}
        <button type="button" onClick={() => onSwitch('register')} style={{ background: 'none', border: 'none', color: '#000000', fontWeight: '800', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', padding: 0 }}>
          Create an account
        </button>
      </p>
    </form>
  );
}

// ── View: Register ────────────────────────────────────────────────────────────
function RegisterView({ onSwitch }) {
  const { signUp } = useAuth();
  const { students: allStudents } = useAttendance();

  const [role,            setRole]            = useState('student');
  const [rollNo,          setRollNo]          = useState('');
  const [teacherUsername, setTeacherUsername]  = useState('');
  const [teacherEmail,    setTeacherEmail]    = useState('');
  const [password,        setPassword]        = useState('');
  const [confirm,         setConfirm]         = useState('');
  const [showPw,          setShowPw]          = useState(false);
  const [loading,         setLoading]         = useState(false);
  const parsedRoll = parseInt(rollNo);
  const studentMatch = role === 'student' && !isNaN(parsedRoll)
    ? allStudents.find(s => s.roll_no === parsedRoll)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalEmail = '';
    let finalName = '';
    let finalReg = null;
    let finalUsername = '';

    if (role === 'student') {
      if (!rollNo) { toast.error('Please enter your roll number'); return; }
      if (!studentMatch) { toast.error('Student not found. Contact class teacher to add'); return; }
      
      finalName = studentMatch.name;
      finalReg = studentMatch.reg || studentMatch.register_no;
      finalEmail = `roll${parsedRoll}@student.local`;
      finalUsername = studentMatch.name; // Username is their name as requested
    } else {
      if (!teacherUsername.trim()) { toast.error('Please enter a username'); return; }
      if (!teacherEmail.trim()) { toast.error('Please enter your email'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacherEmail.trim())) { toast.error('Please enter a valid email address'); return; }
      finalName = teacherUsername.trim();
      finalEmail = teacherEmail.trim();
      finalUsername = teacherUsername.trim();
    }

    if (!password || !confirm) { toast.error('Please fill in password fields'); return; }
    if (password !== confirm)  { toast.error('Passwords do not match'); return; }
    
    // Strict Password Policy
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!strongPasswordRegex.test(password)) {
      toast.error('Password does not meet requirements');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email: finalEmail,
        password,
        fullName: finalName,
        registerNo: finalReg,
        role,
        username: finalUsername,
      });
      toast.success('Account created! Sign in now using your credentials.');
      onSwitch('login');
    } catch (err) {
      console.error("Registration error:", err);
      let errMsg = err.message || err.error_description || err.msg;
      if (!errMsg && typeof err === 'object') {
        try { errMsg = JSON.stringify(err); } catch(e) {}
      }
      toast.error(errMsg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const REGISTER_ROLES = [
    { value: 'student',  label: 'Student' },
    { value: 'teacher',  label: 'Teacher' },
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Btn secondary onClick={() => onSwitch('login')}>
        <ArrowLeft size={15} /> Back to Login
      </Btn>
      {/* Role selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {REGISTER_ROLES.map(r => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            style={{
              padding: '10px 4px', borderRadius: '6px', border: '2px solid #000000',
              background: role === r.value ? 'var(--primary)' : '#FFFFFF',
              color: '#000000',
              boxShadow: role === r.value ? '2px 2px 0px 0px #000000' : 'none',
              transform: role === r.value ? 'translate(-1px, -1px)' : 'none',
              fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.1s',
              fontFamily: 'var(--font-sketch)'
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {role === 'student' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input
            icon={Hash}
            type="number"
            placeholder="Enter Roll Number"
            value={rollNo}
            onChange={e => setRollNo(e.target.value)}
            disabled={loading}
            min="1"
          />
          {studentMatch && (
            <div style={{
              background: '#E2FBE9', border: '2px solid #000000', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px', color: '#000000', fontWeight: '800',
              boxShadow: '2px 2px 0px 0px #000000', fontFamily: 'var(--font-sketch)',
              lineHeight: 1.4
            }}>
              <p style={{ margin: '0 0 3px' }}>👤 Name: {studentMatch.name}</p>
              <p style={{ margin: 0 }}>🆔 Reg No: {studentMatch.reg}</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input icon={User} placeholder="Username" value={teacherUsername} onChange={e => setTeacherUsername(e.target.value)} disabled={loading} />
          <Input icon={Mail} type="email" placeholder="Email address" value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} disabled={loading} />
        </div>
      )}

      <Input
        icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password (min 6 chars)"
        value={password} onChange={e => setPassword(e.target.value)}
        showToggle onToggle={() => setShowPw(p => !p)} disabled={loading}
      />
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '-6px 4px 6px', lineHeight: 1.4, fontWeight: '600' }}>
        Requires: 1 uppercase, 1 lowercase, 1 number, 1 symbol.
      </p>
      <Input icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} disabled={loading} />

      <Btn type="submit" loading={loading}>Register Account 🚀</Btn>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', fontWeight: '600' }}>
        Already have an account?{' '}
        <button type="button" onClick={() => onSwitch('login')} style={{ background: 'none', border: 'none', color: '#000000', fontWeight: '800', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', padding: 0 }}>
          Sign In
        </button>
      </p>
    </form>
  );
}

// ── View: Forgot Password ─────────────────────────────────────────────────────
function ForgotView({ onSwitch }) {
  const { resetPassword } = useAuth();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email address'); return; }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)',
          border: '3px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '3px 3px 0px 0px #000000',
        }}>
          <Mail size={22} color="#000000" />
        </div>
        <p style={{ fontWeight: '800', fontSize: '18px', margin: '0 0 8px', fontFamily: 'var(--font-sketch)' }}>Check your inbox</p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5, fontWeight: '500' }}>
          We sent a password reset link to<br /><strong>{email}</strong>
        </p>
        <Btn onClick={() => onSwitch('login')}>Back to Sign In</Btn>
      </div>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px', lineHeight: 1.5, fontWeight: '500' }}>
        Enter your email and we'll send a link to reset your password.
      </p>
      <Input icon={Mail} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
      <Btn type="submit" loading={loading}>Send Reset Link</Btn>
      <Btn secondary onClick={() => onSwitch('login')}>
        <ArrowLeft size={15} /> Back to Sign In
      </Btn>
    </form>
    </>
  );
}

// ── Main Login page ───────────────────────────────────────────────────────────
const TITLES = {
  login:    { heading: 'Welcome back',          sub: 'Sign in to AttendFlow' },
  register: { heading: 'Create account',        sub: 'Students and teachers can register here' },
  forgot:   { heading: 'Reset password',        sub: 'We\'ll email you a link' },
};

export default function Login() {
  const [view, setView] = useState('login');
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { heading, sub } = TITLES[view];

  // If the user is already fully loaded and logged in, redirect them away from the login screen
  useEffect(() => {
    if (user && profile) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, profile, navigate, location]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: 72, height: 72,
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img src={logo} alt="AttendFlow Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', margin: '0 0 6px', color: '#000000' }}>
                {heading}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, fontWeight: '600' }}>{sub}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card */}
        <div className="brutal-card" style={{ padding: '32px 28px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'login'    && <LoginView    onSwitch={setView} />}
              {view === 'register' && <RegisterView onSwitch={setView} />}
              {view === 'forgot'   && <ForgotView   onSwitch={setView} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Demo Credentials */}
        {isDemoMode && (
          <div className="brutal-card" style={{ marginTop: '20px', padding: '16px', background: '#FFF3C4', border: '2px solid #000000', fontSize: '13px', boxShadow: '4px 4px 0px 0px #000000' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800' }}>Demo Login Credentials</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace', fontSize: '14px' }}>
              <div><strong>Admin:</strong>   admin / admin123</div>
              <div><strong>Teacher:</strong> teacher / teacher123</div>
              <div><strong>Student:</strong> student / student123</div>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '24px', fontWeight: '600', fontFamily: 'var(--font-sketch)' }}>
          AttendFlow · Student Management System
        </p>
      </motion.div>
    </div>
  );
}
