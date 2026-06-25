import React, { useEffect, useState } from 'react'
import { Element } from 'react-scroll'
import { css } from '@emotion/core'
import TitleLogo from '../components/Hero/TitleLogo'
import CornerRibbon from '../components/CornerRibbon'

const SvgColorBackground = () => {
  const svg = css`
    position: absolute;
    width: 100vw;
    /* height: 100%; */
    bottom: -10px;

    @media only screen and (max-width: 600px) {
      bottom: 50px;
      /* transform: translateY(-400px); */
    }
  `
  return (
    <div css={svg}>
      <svg viewBox="0 0 1920 1062">
        <defs>
          <linearGradient
            id="linear-gradient"
            x1="0.514"
            y1="-0.051"
            x2="0.512"
            y2="0.782"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0" stopOpacity="0" />
            <stop offset="0" stopColor="#10041b" stopOpacity="0.169" />
            <stop offset="1" stopColor="#5f159f" />
          </linearGradient>
        </defs>
        <path id="Glow" d="M0,0H1920V1062H0Z" fill="url(#linear-gradient)" />
      </svg>
    </div>
  )
}

const SvgBackgroundLayer1 = ({ bgState }) => {
  const svg = css`
    position: absolute;
    width: 100vw;
    bottom: 0px;
    transform: translate(0, ${bgState}px);
    transition: transform 1.3s -400ms ease-in-out;
  `
  return (
    <div css={svg}>
      <svg viewBox="0 0 1920 245.417">
        <path
          id="Mountains2"
          d="M1844.21,386.2l-54.877,31.22-54.878,18.667L1681.864,386.2l-43.3,7.578L1580.9,372.664l-75.1,51.546L1437.886,334.1l-103.8,29.02-140.707-36.733-90.015,36.733-95.106-81.634-231.622,44.9-107.288-44.9-81.473,112.3L510.924,386.2,457.3,352.156,382.378,386.2l-72.453,7.578L240.513,334.1l-49.24,116.91-58.534-78.344L75.755,417.422,44.672,372.664-12.713,334.1-75.79,405.445V526.9h1920Z"
          transform="translate(75.79 -281.483)"
          opacity="0.313"
        />
      </svg>
    </div>
  )
}

const SvgBackgroundLayer2 = () => {
  const svg = css`
    /* @media only screen and (max-width: 600px) {
      bottom: -200px;
    } */
    #Mountains1 {
      fill: var(--background_color);
    }
  `
  return (
    <div css={svg}>
      <svg viewBox="0 0 1920 298.646">
        <path
          id="Mountains1"
          d="M-72.363,318.918l60.686-24.489L90.964,324.6,169.3,300.759l52.02,18.159,66.034-38.058,46.712,38.058,52.044-24.489,92.916,6.33,99.4-50.431,154.4,14.816L888.3,141.565,1029.73,250.328l91.069-7.305,77.791,51.407,72.613-44.1,65.681,57.454,54.455-13.353,68.713,24.489,66.986-24.489,45.378,24.489,58.343-11.136,43.217,22.24,47.539-11.1,67.256,52.223,58.866-70.382V440.211h-1920Z"
          transform="translate(72.363 -141.565)"
        />
      </svg>
    </div>
  )
}

const SvgBackgroundLayerGrid = () => {
  const tronGrid = css`
    background-color: var(--background_color);
    position: absolute;
    bottom: -120px;
    width: 100vw;
    height: 300px;
    overflow: hidden;
    perspective: 450px;
    .grid-lines {
      width: 100%;
      height: 200%;
      background-image: linear-gradient(to right, #0ce0fc8f 1px, transparent 0),
        linear-gradient(to bottom, #0ce0fc8f 1px, transparent 0);
      background-size: 45px 30px;
      background-repeat: repeat;
      background-position: center;
      transform-origin: 100% 0 0;
      animation: play 5s linear infinite;
    }
    @keyframes play {
      0% {
        transform: rotateX(45deg) translateY(-50%);
      }
      100% {
        transform: rotateX(45deg) translateY(0);
      }
    }
  `
  const layerOnGrid = css`
    position: absolute;
    bottom: 0;
    width: 100vw;
    height: 180px;
    background-color: 00000000;
    background: radial-gradient(ellipse at 50% 70%, #00000000 0%, var(--background_color) 70%);
  `
  return (
    <>
      <div css={tronGrid}>
        <div className="grid-lines" />
      </div>
      <div css={layerOnGrid} />
    </>
  )
}

export default function Title() {
  const [stateBgLayer1, setStateBgLayer1] = useState(0)
  const [stateBgLayer2, setStateBgLayer2] = useState(0)

  const handleScroll = (e) => {
    if (e.target.scrollingElement.scrollTop <= 700) {
      setStateBgLayer1(e.target.scrollingElement.scrollTop / 2.5)
    }
    if (
      e.target.scrollingElement.scrollTop <=
      (window.matchMedia('(max-width: 600px)').matches ? 370 : 500)
    ) {
      setStateBgLayer2(e.target.scrollingElement.scrollTop / 3)
    }
  }

  useEffect(() => {
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  const layer = css`
    position: absolute;
    width: 100vw;
    bottom: 150px;
  `

  const moveBox = css`
    position: absolute;
    bottom: 0;
    transition: transform 1s -500ms ease-in-out;
    transform: translate(0, ${stateBgLayer2}px);
  `

  return (
    <Element className="main-title" name="main">
      <CornerRibbon />

      <div
        css={css`
          width: 100vw;
          height: 100vh;
          background: rgb(0, 0, 0);
        `}
      >
        <SvgColorBackground />

        <div css={layer}>
          <SvgBackgroundLayer1 bgState={stateBgLayer1} />
        </div>

        <div css={moveBox}>
          <SvgBackgroundLayerGrid />
          <div css={layer}>
            <SvgBackgroundLayer2 />
          </div>
        </div>
      </div>

      <TitleLogo />
    </Element>
  )
}
