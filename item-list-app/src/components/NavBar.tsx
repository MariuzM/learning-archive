import React from 'react'
import { css } from '@emotion/core'
import NavBarItem from './NavBarItem'

const navBar = css`
  ul {
    overflow: hidden;
    background-color: #333;
  }
  li {
    float: left;
  }
  a {
    display: block;
    color: white;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
    :hover {
      background-color: #111;
    }
  }
  .active {
    background-color: #4caf50;
  }
`

const NavBar: React.FC = (): JSX.Element => {
  return (
    <nav css={navBar}>
      <ul>
        <NavBarItem link="/" value="Home" />
        <NavBarItem link="/products" value="List" />
        <NavBarItem link="/preview/product_details" value="Preview" />
      </ul>
    </nav>
  )
}

export default NavBar
