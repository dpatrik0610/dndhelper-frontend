
import React from 'react';
import { Box, type BoxProps } from '@mantine/core';
import styles from '../ItemManager.module.css';

interface GlassyBoxProps extends BoxProps {
  children: React.ReactNode;
}

const GlassyBox: React.FC<GlassyBoxProps> = ({ children, ...props }) => {
  return (
    <Box className={styles.glassyBox} {...props}>
      {children}
    </Box>
  );
};

export default GlassyBox;
