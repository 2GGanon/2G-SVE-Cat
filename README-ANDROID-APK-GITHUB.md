# Android APK Export (GitHub-Ready)

This folder is ready to upload as a GitHub repository (or as an `app/` folder in your repo) and produce an installable Android APK.

## What this includes
- Flutter wrapper app (`lib/main.dart`) using a WebView.
- Your bundled web app in `assets/www`.
- GitHub Action at `.github/workflows/android-apk.yml` to build `app-release.apk`.
- Embedded card data at `assets/www/data/cards-data.js` so Android WebView can load cards without local `fetch()` failures.

## Fastest path (no local build needed)
1. Upload this folder to a GitHub repository.
2. In GitHub: **Actions** -> **Build Android APK** -> **Run workflow**.
3. Wait for success, then open the workflow run.
4. Download artifact `sve-catalogue-apk`.
5. Transfer `app-release.apk` to your Android phone.
6. On phone: allow install from unknown apps for your file manager/browser, then install.

## Notes
- This build uses `flutter create --platforms=android .` in CI, so no pre-generated `android/` folder is required.
- This offline variant uses bundled local card art files.
- CI enforces a stable package id and increasing version code for update installs:
  - `applicationId`: `com.twogganon.ggcatalogue`
  - `versionCode`: GitHub run number
  - `versionName`: `1.0.<run_number>`
- CI signs APKs with your release key so newer APKs can install over older ones (no uninstall required), as long as you keep using the same keystore.

## Required GitHub Secrets (for updateable APK installs)
Add these in **GitHub -> Settings -> Secrets and variables -> Actions -> New repository secret**:

1. `ANDROID_KEYSTORE_BASE64`
- Base64 of your `.jks` release keystore file.

2. `ANDROID_KEYSTORE_PASSWORD`
- Password for the keystore.

3. `ANDROID_KEY_ALIAS`
- Alias name of the key in the keystore.

4. `ANDROID_KEY_PASSWORD`
- Password for the alias key.

### Create base64 for keystore (PowerShell)
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\release-keystore.jks")) | Set-Clipboard
```
Paste clipboard content into `ANDROID_KEYSTORE_BASE64`.

## Optional: GitHub Release download link
If you run this workflow from a Git tag, it can attach the APK to a GitHub Release.
Example release URL pattern:
`https://github.com/<USER>/<REPO>/releases`
