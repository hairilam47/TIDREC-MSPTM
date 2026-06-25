CREATE TYPE "public"."user_role" AS ENUM('attendee', 'admin');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('keynote', 'panel', 'workshop', 'oral', 'poster', 'opening', 'closing');--> statement-breakpoint
CREATE TYPE "public"."sponsor_tier" AS ENUM('platinum', 'gold', 'silver', 'bronze');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'overdue', 'waived');--> statement-breakpoint
CREATE TYPE "public"."abstract_status" AS ENUM('submitted', 'under_review', 'accepted', 'rejected', 'revision_requested');--> statement-breakpoint
CREATE TYPE "public"."abstract_type" AS ENUM('oral', 'poster');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('bank_transfer', 'credit_card', 'online_banking', 'waiver');--> statement-breakpoint
CREATE TYPE "public"."payment_transaction_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"institution" text,
	"country" text,
	"category" text,
	"role" "user_role" DEFAULT 'attendee' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "speakers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"institution" text,
	"topic" text NOT NULL,
	"bio" text,
	"photo_url" text,
	"initials" text NOT NULL,
	"speaker_tier" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"day" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text,
	"room" text,
	"session_type" "session_type" NOT NULL,
	"description" text,
	"speaker_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tier" "sponsor_tier" NOT NULL,
	"logo_url" text,
	"website" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category" text NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_amount" numeric(10, 2),
	"registration_code" text NOT NULL,
	"dietary_requirements" text,
	"special_needs" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_registration_code_unique" UNIQUE("registration_code")
);
--> statement-breakpoint
CREATE TABLE "abstracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"abstract_type" "abstract_type" NOT NULL,
	"keywords" text,
	"co_authors" text,
	"file_url" text,
	"status" "abstract_status" DEFAULT 'submitted' NOT NULL,
	"review_notes" text,
	"reviewed_by" text,
	"abstract_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "abstracts_abstract_code_unique" UNIQUE("abstract_code")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"important" boolean DEFAULT false NOT NULL,
	"audience" text DEFAULT 'all' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"registration_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'MYR' NOT NULL,
	"payment_method" "payment_method",
	"transaction_status" "payment_transaction_status" DEFAULT 'pending' NOT NULL,
	"transaction_reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_sessions_user_session_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "abstract_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"abstract_id" integer NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"changed_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"registration_id" integer NOT NULL,
	"sent_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"price_myr" numeric(10, 2) DEFAULT '0' NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registration_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "committee_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"photo_url" text,
	"initials" text NOT NULL,
	"committee_level" text NOT NULL,
	"subcommittee_name" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_speaker_id_speakers_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."speakers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abstracts" ADD CONSTRAINT "abstracts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_sessions" ADD CONSTRAINT "saved_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_sessions" ADD CONSTRAINT "saved_sessions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "abstract_history" ADD CONSTRAINT "abstract_history_abstract_id_abstracts_id_fk" FOREIGN KEY ("abstract_id") REFERENCES "public"."abstracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_reminders" ADD CONSTRAINT "payment_reminders_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;