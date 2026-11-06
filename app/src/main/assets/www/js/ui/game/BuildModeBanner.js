"use strict";
/* Banner status mode bangun. */
function BuildModeBanner({ hud }) {
  return hud.buildMode && jsxs("div", { className: "absolute bottom-[64px] left-2 z-20 bg-black text-[#7CFC00] px-3 py-1 border-[2px] border-[#7CFC00] text-[9px] font-bold tracking-widest shadow-[2px_2px_0_#000]", children: ["PLACING ", hud.buildMode.toUpperCase(), " \u2022 ", hud.ghostValid ? "CLICK/TAP TO BUILD" : "INVALID \u2022 BLOCKED", " \u2022 ESC CANCEL"] });
}
