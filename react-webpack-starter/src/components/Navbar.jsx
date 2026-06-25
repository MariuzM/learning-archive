import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const activeStyle = { color: '#F15B2A' };

  return (
    <nav className="nav-wrapper red darken-3">
      {/* <ul className="right">
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
      </ul> */}

      <NavLink exact to="/" activeStyle={activeStyle}>
        Home
      </NavLink>
      {' | '}
      <NavLink to="/about" activeStyle={activeStyle}>
        About
      </NavLink>
    </nav>
  );
};

export default Navbar;
