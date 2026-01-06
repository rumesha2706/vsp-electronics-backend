# SQL Database Exports - VSP Electronics

Complete database backup with table schemas, data, and procedures.

## 📁 Files Included

### Master Files
- **00-master-backup.sql** (1.19 MB)
  - Complete database backup
  - Contains all DDL (table definitions)
  - Contains all data (INSERT statements)
  - Contains all procedures
  - Use this for full database restore

- **01-schema-ddl.sql** (10 KB)
  - Table definitions only
  - CREATE TABLE statements
  - Column definitions with types and defaults
  - Primary key constraints

- **02-data-inserts.sql** (1.18 MB)
  - All table data as INSERT statements
  - 1,313 total rows across all tables
  - Ready to load into any PostgreSQL database

### Individual Table Files
- **table-[name].sql** (18 files)
  - One file per table
  - Contains both schema and data for that table
  - Useful for selective restoration

## 📊 Database Summary

### Tables Exported (18 total)

| Table | Rows | Purpose |
|-------|------|---------|
| products | 930 | Product catalog |
| brand_category_items | 112 | Brand category items |
| brand_category_mapping | 98 | Brand to category mapping |
| brands | 14 | Brand information |
| featured_brands | 14 | Featured brands |
| categories | 13 | Product categories |
| subcategories | 14 | Category subcategories |
| category_routes | 11 | Category routing |
| brand_categories | 7 | Brand categories |
| featured_categories | 7 | Featured categories |
| email_config | 6 | Email configuration |
| product_images | 6 | Product images |
| users | 2 | User accounts |
| recently_viewed | 19 | Recently viewed products |
| cart_items | 0 | Shopping cart (empty) |
| order_items | 0 | Order items (empty) |
| order_shipping_addresses | 0 | Shipping addresses (empty) |
| orders | 0 | Orders (empty) |

**Total Records: 1,313**

## 🚀 How to Use

### Restore Complete Database

```bash
# Using psql command line
psql -U postgres -d your_database < 00-master-backup.sql

# Or from psql prompt
\i '00-master-backup.sql'
```

### Restore Schema Only

```bash
psql -U postgres -d your_database < 01-schema-ddl.sql
```

### Restore Data Only

```bash
psql -U postgres -d your_database < 02-data-inserts.sql
```

### Restore Single Table

```bash
psql -U postgres -d your_database < table-products.sql
```

### Restore Multiple Tables

```bash
psql -U postgres -d your_database < table-brands.sql
psql -U postgres -d your_database < table-categories.sql
psql -U postgres -d your_database < table-products.sql
```

## 📝 File Format

### Schema Format (DDL)
```sql
-- Table: products
DROP TABLE IF EXISTS "products" CASCADE;
CREATE TABLE "products" (
  "id" integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
  "name" character varying NOT NULL,
  "slug" character varying NOT NULL,
  "description" text,
  "price" numeric,
  "category_id" integer,
  -- ... more columns
);
```

### Data Format (INSERT)
```sql
-- Data for table: products (930 rows)
INSERT INTO "products" ("id", "name", "slug", "price", "category_id", ...) 
VALUES (1, 'Product Name', 'product-name', 99.99, 1, ...);
```

## 🔧 Advanced Usage

### Create New Database and Restore

```bash
# Create empty database
createdb -U postgres new_database

# Restore all data
psql -U postgres -d new_database < 00-master-backup.sql
```

### Backup to Custom Format

```bash
# Custom format (compressed)
pg_dump -U postgres -Fc your_database > backup.dump

# Restore from custom format
pg_restore -U postgres -d your_database backup.dump
```

### Export Specific Tables

```sql
-- Export specific tables only
SELECT * FROM products WHERE category_id = 1;
SELECT * FROM orders WHERE created_at > '2025-01-01';
```

## ⚠️ Important Notes

1. **Database Connection Required**
   - Files are for PostgreSQL 12+
   - Ensure database exists before restoring
   - User needs CREATE TABLE permissions

2. **Data Integrity**
   - Foreign key relationships preserved
   - Sequence auto-increments included
   - Default values and constraints maintained

3. **Procedures & Functions**
   - No stored procedures found in current database
   - Functions can be added separately if needed

4. **Performance**
   - Large data file (1.18 MB) for products
   - Restore may take 1-2 minutes
   - Disable indexes during large restores for speed

## 📋 Table Relationships

```
categories
  ├── subcategories
  ├── brand_category_mapping → brands
  └── category_routes

brands
  ├── brand_categories
  │   └── brand_category_items
  └── featured_brands

products
  ├── product_images
  └── category_id (references categories)

users
  ├── cart_items → products
  ├── orders
  │   └── order_items → products
  └── recently_viewed → products
```

## 🔐 Security Considerations

- No passwords or sensitive credentials in these files
- User data is sample/test data
- Email configurations are templates only
- Safe to version control or share

## 💾 Backup Schedule

To create regular backups:

```bash
# Create backup script (backup.sh)
#!/bin/bash
BACKUP_DIR="./sql-exports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres vsp_electronics > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Run daily via cron
0 2 * * * /path/to/backup.sh
```

## 📞 Troubleshooting

### Import Fails with "Already Exists"
```bash
# Drop and recreate database
dropdb -U postgres vsp_electronics
createdb -U postgres vsp_electronics
psql -U postgres -d vsp_electronics < 00-master-backup.sql
```

### Foreign Key Constraint Errors
```sql
-- Temporarily disable constraints
SET CONSTRAINTS ALL DEFERRED;
-- ... insert data ...
SET CONSTRAINTS ALL IMMEDIATE;
```

### Performance Issues
```sql
-- Increase buffer for faster import
SET work_mem = '256MB';
SET maintenance_work_mem = '1GB';
-- Then run import
```

## 📈 Statistics

- **Export Date**: 2026-01-04
- **Database**: vsp_electronics (Aiven Cloud)
- **Total Size**: ~2.4 MB (uncompressed)
- **Format**: PostgreSQL SQL dump
- **Compatibility**: PostgreSQL 12+

## 🔄 Version Control

These SQL files should be:
- ✅ Committed to Git for version history
- ✅ Backed up regularly to cloud storage
- ✅ Stored alongside application code
- ⚠️ Never expose database URL in files
- ⚠️ Never include user passwords

## Next Steps

1. **Create daily backups** using the script provided
2. **Store in version control** (commit to Git)
3. **Archive to cloud storage** (S3, Google Drive, etc.)
4. **Document schema changes** when updating database
5. **Test restore process** monthly to verify integrity

---

**Generated**: 2026-01-04
**Database**: vsp_electronics
**Export Tool**: Node.js pg module
