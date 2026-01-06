-- Table: subcategories
-- Generated: 2026-01-04T10:30:21.105Z


DROP TABLE IF EXISTS "subcategories" CASCADE;
CREATE TABLE "subcategories" (
  "id" integer NOT NULL DEFAULT nextval('subcategories_id_seq'::regclass),
  "category_id" integer NOT NULL,
  "name" character varying NOT NULL,
  "slug" character varying NOT NULL,
  "description" text,
  "image_url" text,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "product_url" text
);

 (14 rows)
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (2, 8, 'AM Robotics', 'am-robotics', NULL, NULL, 0, '"2026-01-02T05:07:57.182Z"', '"2026-01-02T05:07:57.182Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (3, 8, 'Ace Bott Kits', 'ace-bott-kits', NULL, NULL, 0, '"2026-01-02T05:07:57.225Z"', '"2026-01-02T05:07:57.225Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (4, 8, 'JSB DIY Kits', 'jsb-diy-kits', NULL, NULL, 0, '"2026-01-02T05:07:57.271Z"', '"2026-01-02T05:07:57.271Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (5, 8, 'Robotic DIY Kits', 'robotic-diy-kits-sub', NULL, NULL, 0, '"2026-01-02T05:07:57.316Z"', '"2026-01-02T05:07:57.316Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (6, 8, 'DB OLO Kits', 'dbolo-kits', NULL, NULL, 0, '"2026-01-02T05:07:57.358Z"', '"2026-01-02T05:07:57.358Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (7, 8, 'Mini Drone Kits Below 20cms', 'mini-drone-kits-below-20cms-sub', NULL, NULL, 0, '"2026-01-02T05:07:57.403Z"', '"2026-01-02T05:07:57.403Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (1, 3, 'RPI Accessories', 'rpi-accessories', 'Accessories for Raspberry Pi', '/assets/images/categories/raspberry-pi.jpg', 1, '"2026-01-02T05:07:57.130Z"', '"2026-01-02T05:07:57.130Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (9, 16, 'Connectors', 'connectors', NULL, '/assets/images/categories/connectors.jpg', 1, '"2026-01-03T21:52:50.854Z"', '"2026-01-04T04:23:13.179Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (10, 16, 'DIP Converters', 'dip-converters', NULL, '/assets/images/categories/DIP Converters.jpg', 2, '"2026-01-03T21:52:50.966Z"', '"2026-01-04T04:25:02.899Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (11, 16, 'IOT', 'iot', NULL, '/assets/images/categories/IOT.jpg', 3, '"2026-01-03T21:52:51.054Z"', '"2026-01-04T04:39:07.679Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (12, 16, 'Keypad', 'keypad', NULL, '/assets/images/categories/Keypad.jpg', 4, '"2026-01-03T21:52:51.141Z"', '"2026-01-04T04:39:21.118Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (13, 16, 'Silicone Wires', 'silicone-wires', NULL, '/assets/images/categories/Silicone Wires.jpg', 5, '"2026-01-03T21:52:51.226Z"', '"2026-01-04T04:39:34.352Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (14, 16, 'Twezzers', 'twezzers', NULL, '/assets/images/categories/Twezzers.jpg', 6, '"2026-01-03T21:52:51.313Z"', '"2026-01-04T04:39:47.991Z"', NULL);
INSERT INTO "subcategories" ("id", "category_id", "name", "slug", "description", "image_url", "display_order", "created_at", "updated_at", "product_url") VALUES (15, 16, 'USB Cables', 'usb-cables', NULL, '/assets/images/categories/USB Cables.jpg', 7, '"2026-01-03T21:52:51.408Z"', '"2026-01-04T04:39:59.351Z"', NULL);

