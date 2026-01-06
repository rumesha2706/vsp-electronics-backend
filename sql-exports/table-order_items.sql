-- Table: order_items
-- Generated: 2026-01-04T10:30:21.090Z


DROP TABLE IF EXISTS "order_items" CASCADE;
CREATE TABLE "order_items" (
  "id" integer NOT NULL DEFAULT nextval('order_items_id_seq'::regclass),
  "order_id" integer NOT NULL,
  "product_id" integer NOT NULL,
  "product_name" character varying,
  "product_image" character varying,
  "quantity" integer NOT NULL,
  "price_per_item" numeric NOT NULL,
  "item_total" numeric NOT NULL,
  "created_at" timestamp without time zone DEFAULT now()
);

