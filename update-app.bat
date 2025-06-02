@echo off
echo Building Next.js application...
npm run build

echo Fixing CSP headers...
node fix-csp.js

echo Copying files to Electron app...
xcopy /E /Y "out\*" "dist\win-unpacked\resources\app\out\" >nul 2>&1
copy /Y "main.js" "dist\win-unpacked\resources\app\main.js" >nul 2>&1
copy /Y "preload.js" "dist\win-unpacked\resources\app\preload.js" >nul 2>&1

echo Starting application...
start "" "dist\win-unpacked\My Admin.exe"

echo Done! 