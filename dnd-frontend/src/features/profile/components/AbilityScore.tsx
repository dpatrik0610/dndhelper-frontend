import { Text } from "@mantine/core";
import { StatBox } from "./StatBox";
import CustomBadge from "@components/common/CustomBadge";

export function AbilityScore({ name, score }: { name: string; score: number }) {
  const modifier = Math.floor((score - 10) / 2);
  const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;  
  return (
    
    <StatBox label={name} value="" size="sm" color="yellow">
      <div
        style={{
          position: "relative",
          width: 60,
          height: 60,
          clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          background: "var(--theme-gradient-primary, linear-gradient(145deg, #ffd43b, #f59f00))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          color: "#121214",
          fontSize: "1.25rem",
          margin: "auto",
          boxShadow: "var(--theme-glow-shadow-primary, 0 0 10px rgba(255, 215, 0, 0.5)), inset 0 0 6px rgba(255, 255, 255, 0.25)",
          transition: "transform 150ms ease, box-shadow 200ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
      >
        {score}
      </div>

      <CustomBadge
        label={modifierStr}
        variant="themed"
        mt="xs"
        style={{
          fontSize: "12px",
          padding: "2px 8px",
          height: "auto",
        }}
      />
    </StatBox>
  );
}
