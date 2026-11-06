# Arsitektur

```
Android (Java)                    WebView (HTML/JS)
MainActivity ──loadUrl──▶ https://appassets.androidplatform.net/assets/www/index.html
GameWebViewClient ── WebViewAssetLoader ──▶ app/src/main/assets/www/**
```

## Web (`assets/www`)

Skrip klasik berbagi scope global (tanpa bundler); urutan dimuat di `index.html` penting:

1. `js/vendor/react-bundle.js`: React + ReactDOM (minify, jangan diedit)
2. `js/core/react-bindings.js`: `React`, `ReactDOMClient`, `jsx`, `jsxs`
3. `js/game/*`: konstanta, data bangunan/unit/bangsa, `getNation()`
4. `js/ui/lobby/LobbyScreen.js`
5. `js/ui/game/*`: komponen HUD (TopBar, BuildBar, SidePanel: Minimap, SelectionPanel, DiplomacyPanel; GameOverModal, BuildModeBanner, GameKeyframes)
6. `js/ui/game/GameScreen.js`: engine permainan
7. `js/ui/App.js`, `js/main.js`

## Engine (`GameScreen.js`)

Seluruh engine adalah satu closure di dalam `React.useEffect` (state: `buildings`, `units`, `resources`, `particles`, `projectiles`, grid `occupied`/`explored`/`visible`, `economy[ownerId]`). UI React hanya menerima snapshot lewat `setHud` tiap 0,15 detik, dan mengirim perintah lewat `apiRef.current`. Bagian ditandai komentar `// =====`:

| Bagian | Isi |
|---|---|
| Koordinat isometrik | `worldToScreen`, `screenToWorld` |
| Relasi tim | `isFriendly`, `isEnemy` |
| Fabrik entitas | `placeBuilding`, `spawnUnit` (bonus bangsa) |
| Generasi peta | resource, TC/rumah/barak lawan, unit awal, kamera |
| Ekonomi | `canAfford`, `spendResources`, `findDropoff` |
| Fog of war | `updateFog` |
| Game loop | wave, konstruksi, antrean latih, tower, AI unit, gathering, gerak, proyektil, partikel, sync HUD |
| Render | `drawTile`, `drawBuilding`, `drawUnit`, `drawWorld`, `drawMinimap` |
| Input | mouse, sentuh, keyboard |
| API ke UI | `setBuildMode`, `train`, `cancelBuild`, `selectVillagerGather` |

Memecah engine menjadi modul (ekonomi, tempur, fog, render, input) butuh refactor state bersama dan sengaja belum dilakukan agar perilaku identik dengan file asli.

## Provenance

File asli: `docs/original/pixel_empires_iii_pocket.original.html`. Pemecahan dilakukan dengan rename berbasis scope (TypeScript LanguageService), bukan regex; 91 simbol diberi nama terbaca, kode React tidak diubah.
