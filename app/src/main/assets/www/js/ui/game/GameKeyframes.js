"use strict";
/* Keyframes CSS animasi (shake, pop, rotateHint). */
function GameKeyframes() {
  return jsx("style", { children: `
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-2px)} 75%{transform:translateX(2px)} }
        @keyframes pop { from{transform:translate(-50%, -10px) scale(0.96)} to{transform:translate(-50%,0) scale(1)} }
        @keyframes rotateHint { 0%{transform:rotate(0deg)} 50%{transform:rotate(90deg)} 100%{transform:rotate(0deg)} }
      ` });
}
