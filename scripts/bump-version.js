import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const VERSION_JSON_FILE = path.join(ROOT_DIR, 'version.json');
const VERSION_TS_FILE = path.join(ROOT_DIR, 'src', 'version.ts');
const TWA_MANIFEST_FILE = path.join(ROOT_DIR, 'twa-manifest.json');
const PACKAGE_JSON_FILE = path.join(ROOT_DIR, 'package.json');

// Argüman kontrolü: 'name' | 'code' | 'both'
const mode = (process.argv[2] || 'both').toLowerCase().trim();

// 1. Mevcut sürümü oku
let currentVersionName = '1.0';
let currentVersionCode = 1;

if (fs.existsSync(VERSION_JSON_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(VERSION_JSON_FILE, 'utf8'));
    if (data.versionName) currentVersionName = data.versionName;
    if (data.versionCode) currentVersionCode = Number(data.versionCode);
  } catch {}
} else if (fs.existsSync(VERSION_TS_FILE)) {
  try {
    const tsContent = fs.readFileSync(VERSION_TS_FILE, 'utf8');
    const nameMatch = tsContent.match(/APP_VERSION\s*=\s*'([^']+)'/);
    const codeMatch = tsContent.match(/APP_VERSION_CODE\s*=\s*(\d+)/);
    if (nameMatch) currentVersionName = nameMatch[1];
    if (codeMatch) currentVersionCode = parseInt(codeMatch[1], 10);
  } catch {}
}

const oldVersionName = currentVersionName;
const oldVersionCode = currentVersionCode;

// 2. Yeni sürüm değerlerini hesapla
let newVersionName = oldVersionName;
let newVersionCode = oldVersionCode;

if (mode === 'code' || mode === 'both') {
  newVersionCode = oldVersionCode + 1;
}

if (mode === 'name' || mode === 'both') {
  if (oldVersionName.includes('.')) {
    const parts = oldVersionName.split('.');
    if (parts.length === 2) {
      const minor = parseInt(parts[1], 10);
      newVersionName = `${parts[0]}.${minor + 1}`;
    } else if (parts.length >= 3) {
      const patch = parseInt(parts[parts.length - 1], 10);
      parts[parts.length - 1] = String(patch + 1);
      newVersionName = parts.join('.');
    } else {
      newVersionName = `${parseFloat(oldVersionName) + 0.1}`;
    }
  } else {
    newVersionName = String(parseInt(oldVersionName, 10) + 1);
  }
}

const todayStr = new Date().toISOString().split('T')[0];

// 3. version.json dosyasını güncelle
const updatedVersionData = {
  versionName: newVersionName,
  versionCode: newVersionCode,
  lastUpdated: todayStr
};
fs.writeFileSync(VERSION_JSON_FILE, JSON.stringify(updatedVersionData, null, 2) + '\n', 'utf8');

// 4. src/version.ts dosyasını güncelle
const versionTsContent = `/**
 * Otomatik sürüm yönetimi dosyası.
 * derle.bat ve scripts/bump-version.js tarafından güncellenir.
 */
export const APP_VERSION = '${newVersionName}';
export const APP_VERSION_CODE = ${newVersionCode};
export const APP_NAME = 'İlan Bulucu';
export const APP_PACKAGE_ID = 'com.ilanbulucu.app';
export const APP_RELEASE_DATE = '${todayStr}';
`;
fs.writeFileSync(VERSION_TS_FILE, versionTsContent, 'utf8');

// 5. twa-manifest.json dosyasını güncelle
if (fs.existsSync(TWA_MANIFEST_FILE)) {
  try {
    const twaManifest = JSON.parse(fs.readFileSync(TWA_MANIFEST_FILE, 'utf8'));
    twaManifest.appVersionName = newVersionName;
    twaManifest.appVersionCode = newVersionCode;
    fs.writeFileSync(TWA_MANIFEST_FILE, JSON.stringify(twaManifest, null, 2) + '\n', 'utf8');
  } catch {}
}

// 6. package.json dosyasını güncelle
if (fs.existsSync(PACKAGE_JSON_FILE)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE, 'utf8'));
    pkg.version = newVersionName;
    fs.writeFileSync(PACKAGE_JSON_FILE, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  } catch {}
}

// 7. android/app/build.gradle dosyasını güncelle
const GRADLE_APP_FILE = path.join(ROOT_DIR, 'android', 'app', 'build.gradle');
if (fs.existsSync(GRADLE_APP_FILE)) {
  try {
    let gradleContent = fs.readFileSync(GRADLE_APP_FILE, 'utf8');
    gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${newVersionCode}`);
    gradleContent = gradleContent.replace(/versionName\s+"[^"]+"/, `versionName "${newVersionName}"`);
    fs.writeFileSync(GRADLE_APP_FILE, gradleContent, 'utf8');
  } catch {}
}

// 8. Bilgilendirme Ciktisi
console.log('============================================================');
console.log('       ILAN BULUCU - ANDROID SURUM GUNCELLEMESI             ');
console.log('============================================================');
console.log(`\n  Islem Modu : [${mode.toUpperCase()}]`);
console.log(`  Eski Surum : versionName "${oldVersionName}" | versionCode ${oldVersionCode}`);
console.log(`  Yeni Surum : versionName "${newVersionName}" | versionCode ${newVersionCode}`);
console.log(`  Tarih      : ${todayStr}`);
console.log('\n  Guncellenen Dosyalar:');
console.log('  [OK] version.json');
console.log('  [OK] src/version.ts');
console.log('  [OK] twa-manifest.json');
console.log('  [OK] package.json');
console.log('  [OK] android/app/build.gradle');
console.log('============================================================');
