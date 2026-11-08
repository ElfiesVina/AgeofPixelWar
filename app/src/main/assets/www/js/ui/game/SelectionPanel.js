"use strict";
/* Panel entitas terpilih: HP, tombol latih ramah sentuh mobile, status villager. */
function SelectionPanel({ apiRef, hud, selectedDef, selectedIsBuilding }) {
  return jsx("div", { className: "pointer-events-auto bg-[#e8dcc0] border-[3px] border-black shadow-[2px_2px_0_#000] min-h-[120px]", children: hud.selected ? jsxs("div", { className: "p-2", children: [
    jsxs("div", { className: "flex justify-between items-start", children: [
      jsxs("div", { children: [
        jsxs("div", { className: "text-[11px] font-black tracking-widest flex items-center gap-1.5", children: [
          jsx("span", { className: "w-3.5 h-3.5 border border-black inline-block", style: { background: getNation(hud.selected.nationId).color } }),
          selectedDef?.name?.toUpperCase() || hud.selected.type.toUpperCase()
        ] }),
        jsxs("div", { className: "text-[8px] text-[#5a4a3a] mt-0.5", children: [
          "HP ", Math.floor(hud.selected.hp), "/", hud.selected.maxHp, " \u2022 ", hud.selected.ownerType.toUpperCase(), " \u2022 ", getNation(hud.selected.nationId).name
        ] })
      ] }),
      jsx("div", { className: "w-8 h-8 bg-[#1a1611] text-[#e8dcc0] flex items-center justify-center text-[12px] font-bold border-2 border-black", children: BUILDINGS[hud.selected.type]?.icon || UNITS[hud.selected.type]?.name[0] || "?" })
    ] }),
    jsx("div", { className: "mt-1.5 h-2 bg-black border border-black", children: jsx("div", { className: "h-full bg-[#7CFC00]", style: { width: `${hud.selected.hp / hud.selected.maxHp * 100}%` } }) }),
    selectedIsBuilding && hud.selected.ownerType === "player" && (hud.selected.type === "townCenter" || hud.selected.type === "barracks") && jsxs("div", { className: "mt-2", children: [
      jsxs("div", { className: "text-[8px] font-bold tracking-widest mb-1 text-[#3a2a1a]", children: ["TRAIN \u2022 POP ", hud.pop, "/", hud.popCap] }),
      jsx("div", { className: "grid grid-cols-2 gap-1.5", children: (hud.selected.type === "townCenter" ? ["villager"] : [...Object.keys(UNITS).filter((E) => E !== "villager" && E !== "captain")].slice(0, 4)).map((E) => {
        let s = UNITS[E];
        if (!s) return null;
        let O = { ...s.cost };
        if (hud.selected.nationId === "russians" && E !== "villager" && E !== "cannon") O.food = Math.floor(O.food * 0.7);
        if (hud.selected.nationId === "germans" && (E === "cannon" || E === "hussar")) O.coin = Math.floor(O.coin * 0.8);
        let Y = hud.wood >= O.wood && hud.food >= O.food && hud.coin >= O.coin && hud.pop < hud.popCap;
        return jsxs("button", { disabled: !Y, onClick: () => apiRef.current?.train(E), className: `p-2 min-h-[42px] border-2 border-black text-[8px] font-bold text-left leading-[1.2] active:scale-95 transition-transform ${Y ? "bg-[#3a5a8a] text-white hover:bg-[#4a6a9a]" : "bg-[#2a2a2a] text-[#777]"} shadow-[1px_1px_0_#000]`, children: [
          jsx("div", { className: "font-black tracking-wide", children: s.name.toUpperCase() }),
          jsxs("div", { className: "text-[7px] opacity-85 mt-0.5", children: [O.food ? `${O.food}F ` : "", O.wood ? `${O.wood}W ` : "", O.coin ? `${O.coin}$` : ""] })
        ] }, E);
      }) }),
      hud.selected.queue && hud.selected.queue.length > 0 && jsxs("div", { className: "mt-1.5 text-[7px] bg-black text-[#7CFC00] px-1.5 py-1 border border-[#333] font-mono", children: ["QUEUE: ", hud.selected.queue.join(" > "), " [", Math.ceil(hud.selected.queueTime || 0), "s]"] })
    ] }),
    hud.selected.type === "villager" && hud.selected.ownerType === "player" && jsxs("div", { className: "mt-2 p-1.5 bg-[#d9cbb0] border border-black text-[#3a2a1a]", children: [
      jsxs("div", { className: "text-[8px] font-bold flex justify-between", children: [
        jsx("span", { children: "VILLAGER STATUS" }),
        jsxs("span", { className: "text-[#5a4a3a]", children: ["CARRY: ", Math.floor(hud.selected.carry), "/", hud.selected.carryMax, " ", (hud.selected.carryType || "").toUpperCase()] })
      ] }),
      jsx("div", { className: "text-[7px] text-[#6a5a4a] mt-1 leading-tight", children: "Tap any tree, mine, or animal to auto-gather & deposit." })
    ] })
  ] }) : jsxs("div", { className: "p-2.5", children: [
    jsx("div", { className: "text-[10px] font-black tracking-widest", children: "NO SELECTION" }),
    jsx("div", { className: "text-[8px] text-[#5a4a3a] mt-1 leading-[1.3]", children: "Tap units or buildings to select. Tap ground to move. Tap enemy to attack. Drag with 1 finger to pan map, pinch with 2 fingers to zoom." })
  ] }) });
}
