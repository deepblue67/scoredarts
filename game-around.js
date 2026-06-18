function GameAround(props) {
  var h = React.createElement;
  var initialTeams = props.initialTeams, onNewGame = props.onNewGame;
  var savedState = props.savedState, C = props.C;
  var rule = props.rule || {};
  var settings = {
    direction: rule.direction || "asc",
    includeBull: rule.includeBull !== false,
    bullMode: rule.bullMode || "inner",
    segmentMode: rule.segmentMode || "any"
  };

  function buildSequence() {
    var nums = [];
    if (settings.direction === "desc") {
      for (var n = 20; n >= 1; n--) nums.push(n);
    } else {
      for (var i = 1; i <= 20; i++) nums.push(i);
    }
    if (settings.includeBull) nums.push(25);
    return nums;
  }

  var sequence = buildSequence();

  function buildInit() {
    if (savedState) return savedState;
    return {
      teams: initialTeams.map(function(team) {
        return { id: team.id, name: team.name, progress: 0 };
      }),
      currentIdx: 0,
      throws: [],
      history: [],
      stats: { rounds: 0, totalThrows: 0, bestTurn: null },
      winner: null,
      rule: settings,
      gameType: "around"
    };
  }

  var init = buildInit();
  settings = init.rule || settings;
  sequence = buildSequence();

  var s1 = useState(init.teams); var teams = s1[0], setTeams = s1[1];
  var s2 = useState(init.currentIdx); var currentIdx = s2[0], setCurrentIdx = s2[1];
  var s3 = useState(init.throws || []); var throws = s3[0], setThrows = s3[1];
  var s4 = useState(init.history || []); var history = s4[0], setHistory = s4[1];
  var s5 = useState(init.stats || { rounds: 0, totalThrows: 0, bestTurn: null }); var stats = s5[0], setStats = s5[1];
  var s6 = useState(init.winner || null); var winner = s6[0], setWinner = s6[1];
  var s7 = useState(false); var showQuit = s7[0], setShowQuit = s7[1];
  var s8 = useState(false); var showHist = s8[0], setShowHist = s8[1];
  var s9 = useState(false); var showStats = s9[0], setShowStats = s9[1];

  var team = teams[currentIdx];
  var preview = previewProgress(team.progress, throws);
  var currentTarget = sequence[Math.min(preview.progress, sequence.length - 1)];
  var boardDisabled = throws.length >= MAX_THROWS || !!winner;
  var turnComplete = throws.length >= MAX_THROWS;
  var recentTurns = history.slice(-3).reverse();
  var targetText = targetLabel(currentTarget);
  var highlightTargets = targetHighlights(currentTarget);

  useEffect(function() {
    if (!winner) {
      ls_set(SAVE_KEY, {
        teams: teams,
        currentIdx: currentIdx,
        throws: throws,
        history: history,
        stats: stats,
        winner: null,
        initialTeams: initialTeams,
        rule: settings,
        gameType: "around"
      });
    } else {
      ls_del(SAVE_KEY);
    }
  }, [teams, currentIdx, throws, history, stats, winner]);

  function targetLabel(target) {
    return target === 25 ? "Bull" : String(target);
  }

  function targetHighlights(target) {
    if (target === 25) {
      return settings.bullMode === "any" ? ["outer-bull", "bull"] : ["bull"];
    }
    if (settings.segmentMode === "double") return ["d" + target];
    return ["s" + target, "d" + target, "t" + target];
  }

  function dartMatchesTarget(dart, target) {
    if (!target) return false;
    if (target === 25) {
      return settings.bullMode === "any" ? dart.value === 25 || dart.value === 50 : dart.value === 50;
    }
    if (dart.value !== target) return false;
    return settings.segmentMode === "double" ? dart.multiplier === 2 : true;
  }

  function previewProgress(startProgress, list) {
    var progress = startProgress;
    var hits = [];
    list.forEach(function(dart) {
      var target = sequence[progress];
      var hit = dartMatchesTarget(dart, target);
      hits.push({ dart: dart, target: target, hit: hit });
      if (hit) progress++;
    });
    return { progress: progress, hits: hits };
  }

  function currentPercent(progress) {
    return Math.round(Math.min(progress, sequence.length) / sequence.length * 100);
  }

  function saveToHistory(w, nextTeams, nextStats) {
    var existing = ls_get(HISTORY_KEY) || [];
    var now = new Date();
    existing.push({
      date: now.toLocaleDateString("fr-FR") + " " + now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      winner: w.name,
      gameType: "around",
      rule: settings,
      totalThrows: nextStats.totalThrows,
      teams: nextTeams.map(function(item) {
        return { name: item.name, score: currentPercent(item.progress), progress: item.progress, target: targetLabel(sequence[Math.min(item.progress, sequence.length - 1)]) };
      })
    });
    ls_set(HISTORY_KEY, existing);
  }

  function handleScore(dart) {
    if (throws.length >= MAX_THROWS || winner) return;
    setThrows(throws.concat([dart]));
  }

  function undoLast() {
    if (throws.length > 0) setThrows(function(list) { return list.slice(0, list.length - 1); });
  }

  function passTurn() {
    if (throws.length === 0) setCurrentIdx(function(index) { return (index + 1) % teams.length; });
  }

  function commitTurn() {
    if (!turnComplete) return;
    var result = previewProgress(team.progress, throws);
    var hitsThisTurn = result.progress - team.progress;
    var nextTeams = teams.map(function(item) {
      return item.id === team.id ? { id: item.id, name: item.name, progress: result.progress } : item;
    });
    var nextStats = {
      rounds: stats.rounds + 1,
      totalThrows: stats.totalThrows + throws.length,
      bestTurn: stats.bestTurn === null ? hitsThisTurn : Math.max(stats.bestTurn, hitsThisTurn)
    };
    var nextTeam = nextTeams[currentIdx];
    setTeams(nextTeams);
    setHistory(function(list) {
      return list.concat([{
        teamId: team.id,
        teamName: team.name,
        throws: throws,
        total: hitsThisTurn,
        progressBefore: team.progress,
        progressAfter: result.progress,
        targetAfter: targetLabel(sequence[Math.min(result.progress, sequence.length - 1)])
      }]);
    });
    setStats(nextStats);
    setThrows([]);
    if (result.progress >= sequence.length) {
      saveToHistory(nextTeam, nextTeams, nextStats);
      setWinner(nextTeam);
    } else {
      setCurrentIdx(function(index) { return (index + 1) % teams.length; });
    }
  }

  function resetGame() {
    ls_del(SAVE_KEY);
    setTeams(initialTeams.map(function(item) { return { id: item.id, name: item.name, progress: 0 }; }));
    setCurrentIdx(0);
    setThrows([]);
    setHistory([]);
    setWinner(null);
    setStats({ rounds: 0, totalThrows: 0, bestTurn: null });
  }

  if (showStats) return h(DartsUI.StatsScreen, {
    C: C,
    games: ls_get(HISTORY_KEY) || [],
    teamColors: TEAM_COLORS,
    onClearHistory: function() {
      if (window.confirm("Effacer tout l'historique ?")) {
        ls_del(HISTORY_KEY);
        setShowStats(false);
      }
    },
    onClose: function() { setShowStats(false); }
  });

  if (winner) return h(DartsUI.WinScreen, {
    winner: winner,
    stats: stats,
    gameType: "around",
    C: C,
    onRestart: function() { ls_del(SAVE_KEY); onNewGame(); },
    onNewGame: function() { ls_del(SAVE_KEY); onNewGame(); },
    onSameTeams: resetGame
  });

  var leftContent = h(React.Fragment, null,
    h(DartsUI.ScorePanel, { teams: teams.map(function(item) {
      return { id: item.id, name: item.name, score: targetLabel(sequence[Math.min(item.progress, sequence.length - 1)]) };
    }), currentIdx: currentIdx, C: C, teamColors: TEAM_COLORS }),
    h("div", {
      className: "active-turn-card",
      style: { background: C.surface, borderRadius: 13, padding: "14px 16px", border: "1px solid " + C.accent, boxShadow: "0 0 0 1px " + C.accent + "22, 0 10px 26px #0003" }
    },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
        h("div", null,
          h("div", { style: { color: TEAM_COLORS[currentIdx], fontSize: 13, fontWeight: "bold", textTransform: "uppercase" } }, team.name),
          h("div", { style: { color: C.muted, fontSize: 11, marginTop: 1 } }, "Lancer " + throws.length + "/" + MAX_THROWS)
        ),
        h("div", { style: { textAlign: "right" } },
          h("div", { style: { color: C.muted, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" } }, "Cible"),
          h("div", { style: { color: C.text, fontSize: currentTarget === 25 ? 34 : 48, fontWeight: "bold", fontFamily: "monospace", lineHeight: 1 } }, targetText)
        )
      ),
      h("div", { style: { height: 8, borderRadius: 99, background: C.card, overflow: "hidden", marginBottom: 12 } },
        h("div", { style: { height: "100%", width: currentPercent(preview.progress) + "%", background: C.accent, transition: "width .2s" } })
      ),
      h(DartsUI.ThrowDots, { throws: throws, max: MAX_THROWS, C: C }),
      h("div", { style: { marginTop: 10, background: C.card, border: "1px solid " + C.accent + "55", borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" } },
        h("div", null,
          h("div", { style: { color: C.accent, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" } }, settings.segmentMode === "double" ? "Doubles seulement" : "Tout segment compte"),
          h("div", { style: { color: C.text, fontSize: 13, fontWeight: "bold" } }, "Visez " + targetText)
        ),
        h("div", { style: { color: C.muted, fontSize: 12, fontFamily: "monospace" } }, preview.progress + "/" + sequence.length)
      )
    ),
    !boardDisabled && h("button", {
      className: "miss-button",
      onClick: function() { handleScore({ value: 0, multiplier: 1, score: 0, label: "0", isDouble: false, isBull: false }); },
      style: { width: "100%", background: C.surface, border: "1px solid " + C.border, borderRadius: 12, padding: "11px 0", color: C.muted, fontSize: 14, cursor: "pointer", letterSpacing: 2, fontFamily: "Georgia,serif" }
    }, "Rate - 0 point"),
    recentTurns.length > 0 && h("div", { className: "turn-history-summary", style: { background: C.surface, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 12px" } },
      h("div", { style: { color: C.muted, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 } }, "Derniers tours"),
      recentTurns.map(function(turn, index) {
        return h("div", { key: index, style: { display: "flex", justifyContent: "space-between", gap: 10, color: C.text, fontSize: 12, padding: "3px 0", borderTop: index === 0 ? "0" : "1px solid " + C.border + "66" } },
          h("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, turn.teamName),
          h("strong", { style: { fontFamily: "monospace" } }, "+" + turn.total)
        );
      })
    ),
    h("div", { className: "turn-actions" },
      h(DartsUI.ActionButtons, {
        canUndo: throws.length > 0,
        onUndo: undoLast,
        canPass: throws.length === 0,
        onPass: passTurn,
        turnComplete: turnComplete,
        onValidate: commitTurn,
        C: C
      })
    )
  );

  return h("div", { style: { minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "Georgia,serif", paddingBottom: "env(safe-area-inset-bottom,16px)" } },
    h("div", { style: { background: C.headerBg, borderBottom: "1px solid " + C.border, padding: "12px 16px", paddingTop: "max(12px,env(safe-area-inset-top,12px))", display: "flex", alignItems: "center", justifyContent: "space-between" } },
      h("button", { onClick: function() { setShowQuit(true); }, style: { background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer" } }, "Quitter"),
      h("button", { onClick: function() { setShowStats(true); }, style: { background: "none", border: "none", color: C.accent, fontSize: 14, fontWeight: "bold", cursor: "pointer", letterSpacing: 1 } }, "AUTOUR"),
      h("button", { onClick: function() { setShowHist(true); }, style: { background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer" } }, "Historique")
    ),
    h(DartsUI.GameLayout, {
      C: C,
      leftContent: leftContent,
      boardContent: h(DartsUI.DartBoard, { onScore: handleScore, disabled: boardDisabled, C: C, segments: SEGMENTS, highlightTargets: highlightTargets })
    }),
    showQuit && h(DartsUI.QuitModal, { onCancel: function() { setShowQuit(false); }, onConfirm: onNewGame, C: C }),
    showHist && h(DartsUI.HistoryDrawer, { history: history, teams: teams, onClose: function() { setShowHist(false); }, C: C, teamColors: TEAM_COLORS })
  );
}
