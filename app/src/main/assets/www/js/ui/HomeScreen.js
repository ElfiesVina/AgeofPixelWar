"use strict";
/* Menu utama: PLAY, SETTINGS, CREDITS, EXIT. */
function HomeScreen({ onPlay, onSettings, onCredits, onExit }) {
  return jsxs("div", { className: "apw-screen apw-fade", children: [
    jsx(PixelLogo, {}),
    jsx("h1", { className: "apw-title", children: "AGE OF PIXEL WAR" }),
    jsxs("div", { className: "apw-menu", children: [
      jsx("button", { className: "apw-btn", onClick: onPlay, children: "PLAY" }),
      jsx("button", { className: "apw-btn alt", onClick: onSettings, children: "SETTINGS" }),
      jsx("button", { className: "apw-btn alt", onClick: onCredits, children: "CREDITS" }),
      jsx("button", { className: "apw-btn danger", onClick: onExit, children: "EXIT" }),
    ] }),
    jsx("div", { className: "apw-ver", children: "v" + APP_VERSION }),
  ] });
}

function InfoScreen({ title, lines, onBack }) {
  return jsxs("div", { className: "apw-screen apw-fade", children: [
    jsxs("div", { className: "apw-panel", children: [
      jsx("h2", { children: title }),
      ...lines.map((l, i) => jsx("div", { children: l }, i)),
    ] }),
    jsx("div", { className: "apw-menu", children: jsx("button", { className: "apw-btn alt", onClick: onBack, children: "BACK" }) }),
  ] });
}
