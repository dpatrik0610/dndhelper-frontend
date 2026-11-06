import { useState, type ReactNode } from "react";

export function Toggle({ checked, onChange, disabled, children, label, tone = "gold" }: { checked: boolean; onChange: () => void; disabled?: boolean; children?: ReactNode; label?: string; tone?: "gold" | "teal" }) {
  const control = (
    <button type="button" role="switch" aria-checked={checked} aria-label={children ? undefined : label} disabled={disabled} onClick={onChange} className={`sb-switch is-${tone} ${checked ? "is-on" : ""}`}>
      <span />
    </button>
  );
  if (!children) return control;
  return (
    <label className="sb-switch-row">
      <span>{children}</span>
      {control}
    </label>
  );
}

export function ErrorLine({ error }: { error: string | null }) {
  return error ? (
    <p className="sb-error" role="alert">
      {error}
    </p>
  ) : null;
}

export function ConfirmButton({ label, confirm, onConfirm, busy }: { label: string; confirm: string; onConfirm: () => void; busy?: boolean }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className="sb-btn is-quiet is-danger" onClick={() => setAsking(true)} disabled={busy}>
        {label}
      </button>
    );
  }
  return (
    <span className="sb-confirm">
      <span>{confirm}</span>
      <button
        type="button"
        className="sb-btn is-danger-solid"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        disabled={busy}
      >
        Yes
      </button>
      <button type="button" className="sb-btn" onClick={() => setAsking(false)}>
        No
      </button>
    </span>
  );
}
