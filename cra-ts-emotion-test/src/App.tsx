// /** @jsx jsx */
// import { Fragment } from 'react'
// import { css, jsx } from '@emotion/core'
import * as React from 'react'
import { css } from '@emotion/core'

const myTest = css`
  background-color: red;
  width: 400px;
  height: 400px;
  font-size: 10px;
`

function App(): JSX.Element {
  return (
    <>
      <div css={myTest}>Testing Emotion</div>

      {/* <div>
        <>Fragment not working</>
      </div> */}
    </>
  )
}

export default App
