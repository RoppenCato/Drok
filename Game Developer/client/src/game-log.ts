// The frame log and the error log the player can download (the Survival game's Admin pattern). A phone has no
// console: this is how Robin tells us what his phone saw. Cheap per frame: a few additions, one line a second.

const MAX_SECONDS = 600; // ten minutes of per-second summaries
const MAX_LINES = 300;
const MAX_ERRORS = 200;

export class GameLog {
  private readonly name: string;
  private elapsed = 0;
  private secondMs = 0;
  private secondFrames = 0;
  private secondWorst = 0;
  private readonly seconds: string[] = [];
  private readonly lines: string[] = [];
  private readonly errors: string[] = [];
  private readonly started = Date.now();

  constructor(name: string) {
    this.name = name;
  }

  /** Catch what the page would otherwise lose: thrown errors, failed promises, console.error. */
  attach(w: Window): void {
    w.addEventListener('error', (e) => this.error(`${e.message} (${e.filename}:${e.lineno}:${e.colno})`));
    w.addEventListener('unhandledrejection', (e) => this.error(`unhandled rejection: ${describe(e.reason)}`));
    const original = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      this.error(args.map(describe).join(' '));
      original(...args);
    };
  }

  /** Once a frame, with the frame's time in ms: the fps and the worst frame of each second are kept. */
  frame(delta: number): void {
    this.elapsed += delta;
    this.secondMs += delta;
    this.secondFrames++;
    if (delta > this.secondWorst) this.secondWorst = delta;
    if (this.secondMs < 1000) return;
    const fps = (this.secondFrames * 1000) / this.secondMs;
    this.seconds.push(`${(this.elapsed / 1000).toFixed(0).padStart(5)}s  ${fps.toFixed(1).padStart(5)} fps  worst ${this.secondWorst.toFixed(1)} ms`);
    if (this.seconds.length > MAX_SECONDS) this.seconds.shift();
    this.secondMs = 0;
    this.secondFrames = 0;
    this.secondWorst = 0;
  }

  /** Something that happened in the game, worth seeing next to the frame times. */
  note(text: string): void {
    this.lines.push(`${this.stamp()} ${text}`);
    if (this.lines.length > MAX_LINES) this.lines.shift();
  }

  error(text: string): void {
    this.errors.push(`${this.stamp()} ${text}`);
    if (this.errors.length > MAX_ERRORS) this.errors.shift();
  }

  get errorCount(): number {
    return this.errors.length;
  }

  /** The whole log as text. */
  text(): string {
    return [
      `${this.name} log`,
      `started ${new Date(this.started).toISOString()}, running ${(this.elapsed / 1000).toFixed(1)} s`,
      `agent ${navigator.userAgent}`,
      `screen ${screen.width}x${screen.height} @${window.devicePixelRatio}, viewport ${window.innerWidth}x${window.innerHeight}`,
      `errors ${this.errors.length}`,
      '',
      '== errors ==',
      ...(this.errors.length ? this.errors : ['none']),
      '',
      '== events ==',
      ...(this.lines.length ? this.lines : ['none']),
      '',
      '== frames per second, each second ==',
      ...(this.seconds.length ? this.seconds : ['not a full second yet']),
      '',
    ].join('\n');
  }

  /** Hand the log to the player as a text file. */
  download(): void {
    const slug = this.name.replace(/[^a-z0-9]+/gi, '').toLowerCase() || 'game';
    const blob = new Blob([this.text()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private stamp(): string {
    return `[${(this.elapsed / 1000).toFixed(1).padStart(7)}s]`;
  }
}

function describe(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}${value.stack ? `\n${value.stack}` : ''}`;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
