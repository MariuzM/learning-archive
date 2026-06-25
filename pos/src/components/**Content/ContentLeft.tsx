import { useEffect, useState } from 'react';

import styled from '@emotion/styled';

import { API_GET_Product } from '../../services/api-rest/product';
import type { TypeProduct } from '../../types/typesServerDataTypes';
import { Grid } from '../Grid/Grid';

export const ContentLeft = () => {
  const [items, itemsSet] = useState<TypeProduct[]>([]);

  const getItems = async () => {
    const isData = await API_GET_Product();
    itemsSet(isData);
  };

  useEffect(() => {
    getItems();
  }, []);

  return (
    <SDiv className="content-left w-full h-full overflow-y-scroll">
      <div className="content__items">
        <Grid items={items} />
      </div>
    </SDiv>
  );
};

const SDiv = styled.div`
  .content__items {
    /* @-moz-document url-prefix() {
      margin-right: 5px;
    } */
  }

  /* height: fit-content; */
`;
