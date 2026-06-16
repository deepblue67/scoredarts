var fso = WScript.CreateObject("Scripting.FileSystemObject");
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(callback, initialValue) {
    var index = 0;
    var value = initialValue;
    if (arguments.length < 2) {
      value = this[0];
      index = 1;
    }
    for (; index < this.length; index++) {
      if (index in this) value = callback(value, this[index], index, this);
    }
    return value;
  };
}
if (!Array.prototype.every) {
  Array.prototype.every = function(callback) {
    for (var index = 0; index < this.length; index++) {
      if (index in this && !callback(this[index], index, this)) return false;
    }
    return true;
  };
}
if (!Array.prototype.some) {
  Array.prototype.some = function(callback) {
    for (var index = 0; index < this.length; index++) {
      if (index in this && callback(this[index], index, this)) return true;
    }
    return false;
  };
}
if (!Array.prototype.map) {
  Array.prototype.map = function(callback) {
    var result = [];
    for (var index = 0; index < this.length; index++) {
      if (index in this) result[index] = callback(this[index], index, this);
    }
    return result;
  };
}
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback) {
    for (var index = 0; index < this.length; index++) {
      if (index in this) callback(this[index], index, this);
    }
  };
}
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(value) {
    for (var index = 0; index < this.length; index++) {
      if (this[index] === value) return index;
    }
    return -1;
  };
}
if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [];
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) keys.push(key);
    }
    return keys;
  };
}
var scoringSource = fso.OpenTextFile("scoring.js", 1).ReadAll();
eval(scoringSource);

var failures = 0;

function assert(name, condition, details) {
  if (condition) {
    WScript.Echo("PASS " + name);
    return;
  }
  failures++;
  WScript.Echo("FAIL " + name + (details ? " - " + details : ""));
}

function dart(value, multiplier) {
  return {
    value: value,
    multiplier: multiplier,
    score: value * multiplier,
    label: multiplier === 3 ? "T" + value : multiplier === 2 ? "D" + value : "" + value,
    isDouble: multiplier === 2,
    isBull: value === 25 || value === 50
  };
}

var teams01 = [
  { id: 1, name: "Red", score: 60 },
  { id: 2, name: "Blue", score: 301 }
];
var turn01 = DartsScoring.apply01Turn(teams01, 1, [dart(20, 3)]);
var stats01 = DartsScoring.next01Stats({ rounds: 2, totalThrows: 6, bestTurn: 45 }, turn01.total, 1);
var entry01 = DartsScoring.build01GameHistoryEntry({
  date: "test",
  winner: teams01[0],
  rule: "doubleout",
  gameType: "301",
  startScore: 301,
  teams: turn01.teams,
  stats: stats01
});

assert("01 winning turn reaches zero", turn01.teams[0].score === 0, "score=" + turn01.teams[0].score);
assert("01 stats include winning dart", stats01.totalThrows === 7, "totalThrows=" + stats01.totalThrows);
assert("01 history uses updated score", entry01.teams[0].score === 0, "score=" + entry01.teams[0].score);
assert("01 history uses updated total throws", entry01.totalThrows === 7, "totalThrows=" + entry01.totalThrows);
assert("01 best turn updated", entry01.teams[0].bestTurn === 60, "bestTurn=" + entry01.teams[0].bestTurn);

var cricketTeams = [
  { id: 1, name: "Red" },
  { id: 2, name: "Blue" }
];
var sectors = [20, 19, 18, 17, 16, 15, 25];
var cricketState = {
  1: { 20: 2, "pts_20": 0, 19: 3, "pts_19": 0, 18: 3, "pts_18": 0, 17: 3, "pts_17": 0, 16: 3, "pts_16": 0, 15: 3, "pts_15": 0, 25: 3, "pts_25": 0 },
  2: { 20: 0, "pts_20": 0, 19: 3, "pts_19": 0, 18: 3, "pts_18": 0, 17: 3, "pts_17": 0, 16: 3, "pts_16": 0, 15: 3, "pts_15": 0, 25: 3, "pts_25": 0 }
};
var cricketNext = DartsScoring.applyCricketTurn(cricketState, cricketTeams, 1, sectors, [dart(20, 3)]);
var cricketWinner = DartsScoring.findCricketWinner(cricketNext, cricketTeams, sectors);

assert("cricket closes sector", cricketNext[1][20] === 3, "hits=" + cricketNext[1][20]);
assert("cricket scores excess while opponent is open", cricketNext[1].pts_20 === 40, "pts=" + cricketNext[1].pts_20);
assert("cricket detects winner with enough points", cricketWinner && cricketWinner.id === 1);

if (failures) {
  WScript.Echo(failures + " failure(s)");
  WScript.Quit(1);
}

WScript.Echo("All tests passed");
