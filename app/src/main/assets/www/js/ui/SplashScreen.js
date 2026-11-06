"use strict";
/* Layar pembuka: logo + nama game, pindah sendiri ke Home setelah ±2,8 detik. */
function SplashScreen({ onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);
  return jsxs("div", { className: "apw-screen apw-fade", onClick: onDone, children: [
    jsx(PixelLogo, {}),
    jsx("h1", { className: "apw-title", children: "AGE OF PIXEL WAR" }),
    jsx("div", { className: "apw-sub", children: "COMMAND YOUR EMPIRE" }),
    jsx("div", { className: "apw-bar", children: jsx("i", {}) }),
    jsx("div", { className: "apw-loading", children: "LOADING..." }),
  ] });
}
