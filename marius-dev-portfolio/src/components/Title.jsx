import React from 'react'
import PropTypes from 'prop-types'
import { css } from '@emotion/core'
import { color } from '../styles/_main.css'

const glitchWrapper = css`
  text-align: center;

  .glitch {
    color: white;
    font-size: 2.5rem;
    font-style: italic;
    /* text-transform: upercase; */
    font-family: 'Archivo Black', sans-serif;
    position: relative;
    display: inline-block;
  }
  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--background_color);
  }

  .glitch::after {
    left: -2px;
    text-shadow: 2px 0 #b300fc;
    clip: rect(85px, 550px, 140px, 0);
    animation: glitch-anim 2.5s infinite linear alternate-reverse;
  }

  .glitch::before {
    left: -1px;
    text-shadow: 2px 0 #49fc00;
    clip: rect(24px, 550px, 90px, 0);
    animation: glitch-anim-2 3s infinite linear alternate-reverse;
  }

  @keyframes glitch-anim {
    0% {
      clip: rect(109px, 9999px, 27px, 0);
    }
    4% {
      clip: rect(144px, 9999px, 60px, 0);
    }
    8% {
      clip: rect(18px, 9999px, 78px, 0);
    }
    12% {
      clip: rect(19px, 9999px, 17px, 0);
    }
    16% {
      clip: rect(51px, 9999px, 118px, 0);
    }
    20% {
      clip: rect(21px, 9999px, 85px, 0);
    }
    25% {
      clip: rect(62px, 9999px, 12px, 0);
    }
    29% {
      clip: rect(130px, 9999px, 25px, 0);
    }
    33% {
      clip: rect(60px, 9999px, 83px, 0);
    }
    37% {
      clip: rect(144px, 9999px, 33px, 0);
    }
    41% {
      clip: rect(27px, 9999px, 14px, 0);
    }
    45% {
      clip: rect(85px, 9999px, 115px, 0);
    }
    50% {
      clip: rect(3px, 9999px, 2px, 0);
    }
    54% {
      clip: rect(72px, 9999px, 40px, 0);
    }
    58% {
      clip: rect(8px, 9999px, 14px, 0);
    }
    62% {
      clip: rect(29px, 9999px, 3px, 0);
    }
    66% {
      clip: rect(67px, 9999px, 63px, 0);
    }
    70% {
      clip: rect(109px, 9999px, 135px, 0);
    }
    75% {
      clip: rect(99px, 9999px, 98px, 0);
    }
    79% {
      clip: rect(26px, 9999px, 140px, 0);
    }
    83% {
      clip: rect(2px, 9999px, 87px, 0);
    }
    87% {
      clip: rect(35px, 9999px, 148px, 0);
    }
    91% {
      clip: rect(41px, 9999px, 137px, 0);
    }
    95% {
      clip: rect(100px, 9999px, 102px, 0);
    }
    100% {
      clip: rect(111px, 9999px, 54px, 0);
    }
  }
  @keyframes glitch-anim-2 {
    6% {
      clip: rect(30px, 9999px, 71px, 0);
    }
    10% {
      clip: rect(79px, 9999px, 53px, 0);
    }
    13% {
      clip: rect(96px, 9999px, 55px, 0);
    }
    16% {
      clip: rect(91px, 9999px, 132px, 0);
    }
    20% {
      clip: rect(59px, 9999px, 146px, 0);
    }
    23% {
      clip: rect(131px, 9999px, 103px, 0);
    }
    26% {
      clip: rect(134px, 9999px, 30px, 0);
    }
    30% {
      clip: rect(68px, 9999px, 120px, 0);
    }
    33% {
      clip: rect(106px, 9999px, 34px, 0);
    }
    36% {
      clip: rect(117px, 9999px, 15px, 0);
    }
    40% {
      clip: rect(82px, 9999px, 109px, 0);
    }
    43% {
      clip: rect(2px, 9999px, 23px, 0);
    }
    46% {
      clip: rect(34px, 9999px, 87px, 0);
    }
    50% {
      clip: rect(109px, 9999px, 107px, 0);
    }
    53% {
      clip: rect(79px, 9999px, 81px, 0);
    }
    56% {
      clip: rect(77px, 9999px, 79px, 0);
    }
    60% {
      clip: rect(79px, 9999px, 135px, 0);
    }
    63% {
      clip: rect(143px, 9999px, 21px, 0);
    }
    66% {
      clip: rect(111px, 9999px, 101px, 0);
    }
    70% {
      clip: rect(17px, 9999px, 136px, 0);
    }
    73% {
      clip: rect(2px, 9999px, 118px, 0);
    }
    76% {
      clip: rect(50px, 9999px, 35px, 0);
    }
    80% {
      clip: rect(43px, 9999px, 45px, 0);
    }
    83% {
      clip: rect(73px, 9999px, 150px, 0);
    }
    86% {
      clip: rect(141px, 9999px, 103px, 0);
    }
    90% {
      clip: rect(17px, 9999px, 135px, 0);
    }
    93% {
      clip: rect(101px, 9999px, 27px, 0);
    }
    96% {
      clip: rect(105px, 9999px, 121px, 0);
    }
    100% {
      clip: rect(15px, 9999px, 125px, 0);
    }
  }
`

const titleCss = css`
  padding: 1em 0 0 0;
  @media only screen and (max-width: 600px) {
    .glitch {
      font-size: 2.5em;
    }
  }
`

export default function Title({ value, animeLoad }) {
  return (
    <div css={[glitchWrapper, titleCss]} className={animeLoad} style={{ color }}>
      <div className="glitch" data-text={value}>
        {value}
      </div>
    </div>
  )
}

Title.propTypes = {
  value: PropTypes.string.isRequired,
  animeLoad: PropTypes.string,
}

Title.defaultProps = {
  animeLoad: '',
}
