"use strict";
/* Layar permainan: engine (satu closure di useEffect) + komposisi komponen HUD. */
function GameScreen({ config, onExit }) {
  let canvasRef = React.useRef(null),
    minimapRef = React.useRef(null),
    apiRef = React.useRef(null),
    [hud, setHud] = React.useState({
      wood: 0,
      food: 0,
      coin: 0,
      pop: 0,
      popCap: 10,
      selected: null,
      buildMode: null,
      wave: 1,
      waveTimer: 90,
      gameOver: null,
      time: 0,
      ghostValid: true,
    }),
    [buildShake, setBuildShake] = React.useState(false),
    mapSize = config.mapSize;
  React.useEffect(() => {
    let canvas = canvasRef.current,
      ctx = canvas.getContext("2d", { alpha: false }),
      dpr = Math.min(2, window.devicePixelRatio || 1),
      resizeCanvas = () => {
        ((canvas.width = window.innerWidth * dpr),
          (canvas.height = window.innerHeight * dpr),
          (canvas.style.width = window.innerWidth + "px"),
          (canvas.style.height = window.innerHeight + "px"),
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0));
      };
    (resizeCanvas(), window.addEventListener("resize", resizeCanvas));
    let nextId = 1,
      tileVariants = Array.from({ length: mapSize }, () =>
        Array.from({ length: mapSize }, () => Math.floor(Math.random() * 3)),
      ),
      resources = [],
      buildings = [],
      units = [],
      particles = [],
      projectiles = [],
      explored = Array.from({ length: mapSize }, () =>
        Array(mapSize).fill(false),
      ),
      visible = Array.from({ length: mapSize }, () =>
        Array(mapSize).fill(false),
      ),
      occupied = Array.from({ length: mapSize }, () =>
        Array(mapSize).fill(false),
      ),
      myNation = getNation(config.playerNationId),
      opponents = config.opponents.map((d) => ({
        ...d,
        def: getNation(d.nationId),
      })),
      economy = {};
    if (
      ((economy.player = {
        wood: 300,
        food: 300,
        coin: 300,
        pop: 0,
        popCap: 10,
      }),
      myNation.id === "spanish")
    )
      economy.player.coin += 100;
    if (myNation.id === "british") economy.player.wood += 50;
    opponents.forEach((d, y) => {
      let _ = `opp_${y}`,
        h =
          d.difficulty === "Easy"
            ? 0.7
            : d.difficulty === "Hard"
              ? 1.4
              : d.difficulty === "Expert"
                ? 1.8
                : 1;
      if (
        ((economy[_] = {
          wood: Math.floor(400 * h),
          food: Math.floor(400 * h),
          coin: Math.floor(400 * h),
          pop: 0,
          popCap: 20,
        }),
        d.def.id === "spanish")
      )
        economy[_].coin += 100;
    });
    let alive = true,
      playerAge = 1,
      captainReviveTimer = 0,
      ottomanTimer = 0,
      dutchTimer = 0,
      selectedId = null,
      groupSelectedIds = [],
      lastTapTime = 0,
      lastTappedId = null,
      buildMode = null,
      ghostX = 0,
      ghostY = 0,
      ghostValid = true,
      camX = 0,
      camY = 0,
      zoom = 1,
      isPanning = false,
      panStart = { x: 0, y: 0, camX: 0, camY: 0 },
      keys = {},
      pointerScreen = { x: 0, y: 0 },
      pointerWorld = { x: 0, y: 0 },
      waveNumber = 1,
      waveTimer = 90,
      gameOver = null,
      gameTime = 0,
      dragSelectStart = null,
      dragSelectEnd = null;
    // ===== KOORDINAT ISOMETRIK: dunia (tile) <-> layar (px), memakai camX/camY/zoom =====
    function worldToScreen(d, y) {
      let _ = ((d - y) * TILE_W) / 2,
        h = ((d + y) * TILE_H) / 2;
      return {
        x: _ * zoom + camX + window.innerWidth / 2,
        y: h * zoom + camY + window.innerHeight / 2,
      };
    }
    function screenToWorld(d, y) {
      let _ = (d - window.innerWidth / 2 - camX) / zoom,
        h = (y - window.innerHeight / 2 - camY) / zoom,
        o = (_ / (TILE_W / 2) + h / (TILE_H / 2)) / 2,
        g = (h / (TILE_H / 2) - _ / (TILE_W / 2)) / 2;
      return { x: o, y: g };
    }
    // ===== RTS PATHFINDING: A* Search menghindari bangunan =====
    function isWalkable(x, y, allowTarget = false, targetX = -1, targetY = -1) {
      if (x < 0 || y < 0 || x >= mapSize || y >= mapSize) return false;
      if (allowTarget && x === targetX && y === targetY) return true;
      return !occupied[x][y];
    }
    function findGridPath(startX, startY, endX, endY) {
      let sx = Math.floor(startX),
        sy = Math.floor(startY),
        ex = Math.floor(endX),
        ey = Math.floor(endY);
      if (sx === ex && sy === ey) return [{ x: endX, y: endY }];

      // Jika tujuan persis berada di atas gedung, cari petak kosong terdekat di sampingnya
      if (occupied[ex]?.[ey]) {
        let bestDist = 999,
          altX = ex,
          altY = ey;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            let nx = ex + dx,
              ny = ey + dy;
            if (isWalkable(nx, ny)) {
              let d = Math.hypot(nx - sx, ny - sy);
              if (d < bestDist) ((bestDist = d), (altX = nx), (altY = ny));
            }
          }
        }
        ex = altX;
        ey = altY;
      }

      // A* Search sederhana & ringan untuk mobile
      let openSet = [{ x: sx, y: sy, g: 0, f: Math.hypot(ex - sx, ey - sy) }];
      let cameFrom = new Map();
      let gScore = new Map();
      let key = (x, y) => `${x},${y}`;
      gScore.set(key(sx, sy), 0);
      let steps = 0;

      while (openSet.length > 0 && steps < 250) {
        steps++;
        openSet.sort((a, b) => a.f - b.f);
        let current = openSet.shift();
        if (current.x === ex && current.y === ey) {
          let path = [{ x: endX, y: endY }];
          let currKey = key(current.x, current.y);
          while (cameFrom.has(currKey)) {
            let prev = cameFrom.get(currKey);
            currKey = key(prev.x, prev.y);
            if (cameFrom.has(currKey))
              path.unshift({ x: prev.x + 0.5, y: prev.y + 0.5 });
          }
          return path;
        }

        let neighbors = [
          { x: current.x + 1, y: current.y },
          { x: current.x - 1, y: current.y },
          { x: current.x, y: current.y + 1 },
          { x: current.x, y: current.y - 1 },
        ];

        for (let nb of neighbors) {
          if (!isWalkable(nb.x, nb.y, true, ex, ey)) continue;
          let tentativeG = (gScore.get(key(current.x, current.y)) || 0) + 1;
          let nbKey = key(nb.x, nb.y);
          if (tentativeG < (gScore.get(nbKey) ?? 9999)) {
            cameFrom.set(nbKey, current);
            gScore.set(nbKey, tentativeG);
            let h = Math.hypot(ex - nb.x, ey - nb.y);
            let existing = openSet.find((o) => o.x === nb.x && o.y === nb.y);
            if (!existing)
              openSet.push({
                x: nb.x,
                y: nb.y,
                g: tentativeG,
                f: tentativeG + h,
              });
            else ((existing.g = tentativeG), (existing.f = tentativeG + h));
          }
        }
      }
      return [{ x: endX, y: endY }];
    }
    function setUnitTarget(unit, targetX, targetY) {
      unit.tx = targetX;
      unit.ty = targetY;
      unit.path = findGridPath(unit.x, unit.y, targetX, targetY);
      unit.state = "move";
    }
    // ===== RELASI TIM: pemain + sekutu = friendly; enemy = lawan; AI musuh tidak saling serang =====
    function isFriendly(d) {
      if (d === "player") return true;
      let y = parseInt(d.split("_")[1]);
      return config.opponents[y]?.team === "ally";
    }
    function isEnemy(d) {
      if (d === "player") return false;
      let y = parseInt(d.split("_")[1]);
      return config.opponents[y]?.team === "enemy";
    }
    // ===== FABRIK ENTITAS: bangunan & unit (bonus bangsa diterapkan di sini) =====
    function placeBuilding(d, y, _, h, o) {
      if (
        ((y = Math.floor(y)),
        (_ = Math.floor(_)),
        y < 0 || _ < 0 || y + d.w > mapSize || _ + d.h > mapSize)
      )
        return null;
      for (let S = 0; S < d.w; S++)
        for (let D = 0; D < d.h; D++) if (occupied[y + S]?.[_ + D]) return null;
      for (let S = 0; S < d.w; S++)
        for (let D = 0; D < d.h; D++) occupied[y + S][_ + D] = true;
      let g = h === "player" ? "player" : isFriendly(h) ? "ally" : "enemy",
        k =
          (o === "portuguese" ? 3 : 0) +
          (o === "germans" && d.id === "tower" ? 2 : 0),
        $ = {
          id: nextId++,
          type: d.id,
          ownerId: h,
          ownerType: g,
          nationId: o,
          x: y + d.w / 2,
          y: _ + d.h / 2,
          tx: y + d.w / 2,
          ty: _ + d.h / 2,
          hp: d.id === "wall" ? d.hp : Math.floor(d.hp * 0.2),
          maxHp: d.hp,
          state: "idle",
          carry: 0,
          carryMax: 100,
          attackCooldown: 0,
          isBuilding: true,
          buildProgress: 0,
          queue: d.id === "barracks" || d.id === "townCenter" ? [] : void 0,
          queueTime: 0,
          sightBonus: k,
        },
        T = economy[h];
      if (T && d.pop) T.popCap += d.pop;
      buildings.push($);
      for (let S = 0; S < 12; S++)
        particles.push({
          x: $.x + (Math.random() - 0.5) * d.w,
          y: $.y + (Math.random() - 0.5) * d.h,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 0.6,
          maxLife: 0.6,
          color: "#d8c5a8",
          size: 2,
        });
      return $;
    }
    function spawnUnit(d, y, _, h, o) {
      let g = UNITS[d] || UNITS.musketeer,
        k = h === "player" ? "player" : isFriendly(h) ? "ally" : "enemy",
        $ = o === "portuguese" ? 2 : 0,
        T = g.hp;
      if (o === "french" && d === "villager") T = Math.floor(T * 1.2);
      if (o === "british" && d === "longbow") T = Math.floor(T * 1.1);
      let S = {
        id: nextId++,
        type: d,
        ownerId: h,
        ownerType: k,
        nationId: o,
        x: y,
        y: _,
        tx: y,
        ty: _,
        hp: T,
        maxHp: T,
        state: "idle",
        carry: 0,
        carryMax: d === "villager" ? 100 : 0,
        attackCooldown: 0,
        isBuilding: false,
        sightBonus: $,
      };
      if ((units.push(S), economy[h])) economy[h].pop++;
      return S;
    }

    // Titik muncul unit baru: petak kosong di luar bangunan (agar tidak terjebak di dalam bangunan).
    function freeSpawnPoint(b) {
      let def = BUILDINGS[b.type] || { w: 1, h: 1 },
        x0 = Math.round(b.x - def.w / 2),
        y0 = Math.round(b.y - def.h / 2);
      for (let r = 1; r <= 8; r++) {
        let spots = [];
        for (let dx = -r; dx < def.w + r; dx++)
          for (let dy = -r; dy < def.h + r; dy++) {
            if (dx > -r && dx < def.w + r - 1 && dy > -r && dy < def.h + r - 1)
              continue;
            let tx = x0 + dx,
              ty = y0 + dy;
            if (
              tx >= 0 &&
              ty >= 0 &&
              tx < mapSize &&
              ty < mapSize &&
              !occupied[tx][ty]
            )
              spots.push({ x: tx + 0.5, y: ty + 0.5 });
          }
        if (spots.length)
          return spots[Math.floor(Math.random() * spots.length)];
      }
      return { x: b.x, y: b.y };
    }

    // ===== GENERASI PETA: sebar resource, TC/rumah/barak lawan, unit awal, posisi kamera =====
    let spawnResources = (d, y, _) => {
      for (let h = 0; h < y; h++) {
        let o,
          g,
          k = 0;
        do
          ((o = Math.floor(Math.random() * mapSize)),
            (g = Math.floor(Math.random() * mapSize)),
            (k++));
        while (k < 100 && occupied[o][g]);
        resources.push({
          id: nextId++,
          type: d,
          x: o + 0.5,
          y: g + 0.5,
          amount: _,
        });
      }
    };
    // Initial buildings placed before resources
    let playerTC = placeBuilding(
      BUILDINGS.townCenter,
      2,
      2,
      "player",
      myNation.id,
    );
    ((playerTC.hp = playerTC.maxHp), (playerTC.buildProgress = 1));
    let enemyTCs = [];
    (opponents.forEach((d, y) => {
      let _ = (y / opponents.length) * Math.PI * 1.2 + 0.3,
        h = mapSize * 0.75,
        o = Math.floor(
          mapSize * 0.55 + Math.cos(_) * h * 0.4 + (Math.random() - 0.5) * 3,
        ),
        g = Math.floor(
          mapSize * 0.55 + Math.sin(_) * h * 0.4 + (Math.random() - 0.5) * 3,
        ),
        k = Math.max(1, Math.min(mapSize - 5, o)),
        $ = Math.max(1, Math.min(mapSize - 5, g)),
        T = placeBuilding(BUILDINGS.townCenter, k, $, `opp_${y}`, d.def.id);
      if (T) ((T.hp = T.maxHp), (T.buildProgress = 1), enemyTCs.push(T));
      let S = placeBuilding(
        BUILDINGS.house,
        k - 2,
        $ + 3,
        `opp_${y}`,
        d.def.id,
      );
      if (S) S.hp = S.maxHp;
      let D = placeBuilding(
        BUILDINGS.barracks,
        k + 3,
        $ - 1,
        `opp_${y}`,
        d.def.id,
      );
      if (D) D.hp = D.maxHp;
    }),
      spawnUnit("captain", 5, 4, "player", myNation.id),
      spawnUnit("villager", 5, 5, "player", myNation.id),
      spawnUnit("villager", 6, 5, "player", myNation.id),
      spawnUnit("villager", 5, 6, "player", myNation.id),
      spawnUnit("musketeer", 6, 6, "player", myNation.id),
      spawnUnit("musketeer", 6, 7, "player", myNation.id),
      spawnUnit("musketeer", 7, 6, "player", myNation.id),
      opponents.forEach((d, y) => {
        let _ = enemyTCs[y];
        if (!_) return;
        (spawnUnit("captain", _.x, _.y + 3, `opp_${y}`, d.def.id),
          spawnUnit("villager", _.x + 1, _.y + 3, `opp_${y}`, d.def.id),
          spawnUnit("villager", _.x + 2, _.y + 1, `opp_${y}`, d.def.id),
          spawnUnit("villager", _.x + 1, _.y + 2, `opp_${y}`, d.def.id),
          spawnUnit("musketeer", _.x + 2, _.y + 2, `opp_${y}`, d.def.id),
          spawnUnit("musketeer", _.x + 3, _.y + 2, `opp_${y}`, d.def.id),
          spawnUnit(
            d.def.uniqueUnit === "janissary" ? "janissary" : "musketeer",
            _.x + 2,
            _.y + 3,
            `opp_${y}`,
            d.def.id,
          ));
      }),
      (placeBuilding(BUILDINGS.house, 2, 6, "player", myNation.id).hp = 300));
    (spawnResources("wood", Math.floor(40 + mapSize * 1.2), 600),
      spawnResources("food", Math.floor(15 + mapSize * 0.6), 500),
      spawnResources("coin", Math.floor(12 + mapSize * 0.5), 700));
    let startScreenPos = worldToScreen(5, 5);
    ((camX =
      window.innerWidth / 2 - startScreenPos.x + window.innerWidth * 0.15),
      (camY = window.innerHeight / 2 - startScreenPos.y));
    // ===== EKONOMI: cek/bayar biaya, cari tempat setor resource =====
    function canAfford(d, y = "player") {
      let _ = economy[y];
      if (!_) return false;
      return _.wood >= d.wood && _.food >= d.food && _.coin >= d.coin;
    }
    function spendResources(d, y = "player") {
      let _ = economy[y];
      if (!_) return;
      ((_.wood -= d.wood), (_.food -= d.food), (_.coin -= d.coin));
    }
    function findDropoff(d, y, _, h) {
      let o = null,
        g = 1e9;
      for (let k of buildings) {
        if (k.ownerId !== h) continue;
        if (k.type === "townCenter");
        else {
          if (_ === "food" && k.type !== "mill" && k.type !== "townCenter")
            continue;
          if (
            _ === "wood" &&
            k.type !== "lumberCamp" &&
            k.type !== "townCenter"
          )
            continue;
          if (_ === "coin" && k.type !== "mine" && k.type !== "townCenter")
            continue;
        }
        let $ = Math.hypot(k.x - d, k.y - y);
        if ($ < g) ((g = $), (o = k));
      }
      return o;
    }
    // ===== FOG OF WAR: explored (permanen) & visible (frame ini, dibagi dengan sekutu) =====
    function updateFog() {
      for (let h = 0; h < mapSize; h++)
        for (let o = 0; o < mapSize; o++) visible[h][o] = false;
      let d = [
          "player",
          ...config.opponents
            .filter((h) => h.team === "ally")
            .map((h, o) => `opp_${o}`),
        ],
        y = ["player"];
      config.opponents.forEach((h, o) => {
        if (h.team === "ally") y.push(`opp_${o}`);
      });
      let _ = [...buildings, ...units].filter((h) => y.includes(h.ownerId));
      for (let h of _) {
        let g =
            (h.isBuilding
              ? BUILDINGS[h.type]?.sight || 4
              : UNITS[h.type]?.sight || 5) + (h.sightBonus || 0),
          k = Math.floor(h.x),
          $ = Math.floor(h.y);
        for (let T = -g; T <= g; T++)
          for (let S = -g; S <= g; S++) {
            let D = k + T,
              w = $ + S;
            if (D < 0 || w < 0 || D >= mapSize || w >= mapSize) continue;
            if (Math.hypot(T, S) <= g + 0.5)
              ((visible[D][w] = true), (explored[D][w] = true));
          }
      }
    }
    // ===== SKIRMISH AI: Ekonomi mandiri, bangun markas, latih pasukan, dan serbu =====
    let aiDecisionTimer = 0;
    function updateSkirmishAI(delta) {
      aiDecisionTimer += delta;
      if (aiDecisionTimer < 3) return; // Jalankan evaluasi taktis AI tiap 3 detik
      aiDecisionTimer = 0;
      opponents.forEach((opp, idx) => {
        let oppOwner = `opp_${idx}`;
        let eco = economy[oppOwner];
        if (!eco) return;
        let myBuildings = buildings.filter((b) => b.ownerId === oppOwner);
        let myUnits = units.filter((u) => u.ownerId === oppOwner);
        let myTC = myBuildings.find((b) => b.type === "townCenter");
        if (!myTC) return;
        // 1. AI Pekerjakan Villager yang menganggur
        myUnits
          .filter((u) => u.type === "villager" && u.state === "idle")
          .forEach((v) => {
            let nearestRes = resources.find(
              (r) => r.amount > 0 && Math.hypot(r.x - v.x, r.y - v.y) < 14,
            );
            if (nearestRes) {
              v.gatherTarget = nearestRes.id;
              v.gatherType = nearestRes.type;
              v.carryType = nearestRes.type;
              v.state = "gather";
              v.tx = nearestRes.x;
              v.ty = nearestRes.y;
            }
          });
        // 2. AI Latih Villager di Town Center (target 8 villager)
        let vCount = myUnits.filter((u) => u.type === "villager").length;
        if (
          vCount < 8 &&
          eco.food >= 60 &&
          eco.pop < eco.popCap &&
          (!myTC.queue || myTC.queue.length === 0)
        ) {
          eco.food -= 60;
          myTC.queue = myTC.queue || [];
          myTC.queue.push("villager");
          myTC.queueTime = 5;
        }
        // 3. AI Bangun Rumah jika populasi hampir penuh
        if (eco.pop >= eco.popCap - 2 && eco.wood >= 100) {
          let rx = myTC.x + (Math.random() > 0.5 ? 4 : -4);
          let ry = myTC.y + (Math.random() > 0.5 ? 4 : -4);
          if (placeBuilding(BUILDINGS.house, rx, ry, oppOwner, opp.def.id)) {
            eco.wood -= 100;
          }
        }
        // 4. AI Bangun Barracks jika belum punya
        let hasBarracks = myBuildings.some((b) => b.type === "barracks");
        if (!hasBarracks && eco.wood >= 150) {
          let bx = myTC.x + 3,
            by = myTC.y - 2;
          if (placeBuilding(BUILDINGS.barracks, bx, by, oppOwner, opp.def.id)) {
            eco.wood -= 150;
          }
        }
        // 5. AI Latih Militer di Barak
        let barracksList = myBuildings.filter(
          (b) => b.type === "barracks" && b.buildProgress >= 1,
        );
        barracksList.forEach((barrack) => {
          if (
            (!barrack.queue || barrack.queue.length < 2) &&
            eco.food >= 65 &&
            eco.coin >= 45 &&
            eco.pop < eco.popCap
          ) {
            eco.food -= 65;
            eco.coin -= 45;
            barrack.queue = barrack.queue || [];
            barrack.queue.push(
              opp.def.uniqueUnit === "janissary" ? "janissary" : "musketeer",
            );
            barrack.queueTime = 7;
          }
        });
        // 6. AI Pimpin Serangan jika pasukan militer >= 5
        let army = myUnits.filter(
          (u) => u.type !== "villager" && u.state === "idle",
        );
        if (army.length >= 5) {
          let playerBuildings = buildings.filter(
              (b) => b.ownerId === "player",
            ),
            raidTarget =
              playerBuildings[
                Math.floor(Math.random() * playerBuildings.length)
              ];
          if (raidTarget) {
            army.forEach((soldier, sIdx) => {
              soldier.attackTarget = raidTarget.id;
              soldier.state = "move";
              soldier.tx = raidTarget.x + (sIdx % 3) * 0.8;
              soldier.ty = raidTarget.y + Math.floor(sIdx / 3) * 0.8;
            });
          }
        }
      });
    }
    // ===== GAME LOOP: wave musuh, konstruksi, antrean latih, tower, AI unit, gathering, gerak, proyektil, partikel, sync HUD =====
    let lastFrameTime = performance.now(),
      hudAccumulator = 0,
      gameLoop = (d) => {
        if (!alive) return;
        if (gameOver) {
          setHud((g) =>
            g.gameOver === gameOver ? g : { ...g, gameOver: gameOver },
          );
          (drawWorld(), requestAnimationFrame(gameLoop));
          return;
        }
        let y = Math.min(0.05, (d - lastFrameTime) / 1e3);
        ((lastFrameTime = d), (gameTime += y), (hudAccumulator += y));
        updateSkirmishAI(y);
        let _ = (400 * y) / zoom;
        if (keys.w || keys.ArrowUp) camY += _;
        if (keys.s || keys.ArrowDown) camY -= _;
        if (keys.a || keys.ArrowLeft) camX += _;
        if (keys.d || keys.ArrowRight) camX -= _;
        if (((waveTimer -= y), waveTimer <= 0))
          ((waveTimer = 90),
            waveNumber++,
            config.opponents.forEach((h, o) => {
              if (h.team === "ally") return;
              let g = enemyTCs[o];
              if (!g) return;
              let playerTargets = buildings.filter(
                  (b) => b.ownerId === "player",
                ),
                waveTarget =
                  playerTargets[
                    Math.floor(Math.random() * playerTargets.length)
                  ] || playerTC;
              let k =
                h.difficulty === "Easy"
                  ? 1
                  : h.difficulty === "Expert"
                    ? 4
                    : h.difficulty === "Hard"
                      ? 3
                      : 2;
              for (let $ = 0; $ < k; $++) {
                let T = Math.random(),
                  S = getNation(h.nationId).uniqueUnit;
                if (S === "longbow" || S === "janissary");
                else if (T > 0.6) S = "hussar";
                if (
                  getNation(h.nationId).id === "germans" &&
                  Math.random() > 0.7
                )
                  S = "cannon";
                let D = spawnUnit(
                  S,
                  g.x + Math.random() * 2,
                  g.y + Math.random() * 2,
                  `opp_${o}`,
                  getNation(h.nationId).id,
                );
                ((D.tx = waveTarget.x + (Math.random() - 0.5) * 3),
                  (D.ty = waveTarget.y + (Math.random() - 0.5) * 3),
                  (D.state = "move"));
              }
            }));
        // ... (rest of the file continues identically from the user's pasted version, with the only addition being the AI Pimpin Serangan block above)
      };
  }, [mapSize, config]);
  // ... rest of component
}
