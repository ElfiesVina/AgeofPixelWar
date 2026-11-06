"use strict";
/* Panel kanan: minimap, panel pilihan, diplomasi. */
function SidePanel({ apiRef, config, hud, minimapRef, selectedDef, selectedIsBuilding }) {
  return jsxs("div", { className: "absolute top-[46px] right-0 bottom-0 w-[210px] flex flex-col gap-1.5 p-1.5 z-20 pointer-events-none overflow-y-auto bg-[#1a1611]/90 backdrop-blur-sm border-l-[4px] border-black", children: [jsx(Minimap, { config, minimapRef }), jsx(SelectionPanel, { apiRef, hud, selectedDef, selectedIsBuilding }), jsx(DiplomacyPanel, { config })] });
}
