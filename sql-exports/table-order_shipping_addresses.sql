-- Table: order_shipping_addresses
-- Generated: 2026-01-04T10:30:21.091Z


DROP TABLE IF EXISTS "order_shipping_addresses" CASCADE;
CREATE TABLE "order_shipping_addresses" (
  "id" integer NOT NULL DEFAULT nextval('order_shipping_addresses_id_seq'::regclass),
  "order_id" integer NOT NULL,
  "first_name" character varying,
  "last_name" character varying,
  "email" character varying,
  "phone" character varying,
  "address" character varying,
  "city" character varying,
  "state" character varying,
  "zip_code" character varying,
  "country" character varying,
  "created_at" timestamp without time zone DEFAULT now()
);

