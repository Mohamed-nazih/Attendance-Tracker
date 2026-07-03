-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- AUTHORIZATION HELPER FUNCTIONS
-- ==========================================
-- These SECURITY DEFINER functions prevent infinite recursion in RLS policies

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'teacher' AND approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_teacher_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND (role = 'admin' OR (role = 'teacher' AND approved = true))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;



-- Table: public.users
-- Stores user roles extending Supabase auth
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'admin', 'student')),
  approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Drop old policies to prevent conflicts
DO $$ 
BEGIN
  -- users
  DROP POLICY IF EXISTS "Users can view own data" ON public.users;
  DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
  DROP POLICY IF EXISTS "Admins can approve teachers" ON public.users;
  -- settings
  DROP POLICY IF EXISTS "Anyone authenticated can view settings" ON public.settings;
  DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
  DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
  -- students
  DROP POLICY IF EXISTS "Anyone authenticated can view students" ON public.students;
  DROP POLICY IF EXISTS "Admins can insert/update students" ON public.students;
  -- attendance
  DROP POLICY IF EXISTS "Anyone authenticated can view attendance" ON public.attendance;
  DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance;
  DROP POLICY IF EXISTS "Teachers and Admins can insert/update attendance" ON public.attendance;
  -- on_duty
  DROP POLICY IF EXISTS "Anyone authenticated can view on_duty" ON public.on_duty;
  DROP POLICY IF EXISTS "Admins can update on_duty" ON public.on_duty;
  -- notifications
  DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "System/Admins can insert notifications" ON public.notifications;
  -- audit_logs
  DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
EXCEPTION WHEN OTHERS THEN
END $$;

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT TRUE;


-- Policy: Users can view their own data, Admins can view all
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (is_admin());
CREATE POLICY "Admins can approve teachers" ON public.users FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete teachers" ON public.users FOR DELETE USING (is_admin());


-- Table: public.settings
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_semester INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CHECK (id = 1) -- Ensure only one row exists
);

-- Enable RLS for settings

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Anyone authenticated can view settings" ON public.settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());


-- Table: public.students
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Nullable if user account isn't created yet
  roll_no INTEGER NOT NULL UNIQUE,
  register_no TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  photo_url TEXT,
  email TEXT NOT NULL UNIQUE,
  june_tw NUMERIC DEFAULT 0,
  june_tdp NUMERIC DEFAULT 0,
  prev_sem_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for students

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view students" ON public.students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert/update students" ON public.students FOR ALL USING (is_admin()) WITH CHECK (is_admin());


-- Table: public.attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL DEFAULT 5,
  date DATE NOT NULL,
  session TEXT NOT NULL CHECK (session IN ('Morning', 'Afternoon')),
  status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'On Duty')),
  marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, date, session) -- A student can only have one record per session per day
);

-- Enable RLS for attendance

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view attendance" ON public.attendance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Students can view own attendance" ON public.attendance FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "Teachers and Admins can insert/update attendance" ON public.attendance FOR ALL USING (is_teacher_or_admin()) WITH CHECK (is_teacher_or_admin());


-- Table: public.on_duty
CREATE TABLE IF NOT EXISTS public.on_duty (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES public.attendance(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for on_duty

ALTER TABLE public.on_duty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view on_duty" ON public.on_duty FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update on_duty" ON public.on_duty FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());


-- Table: public.notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for notifications

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System/Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK (is_teacher_or_admin());


-- Table: public.audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for audit_logs

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (is_admin());


-- Create profile rows from Supabase Auth signups and keep teachers pending until approved
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
BEGIN
  INSERT INTO public.users (id, name, email, role, approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    requested_role,
    CASE WHEN requested_role = 'teacher' THEN FALSE ELSE TRUE END
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    approved = CASE WHEN EXCLUDED.role = 'teacher' THEN public.users.approved ELSE TRUE END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure RPC Function for Username/Register Number Login Translation
CREATE OR REPLACE FUNCTION public.get_login_email(identifier TEXT)
RETURNS TEXT AS $$
DECLARE
  found_email TEXT;
BEGIN
  -- Try matching a user by name (case insensitive)
  SELECT email INTO found_email FROM public.users WHERE name ILIKE identifier LIMIT 1;

  RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Secure RPC Function for Admins to Reset User Passwords
CREATE OR REPLACE FUNCTION public.admin_reset_user_password(identifier TEXT, new_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- 1. Security Check: ensure the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reset passwords';
  END IF;

  -- 2. Find the target user by email or username
  SELECT id INTO target_user_id FROM public.users 
  WHERE email ILIKE identifier OR name ILIKE identifier LIMIT 1;
  
  -- If not found in users, check if identifier is a student register number, get their email, then find user
  IF target_user_id IS NULL THEN
    SELECT u.id INTO target_user_id 
    FROM public.users u
    JOIN public.students s ON u.email = s.email
    WHERE s.register_no ILIKE identifier LIMIT 1;
  END IF;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- 3. Update the password using pgcrypto
  UPDATE auth.users 
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;