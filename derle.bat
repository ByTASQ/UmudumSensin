@echo off
setlocal EnableExtensions
title Ilan Bulucu - Android Imzali APK / AAB Derleme ve Surum Yonetimi
cd /d "%~dp0"
if errorlevel 1 goto KLASOR_HATASI

:MENU
cls
set "SURUM_NAME="
set "SURUM_CODE="
for /f "tokens=2 delims='" %%v in ('findstr /C:"APP_VERSION =" "%~dp0src\version.ts" 2^>nul') do set "SURUM_NAME=%%v"
for /f "tokens=2 delims==;" %%c in ('findstr /C:"APP_VERSION_CODE =" "%~dp0src\version.ts" 2^>nul') do (
    for %%x in (%%c) do set "SURUM_CODE=%%x"
)
if not defined SURUM_NAME set "SURUM_NAME=1.0"
if not defined SURUM_CODE set "SURUM_CODE=1"

echo.
echo ============================================================
echo       ILAN BULUCU - ANDROID IMZALI PAKET DERLEYICI
echo ============================================================
echo   Mevcut Surum : v%SURUM_NAME% (Surum Kodu: %SURUM_CODE%)
echo   Paket Kimligi: com.ilanbulucu.app
echo ============================================================
echo.
echo   1. Imzali APK Derle (Dogrudan Telefona Yuklenebilir)
echo   2. Imzali AAB Derle (Google Play Store Yukleme Paketi)
echo   3. Version Name (+1) Yukselt (Orn: 1.0 -^> 1.1)
echo   4. Version Code (+1) Yukselt (Orn: 1 -^> 2)
echo   5. Hem Version Name Hem Code (+1) Yukselt
echo   6. Derleme Dosyalarini Temizle (Clean)
echo   7. Node Modullerini Kur (npm install)
echo   8. JDK 17 Otomatik Kur (winget)
echo   9. Web Projesini Derle (Vite build)
echo   0. Cikis
echo.
set "SECIM="
set /p "SECIM=Seciminiz (1/2/3/4/5/6/7/8/9/0): "
if "%SECIM%"=="1" goto APK_SEC
if "%SECIM%"=="2" goto AAB_SEC
if "%SECIM%"=="3" goto YUKSELT_NAME
if "%SECIM%"=="4" goto YUKSELT_CODE
if "%SECIM%"=="5" goto YUKSELT_HEPSI
if "%SECIM%"=="6" goto TEMIZLE
if "%SECIM%"=="7" goto KURULUM_NPM
if "%SECIM%"=="8" goto KURULUM_JDK
if "%SECIM%"=="9" goto WEB_MANUAL_DERLE
if "%SECIM%"=="0" goto BITIR
echo.
echo Hatali secim. Lutfen listedeki numaralardan birini girin.
pause
goto MENU

:APK_SEC
set "PAKET=APK"
goto HAZIRLIK

:AAB_SEC
set "PAKET=AAB"
goto HAZIRLIK

