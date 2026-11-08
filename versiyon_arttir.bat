@echo off
title Ilan Bulucu - Android Versiyon Artirici
cd /d "%~dp0"

echo ============================================================
echo        ILAN BULUCU - ANDROID SURUM ARTIRMA ARACI
echo ============================================================
echo.

:: 1. Node.js kontrolu
where node >nul 2>nul
if %errorlevel% equ 0 (
    node scripts/bump-version.js
    goto :SON
)

:: 2. Eger Node.js yoksa, Windows'un yerlesik PowerShell motorunu kullan
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$vFile = 'version.json'; " ^
    "$twaFile = 'twa-manifest.json'; " ^
    "$pkgFile = 'package.json'; " ^
    "if (Test-Path $vFile) { $v = Get-Content $vFile -Raw | ConvertFrom-Json } else { $v = @{ versionName = '1.0'; versionCode = 1 } }; " ^
    "$oldName = $v.versionName; " ^
    "$oldCode = [int]$v.versionCode; " ^
    "$newCode = $oldCode + 1; " ^
    "if ($oldName -match '^(\d+)\.(\d+)$') { $newName = $matches[1] + '.' + ([int]$matches[2] + 1) } " ^
    "elseif ($oldName -match '^(\d+)\.(\d+)\.(\d+)$') { $newName = $matches[1] + '.' + $matches[2] + '.' + ([int]$matches[3] + 1) } " ^
    "else { $newName = [string]([int]$oldName + 1) }; " ^
    "$today = (Get-Date).ToString('yyyy-MM-dd'); " ^
    "$v.versionName = $newName; $v.versionCode = $newCode; $v.lastUpdated = $today; " ^
    "$v | ConvertTo-Json -Depth 5 | Set-Content $vFile -Encoding UTF8; " ^
    "if (Test-Path $twaFile) { $t = Get-Content $twaFile -Raw | ConvertFrom-Json; $t.appVersionName = $newName; $t.appVersionCode = $newCode; $t | ConvertTo-Json -Depth 10 | Set-Content $twaFile -Encoding UTF8 }; " ^
    "if (Test-Path $pkgFile) { $p = Get-Content $pkgFile -Raw | ConvertFrom-Json; $p.version = $newName; $p | ConvertTo-Json -Depth 10 | Set-Content $pkgFile -Encoding UTF8 }; " ^
    "Write-Host '  Eski Surum : versionName \"'$oldName'\" | versionCode '$oldCode; " ^
    "Write-Host '  Yeni Surum : versionName \"'$newName'\" | versionCode '$newCode'  (+1 ARTTIRILDI)' -ForegroundColor Green; " ^
    "Write-Host '  Tarih      : '$today; " ^
    "Write-Host ''; " ^
    "Write-Host '  Guncellenen Dosyalar:' -ForegroundColor Cyan; " ^
    "Write-Host '  [OK] version.json'; " ^
    "Write-Host '  [OK] twa-manifest.json (Google Play TWA)'; " ^
    "Write-Host '  [OK] package.json'; " ^
    "Write-Host '============================================================'; "

:SON
echo.
pause
