-- Table: categories
-- Generated: 2026-01-04T10:30:21.080Z


DROP TABLE IF EXISTS "categories" CASCADE;
CREATE TABLE "categories" (
  "id" integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  "name" character varying NOT NULL,
  "slug" character varying NOT NULL,
  "description" text,
  "image_url" text,
  "display_on_home" boolean DEFAULT false,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "is_featured" boolean DEFAULT false,
  "product_count" integer DEFAULT 0
);

 (13 rows)
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (7, 'Agriculture Drone Parts', 'agriculture-drone-parts', 'Parts for agricultural drones', '/assets/images/categories/agriculture-drone-parts.jpg', true, 7, '"2026-01-02T05:07:56.868Z"', '"2026-01-02T05:07:56.868Z"', false, 31);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (1, 'Robotic DIY Kits', 'robotic-diy-kits', 'Complete DIY Robotic Kit Collections', '/assets/images/categories/robotic-diy-kits.jpg', true, 1, '"2026-01-02T05:07:56.600Z"', '"2026-01-02T05:07:56.600Z"', false, 13);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (2, 'Ready Running Projects', 'ready-running-projects', 'Ready to use project kits', '/assets/images/categories/ready-running-projects.jpg', true, 2, '"2026-01-02T05:07:56.651Z"', '"2026-01-02T05:07:56.651Z"', false, 19);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (4, 'Mini Drone Kits', 'mini-drone-kits-below-20cms', 'Compact drone kits under 20cm', '/assets/images/categories/mini-drone-kits.jpg', true, 4, '"2026-01-02T05:07:56.737Z"', '"2026-01-02T05:07:56.737Z"', false, 4);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (5, 'Drone Transmiter Receiver', 'drone-transmitter-receiver', 'RC transmitter and receiver modules', '/assets/images/categories/drone-transmiter-receiver.jpg', true, 5, '"2026-01-02T05:07:56.780Z"', '"2026-01-02T05:07:56.780Z"', false, 15);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (15, 'Bonka', 'bonka', NULL, '/assets/images/categories/bonka.jpg', true, 6, '"2026-01-02T07:13:38.608Z"', '"2026-01-02T07:13:38.608Z"', false, 31);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (8, 'DIY Kits', 'diy-kits', 'Various DIY kit collections', '/assets/images/categories/diy-kits.jpg', true, 8, '"2026-01-02T05:07:56.909Z"', '"2026-01-02T05:07:56.909Z"', false, 166);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (9, 'BMS', 'bms', 'Battery Management Systems', '/assets/images/categories/bms.jpg', false, 9, '"2026-01-02T05:07:56.955Z"', '"2026-01-02T05:07:56.955Z"', false, 23);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (10, 'Shield Accessories', 'shield-accessories', 'Arduino and Raspberry Pi Shield Accessories', '/assets/images/categories/shield-accessories.jpg', false, 10, '"2026-01-02T05:07:56.998Z"', '"2026-01-02T05:07:56.998Z"', false, 33);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (11, 'Wheels', 'wheels', 'Robot and Vehicle Wheels', '/assets/images/categories/wheels.jpg', false, 11, '"2026-01-02T05:07:57.043Z"', '"2026-01-02T05:07:57.043Z"', false, 30);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (12, 'Wireless Modules', 'wireless-modules', 'WiFi, Bluetooth, and RF Wireless Modules', '/assets/images/categories/wireless-modules.jpg', false, 12, '"2026-01-02T05:07:57.087Z"', '"2026-01-02T05:07:57.087Z"', false, 41);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (3, 'Raspberry', 'raspberry', 'Raspberry Pi single board computers', '/assets/images/categories/raspberry.jpg', true, 3, '"2026-01-02T05:07:56.692Z"', '"2026-01-02T05:07:56.692Z"', false, 114);
INSERT INTO "categories" ("id", "name", "slug", "description", "image_url", "display_on_home", "display_order", "created_at", "updated_at", "is_featured", "product_count") VALUES (16, 'Accessories', 'accessories', 'Electronics Accessories', NULL, false, 1, '"2026-01-03T21:52:50.656Z"', '"2026-01-03T21:52:50.656Z"', false, 0);

