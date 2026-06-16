var DartsStorage = (function() {
  var SCHEMA_VERSION = 1;
  var WRAPPED_SAVE_MARKER = "darts-save";

  var keys = {
    SAVE: "darts_game",
    HISTORY: "darts_history",
    TEAMS: "darts_teams",
    THEME: "darts_theme"
  };

  function parse(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function unwrap(key, value) {
    if (key === keys.SAVE && value && value.__type === WRAPPED_SAVE_MARKER) {
      return value.data || null;
    }
    return value;
  }

  function wrap(key, value) {
    if (key !== keys.SAVE || !value || typeof value !== "object") return value;
    return {
      __type: WRAPPED_SAVE_MARKER,
      schemaVersion: SCHEMA_VERSION,
      savedAt: nowIso(),
      data: value
    };
  }

  function nowIso() {
    var date = new Date();
    return date.toISOString ? date.toISOString() : String(date.getTime());
  }

  function get(key) {
    try {
      return unwrap(key, parse(localStorage.getItem(key)));
    } catch (error) {
      return null;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(wrap(key, value)));
      return true;
    } catch (error) {
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    keys: keys,
    get: get,
    set: set,
    remove: remove
  };
})();
