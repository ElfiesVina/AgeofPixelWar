# Struktur proyek

```
PixelEmpiresIII-Pocket/
├── app/  # Modul aplikasi
│   ├── src/  # Source
│   │   └── main/  # Source set utama
│   │       ├── assets/  # Aset yang dibundel ke APK
│   │       │   └── www/  # Aplikasi web (game)
│   │       │       ├── css/  # Gaya
│   │       │       │   ├── app.css  # Override tipis shell WebView
│   │       │       │   └── tailwind.generated.css  # Tailwind hasil generate (jangan diedit)
│   │       │       ├── js/  # JavaScript
│   │       │       │   ├── core/  # Inti
│   │       │       │   │   └── react-bindings.js  # React, ReactDOM, jsx/jsxs
│   │       │       │   ├── game/  # Data & aturan permainan
│   │       │       │   │   ├── data/  # Tabel data
│   │       │       │   │   │   ├── buildings.js  # 8 bangunan
│   │       │       │   │   │   ├── nations.js  # Data 8 bangsa
│   │       │       │   │   │   └── units.js  # 6 unit
│   │       │       │   │   ├── constants.js  # Ukuran tile isometrik
│   │       │       │   │   └── nations.js  # Helper getNation()
│   │       │       │   ├── ui/  # Antarmuka React
│   │       │       │   │   ├── game/  # HUD + engine permainan
│   │       │       │   │   │   ├── BuildBar.js  # Bar bangunan
│   │       │       │   │   │   ├── BuildModeBanner.js  # Banner mode bangun
│   │       │       │   │   │   ├── DiplomacyPanel.js  # Daftar lawan/sekutu
│   │       │       │   │   │   ├── GameKeyframes.js  # Keyframes animasi
│   │       │       │   │   │   ├── GameOverModal.js  # Overlay menang/kalah
│   │       │       │   │   │   ├── GameScreen.js  # Engine game + komposisi HUD
│   │       │       │   │   │   ├── Minimap.js  # Minimap
│   │       │       │   │   │   ├── SelectionPanel.js  # Panel pilihan/latih/gather
│   │       │       │   │   │   ├── SidePanel.js  # Panel kanan
│   │       │       │   │   │   └── TopBar.js  # HUD atas
│   │       │       │   │   ├── lobby/  # Layar lobi
│   │       │       │   │   │   └── LobbyScreen.js  # Pilih bangsa, lawan, tim, kesulitan
│   │       │       │   │   └── App.js  # Root, overlay rotasi
│   │       │       │   ├── vendor/  # Pustaka pihak ketiga
│   │       │       │   │   └── react-bundle.js  # React + ReactDOM (minify)
│   │       │       │   └── main.js  # Mount React ke #root
│   │       │       └── index.html  # Halaman utama, urutan skrip
│   │       ├── java/  # Kode Java
│   │       │   └── com/
│   │       │       └── pixelempires/
│   │       │           └── pocket/  # Paket com.ageofpixelwar.game
│   │       │               ├── AppConfig.java  # Host & URL awal
│   │       │               ├── GameWebChromeClient.java  # Console JS ke Logcat
│   │       │               ├── GameWebViewClient.java  # Layani aset lokal, blokir navigasi luar
│   │       │               ├── MainActivity.java  # WebView layar penuh, pengaturan aman
│   │       │               └── SystemUi.java  # Mode imersif
│   │       ├── res/  # Resource Android
│   │       │   ├── drawable/  # Ikon vektor
│   │       │   │   └── ic_launcher_foreground.xml  # Ikon piksel Town Center
│   │       │   ├── mipmap-anydpi-v26/  # Ikon adaptif
│   │       │   │   ├── ic_launcher.xml  # Ikon adaptif
│   │       │   │   └── ic_launcher_round.xml  # Ikon adaptif (bulat)
│   │       │   ├── values/  # string, warna, tema
│   │       │   │   ├── colors.xml  # Warna
│   │       │   │   ├── strings.xml  # Nama aplikasi
│   │       │   │   └── themes.xml  # Tema fullscreen
│   │       │   ├── values-v28/  # Tema + mode poni (API 28+)
│   │       │   │   └── themes.xml  # Tema fullscreen
│   │       │   └── xml/  # Network security config
│   │       │       └── network_security_config.xml  # Larang cleartext
│   │       └── AndroidManifest.xml  # Activity landscape, tanpa INTERNET
│   ├── .gitignore  # Abaikan build/keystore
│   ├── build.gradle.kts  # Plugin tingkat root
│   └── proguard-rules.pro  # Aturan R8 (kosong, tanpa refleksi)
├── docs/  # Dokumentasi
│   ├── original/  # File asli (referensi)
│   │   └── pixel_empires_iii_pocket.original.html  # Sumber asli 224 KB
│   ├── ARCHITECTURE.md  # Arsitektur
│   ├── AUDIT.md  # Hasil audit
│   ├── BUILD.md  # Cara build
│   ├── PATCHES_CARI_GANTI.md  # Patch CARI/GANTI
│   ├── STRUCTURE.md  # Dokumen ini
│   └── patches.json  # Patch (mesin-baca)
├── gradle/  # Konfigurasi Gradle
│   ├── wrapper/
│   │   └── gradle-wrapper.properties  # Versi Gradle 8.13
│   └── libs.versions.toml  # Katalog versi (AGP, webkit, core)
├── tools/  # Skrip bantu
│   ├── serve_web.sh  # Server lokal
│   └── smoke_test.mjs  # Uji asap Playwright
├── .gitignore  # Abaikan build/keystore
├── README.md  # Ringkasan proyek
├── build.gradle.kts  # Plugin tingkat root
├── gradle.properties  # Opsi Gradle/AndroidX
├── keystore.properties.example  # Contoh kredensial tanda tangan rilis
└── settings.gradle.kts  # Modul & repositori Gradle
```
