import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_CLASS_TEACHER, usernameToEmail } from '../constants/auth';

const AuthContext = createContext(null);

// Flag to run in offline demo mode if environment variables are missing
export const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || 
                          import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

// Memory store for demo mode accounts
const DEMO_ACCOUNTS = {
  [DEFAULT_CLASS_TEACHER.email]: {
    id: 'demo-class-teacher',
    name: DEFAULT_CLASS_TEACHER.name,
    username: DEFAULT_CLASS_TEACHER.username,
    email: DEFAULT_CLASS_TEACHER.email,
    role: 'admin',
    approved: true
  },
};

const DEMO_PASSWORDS = {};

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
}

function getDemoPasswords() {
  return {
    [DEFAULT_CLASS_TEACHER.email]: DEFAULT_CLASS_TEACHER.password,
    'admin@college.edu': 'password',
    'teacher@college.edu': 'password',
    'student@college.edu': 'password',
    ...DEMO_PASSWORDS,
  };
}

function setDemoPassword(email, password) {
  DEMO_PASSWORDS[email] = password;
}

function getSavedDemoUser() {
  const storage = getStorage();
  const savedUser = storage?.getItem('attendflow_demo_user');
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function saveDemoUser(user) {
  const storage = getStorage();
  if (storage) {
    storage.setItem('attendflow_demo_user', JSON.stringify(user));
  }
}

function clearDemoUser() {
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

  // ── Load profile from DB once we have a user ──────────────────────────────
  async function loadProfile(userId) {
    if (isDemoMode) {
      // Find in demo memory
      const match = Object.values(DEMO_ACCOUNTS).find(p => p.id === userId);
      return match || null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profile load error:', error.message);
      return null;
    }

    // If student, resolve their register number
    if (data && data.role === 'student') {
      const { data: studentData } = await supabase
        .from('students')
        .select('register_no')
        .eq('user_id', userId)
        .single();
      if (studentData) {
        data.register_no = studentData.register_no;
      } else {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id === userId && authData.user.user_metadata?.register_no) {
          data.register_no = authData.user.user_metadata.register_no;
        }
      }
    }

    return data;
  }

  // ── Listen to Supabase auth state changes ─────────────────────────────────
  useEffect(() => {
    if (isDemoMode) {
      // Load saved demo session from session storage if it exists
      const savedUser = getSavedDemoUser();
      if (savedUser) {
        setUser(savedUser);
        setProfile(savedUser);
      }
      setLoading(false);
      return;
    }

    // Get the current session on mount (handles page refresh)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const p = await loadProfile(session.user.id);
        if (!p && !isDemoMode) {
          // If profile is deleted/rejected, sign them out
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
        } else {
          setUser(session.user);
          setProfile(p);
        }
      }
      setLoading(false);
    });

    // Subscribe to future changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const p = await loadProfile(session.user.id);
          if (!p && !isDemoMode) {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
          } else {
            setUser(session.user);
            setProfile(p);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth actions ───────────────────────────────────────────────────────────

  async function signUp({ email, password, fullName, registerNo, role, username }) {
    const normalizedEmail = email.includes('@') ? email : usernameToEmail(email);

    if (isDemoMode) {
      // Create a demo user profile in memory
      const demoId = `demo-${Math.random().toString(36).substr(2, 9)}`;
      const newProfile = {
        id: demoId,
        name: fullName,
        username: username || fullName,
        email: normalizedEmail,
        role,
        register_no: registerNo || null
      };
      DEMO_ACCOUNTS[normalizedEmail] = newProfile;
      setDemoPassword(normalizedEmail, password);
      return { user: { id: demoId, email: normalizedEmail } };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username || fullName,
          role: role,
          register_no: registerNo || null
        },
      },
    });
    if (error) throw error;
    return data;
  }

  async function signIn({ email, username, password }) {
    let loginEmail = '';
    const input = (username || email || '').trim();

    if (input.includes('@')) {
      // Direct email login
      loginEmail = input;
    } else {
      // Username login - search for matching account by username
      if (isDemoMode) {
        const found = Object.values(DEMO_ACCOUNTS).find(
          a => (a.username || a.name || '').toLowerCase() === input.toLowerCase()
        );
        if (found) {
          loginEmail = found.email;
        } else {
          // Fallback to old behavior
          loginEmail = usernameToEmail(input);
        }
      } else {
        // Call the secure RPC function to get the email from the username or register number
        const { data: matchedEmail, error: rpcError } = await supabase.rpc('get_login_email', {
          identifier: input
        });
        
        if (rpcError || !matchedEmail) {
          throw new Error('User not found. Check your username/register number.');
        }
        loginEmail = matchedEmail;
      }
    }

    if (isDemoMode) {
      const match = DEMO_ACCOUNTS[loginEmail];
      if (!match) {
        throw new Error('Invalid login credentials');
      }
      const demoPasswords = getDemoPasswords();
      if (demoPasswords[loginEmail] && demoPasswords[loginEmail] !== password) {
        throw new Error('Invalid login credentials');
      }
      // Let pending teachers stay signed in so they hit the pending screen
      setUser(match);
      setProfile(match);
      saveDemoUser(match);
      return { user: match };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (error) throw error;

    if (data?.user) {
      const signedInProfile = await loadProfile(data.user.id);
      
      if (!signedInProfile) {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        throw new Error('User profile not found. Your account may have been rejected or deleted.');
      }
      
      // Let pending teachers stay signed in so they hit the pending screen
      setUser(data.user);
      setProfile(signedInProfile);
    }

    return data;
  }

  async function signOut() {
    if (isDemoMode) {
      setUser(null);
      setProfile(null);
      clearDemoUser();
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function resetPassword(email) {
    if (isDemoMode) {
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  }

  async function adminResetUserPassword(identifier, newPassword) {
    if (isDemoMode) return;
    const { error } = await supabase.rpc('admin_reset_user_password', {
      identifier: identifier,
      new_password: newPassword
    });
    if (error) throw error;
  }



  async function listTeachers() {
    if (isDemoMode) {
      return Object.values(DEMO_ACCOUNTS)
        .filter(account => account.role === 'teacher')
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, approved, created_at')
      .eq('role', 'teacher')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
  async function listPendingTeachers() {
    if (isDemoMode) {
      return Object.values(DEMO_ACCOUNTS).filter(account => account.role === 'teacher' && account.approved === false);
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, approved, created_at')
      .eq('role', 'teacher')
      .eq('approved', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async function approveTeacher(userId) {
    if (isDemoMode) {
      const account = Object.values(DEMO_ACCOUNTS).find(item => item.id === userId);
      if (account) {
        account.approved = true;
        setAccountsVersion(v => v + 1);
      }
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ approved: true })
      .eq('id', userId)
      .eq('role', 'teacher');

    if (error) throw error;
  }

  async function rejectTeacher(userId) {
    if (isDemoMode) {
      const matchKey = Object.keys(DEMO_ACCOUNTS).find(k => DEMO_ACCOUNTS[k].id === userId);
      if (matchKey) {
        delete DEMO_ACCOUNTS[matchKey];
        setAccountsVersion(v => v + 1);
      }
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
      .eq('role', 'teacher')
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Action blocked by database. Did you run the SQL command to enable the Delete policy?');
    }
  }
  async function updatePassword(newPassword) {
    if (isDemoMode) {
      if (profile?.email) {
        setDemoPassword(profile.email, newPassword);
      }
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  // ── Role helpers ───────────────────────────────────────────────────────────
  const role     = profile?.role || null;   
  const isAdmin   = role === 'admin';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role,
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
