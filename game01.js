function Game301(props) {
  var initialTeams = props.initialTeams,
    onNewGame = props.onNewGame;
  var savedState = props.savedState,
    rule = props.rule,
    C = props.C,
    gameType = props.gameType || "301";
  var startScore = gameType === "501" ? 501 : 301;
  function buildInit() {
    if (savedState) return savedState;
    return {
      teams: initialTeams.map(function (t) {
        return {
          id: t.id,
          name: t.name,
          score: startScore
        };
      }),
      currentIdx: 0,
      throws: [],
      history: [],
      stats: {
        rounds: 0,
        totalThrows: 0,
        bestTurn: null
      },
      winner: null,
      rule: rule,
      gameType: gameType
    };
  }
  var init = buildInit();
  var effectiveRule = init.rule || rule || "simple";
  var s1 = useState(init.teams);
  var teams = s1[0],
    setTeams = s1[1];
  var s2 = useState(init.currentIdx);
  var currentIdx = s2[0],
    setCurrentIdx = s2[1];
  var s3 = useState(init.throws);
  var throws = s3[0],
    setThrows = s3[1];
  var s4 = useState(init.history);
  var history = s4[0],
    setHistory = s4[1];
  var s5 = useState(false);
  var bust = s5[0],
    setBust = s5[1];
  var s6 = useState(null);
  var bustPend = s6[0],
    setBustPend = s6[1];
  var s7 = useState(init.winner);
  var winner = s7[0],
    setWinner = s7[1];
  var s8 = useState(false);
  var showHist = s8[0],
    setShowHist = s8[1];
  var s9 = useState(false);
  var showConf = s9[0],
    setShowConf = s9[1];
  var s10 = useState(init.stats);
  var stats = s10[0],
    setStats = s10[1];
  var s11 = useState(false);
  var showQuit = s11[0],
    setShowQuit = s11[1];
  var s12 = useState(false);
  var showStats = s12[0],
    setShowStats = s12[1];
  var team = teams[currentIdx];
  var roundTotal = throws.reduce(function (s, t) {
    return s + t.score;
  }, 0);
  var projected = team.score - roundTotal;
  var boardDisabled = throws.length >= MAX_THROWS || bust;
  var canUndo = throws.length > 0 && !bust;
  var turnComplete = throws.length >= MAX_THROWS && !bust;
  var checkoutHint = projected > 0 && projected <= 170 && projected in CHECKOUT ? CHECKOUT[projected] : null;
  useEffect(function () {
    if (!winner) {
      ls_set(SAVE_KEY, {
        teams: teams,
        currentIdx: currentIdx,
        throws: throws,
        history: history,
        stats: stats,
        winner: null,
        initialTeams: initialTeams,
        rule: effectiveRule,
        gameType: gameType
      });
    } else {
      ls_del(SAVE_KEY);
    }
  }, [teams, currentIdx, throws, history, stats, winner]);
  function isValidFinish(th) {
    if (effectiveRule === "simple") return true;
    var last = th[th.length - 1];
    return last && (last.isDouble || last.value === 50 && last.multiplier === 1);
  }
  function checkoutTargets(plan) {
    if (!plan) return null;
    return plan.split(/\s+/).map(function (part) {
      var token = String(part || "").toLowerCase();
      if (token === "bull") return "bull";
      if (/^[std]\d+$/.test(token)) return token;
      return null;
    }).filter(Boolean);
  }
  function checkoutLabel(target) {
    if (!target) return "";
    if (target === "bull") return "Bull";
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  function checkoutState() {
    var plan = checkoutHint;
    var targets = checkoutTargets(plan);
    var next = targets && targets.length ? checkoutLabel(targets[0]) : null;
    var finishNow = projected === 0;
    var danger = projected > 0 && projected <= 40;
    var impossibleDouble = effectiveRule === "doubleout" && projected === 1;
    return {
      plan: plan,
      targets: targets,
      next: next,
      finishNow: finishNow,
      danger: danger,
      impossibleDouble: impossibleDouble
    };
  }
  function saveToHistory(w, nextTeams, nextStats) {
    var teamsForHistory = nextTeams || teams;
    var statsForHistory = nextStats || stats;
    var existing = ls_get(HISTORY_KEY) || [];
    var now = new Date();
    existing.push(DartsScoring.build01GameHistoryEntry({
      date: now.toLocaleDateString("fr-FR") + " " + now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      winner: w,
      rule: effectiveRule,
      gameType: gameType,
      startScore: startScore,
      teams: teamsForHistory,
      stats: statsForHistory
    }));
    ls_set(HISTORY_KEY, existing);
  }
  function commitTurn(th, isWin) {
    var result = DartsScoring.apply01Turn(teams, team.id, th);
    var total = result.total;
    var ns = result.scoreAfter;
    var nextStats = DartsScoring.next01Stats(stats, total, th.length);
    setTeams(result.teams);
    setHistory(function (h) {
      return h.concat([{
        teamId: team.id,
        teamName: team.name,
        throws: th,
        total: total,
        bust: false,
        scoreBefore: team.score,
        scoreAfter: ns
      }]);
    });
    setStats(nextStats);
    setThrows([]);
    if (isWin) {
      saveToHistory(team, result.teams, nextStats);
      setWinner(team);
    } else {
      setCurrentIdx(function (i) {
        return (i + 1) % teams.length;
      });
    }
  }
  function handleScore(td) {
    if (throws.length >= MAX_THROWS) return;
    var nt = throws.concat([td]);
    setThrows(nt);
    var total = nt.reduce(function (s, t) {
      return s + t.score;
    }, 0);
    var ns = team.score - total;
    if (ns < 0) {
      setBustPend(nt);
      setBust(true);
    } else if (ns === 0) {
      if (isValidFinish(nt)) {
        commitTurn(nt, true);
      } else {
        setBustPend(nt);
        setBust(true);
      }
    }
  }
  function handleBustDone() {
    setBust(false);
    var bp = bustPend || [];
    var nextStats = DartsScoring.nextBustStats(stats, bp.length);
    setHistory(function (h) {
      return h.concat([{
        teamId: team.id,
        teamName: team.name,
        throws: bp,
        total: 0,
        bust: true,
        scoreBefore: team.score,
        scoreAfter: team.score
      }]);
    });
    setStats(nextStats);
    setBustPend(null);
    setThrows([]);
    setCurrentIdx(function (i) {
      return (i + 1) % teams.length;
    });
  }
  function undoLast() {
    if (canUndo) setThrows(function (t) {
      return t.slice(0, t.length - 1);
    });
  }
  function passTurn() {
    if (throws.length === 0 && !bust) setCurrentIdx(function (i) {
      return (i + 1) % teams.length;
    });
  }
  function resetGame() {
    ls_del(SAVE_KEY);
    setTeams(initialTeams.map(function (t) {
      return {
        id: t.id,
        name: t.name,
        score: startScore
      };
    }));
    setCurrentIdx(0);
    setThrows([]);
    setHistory([]);
    setWinner(null);
    setStats({
      rounds: 0,
      totalThrows: 0,
      bestTurn: null
    });
  }
  if (showStats) return React.createElement(DartsUI.StatsScreen, {
    C: C,
    games: ls_get(HISTORY_KEY) || [],
    teamColors: TEAM_COLORS,
    onClearHistory: function () {
      if (window.confirm("Effacer tout l'historique ?")) {
        ls_del(HISTORY_KEY);
        setShowStats(false);
      }
    },
    onClose: function () {
      setShowStats(false);
    }
  });
  if (winner) return React.createElement(DartsUI.WinScreen, {
    winner: winner,
    stats: stats,
    gameType: gameType,
    C: C,
    onRestart: function () {
      ls_del(SAVE_KEY);
      onNewGame();
    },
    onNewGame: function () {
      ls_del(SAVE_KEY);
      onNewGame();
    },
    onSameTeams: resetGame
  });
  var aim = checkoutState();
  var recentTurns = history.slice(-3).reverse();
  var otherTeams = teams.filter(function (item, index) {
    return index !== currentIdx;
  });
  var leftContent = React.createElement(React.Fragment, null, React.createElement(DartsUI.ScorePanel, {
    teams: teams,
    currentIdx: currentIdx,
    C: C,
    teamColors: TEAM_COLORS
  }), React.createElement("div", {
    className: "active-turn-card",
    style: {
      background: C.surface,
      borderRadius: 13,
      padding: "14px 16px",
      border: "1px solid " + (aim.plan ? C.accent : aim.danger ? C.red : C.border),
      boxShadow: aim.plan ? "0 0 0 1px " + C.accent + "22, 0 10px 26px #0003" : "none"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      color: TEAM_COLORS[currentIdx],
      fontSize: 13,
      fontWeight: "bold",
      letterSpacing: 0,
      textTransform: "uppercase"
    }
  }, team.name), React.createElement("div", {
    style: {
      color: C.muted,
      fontSize: 11,
      marginTop: 1
    }
  }, "Lancer " + throws.length + "/" + MAX_THROWS, turnComplete && React.createElement("span", {
    style: {
      color: C.accent,
      marginLeft: 6
    }
  }, "Pret a valider"))), React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, React.createElement("div", {
    style: {
      color: C.muted,
      fontSize: 10,
      letterSpacing: 1,
      textTransform: "uppercase"
    }
  }, projected < 0 ? "Depasse" : projected === 0 ? "Fin" : "Reste"), React.createElement("div", {
    style: {
      color: projected < 0 ? C.red : projected === 0 ? C.green : C.text,
      fontSize: 48,
      fontWeight: "bold",
      fontFamily: "monospace",
      lineHeight: 1,
      transition: "color 0.2s"
    }
  }, projected < 0 ? "BUST!" : projected), roundTotal > 0 && projected >= 0 && React.createElement("div", {
    style: {
      color: C.accent,
      fontSize: 11
    }
  }, "-" + roundTotal + " pts"))), React.createElement(DartsUI.ThrowDots, {
    throws: throws,
    max: MAX_THROWS,
    C: C
  }), aim.next && React.createElement("div", {
    style: {
      marginTop: 10,
      background: C.card,
      borderRadius: 10,
      padding: "10px 12px",
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      alignItems: "center",
      gap: 10,
      border: "1px solid " + C.accent + "66"
    }
  }, React.createElement("span", {
    style: {
      minWidth: 46,
      height: 46,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: C.accent,
      color: "#111",
      fontSize: 17,
      fontWeight: "bold",
      fontFamily: "monospace"
    }
  }, aim.next), React.createElement("div", null, React.createElement("div", {
    style: {
      color: C.accent,
      fontSize: 10,
      letterSpacing: 1,
      textTransform: "uppercase"
    }
  }, "Checkout conseille"), React.createElement("div", {
    style: {
      color: C.text,
      fontSize: 15,
      fontWeight: "bold",
      fontFamily: "monospace"
    }
  }, aim.plan))), aim.impossibleDouble && React.createElement("div", {
    style: {
      marginTop: 8,
      color: C.red,
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "center"
    }
  }, "Double out impossible a 1 : evitez ce reste"), effectiveRule === "doubleout" && projected > 0 && projected <= 40 && projected % 2 === 0 && throws.length === MAX_THROWS - 1 && React.createElement("div", {
    style: {
      marginTop: 8,
      color: C.accent,
      fontSize: 11,
      textAlign: "center",
      fontStyle: "italic"
    }
  }, "Double out requis - visez D" + projected / 2)), otherTeams.length > 0 && React.createElement("div", {
    className: "opponent-score-strip",
    style: {
      background: C.surface,
      border: "1px solid " + C.border,
      borderRadius: 12,
      padding: "9px 10px",
      display: "none",
      gap: 8,
      overflowX: "auto"
    }
  }, otherTeams.map(function (other) {
    var realIndex = teams.findIndex(function (item) {
      return item.id === other.id;
    });
    var color = TEAM_COLORS[realIndex] || C.accent;
    return React.createElement("div", {
      key: other.id,
      style: {
        flex: "0 0 auto",
        minWidth: 96,
        background: C.card,
        border: "1px solid " + C.border,
        borderRadius: 10,
        padding: "7px 9px"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 3
      }
    }, React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: color,
        flexShrink: 0
      }
    }), React.createElement("span", {
      style: {
        color: C.muted,
        fontSize: 10,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, other.name)), React.createElement("div", {
      style: {
        color: C.text,
        fontSize: 17,
        fontWeight: "bold",
        fontFamily: "monospace",
        lineHeight: 1
      }
    }, other.score));
  })), !boardDisabled && React.createElement("button", {
    className: "miss-button",
    onClick: function () {
      handleScore({
        value: 0,
        multiplier: 1,
        score: 0,
        label: "0",
        isDouble: false,
        isBull: false
      });
    },
    style: {
      width: "100%",
      background: C.surface,
      border: "1px solid " + C.border,
      borderRadius: 12,
      padding: "11px 0",
      color: C.muted,
      fontSize: 14,
      cursor: "pointer",
      letterSpacing: 2,
      fontFamily: "Georgia,serif"
    }
  }, "Rate - 0 point"), recentTurns.length > 0 && React.createElement("div", {
    className: "turn-history-summary",
    style: {
      background: C.surface,
      border: "1px solid " + C.border,
      borderRadius: 12,
      padding: "10px 12px"
    }
  }, React.createElement("div", {
    style: {
      color: C.muted,
      fontSize: 10,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 6
    }
  }, "Derniers tours"), recentTurns.map(function (turn, index) {
    return React.createElement("div", {
      key: index,
      style: {
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        color: turn.bust ? C.red : C.text,
        fontSize: 12,
        padding: "3px 0",
        borderTop: index === 0 ? "0" : "1px solid " + C.border + "66"
      }
    }, React.createElement("span", {
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, turn.teamName), React.createElement("strong", {
      style: {
        fontFamily: "monospace"
      }
    }, turn.bust ? "BUST" : turn.total));
  })), React.createElement("div", {
    className: "turn-actions"
  }, React.createElement(DartsUI.ActionButtons, {
    canUndo: canUndo,
    onUndo: undoLast,
    canPass: throws.length === 0 && !bust,
    onPass: passTurn,
    turnComplete: turnComplete,
    onValidate: function () {
      if (turnComplete) setShowConf(true);
    },
    C: C
  })));
  return React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      fontFamily: "Georgia,serif",
      paddingBottom: "env(safe-area-inset-bottom,16px)"
    }
  }, React.createElement("div", {
    style: {
      background: C.headerBg,
      borderBottom: "1px solid " + C.border,
      padding: "12px 16px",
      paddingTop: "max(12px,env(safe-area-inset-top,12px))",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, React.createElement("button", {
    onClick: function () {
      setShowQuit(true);
    },
    style: {
      background: "none",
      border: "none",
      color: C.muted,
      fontSize: 13,
      cursor: "pointer"
    }
  }, "Quitter"), React.createElement("button", {
    onClick: function () {
      setShowStats(true);
    },
    style: {
      background: "none",
      border: "none",
      color: C.accent,
      fontSize: 14,
      fontWeight: "bold",
      cursor: "pointer",
      letterSpacing: 2
    }
  }, gameType.toUpperCase()), React.createElement("button", {
    onClick: function () {
      setShowHist(true);
    },
    style: {
      background: "none",
      border: "none",
      color: C.muted,
      fontSize: 13,
      cursor: "pointer"
    }
  }, "Historique")), React.createElement(DartsUI.GameLayout, {
    C: C,
    leftContent: leftContent,
    boardContent: React.createElement(DartsUI.DartBoard, {
      onScore: handleScore,
      disabled: boardDisabled,
      C: C,
      segments: SEGMENTS,
      highlightTargets: aim.targets
    })
  }), React.createElement(DartsUI.BustOverlay, {
    show: bust,
    onDone: handleBustDone,
    C: C
  }), showQuit && React.createElement(DartsUI.QuitModal, {
    onCancel: function () {
      setShowQuit(false);
    },
    onConfirm: onNewGame,
    C: C
  }), showConf && React.createElement(DartsUI.ConfirmModal, {
    team: team,
    teamIdx: currentIdx,
    throws: throws,
    projected: projected,
    C: C,
    teamColors: TEAM_COLORS,
    onConfirm: function () {
      setShowConf(false);
      commitTurn(throws, false);
    },
    onCancel: function () {
      setShowConf(false);
    }
  }), showHist && React.createElement(DartsUI.HistoryDrawer, {
    history: history,
    teams: teams,
    onClose: function () {
      setShowHist(false);
    },
    C: C,
    teamColors: TEAM_COLORS
  }));
}
