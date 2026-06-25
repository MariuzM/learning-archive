import React from 'react'
import { css } from '@emotion/core'

const ribbon = css`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  .corner-ribbon {
    width: 150px;
    background: #e43;
    font-size: 0.9rem;
    text-align: center;
    line-height: 20px;
    padding: 5px 0px;
    letter-spacing: 1px;
    color: #f0f0f0;
  }
  .purple {
    background: #95b;
  }
`

export default function CornerRibbon() {
  return (
    <div css={ribbon}>
      <div className="corner-ribbon purple">
        <div>Under</div>
        <div>Development</div>
      </div>
    </div>
  )
}
