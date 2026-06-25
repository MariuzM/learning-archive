import styled from '@emotion/styled';

import { ContentLeft } from '../**Content/ContentLeft';
import { ContentRight } from '../**Content/ContentRight';

export const Content = () => {
  return (
    <SDiv className="content flex-row flex-grow w-full h-full overflow-y-hidden">
      <ContentLeft />
      <ContentRight />
    </SDiv>
  );
};

const SDiv = styled.div``;
