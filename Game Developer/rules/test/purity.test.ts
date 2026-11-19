import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The rules are a pure function: no screen, no socket, no clock, no Math.random, no packages. This test reads the
// source and refuses the things that would break that. Cheap, and it catches a slip the day it happens.
const SRC = join(import.meta.dirname, '..', 'src');

const FORBIDDEN = [/Math\.random/, /Date\.now/, /new Date\b/, /performance\.now/, /\bsetTimeout\b/, /\bsetInterval\b/, /\bwindow\b/, /\bdocument\b/, /\bnavigator\b/, /\blocalStorage\b/, /\bfetch\(/, /\bWebSocket\b/, /\bconsole\./, /\bprocess\./, /\brequire\(/];

const files = readdirSync(SRC).filter((f) => f.endsWith('.ts'));

describe('the rules stay pure', () => {
  it('has source files to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const name of files) {
    const text = readFileSync(join(SRC, name), 'utf8');

    it(`${name} touches no screen, socket, clock or Math.random`, () => {
      for (const pattern of FORBIDDEN) expect(text, `${name} matches ${pattern}`).not.toMatch(pattern);
    });

    it(`${name} imports only its own files`, () => {
      const imports = [...text.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]!);
      for (const spec of imports) expect(spec.startsWith('./') || spec.startsWith('../data/'), `${name} imports ${spec}`).toBe(true);
    });
  }
});
