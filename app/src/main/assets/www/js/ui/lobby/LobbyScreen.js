"use strict";
/* Lobby: pemilihan bangsa yang jelas + konfigurasi pertandingan. */
function LobbyScreen({ onStart }) {
  const [nationId, setNationId] = React.useState("british");
  const [opponentCount, setOpponentCount] = React.useState(2);
  const [opponents, setOpponents] = React.useState(() => [
    { idx: 0, nationId: "french", difficulty: "Normal", team: "enemy" },
    { idx: 1, nationId: "spanish", difficulty: "Normal", team: "enemy" }
  ]);

  React.useEffect(() => {
    setOpponents((current) => {
      const next = current.slice(0, opponentCount);
      for (let i = next.length; i < opponentCount; i++) {
        const nation = NATIONS[(i + 2) % NATIONS.length];
        next.push({ idx: i, nationId: nation.id, difficulty: i === 0 ? "Hard" : "Normal", team: i === opponentCount - 1 && opponentCount > 3 ? "ally" : "enemy" });
      }
      return next;
    });
  }, [opponentCount]);

  const selectedNation = getNation(nationId);
  const mapSize = 28 + opponentCount * 5;
  const mapLabel = mapSize < 35 ? "SMALL" : mapSize < 45 ? "MEDIUM" : "LARGE";
  const updateOpponent = (index, changes) => setOpponents((current) => current.map((item, i) => i === index ? { ...item, ...changes } : item));

  return jsxs("div", {
    className: "w-full h-full overflow-y-auto overflow-x-hidden text-[#f4ead4] bg-[#101923]",
    style: { fontFamily: '"Courier New", monospace' },
    children: [
      jsxs("header", {
        className: "sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 border-b-2 border-[#c69b54] bg-[#111b27]/95 shadow-lg",
        children: [
          jsxs("div", { className: "min-w-0", children: [
            jsx("div", { className: "text-[10px] tracking-[.28em] text-[#c69b54] font-bold", children: "AGE OF PIXEL WAR" }),
            jsx("h1", { className: "text-lg sm:text-xl font-black tracking-[.12em] leading-tight", children: "PERSIAPAN PERANG" })
          ]}),
          jsx("div", { className: "shrink-0 text-[9px] tracking-widest text-[#b8c5d3] border border-[#536579] px-3 py-2", children: "TAHAP 01 / 02" })
        ]
      }),
      jsxs("main", {
        className: "max-w-[1440px] mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,.8fr)] gap-4",
        children: [
          jsxs("section", { className: "min-w-0", children: [
            jsxs("div", { className: "mb-3 flex flex-wrap items-end justify-between gap-2", children: [
              jsxs("div", { children: [
                jsx("div", { className: "text-[10px] font-bold tracking-[.25em] text-[#d8b36d]", children: "PILIH PERADABANMU" }),
                jsx("h2", { className: "text-xl sm:text-2xl font-black mt-1", children: "Pilih Negara" }),
                jsx("p", { className: "text-[11px] text-[#aebdca] mt-1", children: "Pilih satu negara untuk memimpin pasukanmu." })
              ]}),
              jsx("div", { className: "text-[10px] text-[#aebdca] border border-[#405367] px-3 py-2", children: "8 NEGARA TERSEDIA" })
            ]}),
            jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: NATIONS.map((nation) => {
              const active = nationId === nation.id;
              return jsxs("button", {
                type: "button",
                onClick: () => setNationId(nation.id),
                "aria-pressed": active,
                className: "relative min-w-0 text-left p-3 border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#e8c47c] " + (active ? "bg-[#263b4d] border-[#e8c47c] shadow-[0_0_0_2px_#263b4d,0_0_18px_rgba(232,196,124,.18)]" : "bg-[#182634] border-[#405367] hover:border-[#8fa4b8]"),
                children: [
                  jsxs("div", { className: "flex items-center justify-between gap-1 mb-2", children: [
                    jsx("span", { className: "text-2xl leading-none", children: nation.flag }),
                    active ? jsx("span", { className: "text-[9px] font-black tracking-wider text-[#17212b] bg-[#e8c47c] px-2 py-1", children: "DIPILIH" }) : jsx("span", { className: "w-4 h-4 border border-[#60758a] rounded-full" })
                  ]}),
                  jsx("div", { className: "font-black text-[12px] sm:text-sm tracking-wider truncate", children: nation.name.toUpperCase() }),
                  jsx("div", { className: "h-[3px] w-full my-2", style: { background: nation.color } }),
                  jsx("div", { className: "text-[9px] sm:text-[10px] leading-snug text-[#b8c5d3] min-h-[28px]", children: nation.description })
                ]
              }, nation.id);
            })}),
            jsxs("div", { className: "mt-3 p-3 sm:p-4 border border-[#c69b54] bg-[#1b2a38] grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-3", children: [
              jsxs("div", { className: "flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 sm:min-w-[110px]", children: [
                jsx("span", { className: "text-4xl", children: selectedNation.flag }),
                jsxs("div", { children: [
                  jsx("div", { className: "text-[9px] tracking-[.2em] text-[#d8b36d]", children: "NEGARA PILIHAN" }),
                  jsx("div", { className: "text-lg font-black tracking-wider", children: selectedNation.name.toUpperCase() })
                ]})
              ]}),
              jsxs("div", { className: "min-w-0", children: [
                jsx("p", { className: "text-[11px] leading-relaxed text-[#d2dce5]", children: selectedNation.description }),
                jsxs("div", { className: "mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2", children: [
                  jsxs("div", { className: "p-2 bg-[#111b27] border border-[#405367]", children: [
                    jsx("div", { className: "text-[9px] tracking-widest text-[#d8b36d] mb-1", children: "KEUNGGULAN" }),
                    jsx("ul", { className: "space-y-1", children: selectedNation.bonuses.map((bonus) => jsxs("li", { className: "text-[10px] text-[#e5edf4] flex gap-2", children: [jsx("span", { className: "text-[#e8c47c]", children: "◆" }), bonus] }, bonus)) })
                  ]}),
                  jsxs("div", { className: "p-2 bg-[#111b27] border border-[#405367]", children: [
                    jsx("div", { className: "text-[9px] tracking-widest text-[#d8b36d] mb-1", children: "UNIT KHUSUS" }),
                    jsx("div", { className: "text-sm font-black", children: selectedNation.uniqueUnit.toUpperCase() }),
                    jsx("div", { className: "text-[9px] text-[#aebdca] mt-1", children: "Unit khas peradaban ini." }),
                    jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                      jsx("span", { className: "w-3 h-3 border border-white/30", style: { background: selectedNation.color } }),
                      jsx("span", { className: "text-[9px] text-[#aebdca]", children: "Warna pasukan" })
                    ]})
                  ]})
                ]})
              ]})
            ]})
          ]}),
          jsxs("aside", { className: "min-w-0 flex flex-col gap-3", children: [
            jsxs("section", { className: "p-3 sm:p-4 bg-[#182634] border border-[#405367]", children: [
              jsx("div", { className: "text-[10px] tracking-[.22em] text-[#d8b36d] font-bold", children: "PENGATURAN PERTANDINGAN" }),
              jsx("h2", { className: "text-lg font-black mt-1", children: "Lawan & Peta" }),
              jsxs("div", { className: "mt-3 flex items-center justify-between gap-3", children: [
                jsx("label", { htmlFor: "opponent-count", className: "text-[11px] text-[#d2dce5]", children: "Jumlah lawan" }),
                jsxs("span", { className: "text-sm font-black text-[#e8c47c]", children: [opponentCount, " / 7"] })
              ]}),
              jsx("input", { id: "opponent-count", type: "range", min: 1, max: 7, value: opponentCount, onChange: (event) => setOpponentCount(Number(event.target.value)), className: "w-full mt-2 accent-[#e8c47c]" }),
              jsxs("div", { className: "grid grid-cols-2 gap-2 mt-3", children: [
                jsxs("div", { className: "p-2 bg-[#111b27] border border-[#405367]", children: [
                  jsx("div", { className: "text-[9px] text-[#aebdca] tracking-widest", children: "UKURAN PETA" }),
                  jsx("div", { className: "font-black text-sm mt-1", children: mapLabel }),
                  jsxs("div", { className: "text-[10px] text-[#d2dce5]", children: [mapSize, " × ", mapSize, " tile"] })
                ]}),
                jsxs("div", { className: "p-2 bg-[#111b27] border border-[#405367]", children: [
                  jsx("div", { className: "text-[9px] text-[#aebdca] tracking-widest", children: "TOTAL NEGARA" }),
                  jsx("div", { className: "font-black text-sm mt-1", children: opponentCount + 1 }),
                  jsx("div", { className: "text-[10px] text-[#d2dce5]", children: "Termasuk negaramu" })
                ]})
              ]}),
              jsx("div", { className: "mt-4 text-[9px] tracking-widest text-[#d8b36d] font-bold", children: "PENGATURAN SETIAP LAWAN" }),
              jsx("div", { className: "mt-2 space-y-2 max-h-[310px] overflow-y-auto pr-1", children: opponents.map((opponent, index) => {
                const nation = getNation(opponent.nationId);
                return jsxs("div", { className: "p-2 bg-[#111b27] border border-[#405367]", children: [
                  jsxs("div", { className: "flex items-center justify-between gap-2 mb-2", children: [
                    jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                      jsx("span", { className: "text-xl", children: nation.flag }),
                      jsxs("div", { className: "min-w-0", children: [
                        jsx("div", { className: "text-[10px] font-black", children: "LAWAN " + (index + 1) }),
                        jsx("div", { className: "text-[9px] text-[#aebdca] truncate", children: nation.name })
                      ]})
                    ]}),
                    jsx("button", { type: "button", onClick: () => updateOpponent(index, { team: opponent.team === "enemy" ? "ally" : "enemy" }), className: "shrink-0 px-2 py-1 text-[9px] font-black border " + (opponent.team === "ally" ? "bg-[#315a45] border-[#75b98b] text-white" : "bg-[#5b3038] border-[#c87979] text-white"), children: opponent.team === "ally" ? "SEKUTU" : "MUSUH" })
                  ]}),
                  jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                    jsxs("label", { className: "text-[9px] text-[#aebdca]", children: [
                      "NEGARA",
                      jsx("select", { value: opponent.nationId, onChange: (event) => updateOpponent(index, { nationId: event.target.value }), className: "block w-full mt-1 p-2 bg-[#263b4d] border border-[#536b80] text-[#f4ead4] text-[10px]", children: NATIONS.map((item) => jsx("option", { value: item.id, children: item.name }, item.id)) })
                    ]}),
                    jsxs("label", { className: "text-[9px] text-[#aebdca]", children: [
                      "KESULITAN",
                      jsx("select", { value: opponent.difficulty, onChange: (event) => updateOpponent(index, { difficulty: event.target.value }), className: "block w-full mt-1 p-2 bg-[#263b4d] border border-[#536b80] text-[#f4ead4] text-[10px]", children: ["Easy", "Normal", "Hard", "Expert"].map((level) => jsx("option", { value: level, children: level }, level)) })
                    ]})
                  ]})
                ]}, index);
              })})
            ]}),
            jsxs("div", { className: "p-3 bg-[#182634] border border-[#405367]", children: [
              jsx("div", { className: "text-[9px] text-[#d8b36d] tracking-widest font-bold", children: "SEBELUM MEMULAI" }),
              jsx("p", { className: "text-[10px] leading-relaxed text-[#b8c5d3] mt-1", children: "Negara yang kamu pilih akan menjadi peradaban pemain. Sekutu berbagi penglihatan peta; musuh akan menyerang sesuai tingkat kesulitan." }),
              jsx("button", { type: "button", onClick: () => onStart({ playerNationId: nationId, opponents, mapSize }), className: "w-full mt-3 py-3 px-3 bg-[#d8ad62] hover:bg-[#edc77e] active:translate-y-px text-[#17212b] border-2 border-[#f6d99f] font-black tracking-[.14em] text-[12px] shadow-[0_3px_0_#75542c] transition-all", children: ["MULAI PERTANDINGAN  ▶"] })
            ]})
          ]})
        ]
      })
    ]
  });
}
