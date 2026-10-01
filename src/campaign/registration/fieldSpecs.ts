import type { Registration } from '../content';
import type { ApplicationDraft } from '../application';
import { EXPERIENCE, ASPECTS, PLAYSTYLES, BOND, CONFLICT, VIBE_QS, CONDUCT, type Option } from '../registrationData';
import { activeFitQuestions } from './useRegistration';

export type FieldKind = 'input' | 'area' | 'single' | 'multi';

export interface FieldSpec {
  id: string; // plain key, or "fit.<id>" for campaign-fit answers
  kind: FieldKind;
  label: string;
  help?: string;
  placeholder?: string;
  rows?: number;
  opts?: Option[];
  max?: number; // multi: cap on selections
  exclusive?: string; // multi: picking this value clears everything else
  req: boolean;
  sub?: boolean; // sub-question (no numbering) — e.g. the "tell us more" note under an Other pick
}

const rec = (a: ApplicationDraft) => a as unknown as Record<string, string>;

export function getField(a: ApplicationDraft, id: string): string {
  if (id.startsWith('fit.')) return a.fit[id.slice(4)] || '';
  return rec(a)[id] || '';
}

export function getFieldArr(a: ApplicationDraft, id: string): string[] {
  const v = rec(a)[id];
  return Array.isArray(v) ? v : [];
}

export function setField(a: ApplicationDraft, id: string, v: string) {
  if (id.startsWith('fit.')) a.fit[id.slice(4)] = v;
  else rec(a)[id] = v;
}

export function setFieldArr(a: ApplicationDraft, id: string, v: string[]) {
  (a as unknown as Record<string, string[]>)[id] = v;
}

export function buildSpecs(step: number, a: ApplicationDraft, reg: Registration): FieldSpec[] {
  if (step === 0) {
    return [
      { id: 'discord', kind: 'input', label: 'Discord name / tag', placeholder: 'e.g. hollowmere_ghost', req: true },
      { id: 'experience', kind: 'single', label: 'How much D&D have you played?', opts: EXPERIENCE, req: true },
      { id: 'aspects', kind: 'multi', max: 2, label: 'What do you enjoy most in D&D?', help: 'Pick up to two.', opts: ASPECTS, req: true },
      { id: 'playstyle', kind: 'multi', exclusive: 'help', label: 'What kind of player are you at the table?', help: 'Pick any that fit, or let the DM figure it out.', opts: PLAYSTYLES, req: true },
      { id: 'lines', kind: 'area', rows: 3, label: 'Lines', help: 'Hard limits. Content that should never appear in the game.', placeholder: 'Write "none" if you have none', req: false },
      { id: 'veils', kind: 'area', rows: 3, label: 'Veils', help: 'Content that can happen in the story, but off-screen or faded to black.', placeholder: 'Write "none" if you have none', req: false },
      { id: 'pitch', kind: 'area', rows: 5, label: 'What makes you interesting for this campaign?', help: 'Why this table, what you bring to it, anything the DM should know about you.', req: true },
    ];
  }
  if (step === 1) {
    return activeFitQuestions(reg).map((q) =>
      q.type === 'choice'
        ? { id: `fit.${q.id}`, kind: 'single' as const, label: q.prompt, opts: q.options.map((o) => ({ v: o, label: o })), req: q.required }
        : { id: `fit.${q.id}`, kind: 'area' as const, rows: 4, label: q.prompt, req: q.required },
    );
  }
  if (step === 2) {
    const base: FieldSpec[] = [
      { id: 'bond', kind: 'single', label: 'How do you usually bond with the other players?', opts: BOND, req: true },
      { id: 'bondNote', kind: 'area', rows: 3, label: 'Tell us more about how you blend in with a group', sub: true, req: a.bond === 'other' },
      { id: 'conflict', kind: 'single', label: 'If a problem or conflict comes up at the table, how do you want to handle it?', opts: CONFLICT, req: true },
      { id: 'conflictNote', kind: 'area', rows: 3, label: 'Anything the DM should know about how you handle conflict?', sub: true, req: a.conflict === 'other' },
    ];
    const vibe: FieldSpec[] = VIBE_QS.flatMap((v) => {
      const list: FieldSpec[] = [{ id: v.id, kind: 'single', label: v.label, opts: v.opts, req: true }];
      if (rec(a)[v.id] === 'other') list.push({ id: `${v.id}Note`, kind: 'area', rows: 3, label: 'Tell us more', sub: true, req: true });
      return list;
    });
    const conduct: FieldSpec = { id: 'conduct', kind: 'multi', label: CONDUCT.label, help: CONDUCT.help, opts: [{ v: 'agreed', label: CONDUCT.agree }], req: true };
    return [...base, ...vibe, conduct];
  }
  return [];
}
