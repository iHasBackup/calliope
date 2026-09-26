import type { Content } from '../../content';
import { OutlineAddButton, SectionHeader, mutedInk } from '../fields';

export function QuestsSection({
  draft,
  update,
  addThread,
  removeThread,
}: {
  draft: Content;
  update: (fn: (c: Content) => void) => void;
  addThread: () => void;
  removeThread: (i: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader title="Quest log" description="Open threads shown beside the story." action={<OutlineAddButton label="+ Add thread" onClick={addThread} />} />
      <div style={{ background: 'var(--panel)', padding: 'clamp(16px, 3vw, 24px)', display: 'flex', flexDirection: 'column', gap: 12, borderTop: '3px solid var(--color-accent)' }}>
        {draft.threads.map((text, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '18px minmax(0, 1fr) 44px', gap: 10, alignItems: 'start' }}>
            <span className="campaign-diamond" style={{ marginTop: 17 }} />
            <textarea
              rows={2}
              value={text}
              onChange={(e) => update((c) => (c.threads[i] = e.target.value))}
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '10px 12px',
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                border: `1px solid ${mutedInk(22)}`,
                borderRadius: 0,
                fontFamily: 'var(--font-body)',
                fontSize: 16,
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <button
              type="button"
              aria-label="Remove thread"
              className="admin-remove-btn"
              style={{
                boxSizing: 'border-box',
                cursor: 'pointer',
                width: 44,
                height: 44,
                display: 'grid',
                placeItems: 'center',
                border: `1px solid ${mutedInk(22)}`,
                background: 'transparent',
                color: 'var(--color-bg)',
                fontSize: 18,
              }}
              onClick={() => removeThread(i)}
            >
              &times;
            </button>
          </div>
        ))}
        {draft.threads.length === 0 && (
          <span style={{ fontSize: 14, color: mutedInk(60) }}>No open threads. The quest log is hidden on the site until you add one.</span>
        )}
      </div>
    </div>
  );
}
