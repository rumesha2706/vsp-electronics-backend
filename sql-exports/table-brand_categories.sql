-- Table: brand_categories
-- Generated: 2026-01-04T10:30:21.072Z


DROP TABLE IF EXISTS "brand_categories" CASCADE;
CREATE TABLE "brand_categories" (
  "id" integer NOT NULL DEFAULT nextval('brand_categories_id_seq1'::regclass),
  "name" character varying NOT NULL,
  "slug" character varying NOT NULL,
  "description" text,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "image_url" text,
  "product_url" text
);

 (7 rows)
INSERT INTO "brand_categories" ("id", "name", "slug", "description", "display_order", "created_at", "updated_at", "image_url", "product_url") VALUES (4, 'Agriculture Drone Parts', 'agriculture-drone-parts', NULL, 4, '"2026-01-03T21:58:38.183Z"', '"2026-01-03T22:40:58.011Z"', '/assets/images/categories/Agriculture Drone Parts.jpg', NULL);
INSERT INTO "brand_categories" ("id", "name", "slug", "description", "display_order", "created_at", "updated_at", "image_url", "product_url") VALUES (5, 'Antenna', 'antenna', NULL, 5, '"2026-01-03T21:58:38.183Z"', '"2026-01-03T22:40:58.068Z"', '/assets/images/categories/antenna.jpg', NULL);
INSERT INTO "brand_categories" ("id", "name", "slug", "description", "display_order", "created_at", "updated_at", "image_url", "product_url") VALUES (6, 'Audio Jack', 'audio-jack', NULL, 6, '"2026-01-03T21:58:38.183Z"', '"2026-01-03T22:40:58.122Z"', '/assets/images/categories/audio-jack.jpg', NULL);
INSERT INTO "brand_categories" ("id", "name", "slug", "description", "display_order", "created_at", "updated_at", "image_url", "product_url") VALUES (7, 'Battery', 'battery', NULL, 7, '"2026-01-03T21:58:38.183Z"', '"2026-01-03T22:40:58.176Z"', '/assets/images/categories/battery.jpg', NULL);
INSERT INTO "brand_categories" ("id", "name", "slug", "description", "display_order", "created_at", "updated_at", "image_url", "product_url") VALUES (1, '3D Printer Parts', '3d-printer-parts', NULL, 1, '"2026-01-03T21:58:38.183Z"', '"2026-01-03T22:40:57.856Z"', '/assets/images/categories/3D Printer Parts.jpg', NULL);
INSERT INTO "brand_categories" ("id", "name", "slug", "description", "display_order", "created_at", "updated_at", "image_url", "product_url") VALUES (3, 'AC Motor', 'ac-motor', NULL, 2, '"2026-01-03T21:58:38.183Z"', '"2026-01-03T22:40:57.958Z"', '/assets/images/categories/ac-motor.jpg', NULL);
INSERT INTO "brand_categories" ("id", "name", "slug", "description", "display_order", "created_at", "updated_at", "image_url", "product_url") VALUES (2, 'Accessories', 'accessories', NULL, 3, '"2026-01-03T21:58:38.183Z"', '"2026-01-03T22:40:57.906Z"', '/assets/images/categories/accessories.jpg', NULL);

