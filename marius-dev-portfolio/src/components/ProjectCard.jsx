import React from 'react'
import PropTypes from 'prop-types'
import { css } from '@emotion/core'

const cardHeaderIcon = css`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  .card {
    flex-grow: 1;
    margin: 1rem;
    height: 250px;
    min-width: 350px;
    max-width: 500px;
    cursor: pointer;
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: 0 0.25rem 0.25rem #00000033, 0 0 1rem #00000033;
    transition: box-shadow 1s cubic-bezier(0.25, 0.8, 0.25, 1);
    /* :hover {
      box-shadow: 0 14px 28px #00000040, 0 10px 10px #00000038;
    } */
    &-img {
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      height: 100%;
      box-shadow: 0 -2px 20px -2px #000000;
    }
    &-icon {
      position: relative;
      right: 20px;
      top: -25px;
      opacity: 0;
      float: right;
      margin-top: -1.1em;
      transform: translateX(-50%);
      width: 2em;
      transition: all 0.3s ease-in-out;
      fill: var(--font_color);
    }
    :hover .card-icon {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .card__description {
    width: 500px;
    color: var(--font_color);
    /* top: 8px; */
    padding: 0px 10px;
    text-align: left;
    &-title {
      font-size: 2.5rem;
      /* font-family: 'Hacked-KerX', sans-serif; */
      margin-left: -1px;
    }
    &-description {
      padding: 1em 0;
      font-size: 1rem;
      /* font-family: 'Neon'; */
    }
    &-tools {
      font-size: 15px;
      padding-top: 5px;
      /* font-family: 'Neon'; */
    }
  }

  @media only screen and (max-width: 600px) {
    .card {
      height: 170px;
      min-width: unset;
      /* width: 10vw; */
    }
    .card__description {
      padding: 0px 30px;
    }
  }
`

export default function ProjectCard({ animeLoad, id, name, img, link, description, toolsUsed }) {
  return (
    <div css={cardHeaderIcon} className="animeLoad">
      <div className="card">
        <a key={id} href={link} target="_blank" rel="noopener noreferrer">
          <div className="card-img" style={{ backgroundImage: `url(${img})` }} />

          <svg className="card-icon" viewBox="0 0 28 25">
            <path d="M13.145 2.13l1.94-1.867 12.178 12-12.178 12-1.94-1.867 8.931-8.8H.737V10.93h21.339z" />
          </svg>
        </a>
      </div>

      <div className="card__description">
        <div className="card__description-title">{name}</div>
        <div className="card__description-description">{description}</div>
        <div className="card__description-tools">{toolsUsed}</div>
      </div>
    </div>
  )
}

ProjectCard.propTypes = {
  animeLoad: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  toolsUsed: PropTypes.string.isRequired,
}
