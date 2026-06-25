import styled from '@emotion/styled';

export const IconMenu = (p: { size?: number }) => {
  return (
    <SDiv>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={p.size ? p.size : '24'}
        height={p.size ? p.size : '24'}
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
      </svg>
    </SDiv>
  );
};

const SDiv = styled.div``;
