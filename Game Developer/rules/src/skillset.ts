// The table of skills alone, for the files that the skills' own code leans on.
import skillsJson from '../data/skills.json';
import type { SkillId } from './types.ts';

export const SKILLS = skillsJson.skills as Record<SkillId, { name: string; level: number; text: string; rage?: number; cooldown?: number; power?: number; radius?: number; seconds?: number; share?: number }>;
/** The skills in the order he learns them: the tree, read downwards. */
export const SKILL_ORDER = (Object.keys(SKILLS) as SkillId[]).sort((a, b) => SKILLS[a].level - SKILLS[b].level);
