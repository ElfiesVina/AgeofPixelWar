# Patch CARI / GANTI
Tempel manual ke file di `app/src/main/assets/www/`. Terapkan **berurutan** (P0 dulu). Setiap CARI sudah dicek muncul tepat **1 kali** pada urutan ini, dan seluruh patch sudah diuji dimuat tanpa error di browser (hasil uji per patch ada di `AUDIT.md`).
Cara cepat: buka file, cari teks CARI (Ctrl+F), ganti dengan teks GANTI. Spasi awal di blok multi-baris mengikuti indentasi file.

---

## P0 · Variabel baru (pasang dulu)  (-)

Dipakai oleh P3, P7, P8.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
let selectedId = null,
```
GANTI:
```js
let alive = true, ottomanTimer = 0, dutchTimer = 0, selectedId = null,
```

---

## P1 · Game crash saat wave pertama (detik ke-90)  (KRITIS)

Di blok spawn wave, `h` berasal dari config.opponents yang tidak punya properti `def`, sehingga TypeError dan loop berhenti total (layar beku). Terbukti di uji.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
let T = Math.random(), S = h.def.uniqueUnit;
```
GANTI:
```js
let T = Math.random(), S = getNation(h.nationId).uniqueUnit;
```

**Edit 2** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
if (h.def.id === "germans" && Math.random() > 0.7) S = "cannon";
```
GANTI:
```js
if (getNation(h.nationId).id === "germans" && Math.random() > 0.7) S = "cannon";
```

**Edit 3** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
let D = spawnUnit(S, g.x + Math.random() * 2, g.y + Math.random() * 2, `opp_${o}`, h.def.id);
```
GANTI:
```js
let D = spawnUnit(S, g.x + Math.random() * 2, g.y + Math.random() * 2, `opp_${o}`, getNation(h.nationId).id);
```

---

## P2 · Layar VICTORY/DEFEAT hampir tidak pernah muncul  (KRITIS)

Saat gameOver terisi, loop langsung return sebelum meng-update state React, jadi overlay hanya muncul jika kebetulan frame itu juga jatah sync HUD (sekitar 1 dari 10 frame). Di uji: 0 dari 3 kekalahan menampilkan overlay.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
      if (gameOver) {
        drawWorld(), requestAnimationFrame(gameLoop);
        return;
      }
```
GANTI:
```js
      if (gameOver) {
        setHud((g) => (g.gameOver === gameOver ? g : { ...g, gameOver: gameOver }));
        drawWorld(), requestAnimationFrame(gameLoop);
        return;
      }
```

---

## P3 · Villager berhenti bekerja (auto-gather putus)  (TINGGI)

Status "gather" diganti "move" saat berjalan ke resource/TC; saat tiba status jadi "idle" dan tidak kembali. Akibatnya villager hanya mengumpulkan jika resource sudah dalam 1,2 tile saat diperintah, dan setelah setor satu muatan ia diam. Selain itu, setelah setor ia hanya mencari resource dalam radius 12 tile dari TC, jadi pohon yang jauh tidak dikunjungi lagi. Terbukti: wood 450 tidak naik selama 85 detik.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
else if (Math.hypot(k.x - o.x, k.y - o.y) > 1.2) o.tx = k.x, o.ty = k.y, o.state = "move";
```
GANTI:
```js
else if (Math.hypot(k.x - o.x, k.y - o.y) > 1.2) o.tx = k.x, o.ty = k.y;
```

**Edit 2** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
if (T) o.tx = T.x, o.ty = T.y, o.state = "move";
```
GANTI:
```js
if (T) o.tx = T.x, o.ty = T.y;
```

**Edit 3** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
let D = resources.find((w) => w.type === o.gatherType && Math.hypot(w.x - o.x, w.y - o.y) < 12);
```
GANTI:
```js
let D = resources.find((w) => w.id === o.gatherTarget && w.amount > 0) || resources.find((w) => w.type === o.gatherType && Math.hypot(w.x - o.x, w.y - o.y) < 12);
```

---

