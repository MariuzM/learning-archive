import React from 'react'
import { css } from '@emotion/core'

const rountButton = css`
  position: relative;
  width: 60px;
  height: 60px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-color: var(--white);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 4px #00000040;
  cursor: pointer;
`

export default function RoundButton({ buttonType }: { buttonType: JSX.Element }): JSX.Element {
  return <div css={rountButton}>{buttonType}</div>
}
