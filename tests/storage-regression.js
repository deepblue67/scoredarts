var fso = WScript.CreateObject("Scripting.FileSystemObject");
var storageData = {};

if (typeof JSON === "undefined") {
  var JSON = {
    parse: function(text) {
      return eval("(" + text + ")");
    },
    stringify: function(value) {
      if (value === null) return "null";
      if (typeof value === "string") return '"' + value.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
      if (typeof value === "number" || typeof value === "boolean") return String(value);
      if (value instanceof Array) {
        var items = [];
        for (var i = 0; i < value.length; i++) items.push(JSON.stringify(value[i]));
        return "[" + items.join(",") + "]";
      }
      var props = [];
      for (var key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          props.push(JSON.stringify(key) + ":" + JSON.stringify(value[key]));
        }
      }
      return "{" + props.join(",") + "}";
    }
  };
}

var localStorage = {
  getItem: function(key) {
    return Object.prototype.hasOwnProperty.call(storageData, key) ? storageData[key] : null;
  },
  setItem: function(key, value) {
    storageData[key] = String(value);
  },
  removeItem: function(key) {
    delete storageData[key];
  }
};

var storageSource = fso.OpenTextFile("storage.js", 1).ReadAll();
eval(storageSource);

var failures = 0;

function assert(name, condition, details) {
  if (condition) {
    WScript.Echo("PASS " + name);
    return;
  }
  failures++;
  WScript.Echo("FAIL " + name + (details ? " - " + details : ""));
}

storageData[DartsStorage.keys.SAVE] = JSON.stringify({
  gameType: "301",
  teams: [{ id: 1, name: "Red", score: 301 }]
});

var legacySave = DartsStorage.get(DartsStorage.keys.SAVE);
assert("legacy save remains readable", legacySave && legacySave.gameType === "301");
assert("legacy save teams remain readable", legacySave && legacySave.teams[0].score === 301);

DartsStorage.set(DartsStorage.keys.SAVE, {
  gameType: "cricket",
  teams: [{ id: 1, name: "Red" }]
});

var rawWrapped = JSON.parse(storageData[DartsStorage.keys.SAVE]);
var unwrapped = DartsStorage.get(DartsStorage.keys.SAVE);
assert("new save is wrapped with marker", rawWrapped.__type === "darts-save", rawWrapped.__type);
assert("new save has schema version", rawWrapped.schemaVersion === 1, rawWrapped.schemaVersion);
assert("wrapped save is transparent to app", unwrapped && unwrapped.gameType === "cricket");

DartsStorage.set(DartsStorage.keys.THEME, false);
assert("simple values are stored plainly", DartsStorage.get(DartsStorage.keys.THEME) === false);

DartsStorage.remove(DartsStorage.keys.THEME);
assert("remove clears key", DartsStorage.get(DartsStorage.keys.THEME) === null);

if (failures) {
  WScript.Echo(failures + " failure(s)");
  WScript.Quit(1);
}

WScript.Echo("All storage tests passed");
