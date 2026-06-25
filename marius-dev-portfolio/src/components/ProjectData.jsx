import React from 'react'
import PropTypes from 'prop-types'
import { css } from '@emotion/core'
import ProjectCard from './ProjectCard'

const projectList = css`
  padding: 10px 0;
`

export default function ProjectData({ value, animeLoad }) {
  return (
    <div css={projectList}>
      {value.map(({ key, name, img, link, description, toolsUsed }) => {
        return (
          <ProjectCard
            animeLoad={animeLoad}
            key={key}
            id={key}
            name={name}
            img={img}
            link={link}
            description={description}
            toolsUsed={toolsUsed}
          />
        )
      })}
    </div>
  )
}
ProjectData.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.shape({
      keysss: PropTypes.number,
      id: PropTypes.number,
      name: PropTypes.string,
      img: PropTypes.string,
      link: PropTypes.string,
      description: PropTypes.string,
      toolsUsed: PropTypes.string,
    }),
  ).isRequired,
  animeLoad: PropTypes.string,
}

// ProjectData.defaultProps = {
//   animeLoad: '',
// }
