#!/bin/bash

# VSP Electronics Database Backup Script
# Backs up PostgreSQL database to SQL files daily

set -e

# Configuration
DB_CONNECTION_STRING="${DATABASE_URL}"
BACKUP_DIR="./sql-exports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup_$TIMESTAMP.log"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "========================================" | tee -a "$LOG_FILE"
echo "Database Backup Started: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Run Node.js export script
echo "Exporting database..." | tee -a "$LOG_FILE"
node export-database.js >> "$LOG_FILE" 2>&1

# Rename files with timestamp for archiving
if [ -f "$BACKUP_DIR/00-master-backup.sql" ]; then
    mv "$BACKUP_DIR/00-master-backup.sql" "$BACKUP_DIR/master-backup_$TIMESTAMP.sql"
    echo "✓ Master backup: master-backup_$TIMESTAMP.sql" | tee -a "$LOG_FILE"
fi

if [ -f "$BACKUP_DIR/01-schema-ddl.sql" ]; then
    mv "$BACKUP_DIR/01-schema-ddl.sql" "$BACKUP_DIR/schema-ddl_$TIMESTAMP.sql"
    echo "✓ Schema backup: schema-ddl_$TIMESTAMP.sql" | tee -a "$LOG_FILE"
fi

if [ -f "$BACKUP_DIR/02-data-inserts.sql" ]; then
    mv "$BACKUP_DIR/02-data-inserts.sql" "$BACKUP_DIR/data-inserts_$TIMESTAMP.sql"
    echo "✓ Data backup: data-inserts_$TIMESTAMP.sql" | tee -a "$LOG_FILE"
fi

# Compress backup files
echo "Compressing backups..." | tee -a "$LOG_FILE"
gzip "$BACKUP_DIR/master-backup_$TIMESTAMP.sql" 2>/dev/null || true
gzip "$BACKUP_DIR/schema-ddl_$TIMESTAMP.sql" 2>/dev/null || true
gzip "$BACKUP_DIR/data-inserts_$TIMESTAMP.sql" 2>/dev/null || true

# Keep only last 30 days of backups
echo "Cleaning old backups..." | tee -a "$LOG_FILE"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

# Summary
echo "" | tee -a "$LOG_FILE"
echo "Backup Summary:" | tee -a "$LOG_FILE"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -3 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Backup Completed: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Email notification (optional)
# mail -s "Database Backup Complete" admin@example.com < "$LOG_FILE"

exit 0
