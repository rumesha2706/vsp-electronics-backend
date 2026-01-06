-- Table: cart_items
-- Generated: 2026-01-04T10:30:21.079Z


DROP TABLE IF EXISTS "cart_items" CASCADE;
CREATE TABLE "cart_items" (
  "id" integer NOT NULL DEFAULT nextval('cart_items_id_seq'::regclass),
  "user_id" integer NOT NULL,
  "product_id" integer NOT NULL,
  "quantity" integer NOT NULL DEFAULT 1,
  "price_at_add" numeric,
  "added_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

