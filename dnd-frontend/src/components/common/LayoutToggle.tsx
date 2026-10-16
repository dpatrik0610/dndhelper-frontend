import { Tooltip } from "@mantine/core";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import classes from "./LayoutToggle.module.css";

const OPTIONS = [
  { value: "list", label: "Rows", Icon: IconLayoutList },
  { value: "cards", label: "Boxes", Icon: IconLayoutGrid },
] as const;

interface LayoutToggleProps {
  value: "list" | "cards";
  onChange: (value: "list" | "cards") => void;
  className?: string;
}

export function LayoutToggle({ value, onChange, className }: LayoutToggleProps) {
  return (
    <div className={`${classes.view} ${className ?? ""}`} role="group" aria-label="Layout">
      {OPTIONS.map(({ value: option, label, Icon }) => (
        <Tooltip key={option} label={label}>
          <button
            type="button"
            className={classes.viewButton}
            aria-label={label}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            <Icon size={17} stroke={1.75} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
