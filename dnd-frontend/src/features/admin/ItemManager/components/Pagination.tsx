
import React from 'react';
import { Pagination as MantinePagination, Group } from '@mantine/core';
import GlassyBox from './GlassyBox';

interface PaginationProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, total, onChange }) => {
  return (
    <GlassyBox>
      <Group justify="center">
        <MantinePagination value={page} total={total} onChange={onChange} />
      </Group>
    </GlassyBox>
  );
};

export default Pagination;
