import styled from '@emotion/styled';
import { Divider as MDivider } from '@mantine/core';

export const Divider = () => {
  return (
    <SDiv className="divider">
      <MDivider />
    </SDiv>
  );
};

const SDiv = styled.div``;
