--
-- PostgreSQL database dump
--

\restrict hpOYJthy4H7vS5Et0WpAndLCAkg4h2jv02kKORDjogb5eYOTMwNgY8fOfjBEQkx

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: abstract_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.abstract_status AS ENUM (
    'submitted',
    'under_review',
    'accepted',
    'rejected',
    'revision_requested'
);


--
-- Name: abstract_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.abstract_type AS ENUM (
    'oral',
    'poster'
);


--
-- Name: delegate_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.delegate_category AS ENUM (
    'healthcare_professional',
    'researcher',
    'educator',
    'student',
    'industry'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'bank_transfer',
    'credit_card',
    'online_banking',
    'waiver'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'overdue',
    'waived'
);


--
-- Name: payment_transaction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_transaction_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);


--
-- Name: session_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.session_type AS ENUM (
    'keynote',
    'panel',
    'workshop',
    'oral',
    'poster',
    'opening',
    'closing'
);


--
-- Name: sponsor_tier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sponsor_tier AS ENUM (
    'platinum',
    'gold',
    'silver',
    'bronze'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'attendee',
    'admin'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: abstract_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.abstract_history (
    id integer NOT NULL,
    abstract_id integer NOT NULL,
    from_status text,
    to_status text NOT NULL,
    changed_by text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: abstract_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.abstract_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: abstract_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.abstract_history_id_seq OWNED BY public.abstract_history.id;


--
-- Name: abstracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.abstracts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    abstract_type public.abstract_type NOT NULL,
    keywords text,
    co_authors text,
    status public.abstract_status DEFAULT 'submitted'::public.abstract_status NOT NULL,
    review_notes text,
    abstract_code text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    file_url text,
    reviewed_by text
);


--
-- Name: abstracts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.abstracts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: abstracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.abstracts_id_seq OWNED BY public.abstracts.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    important boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    audience text DEFAULT 'all'::text NOT NULL
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: payment_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_reminders (
    id integer NOT NULL,
    registration_id integer NOT NULL,
    sent_by text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_reminders_id_seq OWNED BY public.payment_reminders.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    registration_id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'MYR'::text NOT NULL,
    payment_method public.payment_method,
    transaction_status public.payment_transaction_status DEFAULT 'pending'::public.payment_transaction_status NOT NULL,
    transaction_reference text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: registration_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registration_categories (
    id integer NOT NULL,
    slug text NOT NULL,
    label text NOT NULL,
    price_myr numeric(10,2) DEFAULT 0 NOT NULL,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: registration_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registration_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registration_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registration_categories_id_seq OWNED BY public.registration_categories.id;


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    category text NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    payment_amount numeric(10,2),
    registration_code text NOT NULL,
    dietary_requirements text,
    special_needs text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registrations_id_seq OWNED BY public.registrations.id;


--
-- Name: saved_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    session_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: saved_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saved_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saved_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saved_sessions_id_seq OWNED BY public.saved_sessions.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    title text NOT NULL,
    day integer NOT NULL,
    start_time text NOT NULL,
    end_time text,
    room text,
    session_type public.session_type NOT NULL,
    description text,
    speaker_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: speakers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.speakers (
    id integer NOT NULL,
    name text NOT NULL,
    country text NOT NULL,
    institution text,
    topic text NOT NULL,
    bio text,
    photo_url text,
    initials text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    speaker_tier text
);


--
-- Name: speakers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.speakers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: speakers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.speakers_id_seq OWNED BY public.speakers.id;


--
-- Name: sponsors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsors (
    id integer NOT NULL,
    name text NOT NULL,
    tier public.sponsor_tier NOT NULL,
    logo_url text,
    website text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sponsors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sponsors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sponsors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sponsors_id_seq OWNED BY public.sponsors.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    institution text,
    country text,
    category text,
    role public.user_role DEFAULT 'attendee'::public.user_role NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: abstract_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstract_history ALTER COLUMN id SET DEFAULT nextval('public.abstract_history_id_seq'::regclass);


--
-- Name: abstracts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts ALTER COLUMN id SET DEFAULT nextval('public.abstracts_id_seq'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: payment_reminders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_reminders ALTER COLUMN id SET DEFAULT nextval('public.payment_reminders_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: registration_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_categories ALTER COLUMN id SET DEFAULT nextval('public.registration_categories_id_seq'::regclass);


--
-- Name: registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations ALTER COLUMN id SET DEFAULT nextval('public.registrations_id_seq'::regclass);


--
-- Name: saved_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_sessions ALTER COLUMN id SET DEFAULT nextval('public.saved_sessions_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: speakers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.speakers ALTER COLUMN id SET DEFAULT nextval('public.speakers_id_seq'::regclass);


--
-- Name: sponsors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors ALTER COLUMN id SET DEFAULT nextval('public.sponsors_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: abstract_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.abstract_history (id, abstract_id, from_status, to_status, changed_by, notes, created_at) FROM stdin;
\.


--
-- Data for Name: abstracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.abstracts (id, user_id, title, body, abstract_type, keywords, co_authors, status, review_notes, abstract_code, created_at, updated_at, file_url, reviewed_by) FROM stdin;
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, body, important, created_at, updated_at, audience) FROM stdin;
1	Early Bird Registration Now Open	Early bird registration for SATBDS 2027 is now open until 31 December 2026. Take advantage of discounted rates for healthcare professionals, researchers, and students.	t	2026-06-10 06:54:59.444389	2026-06-10 06:54:59.444389	all
2	Abstract Submission Deadline: 31 January 2027	Abstracts for oral and poster presentations are due by 31 January 2027. Submissions must be between 250–400 words and follow the standard SATBDS format. Notifications will be sent by 28 February 2027.	t	2026-06-10 06:54:59.444389	2026-06-10 06:54:59.444389	all
3	Workshop Registration Now Available	Limited seats are available for the two hands-on workshops: Tick Identification & Field Collection and PCR Diagnostics. Workshop registration is separate from the main symposium fee.	f	2026-06-10 06:54:59.444389	2026-06-10 06:54:59.444389	all
\.


--
-- Data for Name: payment_reminders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_reminders (id, registration_id, sent_by, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, registration_id, user_id, amount, currency, payment_method, transaction_status, transaction_reference, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: registration_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registration_categories (id, slug, label, price_myr, description, sort_order, is_active, created_at, updated_at) FROM stdin;
1	msptm_member	MSPTM Member / ASIAN Alliance	800.00	For members of MSPTM or ASIAN Alliance	1	t	2026-06-18 04:02:12.717871	2026-06-18 04:02:12.717871
2	non_msptm_member	Non MSPTM Member	1000.00	For non-members of MSPTM	2	t	2026-06-18 04:02:12.717871	2026-06-18 04:02:12.717871
3	student_senior	Student / Senior Researcher	400.00	For students and senior researchers	3	t	2026-06-18 04:02:12.717871	2026-06-18 04:02:12.717871
4	international	International	1200.00	For international participants	4	t	2026-06-18 04:02:12.717871	2026-06-18 04:02:12.717871
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registrations (id, user_id, category, payment_status, payment_amount, registration_code, dietary_requirements, special_needs, created_at, updated_at) FROM stdin;
2	4	educator	pending	\N	REG-BF52293A	\N	\N	2026-06-14 23:56:48.808239	2026-06-14 23:56:48.808239
1	3	researcher	paid	600.00	REG-5B0B9E53	\N	\N	2026-06-10 09:07:17.240968	2026-06-15 02:46:15.046
3	5	industry	paid	1000.00	REG-2478C356	\N	\N	2026-06-15 02:41:30.259419	2026-06-15 02:46:22.624
4	6	industry	pending	\N	REG-47F524DF	\N	\N	2026-06-15 03:20:32.568879	2026-06-15 03:20:32.568879
5	8	researcher	pending	800.00	REG-B748EDBE	\N	\N	2026-06-17 12:57:48.263877	2026-06-17 12:57:48.263877
6	9	non_msptm_member	pending	1000.00	REG-C941B4E5	\N	\N	2026-06-18 04:33:37.643296	2026-06-18 04:33:37.643296
\.


--
-- Data for Name: saved_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.saved_sessions (id, user_id, session_id, created_at) FROM stdin;
1	2	1	2026-06-10 07:30:32.384002
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, title, day, start_time, end_time, room, session_type, description, speaker_id, created_at, updated_at) FROM stdin;
1	Opening Ceremony & Welcome Remarks	1	08:30	09:15	Grand Ballroom A	opening	Official opening of the 3rd SATBDS Symposium. Welcome addresses from MSPTM President and TIDREC@UM Director.	\N	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
2	Keynote: Emerging Tick-borne Diseases in Southeast Asia	1	09:15	10:00	Grand Ballroom A	keynote	An overview of the current landscape of tick-borne diseases across Southeast Asia, with a focus on surveillance gaps and emerging threats.	1	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
3	Molecular Epidemiology & Genomics	1	10:30	12:00	Grand Ballroom A	panel	Panel discussion on genomic approaches to understanding pathogen diversity and spread.	2	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
4	Workshop: Tick Identification & Field Collection	1	13:00	15:00	Workshop Room B	workshop	Hands-on workshop covering morphological identification of medically important tick species and best practices for specimen collection.	\N	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
5	Keynote: Climate Change and Vector-borne Disease Emergence	1	15:30	16:15	Grand Ballroom A	keynote	Examining how shifting climate patterns are expanding the geographic range of tick vectors and altering disease transmission dynamics.	4	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
6	Oral Presentations: Surveillance & Epidemiology	1	16:15	17:45	Grand Ballroom A	oral	Selected oral presentations on tick and tick-borne disease surveillance from across the region.	\N	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
7	Keynote: SFTS Virus — Epidemiology and Clinical Management	2	09:00	09:45	Grand Ballroom A	keynote	A comprehensive review of SFTS virus burden, clinical spectrum, and advances in supportive care.	5	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
8	Zoonotic Diseases & One Health	2	10:15	11:45	Grand Ballroom A	panel	One Health perspectives on the interplay between wildlife, livestock, human populations, and tick-borne pathogens.	3	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
9	Workshop: PCR Diagnostics for Tick-borne Pathogens	2	13:00	15:00	Workshop Room B	workshop	Practical session on molecular diagnostic approaches including conventional and real-time PCR for key tick-borne pathogens.	\N	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
10	Poster Session & Networking	2	15:00	16:30	Exhibition Hall	poster	Poster presentations by early-career researchers and networking session with refreshments.	\N	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
11	Closing Ceremony & Awards	2	16:30	17:15	Grand Ballroom A	closing	Best oral and poster presentation awards, closing remarks, and announcement of the 4th SATBDS host country.	\N	2026-06-10 06:54:59.434456	2026-06-10 06:54:59.434456
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, key, value, updated_at) FROM stdin;
\.


--
-- Data for Name: speakers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.speakers (id, name, country, institution, topic, bio, photo_url, initials, created_at, updated_at, speaker_tier) FROM stdin;
2	Dr. Tay Shin Tyen	Malaysia	TIDREC@UM	Molecular Epidemiology of Rickettsia in Malaysia	Dr. Tay is a molecular biologist whose research focuses on the genomics of tick-borne rickettsial pathogens.	\N	DT	2026-06-10 06:54:59.427975	2026-06-18 04:10:26.697	\N
5	Prof. Kwang-Shik Choi	South Korea	Kyungpook National University	SFTS Virus: Epidemiology and Clinical Management	Prof. Choi is a leading expert on Severe Fever with Thrombocytopenia Syndrome (SFTS), a deadly tick-borne viral disease.	\N	PK	2026-06-10 06:54:59.427975	2026-06-18 04:10:31.633	\N
1	Prof. Sazaly Abu Bakar	Malaysia	Universiti Malaya	Emerging Tick-borne Diseases in Southeast Asia	Professor Sazaly is a leading virologist specializing in emerging infectious diseases and zoonotic pathogens in Southeast Asia.	\N	PS	2026-06-10 06:54:59.427975	2026-06-18 04:10:35.609	\N
4	Dr. Muriel Morissette	France	Institut Pasteur	Climate Change and Vector-borne Disease Emergence	Dr. Morissette investigates the impact of climate change on arthropod vector distributions and disease burden.	/objects/uploads/64dfa3e4-778c-4319-a826-e80f1cedad0f	DM	2026-06-10 06:54:59.427975	2026-06-22 01:44:39.529	keynote
3	Assoc. Prof. Janet Cox-Singh	United Kingdom	University of St Andrews	Simian Malaria and Tick-borne Transmission Dynamics	Assoc. Prof. Cox-Singh's research spans simian malaria, zoonotic diseases, and vector ecology.	/objects/uploads/c6b1c0f4-9056-472b-8999-710f4776e3f5	AP	2026-06-10 06:54:59.427975	2026-06-22 01:44:59.481	keynote
\.


--
-- Data for Name: sponsors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sponsors (id, name, tier, logo_url, website, created_at, updated_at) FROM stdin;
1	BioMérieux Malaysia	platinum	\N	https://www.biomerieux.com	2026-06-10 06:54:59.440126	2026-06-10 06:54:59.440126
2	Thermo Fisher Scientific	gold	\N	https://www.thermofisher.com	2026-06-10 06:54:59.440126	2026-06-10 06:54:59.440126
3	Shimadzu Malaysia	gold	\N	https://www.shimadzu.com	2026-06-10 06:54:59.440126	2026-06-10 06:54:59.440126
4	Qiagen	silver	\N	https://www.qiagen.com	2026-06-10 06:54:59.440126	2026-06-10 06:54:59.440126
5	Sunway Putra Hotel	silver	\N	https://www.sunwayhotels.com	2026-06-10 06:54:59.440126	2026-06-10 06:54:59.440126
6	Jabatan Perkhidmatan Veterinar	bronze	\N	https://www.dvs.gov.my	2026-06-10 06:54:59.440126	2026-06-10 06:54:59.440126
7	Malaysian Bioeconomy Development Corporation	bronze	\N	\N	2026-06-10 06:54:59.440126	2026-06-10 06:54:59.440126
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, first_name, last_name, institution, country, category, role, created_at, updated_at) FROM stdin;
1	admin@satbds2027.org	$2b$10$MCaMLB8Wx8oLFRAzalMjyOfUxcDkkJTBvDC8SxdQTqMzShYMqBPum	Admin	User	SATBDS 2027	Malaysia	\N	admin	2026-06-10 06:54:59.392439	2026-06-10 06:54:59.392439
2	delegate@example.com	$2b$10$yIOuvnCIC4G/UTcnK72UUOmZ11GsD4IpWPUbDCPP0hW/jHYlOTuOO	Ahmad	Razali	University of Malaya	Malaysia	researcher	attendee	2026-06-10 06:54:59.392439	2026-06-10 06:54:59.392439
3	hairilam47@gmail.com	$2b$10$GSEugQ4PLTGjDlSIWGG0mutEmgPjNjX3ETSLFnS19.uoPRPxw2dum	Muhammad Hairi	Gulamsarwar	UUM	Malaysia	researcher	attendee	2026-06-10 09:07:17.088534	2026-06-10 09:07:17.088534
4	hl2191996@gmail.com	$2b$10$ocxJkMo0GZ9wYiHNwgX8G.AuoP92zolmw/Fuco7TaZV9ZU.XPbB..	Muhammad Hairi	Gulamsarwar	UTM	Malaysia	educator	attendee	2026-06-14 23:56:48.541379	2026-06-14 23:56:48.541379
5	test21@gmail.com	$2b$10$J2pqjGoPwW5kP4ud4e64BuOyZJiE4bfXsadiTLq.r.5qrZW7hV.hS	Testing 1	Bon T2	UUM	Malaysia	industry	attendee	2026-06-15 02:41:30.046666	2026-06-15 02:41:30.046666
6	hairilam4733@gmail.com	$2b$10$L4kV6izblRrxkhF4bwoj6.wTEIIOJnxi3PzTLZOY3t8PoJrjAlpfq	123123ASD	123123ASD	12332	Malaysia	industry	attendee	2026-06-15 03:20:32.080812	2026-06-15 03:20:32.080812
7	delegate.test@example.com	$2b$10$ngFwcOf4bVvZI3R9f4BySesl18TT6Vt6HgfwfeTml6dLu7ivgzcbS	Amelia	Wong	University of Malaya	Malaysia	\N	attendee	2026-06-17 04:41:10.11027	2026-06-17 04:41:10.11027
8	testdelegate@example.com	$2b$10$YrYPIuQQmoByiquhgTTJdu7co0.5ZUM3hWuLPM3ZQiCO.dJX/xwiC	Test	Delegate	University of Malaya	Malaysia	researcher	attendee	2026-06-17 12:57:47.914409	2026-06-17 12:57:47.914409
9	testing123@gmal.com	$2b$10$FoXD9gIYd7cmLyy/F0Qql.5RBRIjRtDuBvulMUA4F98htq/mGgBOy	Muhammad Hairi	Bin Gulamsarwar	UUM	Malaysia	non_msptm_member	attendee	2026-06-18 04:33:36.979748	2026-06-18 04:33:36.979748
\.


--
-- Name: abstract_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.abstract_history_id_seq', 1, false);


--
-- Name: abstracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.abstracts_id_seq', 1, false);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 3, true);


--
-- Name: payment_reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_reminders_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: registration_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.registration_categories_id_seq', 4, true);


--
-- Name: registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.registrations_id_seq', 6, true);


--
-- Name: saved_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.saved_sessions_id_seq', 1, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sessions_id_seq', 11, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, false);


--
-- Name: speakers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.speakers_id_seq', 5, true);


--
-- Name: sponsors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sponsors_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- Name: abstract_history abstract_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstract_history
    ADD CONSTRAINT abstract_history_pkey PRIMARY KEY (id);


--
-- Name: abstracts abstracts_abstract_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_abstract_code_unique UNIQUE (abstract_code);


--
-- Name: abstracts abstracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: payment_reminders payment_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_reminders
    ADD CONSTRAINT payment_reminders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: registration_categories registration_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_categories
    ADD CONSTRAINT registration_categories_pkey PRIMARY KEY (id);


--
-- Name: registration_categories registration_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_categories
    ADD CONSTRAINT registration_categories_slug_key UNIQUE (slug);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_registration_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_registration_code_unique UNIQUE (registration_code);


--
-- Name: saved_sessions saved_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_sessions
    ADD CONSTRAINT saved_sessions_pkey PRIMARY KEY (id);


--
-- Name: saved_sessions saved_sessions_user_session_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_sessions
    ADD CONSTRAINT saved_sessions_user_session_unique UNIQUE (user_id, session_id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_unique UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: speakers speakers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.speakers
    ADD CONSTRAINT speakers_pkey PRIMARY KEY (id);


--
-- Name: sponsors sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: abstract_history abstract_history_abstract_id_abstracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstract_history
    ADD CONSTRAINT abstract_history_abstract_id_abstracts_id_fk FOREIGN KEY (abstract_id) REFERENCES public.abstracts(id) ON DELETE CASCADE;


--
-- Name: abstracts abstracts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.abstracts
    ADD CONSTRAINT abstracts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: payment_reminders payment_reminders_registration_id_registrations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_reminders
    ADD CONSTRAINT payment_reminders_registration_id_registrations_id_fk FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON DELETE CASCADE;


--
-- Name: payments payments_registration_id_registrations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_registration_id_registrations_id_fk FOREIGN KEY (registration_id) REFERENCES public.registrations(id);


--
-- Name: payments payments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: registrations registrations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: saved_sessions saved_sessions_session_id_sessions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_sessions
    ADD CONSTRAINT saved_sessions_session_id_sessions_id_fk FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- Name: saved_sessions saved_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_sessions
    ADD CONSTRAINT saved_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sessions sessions_speaker_id_speakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_speaker_id_speakers_id_fk FOREIGN KEY (speaker_id) REFERENCES public.speakers(id);


--
-- PostgreSQL database dump complete
--

\unrestrict hpOYJthy4H7vS5Et0WpAndLCAkg4h2jv02kKORDjogb5eYOTMwNgY8fOfjBEQkx

