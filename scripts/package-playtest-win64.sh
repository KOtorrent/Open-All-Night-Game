#!/usr/bin/env bash
# Builds the current production Vite bundle and packages it into a portable Windows x64 Electron
# playtest build. Does NOT touch gameplay/graphics code - only stages the existing dist/ output
# into electron/dist/ and wraps it in a desktop shell (electron/main.js).
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
COMMIT="$(git rev-parse --short=12 HEAD)"
APP_NAME="Open All Night"
OUT_DIR="release"
STAGE_DIR="$OUT_DIR/${APP_NAME}-win32-x64"
FINAL_DIR="$OUT_DIR/${APP_NAME}"
ZIP_NAME="OPEN_ALL_NIGHT_PLAYTEST_WIN64.zip"

echo "== [1/6] npm ci =="
npm ci

echo "== [2/6] npm run build =="
npm run build

echo "== [3/6] staging electron app (dist -> electron/dist) =="
rm -rf electron/dist
cp -r dist electron/dist

echo "== [4/6] electron-packager (win32/x64) =="
rm -rf "$OUT_DIR"
# appVersion/buildVersion/win32metadata/icon all require Wine (to run rcedit.exe against the
# packaged exe) - this container's Wine install lacks working 32-bit (i386) library support, which
# rcedit needs, and chasing that dependency chain further isn't worth delaying a playable build
# over exe resource metadata. Omitting those flags entirely means electron-packager never invokes
# rcedit/Wine at all - the .exe still launches and runs identically, it just carries Electron's own
# default file properties instead of custom ones. Documented as a known packaging limitation.
npx electron-packager electron "$APP_NAME" \
  --platform=win32 \
  --arch=x64 \
  --out="$OUT_DIR" \
  --overwrite

echo "== [5/6] adding playtest docs + dev launcher =="
mv "$STAGE_DIR" "$FINAL_DIR"
sed "s/{{COMMIT}}/${COMMIT}/" packaging/README_PLAYTEST.txt > "$FINAL_DIR/README_PLAYTEST.txt"
cp packaging/PLAYTEST_NOTES_TEMPLATE.txt "$FINAL_DIR/PLAYTEST_NOTES_TEMPLATE.txt"
# Windows batch file, CRLF line endings.
printf '@echo off\r\nstart "" "%%~dp0Open All Night.exe" --dev\r\n' > "$FINAL_DIR/OPEN_ALL_NIGHT_DEV.bat"

echo "== [6/6] zipping =="
( cd "$OUT_DIR" && zip -r -q "../$ZIP_NAME" "${APP_NAME}" )

echo "== done =="
ls -la "$ZIP_NAME"
du -sh "$FINAL_DIR"
