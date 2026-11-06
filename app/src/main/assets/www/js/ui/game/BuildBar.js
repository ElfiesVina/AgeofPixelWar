"use strict";
/* Bar bawah: daftar bangunan yang bisa dibangun + tombol ESC. */
function BuildBar({ apiRef, buildShake, hud, playerNation }) {
  return jsxs("div", { className: "absolute bottom-0 left-0 right-[210px] bg-[#2b241e] border-t-[4px] border-r-[4px] border-[#1a1611] z-20 shadow-[0_-2px_0_#000] flex flex-col", children: [jsxs("div", { className: "flex items-center justify-between px-2 py-0.5 bg-[#1a1611] text-[#e8dcc0] text-[7px] tracking-[0.15em] font-bold", children: [jsxs("span", { children: ["CONSTRUCTION \u2022 ", playerNation.bonuses[0], " \u2022 RIGHT-CLICK COMMAND \u2022 WASD PAN \u2022 WHEEL ZOOM"] }), jsx("button", { onClick: () => apiRef.current?.cancelBuild(), className: "px-2 py-0.5 bg-[#5a3a3a] border border-black", children: "ESC" })] }), jsx("div", { className: "flex gap-1 p-1.5 overflow-x-auto", children: Object.values(BUILDINGS).map((E) => {
    let s = { ...E.cost };
    if (E.id === "house" && playerNation.id === "british") s.wood = Math.floor(s.wood * 0.75);
    let O = hud.wood >= s.wood && hud.food >= s.food && hud.coin >= s.coin, Y = hud.buildMode === E.id;
    return jsxs("button", { onClick: () => apiRef.current?.setBuildMode(Y ? null : E.id), className: `relative min-w-[60px] h-[56px] border-[2px] flex flex-col items-center justify-center gap-0.5
                ${Y ? "bg-[#7CFC00] border-white scale-105 z-10" : O ? "bg-[#3e352d] border-black hover:bg-[#4a3f36]" : "bg-[#2a2520] border-black opacity-50"}
                ${buildShake && Y ? "animate-[shake_0.3s]" : ""} shadow-[1px_1px_0_#000]`, children: [jsx("span", { className: "text-[15px] font-black leading-none text-[#e8dcc0]", children: E.icon }), jsx("span", { className: "text-[6px] font-bold text-[#e8dcc0] tracking-widest", children: E.name.split(" ")[0].toUpperCase() }), jsxs("span", { className: "text-[6px] text-[#a89a7a]", children: [s.wood > 0 ? `${s.wood}W` : "", " ", s.coin > 0 ? `${s.coin}$` : ""] })] }, E.id);
  }) })] });
}
