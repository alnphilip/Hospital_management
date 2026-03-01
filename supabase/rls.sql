-- Smart Hospital Workflow System — Row Level Security Policies
-- Run this in the Supabase SQL Editor AFTER schema.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Staff and Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() IN ('staff', 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- ============================================
-- DEPARTMENTS POLICIES
-- ============================================
CREATE POLICY "Anyone authenticated can view departments"
  ON public.departments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can insert departments"
  ON public.departments FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admin can update departments"
  ON public.departments FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin can delete departments"
  ON public.departments FOR DELETE
  USING (public.get_user_role() = 'admin');

-- ============================================
-- DOCTORS POLICIES
-- ============================================
CREATE POLICY "Anyone authenticated can view doctors"
  ON public.doctors FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Doctor can update own record"
  ON public.doctors FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin can manage doctors"
  ON public.doctors FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================================
-- PATIENTS POLICIES
-- ============================================
CREATE POLICY "Patient can view own record"
  ON public.patients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Staff and Admin can view all patients"
  ON public.patients FOR SELECT
  USING (public.get_user_role() IN ('staff', 'admin'));

CREATE POLICY "Doctor can view assigned patients"
  ON public.patients FOR SELECT
  USING (
    public.get_user_role() = 'doctor'
    AND id IN (
      SELECT a.patient_id FROM public.appointments a
      JOIN public.doctors d ON d.id = a.doctor_id
      WHERE d.user_id = auth.uid()
    )
  );

CREATE POLICY "Patient can update own record"
  ON public.patients FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Patient can insert own record"
  ON public.patients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage patients"
  ON public.patients FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================================
-- APPOINTMENTS POLICIES
-- ============================================
CREATE POLICY "Patient can view own appointments"
  ON public.appointments FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patient can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctor can view assigned appointments"
  ON public.appointments FOR SELECT
  USING (
    doctor_id IN (
      SELECT id FROM public.doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctor can update assigned appointments"
  ON public.appointments FOR UPDATE
  USING (
    doctor_id IN (
      SELECT id FROM public.doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all appointments"
  ON public.appointments FOR SELECT
  USING (public.get_user_role() = 'staff');

CREATE POLICY "Staff can update appointments"
  ON public.appointments FOR UPDATE
  USING (public.get_user_role() = 'staff');

CREATE POLICY "Admin can manage all appointments"
  ON public.appointments FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================================
-- PRESCRIPTIONS POLICIES
-- ============================================
CREATE POLICY "Patient can view own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctor can manage own prescriptions"
  ON public.prescriptions FOR ALL
  USING (
    doctor_id IN (
      SELECT id FROM public.doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view prescriptions"
  ON public.prescriptions FOR SELECT
  USING (public.get_user_role() = 'staff');

CREATE POLICY "Admin can manage all prescriptions"
  ON public.prescriptions FOR ALL
  USING (public.get_user_role() = 'admin');
