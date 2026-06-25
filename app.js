var APP_VERSION = "V20260625 17H20";
var useState = React.useState;
var useEffect = React.useEffect;
var MAX_THROWS = 3;
var SEGMENTS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
var CRICKET_SECTORS = [20, 19, 18, 17, 16, 15, 25];
var TEAM_COLORS = ["#e84545", "#4e9af1", "#27c96f", "#f5a623", "#b44fff", "#ff7c2a", "#00cec9", "#fd79a8"];
var SAVE_KEY = DartsStorage.keys.SAVE;
var HISTORY_KEY = DartsStorage.keys.HISTORY;
var TEAMS_KEY = DartsStorage.keys.TEAMS;
var THEME_KEY = DartsStorage.keys.THEME;
var CHECKOUT = {
  170: "T20 T20 Bull",
  169: "T20 T19 Bull",
  167: "T20 T19 Bull",
  164: "T20 T18 Bull",
  163: "T20 T17 Bull",
  161: "T20 T17 Bull",
  160: "T20 T20 D20",
  158: "T20 T20 D19",
  157: "T20 T19 D20",
  156: "T20 T20 D18",
  155: "T20 T19 D19",
  154: "T20 T18 D20",
  153: "T20 T19 D18",
  152: "T20 T20 D16",
  151: "T20 T17 D20",
  150: "T20 T18 D18",
  149: "T20 T19 D16",
  148: "T20 T16 D20",
  147: "T20 T17 D18",
  146: "T20 T18 D16",
  145: "T20 T15 D20",
  144: "T20 T20 D12",
  143: "T20 T17 D16",
  142: "T20 T14 D20",
  141: "T20 T19 D12",
  140: "T20 T16 D16",
  139: "T20 T13 D20",
  138: "T20 T18 D12",
  137: "T20 T15 D16",
  136: "T20 T20 D8",
  135: "T20 T17 D12",
  134: "T20 T14 D16",
  133: "T20 T19 D8",
  132: "T20 T16 D12",
  131: "T20 T13 D16",
  130: "T20 T20 D5",
  129: "T19 T16 D12",
  128: "T20 T12 D16",
  127: "T20 T17 D8",
  126: "T19 T19 D6",
  125: "T20 T15 D10",
  124: "T20 T14 D8",
  123: "T19 T16 D6",
  122: "T18 T18 D7",
  121: "T20 T11 D8",
  120: "T20 S20 D20",
  119: "T19 T12 D6",
  118: "T20 S18 D20",
  117: "T20 S17 D20",
  116: "T20 S16 D20",
  115: "T20 S15 D20",
  114: "T20 S14 D20",
  113: "T20 S13 D20",
  112: "T20 S12 D20",
  111: "T20 S11 D20",
  110: "T20 S10 D20",
  109: "T20 S9 D20",
  108: "T20 S8 D20",
  107: "T19 S10 D20",
  106: "T20 S6 D20",
  105: "T20 S5 D20",
  104: "T20 S4 D20",
  103: "T20 S3 D20",
  102: "T20 S2 D20",
  101: "T20 S1 D20",
  100: "T20 D20",
  99: "T19 S10 D16",
  98: "T20 D19",
  97: "T19 D20",
  96: "T20 D18",
  95: "T19 D19",
  94: "T18 D20",
  93: "T19 D18",
  92: "T20 D16",
  91: "T17 D20",
  90: "T18 D18",
  89: "T19 D16",
  88: "T20 D14",
  87: "T17 D18",
  86: "T18 D16",
  85: "T15 D20",
  84: "T20 D12",
  83: "T17 D16",
  82: "T14 D20",
  81: "T19 D12",
  80: "T20 D10",
  79: "T13 D20",
  78: "T18 D12",
  77: "T19 D10",
  76: "T20 D8",
  75: "T17 D12",
  74: "T14 D16",
  73: "T19 D8",
  72: "T16 D12",
  71: "T13 D16",
  70: "T18 D8",
  69: "T19 D6",
  68: "T20 D4",
  67: "T17 D8",
  66: "T10 D18",
  65: "T19 D4",
  64: "T16 D8",
  63: "T13 D12",
  62: "T10 D16",
  61: "T15 D8",
  60: "S20 D20",
  59: "S19 D20",
  58: "S18 D20",
  57: "S17 D20",
  56: "S16 D20",
  55: "S15 D20",
  54: "S14 D20",
  53: "S13 D20",
  52: "S12 D20",
  51: "S11 D20",
  50: "Bull",
  49: "S17 D16",
  48: "S16 D16",
  47: "S15 D16",
  46: "S14 D16",
  45: "S13 D16",
  44: "S12 D16",
  43: "S11 D16",
  42: "S10 D16",
  41: "S9 D16",
  40: "D20",
  38: "D19",
  36: "D18",
  34: "D17",
  32: "D16",
  30: "D15",
  28: "D14",
  26: "D13",
  24: "D12",
  22: "D11",
  20: "D10",
  18: "D9",
  16: "D8",
  14: "D7",
  12: "D6",
  10: "D5",
  8: "D4",
  6: "D3",
  4: "D2",
  2: "D1"
};
var THEMES = [
  {
    id: "classic-dark",
    label: "Classique nuit",
    icon: "moon",
    bg: "#0d0f1a",
    surface: "#181c2f",
    card: "#242943",
    border: "#465071",
    accent: "#f5a623",
    accentDim: "#b87d18",
    green: "#27c96f",
    red: "#e84545",
    text: "#f0f2ff",
    muted: "#b2b8d8",
    inputBg: "#222741",
    headerBg: "#181c2f",
    dartRed: "#cc2222",
    dartGreen: "#1a6b3a",
    dartBlack: "#111",
    dartCream: "#f5f0e0"
  },
  {
    id: "classic-light",
    label: "Classique clair",
    icon: "sun",
    bg: "#f0f2f5",
    surface: "#ffffff",
    card: "#e4e7ef",
    border: "#aeb7c8",
    accent: "#e08b00",
    accentDim: "#b87d18",
    green: "#1a9450",
    red: "#cc2222",
    text: "#1a1c2e",
    muted: "#4f596c",
    inputBg: "#ffffff",
    headerBg: "#ffffff",
    dartRed: "#cc2222",
    dartGreen: "#1a6b3a",
    dartBlack: "#111",
    dartCream: "#f5f0e0"
  },
  {
    id: "graphite",
    label: "Graphite",
    icon: "settings",
    bg: "#101114",
    surface: "#1d2027",
    card: "#2b303b",
    border: "#586174",
    accent: "#e6b450",
    accentDim: "#a87924",
    green: "#3ddc84",
    red: "#ff5f5f",
    text: "#f5f5f7",
    muted: "#c3c8d4",
    inputBg: "#2b303b",
    headerBg: "#17191f",
    dartRed: "#cc2222",
    dartGreen: "#1a6b3a",
    dartBlack: "#111",
    dartCream: "#f5f0e0"
  },
  {
    id: "ocean",
    label: "Ocean",
    icon: "target",
    bg: "#061821",
    surface: "#0f2b3a",
    card: "#183d50",
    border: "#34718a",
    accent: "#35c2ff",
    accentDim: "#1788b8",
    green: "#4ade80",
    red: "#fb7185",
    text: "#e8f7ff",
    muted: "#b7d8e6",
    inputBg: "#183d50",
    headerBg: "#0a202b",
    dartRed: "#cc2222",
    dartGreen: "#1a6b3a",
    dartBlack: "#111",
    dartCream: "#f5f0e0"
  },
  {
    id: "forest",
    label: "Foret",
    icon: "around",
    bg: "#08160f",
    surface: "#122b1e",
    card: "#1d3f2a",
    border: "#45845a",
    accent: "#a7f05a",
    accentDim: "#6ea92f",
    green: "#34d399",
    red: "#f87171",
    text: "#f0fff4",
    muted: "#c0dfc8",
    inputBg: "#1d3f2a",
    headerBg: "#0d1d15",
    dartRed: "#cc2222",
    dartGreen: "#1a6b3a",
    dartBlack: "#111",
    dartCream: "#f5f0e0"
  },
  {
    id: "cherry",
    label: "Cerise",
    icon: "target",
    bg: "#1a0b13",
    surface: "#2d1422",
    card: "#3e1d30",
    border: "#7d3b5c",
    accent: "#ff5c8a",
    accentDim: "#bd315c",
    green: "#7ee787",
    red: "#ff6b6b",
    text: "#fff0f6",
    muted: "#e5b7cc",
    inputBg: "#3e1d30",
    headerBg: "#22101a",
    dartRed: "#cc2222",
    dartGreen: "#1a6b3a",
    dartBlack: "#111",
    dartCream: "#f5f0e0"
  },
  {
    id: "royal",
    label: "Royal",
    icon: "chart",
    bg: "#100f24",
    surface: "#1f1c4a",
    card: "#2d2970",
    border: "#625bb3",
    accent: "#c6a5ff",
    accentDim: "#8b68d6",
    green: "#64d987",
    red: "#ff6b8a",
    text: "#f4f0ff",
    muted: "#c9c1f0",
    inputBg: "#2d2970",
    headerBg: "#171532",
    dartRed: "#cc2222",
    dartGreen: "#1a6b3a",
    dartBlack: "#111",
    dartCream: "#f5f0e0"
  },
  {
    id: "solar",
    label: "Solaire",
    icon: "sun",
    bg: "#231804",
    surface: "#3b2a0a",
    card: "#523c13",
    border: "#927034",
    accent: "#ffd166",
    accentDim: "#c7922b",
    green: "#95d46a",
    red: "#ff7b54",
    text: "#fff6df",
    muted: "#f1d99a",
    inputBg: "#523c13",
    headerBg: "#2b1f08",
    dartRed: "#cc2222",
    dartGreen: "#1a6b3a",
    dartBlack: "#111",
    dartCream: "#f5f0e0"
  },
  {
    id: "neon",
    label: "Neon",
    icon: "target",
    bg: "#050711",
    surface: "#0f1326",
    card: "#1a2140",
    border: "#3d4d86",
    accent: "#00f5d4",
    accentDim: "#00a896",
    green: "#00f5a0",
    red: "#ff3d81",
    text: "#ecfdfd",
    muted: "#b4c7e8",
    inputBg: "#1a2140",
    headerBg: "#090c19",
    dartRed: "#cc2222",
    dartGreen: "#1a6b3a",
    dartBlack: "#111",
    dartCream: "#f5f0e0"
  },
  {
    id: "vintage",
    label: "Vintage",
    icon: "cricket",
    bg: "#17130e",
    surface: "#2a2118",
    card: "#3a2d20",
    border: "#786047",
    accent: "#d6a85c",
    accentDim: "#9d7136",
    green: "#84a66a",
    red: "#c96b5c",
    text: "#f7ecd8",
    muted: "#d9c4a5",
    inputBg: "#3a2d20",
    headerBg: "#201910",
    dartRed: "#cc2222",
    dartGreen: "#1a6b3a",
    dartBlack: "#111",
    dartCream: "#f5f0e0"
  }
];
function normalizeThemeId(value) {
  if (value === true) return "classic-dark";
  if (value === false) return "classic-light";
  for (var i = 0; i < THEMES.length; i++) {
    if (THEMES[i].id === value) return value;
  }
  return "classic-dark";
}
function makeTheme(themeId) {
  var id = normalizeThemeId(themeId);
  for (var i = 0; i < THEMES.length; i++) {
    if (THEMES[i].id === id) return THEMES[i];
  }
  return THEMES[0];
}
function ls_get(k) {
  return DartsStorage.get(k);
}
function ls_set(k, v) {
  return DartsStorage.set(k, v);
}
function ls_del(k) {
  return DartsStorage.remove(k);
}
function App() {
  var saved = ls_get(SAVE_KEY);
  var savedTheme = normalizeThemeId(ls_get(THEME_KEY));
  var b1 = useState(saved ? "resume" : "home");
  var screen = b1[0],
    setScreen = b1[1];
  var b2 = useState(null);
  var gameTeams = b2[0],
    setGameTeams = b2[1];
  var b3 = useState(saved);
  var savedSt = b3[0],
    setSavedSt = b3[1];
  var b4 = useState(null);
  var gameRule = b4[0],
    setGameRule = b4[1];
  var b5 = useState(savedTheme);
  var themeId = b5[0],
    setThemeId = b5[1];
  var b6 = useState(null);
  var gameType = b6[0],
    setGameType = b6[1];
  var b7 = useState(false);
  var showStats = b7[0],
    setShowStats = b7[1];
  var b8 = useState(false);
  var showSettings = b8[0],
    setShowSettings = b8[1];
  var C = makeTheme(themeId);
  useEffect(function () {
    document.body.style.background = C.bg;
  }, [themeId]);
  function goHome() {
    ls_del(SAVE_KEY);
    setSavedSt(null);
    setGameTeams(null);
    setScreen("home");
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
  if (showSettings) return React.createElement(DartsUI.SettingsScreen, {
    C: C,
    themeId: themeId,
    themes: THEMES,
    version: APP_VERSION,
    onSetTheme: function (value) {
      var nextTheme = normalizeThemeId(value);
      setThemeId(nextTheme);
      ls_set(THEME_KEY, nextTheme);
    },
    onClearHistory: function () {
      if (window.confirm("Effacer tout l'historique des parties ?")) ls_del(HISTORY_KEY);
    },
    onClearSave: function () {
      if (window.confirm("Annuler la partie en cours sauvegardée ?")) ls_del(SAVE_KEY);
    },
    onClose: function () {
      setShowSettings(false);
    }
  });
  if (screen === "resume" && savedSt) {
    return React.createElement(DartsUI.ResumeScreen, {
      C: C,
      saved: savedSt,
      teamColors: TEAM_COLORS,
      onResume: function () {
        setGameTeams(savedSt.initialTeams || savedSt.teams.map(function (t) {
          return {
            id: t.id,
            name: t.name
          };
        }));
        setGameRule(savedSt.rule || "simple");
        setGameType(savedSt.gameType || "301");
        setScreen("game");
      },
      onNewGame: function () {
        ls_del(SAVE_KEY);
        setSavedSt(null);
        setScreen("home");
      }
    });
  }
  if (screen === "home") {
    return React.createElement(DartsUI.HomeScreen, {
      C: C,
      onShowStats: function () {
        setShowStats(true);
      },
      onShowSettings: function () {
        setShowSettings(true);
      },
      onSelect: function (type) {
        setGameType(type);
        setScreen("setup");
      }
    });
  }
  if (screen === "setup") {
    return React.createElement(DartsUI.SetupScreen, {
      C: C,
      gameType: gameType,
      initialTeams: ls_get(TEAMS_KEY) || [{
        id: 1,
        name: "Equipe Rouge"
      }, {
        id: 2,
        name: "Equipe Bleue"
      }],
      teamColors: TEAM_COLORS,
      onSaveTeams: function (teams) {
        ls_set(TEAMS_KEY, teams);
      },
      onBack: function () {
        setScreen("home");
      },
      onStart: function (teams, rule) {
        ls_del(SAVE_KEY);
        setSavedSt(null);
        setGameTeams(teams);
        setGameRule(rule);
        setScreen("game");
      }
    });
  }
  if (screen === "game" && gameTeams) {
    var savedForGame = savedSt && savedSt.gameType === (gameType || "301") ? savedSt : null;
    if (gameType === "cricket") {
      return React.createElement(GameCricket, {
        C: C,
        initialTeams: gameTeams,
        savedState: savedForGame,
        onNewGame: goHome
      });
    }
    if (gameType === "around") {
      return React.createElement(GameAround, {
        C: C,
        initialTeams: gameTeams,
        rule: gameRule,
        savedState: savedForGame,
        onNewGame: goHome
      });
    }
    return React.createElement(Game301, {
      C: C,
      initialTeams: gameTeams,
      rule: gameRule,
      gameType: gameType,
      savedState: savedForGame,
      onNewGame: goHome
    });
  }
  return React.createElement(DartsUI.HomeScreen, {
    C: C,
    onShowStats: function () {
      setShowStats(true);
    },
    onShowSettings: function () {
      setShowSettings(true);
    },
    onSelect: function (type) {
      setGameType(type);
      setScreen("setup");
    }
  });
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
