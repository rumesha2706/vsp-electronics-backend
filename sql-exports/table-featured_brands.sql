-- Table: featured_brands
-- Generated: 2026-01-04T10:30:21.087Z


DROP TABLE IF EXISTS "featured_brands" CASCADE;
CREATE TABLE "featured_brands" (
  "id" integer NOT NULL DEFAULT nextval('featured_brands_id_seq'::regclass),
  "brand_id" integer NOT NULL,
  "image_url" text,
  "display_order" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

 (14 rows)
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (1, 1, '/assets/images/brands/acebott.png', 1, true, '"2026-01-02T06:16:36.693Z"', '"2026-01-02T06:16:36.693Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (2, 2, '/assets/images/brands/amass.png', 2, true, '"2026-01-02T06:16:36.753Z"', '"2026-01-02T06:16:36.753Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (3, 3, '/assets/images/brands/arduino.png', 3, true, '"2026-01-02T06:16:36.812Z"', '"2026-01-02T06:16:36.812Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (4, 4, '/assets/images/brands/bonka.png', 4, true, '"2026-01-02T06:16:36.874Z"', '"2026-01-02T06:16:36.874Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (5, 5, '/assets/images/brands/eft.png', 5, true, '"2026-01-02T06:16:36.937Z"', '"2026-01-02T06:16:36.937Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (6, 6, '/assets/images/brands/elcon.png', 6, true, '"2026-01-02T06:16:36.997Z"', '"2026-01-02T06:16:36.997Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (7, 7, '/assets/images/brands/emax.png', 7, true, '"2026-01-02T06:16:37.060Z"', '"2026-01-02T06:16:37.060Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (8, 8, '/assets/images/brands/hobbywing.png', 8, true, '"2026-01-02T06:16:37.120Z"', '"2026-01-02T06:16:37.120Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (9, 9, '/assets/images/brands/jiyi.png', 9, true, '"2026-01-02T06:16:37.182Z"', '"2026-01-02T06:16:37.182Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (10, 10, '/assets/images/brands/mastech.png', 10, true, '"2026-01-02T06:16:37.239Z"', '"2026-01-02T06:16:37.239Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (11, 11, '/assets/images/brands/raspberry-pi.png', 11, true, '"2026-01-02T06:16:37.300Z"', '"2026-01-02T06:16:37.300Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (12, 12, '/assets/images/brands/skydroid.png', 12, true, '"2026-01-02T06:16:37.357Z"', '"2026-01-02T06:16:37.357Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (13, 13, '/assets/images/brands/skyrc.png', 13, true, '"2026-01-02T06:16:37.421Z"', '"2026-01-02T06:16:37.421Z"');
INSERT INTO "featured_brands" ("id", "brand_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (14, 14, '/assets/images/brands/tattu.png', 14, true, '"2026-01-02T06:16:37.479Z"', '"2026-01-02T06:16:37.479Z"');

