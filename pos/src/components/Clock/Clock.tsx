import styled from '@emotion/styled';

import { useClock } from '../../utils/timer';
import { IconClock } from '../Icons/IconClock';

export const Clock = () => {
  const clock = useClock();

  return (
    <SDiv className="clock flex-row items-center gap-2">
      <IconClock />
      <div>
        <div className="time">{clock?.time}</div>
        <div className="date">{clock?.date}</div>
      </div>
    </SDiv>
  );
};

const SDiv = styled.div`
  width: 105px;

  .time {
    font-size: large;
  }

  .date {
    color: var(--grey-darker1);
    font-size: small;
  }
`;
