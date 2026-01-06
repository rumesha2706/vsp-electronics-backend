-- Table: orders
-- Generated: 2026-01-04T10:30:21.092Z


DROP TABLE IF EXISTS "orders" CASCADE;
CREATE TABLE "orders" (
  "id" integer NOT NULL DEFAULT nextval('orders_id_seq'::regclass),
  "user_id" integer NOT NULL,
  "order_number" character varying NOT NULL,
  "status" character varying DEFAULT 'pending'::character varying,
  "subtotal" numeric NOT NULL,
  "tax" numeric NOT NULL,
  "shipping" numeric NOT NULL,
  "total" numeric NOT NULL,
  "payment_method" character varying,
  "payment_status" character varying DEFAULT 'pending'::character varying,
  "notes" text,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

