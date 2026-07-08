import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_CLASS_TEACHER, usernameToEmail } from '../constants/auth';

const AuthContext = createContext(null);

// Flag to run in offline demo mode
export const isDemoMode = true;

const DEFAULT_ACCOUNTS = {
  'admin@attendflow.com': {
    id: 'demo-admin', name: 'Admin User', username: 'admin', email: 'admin@attendflow.com', role: 'admin', approved: true
  },
  'teacher@attendflow.com': {
    id: 'demo-teacher', name: 'Teacher User', username: 'teacher', email: 'teacher@attendflow.com', role: 'teacher', approved: true
  },
  'student@attendflow.com': {
    id: 'demo-student', name: 'Student User', username: 'student', email: 'student@attendflow.com', role: 'student', register_no: 'DUMMY001', approved: true
  }
};

const DEFAULT_PASSWORDS = {
  'admin@attendflow.com': 'admin123',
  'teacher@attendflow.com': 'teacher123',
  'student@attendflow.com': 'student123'
};

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function getAccounts() {
  const storage = getStorage();
  const saved = storage?.getItem('attendflow_accounts');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return { ...DEFAULT_ACCOUNTS };
}

function saveAccounts(accounts) {
  const storage = getStorage();
  if (storage) {
    storage.setItem('attendflow_accounts', JSON.stringify(accounts));
  }
}

function getPasswords() {
  const storage = getStorage();
  const saved = storage?.getItem('attendflow_passwords');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return { ...DEFAULT_PASSWORDS };
}

function savePasswords(passwords) {
  const storage = getStorage();
  if (storage) {
    storage.setItem('attendflow_passwords', JSON.stringify(passwords));
  }
}

function setPassword(email, password) {
  const passwords = getPasswords();
  passwords[email] = password;
  savePasswords(passwords);
}

function getSavedSessionUser() {
  const storage = getStorage();
  const savedUser = storage?.getItem('attendflow_demo_user');
  if (!savedUser) return null;
  try { return JSON.parse(savedUser); } catch { return null; }
}

function saveSessionUser(user) {
  const storage = getStorage();
  if (storage) {
    storage.setItem('attendflow_demo_user', JSON.stringify(user));
  }
}

function clearSessionUser() {
  const storage = getStorage();
  if (storage) {
    storage.removeItem('attendflow_demo_user');
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   
  const [profile, setProfile] = useState(null);   
  const [loading, setLoading] = useState(true);
  const [accountsVersion, setAccountsVersion] = useState(0);   

  useEffect(() => {
    const savedUser = getSavedSessionUser();
    if (savedUser) {
      const accounts = getAccounts();
      const updatedUser = accounts[savedUser.email];
      if (updatedUser) {
        setUser(updatedUser);
        setProfile(updatedUser);
      } else {
        clearSessionUser();
      }
    }
    setLoading(false);
  }, []);

  async function signUp({ email, password, fullName, registerNo, role, username }) {
    const normalizedEmail = email.includes('@') ? email : usernameToEmail(email);
    const selectedUsername = (username || fullName).trim();

    const accounts = getAccounts();

    const existing = Object.values(accounts).find(
      a => (a.username || a.name || '').toLowerCase() === selectedUsername.toLowerCase()
    );
    if (existing) {
      throw new Error(`The username "${selectedUsername}" is already taken. Please choose another one.`);
    }

    const demoId = `demo-${Math.random().toString(36).substr(2, 9)}`;
    const newProfile = {
      id: demoId,
      name: fullName,
      username: username || fullName,
      email: normalizedEmail,
      role,
      register_no: registerNo || null,
      approved: role === 'student' ? true : false,
      created_at: new Date().toISOString()
    };
    
    accounts[normalizedEmail] = newProfile;
    saveAccounts(accounts);
    setPassword(normalizedEmail, password);
    setAccountsVersion(v => v + 1);
    
    return { user: { id: demoId, email: normalizedEmail } };
  }

  async function signIn({ email, username, password }) {
    let loginEmail = '';
    let input = (username || email || '').trim();

    if (input.toLowerCase().startsWith('nia')) {
      input = input.toUpperCase();
    }

    const accounts = getAccounts();

    if (input.includes('@')) {
      loginEmail = input;
    } else {
      const found = Object.values(accounts).find(
        a => (a.username || a.name || '').toLowerCase() === input.toLowerCase() || (a.register_no || '').toLowerCase() === input.toLowerCase()
      );
      if (found) {
        loginEmail = found.email;
      } else {
        loginEmail = usernameToEmail(input);
      }
    }

    const match = accounts[loginEmail];
    if (!match) {
      throw new Error('Invalid login credentials');
    }
    
    const passwords = getPasswords();
    if (passwords[loginEmail] && passwords[loginEmail] !== password) {
      throw new Error('Invalid login credentials');
    }
    
    setUser(match);
    setProfile(match);
    saveSessionUser(match);
    return { user: match };
  }

  async function signOut() {
    setUser(null);
    setProfile(null);
    clearSessionUser();
  }

  async function resetPassword(email) {
    // No-op in demo mode
  }

  async function adminResetUserPassword(identifier, newPassword) {
    const accounts = getAccounts();
    const match = Object.values(accounts).find(a => a.email === identifier || a.register_no === identifier || a.username === identifier);
    if (match) {
      setPassword(match.email, newPassword);
    } else {
      throw new Error('User not found');
    }
  }

  async function listTeachers() {
    const accounts = getAccounts();
    return Object.values(accounts)
      .filter(account => account.role === 'teacher')
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async function listPendingTeachers() {
    const accounts = getAccounts();
    return Object.values(accounts).filter(account => account.role === 'teacher' && account.approved === false);
  }

  async function approveTeacher(userId) {
    const accounts = getAccounts();
    const accountEmail = Object.keys(accounts).find(k => accounts[k].id === userId);
    if (accountEmail) {
      accounts[accountEmail].approved = true;
      saveAccounts(accounts);
      setAccountsVersion(v => v + 1);
    }
  }

  async function rejectTeacher(userId) {
    const accounts = getAccounts();
    const accountEmail = Object.keys(accounts).find(k => accounts[k].id === userId);
    if (accountEmail) {
      delete accounts[accountEmail];
      saveAccounts(accounts);
      
      const passwords = getPasswords();
      delete passwords[accountEmail];
      savePasswords(passwords);
      
      setAccountsVersion(v => v + 1);
    }
  }

  async function updatePassword(newPassword) {
    if (profile?.email) {
      setPassword(profile.email, newPassword);
    }
  }

  const currentRole = profile?.role || null;   
  const isAdmin   = currentRole === 'admin';
  const isTeacher = currentRole === 'teacher';
  const isStudent = currentRole === 'student';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role: currentRole,
      isAdmin,
      isTeacher,
      isStudent,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      adminResetUserPassword,
      updatePassword,
      listTeachers,
      listPendingTeachers,
      approveTeacher,
      rejectTeacher,
      accountsVersion,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
