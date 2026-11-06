"use strict";
/* Logo sementara Age of Pixel War: dua pedang menyilang + perisai, digambar dari kotak piksel (SVG inline, tanpa file gambar). */
function PixelLogo() {
  const P = 8; // ukuran satu piksel
  const rects = [];
  const add = (x, y, c, w = 1, h = 1) => rects.push(jsx("rect", { x: x * P, y: y * P, width: w * P, height: h * P, fill: c }, rects.length));
  // perisai 10x12 di tengah (kolom 7..16, baris 6..17)
  const shield = ["..XXXXXXXX..", ".XXXXXXXXXX.", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "XXXXXXXXXXXX", ".XXXXXXXXXX.", ".XXXXXXXXXX.", "..XXXXXXXX..", "...XXXXXX...", "....XXXX....", ".....XX....."];
  shield.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === "X") add(6 + i, 6 + j, (i < 6) ? "#b32424" : "#8f1a1a"); }));
  // garis tepi emas perisai (baris atas)
  for (let i = 2; i < 10; i++) add(6 + i, 6, "#ffd24a");
  // pedang menyilang (diagonal)
  for (let k = 0; k < 14; k++) {
    add(2 + k, 2 + k, "#e8e8f0"); add(3 + k, 2 + k, "#9aa0b0");
    add(23 - k, 2 + k, "#e8e8f0"); add(22 - k, 2 + k, "#9aa0b0");
  }
  // gagang
  add(1, 1, "#ffd24a", 3, 1); add(0, 2, "#7a3b12", 1, 1); add(24, 1, "#ffd24a", 3, 1); add(26, 2, "#7a3b12", 1, 1);
  // bintang emas di perisai
  [[11, 10], [10, 11], [11, 11], [12, 11], [11, 12]].forEach(([x, y]) => add(x, y, "#ffd24a"));
  return jsx("svg", { className: "apw-logo", viewBox: `0 0 ${27 * P} ${19 * P}`, xmlns: "http://www.w3.org/2000/svg", role: "img", "aria-label": "Age of Pixel War", children: rects });
}
