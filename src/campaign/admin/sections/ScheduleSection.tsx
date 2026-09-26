import type { Content } from '../../content';
import { nextSession } from '../../time';
import { FieldRow, Panel, SectionHeader, SelectField, TextField, mutedInk } from '../fields';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hourLabel = (h: number) => `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`;

export function ScheduleSection({ draft, update }: { draft: Content; update: (fn: (c: Content) => void) => void }) {
  let preview = '';
  try {
    const s = nextSession(new Date(), draft.schedule.weekday, draft.schedule.hour, draft.schedule.timezone);
    preview = `${s.dateLabel} · ${s.timeLabel}${draft.schedule.label ? ` ${draft.schedule.label}` : ''}`;
  } catch {
    preview = 'Invalid timezone';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader title="Schedule" description="Drives the next-session countdown." />
      <Panel>
        <FieldRow>
          <SelectField
            label="Day"
            value={String(draft.schedule.weekday)}
            options={DAYS.map((d, i) => ({ value: String(i), label: d }))}
            onChange={(v) => update((c) => (c.schedule.weekday = Number(v)))}
          />
          <SelectField
            label="Start time"
            value={String(draft.schedule.hour)}
            options={Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: hourLabel(h) }))}
            onChange={(v) => update((c) => (c.schedule.hour = Number(v)))}
          />
          <TextField label="Timezone label" placeholder="GMT+7" value={draft.schedule.label} onChange={(v) => update((c) => (c.schedule.label = v))} />
        </FieldRow>
        <TextField
          label="IANA timezone · drives the actual countdown math"
          placeholder="Asia/Jakarta"
          value={draft.schedule.timezone}
          onChange={(v) => update((c) => (c.schedule.timezone = v))}
        />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', paddingTop: 14, borderTop: `1px solid ${mutedInk(14)}` }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent-400)' }}>
            Next session
          </span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20 }}>{preview}</span>
        </div>
      </Panel>
    </div>
  );
}