:YUKSELT_NAME
cls
echo ============================================================
echo   Version Name (+1) yukseltiliyor...
echo ============================================================
echo.
where node >nul 2>nul
if %errorlevel% equ 0 (
    node "%~dp0scripts\bump-version.js" name
) else (
    echo [UYARI] Node.js bulunamadi, PowerShell ile yukseltiliyor...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$vFile = 'version.json'; if (Test-Path $vFile) { $v = Get-Content $vFile -Raw | ConvertFrom-Json } else { $v = @{ versionName = '1.0'; versionCode = 1 } }; $old = $v.versionName; if ($old -match '^(\d+)\.(\d+)$') { $new = $matches[1] + '.' + ([int]$matches[2] + 1) } else { $new = [string]([int]$old + 1) }; $v.versionName = $new; $v | ConvertTo-Json | Set-Content $vFile -Encoding UTF8; Set-Content 'src/version.ts' ('export const APP_VERSION = ''' + $new + ''';`nexport const APP_VERSION_CODE = ' + $v.versionCode + ';`nexport const APP_NAME = ''İlan Bulucu'';`nexport const APP_PACKAGE_ID = ''com.ilanbulucu.app'';`n') -Encoding UTF8; Write-Host ('Yeni versionName: ' + $new)"
)
echo.
pause
goto MENU

:YUKSELT_CODE
cls
echo ============================================================
echo   Version Code (+1) yukseltiliyor...
echo ============================================================
echo.
where node >nul 2>nul
if %errorlevel% equ 0 (
    node "%~dp0scripts\bump-version.js" code
) else (
    echo [UYARI] Node.js bulunamadi, PowerShell ile yukseltiliyor...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$vFile = 'version.json'; if (Test-Path $vFile) { $v = Get-Content $vFile -Raw | ConvertFrom-Json } else { $v = @{ versionName = '1.0'; versionCode = 1 } }; $v.versionCode = [int]$v.versionCode + 1; $v | ConvertTo-Json | Set-Content $vFile -Encoding UTF8; Set-Content 'src/version.ts' ('export const APP_VERSION = ''' + $v.versionName + ''';`nexport const APP_VERSION_CODE = ' + $v.versionCode + ';`nexport const APP_NAME = ''İlan Bulucu'';`nexport const APP_PACKAGE_ID = ''com.ilanbulucu.app'';`n') -Encoding UTF8; Write-Host ('Yeni versionCode: ' + $v.versionCode)"
)
echo.
pause
goto MENU

:YUKSELT_HEPSI
cls
echo ============================================================
echo   Version Name ve Code (+1) birlikte yukseltiliyor...
echo ============================================================
echo.
where node >nul 2>nul
if %errorlevel% equ 0 (
    node "%~dp0scripts\bump-version.js" both
) else (
    echo [UYARI] Node.js bulunamadi, PowerShell ile yukseltiliyor...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$vFile = 'version.json'; if (Test-Path $vFile) { $v = Get-Content $vFile -Raw | ConvertFrom-Json } else { $v = @{ versionName = '1.0'; versionCode = 1 } }; $old = $v.versionName; if ($old -match '^(\d+)\.(\d+)$') { $new = $matches[1] + '.' + ([int]$matches[2] + 1) } else { $new = [string]([int]$old + 1) }; $v.versionName = $new; $v.versionCode = [int]$v.versionCode + 1; $v | ConvertTo-Json | Set-Content $vFile -Encoding UTF8; Set-Content 'src/version.ts' ('export const APP_VERSION = ''' + $new + ''';`nexport const APP_VERSION_CODE = ' + $v.versionCode + ';`nexport const APP_NAME = ''İlan Bulucu'';`nexport const APP_PACKAGE_ID = ''com.ilanbulucu.app'';`n') -Encoding UTF8; Write-Host ('Yeni Surum: v' + $new + ' (Kod: ' + $v.versionCode + ')') -ForegroundColor Green"
)
echo.
pause
goto MENU

:TEMIZLE
cls
echo Derleme dosyalari temizleniyor...
if exist "%~dp0dist" rd /s /q "%~dp0dist" 2>nul
if exist "%~dp0android\app\src\main\assets\public" rd /s /q "%~dp0android\app\src\main\assets\public" 2>nul
if exist "%~dp0android\app\build" rd /s /q "%~dp0android\app\build" 2>nul
if exist "%~dp0android\build" rd /s /q "%~dp0android\build" 2>nul
if exist "%~dp0android\.gradle" rd /s /q "%~dp0android\.gradle" 2>nul
echo.
echo [OK] Tum derleme onbellegi ve cikti dosyalari basariyla temizlendi.
echo.
pause
goto MENU

:KURULUM_NPM
cls
echo npm install calistiriliyor (--legacy-peer-deps)...
call npm install --legacy-peer-deps
if errorlevel 1 call npm install --force
echo.
pause
goto MENU

:KURULUM_JDK
cls
echo.
echo ============================================================
echo   Eclipse Temurin JDK 17 Kuruluyor...
echo ============================================================
echo [*] Android derlemesi icin tam JDK (jlink.exe iceren) indiriliyor...
echo.
winget install EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
    echo.
    echo [*] winget ile kurulum baslatilamadiysa lutfen su adresten indirin:
    echo     https://adoptium.net/temurin/releases/?version=17
) else (
    echo.
    echo [OK] JDK 17 basariyla kuruldu!
)
echo.
pause
goto MENU

:WEB_MANUAL_DERLE
cls
echo ============================================================
echo   Web Uygulamasi Derleniyor (Vite build)...
echo ============================================================
echo.
call npm run build
echo.
pause
goto MENU

:HAZIRLIK
echo.
echo ============================================================
echo   Secilen paket: Imzali %PAKET%
echo ============================================================
echo.

REM ==============================================================
REM Java (JDK) Kontrolu
REM Android Gradle derlemesi icin jlink.exe ZORUNLUDUR!
REM ==============================================================
set "JAVA_HOME="

REM 1. Android Studio jbr / jre
if exist "C:\Program Files\Android\Android Studio\jbr\bin\jlink.exe" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    goto JAVA_BULUNDU
)
if exist "C:\Program Files\Android\Android Studio\jre\bin\jlink.exe" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jre"
    goto JAVA_BULUNDU
)
if exist "%LOCALAPPDATA%\Programs\Android Studio\jbr\bin\jlink.exe" (
    set "JAVA_HOME=%LOCALAPPDATA%\Programs\Android Studio\jbr"
    goto JAVA_BULUNDU
)
if exist "%LOCALAPPDATA%\Programs\Android Studio\jre\bin\jlink.exe" (
    set "JAVA_HOME=%LOCALAPPDATA%\Programs\Android Studio\jre"
    goto JAVA_BULUNDU
)

REM 2. Eclipse Adoptium / Temurin JDK (Kurulan JDK 17 buraya gelir)
for /d %%D in ("C:\Program Files\Eclipse Adoptium\jdk*") do (
    if exist "%%D\bin\jlink.exe" (
        set "JAVA_HOME=%%D"
        goto JAVA_BULUNDU
    )
)

REM 3. Standart Java klasoru (C:\Program Files\Java\jdk*)
for /d %%D in ("C:\Program Files\Java\jdk*") do (
    if exist "%%D\bin\jlink.exe" (
        set "JAVA_HOME=%%D"
        goto JAVA_BULUNDU
    )
)

REM 4. Microsoft OpenJDK
for /d %%D in ("C:\Program Files\Microsoft\jdk*") do (
    if exist "%%D\bin\jlink.exe" (
        set "JAVA_HOME=%%D"
        goto JAVA_BULUNDU
    )
)

REM 5. Amazon Corretto
for /d %%D in ("C:\Program Files\Amazon Corretto\jdk*") do (
    if exist "%%D\bin\jlink.exe" (
        set "JAVA_HOME=%%D"
        goto JAVA_BULUNDU
    )
)

REM 6. Ortam Degiskeni JAVA_HOME
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\jlink.exe" goto JAVA_BULUNDU
)

REM 7. PATH uzerinde jlink.exe var mi?
for /f "delims=" %%J in ('where jlink.exe 2^>nul') do (
    for %%P in ("%%~dpJ\..") do (
        set "JAVA_HOME=%%~fP"
        goto JAVA_BULUNDU
    )
)

goto JAVA_HATA

:JAVA_HATA
echo HATA: Android derlemesi icin uygun tam Java JDK (jlink.exe iceren) bulunamadi.
echo Menuden 8 numarali secenek ile JDK 17 kurabilirsiniz.
goto HATA

:JAVA_BULUNDU
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo [*] Java (JDK) bulundu: %JAVA_HOME%

if defined ANDROID_HOME goto SDK_ENV_VAR
set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
goto SDK_KONTROL

:SDK_ENV_VAR
set "ANDROID_SDK=%ANDROID_HOME%"

:SDK_KONTROL
if not exist "%ANDROID_SDK%\platform-tools" goto SDK_HATA
set "ANDROID_HOME=%ANDROID_SDK%"
set "ANDROID_SDK_ROOT=%ANDROID_SDK%"
set "PATH=%ANDROID_SDK%\platform-tools;%ANDROID_SDK%\cmdline-tools\latest\bin;%PATH%"
echo [*] Android SDK bulundu: %ANDROID_SDK%

if not exist "%~dp0android" goto ANDROID_KLASOR_HATA

REM local.properties dosyasini PowerShell ile yaz
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = '%ANDROID_SDK%'.Replace('\','/'); Set-Content -LiteralPath '%~dp0android\local.properties' -Value ('sdk.dir=' + $p) -Encoding ASCII"
if errorlevel 1 goto LOCALPROP_HATA

if not exist "%~dp0android\gradle.properties" goto GRADLEPROP_OLUSTUR
findstr /C:"android.overridePathCheck=true" "%~dp0android\gradle.properties" >nul 2>&1
if not errorlevel 1 goto KEYSTORE_KONTROL

:GRADLEPROP_OLUSTUR
echo android.overridePathCheck=true>>"%~dp0android\gradle.properties"

:KEYSTORE_KONTROL
REM Google Play Release Keystore Kontrolu
if exist "%~dp0android\app\release.keystore" goto KEYSTORE_VAR
echo.
echo [*] Google Play Release Keystore anahtari bulunamadi.
echo [*] Yeni guvenli release.keystore otomatik olusturuluyor...
"%JAVA_HOME%\bin\keytool.exe" -genkeypair -v -keystore "%~dp0android\app\release.keystore" -alias ilanbulucu -keyalg RSA -keysize 2048 -validity 10950 -storepass ilanbulucu123 -keypass ilanbulucu123 -dname "CN=IlanBulucu, OU=Mobile, O=IlanBulucu, L=Istanbul, ST=Istanbul, C=TR"
if errorlevel 1 goto KEYTOOL_HATA
echo [OK] release.keystore basariyla olusturuldu!

:KEYSTORE_VAR
REM Bagimlilik kontrolu
if exist "%~dp0node_modules\@capacitor\android" goto WEB_DERLEME
echo.
echo Node modulleri kontrol ediliyor (--legacy-peer-deps)...
call npm install --legacy-peer-deps
if errorlevel 1 call npm install --force
if errorlevel 1 goto NPM_HATA

:WEB_DERLEME
REM Web derleme
echo.
echo [1/3] Web uygulamasi derleniyor (Vite build)...
if exist "%~dp0node_modules\vite\bin\vite.js" (
    node "%~dp0node_modules\vite\bin\vite.js" build
) else (
    call npm run build
)
if errorlevel 1 goto WEB_HATA

REM Capacitor senkronizasyonu
echo.
echo [2/3] Android projesi senkronize ediliyor...
if exist "%~dp0android\app\src\main\assets\public" rd /s /q "%~dp0android\app\src\main\assets\public"
call npx cap sync android
if errorlevel 1 goto SYNC_HATA

REM Secime gore release derlemesi
echo.
if /I "%PAKET%"=="APK" goto DERLE_APK
if /I "%PAKET%"=="AAB" goto DERLE_AAB
goto HATA

:DERLE_APK
echo [3/3] Imzali Release APK derleniyor...
cd /d "%~dp0android"
call gradlew.bat assembleRelease
if errorlevel 1 goto GRADLE_HATA
set "CIKTI=%~dp0android\app\build\outputs\apk\release\app-release.apk"
goto KONTROL_CIKTI

:DERLE_AAB
echo [3/3] Imzali Release AAB derleniyor (Google Play)...
cd /d "%~dp0android"
call gradlew.bat bundleRelease
if errorlevel 1 goto GRADLE_HATA
set "CIKTI=%~dp0android\app\build\outputs\bundle\release\app-release.aab"
goto KONTROL_CIKTI

:KONTROL_CIKTI
if exist "%CIKTI%" goto BASARILI
echo.
echo UYARI: Derleme tamamlandi ancak cikti beklenen konumda bulunamadi.
echo Beklenen dosya: %CIKTI%
goto SON

:BASARILI
echo.
echo ============================================================
echo   IMZALI %PAKET% BASARIYLA OLUSTURULDU!
echo ============================================================
echo.
echo Dosya Konumu:
echo %CIKTI%
echo.
explorer /select,"%CIKTI%"
goto SON

:SDK_HATA
echo HATA: Android SDK bulunamadi.
echo Aranan: %ANDROID_SDK%
goto HATA

:ANDROID_KLASOR_HATA
echo HATA: android klasoru bulunamadi. Proje ana dizininde calistirin.
goto HATA

:LOCALPROP_HATA
echo HATA: local.properties dosyasi yazilamadi.
goto HATA

:KEYTOOL_HATA
echo HATA: release.keystore olusturulamadi!
goto HATA

:NPM_HATA
echo HATA: npm install basarisiz!
goto HATA

:WEB_HATA
echo HATA: Web derlemesi basarisiz!
goto HATA

:SYNC_HATA
echo HATA: Capacitor senkronizasyonu basarisiz!
goto HATA

:GRADLE_HATA
echo HATA: Imzali %PAKET% derlemesi basarisiz!
goto HATA

:HATA
echo.
pause
goto MENU

:SON
cd /d "%~dp0"
echo.
pause
goto MENU

:KLASOR_HATASI
echo HATA: BAT dosyasinin klasorune gecilemedi.
pause
exit /b 1

:BITIR
exit /b 0
