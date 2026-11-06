"use strict";
/* Daftar lawan/sekutu + info berbagi sight. */
function DiplomacyPanel({ config }) {
  return jsxs("div", { className: "pointer-events-auto bg-black border-[2px] border-[#333] p-1.5 text-[7px] text-[#a89a7a] leading-[1.2]", children: [jsx("div", { className: "text-[#e8dcc0] font-bold text-[8px]", children: "DIPLOMACY \u2022 TEAM VISION" }), jsx("div", { className: "mt-1 space-y-0.5", children: config.opponents.map((E, s) => {
    let O = getNation(E.nationId);
    return jsxs("div", { className: "flex justify-between", children: [jsxs("span", { className: "flex items-center gap-1", children: [jsx("span", { className: "w-2 h-2 border border-black inline-block", style: { background: O.color } }), O.name, " ", s + 1] }), jsxs("span", { className: E.team === "ally" ? "text-[#7CFC00]" : "text-[#ff5a5a]", children: [E.team.toUpperCase(), " \u2022 ", E.difficulty] })] }, s);
  }) }), jsx("div", { className: "mt-1 text-[6px]", children: "Allies share sight. Only friends' sections visible." })] });
}
