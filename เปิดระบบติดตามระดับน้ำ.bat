@echo off
chcp 65001 >nul
title ระบบติดตามระดับน้ำและปริมาณฝน จังหวัดนครพนม
echo ========================================================
echo   ระบบติดตามระดับน้ำและปริมาณฝน จังหวัดนครพนม
echo ========================================================
echo.
echo กำลังเปิดหน้าเว็บไซต์ในเว็บเบราว์เซอร์ของคุณ...
echo http://localhost:3000
echo.

start http://localhost:3000

echo หากยังไม่ได้เปิดเซิร์ฟเวอร์ ระบบจะเริ่มทำงานให้โดยอัตโนมัติ...
echo.

if exist "%USERPROFILE%\.bun\bin\bun.exe" (
    "%USERPROFILE%\.bun\bin\bun.exe" run server.ts
) else (
    npm run dev
)

pause
