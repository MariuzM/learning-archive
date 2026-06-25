import React from 'react'
import { Link } from 'react-router-dom'

type NavType = { link: string; value: string }

const NavBarItem: React.FC<NavType> = ({ link, value }): JSX.Element => {
  return (
    <li>
      <Link to={`${link}`}>{value}</Link>
    </li>
  )
}

export default NavBarItem
