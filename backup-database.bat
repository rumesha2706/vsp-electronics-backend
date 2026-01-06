@echo off
REM VSP Electronics Database Backup Script
REM Backs up PostgreSQL database to SQL files

setlocal enabledelayedexpansion

REM Configuration
set BACKUP_DIR=sql-exports
set TIMESTAMP=%DATE:~-4%%DATE:~-10,2%%DATE:~-7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOG_FILE=%BACKUP_DIR%\backup_%TIMESTAMP%.log

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo. >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"
echo Database Backup Started: %DATE% %TIME% >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"

REM Run Node.js export script
echo Exporting database... 
echo Exporting database... >> "%LOG_FILE%"
node export-database.js >> "%LOG_FILE%" 2>&1

if errorlevel 1 (
    echo ERROR: Database export failed! >> "%LOG_FILE%"
    goto end
)

REM Copy generated files with timestamp (for archiving, optional)
if exist "%BACKUP_DIR%\00-master-backup.sql" (
    copy "%BACKUP_DIR%\00-master-backup.sql" "%BACKUP_DIR%\master-backup_%TIMESTAMP%.sql" >nul
    echo Master backup saved >> "%LOG_FILE%"
)

REM Summary
echo. >> "%LOG_FILE%"
echo Backup Summary: >> "%LOG_FILE%"
dir /B "%BACKUP_DIR%\*.sql" >> "%LOG_FILE%"

echo. >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"
echo Backup Completed: %DATE% %TIME% >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"

REM Display summary
echo.
echo ========================================
echo Backup Completed!
echo ========================================
echo Log file: %LOG_FILE%
echo Files saved to: %BACKUP_DIR%
echo.
dir /B %BACKUP_DIR%\*.sql

:end
pause
