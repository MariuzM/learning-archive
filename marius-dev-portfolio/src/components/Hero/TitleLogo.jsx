import React from 'react'
import { css } from '@emotion/core'

const container = css`
  position: absolute;
  width: 100vw;
  top: 50%;
  text-align: center;
`

const triangle = css`
  width: 400px;
  transform: translate(0px, -50%);
  margin: auto;
  fill: white;
  svg {
    filter: drop-shadow(0px 0px 10px #b844fe);
    animation: glow 1s ease-in-out infinite alternate;
    @keyframes glow {
      from {
        filter: drop-shadow(0px 0px 1px #b844fe);
      }
      to {
        filter: drop-shadow(0px 0px 10px #c732fe);
      }
    }
  }
  @media only screen and (max-width: 600px) {
    width: 300px;
  }
`

const text = css`
  position: absolute;
  text-align: center;
  top: 20%;
  left: 12%;
  font-size: 2.5em;
  color: white;
  z-index: 2;
  h1,
  h4 {
    transform: rotate(-15deg);
    font-family: 'Lazer84', sans-serif;
  }
  h1 {
    color: white;
    text-shadow: 1px -1px 0 #ffffff80, 3px 1px 3px #ff00ffd9, -3px -2px 3px #0000ffd9,
      1px -2px 0 #ffffffcc;
  }
  h4 {
    position: relative;
    color: var(--primary-color);
    left: -1%;
  }
  h6 {
    position: relative;
    top: 50px;
    /* left: -15px; */
    letter-spacing: 3px;
    font-size: 1.4rem;
    font-family: 'Neon';
    text-transform: uppercase;
    text-shadow: -0.2rem -0.2rem 1rem #fff, 0.2rem 0.2rem 1rem #fff, 0 0 2rem var(--neon-text-color),
      0 0 2rem var(--neon-text-color);
  }

  @media only screen and (max-width: 600px) {
    font-size: 1.7em;
    left: 16%;
    h6 {
      font-size: 0.5em;
      top: 30px;
      left: -2px;
    }
  }
`

export default function TitleLogo() {
  return (
    <div css={container}>
      <div css={triangle}>
        <div css={text}>
          <h1>Marius</h1>
          <h4>.dev</h4>

          <h6>Front End Developer</h6>

          {/* <h6>Front</h6>
          <h6>End</h6>
          <h6>Developer</h6> */}
        </div>

        <svg viewBox="0 0 663.932 583.08">
          <defs>
            <linearGradient
              id="triangleGrad"
              x1="0.5"
              x2="0.5"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0" stopColor="#c502ff" />
              <stop offset="0.35" stopColor="#f879fc" />
              <stop offset="0.626" stopColor="#ad1cff" />
              <stop offset="1" stopColor="#80f" />
            </linearGradient>

            <filter
              id="Triangle"
              x="0"
              y="0"
              width="663.932"
              height="583.08"
              filterUnits="userSpaceOnUse"
            >
              <feOffset dy="5" input="SourceAlpha" />
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feFlood floodColor="#8000ff" />
              <feComposite operator="in" in2="blur" />
              <feComposite in="SourceGraphic" />
            </filter>
          </defs>

          <g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Triangle)">
            <path
              id="Triangle-2"
              data-name="Triangle"
              d="M452.931,784.58h0L151,261.54l603.931-.04-302,523.079Zm277.13-510.642-554.436.037L452.812,754.148l277.25-480.21Z"
              transform="translate(-121 -236.5)"
              fill="url(#triangleGrad)"
            />
          </g>
        </svg>
      </div>
    </div>
  )
}
