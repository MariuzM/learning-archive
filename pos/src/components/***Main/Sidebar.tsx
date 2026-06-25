import styled from '@emotion/styled';

import { Receipt } from '../**Receipt/Receipt';

export const Sidebar = () => {
  return (
    <SDiv className="sidebar">
      <Receipt />
    </SDiv>
  );
};

const SDiv = styled.div`
  height: inherit;

  .divider {
    margin: 0 -15px;
  }
`;
