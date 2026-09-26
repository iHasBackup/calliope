import type { ChangeEvent, ReactNode } from 'react';

const mutedInk = (pct: number) => `color-mix(in srgb, var(--color-bg) ${pct}%, transparent)`;

// Ground-colored background (matches the page, not a contrasting fill),
// 1px 22% border that turns accent on focus, 16px font so iOS doesn't
// zoom on focus. Shared by every field type below.
const inputStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  background: 'var(--color-text)',
  color: 'var(--color-bg)',
  border: `1px solid ${mutedInk(22)}`,
  borderRadius: 0,
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  outline: 'none',
};

function Label({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: mutedInk(65) }}>
      {children}
    </span>
  );
}

function useFocusRing() {
  return {
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)';
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.borderColor = mutedInk(22);
    },
  };
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'password' | 'date';
}) {
  const focus = useFocusRing();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        style={{ ...inputStyle, height: 44, padding: '0 12px' }}
        {...focus}
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const focus = useFocusRing();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <Label>{label}</Label>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) ? min : Math.max(min, Math.min(max, n)));
        }}
        style={{ ...inputStyle, height: 44, padding: '0 12px' }}
        {...focus}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const focus = useFocusRing();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <Label>{label}</Label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, padding: '10px 12px', lineHeight: 1.55, resize: 'vertical' }}
        {...focus}
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const focus = useFocusRing();
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, height: 44, padding: '0 10px' }}
        {...focus}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16 }}>
      {children}
    </div>
  );
}

export function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--panel)', padding: 'clamp(16px, 3vw, 24px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {title && (
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
      )}
      {children}
    </div>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 0.95, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
          {title}
        </h2>
        <span style={{ fontSize: 14, color: mutedInk(65) }}>{description}</span>
      </div>
      {action}
    </div>
  );
}

export function OutlineAddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="admin-outline-btn"
      style={{
        boxSizing: 'border-box',
        cursor: 'pointer',
        height: 44,
        padding: '0 18px',
        display: 'inline-flex',
        alignItems: 'center',
        border: `2px solid ${mutedInk(35)}`,
        background: 'transparent',
        color: 'var(--color-bg)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export { mutedInk };
