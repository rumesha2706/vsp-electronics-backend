-- Table: category_routes
-- Generated: 2026-01-04T10:30:21.082Z


DROP TABLE IF EXISTS "category_routes" CASCADE;
CREATE TABLE "category_routes" (
  "id" integer NOT NULL DEFAULT nextval('category_routes_id_seq'::regclass),
  "category_id" integer NOT NULL,
  "route_url" character varying NOT NULL,
  "route_type" character varying DEFAULT 'category'::character varying,
  "metadata" jsonb,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

 (11 rows)
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (1, 1, '/', 'home', NULL, '"2026-01-02T05:07:58.055Z"', '"2026-01-02T05:07:58.055Z"');
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (2, 2, '/', 'home', NULL, '"2026-01-02T05:07:58.099Z"', '"2026-01-02T05:07:58.099Z"');
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (3, 3, '/', 'home', NULL, '"2026-01-02T05:07:58.143Z"', '"2026-01-02T05:07:58.143Z"');
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (4, 4, '/', 'home', NULL, '"2026-01-02T05:07:58.187Z"', '"2026-01-02T05:07:58.187Z"');
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (5, 5, '/', 'home', NULL, '"2026-01-02T05:07:58.231Z"', '"2026-01-02T05:07:58.231Z"');
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (7, 7, '/', 'home', NULL, '"2026-01-02T05:07:58.321Z"', '"2026-01-02T05:07:58.321Z"');
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (8, 8, '/', 'home', NULL, '"2026-01-02T05:07:58.365Z"', '"2026-01-02T05:07:58.365Z"');
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (9, 9, '/all-categories', 'category', NULL, '"2026-01-02T05:07:58.411Z"', '"2026-01-02T05:07:58.411Z"');
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (10, 10, '/all-categories', 'category', NULL, '"2026-01-02T05:07:58.454Z"', '"2026-01-02T05:07:58.454Z"');
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (11, 11, '/all-categories', 'category', NULL, '"2026-01-02T05:07:58.498Z"', '"2026-01-02T05:07:58.498Z"');
INSERT INTO "category_routes" ("id", "category_id", "route_url", "route_type", "metadata", "created_at", "updated_at") VALUES (12, 12, '/all-categories', 'category', NULL, '"2026-01-02T05:07:58.541Z"', '"2026-01-02T05:07:58.541Z"');

