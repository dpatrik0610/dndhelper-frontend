import { useState, type MouseEvent, type ReactNode } from "react";
import { ActionIcon, Button, Collapse, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconPlus } from "@tabler/icons-react";
import s from "@styles/CharacterForm.module.css";

/**
 * Shared list pieces for every Edit Character tab, so languages, spells, features
 * and resources all read as the same kind of list.
 */

/** Input + Add button. Enter in a plain input adds the item instead of submitting the character form. */
export function ListAddBar({ onAdd, disabled, children }: { onAdd: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <div
      className={s.addBar}
      onKeyDown={(e) => {
        // Comboboxes preventDefault when Enter picks an option; let them have it.
        if (e.key !== "Enter" || e.defaultPrevented || !(e.target instanceof HTMLInputElement)) return;
        e.preventDefault();
        if (!disabled) onAdd();
      }}
    >
      {children}
      <Button className="glass-btn-primary" leftSection={<IconPlus size={14} />} onClick={onAdd} disabled={disabled}>
        Add
      </Button>
    </div>
  );
}

/** Grid wrapper; `cols={2}` pairs short rows on wider screens. */
export function List({ cols = 1, children }: { cols?: 1 | 2; children: ReactNode }) {
  return <div className={s.list} data-cols={cols}>{children}</div>;
}

export function ListEmpty({ children }: { children: ReactNode }) {
  return <div className={s.empty}>{children}</div>;
}

interface ListRowProps {
  title: ReactNode;
  /** Inline controls between title and actions (e.g. a "Prepared" toggle). */
  meta?: ReactNode;
  actions?: ReactNode;
  active?: boolean;
  /** Optional details; makes the title a disclosure toggle. */
  children?: ReactNode;
}

export function ListRow({ title, meta, actions, active, children }: ListRowProps) {
  const [open, setOpen] = useState(false);
  const text = typeof title === "string" ? <span className={s.truncate}>{title}</span> : title;

  return (
    <div className={s.row} data-active={active || undefined}>
      <div className={s.rowHead}>
        {children ? (
          <UnstyledButton className={s.rowTitle} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            <IconChevronDown size={14} className={s.chevron} data-open={open || undefined} />
            {text}
          </UnstyledButton>
        ) : (
          <div className={s.rowTitle}>{text}</div>
        )}
        {meta}
        {actions && <div className={s.rowActions}>{actions}</div>}
      </div>
      {children && (
        <Collapse in={open}>
          <div className={s.rowBody}>{children}</div>
        </Collapse>
      )}
    </div>
  );
}

interface RowActionProps {
  label: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  danger?: boolean;
  children: ReactNode;
}

export function RowAction({ label, onClick, danger, children }: RowActionProps) {
  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      className={s.action}
      data-danger={danger || undefined}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </ActionIcon>
  );
}
