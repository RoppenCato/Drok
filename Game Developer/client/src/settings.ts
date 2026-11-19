// The player's settings: sound off (for the sound layer to come) and fewer effects (the "fast and snappy" switch: no
// tweens, things jump into place). Kept in localStorage; read where they matter.

const KEY = 'drok.settings';

export interface Settings {
  mute: boolean;
  fewerEffects: boolean;
}

const DEFAULTS: Settings = { mute: false, fewerEffects: false };

/** localStorage, or null where the browser refuses it (storage blocked in a private window): the game still runs, unsaved. */
export function storageOrNull(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function load(storage: Storage | null): Settings {
  try {
    const raw = storage?.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    // A broken value: the defaults.
  }
  return { ...DEFAULTS };
}

class Store {
  private current: Settings;
  private readonly storage: Storage | null;

  constructor(storage: Storage | null) {
    this.storage = storage;
    this.current = load(storage);
  }

  get(): Settings {
    return this.current;
  }

  set(patch: Partial<Settings>): Settings {
    this.current = { ...this.current, ...patch };
    try {
      this.storage?.setItem(KEY, JSON.stringify(this.current));
    } catch {
      // Storage full or blocked: the setting holds for this page only.
    }
    return this.current;
  }

  /** The time a tween takes: none with fewer effects, so things jump into place. */
  ms(ms: number): number {
    return this.current.fewerEffects ? 0 : ms;
  }
}

export const settings = new Store(storageOrNull());
