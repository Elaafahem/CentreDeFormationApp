@echo off
REM Script de Backup SQL pour Training Center App
REM Usage: backup.bat

set TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=backup_training_db_%TIMESTAMP%.sql
set CONTAINER_NAME=training-mysql
set DB_NAME=training_db
set DB_USER=training_user
set DB_PASS=training_password

echo [INFO] Demarrage du backup de la base de donnees...
echo [INFO] Conteneur: %CONTAINER_NAME%
echo [INFO] Fichier: %BACKUP_FILE%

docker exec %CONTAINER_NAME% /usr/bin/mysqldump -u %DB_USER% --password=%DB_PASS% %DB_NAME% > %BACKUP_FILE%

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Backup termine avec succes : %BACKUP_FILE%
) else (
    echo [ERROR] Echec du backup via Docker. Assurez-vous que le conteneur tourne.
)
pause
