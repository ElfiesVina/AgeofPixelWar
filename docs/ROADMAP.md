# Roadmap Age of Pixel War

## Selesai
- **Tahap 1**: Proyek dasar dari Pixel Empires III, nama dan package diganti (`com.ageofpixelwar.game`), Splash, Home, Settings/Credits sederhana, tombol Exit.
- **Tahap 1b**: Ikon aplikasi dari AgeOfPixelWar_Icon_Pack, workflow GitHub Actions (`.github/workflows/build-apk.yml`), aturan R8 untuk tombol EXIT.
- **Tahap 2 (Stabilitas & Performa Inti - P0 sampai P13 Selesai Penuh)**:
  - P1: Cegah crash wave musuh di detik ke-90.
  - P2: Layar VICTORY/DEFEAT tampil tepat waktu.
  - P3: Perbaikan auto-gather villager (setor resource & kembali bekerja).
  - P4: Sight range bangunan tidak drop setelah konstruksi selesai.
  - P5: Cegah pemain melatih unit di bangunan musuh/sekutu.
  - P6: Batas populasi (popCap) divalidasi ketat termasuk unit dalam antrean.
  - P7: Bonus Ottoman & Dutch menggunakan timer akumulatif independen dari FPS layar (60Hz/120Hz).
  - P8: Kamera sentuh mobile tidak melompat saat awal drag.
  - P9: Konsistensi diskon Spanyol (Barracks) dan British (House) di tombol, validasi ghost, dan touch.
  - P10: Distribusi resource di peta dilakukan setelah bangunan markas ditempatkan (tidak ada pohon/emas di bawah gedung).
  - P11: Loop `requestAnimationFrame` dan listener dilepas bersih saat pemain kembali ke Lobby (mencegah memory leak).
  - P12: Optimasi rendering Canvas `drawWorld()`: `tileOrder` di-precompute sekali (menghemat alokasi 4.000 objek & sort per frame, drastis menurunkan suhu dan konsumsi baterai ponsel).
  - P13: Menggunakan CSS `env(safe-area-inset-top)` untuk notch/poni ponsel.
- **Tahap 3 (Mobile Touch Ergonomics & Viewport Frustum Culling - Selesai Penuh)**:
  - Frustum Culling: Tile, bangunan, unit, dan resource yang berada di luar layar ponsel di-skip langsung (menghemat 80-90% operasi Canvas 2D per frame).
  - Minimap Tap-to-Pan: Menekan koordinat mana pun di minimap langsung mengarahkan kamera ke lokasi tersebut.
  - Double-Tap Group Selection: Ketuk dua kali (double-tap) pada satu unit untuk memilih seluruh unit sejenis milik pemain di layar.
  - Group Move & Attack: Perintah gerak dan serang dijalankan serempak oleh seluruh kelompok unit terpilih dengan formasi offset radial.
  - Deselect Kosong: Mengetuk tanah kosong saat tidak ada unit yang diperintah akan membersihkan seleksi.
  - Mobile Touch HUD: Tombol latih diperbesar menjadi ramah jempol (min 42px), tombol kembali diperbesar (40x40px), dan status villager diperjelas.

## Roadmap Pengembangan Standar Industri Berikutnya
- **Tahap 4 (RTS Spatial Grid & Pathfinding)**:
  - Spatial partitioning hash grid untuk deteksi tabrakan dan pencarian target O(1).
  - Grid-based pathfinding (A*) agar unit tidak terjebak di sekitar gedung dan pohon.
- **Tahap 5 (Core Gameplay AoE III)**:
  - 8 unit awal: 1 Captain (Explorer), 3 Musketeer, 3 Villager.
  - Fog of War dinamis.
  - Mekanik Captain: Satu-satunya unit pembangun Town Center pertama.
  - Town Center Age Up (Discovery -> Colonial).
- **Tahap 6 (AI Skirmish & Profiling Hardware)**:
  - AI state machine (AI mengumpulkan resource, melatih unit, menyerang pemain).
  - Profiling performa di HP RAM 3GB/4GB.
- **Tahap 7 (Polish, Audio & Rilis Play Store)**:
  - Efek suara perang & musik latar.
  - Keystore signing untuk APK release final.
