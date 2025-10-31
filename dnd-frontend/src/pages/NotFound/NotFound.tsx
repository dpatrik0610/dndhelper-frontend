import { Button, Container, Group, Text, Title, rem } from "@mantine/core";
import { createStyles, keyframes } from "@mantine/styles";
import { useNavigate } from "react-router-dom";

// 🌀 Animations
const float = keyframes({
  "0%": { transform: "translateY(0px)" },
  "50%": { transform: "translateY(-10px)" },
  "100%": { transform: "translateY(0px)" },
});

const gradientShift = keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "50%": { backgroundPosition: "100% 50%" },
  "100%": { backgroundPosition: "0% 50%" },
});

// 🪄 Wand movement
const wandArc = keyframes({
  "0%": { transform: "translate(-50%, -50%) rotate(-20deg)" },
  "50%": { transform: "translate(-30%, -70%) rotate(15deg)" },
  "100%": { transform: "translate(-50%, -50%) rotate(-20deg)" },
});

// ✨ Sparkle pulse
const sparklePulse = keyframes({
  "0%, 100%": { opacity: 0, transform: "scale(0.5)" },
  "50%": { opacity: 1, transform: "scale(1.2)" },
});

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    background: "transparent",
    backgroundSize: "400% 400%",
    animation: `${gradientShift} 15s ease infinite`,
    color: theme.white,
    overflow: "hidden",
  },

  label: {
    position: "relative",
    fontWeight: 800,
    fontSize: rem(120),
    lineHeight: 1,
    color: theme.fn.primaryColor(),
    textShadow: "0 0 25px rgba(255, 255, 255, 0.3)",
    marginBottom: theme.spacing.xl,
    animation: `${float} 4s ease-in-out infinite`,

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(80),
    },
  },

  wand: {
    position: "absolute",
    fontSize: rem(40),
    transformOrigin: "center",
    animation: `${wandArc} 4s ease-in-out infinite`,
    filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))",
    zIndex: 2,
  },

  sparkle: {
    position: "absolute",
    top: "42%",
    left: "50%",
    width: rem(10),
    height: rem(10),
    borderRadius: "50%",
    background: "radial-gradient(circle, white, transparent)",
    animation: `${sparklePulse} 1.5s ease-in-out infinite`,
    zIndex: 1,
  },

  title: {
    fontFamily: `'Outfit', ${theme.fontFamily}`,
    fontWeight: 600,
    fontSize: rem(36),
    marginBottom: theme.spacing.md,
    color: theme.white,
    textShadow: "0 0 15px rgba(0, 0, 0, 0.5)",
  },

  description: {
    maxWidth: rem(480),
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: rem(18),
  },

  button: {
    marginTop: rem(40),
    border: `1px solid ${theme.fn.primaryColor()}`,
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(6px)",
    transition: "all 0.2s ease",
    "&:hover": {
      background: theme.fn.primaryColor(),
      color: theme.white,
      transform: "scale(1.05)",
    },
  },
}));

export default function NotFound() {
  const { classes } = useStyles();
  const navigate = useNavigate();

  return (
    <Container fluid className={classes.root}>
      <div className={classes.label}>
        404
      </div>

      <Title className={classes.title}>You have found a secret place.</Title>

      <Text className={classes.description}>
        The winds whisper your mistake... this page is lost to the void of the internet.
        Perhaps retrace your steps, adventurer?
      </Text>
      <span className={classes.wand}>🪄</span>
      <span className={classes.sparkle}></span>
      <Group justify="center">
        <Button
          size="md"
          className={classes.button}
          onClick={() => navigate("/home")}
        >
          🏰 Return to Safety
        </Button>
      </Group>
    </Container>
  );
}
