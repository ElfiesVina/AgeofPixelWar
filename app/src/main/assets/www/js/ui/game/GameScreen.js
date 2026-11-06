"use strict";
/* Layar permainan: engine (satu closure di useEffect) + komposisi komponen HUD. */
function GameScreen({ config, onExit }) {
  let canvasRef = React.useRef(null), minimapRef = React.useRef(null), apiRef = React.useRef(null), [hud, setHud] = React.useState({ wood: 0, food: 0, coin: 0, pop: 0, popCap: 10, selected: null, buildMode: null, wave: 1, waveTimer: 90, gameOver: null, time: 0, ghostValid: true }), [buildShake, setBuildShake] = React.useState(false), mapSize = config.mapSize;
  React.useEffect(() => {
    let canvas = canvasRef.current, ctx = canvas.getContext("2d", { alpha: false }), dpr = Math.min(2, window.devicePixelRatio || 1), resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr, canvas.height = window.innerHeight * dpr, canvas.style.width = window.innerWidth + "px", canvas.style.height = window.innerHeight + "px", ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas(), window.addEventListener("resize", resizeCanvas);
    let nextId = 1, tileVariants = Array.from({ length: mapSize }, () => Array.from({ length: mapSize }, () => Math.floor(Math.random() * 3))), resources = [], buildings = [], units = [], particles = [], projectiles = [], explored = Array.from({ length: mapSize }, () => Array(mapSize).fill(false)), visible = Array.from({ length: mapSize }, () => Array(mapSize).fill(false)), occupied = Array.from({ length: mapSize }, () => Array(mapSize).fill(false)), myNation = getNation(config.playerNationId), opponents = config.opponents.map((d) => ({ ...d, def: getNation(d.nationId) })), economy = {};
    if (economy.player = { wood: 300, food: 300, coin: 300, pop: 0, popCap: 10 }, myNation.id === "spanish") economy.player.coin += 100;
    if (myNation.id === "british") economy.player.wood += 50;
    opponents.forEach((d, y) => {
      let _ = `opp_${y}`, h = d.difficulty === "Easy" ? 0.7 : d.difficulty === "Hard" ? 1.4 : d.difficulty === "Expert" ? 1.8 : 1;
      if (economy[_] = { wood: Math.floor(400 * h), food: Math.floor(400 * h), coin: Math.floor(400 * h), pop: 0, popCap: 20 }, d.def.id === "spanish") economy[_].coin += 100;
    });
    let selectedId = null, buildMode = null, ghostX = 0, ghostY = 0, ghostValid = true, camX = 0, camY = 0, zoom = 1, isPanning = false, panStart = { x: 0, y: 0, camX: 0, camY: 0 }, keys = {}, pointerScreen = { x: 0, y: 0 }, pointerWorld = { x: 0, y: 0 }, waveNumber = 1, waveTimer = 90, gameOver = null, gameTime = 0;
    // ===== KOORDINAT ISOMETRIK: dunia (tile) <-> layar (px), memakai camX/camY/zoom =====
    function worldToScreen(d, y) {
      let _ = (d - y) * TILE_W / 2, h = (d + y) * TILE_H / 2;
      return { x: _ * zoom + camX + window.innerWidth / 2, y: h * zoom + camY + window.innerHeight / 2 };
    }
    function screenToWorld(d, y) {
      let _ = (d - window.innerWidth / 2 - camX) / zoom, h = (y - window.innerHeight / 2 - camY) / zoom, o = (_ / (TILE_W / 2) + h / (TILE_H / 2)) / 2, g = (h / (TILE_H / 2) - _ / (TILE_W / 2)) / 2;
      return { x: o, y: g };
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
      if (y = Math.floor(y), _ = Math.floor(_), y < 0 || _ < 0 || y + d.w > mapSize || _ + d.h > mapSize) return null;
      for (let S = 0; S < d.w; S++) for (let D = 0; D < d.h; D++) if (occupied[y + S]?.[_ + D]) return null;
      for (let S = 0; S < d.w; S++) for (let D = 0; D < d.h; D++) occupied[y + S][_ + D] = true;
      let g = h === "player" ? "player" : isFriendly(h) ? "ally" : "enemy", k = (o === "portuguese" ? 3 : 0) + (o === "germans" && d.id === "tower" ? 2 : 0), $ = { id: nextId++, type: d.id, ownerId: h, ownerType: g, nationId: o, x: y + d.w / 2, y: _ + d.h / 2, tx: y + d.w / 2, ty: _ + d.h / 2, hp: d.id === "wall" ? d.hp : Math.floor(d.hp * 0.2), maxHp: d.hp, state: "idle", carry: 0, carryMax: 100, attackCooldown: 0, isBuilding: true, buildProgress: 0, queue: d.id === "barracks" || d.id === "townCenter" ? [] : void 0, queueTime: 0, sightBonus: k }, T = economy[h];
      if (T && d.pop) T.popCap += d.pop;
      buildings.push($);
      for (let S = 0; S < 12; S++) particles.push({ x: $.x + (Math.random() - 0.5) * d.w, y: $.y + (Math.random() - 0.5) * d.h, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, life: 0.6, maxLife: 0.6, color: "#d8c5a8", size: 2 });
      return $;
    }
    function spawnUnit(d, y, _, h, o) {
      let g = UNITS[d] || UNITS.musketeer, k = h === "player" ? "player" : isFriendly(h) ? "ally" : "enemy", $ = o === "portuguese" ? 2 : 0, T = g.hp;
      if (o === "french" && d === "villager") T = Math.floor(T * 1.2);
      if (o === "british" && d === "longbow") T = Math.floor(T * 1.1);
      let S = { id: nextId++, type: d, ownerId: h, ownerType: k, nationId: o, x: y, y: _, tx: y, ty: _, hp: T, maxHp: T, state: "idle", carry: 0, carryMax: d === "villager" ? 100 : 0, attackCooldown: 0, isBuilding: false, sightBonus: $ };
      if (units.push(S), economy[h]) economy[h].pop++;
      return S;
    }
    // ===== GENERASI PETA: sebar resource, TC/rumah/barak lawan, unit awal, posisi kamera =====
    let spawnResources = (d, y, _) => {
      for (let h = 0; h < y; h++) {
        let o, g, k = 0;
        do
          o = Math.floor(Math.random() * mapSize), g = Math.floor(Math.random() * mapSize), k++;
        while (k < 100 && occupied[o][g]);
        resources.push({ id: nextId++, type: d, x: o + 0.5, y: g + 0.5, amount: _ });
      }
    };
    spawnResources("wood", Math.floor(40 + mapSize * 1.2), 600), spawnResources("food", Math.floor(15 + mapSize * 0.6), 500), spawnResources("coin", Math.floor(12 + mapSize * 0.5), 700);
    let playerTC = placeBuilding(BUILDINGS.townCenter, 2, 2, "player", myNation.id);
    playerTC.hp = playerTC.maxHp, playerTC.buildProgress = 1;
    let enemyTCs = [];
    opponents.forEach((d, y) => {
      let _ = y / opponents.length * Math.PI * 1.2 + 0.3, h = mapSize * 0.75, o = Math.floor(mapSize * 0.55 + Math.cos(_) * h * 0.4 + (Math.random() - 0.5) * 3), g = Math.floor(mapSize * 0.55 + Math.sin(_) * h * 0.4 + (Math.random() - 0.5) * 3), k = Math.max(1, Math.min(mapSize - 5, o)), $ = Math.max(1, Math.min(mapSize - 5, g)), T = placeBuilding(BUILDINGS.townCenter, k, $, `opp_${y}`, d.def.id);
      if (T) T.hp = T.maxHp, T.buildProgress = 1, enemyTCs.push(T);
      let S = placeBuilding(BUILDINGS.house, k - 2, $ + 3, `opp_${y}`, d.def.id);
      if (S) S.hp = S.maxHp;
      let D = placeBuilding(BUILDINGS.barracks, k + 3, $ - 1, `opp_${y}`, d.def.id);
      if (D) D.hp = D.maxHp;
    }), spawnUnit("villager", 5, 5, "player", myNation.id), spawnUnit("villager", 6, 5, "player", myNation.id), spawnUnit("villager", 5, 6, "player", myNation.id), spawnUnit(myNation.uniqueUnit === "longbow" ? "longbow" : "musketeer", 6, 6, "player", myNation.id), opponents.forEach((d, y) => {
      let _ = enemyTCs[y];
      if (!_) return;
      spawnUnit("villager", _.x + 1, _.y + 1, `opp_${y}`, d.def.id), spawnUnit("villager", _.x + 2, _.y + 1, `opp_${y}`, d.def.id), spawnUnit(d.def.uniqueUnit === "janissary" ? "janissary" : d.def.uniqueUnit === "cannon" ? "cannon" : "musketeer", _.x + 1, _.y + 2, `opp_${y}`, d.def.id);
    }), placeBuilding(BUILDINGS.house, 2, 6, "player", myNation.id).hp = 300, placeBuilding(BUILDINGS.barracks, 7, 2, "player", myNation.id).hp = BUILDINGS.barracks.hp, placeBuilding(BUILDINGS.tower, 5, 8, "player", myNation.id).hp = BUILDINGS.tower.hp;
    let startScreenPos = worldToScreen(5, 5);
    camX = window.innerWidth / 2 - startScreenPos.x + window.innerWidth * 0.15, camY = window.innerHeight / 2 - startScreenPos.y;
    // ===== EKONOMI: cek/bayar biaya, cari tempat setor resource =====
    function canAfford(d, y = "player") {
      let _ = economy[y];
      if (!_) return false;
      return _.wood >= d.wood && _.food >= d.food && _.coin >= d.coin;
    }
    function spendResources(d, y = "player") {
      let _ = economy[y];
      if (!_) return;
      _.wood -= d.wood, _.food -= d.food, _.coin -= d.coin;
    }
    function findDropoff(d, y, _, h) {
      let o = null, g = 1e9;
      for (let k of buildings) {
        if (k.ownerId !== h) continue;
        if (k.type === "townCenter") ;
        else {
          if (_ === "food" && k.type !== "mill" && k.type !== "townCenter") continue;
          if (_ === "wood" && k.type !== "lumberCamp" && k.type !== "townCenter") continue;
          if (_ === "coin" && k.type !== "mine" && k.type !== "townCenter") continue;
        }
        let $ = Math.hypot(k.x - d, k.y - y);
        if ($ < g) g = $, o = k;
      }
      return o;
    }
    // ===== FOG OF WAR: explored (permanen) & visible (frame ini, dibagi dengan sekutu) =====
    function updateFog() {
      for (let h = 0; h < mapSize; h++) for (let o = 0; o < mapSize; o++) visible[h][o] = false;
      let d = ["player", ...config.opponents.filter((h) => h.team === "ally").map((h, o) => `opp_${o}`)], y = ["player"];
      config.opponents.forEach((h, o) => {
        if (h.team === "ally") y.push(`opp_${o}`);
      });
      let _ = [...buildings, ...units].filter((h) => y.includes(h.ownerId));
      for (let h of _) {
        let g = (h.isBuilding ? BUILDINGS[h.type]?.sight || 4 : UNITS[h.type]?.sight || 5) + (h.sightBonus || 0), k = Math.floor(h.x), $ = Math.floor(h.y);
        for (let T = -g; T <= g; T++) for (let S = -g; S <= g; S++) {
          let D = k + T, w = $ + S;
          if (D < 0 || w < 0 || D >= mapSize || w >= mapSize) continue;
          if (Math.hypot(T, S) <= g + 0.5) visible[D][w] = true, explored[D][w] = true;
        }
      }
    }
    // ===== GAME LOOP: wave musuh, konstruksi, antrean latih, tower, AI unit, gathering, gerak, proyektil, partikel, sync HUD =====
    let lastFrameTime = performance.now(), hudAccumulator = 0, gameLoop = (d) => {
      if (gameOver) {
        drawWorld(), requestAnimationFrame(gameLoop);
        return;
      }
      let y = Math.min(0.05, (d - lastFrameTime) / 1e3);
      lastFrameTime = d, gameTime += y, hudAccumulator += y;
      let _ = 400 * y / zoom;
      if (keys.w || keys.ArrowUp) camY += _;
      if (keys.s || keys.ArrowDown) camY -= _;
      if (keys.a || keys.ArrowLeft) camX += _;
      if (keys.d || keys.ArrowRight) camX -= _;
      if (waveTimer -= y, waveTimer <= 0) waveTimer = 90, waveNumber++, config.opponents.forEach((h, o) => {
        if (h.team === "ally") return;
        let g = enemyTCs[o];
        if (!g) return;
        let k = h.difficulty === "Easy" ? 1 : h.difficulty === "Expert" ? 4 : h.difficulty === "Hard" ? 3 : 2;
        for (let $ = 0; $ < k; $++) {
          let T = Math.random(), S = h.def.uniqueUnit;
          if (S === "longbow" || S === "janissary") ;
          else if (T > 0.6) S = "hussar";
          if (h.def.id === "germans" && Math.random() > 0.7) S = "cannon";
          let D = spawnUnit(S, g.x + Math.random() * 2, g.y + Math.random() * 2, `opp_${o}`, h.def.id);
          D.tx = playerTC.x + (Math.random() - 0.5) * 3, D.ty = playerTC.y + (Math.random() - 0.5) * 3, D.state = "move";
        }
      });
      for (let h of buildings) {
        if (h.buildProgress !== void 0 && h.buildProgress < 1) {
          if (h.buildProgress += y * 0.25, h.buildProgress >= 1) h.buildProgress = 1, h.hp = h.maxHp, h.isBuilding = false;
        }
        if (h.queue && h.queue.length > 0) {
          if (h.queueTime -= y, h.queueTime <= 0) {
            let o = h.queue.shift();
            if (spawnUnit(o, h.x + (Math.random() - 0.5) * 3, h.y + (Math.random() - 0.5) * 3, h.ownerId, h.nationId), h.queue.length > 0) h.queueTime = UNITS[h.queue[0]]?.trainTime || 5;
            else h.queueTime = 0;
            if (h.ownerId === "player") for (let g = 0; g < 8; g++) particles.push({ x: h.x, y: h.y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3 - 1, life: 0.5, maxLife: 0.5, color: "#9be8ff", size: 2 });
          }
        }
        if (h.type === "tower" && h.buildProgress === 1) {
          if (h.attackCooldown -= y, h.attackCooldown <= 0) {
            let o = null, g = 1e9, k = 7 + (h.sightBonus || 0), $ = [...units, ...buildings].filter((T) => T.ownerId !== h.ownerId && (isEnemy(h.ownerId) ? isFriendly(T.ownerId) || T.ownerId === "player" : isEnemy(T.ownerId)));
            for (let T of $) {
              if (T.ownerId === h.ownerId) continue;
              if (isFriendly(h.ownerId) && isFriendly(T.ownerId)) continue;
              if (!isFriendly(h.ownerId) && !isFriendly(T.ownerId) && h.ownerId !== T.ownerId) ;
              let S = isFriendly(h.ownerId), D = isFriendly(T.ownerId);
              if (S === D) continue;
              let w = Math.hypot(T.x - h.x, T.y - h.y);
              if (w < k && w < g) g = w, o = T;
            }
            if (o) h.attackCooldown = 1.8, projectiles.push({ x: h.x, y: h.y - 0.5, tx: o.x, ty: o.y, speed: 9, ownerId: h.ownerId, ownerType: h.ownerType, dmg: 28, life: 0, color: "#ffdf5e" });
          }
        }
      }
      for (let h = units.length - 1; h >= 0; h--) {
        let o = units[h], g = UNITS[o.type] || UNITS.musketeer;
        if (o.attackCooldown -= y, o.type !== "villager") {
          if (!o.attackTarget || Math.random() < 0.02) {
            let k = null, $ = g.range + 2, T = [...units, ...buildings].filter((S) => {
              if (S.ownerId === o.ownerId) return false;
              let D = isFriendly(o.ownerId), w = isFriendly(S.ownerId);
              return D !== w;
            });
            for (let S of T) {
              let D = Math.hypot(S.x - o.x, S.y - o.y);
              if (D < $) $ = D, k = S;
            }
            if (k) o.attackTarget = k.id;
          }
          if (o.attackTarget) {
            let k = [...units, ...buildings].find(($) => $.id === o.attackTarget);
            if (!k || k.hp <= 0) o.attackTarget = void 0, o.state = "idle";
            else if (Math.hypot(k.x - o.x, k.y - o.y) <= g.range + 0.3) {
              if (o.state = "attack", o.attackCooldown <= 0) if (o.attackCooldown = o.type === "cannon" ? 2.2 : o.type === "hussar" ? 0.9 : 1.1, g.range > 2) projectiles.push({ x: o.x, y: o.y, tx: k.x, ty: k.y, speed: o.type === "cannon" ? 5 : 10, ownerId: o.ownerId, ownerType: o.ownerType, dmg: g.dmg, life: 0, color: o.type === "cannon" ? "#ff8a2a" : "#e8e8e8" });
              else {
                k.hp -= g.dmg;
                for (let T = 0; T < 4; T++) particles.push({ x: k.x, y: k.y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 0.3, maxLife: 0.3, color: "#ff5a5a", size: 2 });
                if (k.hp <= 0) {
                  let T = buildings.findIndex((S) => S.id === k.id);
                  if (T >= 0) {
                    let S = buildings[T], D = BUILDINGS[S.type];
                    if (D) {
                      let w = Math.floor(S.x - D.w / 2), ne = Math.floor(S.y - D.h / 2);
                      for (let ae = 0; ae < D.w; ae++) for (let X = 0; X < D.h; X++) if (w + ae >= 0 && ne + X >= 0 && w + ae < mapSize && ne + X < mapSize) occupied[w + ae][ne + X] = false;
                      if (S.type === "house" && economy[S.ownerId]) economy[S.ownerId].popCap = Math.max(10, economy[S.ownerId].popCap - 5);
                    }
                    if (buildings.splice(T, 1), S.type === "townCenter") {
                      if (S.ownerId === "player") gameOver = "lose";
                      else if (buildings.filter((ne) => ne.type === "townCenter" && isEnemy(ne.ownerId)).length === 0) gameOver = "win";
                    }
                  } else {
                    let S = units.findIndex((D) => D.id === k.id);
                    if (S >= 0) {
                      if (units.splice(S, 1), economy[k.ownerId]) economy[k.ownerId].pop = Math.max(0, economy[k.ownerId].pop - 1);
                    }
                  }
                  for (let S = 0; S < 15; S++) particles.push({ x: k.x, y: k.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 0.7, maxLife: 0.7, color: "#5a3a2a", size: 3 });
                }
              }
            } else o.state = "move", o.tx = k.x, o.ty = k.y;
          }
        }
        if (o.type === "villager") {
          if (o.state === "gather" && o.gatherTarget !== void 0) {
            let k = resources.find(($) => $.id === o.gatherTarget);
            if (!k || k.amount <= 0) o.state = "idle", o.gatherTarget = void 0;
            else if (Math.hypot(k.x - o.x, k.y - o.y) > 1.2) o.tx = k.x, o.ty = k.y, o.state = "move";
            else if (o.carry < o.carryMax) {
              let T = 14 * y * (o.nationId === "french" && o.gatherType === "food" ? 1.15 : 1), S = Math.min(T, k.amount, o.carryMax - o.carry);
              if (o.carry += S, k.amount -= S, Math.random() < 0.15) particles.push({ x: k.x, y: k.y, vx: (Math.random() - 0.5) * 1, vy: -Math.random() * 2, life: 0.4, maxLife: 0.4, color: k.type === "wood" ? "#8a5a2a" : k.type === "food" ? "#7ac74a" : "#d4c36a", size: 2 });
              if (k.amount <= 0) resources.splice(resources.indexOf(k), 1);
            } else {
              let T = findDropoff(o.x, o.y, o.carryType, o.ownerId);
              if (T) o.tx = T.x, o.ty = T.y, o.state = "move";
              if (T && Math.hypot(T.x - o.x, T.y - o.y) < 2.5) {
                let S = economy[o.ownerId];
                if (S) {
                  if (o.carryType === "wood") S.wood += Math.floor(o.carry);
                  if (o.carryType === "food") S.food += Math.floor(o.carry);
                  if (o.carryType === "coin") S.coin += Math.floor(o.carry);
                }
                o.carry = 0, o.carryType = void 0;
                let D = resources.find((w) => w.type === o.gatherType && Math.hypot(w.x - o.x, w.y - o.y) < 12);
                if (D) o.gatherTarget = D.id, o.gatherType = D.type, o.carryType = D.type, o.state = "gather";
              }
            }
          } else if (o.carry >= o.carryMax) {
            let k = findDropoff(o.x, o.y, o.carryType, o.ownerId);
            if (k) {
              if (o.tx = k.x, o.ty = k.y, o.state = "move", Math.hypot(k.x - o.x, k.y - o.y) < 2.5) {
                let $ = economy[o.ownerId];
                if ($) {
                  if (o.carryType === "wood") $.wood += Math.floor(o.carry);
                  if (o.carryType === "food") $.food += Math.floor(o.carry);
                  if (o.carryType === "coin") $.coin += Math.floor(o.carry);
                }
                o.carry = 0;
              }
            }
          }
        }
        if (o.state === "move" || (o.tx !== o.x || o.ty !== o.y)) {
          let k = o.tx - o.x, $ = o.ty - o.y, T = Math.hypot(k, $);
          if (T < 0.1) {
            if (o.x = o.tx, o.y = o.ty, o.state === "move") o.state = "idle";
          } else {
            let S = k / T * g.speed * y, D = $ / T * g.speed * y, w = o.x + S, ne = o.y + D, ae = Math.floor(w), X = Math.floor(ne);
            if (ae >= 0 && X >= 0 && ae < mapSize && X < mapSize && occupied[ae][X]) if (!occupied[Math.floor(o.x)][X]) w = o.x;
            else if (!occupied[ae][Math.floor(o.y)]) ne = o.y;
            else o.tx = o.x, o.ty = o.y, o.state = "idle";
            o.x = w, o.y = ne;
          }
        }
      }
      if (gameTime % 40 < 0.05) [...buildings].filter((h) => getNation(h.nationId).id === "ottomans" && h.type === "townCenter").forEach((h) => {
        let o = economy[h.ownerId];
        if (o && o.pop < o.popCap) spawnUnit("villager", h.x + 1, h.y + 1, h.ownerId, h.nationId);
      });
      if (Math.floor(gameTime) % 2 === 0 && gameTime % 1 < 0.05) Object.entries(economy).forEach(([h, o]) => {
        if ((h === "player" ? myNation.id : getNation(config.opponents[parseInt(h.split("_")[1])]?.nationId || "british").id) === "dutch") o.coin += 2;
      });
      for (let h = projectiles.length - 1; h >= 0; h--) {
        let o = projectiles[h], g = o.tx - o.x, k = o.ty - o.y, $ = Math.hypot(g, k);
        if ($ < 0.3 || o.life > 2.5) {
          let T = [...units, ...buildings].find((S) => Math.hypot(S.x - o.tx, S.y - o.ty) < 1.5 && S.ownerId !== o.ownerId && isFriendly(o.ownerId) !== isFriendly(S.ownerId));
          if (T) {
            T.hp -= o.dmg;
            for (let S = 0; S < 6; S++) particles.push({ x: T.x, y: T.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 0.35, maxLife: 0.35, color: o.color, size: 2 });
            if (T.hp <= 0) {
              let S = buildings.findIndex((D) => D.id === T.id);
              if (S >= 0) {
                let D = buildings[S], w = BUILDINGS[D.type];
                if (w) {
                  let ne = Math.floor(D.x - w.w / 2), ae = Math.floor(D.y - w.h / 2);
                  for (let X = 0; X < w.w; X++) for (let fe = 0; fe < w.h; fe++) if (ne + X >= 0 && ae + fe >= 0 && ne + X < mapSize && ae + fe < mapSize) occupied[ne + X][ae + fe] = false;
                  if (D.type === "house" && economy[D.ownerId]) economy[D.ownerId].popCap = Math.max(10, economy[D.ownerId].popCap - 5);
                }
                if (buildings.splice(S, 1), D.type === "townCenter") {
                  if (D.ownerId === "player") gameOver = "lose";
                  else if (buildings.filter((ae) => ae.type === "townCenter" && isEnemy(ae.ownerId)).length === 0) gameOver = "win";
                }
              } else {
                let D = units.findIndex((w) => w.id === T.id);
                if (D >= 0) {
                  if (units.splice(D, 1), economy[T.ownerId]) economy[T.ownerId].pop = Math.max(0, economy[T.ownerId].pop - 1);
                }
              }
              for (let D = 0; D < 12; D++) particles.push({ x: T.x, y: T.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 0.6, maxLife: 0.6, color: "#4a3a2a", size: 3 });
            }
          } else for (let S = 0; S < 5; S++) particles.push({ x: o.tx, y: o.ty, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 0.4, maxLife: 0.4, color: o.color, size: 2 });
          projectiles.splice(h, 1);
        } else o.x += g / $ * o.speed * y, o.y += k / $ * o.speed * y, o.life += y;
      }
      for (let h = particles.length - 1; h >= 0; h--) {
        let o = particles[h];
        if (o.x += o.vx * y, o.y += o.vy * y, o.life -= y, o.vy += 2 * y, o.life <= 0) particles.splice(h, 1);
      }
      if (updateFog(), buildMode) {
        ghostValid = true;
        let h = BUILDINGS[buildMode];
        if (!h) ghostValid = false;
        else {
          let o = Math.floor(pointerWorld.x), g = Math.floor(pointerWorld.y);
          if (ghostX = o, ghostY = g, o < 0 || g < 0 || o + h.w > mapSize || g + h.h > mapSize) ghostValid = false;
          else for (let k = 0; k < h.w; k++) for (let $ = 0; $ < h.h; $++) if (occupied[o + k]?.[g + $]) ghostValid = false;
          if (!canAfford(h.cost)) ghostValid = false;
        }
      }
      if (hudAccumulator > 0.15) {
        hudAccumulator = 0;
        let h = [...buildings, ...units].find((g) => g.id === selectedId) || null, o = economy.player;
        setHud((g) => ({ ...g, wood: Math.floor(o.wood), food: Math.floor(o.food), coin: Math.floor(o.coin), pop: o.pop, popCap: o.popCap, selected: h, buildMode: buildMode, wave: waveNumber, waveTimer: waveTimer, gameOver: gameOver, time: gameTime, ghostValid: ghostValid })), setBuildShake(buildMode ? !ghostValid : false), drawMinimap();
      }
      drawWorld(), requestAnimationFrame(gameLoop);
    };
    // ===== RENDER: tile, bangunan, unit, dunia, minimap =====
    function shadeColor(d, y) {
      if (d.startsWith("#") && d.length === 7) {
        let _ = parseInt(d.slice(1, 3), 16) + y, h = parseInt(d.slice(3, 5), 16) + y, o = parseInt(d.slice(5, 7), 16) + y;
        return _ = Math.max(0, Math.min(255, _)), h = Math.max(0, Math.min(255, h)), o = Math.max(0, Math.min(255, o)), `rgb(${_},${h},${o})`;
      }
      return d;
    }
    function drawTile(d, y, _) {
      let { x: h, y: o } = worldToScreen(d + 0.5, y + 0.5);
      ctx.save(), ctx.translate(h, o);
      let g = explored[d]?.[y], k = visible[d]?.[y];
      if (!g) {
        ctx.fillStyle = "#05050a", ctx.beginPath(), ctx.moveTo(0, -TILE_H / 2 * zoom), ctx.lineTo(TILE_W / 2 * zoom, 0), ctx.lineTo(0, TILE_H / 2 * zoom), ctx.lineTo(-TILE_W / 2 * zoom, 0), ctx.closePath(), ctx.fill(), ctx.restore();
        return;
      }
      let $ = ["#6b8e4e", "#7aa35a", "#5f8450"][_ % 3];
      if (ctx.fillStyle = k ? $ : "#2e3a28", ctx.beginPath(), ctx.moveTo(0, -TILE_H / 2 * zoom), ctx.lineTo(TILE_W / 2 * zoom, 0), ctx.lineTo(0, TILE_H / 2 * zoom), ctx.lineTo(-TILE_W / 2 * zoom, 0), ctx.closePath(), ctx.fill(), k && _ === 1) ctx.fillStyle = "#5d7a44", ctx.fillRect(-4 * zoom, -2 * zoom, 2 * zoom, 2 * zoom);
      if (!k) ctx.fillStyle = "rgba(0,0,0,0.58)", ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.08)", ctx.lineWidth = 1, ctx.stroke(), ctx.restore();
    }
    function drawBuilding(d) {
      let y = BUILDINGS[d.type];
      if (!y) return;
      let _ = Math.floor(d.x), h = Math.floor(d.y), o = explored[_]?.[h], g = visible[_]?.[h];
      if (!o) return;
      let k = isFriendly(d.ownerId), $ = !k && !g, T = !g && o;
      if ($ && d.type !== "townCenter" && d.type !== "house" && d.type !== "barracks" && d.type !== "tower") ;
      let { x: S, y: D } = worldToScreen(d.x, d.y), w = zoom, ne = getNation(d.nationId), ae = ne.color;
      if (ctx.save(), ctx.translate(S, D), T) ctx.globalAlpha = 0.55;
      if (ctx.fillStyle = "rgba(0,0,0,0.22)", ctx.beginPath(), ctx.ellipse(0, 4 * w, y.w * TILE_W / 2 * w * 0.5, y.h * TILE_H / 2 * w * 0.25, 0, 0, Math.PI * 2), ctx.fill(), ctx.fillStyle = k ? shadeColor(ae, 30) : ae, d.type === "wall") ctx.fillStyle = "#5c3f2a";
      if (d.buildProgress !== void 0 && d.buildProgress < 1) ctx.globalAlpha = 0.4 + d.buildProgress * 0.6;
      let X = y.w * TILE_W / 2 * w, fe = y.h * TILE_H / 2 * w;
      if (ctx.beginPath(), ctx.moveTo(0, -fe * 0.7), ctx.lineTo(X * 0.5, -fe * 0.35), ctx.lineTo(0, 0), ctx.lineTo(-X * 0.5, -fe * 0.35), ctx.closePath(), ctx.fill(), ctx.fillStyle = shadeColor(ctx.fillStyle, -28), ctx.beginPath(), ctx.moveTo(-X * 0.5, -fe * 0.35), ctx.lineTo(0, 0), ctx.lineTo(0, 28 * w), ctx.lineTo(-X * 0.5, 28 * w - fe * 0.35), ctx.closePath(), ctx.fill(), ctx.fillStyle = shadeColor(ctx.fillStyle, 14), ctx.beginPath(), ctx.moveTo(X * 0.5, -fe * 0.35), ctx.lineTo(0, 0), ctx.lineTo(0, 28 * w), ctx.lineTo(X * 0.5, 28 * w - fe * 0.35), ctx.closePath(), ctx.fill(), ctx.fillStyle = ne.secondary, ctx.fillRect(-X * 0.15, -fe * 0.6, X * 0.3, 3 * w), ctx.fillStyle = "#2a2a2a", y.w >= 2) ctx.fillRect(-6 * w, -6 * w, 4 * w, 6 * w), ctx.fillRect(2 * w, -8 * w, 3 * w, 3 * w);
      if (d.type === "tower") ctx.fillStyle = "#3a3a45", ctx.fillRect(-2 * w, -38 * w, 4 * w, 12 * w);
      if (d.hp < d.maxHp && g) ctx.fillStyle = "#000", ctx.fillRect(-18 * w, -50 * w, 36 * w, 5 * w), ctx.fillStyle = k ? "#7CFC00" : "#ff5a5a", ctx.fillRect(-17 * w, -49 * w, 34 * w * (d.hp / d.maxHp), 3 * w);
      if (d.buildProgress !== void 0 && d.buildProgress < 1) ctx.strokeStyle = "#e8d5a0", ctx.lineWidth = 1, ctx.setLineDash([2 * w, 2 * w]), ctx.strokeRect(-X * 0.5, -fe * 0.7, X, fe * 0.7 + 28 * w), ctx.setLineDash([]);
      if (d.id === selectedId && g) ctx.strokeStyle = "#fff", ctx.lineWidth = 2, ctx.setLineDash([4 * w, 3 * w]), ctx.beginPath(), ctx.moveTo(0, -fe * 0.7 - 4 * w), ctx.lineTo(X * 0.5 + 4 * w, -fe * 0.35), ctx.lineTo(0, 4 * w), ctx.lineTo(-X * 0.5 - 4 * w, -fe * 0.35), ctx.closePath(), ctx.stroke(), ctx.setLineDash([]);
      ctx.restore();
    }
    function drawUnit(d) {
      let y = Math.floor(d.x), _ = Math.floor(d.y);
      if (!(visible[y]?.[_] || isFriendly(d.ownerId)) && !isFriendly(d.ownerId)) return;
      if (!explored[y]?.[_]) return;
      let { x: o, y: g } = worldToScreen(d.x, d.y), k = zoom, $ = getNation(d.nationId);
      if (ctx.save(), ctx.translate(o, g), !visible[y][_] && isFriendly(d.ownerId)) ctx.globalAlpha = 0.7;
      ctx.fillStyle = "rgba(0,0,0,0.25)", ctx.beginPath(), ctx.ellipse(0, 4 * k, 8 * k, 4 * k, 0, 0, Math.PI * 2), ctx.fill();
      let T = "#e0d5c0";
      if (d.type === "villager") T = isFriendly(d.ownerId) ? $.color : "#e88a8a";
      else T = $.color;
      let S = Math.round(-5 * k), D = Math.round(-18 * k), w = Math.round(2.2 * k);
      if (ctx.fillStyle = "#ffdbac", ctx.fillRect(S + 2 * w, D, 3 * w, 3 * w), d.type === "villager") ctx.fillStyle = "#c48a3a", ctx.fillRect(S + 1 * w, D - 1 * w, 5 * w, 2 * w), ctx.fillStyle = T, ctx.fillRect(S + 2 * w, D + 3 * w, 3 * w, 4 * w);
      if (d.type === "musketeer" || d.type === "janissary") ctx.fillStyle = "#1a1a1a", ctx.fillRect(S + 1 * w, D - 2 * w, 5 * w, 2 * w), ctx.fillStyle = T, ctx.fillRect(S + 2 * w, D + 3 * w, 3 * w, 5 * w), ctx.fillStyle = "#5a3a2a", ctx.fillRect(S + 5 * w, D + 2 * w, 6 * w, 1 * w);
      if (d.type === "longbow") ctx.fillStyle = "#2a5a2a", ctx.fillRect(S + 1 * w, D - 2 * w, 5 * w, 2 * w), ctx.fillStyle = T, ctx.fillRect(S + 2 * w, D + 3 * w, 3 * w, 5 * w), ctx.fillStyle = "#8b5a2b", ctx.fillRect(S + 6 * w, D + 1 * w, 5 * w, 1 * w);
      if (d.type === "hussar") ctx.fillStyle = "#8a3a2a", ctx.fillRect(S, D - 1 * w, 7 * w, 2 * w), ctx.fillStyle = "#d4a24e", ctx.fillRect(S + 1 * w, D + 3 * w, 5 * w, 6 * w), ctx.fillStyle = "#4a2a1a", ctx.fillRect(S - 1 * w, D + 7 * w, 2 * w, 3 * w), ctx.fillRect(S + 5 * w, D + 7 * w, 2 * w, 3 * w);
      if (d.type === "cannon") ctx.fillStyle = "#6a6a6a", ctx.fillRect(S - 2 * w, D + 2 * w, 9 * w, 5 * w), ctx.fillStyle = "#2a2a2a", ctx.fillRect(S + 6 * w, D + 3 * w, 8 * w, 2 * w);
      if (d.carry > 0) ctx.fillStyle = d.carryType === "wood" ? "#8b5a2b" : d.carryType === "food" ? "#7ac74a" : "#d4c36a", ctx.fillRect(S + 6 * w, D + 4 * w, 2 * w, 2 * w);
      if ((d.hp < d.maxHp || d.id === selectedId) && visible[y][_]) {
        let ne = 16 * k;
        ctx.fillStyle = "#000", ctx.fillRect(-ne / 2, -22 * k, ne, 3 * k), ctx.fillStyle = isFriendly(d.ownerId) ? "#7CFC00" : "#ff4a4a", ctx.fillRect(-ne / 2 + 1, -21 * k, (ne - 2) * (d.hp / d.maxHp), 1.5 * k);
      }
      if (d.id === selectedId) ctx.strokeStyle = "#fff", ctx.lineWidth = 1.2, ctx.beginPath(), ctx.arc(0, 0, 12 * k, 0, Math.PI * 2), ctx.stroke();
      ctx.restore();
    }
    function drawWorld() {
      ctx.fillStyle = "#1a2a1a", ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      let d = (Math.sin(gameTime * 0.03) + 1) / 2, y = [];
      for (let o = 0; o < mapSize; o++) for (let g = 0; g < mapSize; g++) y.push({ x: o, y: g });
      y.sort((o, g) => o.x + o.y - (g.x + g.y));
      for (let o of y) drawTile(o.x, o.y, tileVariants[o.x][o.y]);
      for (let o of resources) {
        let g = Math.floor(o.x), k = Math.floor(o.y);
        if (!explored[g]?.[k]) continue;
        if (!visible[g][k]) continue;
        let { x: $, y: T } = worldToScreen(o.x, o.y), S = zoom;
        if (ctx.save(), ctx.translate($, T), o.type === "wood") ctx.fillStyle = "#5a3a1a", ctx.fillRect(-2 * S, -2 * S, 4 * S, 10 * S), ctx.fillStyle = "#3a6a2a", ctx.beginPath(), ctx.moveTo(0, -18 * S), ctx.lineTo(-10 * S, -4 * S), ctx.lineTo(10 * S, -4 * S), ctx.closePath(), ctx.fill(), ctx.fillStyle = "#2f5a23", ctx.beginPath(), ctx.moveTo(0, -22 * S), ctx.lineTo(-7 * S, -8 * S), ctx.lineTo(7 * S, -8 * S), ctx.closePath(), ctx.fill();
        else if (o.type === "food") {
          ctx.fillStyle = "#7ab74a", ctx.beginPath(), ctx.arc(0, -2 * S, 8 * S, 0, Math.PI * 2), ctx.fill(), ctx.fillStyle = "#c43a3a";
          for (let D = 0; D < 3; D++) ctx.fillRect((-4 + D * 4) * S, -4 * S, 2 * S, 2 * S);
        } else ctx.fillStyle = "#8a7a4a", ctx.beginPath(), ctx.moveTo(-8 * S, 2 * S), ctx.lineTo(0, -10 * S), ctx.lineTo(8 * S, 2 * S), ctx.closePath(), ctx.fill(), ctx.fillStyle = "#d4c36a", ctx.fillRect(-3 * S, -4 * S, 6 * S, 4 * S);
        ctx.restore();
      }
      let _ = [...buildings].sort((o, g) => o.x + o.y - (g.x + g.y));
      for (let o of _) drawBuilding(o);
      let h = [...units].sort((o, g) => o.x + o.y - (g.x + g.y));
      for (let o of h) drawUnit(o);
      if (buildMode) {
        let o = BUILDINGS[buildMode];
        if (o) {
          let g = ghostX + o.w / 2, k = ghostY + o.h / 2, { x: $, y: T } = worldToScreen(g, k), S = zoom, D = o.w * TILE_W / 2 * S, w = o.h * TILE_H / 2 * S;
          ctx.save(), ctx.translate($, T), ctx.globalAlpha = 0.6, ctx.fillStyle = ghostValid ? "#7CFC00" : "#ff3a3a", ctx.beginPath(), ctx.moveTo(0, -w * 0.7), ctx.lineTo(D * 0.5, -w * 0.35), ctx.lineTo(0, 0), ctx.lineTo(-D * 0.5, -w * 0.35), ctx.closePath(), ctx.fill(), ctx.globalAlpha = 1, ctx.strokeStyle = ghostValid ? "#7CFC00" : "#ff3a3a", ctx.setLineDash([4 * S, 4 * S]), ctx.lineWidth = 2, ctx.stroke(), ctx.setLineDash([]), ctx.restore();
        }
      }
      for (let o of projectiles) {
        let { x: g, y: k } = worldToScreen(o.x, o.y);
        ctx.fillStyle = o.color, ctx.beginPath(), ctx.arc(g, k, 3 * zoom, 0, Math.PI * 2), ctx.fill();
      }
      for (let o of particles) {
        let { x: g, y: k } = worldToScreen(o.x, o.y);
        ctx.globalAlpha = Math.max(0, o.life / o.maxLife), ctx.fillStyle = o.color, ctx.fillRect(g, k, o.size * zoom, o.size * zoom), ctx.globalAlpha = 1;
      }
      if (d < 0.3) ctx.fillStyle = `rgba(10,15,35,${0.25 - d * 0.5})`, ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
    function drawMinimap() {
      let d = minimapRef.current;
      if (!d) return;
      let y = d.getContext("2d"), _ = 128;
      d.width = _, d.height = _, y.fillStyle = "#05050a", y.fillRect(0, 0, _, _);
      let h = _ / mapSize;
      for (let o = 0; o < mapSize; o++) for (let g = 0; g < mapSize; g++) {
        if (!explored[o][g]) continue;
        y.fillStyle = visible[o][g] ? "#6b8e4e" : "#2a3325", y.fillRect(o * h, g * h, h, h);
      }
      for (let o of resources) {
        let g = Math.floor(o.x), k = Math.floor(o.y);
        if (!explored[g][k] || !visible[g][k]) continue;
        y.fillStyle = o.type === "wood" ? "#2f5a23" : o.type === "food" ? "#7ac74a" : "#d4c36a", y.fillRect(o.x * h - 1, o.y * h - 1, 2, 2);
      }
      for (let o of buildings) {
        let g = Math.floor(o.x), k = Math.floor(o.y);
        if (!explored[g][k]) continue;
        let $ = getNation(o.nationId);
        if (y.fillStyle = isFriendly(o.ownerId) ? $.color : "#ff5a5a", !visible[g][k]) y.globalAlpha = 0.5;
        y.fillRect(o.x * h - 2, o.y * h - 2, 4, 4), y.globalAlpha = 1;
      }
      for (let o of units) {
        let g = Math.floor(o.x), k = Math.floor(o.y);
        if (!visible[g][k]) continue;
        let $ = getNation(o.nationId);
        y.fillStyle = isFriendly(o.ownerId) ? $.color : "#ff5a5a", y.fillRect(o.x * h - 1, o.y * h - 1, 2, 2);
      }
    }
    // ===== INPUT: mouse (klik kiri pilih/bangun, klik kanan perintah), sentuh (drag/pinch/tap), keyboard (WASD, Esc) =====
    canvas.addEventListener("mousedown", (d) => {
      pointerScreen.x = d.clientX, pointerScreen.y = d.clientY;
      let y = screenToWorld(d.clientX, d.clientY);
      if (pointerWorld = y, d.button === 1 || d.button === 0 && d.altKey) {
        isPanning = true, panStart = { x: d.clientX, y: d.clientY, camX: camX, camY: camY };
        return;
      }
      if (d.button === 0) {
        if (buildMode) {
          if (ghostValid) {
            let g = BUILDINGS[buildMode], k = { ...g.cost };
            if (g.id === "house" && myNation.id === "british") k.wood = Math.floor(k.wood * 0.75);
            if (g.id === "barracks" && myNation.id === "spanish") k.wood = Math.floor(k.wood * 0.8);
            if (canAfford(k, "player")) spendResources(k, "player"), placeBuilding(g, ghostX, ghostY, "player", myNation.id), buildMode = null, setHud(($) => ({ ...$, buildMode: null }));
          }
          return;
        }
        let _ = null, h = 2, o = [...buildings, ...units];
        for (let g of o) {
          let k = Math.floor(g.x), $ = Math.floor(g.y);
          if (!explored[k]?.[$]) continue;
          if (!isFriendly(g.ownerId) && !visible[k]?.[$]) continue;
          let T = Math.hypot(g.x - y.x, g.y - y.y);
          if (T < h) h = T, _ = g;
        }
        if (_) selectedId = _.id;
        else selectedId = null;
      }
    }), canvas.addEventListener("mousemove", (d) => {
      if (pointerScreen.x = d.clientX, pointerScreen.y = d.clientY, pointerWorld = screenToWorld(d.clientX, d.clientY), isPanning) camX = panStart.camX + (d.clientX - panStart.x), camY = panStart.camY + (d.clientY - panStart.y);
    }), window.addEventListener("mouseup", (d) => {
      if (d.button === 1 || isPanning) isPanning = false;
    }), canvas.addEventListener("contextmenu", (d) => d.preventDefault()), canvas.addEventListener("mouseup", (d) => {
      if (d.button === 2) {
        let y = screenToWorld(d.clientX, d.clientY), _ = [...buildings, ...units].find((o) => o.id === selectedId);
        if (!_) return;
        if (_.type === "villager") {
          let o = resources.find((g) => Math.hypot(g.x - y.x, g.y - y.y) < 1.2 && visible[Math.floor(g.x)][Math.floor(g.y)]);
          if (o) {
            let g = units.find((k) => k.id === _.id);
            if (g) g.gatherTarget = o.id, g.gatherType = o.type, g.carryType = o.type, g.state = "gather", g.tx = o.x, g.ty = o.y;
            return;
          }
        }
        let h = [...units, ...buildings].find((o) => isEnemy(o.ownerId) === isFriendly(_.ownerId) && Math.hypot(o.x - y.x, o.y - y.y) < 1.5 && visible[Math.floor(o.x)][Math.floor(o.y)]);
        if (h) {
          let o = units.find((g) => g.id === _.id);
          if (o && o.type !== "villager") {
            o.attackTarget = h.id, o.state = "move", o.tx = h.x, o.ty = h.y;
            return;
          }
        }
        if (_ && !BUILDINGS[_.type]) {
          let o = units.find((g) => g.id === _.id);
          if (o) o.tx = y.x, o.ty = y.y, o.state = "move", o.attackTarget = void 0;
        }
      }
    }), canvas.addEventListener("wheel", (d) => {
      d.preventDefault();
      let y = d.deltaY > 0 ? 0.9 : 1.1, _ = zoom;
      zoom = Math.max(0.5, Math.min(2.2, zoom * y));
      let { clientX: h, clientY: o } = d;
      camX = h - window.innerWidth / 2 - (h - window.innerWidth / 2 - camX) * (zoom / _), camY = o - window.innerHeight / 2 - (o - window.innerHeight / 2 - camY) * (zoom / _);
    }, { passive: false });
    let pinchDistance = 0;
    return canvas.addEventListener("touchstart", (d) => {
      if (d.touches.length === 1) {
        let y = d.touches[0];
        pointerWorld = screenToWorld(y.clientX, y.clientY);
      } else if (d.touches.length === 2) {
        let y = d.touches[0].clientX - d.touches[1].clientX, _ = d.touches[0].clientY - d.touches[1].clientY;
        pinchDistance = Math.hypot(y, _);
      }
    }), canvas.addEventListener("touchmove", (d) => {
      if (d.preventDefault(), d.touches.length === 1) {
        let y = d.touches[0];
        if (!buildMode) camX += y.clientX - pointerScreen.x, camY += y.clientY - pointerScreen.y, pointerScreen.x = y.clientX, pointerScreen.y = y.clientY;
        else pointerWorld = screenToWorld(y.clientX, y.clientY);
      } else if (d.touches.length === 2) {
        let y = d.touches[0].clientX - d.touches[1].clientX, _ = d.touches[0].clientY - d.touches[1].clientY, h = Math.hypot(y, _);
        if (pinchDistance > 0) {
          let o = h / pinchDistance;
          zoom = Math.max(0.5, Math.min(2.2, zoom * o));
        }
        pinchDistance = h;
      }
    }, { passive: false }), canvas.addEventListener("touchend", (d) => {
      if (d.touches.length === 0 && buildMode) {
        if (ghostValid) {
          let y = BUILDINGS[buildMode], _ = { ...y.cost };
          if (y.id === "house" && myNation.id === "british") _.wood = Math.floor(_.wood * 0.75);
          if (canAfford(_, "player")) spendResources(_, "player"), placeBuilding(y, ghostX, ghostY, "player", myNation.id), buildMode = null, setHud((h) => ({ ...h, buildMode: null }));
        }
      } else if (d.changedTouches.length === 1 && !buildMode) {
        let y = d.changedTouches[0], _ = screenToWorld(y.clientX, y.clientY), h = null, o = 2.5;
        for (let g of [...buildings, ...units]) {
          let k = Math.floor(g.x), $ = Math.floor(g.y);
          if (!explored[k]?.[$]) continue;
          if (!isFriendly(g.ownerId) && !visible[k][$]) continue;
          let T = Math.hypot(g.x - _.x, g.y - _.y);
          if (T < o) o = T, h = g;
        }
        if (h) if (selectedId && selectedId !== h.id && !isFriendly(h.ownerId)) {
          let g = units.find((k) => k.id === selectedId);
          if (g && g.type !== "villager") g.attackTarget = h.id, g.state = "move", g.tx = h.x, g.ty = h.y;
          else selectedId = h.id;
        } else selectedId = h.id;
        else {
          let g = units.find((k) => k.id === selectedId);
          if (g) g.tx = _.x, g.ty = _.y, g.state = "move", g.attackTarget = void 0;
        }
      }
    }), window.addEventListener("keydown", (d) => {
      if (keys[d.key.toLowerCase()] = true, d.key === "Escape") buildMode = null, setHud((y) => ({ ...y, buildMode: null }));
    }), window.addEventListener("keyup", (d) => {
      keys[d.key.toLowerCase()] = false;
    // ===== API KE UI React: setBuildMode, train, cancelBuild, selectVillagerGather =====
    }), apiRef.current = { setBuildMode: (d) => {
      if (d) {
        let y = BUILDINGS[d], _ = { ...y.cost };
        if (y.id === "house" && myNation.id === "british") _.wood = Math.floor(_.wood * 0.75);
        if (!canAfford(_, "player")) {
          setBuildShake(true), setTimeout(() => setBuildShake(false), 600);
          return;
        }
      }
      buildMode = d, setHud((y) => ({ ...y, buildMode: d }));
    }, train: (d) => {
      let y = [...buildings].find((g) => g.id === selectedId);
      if (!y) return;
      let _ = UNITS[d];
      if (!_) return;
      let h = economy[y.ownerId];
      if (!h) return;
      let o = { ..._.cost };
      if (y.nationId === "russians" && d !== "villager" && d !== "cannon") o.food = Math.floor(o.food * 0.7);
      if (y.nationId === "germans" && (d === "cannon" || d === "hussar")) o.coin = Math.floor(o.coin * 0.8);
      if (!canAfford(o, y.ownerId)) return;
      if (h.pop >= h.popCap) return;
      if (spendResources(o, y.ownerId), y.queue = y.queue || [], y.queue.push(d), y.queue.length === 1) y.queueTime = _.trainTime;
    }, cancelBuild: () => {
      buildMode = null, setHud((d) => ({ ...d, buildMode: null }));
    }, selectVillagerGather: (d) => {
      let y = units.find((o) => o.id === selectedId);
      if (!y || y.type !== "villager") return;
      let _ = null, h = 1e9;
      for (let o of resources) if (o.type === d && visible[Math.floor(o.x)][Math.floor(o.y)]) {
        let g = Math.hypot(o.x - y.x, o.y - y.y);
        if (g < h) h = g, _ = o;
      }
      if (_) y.gatherTarget = _.id, y.gatherType = _.type, y.carryType = _.type, y.state = "gather", y.tx = _.x, y.ty = _.y;
    } }, requestAnimationFrame(gameLoop), () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [mapSize, config]);
  let selectedDef = hud.selected ? BUILDINGS[hud.selected.type] || UNITS[hud.selected.type] : null, selectedIsBuilding = hud.selected && !!BUILDINGS[hud.selected.type], playerNation = getNation(config.playerNationId);
  return jsxs("div", { className: "relative w-screen h-screen overflow-hidden bg-[#1a2a1a] select-none", style: { fontFamily: '"Courier New", monospace', imageRendering: "pixelated" }, children: [jsx("canvas", { ref: canvasRef, className: "absolute inset-0 touch-none", style: { imageRendering: "pixelated" } }), jsx(TopBar, { config, hud, onExit, playerNation }), jsx(BuildBar, { apiRef, buildShake, hud, playerNation }), jsx(SidePanel, { apiRef, config, hud, minimapRef, selectedDef, selectedIsBuilding }), jsx(GameOverModal, { config, hud, onExit, playerNation }), jsx(BuildModeBanner, { hud }), jsx(GameKeyframes, {})] });
}
