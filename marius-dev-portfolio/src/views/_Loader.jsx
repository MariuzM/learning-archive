import React from 'react'
import { css } from '@emotion/core'
import Typist from 'react-typist'

export default function Loader() {
  const background = css`
    width: 100%;
    height: 100%;
    background-color: red;
    z-index: 9999;
    position: fixed;
    overflow: hidden;
    text-align: center;
  `
  const message = css`
    color: white;
    margin: auto;
    width: 90%;
    font-size: 2rem;
    .Cursor--blinking {
      animation-name: blinker;
      animation-duration: 0.8s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      @keyframes blinker {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
    }
  `

  return (
    <div css={background}>
      <p>Loading...</p>

      <Typist
        css={message}
        cursor={{
          show: true,
          blink: true,
          hideWhenDone: false,
        }}
        startDelay={1000}
        avgTypingDelay={50}
        delayGenerator={(mean, std, { line, lineIdx, charIdx, defDelayGenerator }) => {
          if (lineIdx === 4) {
            return 10
          }
          return defDelayGenerator()
        }}
      >
        <Typist.Delay ms={500} />
        <span>{`This is you're Supreme Leader `}</span>
        <Typist.Delay ms={1000} />
        <span> ...oh s*** wait wrong page</span>
        <Typist.Backspace count={56} delay={1000} />
        <Typist.Delay ms={1100} />
        <span>{`Hi my name is Marius and I'm a `}</span>
        <br />
        <Typist.Delay ms={0} />
        <span>Front End Developer</span>
      </Typist>
    </div>
  )
}
