import React, { useEffect } from 'react'
import { Element } from 'react-scroll'
// import anime from 'animejs/lib/anime.es'
// import { Waypoint } from 'react-waypoint'
import Title from '../components/Title'
import ProjectData from '../components/ProjectData'
import mariusmphoto from '../img/thumb/mariusmphoto.com.jpg'
import registrationform from '../img/thumb/registration-form.com.jpg'

const projects = [
  {
    key: 1,
    name: 'Marius M Photo',
    description:
      'Showcasing CSS and JavaScript animations, and using Node.js for routing and getting image data into gallery on request.',
    img: mariusmphoto,
    link: 'http://46.101.43.11/projects/mariusmphoto/',
    toolsUsed: 'React | Node.js | JavaScript | SCSS/CSS | HTML5',
  },
  {
    key: 2,
    name: 'Registration Form',
    description:
      'Registration and Sign-up page, using Node.js and SQL to store user data and then fetch it for authentication.',
    img: registrationform,
    link: 'http://46.101.43.11/projects/registration-form/',
    toolsUsed: 'React | Node.js | JavaScript | SCSS/CSS | HTML5',
  },
]

const projectsGitHub = [
  {
    key: 1,
    name: 'Marius M Photo',
    description: 'Marius M Photo',
    img: mariusmphoto,
    link: './projects/mariusmphoto.com/index.html',
    toolsUsed: 'JavaScript | CSS | HTML',
  },
]

export default function Projects() {
  // const start = anime.timeline({
  //   easing: 'easeInOutSine',
  //   autoplay: false,
  //   duration: 400,
  // })

  // useEffect(() => {
  //   start.add({
  //     targets: '.animeLoad',
  //     opacity: [0, 1],
  //     delay: anime.stagger(200),
  //   })
  // }, [start])

  // const wayPoint = () => {
  //   if (!start.began) start.play()
  // }

  return (
    <div>
      <Element name="projects">
        <Title value="Projects" animeLoad="animeLoad" />
        {/* <Waypoint onEnter={wayPoint} /> */}
        <ProjectData value={projects} animeLoad="animeLoad" />
      </Element>

      {/* <Element name="github-projects">
        <Waypoint onEnter={wayPoint} />
        <Title value="GitHub Projects" animeLoad="animeLoad" />
        <ProjectData value={projectsGitHub} animeLoad="animeLoad" />
      </Element> */}
    </div>
  )
}
