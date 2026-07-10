@echo off
cd /d "%~dp0"
echo === Step 1: Remove stale git lock files ===
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\ORIG_HEAD.lock" del /f ".git\ORIG_HEAD.lock"
if exist ".git\objects\maintenance.lock" del /f ".git\objects\maintenance.lock"

echo === Step 2: Remove desktop.ini junk corrupting .git ===
del /f /s /q /a ".git\desktop.ini" >nul 2>&1

echo === Step 3: Remove old inaccessible remote, track origin ===
git remote remove remedypills-upstream 2>nul
git branch --set-upstream-to=origin/main main

echo === Step 4: Commit local changes ===
git add -A
git commit -m "Fix production meta tags, add Play Store listing assets, archive unused dev files"

echo === Step 5: Pull latest from GitHub and push ===
git pull origin main --no-rebase --no-edit
git push origin main

echo.
echo ================================
echo  DONE - check above for errors
echo ================================
git status
pause
