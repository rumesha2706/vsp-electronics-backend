-- Table: brands
-- Generated: 2026-01-04T10:30:21.078Z


DROP TABLE IF EXISTS "brands" CASCADE;
CREATE TABLE "brands" (
  "id" integer NOT NULL DEFAULT nextval('brands_id_seq'::regclass),
  "name" character varying NOT NULL,
  "slug" character varying NOT NULL,
  "category_id" integer,
  "description" text,
  "logo_url" text,
  "website_url" text,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "is_featured" boolean DEFAULT false,
  "product_count" integer DEFAULT 0,
  "image" text,
  "metadata" jsonb
);

 (14 rows)
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (6, 'Elcon', 'elcon', NULL, NULL, '/assets/images/brands/elcon.png', NULL, '"2026-01-02T05:07:57.667Z"', '"2026-01-02T05:07:57.667Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (1, 'ACEBOTT', 'acebott', NULL, 'ACEBOTT products', '/assets/images/brands/acebott.png', NULL, '"2026-01-02T05:07:57.446Z"', '"2026-01-03T02:45:43.796Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (2, 'Amass', 'amass', NULL, 'Amass products', '/assets/images/brands/amass.png', NULL, '"2026-01-02T05:07:57.489Z"', '"2026-01-03T02:45:43.864Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (3, 'Arduino', 'arduino', NULL, 'Arduino development boards and kits', '/assets/images/brands/arduino.png', NULL, '"2026-01-02T05:07:57.532Z"', '"2026-01-03T02:45:43.927Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (4, 'BONKA', 'bonka', NULL, 'BONKA products', '/assets/images/brands/bonka.png', NULL, '"2026-01-02T05:07:57.579Z"', '"2026-01-03T02:45:43.988Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (5, 'EFT', 'eft', NULL, 'EFT products', '/assets/images/brands/eft.png', NULL, '"2026-01-02T05:07:57.623Z"', '"2026-01-03T02:45:44.049Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (7, 'EMAX', 'emax', NULL, 'EMAX products', '/assets/images/brands/emax.png', NULL, '"2026-01-02T05:07:57.714Z"', '"2026-01-03T02:45:44.189Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (8, 'Hobbywing', 'hobbywing', NULL, 'Hobbywing products', '/assets/images/brands/hobbywing.png', NULL, '"2026-01-02T05:07:57.757Z"', '"2026-01-03T02:45:44.250Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (9, 'JIYI', 'jiyi', NULL, 'JIYI products', '/assets/images/brands/jiyi.png', NULL, '"2026-01-02T05:07:57.800Z"', '"2026-01-03T02:45:44.313Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (10, 'Mastech', 'mastech', NULL, 'Mastech products', '/assets/images/brands/mastech.png', NULL, '"2026-01-02T05:07:57.842Z"', '"2026-01-03T02:45:44.374Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (11, 'Raspberry Pi', 'raspberry-pi', NULL, 'Raspberry Pi boards and accessories', '/assets/images/brands/raspberry-pi.png', NULL, '"2026-01-02T05:07:57.886Z"', '"2026-01-03T02:45:44.438Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (12, 'SKYDROID', 'skydroid', NULL, 'SKYDROID products', '/assets/images/brands/skydroid.png', NULL, '"2026-01-02T05:07:57.928Z"', '"2026-01-03T02:45:44.499Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (13, 'SKYRC', 'skyrc', NULL, 'SKYRC products', '/assets/images/brands/skyrc.png', NULL, '"2026-01-02T05:07:57.970Z"', '"2026-01-03T02:45:44.561Z"', false, 0, NULL, NULL);
INSERT INTO "brands" ("id", "name", "slug", "category_id", "description", "logo_url", "website_url", "created_at", "updated_at", "is_featured", "product_count", "image", "metadata") VALUES (14, 'TATTU', 'tattu', NULL, 'TATTU products', '/assets/images/brands/tattu.png', NULL, '"2026-01-02T05:07:58.013Z"', '"2026-01-03T02:45:44.622Z"', false, 0, NULL, NULL);

