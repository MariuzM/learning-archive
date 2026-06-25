import React from 'react'
import PropTypes from 'prop-types'
import { css } from '@emotion/core'

const splitString = css`
  cursor: pointer;
  transition: color 0.3s;
  color: white;
  text-shadow: 0 4px 6px #00000099;
  display: inline-block;
  text-shadow: 1px -1px 0 #ffffff80, 3px 1px 3px #ff00ffd9, -3px -2px 3px #0000ffd9,
    1px -2px 0 #ffffffcc;
`

const whiteSpace = css`
  margin-left: 7px;
`

export default function SplitString({ value }) {
  const toggleHover = (e) => e.target.classList.add('animated')
  const removeHover = (e) => e.target.classList.remove('animated')

  return (
    <span>
      {value.split('').map((char, id) => {
        const string = {}
        string.make = char
        string.id = id
        string.style = ''
        if (string.make === ' ') string.style = 'space'
        return (
          <span
            key={string.id}
            css={[splitString, string.style !== '' ? whiteSpace : '']}
            onMouseEnter={toggleHover}
            onAnimationEnd={removeHover}
          >
            {string.make}
          </span>
        )
      })}
    </span>
  )
}

SplitString.propTypes = {
  value: PropTypes.string.isRequired,
}
