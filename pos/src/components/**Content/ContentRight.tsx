import styled from '@emotion/styled';

import { CardItemDetailed } from '../*Cards/CardItemDetailed';
import { useStoreUI } from '../../states/useStoreUI';

export const ContentRight = () => {
  const itemSelected = useStoreUI((s) => s.itemSelected);

  if (!itemSelected) {
    return null;
  }

  return (
    <SDiv className="content-right">
      <CardItemDetailed itemSelected={itemSelected} />
    </SDiv>
  );
};

const SDiv = styled.div`
  /* display: block; */
  height: 100%;
`;
