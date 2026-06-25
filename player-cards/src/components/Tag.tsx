import React from 'react'
import { css } from '@emotion/core'
import { colorPickerSecondary } from '../utils/ColorPicker'

const tag = css`
  padding: 6px 12px;
  float: left;
  margin: 0 5px 0 0;
  border-radius: 1000px;
  text-align: center;
  div {
    position: relative;
    text-align: center;
    font-style: normal;
    font-weight: bold;
    font-size: 10px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
`

export default function Tag({ contentType }: { contentType: string[] }): JSX.Element {
  return (
    <>
      {contentType.map((el, index) => (
        <div css={tag} key={index} style={colorPickerSecondary(el)}>
          <div>{el}</div>
        </div>
      ))}
    </>
  )
}
