import styled from '@emotion/styled';

export const IconClock = (p: { size?: number }) => {
  return (
    <SDiv>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={p.size ? p.size : '24'}
        height={p.size ? p.size : '24'}
        viewBox="0 0 24 24"
        strokeWidth="1.25"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <circle cx="12" cy="12" r="9"></circle>
        <polyline points="12 7 12 12 15 15"></polyline>
      </svg>
    </SDiv>
  );
};

const SDiv = styled.div``;
