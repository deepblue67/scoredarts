var DartsScoring = (function() {
  function sumThrows(throwsList) {
    return throwsList.reduce(function(sum, dart) {
      return sum + dart.score;
    }, 0);
  }

  function next01Stats(stats, turnTotal, throwCount) {
    var best = stats.bestTurn === null ? turnTotal : Math.max(stats.bestTurn, turnTotal);
    return {
      rounds: stats.rounds + 1,
      totalThrows: stats.totalThrows + throwCount,
      bestTurn: best
    };
  }

  function nextBustStats(stats, throwCount) {
    return {
      rounds: stats.rounds + 1,
      totalThrows: stats.totalThrows + throwCount,
      bestTurn: stats.bestTurn
    };
  }

  function apply01Turn(teams, teamId, throwsList) {
    var total = sumThrows(throwsList);
    var scoreBefore = null;
    var scoreAfter = null;
    var nextTeams = teams.map(function(team) {
      if (team.id !== teamId) return team;
      scoreBefore = team.score;
      scoreAfter = team.score - total;
      return { id: team.id, name: team.name, score: scoreAfter < 0 ? 0 : scoreAfter };
    });

    return {
      teams: nextTeams,
      total: total,
      scoreBefore: scoreBefore,
      scoreAfter: scoreAfter
    };
  }

  function build01GameHistoryEntry(opts) {
    var avgPerTurn = opts.stats.totalThrows > 0
      ? (opts.startScore / opts.stats.totalThrows * 3).toFixed(1)
      : null;

    return {
      date: opts.date,
      winner: opts.winner.name,
      rule: opts.rule,
      gameType: opts.gameType,
      totalThrows: opts.stats.totalThrows,
      teams: opts.teams.map(function(team) {
        return {
          name: team.name,
          score: team.score,
          avgPerTurn: avgPerTurn,
          bestTurn: opts.stats.bestTurn
        };
      })
    };
  }

  function cloneCricketState(state) {
    var next = {};
    Object.keys(state || {}).forEach(function(teamId) {
      next[teamId] = {};
      Object.keys(state[teamId] || {}).forEach(function(key) {
        next[teamId][key] = state[teamId][key];
      });
    });
    return next;
  }

  function teamTotalInCricketState(state, teamId) {
    return Object.keys(state[teamId] || {}).reduce(function(sum, key) {
      return key.indexOf("pts_") === 0 ? sum + (state[teamId][key] || 0) : sum;
    }, 0);
  }

  function allCricketSectorsClosed(state, teamId, sectors) {
    return sectors.every(function(sector) {
      return (state[teamId][sector] || 0) >= 3;
    });
  }

  function applyCricketTurn(state, teams, teamId, sectors, throwsList) {
    var nextState = cloneCricketState(state);

    throwsList.forEach(function(dart) {
      var value = dart.value === 50 ? 25 : dart.value;
      if (sectors.indexOf(value) < 0) return;

      var hits = dart.multiplier;
      var current = nextState[teamId][value] || 0;
      var anyOpponentOpen;

      if (current >= 3) {
        anyOpponentOpen = teams.some(function(team) {
          return team.id !== teamId && (nextState[team.id][value] || 0) < 3;
        });
        if (anyOpponentOpen) {
          nextState[teamId]["pts_" + value] = (nextState[teamId]["pts_" + value] || 0) + value * hits;
        }
        return;
      }

      var newHits = current + hits;
      if (newHits < 3) {
        nextState[teamId][value] = newHits;
        return;
      }

      nextState[teamId][value] = 3;
      var excess = newHits - 3;
      if (excess > 0) {
        anyOpponentOpen = teams.some(function(team) {
          return team.id !== teamId && (nextState[team.id][value] || 0) < 3;
        });
        if (anyOpponentOpen) {
          nextState[teamId]["pts_" + value] = (nextState[teamId]["pts_" + value] || 0) + value * excess;
        }
      }
    });

    return nextState;
  }

  function findCricketWinner(state, teams, sectors) {
    for (var index = 0; index < teams.length; index++) {
      var team = teams[index];
      if (!allCricketSectorsClosed(state, team.id, sectors)) continue;

      var total = teamTotalInCricketState(state, team.id);
      var hasEnoughPoints = teams.every(function(otherTeam) {
        return otherTeam.id === team.id || teamTotalInCricketState(state, otherTeam.id) <= total;
      });
      if (hasEnoughPoints) return team;
    }
    return null;
  }

  return {
    sumThrows: sumThrows,
    next01Stats: next01Stats,
    nextBustStats: nextBustStats,
    apply01Turn: apply01Turn,
    build01GameHistoryEntry: build01GameHistoryEntry,
    cloneCricketState: cloneCricketState,
    teamTotalInCricketState: teamTotalInCricketState,
    allCricketSectorsClosed: allCricketSectorsClosed,
    applyCricketTurn: applyCricketTurn,
    findCricketWinner: findCricketWinner
  };
})();
