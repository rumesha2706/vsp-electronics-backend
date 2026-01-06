-- Table: product_images
-- Generated: 2026-01-04T10:30:21.093Z


DROP TABLE IF EXISTS "product_images" CASCADE;
CREATE TABLE "product_images" (
  "id" integer NOT NULL DEFAULT nextval('product_images_id_seq'::regclass),
  "product_id" integer NOT NULL,
  "image_url" text NOT NULL,
  "position" integer DEFAULT 0,
  "alt_text" character varying,
  "is_primary" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

 (6 rows)
INSERT INTO "product_images" ("id", "product_id", "image_url", "position", "alt_text", "is_primary", "created_at", "updated_at") VALUES (2, 34, '/assets/images/products/sample-34-2.jpg', 2, 'Side View', false, '"2026-01-03T23:01:49.746Z"', '"2026-01-03T23:01:49.746Z"');
INSERT INTO "product_images" ("id", "product_id", "image_url", "position", "alt_text", "is_primary", "created_at", "updated_at") VALUES (5, 34, '/assets/images/products/sample-34-2.jpg', 2, 'Side View', false, '"2026-01-03T23:02:02.011Z"', '"2026-01-03T23:02:02.011Z"');
INSERT INTO "product_images" ("id", "product_id", "image_url", "position", "alt_text", "is_primary", "created_at", "updated_at") VALUES (3, 34, '/assets/images/products/sample-34-3.jpg', 3, 'Back View', false, '"2026-01-03T23:01:49.792Z"', '"2026-01-03T23:01:49.792Z"');
INSERT INTO "product_images" ("id", "product_id", "image_url", "position", "alt_text", "is_primary", "created_at", "updated_at") VALUES (6, 34, '/assets/images/products/sample-34-3.jpg', 3, 'Back View', false, '"2026-01-03T23:02:02.080Z"', '"2026-01-03T23:02:02.080Z"');
INSERT INTO "product_images" ("id", "product_id", "image_url", "position", "alt_text", "is_primary", "created_at", "updated_at") VALUES (1, 34, '/assets/images/products/sample-34-1.jpg', 1, 'Front View', true, '"2026-01-03T23:01:49.684Z"', '"2026-01-03T23:01:49.684Z"');
INSERT INTO "product_images" ("id", "product_id", "image_url", "position", "alt_text", "is_primary", "created_at", "updated_at") VALUES (4, 34, '/assets/images/products/sample-34-1.jpg', 1, 'Updated: Side View - Best Angle', false, '"2026-01-03T23:02:01.943Z"', '"2026-01-03T23:02:02.447Z"');