## P4 · Bangunan jadi buta (sight salah) setelah selesai dibangun  (SEDANG)

Saat konstruksi selesai, flag `isBuilding` (penanda kategori) diset false, sehingga updateFog mencari sight di tabel UNITS dan memakai default 5. Outpost 9 jadi 5, barak 6 jadi 5, palisade 2 jadi 5.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
h.hp = h.maxHp, h.isBuilding = false;
```
GANTI:
```js
h.hp = h.maxHp;
```

---

## P5 · Pemain bisa melatih unit di gedung musuh/sekutu  (SEDANG)

Tombol latih tampil untuk gedung apa pun yang terpilih dan train() memakai ekonomi pemilik gedung. Pemain bisa menguras resource AI dan menambah pasukan musuh.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
let y = [...buildings].find((g) => g.id === selectedId);
```
GANTI:
```js
let y = [...buildings].find((g) => g.id === selectedId && g.ownerId === "player");
```

**Edit 2** · `app/src/main/assets/www/js/ui/game/SelectionPanel.js`

CARI:
```js
selectedIsBuilding && (hud.selected.type === "townCenter"
```
GANTI:
```js
selectedIsBuilding && hud.selected.ownerType === "player" && (hud.selected.type === "townCenter"
```

---

## P6 · Batas populasi bisa dilewati lewat antrean  (SEDANG)

Pop baru bertambah saat unit lahir, jadi antrean panjang bisa melewati popCap.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
if (h.pop >= h.popCap) return;
```
GANTI:
```js
if (h.pop + buildings.reduce((n, b) => n + (b.ownerId === y.ownerId && b.queue ? b.queue.length : 0), 0) >= h.popCap) return;
```

---

## P7 · Bonus Ottoman & Dutch bergantung FPS  (SEDANG)

Kondisi `gameTime % 40 < 0.05` lolos beberapa frame berturut-turut (3 frame di 60 FPS, 6 di 120 FPS), jadi villager gratis dan +2 coin berlipat. Diganti timer akumulatif.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
if (gameTime % 40 < 0.05) [...buildings]
```
GANTI:
```js
if ((ottomanTimer += y) >= 40 && (ottomanTimer -= 40, true)) [...buildings]
```

**Edit 2** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
if (Math.floor(gameTime) % 2 === 0 && gameTime % 1 < 0.05) Object.entries(economy)
```
GANTI:
```js
if ((dutchTimer += y) >= 2 && (dutchTimer -= 2, true)) Object.entries(economy)
```

---

## P8 · Kamera melompat di awal setiap drag sentuh  (SEDANG)

touchstart tidak mengisi pointerScreen, jadi touchmove pertama menghitung selisih dari posisi lama (awalnya 0,0).

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
        let y = d.touches[0];
        pointerWorld = screenToWorld(y.clientX, y.clientY);
      } else if (d.touches.length === 2) {
```
GANTI:
```js
        let y = d.touches[0];
        pointerScreen.x = y.clientX, pointerScreen.y = y.clientY;
        pointerWorld = screenToWorld(y.clientX, y.clientY);
      } else if (d.touches.length === 2) {
```

---

## P9 · Diskon Spanyol (Barracks -20%) tidak konsisten  (RENDAH)

Diskon hanya diterapkan pada klik mouse. Sentuh, tombol bangun, validasi ghost, dan label tombol memakai harga penuh.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
let y = BUILDINGS[buildMode], _ = { ...y.cost };
```
GANTI:
```js
let y = BUILDINGS[buildMode], _ = { ...y.cost };
          if (y.id === "barracks" && myNation.id === "spanish") _.wood = Math.floor(_.wood * 0.8);
```

**Edit 2** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
let y = BUILDINGS[d], _ = { ...y.cost };
```
GANTI:
```js
let y = BUILDINGS[d], _ = { ...y.cost };
        if (y.id === "barracks" && myNation.id === "spanish") _.wood = Math.floor(_.wood * 0.8);
```

