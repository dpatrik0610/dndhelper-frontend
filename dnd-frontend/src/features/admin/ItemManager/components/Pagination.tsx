import React from "react";
import { Pagination as MantinePagination, Group } from "@mantine/core";
import GlassyBox from "./GlassyBox";
import styles from "@features/admin/ItemManager/ItemManager.module.css";

interface PaginationProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, total, onChange }) => {
  return (
    <GlassyBox className={styles.glassyBox}>
      <Group justify="center">
        <MantinePagination
          value={page}
          onChange={onChange}
          total={total}
          radius="md"
          size="sm"
          styles={{
            control: {
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(255, 255, 255, 0.75)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "rgba(0, 255, 255, 0.1)",
                borderColor: "rgba(0, 255, 255, 0.3)",
                color: "#00ffff",
                transform: "translateY(-1px)",
              },
              "&[data-active]": {
                background: "rgba(168, 85, 247, 0.3) !important",
                borderColor: "rgba(168, 85, 247, 0.6) !important",
                color: "#e9d5ff !important",
                boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)",
              },
            },
          }}
        />
      </Group>
    </GlassyBox>
  );
};

export default Pagination;
