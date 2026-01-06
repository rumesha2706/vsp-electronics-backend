-- Table: brand_category_mapping
-- Generated: 2026-01-04T10:30:21.076Z


DROP TABLE IF EXISTS "brand_category_mapping" CASCADE;
CREATE TABLE "brand_category_mapping" (
  "id" integer NOT NULL DEFAULT nextval('brand_category_mapping_id_seq'::regclass),
  "brand_id" integer NOT NULL,
  "category_id" integer NOT NULL,
  "created_at" timestamp without time zone DEFAULT now()
);

 (98 rows)
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (1, 7, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (2, 4, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (3, 10, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (4, 9, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (5, 1, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (6, 4, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (7, 9, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (8, 14, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (9, 7, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (10, 5, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (11, 2, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (12, 11, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (13, 6, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (14, 5, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (15, 14, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (16, 5, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (17, 12, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (18, 9, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (19, 3, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (20, 13, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (21, 2, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (22, 5, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (23, 1, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (24, 2, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (25, 8, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (26, 3, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (27, 10, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (28, 4, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (29, 13, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (30, 13, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (31, 8, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (32, 3, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (33, 1, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (34, 12, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (35, 1, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (36, 7, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (37, 11, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (38, 5, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (39, 1, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (40, 6, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (41, 7, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (42, 11, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (43, 4, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (44, 2, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (45, 10, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (46, 3, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (47, 14, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (48, 9, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (49, 7, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (50, 9, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (51, 7, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (52, 7, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (53, 6, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (54, 4, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (55, 10, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (56, 12, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (57, 14, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (58, 11, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (59, 4, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (60, 12, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (61, 11, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (62, 14, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (63, 10, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (64, 3, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (65, 3, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (66, 11, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (67, 6, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (68, 8, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (69, 2, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (70, 5, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (71, 9, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (72, 3, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (73, 11, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (74, 6, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (75, 13, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (76, 12, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (77, 8, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (78, 5, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (79, 12, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (80, 13, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (81, 6, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (82, 9, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (83, 13, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (84, 2, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (85, 8, 1, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (86, 10, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (87, 8, 3, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (88, 8, 5, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (89, 14, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (90, 13, 2, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (91, 10, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (92, 1, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (93, 1, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (94, 2, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (95, 6, 6, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (96, 14, 7, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (97, 12, 4, '"2026-01-03T21:58:38.690Z"');
INSERT INTO "brand_category_mapping" ("id", "brand_id", "category_id", "created_at") VALUES (98, 4, 6, '"2026-01-03T21:58:38.690Z"');

