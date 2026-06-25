import { css } from '@emotion/react';

import { theme } from './theme.style';

const fonts = css`
  @font-face {
    font-family: 'Montserrat';
    src: url('../fonts/Montserrat.ttf');
    font-display: swap;
  }
`;

const global = css`
  :root {
    --background_color: ${theme.customPalette.background.main};
  }

  /* * {
    -webkit-tap-highlight-color: transparent;
  }

  * > button:focus {
    box-shadow: 'none';
  } */

  html,
  body {
    background-color: var(--background_color);
    width: 100%;

    #__next {
      width: 100%;
    }
  }

  .border-radius {
    border-radius: 4px;
  }

  .justify-center {
    display: flex;
    justify-content: center;
  }
`;

export const globalStyles = css`
  ${fonts}
  ${global}
`;
