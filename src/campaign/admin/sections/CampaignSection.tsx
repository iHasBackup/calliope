import type { Content } from '../../content';
import { FieldRow, NumberField, Panel, SectionHeader, TextAreaField, TextField, mutedInk } from '../fields';

export function CampaignSection({ draft, update }: { draft: Content; update: (fn: (c: Content) => void) => void }) {
  const progress = Math.max(0, Math.min(100, draft.progress));
  const filled = Math.round(progress / 5);
  const segments = Array.from({ length: 20 }, (_, i) => i < filled);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader title="Campaign" description="The hero, stat strip and story on the home page." />

      <Panel title="Current arc">
        <FieldRow>
          <TextField label="Arc title" value={draft.arcTitle} onChange={(v) => update((c) => (c.arcTitle = v))} />
          <TextField label="Chapter label" value={draft.arcChapter} onChange={(v) => update((c) => (c.arcChapter = v))} />
        </FieldRow>
        <TextAreaField label="Arc description" rows={3} value={draft.arcBlurb} onChange={(v) => update((c) => (c.arcBlurb = v))} />
        <TextField label="Key art image URL" type="url" placeholder="https://…" value={draft.keyArtUrl} onChange={(v) => update((c) => (c.keyArtUrl = v))} />
      </Panel>

      <Panel title="Stats">
        <FieldRow>
          <NumberField label="In-game nights" value={draft.nights} min={0} max={9999} onChange={(v) => update((c) => (c.nights = v))} />
          <NumberField label="Party level" value={draft.partyLevel} min={1} max={20} onChange={(v) => update((c) => (c.partyLevel = v))} />
          <NumberField label="Progress %" value={draft.progress} min={0} max={100} onChange={(v) => update((c) => (c.progress = v))} />
        </FieldRow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, minmax(0, 1fr))', gap: 3 }}>
          {segments.map((on, i) => (
            <div key={i} style={{ height: 10, background: on ? 'var(--color-accent)' : mutedInk(14) }} />
          ))}
        </div>
      </Panel>

      <Panel title="The story so far">
        <TextAreaField
          label="Summary · blank line between paragraphs"
          rows={9}
          value={draft.summary}
          onChange={(v) => update((c) => (c.summary = v))}
        />
      </Panel>
    </div>
  );
}
