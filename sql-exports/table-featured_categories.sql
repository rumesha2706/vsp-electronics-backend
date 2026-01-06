-- Table: featured_categories
-- Generated: 2026-01-04T10:30:21.088Z


DROP TABLE IF EXISTS "featured_categories" CASCADE;
CREATE TABLE "featured_categories" (
  "id" integer NOT NULL DEFAULT nextval('featured_categories_id_seq'::regclass),
  "category_id" integer NOT NULL,
  "image_url" text,
  "display_order" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

 (7 rows)
INSERT INTO "featured_categories" ("id", "category_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (1, 1, '/assets/images/categories/robotic-diy-kits.jpg', 1, true, '"2026-01-02T06:16:36.139Z"', '"2026-01-02T06:16:36.139Z"');
INSERT INTO "featured_categories" ("id", "category_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (2, 2, '/assets/images/categories/ready-running-projects.jpg', 2, true, '"2026-01-02T06:16:36.203Z"', '"2026-01-02T06:16:36.203Z"');
INSERT INTO "featured_categories" ("id", "category_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (3, 3, '/assets/images/categories/raspberry-pi-boards.jpg', 3, true, '"2026-01-02T06:16:36.262Z"', '"2026-01-02T06:16:36.262Z"');
INSERT INTO "featured_categories" ("id", "category_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (4, 4, '/assets/images/categories/mini-drone-kits.jpg', 4, true, '"2026-01-02T06:16:36.322Z"', '"2026-01-02T06:16:36.322Z"');
INSERT INTO "featured_categories" ("id", "category_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (5, 5, '/assets/images/categories/drone-transmitter-receiver.jpg', 5, true, '"2026-01-02T06:16:36.381Z"', '"2026-01-02T06:16:36.381Z"');
INSERT INTO "featured_categories" ("id", "category_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (7, 7, '/assets/images/categories/agriculture-drone-parts.jpg', 7, true, '"2026-01-02T06:16:36.506Z"', '"2026-01-02T06:16:36.506Z"');
INSERT INTO "featured_categories" ("id", "category_id", "image_url", "display_order", "is_active", "created_at", "updated_at") VALUES (8, 8, '/assets/images/categories/diy-kits.jpg', 8, true, '"2026-01-02T06:16:36.565Z"', '"2026-01-02T06:16:36.565Z"');

