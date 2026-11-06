# Build APK / AAB

Prasyarat: Android Studio (Narwhal/Otter atau lebih baru) dengan JDK 17 dan Android SDK Platform 36.

1. Buka folder proyek ini di Android Studio. Android Studio mengunduh Gradle 8.13 sesuai `gradle/wrapper/gradle-wrapper.properties`. (`gradle-wrapper.jar` dan `gradlew` tidak disertakan; buat dengan `gradle wrapper` bila ingin build lewat terminal.)
2. Sync, lalu **Build > Build APK(s)** atau `./gradlew assembleDebug`.
   Hasil: `app/build/outputs/apk/debug/app-debug.apk` (applicationId `com.ageofpixelwar.game.debug`).
3. Rilis Play Store:
   - Buat keystore, salin `keystore.properties.example` menjadi `keystore.properties`, isi.
   - `./gradlew bundleRelease` menghasilkan `.aab` untuk Play Console.
   - Per 31 Agu 2026 Google Play mewajibkan `targetSdk 36` (sudah diatur). compileSdk 36 butuh AGP minimal 8.9.1 (dipakai 8.13.0).

## Uji web tanpa Android

```
python3 -m http.server 8000 --directory app/src/main/assets/www
node tools/smoke_test.mjs http://localhost:8000/index.html
```
Atau buka `index.html` langsung dengan Chrome. Pakai jendela landscape.

## Log

`adb logcat -s AgeOfPixelWarJS` menampilkan console.log/error dari game.

## Build lewat GitHub Actions

Push ke GitHub, buka tab **Actions** > **Build APK** > run terbaru > bagian **Artifacts** > `AgeOfPixelWar-debug-apk`. Unduh, ekstrak zip-nya, lalu pasang `app-debug.apk` di ponsel (izinkan install dari sumber tidak dikenal).
