# Audit Pixel Empires III: Pocket

Objek: satu file HTML 224 KB (bundel artefak React: Tailwind terkompilasi + React/ReactDOM minify + ±52 KB kode game). Kode game diekstrak, diformat, dibaca penuh (±700 baris), lalu bug dikonfirmasi dengan menjalankan game di Chromium headless.

Tingkat bukti: **[UJI]** terbukti dijalankan, **[BACA]** dari pembacaan kode (logika jelas, belum dijalankan terpisah).

## A. Bug fungsional

| # | Temuan | Dampak | Bukti | Patch |
|---|---|---|---|---|
| 1 | Wave musuh memakai `h.def.uniqueUnit`, tapi `config.opponents` tidak punya `def` | **Game crash dan layar beku di detik ke-90** (wave pertama) | [UJI] TypeError "reading 'uniqueUnit'", screenshot beku. Setelah patch: tanpa error, layar bergerak | P1 |
| 2 | Overlay VICTORY/DEFEAT hanya muncul bila frame kemenangan/kekalahan kebetulan juga frame sync HUD (±1 dari 10) | Game selesai tanpa pesan, layar mati | [UJI] 3 kekalahan: 0 overlay (asli), 3 overlay (patch) | P2 |
| 3 | Gathering: status `gather` ditimpa `move`, saat tiba jadi `idle`; setelah setor hanya cari resource radius 12 dari TC | Villager sering diam; ekonomi macet | [UJI] seed sama: wood 350 konstan 60 dtk (asli) vs 350→950 (patch) | P3 |
| 4 | `isBuilding=false` saat konstruksi selesai, padahal dipakai sebagai penanda kategori untuk sight | Outpost sight 9→5, barak 6→5, palisade 2→5 | [BACA] | P4 |
| 5 | Tombol latih muncul untuk gedung musuh/sekutu; `train()` memakai ekonomi pemilik | Pemain bisa menguras resource AI dan menambah pasukan musuh | [BACA] | P5 |
| 6 | Cek pop hanya saat antre; pop bertambah saat unit lahir | Batas populasi bisa dilewati | [BACA] | P6 |
| 7 | Bonus Ottoman (villager gratis/40 dtk) dan Dutch (+2 coin/2 dtk) memakai `gameTime % N < 0.05` | Terpicu 3 frame (60 FPS), 6 frame (120 FPS): bonus berlipat, bergantung FPS | [BACA] | P7 |
| 8 | `touchstart` tidak mengisi `pointerScreen` | Kamera melompat di awal tiap drag sentuh | [BACA] | P8 |
| 9 | Diskon Barracks Spanyol hanya di klik mouse | Sentuh/ghost/label memakai harga penuh | [BACA] | P9 |
| 10 | Resource disebar sebelum bangunan ditempatkan (grid `occupied` masih kosong) | Pohon/tambang bisa muncul di bawah markas | [BACA] | P10 |
| 11 | Cleanup efek hanya melepas `resize` | Loop rAF lama tetap jalan setelah Return to Lobby; listener keyboard/mouse bocor | [BACA] | P11 (loop; listener belum) |
| 12 | `drawWorld` membuat + sort seluruh tile tiap frame (hingga 3969 objek) | Boros CPU/baterai; di uji headless game berjalan ±58% kecepatan nyata (indikasi saja, 7 halaman paralel) | [BACA]+indikasi | P12 |
| 13 | `var(--safe-area-inset-top)` bukan variabel CSS yang ada | Area poni/notch tidak ditangani | [BACA] | P13 |

## B. Bonus bangsa: teks vs implementasi (butuh keputusan desain, tanpa patch)

- **British** "Longbow +15% range": tidak ada; kode memberi +10% HP.
- **Dutch** "Bank +2 coin/s" (tidak ada bangunan Bank) dan "Trading Post +30%": tidak ada.
- **Portuguese** "+3 sight semua unit": unit +2, bangunan +3, dan Outpost ikut +3 *range* tembak (sightBonus dipakai ganda).
- **Russians** "Batch train x3": tidak ada.
- **Ottomans** "Janissary elite": barak hanya menampilkan 4 unit pertama (`slice(0,4)`), Janissary tidak bisa dilatih. Longbow terbuka untuk semua bangsa.
- "Explored stays visible" berlaku untuk semua bangsa, bukan hanya Portuguese.

## C. Risiko lain (tidak dipatch)

- Tidak ada pathfinding: unit hanya "menggeser" per sumbu dan berhenti bila terhalang bangunan.
- Targeting unit: tiap frame membuat array `[...units, ...buildings]` per unit (O(N²) + alokasi), retarget acak 2%/frame (bergantung FPS).
- Perintah klik di luar peta tidak dibatasi (unit bisa keluar peta; `drawMinimap` mengakses `explored[x][y]` tanpa cek batas dan bisa melempar error).
- Toggle ally/enemy di lobby memutasi objek state React langsung.
- AI hanya spawn wave berkala (tanpa ekonomi/bangun), tidak dibatasi popCap.
- `mouseup` dan `keydown/keyup` di `window` tidak dilepas saat unmount.

## D. Kesiapan mobile / APK

- HUD memakai font 6 sampai 9 px dan tombol sekitar 20 px; pedoman sentuh Android 48 dp. Panel kanan tetap 210 px (±33% lebar layar landscape ponsel).
- Tap resource tidak memberi perintah gather (hanya klik kanan atau tombol GATHER MODE kecil).
- Minimap tidak bisa di-tap untuk pindah kamera.
- Font "Courier New" tidak ada di Android (jatuh ke monospace sistem), lebar teks berbeda.
- Android 16 mengabaikan kunci orientasi di layar besar (tablet/foldable); overlay "rotate" di game tetap berguna.
- Bundel React tidak di-rebuild; jika ingin menambah fitur jangka panjang, pindahkan ke proyek Vite/React sungguhan.

## E. Cakupan pengujian

- Konversi ke banyak file: teks lobby, HUD, panel pilihan, dan panjang HTML identik dengan file asli (seed acak sama), 0 error konsol. **[UJI]**
- Proyek Android **belum dibangun/dijalankan** di lingkungan ini (tanpa Android SDK/Gradle). XML divalidasi, Java ditulis hati-hati tapi belum dikompilasi.
- P4 sampai P10, P12, P13 diuji hanya sebatas dimuat tanpa error; perilakunya belum diuji satu per satu.
