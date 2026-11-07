"use strict";
/* Root: state lobby/playing + overlay rotasi landscape. */
function App() {
  let [e, n] = React.useState("splash"), [t, r] = React.useState(null), [l, u] = React.useState(false);
  return React.useEffect(() => {
    let i = () => u(window.innerHeight > window.innerWidth);
    return i(), window.addEventListener("resize", i), window.addEventListener("orientationchange", i), () => {
      window.removeEventListener("resize", i), window.removeEventListener("orientationchange", i);
    };
  }, []), jsxs("div", { className: "w-screen h-screen overflow-hidden bg-[#0a0a0f] relative", style: { paddingTop: "env(safe-area-inset-top)", boxSizing: "border-box" }, children: [jsxs("div", { className: `portrait-overlay fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col items-center justify-center text-center p-6 ${l ? "flex" : "hidden"}`, style: { display: l ? "flex" : "none" }, children: [jsx("div", { className: "w-24 h-24 border-[4px] border-white bg-[#1a1611] flex items-center justify-center mb-4 shadow-[6px_6px_0_#000] animate-[rotateHint_2s_ease-in-out_infinite]", children: jsx("div", { className: "text-[40px]", children: "\u{1F4F1}" }) }), jsx("div", { className: "text-white font-black tracking-[0.2em] text-[14px] mb-2", children: "PLEASE ROTATE YOUR DEVICE TO LANDSCAPE" }), jsx("div", { className: "text-[#a89a7a] text-[10px] max-w-[280px] leading-[1.4]", children: "This is a landscape-only war game. Turn your phone sideways to command your empire. Age of Pixel War requires 16:9 landscape for tactical view and team vision." }), jsxs("div", { className: "mt-4 flex gap-2", children: [jsx("div", { className: "w-10 h-6 border-2 border-white bg-[#2b241e] rotate-0" }), jsx("span", { className: "text-white text-[18px]", children: "\u2192" }), jsx("div", { className: "w-6 h-10 border-2 border-[#7CFC00] bg-[#7CFC00]/20 rotate-0" })] })] }), e === "splash" && jsx(SplashScreen, { onDone: () => n("home") }),
  e === "home" && jsx(HomeScreen, { onPlay: () => n("lobby"), onSettings: () => n("settings"), onCredits: () => n("credits"), onExit: exitApp }),
  e === "settings" && jsx(InfoScreen, { title: "SETTINGS", lines: ["Settings will be added in a later stage."], onBack: () => n("home") }),
  e === "credits" && jsx(InfoScreen, { title: "CREDITS", lines: ["Age of Pixel War v" + APP_VERSION, "Game design: Hinmiya", "Engine base: Pixel Empires III: Pocket"], onBack: () => n("home") }),
  e === "lobby" && jsx(LobbyScreen, { onStart: (i) => {
    r(i), n("playing");
  } }), e === "playing" && t && jsx(GameScreen, { config: t, onExit: () => n("home") }), jsx("style", { children: `
        @media (orientation: portrait) {
          .portrait-overlay { display: flex !important; }
        }
        @media (orientation: landscape) {
          .portrait-overlay { display: none !important; }
        }
        *{ scrollbar-width: thin; }
        body{ margin:0; overscroll-behavior:none; }
      ` })] });
}
