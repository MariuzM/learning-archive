import React from 'react'
import { css } from '@emotion/core'
import Hero from './1_Hero'
import AboutMe from './2_AboutMe'
import Projects from './3_Projects'
import ContactMe from './4_ContactMe'

const mainPage = css`
  width: 100vw;
  overflow-x: hidden;
  overflow-y: scroll;
`
const content = css`
  position: relative;
  background-color: var(--background_color);
  padding: 0 7%;
  z-index: 10;
  @media only screen and (max-width: 700px) {
    padding: 0;
  }
`

export default function MainPage() {
  return (
    <div css={mainPage}>
      <Hero />
      <div css={content}>
        <AboutMe />
        <Projects />
        <ContactMe />
      </div>
    </div>
  )
}
