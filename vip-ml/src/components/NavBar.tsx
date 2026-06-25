import React from 'react'
import { NavLink } from 'react-router-dom'
import { Navbar } from 'react-bootstrap'

export default function Navbar2(): JSX.Element {
  return (
    <Navbar bg="dark" expand="lg" sticky="top" className="justify-content-center">
      <Navbar>
        {/* <NavLink to="/" className="nav-link">
          Home Page
        </NavLink> */}

        <NavLink to="/rules" className="nav-link">
          Taisyklės
        </NavLink>

        <NavLink to="/info" className="nav-link">
          Informacija
        </NavLink>
      </Navbar>
    </Navbar>
  )
}
