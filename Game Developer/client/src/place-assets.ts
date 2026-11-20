// The pictures of a place, loaded with the place and let go when he leaves it: its ground, its props, its people,
// and the monsters that live there. Two islands' worth at once is more than a phone should hold (Crab Cay alone is
// about 56 MB decoded), so only the island he is on is in memory. The hero, his gear, the loot, the glass and the
// sounds are loaded once, in the boot scene.

import Phaser from 'phaser';
import { PLACES } from '../../rules/src/index.ts';
import { ART } from './art.ts';

interface Asset {
  kind: 'image' | 'atlas' | 'json';
  key: string;
  png?: string;
  json?: string;
}

/** Everything a place needs that nothing else does. An atlas is two things: the pictures, and its data as plain json. */
function assetsOf(place: string): Asset[] {
  const out: Asset[] = [];
  const atlas = (key: string, folder: string, name = key): void => {
    out.push({ kind: 'atlas', key, png: `art/${folder}/${name}.png`, json: `art/${folder}/${name}.json` });
    out.push({ kind: 'json', key: `${key}:data`, json: `art/${folder}/${name}.json` });
  };
  const folder = ART.places[place];
  if (folder) {
    out.push({ kind: 'image', key: `${folder}:ground`, png: `art/${folder}/ground.png` });
    atlas(folder, folder, ART.sets[folder] ?? folder);
    out.push({ kind: 'json', key: `${folder}:place`, json: `art/${folder}/place.json` });
    const folk = ART.folk[folder];
    if (folk) atlas(`${folder}:folk`, folder, folk);
  }
  const kinds = new Set((PLACES[place]?.zones ?? []).map((z) => z.kind));
  for (const kind of kinds) if (ART.monsters.includes(kind)) atlas(kind, kind);
  return out;
}

function has(scene: Phaser.Scene, a: Asset): boolean {
  return a.kind === 'json' ? scene.cache.json.exists(a.key) : scene.textures.exists(a.key);
}

/** Are all of a place's pictures in memory? */
export function placeLoaded(scene: Phaser.Scene, place: string): boolean {
  return assetsOf(place).every((a) => has(scene, a));
}

/** Put a place's missing pictures on the scene's loader. The boot scene calls this in its preload; nothing starts here. */
export function queuePlace(scene: Phaser.Scene, place: string): void {
  for (const a of assetsOf(place)) {
    if (has(scene, a)) continue;
    if (a.kind === 'image') scene.load.image(a.key, a.png!);
    else if (a.kind === 'atlas') scene.load.atlas(a.key, a.png!, a.json!);
    else scene.load.json(a.key, a.json!);
  }
}

/** Load a place's missing pictures in a scene that is already running, then call `done`. At once if none is missing. */
export function loadPlace(scene: Phaser.Scene, place: string, done: () => void): void {
  if (placeLoaded(scene, place)) {
    done();
    return;
  }
  queuePlace(scene, place);
  scene.load.once(Phaser.Loader.Events.COMPLETE, done);
  scene.load.start();
}

/** Let go of every other place's pictures. Call it only when nothing on the screen is drawn from them any more. */
export function dropOtherPlaces(scene: Phaser.Scene, place: string): void {
  const keep = new Set(assetsOf(place).map((a) => a.key));
  for (const other of Object.keys(PLACES)) {
    if (other === place) continue;
    for (const a of assetsOf(other)) {
      if (keep.has(a.key) || !has(scene, a)) continue;
      if (a.kind === 'json') scene.cache.json.remove(a.key);
      else scene.textures.remove(a.key);
    }
  }
}
