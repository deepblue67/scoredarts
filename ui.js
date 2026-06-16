var DartsUI = (function() {
  function h() {
    return React.createElement.apply(React, arguments);
  }

  function DartBoard(props) {
    var onScore = props.onScore, disabled = props.disabled, C = props.C;
    var highlightSectors = props.highlightSectors || null;
    var segments = props.segments || [];
    var cx = 200, cy = 200;
    var R = { bullseye: 12, bull: 28, innerSingle: 96, triple: 108, outerSingle: 160, double: 172, board: 190 };
    var SEG = 18;
    var flashState = React.useState(null);
    var flash = flashState[0], setFlash = flashState[1];

    function rad(degrees) { return degrees * Math.PI / 180; }
    function arc(r1, r2, start, end) {
      var sa = rad(start - 90), ea = rad(end - 90);
      var x1 = cx + r1 * Math.cos(sa), y1 = cy + r1 * Math.sin(sa);
      var x2 = cx + r2 * Math.cos(sa), y2 = cy + r2 * Math.sin(sa);
      var x3 = cx + r2 * Math.cos(ea), y3 = cy + r2 * Math.sin(ea);
      var x4 = cx + r1 * Math.cos(ea), y4 = cy + r1 * Math.sin(ea);
      return "M" + x1 + " " + y1 + " A" + r1 + " " + r1 + " 0 0 1 " + x4 + " " + y4 +
        " L" + x3 + " " + y3 + " A" + r2 + " " + r2 + " 0 0 0 " + x2 + " " + y2 + "Z";
    }
    function labelPoint(radius, degrees) {
      var angle = rad(degrees - 90);
      return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    }
    function opacityFor(num) {
      if (!highlightSectors) return 1;
      return highlightSectors.indexOf(num) >= 0 ? 1 : 0.25;
    }
    function hit(value, multiplier, zone) {
      if (disabled) return;
      setFlash(zone);
      setTimeout(function() { setFlash(null); }, 350);
      var label = multiplier === 3 ? "T" + value : multiplier === 2 ? "D" + value :
        value === 25 ? "Bull" : value === 50 ? "Bull" : "" + value;
      onScore({
        value: value,
        multiplier: multiplier,
        score: value * multiplier,
        label: label,
        isDouble: multiplier === 2,
        isBull: value === 50 || value === 25
      });
    }

    var children = [
      h("circle", { key: "board-shadow", cx: cx, cy: cy, r: R.board + 8, fill: "#1a1108" }),
      h("circle", { key: "board-bg", cx: cx, cy: cy, r: R.board, fill: "#0d0d0d" })
    ];

    segments.forEach(function(num, index) {
      var start = index * SEG - SEG / 2, end = start + SEG;
      var even = index % 2 === 0;
      var base = even ? C.dartBlack : C.dartCream;
      var ring = even ? C.dartRed : C.dartGreen;
      var zoneOpacity = opacityFor(num);
      [
        { r1: R.bull, r2: R.innerSingle, multiplier: 1, color: base, zone: "s-" + num },
        { r1: R.innerSingle, r2: R.triple, multiplier: 3, color: ring, zone: "t-" + num },
        { r1: R.triple, r2: R.outerSingle, multiplier: 1, color: base, zone: "o-" + num },
        { r1: R.outerSingle, r2: R.double, multiplier: 2, color: ring, zone: "d-" + num }
      ].forEach(function(zone) {
        children.push(h("path", {
          key: zone.zone,
          d: arc(zone.r1, zone.r2, start, end),
          fill: flash === zone.zone ? C.accent : zone.color,
          stroke: "#1a1a1a",
          strokeWidth: 0.6,
          opacity: zoneOpacity,
          style: { cursor: disabled ? "default" : "pointer", transition: "fill 0.12s" },
          onClick: function() { hit(num, zone.multiplier, zone.zone); }
        }));
      });
    });

    segments.forEach(function(num, index) {
      var point = labelPoint(R.board - 11, index * SEG);
      children.push(h("text", {
        key: "n" + num,
        x: point.x,
        y: point.y,
        textAnchor: "middle",
        dominantBaseline: "middle",
        fontSize: 11,
        fontWeight: "bold",
        fill: C.dartCream,
        fontFamily: "monospace",
        opacity: opacityFor(num),
        style: { pointerEvents: "none", userSelect: "none" }
      }, num));
    });

    children.push(
      h("circle", {
        key: "bull25",
        cx: cx,
        cy: cy,
        r: R.bull,
        fill: flash === "bull25" ? C.accent : C.dartGreen,
        stroke: "#333",
        strokeWidth: 1,
        opacity: opacityFor(25),
        style: { cursor: disabled ? "default" : "pointer", transition: "fill 0.12s" },
        onClick: function() { hit(25, 1, "bull25"); }
      }),
      h("circle", {
        key: "bull50",
        cx: cx,
        cy: cy,
        r: R.bullseye,
        fill: flash === "bull50" ? C.accent : C.dartRed,
        stroke: "#222",
        strokeWidth: 1,
        opacity: opacityFor(25),
        style: { cursor: disabled ? "default" : "pointer", transition: "fill 0.12s" },
        onClick: function() { hit(50, 1, "bull50"); }
      }),
      h("text", {
        key: "bull-label",
        x: cx,
        y: cy,
        textAnchor: "middle",
        dominantBaseline: "middle",
        fontSize: 8,
        fontWeight: "bold",
        fill: "#fff",
        fontFamily: "monospace",
        style: { pointerEvents: "none", userSelect: "none" }
      }, "50")
    );

    if (disabled) {
      children.push(h("rect", {
        key: "disabled",
        x: 0,
        y: 0,
        width: 400,
        height: 400,
        fill: "rgba(0,0,0,0.45)",
        style: { cursor: "default" }
      }));
    }

    return h("svg", {
      viewBox: "0 0 400 400",
      className: "dartboard-svg",
      style: {
        width: "100%",
        display: "block",
        margin: "0 auto",
        filter: "drop-shadow(0 6px 24px #000b)",
        touchAction: "none"
      }
    }, children);
  }

  function ThrowDots(props) {
    var throws = props.throws, max = props.max, C = props.C;
    return h("div", { style: { display: "flex", gap: 8 } },
      Array.from({ length: max }).map(function(_, index) {
        var dart = throws[index];
        return h("div", {
          key: index,
          className: dart ? "pop-in" : "",
          style: {
            width: 40,
            height: 38,
            borderRadius: 9,
            background: dart ? C.card : "transparent",
            border: "2px solid " + (dart ? C.accent : C.border),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: dart ? C.accent : C.muted,
            fontSize: (dart && dart.label.length > 3) ? 10 : 12,
            fontWeight: "bold"
          }
        }, dart ? dart.label : "");
      })
    );
  }

  function BustOverlay(props) {
    var show = props.show, onDone = props.onDone, C = props.C;
    React.useEffect(function() {
      if (!show) return;
      var timer = setTimeout(onDone, 1500);
      return function() { clearTimeout(timer); };
    }, [show]);

    if (!show) return null;
    return h("div", {
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(180,10,10,0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        backdropFilter: "blur(3px)"
      }
    }, h("div", {
      className: "bust-in",
      style: {
        background: C.red,
        borderRadius: 24,
        padding: "28px 52px",
        textAlign: "center"
      }
    },
      h("div", { style: { fontSize: 52 } }, "BUST"),
      h("div", { style: { color: "#fff", fontSize: 34, fontWeight: "bold", letterSpacing: 4 } }, "BUST!"),
      h("div", { style: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 6 } }, "Tour annule")
    ));
  }

  function ActionButtons(props) {
    var canUndo = props.canUndo, onUndo = props.onUndo;
    var canPass = props.canPass, onPass = props.onPass;
    var turnComplete = props.turnComplete, onValidate = props.onValidate, C = props.C;
    return h("div", { style: { display: "flex", gap: 8 } },
      h("button", {
        onClick: onUndo,
        disabled: !canUndo,
        style: {
          flex: 1,
          background: canUndo ? C.card : C.surface,
          border: "1px solid " + C.border,
          borderRadius: 12,
          padding: "13px 0",
          color: canUndo ? C.text : C.muted,
          fontSize: 13,
          cursor: canUndo ? "pointer" : "default",
          letterSpacing: 1,
          fontFamily: "Georgia,serif",
          transition: "all 0.2s"
        }
      }, "Annuler"),
      h("button", {
        onClick: onPass,
        disabled: !canPass,
        style: {
          flex: 1,
          background: C.surface,
          border: "1px solid " + C.border,
          borderRadius: 12,
          padding: "13px 0",
          color: canPass ? C.muted : "transparent",
          fontSize: 13,
          cursor: canPass ? "pointer" : "default",
          fontFamily: "Georgia,serif"
        }
      }, "Passer"),
      h("button", {
        onClick: onValidate,
        disabled: !turnComplete,
        style: {
          flex: 1.4,
          background: turnComplete ? "linear-gradient(135deg," + C.green + ",#1a9450)" : C.surface,
          border: "1px solid " + (turnComplete ? C.green : C.border),
          borderRadius: 12,
          padding: "13px 0",
          color: turnComplete ? "#fff" : C.muted,
          fontSize: 13,
          fontWeight: "bold",
          cursor: turnComplete ? "pointer" : "default",
          letterSpacing: 1,
          fontFamily: "Georgia,serif",
          boxShadow: turnComplete ? "0 0 16px " + C.green + "55" : "none",
          transition: "all 0.3s"
        }
      }, turnComplete ? "Valider" : "Valider")
    );
  }

  function QuitModal(props) {
    var onCancel = props.onCancel, onConfirm = props.onConfirm, C = props.C;
    return h("div", {
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 700,
        backdropFilter: "blur(4px)",
        padding: 24
      }
    }, h("div", {
      className: "slide-up",
      style: {
        background: C.card,
        borderRadius: 20,
        padding: 28,
        width: "100%",
        maxWidth: 320,
        border: "1px solid " + C.border,
        textAlign: "center"
      }
    },
      h("div", { style: { fontSize: 18, color: C.text, fontWeight: "bold", marginBottom: 8 } }, "Quitter la partie ?"),
      h("div", { style: { color: C.muted, fontSize: 13, marginBottom: 24 } }, "La partie est sauvegardee."),
      h("div", { style: { display: "flex", gap: 10 } },
        h("button", {
          onClick: onCancel,
          style: {
            flex: 1,
            background: C.surface,
            border: "1px solid " + C.border,
            borderRadius: 12,
            padding: "14px 0",
            color: C.text,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "Georgia,serif"
          }
        }, "Continuer"),
        h("button", {
          onClick: onConfirm,
          style: {
            flex: 1,
            background: "linear-gradient(135deg," + C.red + ",#a01010)",
            border: "none",
            borderRadius: 12,
            padding: "14px 0",
            color: "#fff",
            fontSize: 14,
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "Georgia,serif"
          }
        }, "Quitter")
      )
    ));
  }

  function ConfirmModal(props) {
    var team = props.team, teamIdx = props.teamIdx, throws = props.throws;
    var projected = props.projected, onConfirm = props.onConfirm, onCancel = props.onCancel, C = props.C;
    var teamColors = props.teamColors || [];
    var color = teamColors[teamIdx] || C.accent;

    return h("div", {
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 600,
        backdropFilter: "blur(4px)",
        padding: 20
      }
    }, h("div", {
      className: "slide-up",
      style: {
        background: C.card,
        borderRadius: 20,
        padding: 26,
        width: "100%",
        maxWidth: 340,
        border: "1px solid " + C.border
      }
    },
      h("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 18 } },
        h("div", { style: { width: 10, height: 10, borderRadius: "50%", background: color } }),
        h("div", {
          style: {
            color: color,
            fontSize: 14,
            fontWeight: "bold",
            letterSpacing: 1,
            textTransform: "uppercase"
          }
        }, team.name)
      ),
      h("div", {
        style: { color: C.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }
      }, "Lancers du tour"),
      h("div", { style: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 18 } },
        throws.map(function(throwItem, index) {
          return h("div", {
            key: index,
            style: {
              flex: 1,
              background: C.surface,
              border: "1px solid " + C.border,
              borderRadius: 10,
              padding: "12px 6px",
              textAlign: "center"
            }
          },
            h("div", { style: { color: C.muted, fontSize: 10, marginBottom: 4 } }, "#" + (index + 1)),
            h("div", { style: { color: C.accent, fontSize: 20, fontWeight: "bold", fontFamily: "monospace" } }, throwItem.label),
            h("div", { style: { color: C.muted, fontSize: 11, marginTop: 2 } }, throwItem.score + " pts")
          );
        })
      ),
      h("div", {
        style: {
          background: C.surface,
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          border: "1px solid " + C.border
        }
      },
        h("span", { style: { color: C.muted, fontSize: 13 } }, "Score apres ce tour"),
        h("span", { style: { color: C.green, fontSize: 22, fontWeight: "bold", fontFamily: "monospace" } }, team.score + " -> " + projected)
      ),
      h("div", { style: { display: "flex", gap: 10 } },
        h("button", {
          onClick: onCancel,
          style: {
            flex: 1,
            background: C.surface,
            border: "1px solid " + C.border,
            borderRadius: 12,
            padding: "14px 0",
            color: C.text,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "Georgia,serif"
          }
        }, "Corriger"),
        h("button", {
          onClick: onConfirm,
          style: {
            flex: 1.5,
            background: "linear-gradient(135deg," + C.green + ",#1a9450)",
            border: "none",
            borderRadius: 12,
            padding: "14px 0",
            color: "#fff",
            fontSize: 14,
            fontWeight: "bold",
            cursor: "pointer",
            letterSpacing: 1,
            fontFamily: "Georgia,serif",
            boxShadow: "0 4px 14px " + C.green + "55"
          }
        }, "Valider")
      )
    ));
  }

  function HistoryDrawer(props) {
    var history = props.history, teams = props.teams, onClose = props.onClose, C = props.C;
    var teamColors = props.teamColors || [];
    return h("div", {
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        zIndex: 500,
        display: "flex",
        alignItems: "flex-end"
      },
      onClick: onClose
    }, h("div", {
      style: {
        background: C.surface,
        borderRadius: "20px 20px 0 0",
        width: "100%",
        maxHeight: "72vh",
        padding: 20,
        overflowY: "auto",
        border: "1px solid " + C.border
      },
      onClick: function(event) { event.stopPropagation(); }
    },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } },
        h("h3", { style: { color: C.text, fontSize: 15, letterSpacing: 2, textTransform: "uppercase" } }, "Historique du tour"),
        h("button", {
          onClick: onClose,
          style: { background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }
        }, "x")
      ),
      history.length === 0
        ? h("p", { style: { color: C.muted, textAlign: "center", padding: 20 } }, "Aucun tour joue.")
        : history.slice().reverse().map(function(entry, index) {
          var teamIndex = -1;
          for (var k = 0; k < teams.length; k++) {
            if (teams[k].id === entry.teamId) {
              teamIndex = k;
              break;
            }
          }
          var color = teamIndex >= 0 ? teamColors[teamIndex] : C.accent;
          return h("div", {
            key: index,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 0",
              borderBottom: "1px solid " + C.border
            }
          },
            h("div", { style: { width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 } }),
            h("div", { style: { flex: 1 } },
              h("div", { style: { color: color, fontSize: 12, fontWeight: "bold" } }, entry.teamName),
              h("div", { style: { color: C.muted, fontSize: 11, marginTop: 2 } },
                entry.throws.map(function(throwItem) { return throwItem.label; }).join(" / ") + (entry.bust ? " BUST" : "")
              )
            ),
            h("div", { style: { textAlign: "right" } },
              h("div", {
                style: {
                  color: entry.bust ? C.red : C.green,
                  fontSize: 14,
                  fontWeight: "bold",
                  fontFamily: "monospace"
                }
              }, entry.bust ? "annule" : entry.total > 0 ? "+" + entry.total : "-"),
              entry.scoreBefore !== undefined
                ? h("div", { style: { color: C.muted, fontSize: 11 } }, entry.scoreBefore + " -> " + entry.scoreAfter)
                : null
            )
          );
        })
    ));
  }

  function GameLayout(props) {
    var leftContent = props.leftContent;
    var boardContent = props.boardContent;
    return h("div", {
      className: "game-layout",
      style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }
    },
      h("div", {
        className: "game-left",
        style: { display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px" }
      }, leftContent),
      h("div", {
        className: "game-right",
        style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }
      }, boardContent)
    );
  }

  function ResumeScreen(props) {
    var saved = props.saved, onResume = props.onResume, onNewGame = props.onNewGame, C = props.C;
    var teamColors = props.teamColors || [];
    var teams = saved.teams || [];
    var isCricket = saved.gameType === "cricket";
    var label = isCricket ? "Cricket" : (saved.gameType || "301").toUpperCase();

    return h("div", {
      style: {
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Georgia,serif"
      }
    },
      h("div", { style: { fontSize: 52, marginBottom: 16 } }, isCricket ? "CR" : "01"),
      h("h1", {
        style: {
          color: C.accent,
          fontSize: 26,
          fontWeight: "bold",
          letterSpacing: 3,
          textAlign: "center",
          marginBottom: 8
        }
      }, "PARTIE EN COURS"),
      h("div", {
        style: {
          color: C.accent,
          fontSize: 12,
          marginBottom: 20,
          background: C.card,
          padding: "4px 14px",
          borderRadius: 20,
          border: "1px solid " + C.border
        }
      }, label),
      h("div", {
        style: {
          width: "100%",
          maxWidth: 360,
          background: C.surface,
          borderRadius: 16,
          padding: 20,
          border: "1px solid " + C.border,
          marginBottom: 28
        }
      },
        h("div", {
          style: { color: C.accent, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }
        }, isCricket ? "Etat des equipes" : "Scores actuels"),
        teams.map(function(team, index) {
          var color = teamColors[index] || C.accent;
          return h("div", {
            key: team.id || index,
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: index < teams.length - 1 ? "1px solid " + C.border : "none"
            }
          },
            h("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
              h("div", { style: { width: 8, height: 8, borderRadius: "50%", background: color } }),
              h("span", { style: { color: C.text, fontSize: 14 } }, team.name)
            ),
            h("span", {
              style: {
                color: color,
                fontSize: isCricket ? 13 : 22,
                fontWeight: "bold",
                fontFamily: "monospace"
              }
            }, isCricket ? "en cours" : team.score)
          );
        })
      ),
      h("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" } },
        h("button", {
          onClick: onNewGame,
          style: {
            background: C.card,
            border: "1px solid " + C.border,
            borderRadius: 12,
            padding: "14px 24px",
            color: C.muted,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "Georgia,serif"
          }
        }, "Nouvelle partie"),
        h("button", {
          onClick: onResume,
          style: {
            background: "linear-gradient(135deg," + C.accent + "," + C.accentDim + ")",
            border: "none",
            borderRadius: 12,
            padding: "14px 28px",
            color: "#000",
            fontSize: 15,
            fontWeight: "bold",
            cursor: "pointer",
            letterSpacing: 1,
            fontFamily: "Georgia,serif",
            boxShadow: "0 4px 14px " + C.accent + "55"
          }
        }, "Reprendre")
      )
    );
  }

  function WinScreen(props) {
    var winner = props.winner, stats = props.stats, gameType = props.gameType;
    var onRestart = props.onRestart, onNewGame = props.onNewGame, onSameTeams = props.onSameTeams, C = props.C;
    var avg = stats.totalThrows > 0 && gameType !== "cricket" ?
      ((gameType === "501" ? 501 : 301) / stats.totalThrows * 3).toFixed(1) : "-";
    var items = [
      { label: "Tours joues", value: stats.rounds },
      { label: "Total lancers", value: stats.totalThrows },
      { label: "Moy. / tour", value: avg },
      { label: "Meilleur tour", value: stats.bestTurn !== null ? stats.bestTurn : "-" }
    ];

    return h("div", {
      style: {
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Georgia,serif"
      }
    },
      h("div", { className: "spin-win", style: { fontSize: 76, marginBottom: 12 } }, gameType === "cricket" ? "CR" : "01"),
      h("h1", {
        className: "slide-up",
        style: {
          color: C.accent,
          fontSize: 30,
          fontWeight: "bold",
          letterSpacing: 4,
          textAlign: "center",
          textShadow: "0 0 28px " + C.accent + "99",
          marginBottom: 8
        }
      }, "VICTOIRE !"),
      h("p", { className: "slide-up", style: { color: C.text, fontSize: 20, marginBottom: 28 } }, winner.name),
      h("div", {
        className: "slide-up",
        style: {
          background: C.surface,
          borderRadius: 16,
          padding: 22,
          width: "100%",
          maxWidth: 360,
          border: "1px solid " + C.border,
          marginBottom: 24
        }
      },
        h("h3", {
          style: { color: C.accent, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }
        }, "Statistiques"),
        h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
          items.map(function(item, index) {
            return h("div", {
              key: index,
              style: { background: C.card, borderRadius: 10, padding: "12px 10px", textAlign: "center" }
            },
              h("div", { style: { color: C.muted, fontSize: 10, letterSpacing: 1, marginBottom: 4 } }, item.label),
              h("div", { style: { color: C.text, fontSize: 22, fontWeight: "bold", fontFamily: "monospace" } }, item.value)
            );
          })
        )
      ),
      h("div", { style: { display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360 } },
        h("button", {
          onClick: onSameTeams,
          style: {
            background: "linear-gradient(135deg," + C.accent + "," + C.accentDim + ")",
            border: "none",
            borderRadius: 12,
            padding: "16px 0",
            color: "#000",
            fontSize: 15,
            fontWeight: "bold",
            cursor: "pointer",
            letterSpacing: 1,
            fontFamily: "Georgia,serif",
            boxShadow: "0 4px 16px " + C.accent + "55"
          }
        }, "Rejouer avec les memes equipes"),
        h("div", { style: { display: "flex", gap: 10 } },
          h("button", {
            onClick: onRestart,
            style: {
              flex: 1,
              background: C.card,
              border: "1px solid " + C.border,
              borderRadius: 12,
              padding: "14px 0",
              color: C.text,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "Georgia,serif"
            }
          }, "Reconfigurer"),
          h("button", {
            onClick: onNewGame,
            style: {
              flex: 1,
              background: C.surface,
              border: "1px solid " + C.border,
              borderRadius: 12,
              padding: "14px 0",
              color: C.muted,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "Georgia,serif"
            }
          }, "Accueil")
        )
      )
    );
  }

  function SettingsScreen(props) {
    var onClose = props.onClose, C = props.C, darkMode = props.darkMode;
    var onSetDarkMode = props.onSetDarkMode, onClearHistory = props.onClearHistory, onClearSave = props.onClearSave;
    var version = props.version;
    var themes = [
      { value: true, icon: "Dark", label: "Sombre" },
      { value: false, icon: "Light", label: "Clair" }
    ];

    function dataButton(label, description, icon, onClick) {
      return h("button", {
        onClick: onClick,
        style: {
          background: "none",
          border: "1px solid " + C.border,
          borderRadius: 10,
          padding: "13px 16px",
          color: C.muted,
          fontSize: 13,
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "Georgia,serif",
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      },
        h("span", { style: { fontSize: 14, color: C.accent, minWidth: 38 } }, icon),
        h("div", null,
          h("div", { style: { color: C.text, fontSize: 13, fontWeight: "bold" } }, label),
          h("div", { style: { color: C.muted, fontSize: 11, marginTop: 2 } }, description)
        )
      );
    }

    return h("div", {
      style: {
        position: "fixed",
        inset: 0,
        background: C.bg,
        zIndex: 900,
        overflowY: "auto",
        fontFamily: "Georgia,serif",
        paddingBottom: 40
      }
    },
      h("div", {
        style: {
          background: C.headerBg,
          borderBottom: "1px solid " + C.border,
          padding: "16px 20px",
          paddingTop: "max(16px,env(safe-area-inset-top,16px))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
        h("button", {
          onClick: onClose,
          style: { background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer" }
        }, "Retour"),
        h("h2", {
          style: { color: C.accent, fontSize: 16, fontWeight: "bold", letterSpacing: 2, textTransform: "uppercase" }
        }, "Reglages"),
        h("div", { style: { width: 60 } })
      ),
      h("div", { style: { padding: "20px 16px", maxWidth: 480, margin: "0 auto" } },
        h("div", {
          style: { background: C.surface, borderRadius: 14, padding: 18, border: "1px solid " + C.border, marginBottom: 16 }
        },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
            h("div", null,
              h("div", {
                style: { color: C.accent, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }
              }, "Version de l'application"),
              h("div", { style: { color: C.text, fontSize: 20, fontWeight: "bold", fontFamily: "monospace" } }, version)
            ),
            h("div", { style: { fontSize: 14, color: C.accent, fontWeight: "bold" } }, "DARTS")
          ),
          h("div", { style: { color: C.muted, fontSize: 11, marginTop: 8, lineHeight: 1.5 } },
            "L'application fonctionne hors ligne grace au Service Worker. Lors d'une mise a jour, la page se recharge pour charger la nouvelle version."
          )
        ),
        h("div", {
          style: { background: C.surface, borderRadius: 14, padding: 18, border: "1px solid " + C.border, marginBottom: 16 }
        },
          h("div", {
            style: { color: C.accent, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }
          }, "Apparence"),
          h("div", { style: { display: "flex", gap: 10 } },
            themes.map(function(option) {
              var active = darkMode === option.value;
              return h("div", {
                key: "" + option.value,
                onClick: function() { onSetDarkMode(option.value); },
                style: {
                  flex: 1,
                  background: active ? C.card : C.inputBg,
                  border: "2px solid " + (active ? C.accent : C.border),
                  borderRadius: 12,
                  padding: "14px 10px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }
              },
                h("div", { style: { color: active ? C.accent : C.muted, fontSize: 12, marginBottom: 4 } }, option.icon),
                h("div", { style: { color: active ? C.accent : C.muted, fontSize: 13, fontWeight: active ? "bold" : "normal" } }, option.label)
              );
            })
          )
        ),
        h("div", {
          style: { background: C.surface, borderRadius: 14, padding: 18, border: "1px solid " + C.border, marginBottom: 16 }
        },
          h("div", {
            style: { color: C.accent, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }
          }, "Donnees"),
          h("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
            dataButton("Effacer l'historique", "Supprime toutes les parties enregistrees", "Stats", onClearHistory),
            dataButton("Effacer la partie sauvegardee", "Annule la reprise de partie en cours", "Save", onClearSave)
          )
        ),
        h("div", {
          style: { background: C.surface, borderRadius: 14, padding: 18, border: "1px solid " + C.border }
        },
          h("div", {
            style: { color: C.accent, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }
          }, "Mode hors ligne"),
          h("div", { style: { color: C.muted, fontSize: 13, lineHeight: 1.7 } },
            h("div", null, "Utilisable sans connexion apres le premier chargement"),
            h("div", null, "Scores et historique sauvegardes localement"),
            h("div", null, "Mise a jour automatique au rechargement si en ligne")
          )
        )
      )
    );
  }

  function StatsScreen(props) {
    var onClose = props.onClose, C = props.C;
    var games = props.games || [];
    var teamColors = props.teamColors || [];
    var onClearHistory = props.onClearHistory;
    var summary = [
      { label: "Parties", value: games.length },
      { label: "301/501", value: games.filter(function(game) { return game.gameType !== "cricket"; }).length },
      { label: "Cricket", value: games.filter(function(game) { return game.gameType === "cricket"; }).length }
    ];

    function gameLabel(game) {
      if (game.gameType === "cricket") return "Cricket";
      if (game.gameType === "501") return "501";
      return "301";
    }

    return h("div", {
      style: {
        position: "fixed",
        inset: 0,
        background: C.bg,
        zIndex: 800,
        overflowY: "auto",
        fontFamily: "Georgia,serif",
        paddingBottom: 40
      }
    },
      h("div", {
        style: {
          background: C.headerBg,
          borderBottom: "1px solid " + C.border,
          padding: "16px 20px",
          paddingTop: "max(16px,env(safe-area-inset-top,16px))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
        h("button", {
          onClick: onClose,
          style: { background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer" }
        }, "Retour"),
        h("h2", {
          style: { color: C.accent, fontSize: 16, fontWeight: "bold", letterSpacing: 2, textTransform: "uppercase" }
        }, "Statistiques"),
        h("div", { style: { width: 60 } })
      ),
      h("div", { style: { padding: "16px" } },
        games.length === 0
          ? h("div", { style: { textAlign: "center", padding: 60, color: C.muted } },
            h("div", { style: { fontSize: 32, marginBottom: 12 } }, "Stats"),
            h("div", null, "Aucune partie terminee.")
          )
          : h("div", null,
            h("div", {
              style: { background: C.surface, borderRadius: 14, padding: 18, border: "1px solid " + C.border, marginBottom: 16 }
            },
              h("div", {
                style: { color: C.accent, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }
              }, "Resume global"),
              h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } },
                summary.map(function(item) {
                  return h("div", {
                    key: item.label,
                    style: { background: C.card, borderRadius: 10, padding: "10px 8px", textAlign: "center" }
                  },
                    h("div", { style: { color: C.muted, fontSize: 10, letterSpacing: 1, marginBottom: 4 } }, item.label),
                    h("div", { style: { color: C.text, fontSize: 20, fontWeight: "bold", fontFamily: "monospace" } }, item.value)
                  );
                })
              )
            ),
            h("div", {
              style: { color: C.accent, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }
            }, "Historique"),
            games.slice().reverse().map(function(game, gameIndex) {
              return h("div", {
                key: gameIndex,
                style: { background: C.surface, borderRadius: 12, padding: 16, border: "1px solid " + C.border, marginBottom: 10 }
              },
                h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
                  h("div", { style: { color: C.muted, fontSize: 11 } }, game.date),
                  h("div", { style: { display: "flex", gap: 6 } },
                    h("div", {
                      style: {
                        color: C.accent,
                        fontSize: 11,
                        fontWeight: "bold",
                        background: C.card,
                        padding: "3px 10px",
                        borderRadius: 20
                      }
                    }, gameLabel(game)),
                    game.rule && game.gameType !== "cricket"
                      ? h("div", {
                        style: { color: C.muted, fontSize: 11, background: C.card, padding: "3px 10px", borderRadius: 20 }
                      }, game.rule === "doubleout" ? "D.Out" : "Simple")
                      : null
                  )
                ),
                (game.teams || []).map(function(team, teamIndex) {
                  var isWinner = team.name === game.winner;
                  var color = teamColors[teamIndex] || C.accent;
                  return h("div", {
                    key: teamIndex,
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      borderBottom: teamIndex < game.teams.length - 1 ? "1px solid " + C.border : "none"
                    }
                  },
                    h("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                      isWinner ? h("span", { style: { fontSize: 12, color: C.accent } }, "WIN") : null,
                      h("div", { style: { width: 7, height: 7, borderRadius: "50%", background: color } }),
                      h("span", {
                        style: { color: isWinner ? C.text : C.muted, fontSize: 13, fontWeight: isWinner ? "bold" : "normal" }
                      }, team.name)
                    ),
                    h("div", { style: { textAlign: "right" } },
                      h("div", { style: { color: isWinner ? C.green : C.muted, fontSize: 13, fontFamily: "monospace" } },
                        isWinner ? "VICTOIRE" : game.gameType === "cricket" ? team.score + " pts" : team.score + " restants"
                      ),
                      team.avgPerTurn ? h("div", { style: { color: C.muted, fontSize: 11 } }, "moy " + team.avgPerTurn) : null
                    )
                  );
                })
              );
            }),
            h("button", {
              onClick: onClearHistory,
              style: {
                width: "100%",
                marginTop: 8,
                background: "none",
                border: "1px solid " + C.red,
                borderRadius: 10,
                padding: "12px 0",
                color: C.red,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "Georgia,serif"
              }
            }, "Effacer l'historique")
          )
      )
    );
  }

  function HomeScreen(props) {
    var onSelect = props.onSelect, C = props.C, darkMode = props.darkMode;
    var onShowStats = props.onShowStats, onShowSettings = props.onShowSettings, onToggleTheme = props.onToggleTheme;
    var games = [
      { key: "301", icon: "01", title: "301", desc: "Partez de 301, descendez a 0" },
      { key: "501", icon: "01", title: "501", desc: "Partez de 501, descendez a 0" },
      { key: "cricket", icon: "CR", title: "Cricket", desc: "Fermez les secteurs 15-20 et Bull" }
    ];

    return h("div", {
      style: {
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "Georgia,serif"
      }
    },
      h("div", {
        style: {
          position: "absolute",
          top: "max(16px,env(safe-area-inset-top,16px))",
          left: 12,
          right: 12,
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          maxWidth: "calc(100vw - 24px)",
          overflowX: "auto"
        }
      },
        h("button", {
          onClick: onShowStats,
          style: { background: C.card, border: "1px solid " + C.border, borderRadius: 20, padding: "6px 14px", color: C.muted, fontSize: 12, cursor: "pointer" }
        }, "Stats"),
        h("button", {
          onClick: onShowSettings,
          style: { background: C.card, border: "1px solid " + C.border, borderRadius: 20, padding: "6px 14px", color: C.muted, fontSize: 12, cursor: "pointer" }
        }, "Reglages"),
        h("button", {
          onClick: onToggleTheme,
          style: { background: C.card, border: "1px solid " + C.border, borderRadius: 20, padding: "6px 14px", color: C.text, fontSize: 12, cursor: "pointer" }
        }, darkMode ? "Clair" : "Sombre")
      ),
      h("div", { style: { marginBottom: 36, textAlign: "center" } },
        h("div", { style: { fontSize: 42, marginBottom: 8, color: C.accent, fontWeight: "bold" } }, "DARTS"),
        h("h1", {
          style: {
            color: C.accent,
            fontSize: 36,
            fontWeight: "bold",
            letterSpacing: 4,
            margin: 0,
            textTransform: "uppercase",
            textShadow: "0 0 18px " + C.accent + "77"
          }
        }, "DARTS"),
        h("p", { style: { color: C.muted, marginTop: 4, letterSpacing: 3, fontSize: 12, textTransform: "uppercase" } }, "Choisissez votre jeu")
      ),
      h("div", { style: { width: "calc(100vw - 40px)", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 } },
        games.map(function(game) {
          return h("button", {
            key: game.key,
            onClick: function() { onSelect(game.key); },
            style: {
              background: C.surface,
              border: "1px solid " + C.border,
              borderRadius: 16,
              width: "100%",
              minWidth: 0,
              padding: "20px 24px",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 16,
              transition: "all 0.2s",
              fontFamily: "Georgia,serif"
            }
          },
            h("div", { style: { fontSize: 18, flexShrink: 0, color: C.accent, fontWeight: "bold", minWidth: 36 } }, game.icon),
            h("div", { style: { flex: 1, minWidth: 0 } },
              h("div", { style: { color: C.text, fontSize: 20, fontWeight: "bold", letterSpacing: 2 } }, game.title),
              h("div", { style: { color: C.muted, fontSize: 13, marginTop: 2 } }, game.desc)
            ),
            h("div", { style: { color: C.accent, fontSize: 20 } }, ">")
          );
        })
      )
    );
  }

  function SetupScreen(props) {
    var onStart = props.onStart, onBack = props.onBack, gameType = props.gameType, C = props.C;
    var teamColors = props.teamColors || [];
    var initialTeams = props.initialTeams || [{ id: 1, name: "Equipe Rouge" }, { id: 2, name: "Equipe Bleue" }];
    var onSaveTeams = props.onSaveTeams || function() {};
    var is301or501 = gameType === "301" || gameType === "501";
    var initNextId = initialTeams.reduce(function(maxId, team) { return team.id > maxId ? team.id : maxId; }, 0) + 1;
    var teamsState = React.useState(initialTeams);
    var teams = teamsState[0], setTeams = teamsState[1];
    var nextIdState = React.useState(initNextId);
    var nextId = nextIdState[0], setNextId = nextIdState[1];
    var ruleState = React.useState("simple");
    var rule = ruleState[0], setRule = ruleState[1];
    var gameLabel = gameType === "cricket" ? "Cricket" : gameType;

    function addTeam() {
      if (teams.length >= 8) return;
      var id = nextId;
      setTeams(function(current) { return current.concat([{ id: id, name: "Equipe " + id }]); });
      setNextId(function(value) { return value + 1; });
    }
    function removeTeam(id) {
      if (teams.length <= 2) return;
      setTeams(function(current) { return current.filter(function(team) { return team.id !== id; }); });
    }
    function updateName(id, value) {
      setTeams(function(current) {
        return current.map(function(team) { return team.id === id ? { id: team.id, name: value } : team; });
      });
    }
    function moveTeam(fromId, toId) {
      if (fromId === toId) return;
      setTeams(function(current) {
        var from = current.findIndex(function(team) { return team.id === fromId; });
        var to = current.findIndex(function(team) { return team.id === toId; });
        if (from < 0 || to < 0 || from === to) return current;
        var next = current.slice();
        var moved = next.splice(from, 1)[0];
        next.splice(to, 0, moved);
        return next;
      });
    }
    function handleStart() {
      onSaveTeams(teams);
      onStart(teams, rule);
    }

    return h("div", {
      style: {
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "Georgia,serif"
      }
    },
      h("div", { style: { position: "absolute", top: "max(16px,env(safe-area-inset-top,16px))", left: 16 } },
        h("button", {
          onClick: onBack,
          style: { background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer" }
        }, "Retour")
      ),
      h("div", { style: { marginBottom: 24, textAlign: "center" } },
        h("div", { style: { fontSize: 36, marginBottom: 6, color: C.accent, fontWeight: "bold" } }, gameLabel),
        h("h1", { style: { color: C.accent, fontSize: 28, fontWeight: "bold", letterSpacing: 4, margin: 0, textTransform: "uppercase" } }, gameLabel)
      ),
      h("div", {
        style: { width: "100%", maxWidth: 400, background: C.surface, borderRadius: 16, padding: 22, border: "1px solid " + C.border, marginBottom: 12 }
      },
        h("h2", { style: { color: C.text, fontSize: 15, marginBottom: 14, letterSpacing: 2, textTransform: "uppercase" } }, "Equipes (" + teams.length + ")"),
        teams.map(function(team, index) {
          var color = teamColors[index] || C.accent;
          return h("div", {
            key: team.id,
            draggable: true,
            onDragStart: function(event) { event.dataTransfer.setData("dragId", "" + team.id); },
            onDragOver: function(event) { event.preventDefault(); },
            onDrop: function(event) {
              event.preventDefault();
              moveTeam(parseInt(event.dataTransfer.getData("dragId"), 10), team.id);
            },
            style: {
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
              transition: "opacity 0.15s",
              userSelect: "none",
              WebkitUserSelect: "none",
              position: "relative"
            }
          },
            h("div", { style: { color: C.muted, fontSize: 18, cursor: "grab", flexShrink: 0, padding: "0 2px", touchAction: "none" } }, "::"),
            h("div", { style: { width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 } }),
            h("input", {
              value: team.name,
              onChange: function(event) { updateName(team.id, event.target.value); },
              style: {
                flex: 1,
                background: C.inputBg,
                border: "1px solid " + C.border,
                borderRadius: 8,
                padding: "10px 12px",
                color: C.text,
                fontSize: 15,
                fontFamily: "Georgia,serif"
              }
            }),
            teams.length > 2 ? h("button", {
              onClick: function() { removeTeam(team.id); },
              style: { background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: "0 4px" }
            }, "x") : null
          );
        }),
        teams.length < 8 ? h("button", {
          onClick: addTeam,
          style: {
            width: "100%",
            marginTop: 6,
            background: C.inputBg,
            border: "1px dashed " + C.border,
            borderRadius: 8,
            padding: "10px 12px",
            color: C.muted,
            fontSize: 13,
            cursor: "pointer",
            letterSpacing: 1,
            fontFamily: "Georgia,serif"
          }
        }, "+ Ajouter une equipe") : null
      ),
      is301or501 ? h("div", {
        style: { width: "100%", maxWidth: 400, background: C.surface, borderRadius: 16, padding: 18, border: "1px solid " + C.border, marginBottom: 12 }
      },
        h("h3", { style: { color: C.text, fontSize: 13, marginBottom: 12, letterSpacing: 2, textTransform: "uppercase" } }, "Regle de fin"),
        h("div", { style: { display: "flex", gap: 8 } },
          [
            { value: "simple", label: "Simple out", desc: "Terminer a exactement 0" },
            { value: "doubleout", label: "Double out", desc: "Finir sur une double ou Bull" }
          ].map(function(option) {
            var active = rule === option.value;
            return h("div", {
              key: option.value,
              onClick: function() { setRule(option.value); },
              style: {
                flex: 1,
                background: active ? C.card : C.inputBg,
                border: "2px solid " + (active ? C.accent : C.border),
                borderRadius: 10,
                padding: "12px 10px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s"
              }
            },
              h("div", { style: { color: active ? C.accent : C.text, fontSize: 13, fontWeight: "bold", marginBottom: 4 } }, option.label),
              h("div", { style: { color: C.muted, fontSize: 11 } }, option.desc)
            );
          })
        )
      ) : null,
      h("div", {
        style: { width: "100%", maxWidth: 400, background: C.surface, borderRadius: 16, padding: 18, border: "1px solid " + C.border, marginBottom: 24 }
      },
        h("h3", { style: { color: C.accent, fontSize: 12, marginBottom: 10, letterSpacing: 2, textTransform: "uppercase" } }, "Regles " + gameLabel),
        is301or501
          ? h("div", { style: { color: C.muted, fontSize: 13, lineHeight: 1.8 } },
            h("div", null, "Depart a " + gameType + " points par equipe"),
            h("div", null, "3 lancers par tour"),
            h("div", null, "Atteindre exactement 0 pour gagner"),
            rule === "doubleout" ? h("div", { style: { color: C.accent } }, "Finir sur une double ou le Bull") : null,
            h("div", null, "Depasser 0 = Bust")
          )
          : h("div", { style: { color: C.muted, fontSize: 13, lineHeight: 1.8 } },
            h("div", null, "Secteurs : 15, 16, 17, 18, 19, 20, Bull"),
            h("div", null, "Fermer = 3 touches (S=1, D=2, T=3)"),
            h("div", null, "Secteur ferme = points si l'adversaire n'a pas encore ferme"),
            h("div", null, "Gagner = tous fermes et score le plus eleve")
          )
      ),
      h("button", {
        onClick: handleStart,
        style: {
          background: "linear-gradient(135deg," + C.accent + "," + C.accentDim + ")",
          border: "none",
          borderRadius: 14,
          padding: "18px 56px",
          color: "#000",
          fontSize: 17,
          fontWeight: "bold",
          cursor: "pointer",
          letterSpacing: 3,
          textTransform: "uppercase",
          boxShadow: "0 4px 18px " + C.accent + "55",
          fontFamily: "Georgia,serif"
        }
      }, "Jouer !")
    );
  }

  function ScorePanel(props) {
    var teams = props.teams, currentIdx = props.currentIdx, C = props.C;
    var teamColors = props.teamColors;
    var many = teams.length > 4;
    var fsScore = many ? 20 : 30;
    var fsName = many ? 9 : 10;
    var pad = many ? "7px 5px" : "10px 8px";

    return h("div", {
      style: {
        display: "flex",
        gap: many ? 5 : 8,
        width: "100%",
        overflowX: many ? "auto" : "visible",
        paddingBottom: many ? 4 : 0
      }
    }, teams.map(function(team, index) {
      var active = index === currentIdx;
      var color = teamColors[index];
      return h("div", {
        key: team.id,
        style: {
          flex: many ? "0 0 auto" : 1,
          minWidth: many ? 70 : undefined,
          background: active ? C.card : C.surface,
          border: "2px solid " + (active ? color : C.border),
          borderRadius: 10,
          padding: pad,
          textAlign: "center",
          transition: "all 0.3s",
          boxShadow: active ? "0 0 14px " + color + "44" : "none"
        }
      },
        h("div", { style: { width: 7, height: 7, borderRadius: "50%", background: color, margin: "0 auto 4px" } }),
        h("div", {
          style: {
            color: active ? C.text : C.muted,
            fontSize: fsName,
            letterSpacing: 1,
            textTransform: "uppercase",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 2
          }
        }, team.name),
        h("div", {
          style: {
            color: active ? color : C.muted,
            fontSize: fsScore,
            fontWeight: "bold",
            fontFamily: "monospace",
            lineHeight: 1,
            textShadow: active ? "0 0 10px " + color + "88" : "none"
          }
        }, team.score),
        active ? h("div", { style: { color: C.accent, fontSize: 8, marginTop: 2, letterSpacing: 1 } }, "EN JEU") : null
      );
    }));
  }

  function CricketPanel(props) {
    var teams = props.teams, currentIdx = props.currentIdx, cs = props.cricketState, C = props.C;
    var teamColors = props.teamColors;
    var cricketSectors = props.cricketSectors;

    function hitIcon(count) {
      if (count === 0) return "";
      if (count === 1) return "/";
      if (count === 2) return "X";
      return "O";
    }

    function compactTeamName(name) {
      return String(name || "").replace(/^Equipe\s+/i, "");
    }

    return h("div", {
      style: { background: C.surface, borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden" }
    },
      h("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr repeat(" + teams.length + ",1fr) 1fr",
          background: C.card,
          padding: "6px 8px",
          gap: 4
        }
      },
        h("div", { style: { color: C.muted, fontSize: 10, textAlign: "center", letterSpacing: 1 } }, "SEC"),
        teams.map(function(team, index) {
          var active = index === currentIdx;
          return h("div", {
            key: team.id,
            title: team.name,
            style: {
              color: active ? teamColors[index] : C.muted,
              fontSize: 10,
              textAlign: "center",
              letterSpacing: 0,
              fontWeight: active ? "bold" : "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }
          }, compactTeamName(team.name));
        }),
        h("div", { style: { color: C.muted, fontSize: 10, textAlign: "center" } }, "PTS")
      ),
      cricketSectors.map(function(sector) {
        var label = sector === 25 ? "Bull" : "" + sector;
        return h("div", {
          key: sector,
          style: {
            display: "grid",
            gridTemplateColumns: "1fr repeat(" + teams.length + ",1fr) 1fr",
            padding: "5px 8px",
            gap: 4,
            borderBottom: "1px solid " + C.border + "88"
          }
        },
          h("div", {
            style: { color: C.text, fontSize: 13, fontWeight: "bold", textAlign: "center", fontFamily: "monospace" }
          }, label),
          teams.map(function(team, index) {
            var hits = (cs[team.id] && cs[team.id][sector]) || 0;
            var closed = hits >= 3;
            var active = index === currentIdx;
            return h("div", {
              key: team.id,
              style: {
                textAlign: "center",
                color: closed ? teamColors[index] : active ? C.text : C.muted,
                fontSize: closed ? 16 : 14,
                fontWeight: "bold",
                textShadow: closed ? "0 0 8px " + teamColors[index] + "88" : "none"
              }
            }, hitIcon(hits));
          }),
          h("div", { style: { display: "flex", justifyContent: "center", gap: 4 } },
            teams.map(function(team, index) {
              var points = (cs[team.id] && cs[team.id]["pts_" + sector]) || 0;
              return points > 0 ? h("span", {
                key: team.id,
                style: { color: teamColors[index], fontSize: 11, fontFamily: "monospace", fontWeight: "bold" }
              }, points) : null;
            })
          )
        );
      }),
      h("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr repeat(" + teams.length + ",1fr) 1fr",
          padding: "8px 8px",
          background: C.card,
          gap: 4
        }
      },
        h("div", { style: { color: C.muted, fontSize: 10, textAlign: "center" } }, "TOT"),
        teams.map(function(team, index) {
          var active = index === currentIdx;
          var total = Object.keys(cs[team.id] || {}).reduce(function(sum, key) {
            return key.indexOf("pts_") === 0 ? sum + (cs[team.id][key] || 0) : sum;
          }, 0);
          return h("div", {
            key: team.id,
            style: {
              color: active ? teamColors[index] : C.muted,
              fontSize: 16,
              fontWeight: "bold",
              textAlign: "center",
              fontFamily: "monospace",
              textShadow: active ? "0 0 8px " + teamColors[index] + "88" : "none"
            }
          }, total);
        }),
        h("div", null)
      )
    );
  }

  return {
    DartBoard: DartBoard,
    ThrowDots: ThrowDots,
    BustOverlay: BustOverlay,
    ActionButtons: ActionButtons,
    QuitModal: QuitModal,
    ConfirmModal: ConfirmModal,
    HistoryDrawer: HistoryDrawer,
    GameLayout: GameLayout,
    ResumeScreen: ResumeScreen,
    WinScreen: WinScreen,
    SettingsScreen: SettingsScreen,
    StatsScreen: StatsScreen,
    HomeScreen: HomeScreen,
    SetupScreen: SetupScreen,
    ScorePanel: ScorePanel,
    CricketPanel: CricketPanel
  };
})();
