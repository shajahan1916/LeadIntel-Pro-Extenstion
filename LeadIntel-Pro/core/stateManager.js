class StateManager {

  constructor() {

    this.state = {
      campaigns: [],
      leads: [],
      duplicates: [],
      extraction: {
        isRunning: false,
        isPaused: false,
        currentCampaignId: null,
        totalScans: 0,
        lastScanAt: null
      },
      ui: {
        activeView: "dashboard",
        selectedCampaignId: null,
        notifications: []
      }
    };

    this.listeners = new Map();
  }

  getState() {

    return structuredClone(
      this.state
    );
  }

  get(path) {

    if (!path) {
      return this.getState();
    }

    const keys = path.split(".");

    let current = this.state;

    for (const key of keys) {

      if (
        current === undefined ||
        current === null
      ) {

        return undefined;
      }

      current = current[key];
    }

    return structuredClone(current);
  }

  set(path, value) {

    if (!path) {
      return;
    }

    const keys = path.split(".");

    let current = this.state;

    while (keys.length > 1) {

      const key = keys.shift();

      if (
        typeof current[key] !== "object" ||
        current[key] === null
      ) {

        current[key] = {};
      }

      current = current[key];
    }

    current[keys[0]] = value;

    this.notify(path);
  }

  update(path, updater) {

    const currentValue =
      this.get(path);

    const updatedValue =
      updater(currentValue);

    this.set(
      path,
      updatedValue
    );
  }

  push(path, item) {

    const current =
      this.get(path);

    if (!Array.isArray(current)) {

      throw new Error(
        `State path "${path}" is not an array`
      );
    }

    current.push(item);

    this.set(path, current);
  }

  remove(path, predicate) {

    const current =
      this.get(path);

    if (!Array.isArray(current)) {

      throw new Error(
        `State path "${path}" is not an array`
      );
    }

    const filtered =
      current.filter(
        item => !predicate(item)
      );

    this.set(path, filtered);
  }

  clear(path) {

    const current =
      this.get(path);

    if (Array.isArray(current)) {

      this.set(path, []);

      return;
    }

    if (
      typeof current === "object"
    ) {

      this.set(path, {});

      return;
    }

    this.set(path, null);
  }

  subscribe(path, callback) {

    if (
      typeof callback !== "function"
    ) {

      throw new Error(
        "Callback must be a function"
      );
    }

    if (
      !this.listeners.has(path)
    ) {

      this.listeners.set(
        path,
        new Set()
      );
    }

    this.listeners
      .get(path)
      .add(callback);

    return () => {

      this.unsubscribe(
        path,
        callback
      );
    };
  }

  unsubscribe(path, callback) {

    if (
      !this.listeners.has(path)
    ) {
      return;
    }

    this.listeners
      .get(path)
      .delete(callback);
  }

  notify(path) {

    const exactListeners =
      this.listeners.get(path);

    if (exactListeners) {

      for (const callback of exactListeners) {

        try {

          callback(
            this.get(path)
          );

        } catch (error) {

          console.error(
            "State listener failed",
            error
          );
        }
      }
    }

    this.notifyParentPaths(path);
  }

  notifyParentPaths(path) {

    const segments =
      path.split(".");

    while (segments.length > 1) {

      segments.pop();

      const parentPath =
        segments.join(".");

      const listeners =
        this.listeners.get(
          parentPath
        );

      if (!listeners) {
        continue;
      }

      for (const callback of listeners) {

        try {

          callback(
            this.get(parentPath)
          );

        } catch (error) {

          console.error(
            "Parent listener failed",
            error
          );
        }
      }
    }
  }

  reset() {

    this.state = {
      campaigns: [],
      leads: [],
      duplicates: [],
      extraction: {
        isRunning: false,
        isPaused: false,
        currentCampaignId: null,
        totalScans: 0,
        lastScanAt: null
      },
      ui: {
        activeView: "dashboard",
        selectedCampaignId: null,
        notifications: []
      }
    };

    this.listeners.clear();
  }
}

const stateManager =
  new StateManager();

export default stateManager;