import styled from '@emotion/styled';
import { Text } from '@mantine/core';

export const Price = (p: { price: number | null }) => {
  return (
    <SDiv>
      <Text>
        {p.price ? (
          <>
            <span>$</span>
            <span className="price">{p.price?.toFixed(2)}</span>
          </>
        ) : (
          '-'
        )}
      </Text>
    </SDiv>
  );
};

const SDiv = styled.div``;
