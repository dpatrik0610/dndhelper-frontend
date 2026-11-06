import classes from "@features/chronicle/Chronicle.module.css";

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  data: { value: T; label: string }[];
  onChange: (value: T) => void;
  fullWidth?: boolean;
}

export function Segmented<T extends string>({
  label,
  value,
  data,
  onChange,
  fullWidth,
}: SegmentedProps<T>) {
  return (
    <div
      className={classes.seg}
      role="group"
      aria-label={label}
      data-full={fullWidth || undefined}
    >
      {data.map((d) => (
        <button
          key={d.value}
          type="button"
          className={classes.segButton}
          aria-pressed={d.value === value}
          onClick={() => onChange(d.value)}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
