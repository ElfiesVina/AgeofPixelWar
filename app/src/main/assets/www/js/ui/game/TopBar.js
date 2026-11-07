"use strict";
/* HUD atas: tombol kembali, bangsa, wood/food/coin, pop, wave (ramah sentuh). */
function TopBar({ config, hud, onExit, playerNation }) {
  return jsxs("div", { className: "absolute top-0 left-0 right-0 h-[48px] bg-[#1a1611] border-b-[3px] border-black flex items-center px-2 gap-2 z-20 shadow-[0_4px_0_#000]", children: [
    jsx("button", { onClick: onExit, className: "w-10 h-10 bg-[#2b241e] border-2 border-black flex items-center justify-center text-[14px] text-white active:scale-95 transition-transform hover:bg-black shadow-[1px_1px_0_#000]", children: "\u2190" }),
    jsxs("div", { className: "flex items-center gap-1.5", children: [
      jsx("div", { className: "w-9 h-9 border-[2px] border-black flex items-center justify-center font-black text-[12px] text-white", style: { background: playerNation.color }, children: playerNation.flag }),
      jsxs("div", { className: "hidden sm:block text-[#e8dcc0] font-bold text-[8px] leading-[1.1] tracking-widest", children: [
        playerNation.name.toUpperCase(), " EMPIRE",
        jsx("br", {}),
        jsxs("span", { className: "text-[#a89a7a] text-[7px]", children: [config.mapSize, "x", config.mapSize, " \u2022 ", config.opponents.length + 1, " NATIONS"] })
      ] })
    ] }),
    jsxs("div", { className: "flex-1 flex items-center justify-center gap-1.5", children: [
      [{ k: "wood", icon: "\u{1FAB5}", v: hud.wood, col: "bg-[#8b5a2b]" },
       { k: "food", icon: "\u{1F33E}", v: hud.food, col: "bg-[#6b8e3a]" },
       { k: "coin", icon: "\u26C3", v: hud.coin, col: "bg-[#c4a24a]" }].map((E) => jsxs("div", { className: `flex items-center gap-1 px-2.5 py-1 border-[2px] border-black ${E.col} text-white text-[12px] font-black shadow-[1px_1px_0_#000]`, children: [
        jsx("span", { className: "text-[11px]", children: E.icon }),
        jsx("span", { children: E.v })
      ] }, E.k)),
      jsxs("div", { className: "flex items-center gap-1 px-2 py-1 bg-[#3a3a4a] border-[2px] border-black text-white text-[11px] font-bold shadow-[1px_1px_0_#000]", children: [
        jsx("span", { children: "\u2691" }),
        hud.pop, "/", hud.popCap
      ] }),
      jsxs("div", { className: "hidden md:flex items-center gap-1 px-2 py-1 bg-black border-2 border-[#333] text-[9px] text-[#7CFC00] font-mono", children: [
        jsxs("span", { children: ["WAVE ", hud.wave] }),
        jsxs("span", { children: ["[", Math.floor(hud.waveTimer), "s]"] })
      ] })
    ] })
  ] });
}
