-- Table: recently_viewed
-- Generated: 2026-01-04T10:30:21.104Z


DROP TABLE IF EXISTS "recently_viewed" CASCADE;
CREATE TABLE "recently_viewed" (
  "id" integer NOT NULL DEFAULT nextval('recently_viewed_id_seq'::regclass),
  "user_id" character varying NOT NULL,
  "product_id" integer NOT NULL,
  "viewed_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

 (20 rows)
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (71, 'user_1767357458129_4ea85m8bb', 60, '"2026-01-02T07:08:37.203Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (6, 'user_1767275134263_fqvfum6y8', 193, '"2026-01-01T11:28:04.114Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (72, 'user_1767275134263_fqvfum6y8', 893, '"2026-01-02T08:31:01.408Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (74, 'user_1767275134263_fqvfum6y8', 700, '"2026-01-02T08:38:29.204Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (75, 'user_1767275134263_fqvfum6y8', 891, '"2026-01-02T08:51:45.980Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (78, 'user_1767275134263_fqvfum6y8', 840, '"2026-01-02T11:41:36.104Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (16, 'user_1767328226976_ems845j86', 29, '"2026-01-01T23:00:27.407Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (15, 'user_1767328121484_mtka0kbis', 29, '"2026-01-01T23:00:44.730Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (77, 'user_1767275134263_fqvfum6y8', 1031, '"2026-01-02T11:46:04.621Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (84, 'user_1767453919087_aza8zbpni', 1223, '"2026-01-04T04:31:50.701Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (34, 'user_1767275134263_fqvfum6y8', 60, '"2026-01-02T00:20:41.304Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (30, 'user_1767329392903_og1vwwh5u', 29, '"2026-01-02T00:23:05.469Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (35, 'user_1767275134263_fqvfum6y8', 422, '"2026-01-02T00:23:12.317Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (51, 'user_1767329392903_og1vwwh5u', 422, '"2026-01-02T00:23:13.290Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (8, 'user_1767275134263_fqvfum6y8', 29, '"2026-01-02T00:30:46.920Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (7, 'user_1767275134263_fqvfum6y8', 41, '"2026-01-02T00:35:48.694Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (59, 'user_1767275134263_fqvfum6y8', 255, '"2026-01-02T00:43:41.584Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (66, 'user_1767334250803_jtqe4hsel', 32, '"2026-01-02T00:44:52.801Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (67, 'user_1767334250803_jtqe4hsel', 423, '"2026-01-02T03:36:56.100Z"');
INSERT INTO "recently_viewed" ("id", "user_id", "product_id", "viewed_at") VALUES (69, 'user_1767334250803_jtqe4hsel', 61, '"2026-01-02T03:37:03.557Z"');

