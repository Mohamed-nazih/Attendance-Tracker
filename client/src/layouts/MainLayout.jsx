import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCheck,
  BarChart3,
  LogOut,
  GraduationCap,
  Menu,
  Bell,
  Settings as SettingsIcon,
  Backpack,
} from 'lucide-react';

const teacherNav = [
  { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/teacher/attendance', label: 'Mark Attendance', icon: ClipboardList },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/teachers', label: 'Teachers', icon: UserCheck },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

const studentNav = [
  { to: '/student', label: 'My Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/toolkit', label: 'Toolkit', icon: Backpack },
];

const roleMeta = {
  teacher: { label: 'Teacher', color: '#2563EB', nav: teacherNav },
  admin: { label: 'Class Teacher', color: '#EF4444', nav: adminNav },
  student: { label: 'Student', color: '#22C55E', nav: studentNav },
};

export default function MainLayout({ role = 'teacher' }) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const meta = roleMeta[role] || roleMeta.teacher;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const displayName = profile?.name || (role === 'admin' ? 'Admin' : role === 'teacher' ? 'Teacher' : 'Student');
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#FAF6EE]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b-3 border-black">
        <div style={{
          width: 38, height: 38, borderRadius: '6px',
          background: 'var(--primary)', border: '2px solid #000000',
          boxShadow: '2px 2px 0px 0px #000000',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <GraduationCap className="w-5 h-5 text-black" />
        </div>
        <div>
          <p className="font-extrabold text-lg uppercase tracking-tight" style={{ fontFamily: 'var(--font-sketch)' }}>24BCAA</p>
          <span className="text-xs px-2 py-0.5 rounded-full border border-black font-bold uppercase" style={{ background: '#FFFFFF', fontSize: '10px' }}>
            {meta.label}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {meta.nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-100 ${
                isActive
                  ? 'bg-[var(--primary)] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] translate-x-[-2px] translate-y-[-2px]'
                  : 'hover:bg-black/5 text-zinc-700'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span style={{ fontFamily: 'var(--font-sketch)', fontSize: '15px' }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t-3 border-black bg-white">
        <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000] bg-[#FAF6EE]">
          <div className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: role === 'admin' ? '#FEE2E2' : role === 'teacher' ? '#DBEAFE' : '#DCFCE7',
                     color: '#000000' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold truncate" style={{ fontFamily: 'var(--font-sketch)' }}>{displayName}</p>
            <p className="text-xs truncate font-medium text-zinc-600">
              {profile?.register_no ? `${profile.register_no}` : 'BCA Honours'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border-2 border-black hover:bg-red-100 transition-colors"
          style={{ fontFamily: 'var(--font-sketch)' }}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF6EE]">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 flex-shrink-0 border-r-3 border-black"
        style={{ background: 'var(--bg-card)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 z-50 border-r-3 border-black flex flex-col md:hidden"
              style={{ background: 'var(--bg-card)' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header
          className="flex items-center justify-between px-4 py-3 border-b-3 border-black md:hidden bg-white"
        >
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg border-2 border-black bg-white shadow-[1px_1px_0px_0px_#000000]">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <span className="font-extrabold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-sketch)' }}>24BCAA</span>
          </div>
          <button className="p-1.5 rounded-lg border-2 border-black bg-white shadow-[1px_1px_0px_0px_#000000]">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
