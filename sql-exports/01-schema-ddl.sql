-- Table: brand_categories
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

-- Table: brand_category_items
DROP TABLE IF EXISTS "brand_category_items" CASCADE;
CREATE TABLE "brand_category_items" (
  "id" integer NOT NULL DEFAULT nextval('brand_category_items_id_seq'::regclass),
  "brand_category_id" integer NOT NULL,
  "name" character varying NOT NULL,
  "slug" character varying NOT NULL,
  "description" text,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

-- Table: brand_category_mapping
DROP TABLE IF EXISTS "brand_category_mapping" CASCADE;
CREATE TABLE "brand_category_mapping" (
  "id" integer NOT NULL DEFAULT nextval('brand_category_mapping_id_seq'::regclass),
  "brand_id" integer NOT NULL,
  "category_id" integer NOT NULL,
  "created_at" timestamp without time zone DEFAULT now()
);

-- Table: brands
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

-- Table: cart_items
DROP TABLE IF EXISTS "cart_items" CASCADE;
CREATE TABLE "cart_items" (
  "id" integer NOT NULL DEFAULT nextval('cart_items_id_seq'::regclass),
  "user_id" integer NOT NULL,
  "product_id" integer NOT NULL,
  "quantity" integer NOT NULL DEFAULT 1,
  "price_at_add" numeric,
  "added_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

-- Table: categories
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

-- Table: category_routes
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

-- Table: email_config
DROP TABLE IF EXISTS "email_config" CASCADE;
CREATE TABLE "email_config" (
  "id" integer NOT NULL DEFAULT nextval('email_config_id_seq'::regclass),
  "config_key" character varying NOT NULL,
  "config_value" text NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

-- Table: featured_brands
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

-- Table: featured_categories
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

-- Table: order_items
DROP TABLE IF EXISTS "order_items" CASCADE;
CREATE TABLE "order_items" (
  "id" integer NOT NULL DEFAULT nextval('order_items_id_seq'::regclass),
  "order_id" integer NOT NULL,
  "product_id" integer NOT NULL,
  "product_name" character varying,
  "product_image" character varying,
  "quantity" integer NOT NULL,
  "price_per_item" numeric NOT NULL,
  "item_total" numeric NOT NULL,
  "created_at" timestamp without time zone DEFAULT now()
);

-- Table: order_shipping_addresses
DROP TABLE IF EXISTS "order_shipping_addresses" CASCADE;
CREATE TABLE "order_shipping_addresses" (
  "id" integer NOT NULL DEFAULT nextval('order_shipping_addresses_id_seq'::regclass),
  "order_id" integer NOT NULL,
  "first_name" character varying,
  "last_name" character varying,
  "email" character varying,
  "phone" character varying,
  "address" character varying,
  "city" character varying,
  "state" character varying,
  "zip_code" character varying,
  "country" character varying,
  "created_at" timestamp without time zone DEFAULT now()
);

-- Table: orders
DROP TABLE IF EXISTS "orders" CASCADE;
CREATE TABLE "orders" (
  "id" integer NOT NULL DEFAULT nextval('orders_id_seq'::regclass),
  "user_id" integer NOT NULL,
  "order_number" character varying NOT NULL,
  "status" character varying DEFAULT 'pending'::character varying,
  "subtotal" numeric NOT NULL,
  "tax" numeric NOT NULL,
  "shipping" numeric NOT NULL,
  "total" numeric NOT NULL,
  "payment_method" character varying,
  "payment_status" character varying DEFAULT 'pending'::character varying,
  "notes" text,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

-- Table: product_images
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

-- Table: products
DROP TABLE IF EXISTS "products" CASCADE;
CREATE TABLE "products" (
  "id" integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  "name" text NOT NULL,
  "price" numeric DEFAULT 0,
  "original_price" numeric,
  "category" text,
  "brand" text,
  "rating" numeric,
  "in_stock" boolean DEFAULT true,
  "is_hot" boolean DEFAULT false,
  "is_new" boolean DEFAULT false,
  "image" text,
  "description" text,
  "product_url" text,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "slug" text,
  "metadata" jsonb,
  "sku" character varying,
  "subcategory" character varying,
  "is_featured" boolean DEFAULT false,
  "subcategory_id" integer
);

-- Table: recently_viewed
DROP TABLE IF EXISTS "recently_viewed" CASCADE;
CREATE TABLE "recently_viewed" (
  "id" integer NOT NULL DEFAULT nextval('recently_viewed_id_seq'::regclass),
  "user_id" character varying NOT NULL,
  "product_id" integer NOT NULL,
  "viewed_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Table: subcategories
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

-- Table: users
DROP TABLE IF EXISTS "users" CASCADE;
CREATE TABLE "users" (
  "id" integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "email" character varying NOT NULL,
  "password_hash" character varying,
  "first_name" character varying,
  "last_name" character varying,
  "phone" character varying,
  "company" character varying,
  "address" text,
  "city" character varying,
  "state" character varying,
  "zip_code" character varying,
  "country" character varying,
  "is_verified" boolean DEFAULT false,
  "email_verified_at" timestamp without time zone,
  "verification_token" character varying,
  "verification_token_expires" timestamp without time zone,
  "reset_token" character varying,
  "reset_token_expires" timestamp without time zone,
  "is_active" boolean DEFAULT true,
  "oauth_provider" character varying,
  "oauth_id" character varying,
  "profile_picture" text,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "role" character varying DEFAULT 'user'::character varying
);

