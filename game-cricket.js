function GameCricket(props) {
  var initialTeams = props.initialTeams,
    onNewGame = props.onNewGame,
    savedState = props.savedState,
    C = props.C;
  function buildInitCricket() {
    if (savedState) return savedState;
    var cs = {};
    initialTeams.forEach(function (t) {
      cs[t.id] = {};
      CRICKET_SECTORS.forEach(function (s) {
        cs[t.id][s] = 0;
        cs[t.id]["pts_" + s] = 0;
      });
    });
    return {
      teams: initialTeams.map(function (t) {
        return {
          id: t.id,
          name: t.name
        };
      }),
      currentIdx: 0,
      throws: [],
      history: [],
      cricketState: cs,
      stats: {
        rounds: 0,
        totalThrows: 0,
        bestTurn: null
      },
      winner: null,
      gameType: "cricket"
    };
  }
  var init = buildInitCricket();
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
  var s5 = useState(init.cricketState);
  var cs = s5[0],
    setCs = s5[1];
  var s6 = useState(init.winner);
  var winner = s6[0],
    setWinner = s6[1];
  var s7 = useState(false);
  var showHist = s7[0],
    setShowHist = s7[1];
  var s8 = useState(init.stats);
  var stats = s8[0],
    setStats = s8[1];
  var s9 = useState(false);
  var showQuit = s9[0],
    setShowQuit = s9[1];
  var s10 = useState(false);
  var showStats = s10[0],
    setShowStats = s10[1];
  var team = teams[currentIdx];
  var boardDisabled = throws.length >= MAX_THROWS;
  var canUndo = throws.length > 0;
  var turnComplete = throws.length >= MAX_THROWS;
  function teamTotalInState(state, teamId) {
    return DartsScoring.teamTotalInCricketState(state, teamId);
  }
  function allClosedInState(state, teamId) {
    return DartsScoring.allCricketSectorsClosed(state, teamId, CRICKET_SECTORS);
  }
  function checkWin(newCs) {
    return DartsScoring.findCricketWinner(newCs, teams, CRICKET_SECTORS);
  }
  useEffect(function () {
    if (!winner) {
      ls_set(SAVE_KEY, {
        teams: teams,
        currentIdx: currentIdx,
        throws: throws,
        history: history,
        cricketState: cs,
        stats: stats,
        winner: null,
        initialTeams: initialTeams,
        gameType: "cricket"
      });
    } else {
      ls_del(SAVE_KEY);
    }
  }, [teams, currentIdx, throws, history, cs, stats, winner]);
  function handleScore(td) {
    if (throws.length >= MAX_THROWS) return;
    setThrows(throws.concat([td]));
  }
  function commitCricketTurn(th) {
    var newCs = DartsScoring.applyCricketTurn(cs, teams, team.id, CRICKET_SECTORS, th);
    var nextStats = {
      rounds: stats.rounds + 1,
      totalThrows: stats.totalThrows + th.length,
      bestTurn: stats.bestTurn
    };
    setCs(newCs);
    setHistory(function (h) {
      return h.concat([{
        teamId: team.id,
        teamName: team.name,
        throws: th,
        total: 0,
        bust: false
      }]);
    });
    setStats(nextStats);
    setThrows([]);
    var w = checkWin(newCs);
    if (w) {
      var existing = ls_get(HISTORY_KEY) || [];
      var now = new Date();
      existing.push({
        date: now.toLocaleDateString("fr-FR") + " " + now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        winner: w.name,
        gameType: "cricket",
        totalThrows: nextStats.totalThrows,
        teams: teams.map(function (t) {
          return {
            name: t.name,
            score: teamTotalInState(newCs, t.id)
          };
        })
      });
      ls_set(HISTORY_KEY, existing);
      setWinner(w);
    } else {
      setCurrentIdx(function (i) {
        return (i + 1) % teams.length;
      });
    }
  }
  function undoLast() {
    if (canUndo) setThrows(function (t) {
      return t.slice(0, t.length - 1);
    });
  }
  function passTurn() {
    if (throws.length === 0) setCurrentIdx(function (i) {
      return (i + 1) % teams.length;
    });
  }
  function resetGame() {
    ls_del(SAVE_KEY);
    var newCs = {};
    initialTeams.forEach(function (t) {
      newCs[t.id] = {};
      CRICKET_SECTORS.forEach(function (s) {
        newCs[t.id][s] = 0;
        newCs[t.id]["pts_" + s] = 0;
      });
    });
    setTeams(initialTeams.map(function (t) {
      return {
        id: t.id,
        name: t.name
      };
    }));
    setCs(newCs);
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
    gameType: "cricket",
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
  var openSectors = CRICKET_SECTORS.filter(function (s) {
    return (cs[team.id][s] || 0) < 3;
  });
  var leftContent = React.createElement(React.Fragment, null, React.createElement(DartsUI.CricketPanel, {
    teams: teams,
    currentIdx: currentIdx,
    cricketState: cs,
    C: C,
    teamColors: TEAM_COLORS,
    cricketSectors: CRICKET_SECTORS
  }), React.createElement("div", {
    style: {
      background: C.surface,
      borderRadius: 13,
      padding: "10px 14px",
      border: "1px solid " + C.border
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
      letterSpacing: 1,
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
  }, "\u2713 Pr\xEAt \xE0 valider"))), React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, React.createElement("div", {
    style: {
      color: C.text,
      fontSize: 13,
      fontFamily: "monospace"
    }
  }, openSectors.length === 0 ? "Tous fermés !" : openSectors.map(function (s) {
    return s === 25 ? "Bull" : s;
  }).join(" · ")), React.createElement("div", {
    style: {
      color: C.muted,
      fontSize: 10
    }
  }, "\xE0 fermer"))), React.createElement(DartsUI.ThrowDots, {
    throws: throws,
    max: MAX_THROWS,
    C: C
  })), !boardDisabled && React.createElement("button", {
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
  }, "\uD83C\uDFAF Rat\xE9 \u2014 0 point"), React.createElement(DartsUI.ActionButtons, {
    canUndo: canUndo,
    onUndo: undoLast,
    canPass: throws.length === 0,
    onPass: passTurn,
    turnComplete: turnComplete,
    onValidate: function () {
      if (turnComplete) commitCricketTurn(throws);
    },
    C: C
  }));
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
  }, "\u2715 Quitter"), React.createElement("button", {
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
  }, "\uD83C\uDFCF CRICKET"), React.createElement("button", {
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
      highlightSectors: openSectors.length > 0 ? CRICKET_SECTORS : null
    })
  }), showQuit && React.createElement(DartsUI.QuitModal, {
    onCancel: function () {
      setShowQuit(false);
    },
    onConfirm: onNewGame,
    C: C
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
