"use strict";
/* Kotak minimap (canvas 128x128 + legenda fog + tap-to-pan). */
function Minimap({ apiRef, config, minimapRef }) {
  const handleMinimapAction = (e) => {
    let canvas = minimapRef.current;
    if (!canvas || !apiRef?.current?.jumpToWorld) return;
    let rect = canvas.getBoundingClientRect();
    let clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    let clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    let rx = (clientX - rect.left) / rect.width;
    let ry = (clientY - rect.top) / rect.height;
    let worldX = Math.max(0, Math.min(config.mapSize - 1, rx * config.mapSize));
    let worldY = Math.max(0, Math.min(config.mapSize - 1, ry * config.mapSize));
    apiRef.current.jumpToWorld(worldX, worldY);
  };
  return jsxs("div", { className: "pointer-events-auto bg-[#2b241e] border-[3px] border-black shadow-[2px_2px_0_#000] p-1.5", children: [
    jsxs("div", { className: "text-[8px] tracking-widest font-bold text-[#e8dcc0] mb-1 flex justify-between", children: ["MINIMAP (TAP TO PAN)", jsxs("span", { className: "text-[#a89a7a]", children: [config.mapSize, "x", config.mapSize] })] }),
    jsx("canvas", { ref: minimapRef, onClick: handleMinimapAction, onTouchStart: handleMinimapAction, className: "w-full aspect-square bg-[#05050a] border-[2px] border-black cursor-pointer touch-none", style: { imageRendering: "pixelated" } }),
    jsxs("div", { className: "mt-1 text-[6px] text-[#a89a7a] leading-[1.2] grid grid-cols-2 gap-1", children: [jsx("span", { children: "\u25A0 BLACK=UNEXPLORED" }), jsx("span", { children: "\u25A0 DARK=EXPLORED" }), jsx("span", { children: "\u25A0 BRIGHT=VISIBLE" }), jsx("span", { children: "\u25A0 ALLY=SHARED" })] })
  ] });
}
