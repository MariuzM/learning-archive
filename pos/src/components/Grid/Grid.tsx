import styled from '@emotion/styled';

import { CardBox } from '../*Cards/CardBox';
import type { TypeProduct } from '../../types/typesServerDataTypes';

export const Grid = (p: { items: TypeProduct[] }) => {
  return (
    <SDiv className="grid">
      {p.items.map((p) => {
        return <CardBox key={p.id} {...p} />;
      })}
    </SDiv>
  );
};

const SDiv = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  margin: 0 12px;
`;
