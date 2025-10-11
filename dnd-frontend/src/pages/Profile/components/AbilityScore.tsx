import { Badge, Text } from "@mantine/core";
import { StatBox } from "./StatBox";

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
          background: "linear-gradient(145deg, #ffd43b, #f59f00)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          color: "black",
          fontSize: "1.2rem",
          margin: "auto",
          boxShadow: "0 0 10px rgba(255, 215, 0, 0.5), inset 0 0 6px rgba(255, 255, 255, 0.2)",
          transition: "transform 150ms ease, box-shadow 200ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}

      >
        {score}
      </div>

      <Text
        mt="xs"
        size="xs"
        fw={700}
        style={{
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: "6px",
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 0 6px rgba(255, 255, 255, 0.1)",
        }}
      >
        {modifierStr}
      </Text>
    </StatBox>
  );
}
