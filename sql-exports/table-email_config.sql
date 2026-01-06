-- Table: email_config
-- Generated: 2026-01-04T10:30:21.084Z


DROP TABLE IF EXISTS "email_config" CASCADE;
CREATE TABLE "email_config" (
  "id" integer NOT NULL DEFAULT nextval('email_config_id_seq'::regclass),
  "config_key" character varying NOT NULL,
  "config_value" text NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

 (6 rows)
INSERT INTO "email_config" ("id", "config_key", "config_value", "description", "is_active", "created_at", "updated_at") VALUES (1, 'SENDER_EMAIL', 'cogithub42@gmail.com', 'Gmail account for sending verification emails', true, '"2026-01-03T02:19:51.153Z"', '"2026-01-03T02:19:51.153Z"');
INSERT INTO "email_config" ("id", "config_key", "config_value", "description", "is_active", "created_at", "updated_at") VALUES (2, 'SENDER_NAME', 'VSP Electronics', 'Sender name for emails', true, '"2026-01-03T02:19:51.217Z"', '"2026-01-03T02:19:51.217Z"');
INSERT INTO "email_config" ("id", "config_key", "config_value", "description", "is_active", "created_at", "updated_at") VALUES (3, 'GMAIL_APP_PASSWORD', 'usua mozm tosk uazs', 'Gmail App Password (16 characters)', true, '"2026-01-03T02:19:51.281Z"', '"2026-01-03T02:19:51.281Z"');
INSERT INTO "email_config" ("id", "config_key", "config_value", "description", "is_active", "created_at", "updated_at") VALUES (4, 'SMTP_HOST', 'smtp.gmail.com', 'SMTP server host', true, '"2026-01-03T02:19:51.344Z"', '"2026-01-03T02:19:51.344Z"');
INSERT INTO "email_config" ("id", "config_key", "config_value", "description", "is_active", "created_at", "updated_at") VALUES (5, 'SMTP_PORT', '587', 'SMTP server port', true, '"2026-01-03T02:19:51.406Z"', '"2026-01-03T02:19:51.406Z"');
INSERT INTO "email_config" ("id", "config_key", "config_value", "description", "is_active", "created_at", "updated_at") VALUES (6, 'SMTP_SECURE', 'false', 'Use TLS instead of SSL', true, '"2026-01-03T02:19:51.468Z"', '"2026-01-03T02:19:51.468Z"');

