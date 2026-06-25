import React from 'react'
import { Element } from 'react-scroll'
import { css } from '@emotion/core'
import Title from '../components/Title'

const aboutMe = css`
  padding: 1rem 4%;
  text-align: center;
  color: var(--font_color);
  .about {
    h3 {
      font-weight: 400;
      margin-bottom: 2%;
    }
    .my-quote {
      font-size: 17px;
    }
    .italic {
      font-style: italic;
    }
    .normal {
      font-weight: 700;
      float: right;
    }
  }
`

export default function AboutMe() {
  return (
    <Element name="about-me">
      <Title value="About Me" />
      <div css={aboutMe}>
        <div className="about">
          <h4 className="my-quote italic txt">
            &quot;There isn&apos;t a problem without a solution, there will always be a solution,
            and I am eager to look for it&quot;
          </h4>
          <h4 className="my-quote normal txt">- Marius Mariakinas</h4>
        </div>

        {/* <p>Hello my name is Marius and I&apos;m a Front End Developer</p> */}
        {/* <h3>MY FRONT-END STACK:</h3>
        <p>React | Router | Redux | Hooks | Context API | Prop-Types </p>
        <p>TypeScript | JavaScript | CSS | SCSS | HTML </p>
        <p>Rest API | PubNub | GraphQL | Apollo </p>
        <p>Webpack | Parcel | Git | ESLint | VSCode</p> */}
      </div>
    </Element>
  )
}
