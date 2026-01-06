-- Table: users
-- Generated: 2026-01-04T10:30:21.107Z


DROP TABLE IF EXISTS "users" CASCADE;
CREATE TABLE "users" (
  "id" integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "email" character varying NOT NULL,
  "password_hash" character varying,
  "first_name" character varying,
  "last_name" character varying,
  "phone" character varying,
  "company" character varying,
  "address" text,
  "city" character varying,
  "state" character varying,
  "zip_code" character varying,
  "country" character varying,
  "is_verified" boolean DEFAULT false,
  "email_verified_at" timestamp without time zone,
  "verification_token" character varying,
  "verification_token_expires" timestamp without time zone,
  "reset_token" character varying,
  "reset_token_expires" timestamp without time zone,
  "is_active" boolean DEFAULT true,
  "oauth_provider" character varying,
  "oauth_id" character varying,
  "profile_picture" text,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "role" character varying DEFAULT 'user'::character varying
);

 (2 rows)
INSERT INTO "users" ("id", "email", "password_hash", "first_name", "last_name", "phone", "company", "address", "city", "state", "zip_code", "country", "is_verified", "email_verified_at", "verification_token", "verification_token_expires", "reset_token", "reset_token_expires", "is_active", "oauth_provider", "oauth_id", "profile_picture", "created_at", "updated_at", "role") VALUES (2, 'test@gmail.com', '$2b$10$d0Uu8emQDk58n3Pqf6yrFO00xpoz86SRfBr3vQfauDvIcra6RgLLm', 'Test', 'User', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '"2026-01-03T07:49:49.604Z"', NULL, NULL, NULL, NULL, true, NULL, NULL, NULL, '"2026-01-03T02:19:50.997Z"', '"2026-01-03T02:19:50.997Z"', 'user');
INSERT INTO "users" ("id", "email", "password_hash", "first_name", "last_name", "phone", "company", "address", "city", "state", "zip_code", "country", "is_verified", "email_verified_at", "verification_token", "verification_token_expires", "reset_token", "reset_token_expires", "is_active", "oauth_provider", "oauth_id", "profile_picture", "created_at", "updated_at", "role") VALUES (1, 'admin@vspelectronics.com', '$2b$10$tIRypSmz/7/kMVVo8HDE9Ov/E46a/qKdS.fGaSSOEQYEOMFRhYtBe', 'Admin', 'User', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '"2026-01-03T07:49:48.759Z"', NULL, NULL, NULL, NULL, true, NULL, NULL, NULL, '"2026-01-03T02:19:50.807Z"', '"2026-01-03T02:19:50.807Z"', 'admin');
