import { Box } from "@mantine/core";
import { useAdminDashboardStore } from "@store/useAdminDashboardStore";

export const BackToDashboardButton: React.FC = () => {
  const resetSection = useAdminDashboardStore((state) => state.resetSection);

  return (
    <Box
      onClick={resetSection}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: "linear-gradient(135deg, #ff8a00, #e52e71)",
        padding: "0.75rem 1rem",
        borderRadius: "9999px",
        color: "white",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        transition: "transform 0.2s ease, box-shadow 0.3s ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 0 12px rgba(255,255,255,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
      }}
    >
      ⬅ Back to Dashboard
    </Box>
  );
};