**Edit 3** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
if (!canAfford(h.cost)) ghostValid = false;
```
GANTI:
```js
{ let k = { ...h.cost }; if (h.id === "house" && myNation.id === "british") k.wood = Math.floor(k.wood * 0.75); if (h.id === "barracks" && myNation.id === "spanish") k.wood = Math.floor(k.wood * 0.8); if (!canAfford(k)) ghostValid = false; }
```

**Edit 4** · `app/src/main/assets/www/js/ui/game/BuildBar.js`

CARI:
```js
if (E.id === "house" && playerNation.id === "british") s.wood = Math.floor(s.wood * 0.75);
```
GANTI:
```js
if (E.id === "house" && playerNation.id === "british") s.wood = Math.floor(s.wood * 0.75);
    if (E.id === "barracks" && playerNation.id === "spanish") s.wood = Math.floor(s.wood * 0.8);
```

---

## P10 · Resource muncul di bawah markas  (RENDAH)

Resource disebar sebelum bangunan ditempatkan, jadi grid occupied masih kosong. Pindahkan penyebaran ke setelah bangunan awal.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
    spawnResources("wood", Math.floor(40 + mapSize * 1.2), 600), spawnResources("food", Math.floor(15 + mapSize * 0.6), 500), spawnResources("coin", Math.floor(12 + mapSize * 0.5), 700);

```
GANTI:
```js
(hapus baris ini sepenuhnya)
```

**Edit 2** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
placeBuilding(BUILDINGS.tower, 5, 8, "player", myNation.id).hp = BUILDINGS.tower.hp;
```
GANTI:
```js
placeBuilding(BUILDINGS.tower, 5, 8, "player", myNation.id).hp = BUILDINGS.tower.hp;
    spawnResources("wood", Math.floor(40 + mapSize * 1.2), 600), spawnResources("food", Math.floor(15 + mapSize * 0.6), 500), spawnResources("coin", Math.floor(12 + mapSize * 0.5), 700);
```

---

## P11 · Game loop tetap jalan setelah "Return to Lobby"  (SEDANG)

Cleanup hanya melepas listener resize. Loop requestAnimationFrame lama terus berjalan di canvas yang sudah dilepas (boros CPU/baterai, menumpuk tiap ronde).

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
gameLoop = (d) => {
```
GANTI:
```js
gameLoop = (d) => {
      if (!alive) return;
```

**Edit 2** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
window.removeEventListener("resize", resizeCanvas);
```
GANTI:
```js
alive = false;
      window.removeEventListener("resize", resizeCanvas);
```

---

## P12 · Performa: urutan tile di-sort ulang tiap frame  (SEDANG)

drawWorld membuat dan mengurutkan seluruh tile (hingga 63x63 = 3969 objek) 60 kali per detik. Urutannya tetap, cukup dihitung sekali.

**Edit 1** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
      let d = (Math.sin(gameTime * 0.03) + 1) / 2, y = [];
      for (let o = 0; o < mapSize; o++) for (let g = 0; g < mapSize; g++) y.push({ x: o, y: g });
      y.sort((o, g) => o.x + o.y - (g.x + g.y));
```
GANTI:
```js
      let d = (Math.sin(gameTime * 0.03) + 1) / 2, y = tileOrder;
```

**Edit 2** · `app/src/main/assets/www/js/ui/game/GameScreen.js`

CARI:
```js
    function drawWorld() {
```
GANTI:
```js
    const tileOrder = (() => {
      let a = [];
      for (let o = 0; o < mapSize; o++) for (let g = 0; g < mapSize; g++) a.push({ x: o, y: g });
      return a.sort((o, g) => o.x + o.y - (g.x + g.y));
    })();
    function drawWorld() {
```

---

## P13 · CSS safe-area tidak berlaku (poni/notch)  (RENDAH)

`var(--safe-area-inset-top)` bukan variabel yang ada. Yang benar `env(safe-area-inset-top)` (index.html sudah memakai viewport-fit=cover).

**Edit 1** · `app/src/main/assets/www/js/ui/App.js`

CARI:
```js
paddingTop: "var(--safe-area-inset-top)"
```
GANTI:
```js
paddingTop: "env(safe-area-inset-top)"
```
