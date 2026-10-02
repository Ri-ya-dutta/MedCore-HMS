--
-- PostgreSQL database dump
--

\restrict YX54KN0b5jY3cUHjEZoPVnDR6MsV73QPPeeR4lhKbVOhaH0EaYhPk040tpysfTg

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment (
    "appointmentAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "doctorId" integer NOT NULL,
    id integer NOT NULL,
    "patientId" integer NOT NULL,
    reason text,
    status text DEFAULT 'SCHEDULED'::text NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT appointment_status_check_2c8db390 CHECK ((status = ANY (ARRAY['SCHEDULED'::text, 'COMPLETED'::text, 'CANCELLED'::text, 'RESCHEDULED'::text])))
);


--
-- Name: appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointment_id_seq OWNED BY public.appointment.id;


--
-- Name: department; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.department (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    description text,
    "hospitalId" integer NOT NULL,
    id integer NOT NULL,
    name text NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: department_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.department_id_seq OWNED BY public.department.id;


--
-- Name: doctor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "departmentId" integer NOT NULL,
    "firstName" text NOT NULL,
    id integer NOT NULL,
    "lastName" text NOT NULL,
    "licenseNumber" text,
    phone text,
    specialization text NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: doctor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_id_seq OWNED BY public.doctor.id;


--
-- Name: encounter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encounter (
    "appointmentId" integer NOT NULL,
    "clinicalNotes" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    diagnosis text,
    "doctorId" integer NOT NULL,
    id integer NOT NULL,
    "patientId" integer NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: encounter_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.encounter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: encounter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.encounter_id_seq OWNED BY public.encounter.id;


--
-- Name: hospital; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hospital (
    address text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    email text,
    id integer NOT NULL,
    name text NOT NULL,
    phone text,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hospital_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hospital_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hospital_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hospital_id_seq OWNED BY public.hospital.id;


--
-- Name: invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "encounterId" integer NOT NULL,
    id integer NOT NULL,
    "paymentStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "totalAmount" double precision NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "invoice_paymentStatus_check_3188bacb" CHECK (("paymentStatus" = ANY (ARRAY['PENDING'::text, 'PARTIAL'::text, 'PAID'::text, 'CANCELLED'::text])))
);


--
-- Name: invoiceItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."invoiceItem" (
    amount double precision NOT NULL,
    description text NOT NULL,
    id integer NOT NULL,
    "invoiceId" integer NOT NULL
);


--
-- Name: invoiceItem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."invoiceItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoiceItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."invoiceItem_id_seq" OWNED BY public."invoiceItem".id;


--
-- Name: invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invoice_id_seq OWNED BY public.invoice.id;


--
-- Name: labOrder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."labOrder" (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "encounterId" integer NOT NULL,
    id integer NOT NULL,
    notes text,
    status text DEFAULT 'ORDERED'::text NOT NULL,
    "testName" text NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "labOrder_status_check_9aee8e9a" CHECK ((status = ANY (ARRAY['ORDERED'::text, 'IN_PROGRESS'::text, 'COMPLETED'::text, 'CANCELLED'::text])))
);


--
-- Name: labOrder_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."labOrder_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: labOrder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."labOrder_id_seq" OWNED BY public."labOrder".id;


--
-- Name: labResult; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."labResult" (
    "completedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id integer NOT NULL,
    "labOrderId" integer NOT NULL,
    "referenceRange" text,
    remarks text,
    "resultValue" text NOT NULL
);


--
-- Name: labResult_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."labResult_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: labResult_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."labResult_id_seq" OWNED BY public."labResult".id;


--
-- Name: patient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient (
    address text,
    "bloodGroup" text,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "dateOfBirth" timestamp with time zone NOT NULL,
    email text,
    "emergencyContact" text,
    "firstName" text NOT NULL,
    gender text NOT NULL,
    id integer NOT NULL,
    "lastName" text NOT NULL,
    phone text NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "userId" integer,
    CONSTRAINT patient_gender_check_30490488 CHECK ((gender = ANY (ARRAY['MALE'::text, 'FEMALE'::text, 'OTHER'::text])))
);


--
-- Name: patient_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patient_id_seq OWNED BY public.patient.id;


--
-- Name: prescription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prescription (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "encounterId" integer NOT NULL,
    id integer NOT NULL,
    instructions text
);


--
-- Name: prescriptionItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."prescriptionItem" (
    dosage text NOT NULL,
    duration text,
    frequency text NOT NULL,
    id integer NOT NULL,
    instructions text,
    "medicineName" text NOT NULL,
    "prescriptionId" integer NOT NULL
);


--
-- Name: prescriptionItem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."prescriptionItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prescriptionItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."prescriptionItem_id_seq" OWNED BY public."prescriptionItem".id;


--
-- Name: prescription_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prescription_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prescription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prescription_id_seq OWNED BY public.prescription.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    email text NOT NULL,
    id integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "passwordHash" text NOT NULL,
    role text NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_role_check_c73d8ddd CHECK ((role = ANY (ARRAY['ADMIN'::text, 'DOCTOR'::text, 'RECEPTIONIST'::text, 'PATIENT'::text])))
);


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: vitals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vitals (
    "bloodPressure" text,
    "encounterId" integer NOT NULL,
    "heartRate" integer,
    id integer NOT NULL,
    "recordedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "respiratoryRate" integer,
    spo2 double precision,
    temperature double precision
);


--
-- Name: vitals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vitals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vitals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vitals_id_seq OWNED BY public.vitals.id;


--
-- Name: appointment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment ALTER COLUMN id SET DEFAULT nextval('public.appointment_id_seq'::regclass);


--
-- Name: department id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department ALTER COLUMN id SET DEFAULT nextval('public.department_id_seq'::regclass);


--
-- Name: doctor id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor ALTER COLUMN id SET DEFAULT nextval('public.doctor_id_seq'::regclass);


--
-- Name: encounter id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounter ALTER COLUMN id SET DEFAULT nextval('public.encounter_id_seq'::regclass);


--
-- Name: hospital id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hospital ALTER COLUMN id SET DEFAULT nextval('public.hospital_id_seq'::regclass);


--
-- Name: invoice id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice ALTER COLUMN id SET DEFAULT nextval('public.invoice_id_seq'::regclass);


--
-- Name: invoiceItem id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."invoiceItem" ALTER COLUMN id SET DEFAULT nextval('public."invoiceItem_id_seq"'::regclass);


--
-- Name: labOrder id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."labOrder" ALTER COLUMN id SET DEFAULT nextval('public."labOrder_id_seq"'::regclass);


--
-- Name: labResult id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."labResult" ALTER COLUMN id SET DEFAULT nextval('public."labResult_id_seq"'::regclass);


--
-- Name: patient id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient ALTER COLUMN id SET DEFAULT nextval('public.patient_id_seq'::regclass);


--
-- Name: prescription id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription ALTER COLUMN id SET DEFAULT nextval('public.prescription_id_seq'::regclass);


--
-- Name: prescriptionItem id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."prescriptionItem" ALTER COLUMN id SET DEFAULT nextval('public."prescriptionItem_id_seq"'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: vitals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vitals ALTER COLUMN id SET DEFAULT nextval('public.vitals_id_seq'::regclass);


--
-- Name: appointment appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_pkey PRIMARY KEY (id);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: doctor doctor_licenseNumber_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "doctor_licenseNumber_key" UNIQUE ("licenseNumber");


--
-- Name: doctor doctor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT doctor_pkey PRIMARY KEY (id);


--
-- Name: doctor doctor_userId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "doctor_userId_key" UNIQUE ("userId");


--
-- Name: encounter encounter_appointmentId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounter
    ADD CONSTRAINT "encounter_appointmentId_key" UNIQUE ("appointmentId");


--
-- Name: encounter encounter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounter
    ADD CONSTRAINT encounter_pkey PRIMARY KEY (id);


--
-- Name: hospital hospital_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hospital
    ADD CONSTRAINT hospital_pkey PRIMARY KEY (id);


--
-- Name: invoiceItem invoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."invoiceItem"
    ADD CONSTRAINT "invoiceItem_pkey" PRIMARY KEY (id);


--
-- Name: invoice invoice_encounterId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT "invoice_encounterId_key" UNIQUE ("encounterId");


--
-- Name: invoice invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT invoice_pkey PRIMARY KEY (id);


--
-- Name: labOrder labOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."labOrder"
    ADD CONSTRAINT "labOrder_pkey" PRIMARY KEY (id);


--
-- Name: labResult labResult_labOrderId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."labResult"
    ADD CONSTRAINT "labResult_labOrderId_key" UNIQUE ("labOrderId");


--
-- Name: labResult labResult_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."labResult"
    ADD CONSTRAINT "labResult_pkey" PRIMARY KEY (id);


--
-- Name: patient patient_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_pkey PRIMARY KEY (id);


--
-- Name: patient patient_userId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT "patient_userId_key" UNIQUE ("userId");


--
-- Name: prescriptionItem prescriptionItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."prescriptionItem"
    ADD CONSTRAINT "prescriptionItem_pkey" PRIMARY KEY (id);


--
-- Name: prescription prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT prescription_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: vitals vitals_encounterId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vitals
    ADD CONSTRAINT "vitals_encounterId_key" UNIQUE ("encounterId");


--
-- Name: vitals vitals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vitals
    ADD CONSTRAINT vitals_pkey PRIMARY KEY (id);


--
-- Name: appointment_doctorId_idx_04369053; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "appointment_doctorId_idx_04369053" ON public.appointment USING btree ("doctorId");


--
-- Name: appointment_patientId_idx_e5f07e88; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "appointment_patientId_idx_e5f07e88" ON public.appointment USING btree ("patientId");


--
-- Name: department_hospitalId_idx_94de2e98; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "department_hospitalId_idx_94de2e98" ON public.department USING btree ("hospitalId");


--
-- Name: doctor_departmentId_idx_8e261ed8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "doctor_departmentId_idx_8e261ed8" ON public.doctor USING btree ("departmentId");


--
-- Name: encounter_doctorId_idx_04369053; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "encounter_doctorId_idx_04369053" ON public.encounter USING btree ("doctorId");


--
-- Name: encounter_patientId_idx_e5f07e88; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "encounter_patientId_idx_e5f07e88" ON public.encounter USING btree ("patientId");


--
-- Name: invoiceItem_invoiceId_idx_d5c4f70e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoiceItem_invoiceId_idx_d5c4f70e" ON public."invoiceItem" USING btree ("invoiceId");


--
-- Name: labOrder_encounterId_idx_088c691b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "labOrder_encounterId_idx_088c691b" ON public."labOrder" USING btree ("encounterId");


--
-- Name: prescriptionItem_prescriptionId_idx_1e72349e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "prescriptionItem_prescriptionId_idx_1e72349e" ON public."prescriptionItem" USING btree ("prescriptionId");


--
-- Name: prescription_encounterId_idx_088c691b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "prescription_encounterId_idx_088c691b" ON public.prescription USING btree ("encounterId");


--
-- Name: appointment appointment_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public.doctor(id);


--
-- Name: appointment appointment_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patient(id);


--
-- Name: department department_hospitalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT "department_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES public.hospital(id);


--
-- Name: doctor doctor_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "doctor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.department(id);


--
-- Name: doctor doctor_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor
    ADD CONSTRAINT "doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: encounter encounter_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounter
    ADD CONSTRAINT "encounter_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public.appointment(id);


--
-- Name: encounter encounter_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounter
    ADD CONSTRAINT "encounter_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public.doctor(id);


--
-- Name: encounter encounter_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encounter
    ADD CONSTRAINT "encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public.patient(id);


--
-- Name: invoiceItem invoiceItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."invoiceItem"
    ADD CONSTRAINT "invoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoice(id);


--
-- Name: invoice invoice_encounterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT "invoice_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES public.encounter(id);


--
-- Name: labOrder labOrder_encounterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."labOrder"
    ADD CONSTRAINT "labOrder_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES public.encounter(id);


--
-- Name: labResult labResult_labOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."labResult"
    ADD CONSTRAINT "labResult_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES public."labOrder"(id);


--
-- Name: patient patient_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT "patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: prescriptionItem prescriptionItem_prescriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."prescriptionItem"
    ADD CONSTRAINT "prescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES public.prescription(id);


--
-- Name: prescription prescription_encounterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prescription
    ADD CONSTRAINT "prescription_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES public.encounter(id);


--
-- Name: vitals vitals_encounterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vitals
    ADD CONSTRAINT "vitals_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES public.encounter(id);


--
-- PostgreSQL database dump complete
--

\unrestrict YX54KN0b5jY3cUHjEZoPVnDR6MsV73QPPeeR4lhKbVOhaH0EaYhPk040tpysfTg

