import React from 'react'
import { css } from '@emotion/core'
import RoundButton from '../components/RoundButton'
import Tag from '../components/Tag'
import Play from '../components/svg/play'
import Movie from '../components/svg/movie'

const mainBox = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  flex-direction: row;
  align-items: center;
  align-content: center;
  .card {
    position: relative;
    margin: 4% 0;
    min-width: 340px;
    height: 544px;
    border-radius: var(--radius);
    background-color: var(--white);
    margin: 10px;
    &-img {
      border-radius: var(--radius) var(--radius) 0 0;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      height: 340px;
    }
    &-description {
      padding: 0 30px;
      .tag {
        position: absolute;
        top: 370px;
      }
      .title {
        position: absolute;
        top: 406px;
        font-size: 22px;
        font-family: Montserrat;
        font-style: normal;
        font-weight: bold;
        color: var(--black);
      }
      .author {
        position: absolute;
        top: 484px;
        width: 264px;
        height: 30px;
        display: flex;
        &-image {
          display: inline-block;
          border-radius: 50%;
        }
        &-name {
          padding-left: 6px;
          font-style: normal;
          font-weight: 500;
          font-size: 12px;
          line-height: 15px;
          color: #555555;
          display: flex;
          align-items: center;
        }
      }
    }
  }
`

interface ImageThis {
  src: string
  alt: string
}

interface Author {
  name: string
  image: ImageThis
}

interface Player {
  id: number
  contentType: string[]
  title: string
  author: Author
  image: ImageThis
}

interface CardProps {
  players: Player[]
}

const Cards: React.FC<CardProps> = ({ players }) => (
  <div css={mainBox}>
    {players.map(({ id, contentType, title, author, image }) => (
      <div key={id} className="card">
        <div className="card-img" style={{ backgroundImage: `url(${image.src})` }}>
          {contentType.toString() === 'filter 3' ? <RoundButton buttonType={<Play />} /> : null}

          {contentType.toString() === 'filter 4' ? <RoundButton buttonType={<Movie />} /> : null}
        </div>

        <div className="card-description">
          <div className="tag">
            <Tag contentType={contentType} />
          </div>

          <div className="title">{title}</div>

          <div className="author">
            <img
              className="author-image"
              src={author.image.src}
              alt={author.image.alt}
              height="30"
              width="30"
            />

            <div className="author-name">{author.name}</div>
          </div>
        </div>
      </div>
    ))}
  </div>
)
export default Cards
